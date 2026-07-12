import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000';
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'user@demo.com';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'user123';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT_DIR = process.env.SCREENSHOT_OUT_DIR || path.join(process.cwd(), 'screenshots', 'demo', timestamp);
const LANG = process.env.SCREENSHOT_LANG || '';
const VIEWPORTS = {
    desktop: { width: 1440, height: 1100, isMobile: false },
    mobile: { width: 390, height: 844, isMobile: true },
};

const DEFAULT_ROUTES = [
    ['dashboard', 'Dashboard', '/dashboard'],
    ['business-os', 'Business OS', '/business-os'],
    ['analytics', 'Branch Benchmarking', '/analytics/branch-benchmarking'],
    ['analytics', 'Cash Flow Forecast', '/analytics/cash-flow-forecast'],
    ['analytics', 'Custom Reports', '/analytics/custom-reports'],
    ['analytics', 'Dashboard Widgets', '/analytics/dashboard-widgets'],
    ['analytics', 'Sales TV', '/analytics/sales-tv'],
    ['analytics', 'Scheduled Reports', '/analytics/scheduled-reports'],
    ['store', 'Add Store', '/store/create'],
    ['store', 'Store List', '/store'],
    ['store', 'Store Settings', '/store/setting'],
    ['category', 'Add Category', '/category/create'],
    ['category', 'Category List', '/category'],
    ['brand', 'Add Brand', '/brand/create'],
    ['brand', 'Brand List', '/brand'],
    ['product', 'Add Product', '/products/create'],
    ['product', 'Product List', '/products'],
    ['product', 'Stock Adjustment', '/products/stock/adjustments'],
    ['product', 'Stock Counts', '/stock-counts'],
    ['product', 'Stock Transfers', '/stock-transfers'],
    ['product', 'Bulk Upload', '/products/bulk'],
    ['product', 'Stock Thresholds', '/products/thresholds'],
    ['product', 'Print Label', '/label'],
    ['pos', 'POS Terminal', '/pos'],
    ['orders', 'Order List', '/orders'],
    ['orders', 'Order Returns List', '/orders/return/list'],
    ['purchase', 'Add Purchase', '/purchases/create'],
    ['purchase', 'Purchase List', '/purchases/list'],
    ['supplier', 'Add Supplier', '/suppliers/create'],
    ['supplier', 'Supplier List', '/suppliers/list'],
    ['supplier', 'Supplier Due', '/suppliers/due'],
    ['accounting', 'Cash Book', '/accounting/cash-book'],
    ['accounting', 'Income', '/accounting/income'],
    ['accounting', 'Journal Ledger', '/accounting/journals'],
    ['accounting', 'Profit And Loss', '/accounting/profit-loss'],
    ['accounting', 'Balance Sheet', '/accounting/balance-sheet'],
    ['accounting', 'Trial Balance', '/accounting/trial-balance'],
    ['accounting', 'Chart Of Accounts', '/accounting/chart-of-accounts'],
    ['expenses', 'Add Expense', '/expenses/create'],
    ['expenses', 'Expense List', '/expenses/expense-list'],
    ['customer', 'Add Customer', '/customers/create'],
    ['customer', 'Customer List', '/customers/list'],
    ['customer', 'Customer Due', '/customers/due'],
    ['reports-sales', 'Sales Report', '/reports/sales'],
    ['reports-sales', 'Order Returns Report', '/reports/order-returns'],
    ['reports-sales', 'Transactions Report', '/reports/transaction'],
    ['reports-sales', 'Invoices Report', '/reports/invoice'],
    ['reports-sales', 'Sales Items Report', '/reports/sales-items'],
    ['reports-business', 'Business Overview Report', '/reports/business-overview'],
    ['reports-customer', 'Customer Report', '/reports/customer'],
    ['reports-customer', 'Customer Due Report', '/reports/customer-due'],
    ['reports-customer', 'Customer Statement', '/reports/customer-statement'],
    ['reports-purchase', 'Purchase Report', '/reports/purchase'],
    ['reports-purchase', 'Purchase Items Report', '/reports/purchase-items'],
    ['reports-purchase', 'Purchase Transactions Report', '/reports/purchase-transaction'],
    ['reports-purchase', 'Supplier Report', '/reports/supplier'],
    ['reports-purchase', 'Supplier Due Report', '/reports/supplier-due'],
    ['reports-purchase', 'Supplier Statement', '/reports/supplier-statement'],
    ['reports-inventory', 'Stock Report', '/reports/stock'],
    ['reports-inventory', 'Stock Movement', '/reports/stock-movement'],
    ['reports-inventory', 'Transfer Ledger', '/reports/transfer-ledger'],
    ['reports-inventory', 'Low Stock Report', '/reports/low-stock'],
    ['reports-inventory', 'Threshold Intelligence', '/reports/threshold-intelligence'],
    ['reports-inventory', 'Idle Products Report', '/reports/idle-product'],
    ['reports-inventory', 'Adjustments Report', '/reports/adjustment'],
    ['reports-inventory', 'Product Report', '/reports/product'],
    ['reports-finance', 'Profit And Loss Report', '/reports/profit-loss'],
    ['reports-finance', 'Expense Report', '/reports/expense'],
    ['reports-finance', 'Tax Report', '/reports/tax'],
    ['reports-finance', 'Payment Summary', '/reports/payment-summary'],
    ['reports-finance', 'Fiscal Compliance', '/fiscal-compliance'],
    ['reports-ai', 'Reorder Suggestions', '/reports/reorder-suggestions'],
    ['reports-ai', 'Anomaly Detection', '/reports/anomalies'],
    ['reports-ai', 'Demand Forecast', '/reports/demand-forecast'],
    ['reports-ai', 'Smart Summary', '/reports/smart-summary'],
    ['notifications', 'Notifications', '/notifications'],
    ['ecommerce', 'Store Ecommerce Status', '/ecommerce/stores'],
    ['ecommerce', 'Ecommerce Orders', '/ecommerce/orders'],
    ['ecommerce', 'Ecommerce Products', '/ecommerce/products'],
    ['ecommerce', 'COD Reconciliation', '/ecommerce/cod-reconciliation'],
    ['feedback', 'Give Feedback', '/feedbacks/create-feedback'],
    ['feedback', 'View Feedback', '/feedbacks'],
    ['administration', 'Employees Management', '/employees'],
    ['administration', 'Roles', '/roles'],
    ['administration', 'Audit Logs', '/audit-logs'],
    ['administration', 'Compliance Calendar', '/compliance-calendar'],
    ['administration', 'Company', '/company'],
    ['administration', 'Data Export', '/data-export'],
];

