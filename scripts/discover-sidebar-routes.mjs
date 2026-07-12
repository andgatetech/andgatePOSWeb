import { chromium } from 'playwright';

const BASE_URL = 'https://andgatepos.com';
const EMAIL = 'user@demo.com';
const PASSWORD = 'user123';

async function discoverRoutes() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(3000);

    const links = await page.evaluate(() => {
        const result = [];
        document.querySelectorAll('a[href^="/"]').forEach((a) => {
            result.push({ text: a.innerText.trim().slice(0, 60), href: a.getAttribute('href') });
        });
        return result;
    });

    // Unique by href
    const unique = [];
    const seen = new Set();
    for (const link of links) {
        if (!seen.has(link.href)) {
            seen.add(link.href);
            unique.push(link);
        }
    }

    console.log('Sidebar/discovered routes:');
    console.table(unique);

    await browser.close();
}

discoverRoutes();
