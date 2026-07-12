import { chromium } from 'playwright';

const BASE_URL = process.env.LIVE_URL || 'https://andgatepos.com';
const EMAIL = process.env.DEMO_EMAIL || 'user@demo.com';
const PASSWORD = process.env.DEMO_PASSWORD || 'user123';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class ModuleTester {
    constructor(page) {
        this.page = page;
        this.results = [];
    }

    async testModule(name, path, options = {}) {
        const { waitUntil = 'networkidle', timeout = 30000, assertions = [] } = options;
        const result = { module: name, path, passed: false, errors: [], notes: [], status: null, finalUrl: null };
        try {
            const response = await this.page.goto(`${BASE_URL}${path}`, { waitUntil, timeout });
            const finalUrl = this.page.url();
            const status = response?.status() || 0;
            result.status = status;
            result.finalUrl = finalUrl;
            await sleep(1000);

            if (finalUrl.includes('/login') && !path.includes('/login')) {
                result.notes.push('Redirected to login (permission denied or session lost)');
            }

            for (const assertion of assertions) {
                try {
                    const ok = await assertion(this.page, result);
                    if (ok === false) {
                        result.errors.push(`Assertion failed: ${assertion.name || 'unnamed'}`);
                    }
                } catch (err) {
                    result.errors.push(`Assertion error: ${err.message}`);
                }
            }

            result.passed = result.errors.length === 0 && result.status >= 200 && result.status < 400;
        } catch (err) {
            result.errors.push(`Navigation error: ${err.message}`);
        }
        this.results.push(result);
        return result;
    }
}

async function runModuleTests() {
    console.log(`\n🔍 Starting full module UI/UX smoke test against ${BASE_URL}\n`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        locale: 'bn-BD',
    });

    const page = await context.newPage();
    const tester = new ModuleTester(page);

    const globalErrors = [];
    page.on('pageerror', (err) => globalErrors.push({ type: 'pageerror', message: err.message }));
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            globalErrors.push({ type: 'console-error', text: msg.text() });
        }
    });

    // ── LOGIN ──
    console.log('→ Logging in...');
    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.fill('input[type="email"]', EMAIL);
        await page.fill('input[type="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard|\/business-os|\/pos/, { timeout: 15000 });
        console.log('✅ Login successful\n');
    } catch (err) {
        console.error('❌ Login failed:', err.message);
        await browser.close();
        process.exit(1);
    }

    await page.waitForSelector('body', { timeout: 10000 });
    await sleep(2000);

    // ── MODULE TESTS ──
    await tester.testModule('Dashboard', '/dashboard', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return true;
            },
        ],
    });

    await tester.testModule('Business OS', '/business-os', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('POS Terminal', '/pos', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('input').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Orders List', '/orders', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                await p.waitForSelector('table, [role="table"], .panel, .no-data', { timeout: 15000 }).catch(() => null);
                return true;
            },
        ],
    });

    await tester.testModule('Order Returns', '/orders/return/list', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                await p.waitForSelector('table, [role="table"], .panel, .no-data', { timeout: 15000 }).catch(() => null);
                return true;
            },
        ],
    });

    await tester.testModule('Products List', '/products', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                await p.waitForSelector('table, [role="table"], .panel, .no-data', { timeout: 15000 }).catch(() => null);
                return true;
            },
        ],
    });

    await tester.testModule('Categories', '/category', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Brands', '/brand', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Customers', '/customers/list', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('table, [role="table"], .panel').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Suppliers', '/suppliers/list', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('table, [role="table"], .panel').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Purchases List', '/purchases/list', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                await p.waitForSelector('table, [role="table"], .panel, .no-data', { timeout: 15000 }).catch(() => null);
                return true;
            },
        ],
    });

    await tester.testModule('Stock Adjustments', '/products/stock/adjustments', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Stock Transfers', '/stock-transfers', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Sales Report', '/reports/sales', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('canvas, table, [role="table"], .panel').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Purchase Report', '/reports/purchase', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('canvas, table, [role="table"], .panel').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Inventory Report', '/reports/stock', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('canvas, table, [role="table"], .panel').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Low Stock Report', '/reports/low-stock', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Coupons', '/coupons', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Expenses List', '/expenses/expense-list', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Ecommerce Stores', '/ecommerce/stores', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Notifications', '/notifications', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Accounting Chart of Accounts', '/accounting/chart-of-accounts', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('table, [role="table"], .panel').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Cash Book', '/accounting/cash-book', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Profit & Loss', '/accounting/profit-loss', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('HR Attendance', '/hr/attendance', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('Employees', '/employees', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return await p.$('table, [role="table"], .panel').catch(() => null) !== null;
            },
        ],
    });

    await tester.testModule('Store Settings', '/store/setting', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    await tester.testModule('User Profile', '/users/profile', {
        assertions: [
            async (p, r) => {
                r.notes.push(`title: ${await p.title()}`);
                return (await p.content()).length > 500;
            },
        ],
    });

    // ── LOGOUT ──
    console.log('\n→ Logging out...');
    try {
        await context.clearCookies();
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
        console.log('✅ Logout cleanup done\n');
    } catch (err) {
        console.error('❌ Logout cleanup failed:', err.message);
    }

    await browser.close();

    // ── REPORT ──
    console.log('══════════════════════════════════════════════════════════');
    console.log('              MODULE UI/UX SMOKE TEST REPORT              ');
    console.log(`              Target: ${BASE_URL}              `);
    console.log('══════════════════════════════════════════════════════════');

    let passed = 0;
    let failed = 0;
    let permissionDenied = 0;

    for (const r of tester.results) {
        const isPermissionDenied = r.finalUrl?.includes('/login') && !r.path?.includes('/login');
        if (isPermissionDenied) permissionDenied++;

        const status = r.passed && !isPermissionDenied ? '✅ PASS' : isPermissionDenied ? '🔒 NO ACCESS' : '❌ FAIL';
        console.log(`\n${status} | ${r.module}`);
        console.log(`   Path: ${r.path}`);
        console.log(`   Status: ${r.status ?? 'N/A'} | Final URL: ${r.finalUrl ?? 'N/A'}`);
        if (r.notes?.length) console.log(`   Notes: ${r.notes.join(' | ')}`);
        if (r.errors?.length) {
            console.log(`   Errors:`);
            r.errors.forEach((e) => console.log(`      - ${e}`));
        }
        if (r.passed && !isPermissionDenied) passed++;
        else failed++;
    }

    if (globalErrors.length) {
        console.log(`\n⚠️  Global JS / console errors during run: ${globalErrors.length}`);
        globalErrors.slice(0, 12).forEach((e) => console.log(`   - [${e.type}] ${e.message || e.text}`));
    }

    console.log('\n──────────────────────────────────────────────────────────');
    console.log(`Total modules tested: ${tester.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Permission denied / login redirect: ${permissionDenied}`);
    console.log(`Failed (errors/timeouts): ${Math.max(0, failed - permissionDenied)}`);
    console.log('──────────────────────────────────────────────────────────\n');

    process.exit(failed > 0 ? 1 : 0);
}

runModuleTests();
