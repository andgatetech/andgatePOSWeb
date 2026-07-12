#!/usr/bin/env node
// One-off inspector: crawls each unique lesson path and dumps a structured DOM
// summary (headings, tabs, form fields, buttons, table headers) so accurate
// LESSON_STORYBOARDS entries can be hand-authored from real selectors/text
// instead of keyword guesses. Not part of the video generation pipeline.
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.VIDEO_BASE_URL || 'https://andgatepos.com';
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'user@demo.com';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'user123';
const OUT_DIR = process.env.INSPECT_OUT_DIR || path.join(process.cwd(), 'lesson-dom-reports');
const MAX_TABS = 10;

const byPath = JSON.parse(await fs.readFile(process.argv[2] || '/tmp/missing-by-path.json', 'utf8'));

const waitReady = async (page) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(700);
};

const dumpPage = async (page) => page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const inContent = (el) => !el.closest('nav, header, footer, #popper-portal, #modal-portal, .sidebar');

    const container = document.querySelector('.main-content') || document.body;
    const q = (sel) => [...container.querySelectorAll(sel)].filter(inContent);

    const headings = q('h1, h2, h3, h4')
        .filter(visible)
        .map(text)
        .filter(Boolean)
        .slice(0, 20);

    const tabs = q('[role="tab"], .nav-tabs button, .nav-tabs a, [class*="tab" i] button')
        .filter(visible)
        .map(text)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);

    const labelFor = (input) => {
        if (input.id) {
            const lbl = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
            if (lbl) return text(lbl);
        }
        const wrapLabel = input.closest('label');
        if (wrapLabel) return text(wrapLabel);
        const parent = input.closest('div, td, li');
        const prevLabel = parent?.querySelector('label');
        if (prevLabel) return text(prevLabel);
        return '';
    };

    const fields = q('input, select, textarea')
        .filter(visible)
        .filter((el) => el.type !== 'hidden')
        .map((el) => ({
            tag: el.tagName.toLowerCase(),
            type: el.type || '',
            name: el.name || '',
            id: el.id || '',
            placeholder: el.placeholder || '',
            label: labelFor(el),
        }))
        .slice(0, 60);

    const buttons = q('button, a[role="button"], [type="submit"]')
        .filter(visible)
        .map(text)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 50);

    const tableHeaders = q('table').map((tbl) =>
        [...tbl.querySelectorAll('th')].map(text).filter(Boolean)
    ).filter((h) => h.length);

    const bengaliChunks = q('*')
        .filter((el) => el.children.length === 0)
        .filter(visible)
        .map(text)
        .filter((t) => /[ঀ-৿]/.test(t))
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 100);

    return { title: document.title, url: location.href, headings, tabs, fields, buttons, tableHeaders, bengaliChunks };
});

const main = async () => {
    let chromium;
    try {
        ({ chromium } = await import('playwright'));
    } catch {
        throw new Error('Playwright missing. Run: npm i -D playwright && npx playwright install chromium');
    }

    await fs.mkdir(OUT_DIR, { recursive: true });
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.context().addCookies([{ name: 'i18nextLng', value: 'bn', url: BASE_URL }]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.fill('#Email', DEMO_EMAIL);
    await page.fill('#Password', DEMO_PASSWORD);
    await Promise.all([
        page.waitForURL(/\/dashboard|\/subscription|\/store/, { timeout: 45_000 }).catch(() => undefined),
        page.locator('form button[type="submit"]').click(),
    ]);
    await waitReady(page);

    if (page.url().includes('/login')) {
        await page.screenshot({ path: path.join(OUT_DIR, 'login-failed.png'), fullPage: true }).catch(() => undefined);
        throw new Error(`Login failed at ${page.url()}. Check DEMO_EMAIL/DEMO_PASSWORD/BASE_URL.`);
    }

    const results = {};
    const paths = Object.keys(byPath);
    for (const [index, routePath] of paths.entries()) {
        console.log(`[${index + 1}/${paths.length}] ${routePath}  (${byPath[routePath].join(', ')})`);
        try {
            await page.goto(`${BASE_URL}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            await waitReady(page);

            const base = await dumpPage(page);
            const tabDumps = {};

            if (base.tabs.length > 1) {
                for (const tabLabel of base.tabs.slice(0, MAX_TABS)) {
                    try {
                        const locator = page.locator('[role="tab"], .nav-tabs button, .nav-tabs a, [class*="tab" i] button')
                            .filter({ hasText: tabLabel }).first();
                        await locator.click({ timeout: 5000 });
                        await page.waitForTimeout(500);
                        tabDumps[tabLabel] = await dumpPage(page);
                    } catch (err) {
                        tabDumps[tabLabel] = { error: String(err?.message || err) };
                    }
                }
            }

            results[routePath] = { lessons: byPath[routePath], base, tabs: tabDumps };
        } catch (err) {
            results[routePath] = { lessons: byPath[routePath], error: String(err?.message || err) };
        }
    }

    await fs.writeFile(path.join(OUT_DIR, 'all-pages.json'), JSON.stringify(results, null, 2));
    await browser.close();
    console.log(`\nDone. Report: ${path.join(OUT_DIR, 'all-pages.json')}`);
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
