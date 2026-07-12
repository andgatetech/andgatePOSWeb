import { chromium } from 'playwright';

const BASE_URL = process.env.LIVE_URL || 'https://andgatepos.com';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runSmokeTests() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        locale: 'bn-BD',
        viewport: { width: 1280, height: 720 },
    });

    const results = [];
    const page = await context.newPage();

    page.on('pageerror', (err) => {
        results.push({ type: 'pageerror', message: err.message });
    });

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            results.push({ type: 'console-error', text: msg.text() });
        }
    });

    const checks = [
        { path: '/', expectStatus: 200 },
        { path: '/about', expectStatus: 200 },
        { path: '/demo', expectStatus: 200 },
        { path: '/training', expectStatus: 200 },
        { path: '/login', expectStatus: 200 },
        { path: '/register', expectStatus: 200 },
        { path: '/forgot-password', expectStatus: 200 },
        { path: '/unauthorized', expectStatus: 200 },
        { path: '/dashboard', expectStatus: 200, expectedRedirect: '/login' },
        { path: '/pos', expectStatus: 200, expectedRedirect: '/login' },
    ];

    for (const check of checks) {
        try {
            const response = await page.goto(`${BASE_URL}${check.path}`, { waitUntil: 'networkidle', timeout: 30000 });
            const finalUrl = page.url();
            const status = response?.status() || 0;
            const title = await page.title().catch(() => '');

            const passed = check.expectedRedirect
                ? finalUrl.includes(check.expectedRedirect)
                : status === check.expectStatus && status >= 200 && status < 400;

            results.push({
                path: check.path,
                status,
                finalUrl,
                title,
                passed,
                expectRedirect: check.expectedRedirect || null,
            });
        } catch (err) {
            results.push({ path: check.path, error: err.message, passed: false });
        }
        await sleep(500);
    }

    await browser.close();

    const failures = results.filter((r) => r.passed === false || r.type);
    console.log('\n=== Live Smoke Test Results ===');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Total checks: ${checks.length}`);
    console.log(`Passed route checks: ${results.filter((r) => r.passed === true).length}`);
    if (failures.length) {
        console.log(`\nFailures / warnings (${failures.length}):`);
        console.table(failures);
        process.exit(1);
    } else {
        console.log('All checks passed.');
    }
}

runSmokeTests();