const slugify = (value) =>
    String(value || 'page')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'page';

const routeGroupFromPath = (routePath) => {
    const clean = routePath.replace(/^\/+/, '');
    if (!clean) return 'home';
    const parts = clean.split('/');
    if (parts[0] === 'reports') return `reports-${parts[1] || 'main'}`;
    if (parts[0] === 'products') return 'product';
    if (parts[0] === 'purchases') return 'purchase';
    if (parts[0] === 'customers') return 'customer';
    if (parts[0] === 'suppliers') return 'supplier';
    if (parts[0] === 'orders') return 'orders';
    return slugify(parts[0]);
};

const routeNameFromPath = (routePath) => {
    const clean = routePath.replace(/^\/+/, '').replace(/\/+$/g, '');
    return clean ? clean.split('/').join('-') : 'home';
};

const normalizeRoute = ({ group, name, routePath }) => ({
    group: slugify(group || routeGroupFromPath(routePath)),
    name: name || routeNameFromPath(routePath),
    path: routePath.startsWith('/') ? routePath : `/${routePath}`,
});

const getRoutesFromEnv = () => {
    if (!process.env.SCREENSHOT_ROUTES) return [];
    return process.env.SCREENSHOT_ROUTES.split(',')
        .map((routePath) => routePath.trim())
        .filter(Boolean)
        .map((routePath) => normalizeRoute({ routePath }));
};

const getDefaultRoutes = () =>
    DEFAULT_ROUTES.map(([group, name, routePath]) => normalizeRoute({ group, name, routePath }));

const collectSidebarRoutes = async (page) => {
    const routes = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('nav.sidebar a[href], aside a[href]'));
        return anchors
            .map((anchor) => {
                const href = anchor.getAttribute('href') || '';
                const text = anchor.textContent?.replace(/\s+/g, ' ').trim() || '';
                return { href, text };
            })
            .filter((item) => item.href.startsWith('/') && !item.href.includes('#'));
    });

    const seen = new Set();
    return routes
        .map(({ href, text }) => normalizeRoute({ name: text || routeNameFromPath(href), routePath: href }))
        .filter((route) => {
            if (seen.has(route.path)) return false;
            seen.add(route.path);
            return true;
        });
};

const waitForAppReady = async (page) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(900);
};

const login = async (page) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    if (LANG) {
        await page.context().addCookies([
            {
                name: 'i18nextLng',
                value: LANG,
                url: BASE_URL,
            },
        ]);
        await page.reload({ waitUntil: 'domcontentloaded' });
    }
    await page.fill('#Email', DEMO_EMAIL);
    await page.fill('#Password', DEMO_PASSWORD);
    await Promise.all([
        page.waitForURL(/\/dashboard|\/subscription|\/store/, { timeout: 45_000 }).catch(() => undefined),
        page.locator('form button[type="submit"]').click(),
    ]);
    await waitForAppReady(page);

    if (page.url().includes('/login')) {
        throw new Error('Login failed. Check DEMO_EMAIL, DEMO_PASSWORD, backend, and demo account status.');
    }
};

const captureRoute = async (page, route, viewportName, report) => {
    const url = `${BASE_URL}${route.path}`;
    const fileName = `${slugify(route.name)}__${route.path.replace(/^\/+/, '').replace(/\//g, '__') || 'home'}.png`;
    const outputPath = path.join(OUT_DIR, viewportName, route.group, fileName);

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await waitForAppReady(page);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await page.screenshot({ path: outputPath, fullPage: true });
        report.pages.push({ status: 'ok', viewport: viewportName, group: route.group, name: route.name, path: route.path, file: outputPath });
        console.log(`OK   ${viewportName} ${route.path}`);
    } catch (error) {
        report.pages.push({ status: 'failed', viewport: viewportName, group: route.group, name: route.name, path: route.path, error: error.message });
        console.log(`FAIL ${viewportName} ${route.path} :: ${error.message}`);
    }
};

const main = async () => {
    let chromium;
    try {
        ({ chromium } = await import('playwright'));
    } catch {
        console.error('Playwright missing. Run: npm i -D playwright && npx playwright install chromium');
        process.exit(1);
    }

    await fs.mkdir(OUT_DIR, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const report = {
        baseUrl: BASE_URL,
        outDir: OUT_DIR,
        startedAt: new Date().toISOString(),
        lang: LANG || 'app-default',
        pages: [],
    };

    const envRoutes = getRoutesFromEnv();
    let routes = envRoutes.length ? envRoutes : getDefaultRoutes();

    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            isMobile: viewport.isMobile,
            deviceScaleFactor: viewport.isMobile ? 2 : 1,
        });
        const page = await context.newPage();

        await login(page);

        if (!envRoutes.length && viewportName === 'desktop') {
            const sidebarRoutes = await collectSidebarRoutes(page);
            if (sidebarRoutes.length) routes = sidebarRoutes;
        }

        for (const route of routes) {
            await captureRoute(page, route, viewportName, report);
        }

        await context.close();
    }

    report.finishedAt = new Date().toISOString();
    report.total = report.pages.length;
    report.failed = report.pages.filter((page) => page.status === 'failed').length;
    await fs.writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(report, null, 2));
    await browser.close();

    console.log(`\nDone. Screenshots saved: ${OUT_DIR}`);
    console.log(`Failed: ${report.failed}/${report.total}`);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
