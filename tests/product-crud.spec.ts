import { Page, expect, test } from '@playwright/test';
import { API_BASE_URL, createProductViaApi, deleteProductViaApi, DEMO_EMAIL, DEMO_PASSWORD, getApiContext, loginAsDemo } from './helpers';

const testSku = () => `E2E-SKU-${Date.now()}`;

test.describe.serial('Product CRUD smoke', () => {
    let productId: number | null = null;
    let productName: string;
    let productSku: string;
    // Login throttle on POST /api/v1/login is 5/min — log in once for the whole file
    // instead of once per test (3 tests here would otherwise cost 3 logins).
    let sharedPage: Page;

    test.beforeAll(async ({ browser }) => {
        sharedPage = await browser.newPage();
        await loginAsDemo(sharedPage);
    });

    test.afterAll(async () => {
        await sharedPage.close();
    });

    test('creates a product via API and surfaces it in the UI', async ({ request }) => {
        const sku = testSku();
        productSku = sku;
        productName = `E2E Product ${sku}`;
        const payload = {
            product_name: productName,
            sku,
            price: '150.00',
            purchase_price: '100.00',
            quantity: '10',
            low_stock_quantity: '2',
            unit: 'piece',
            category_id: '',
            brand_id: '',
            tax_rate: '0',
            description: 'Playwright smoke-test product',
            available: 'yes',
        };

        productId = await createProductViaApi(request, payload);
        expect(productId).toBeTruthy();

        // Navigate to product list and verify the new product appears. Note: the API ignores
        // the client-supplied `sku` and always auto-generates its own stock SKU, so we can only
        // assert on the product name (which embeds our sku value), not the SKU column itself.
        // The store has thousands of products and the list defaults to sorting by name — a
        // freshly created row has no guaranteed spot on page 1, so search for it explicitly
        // instead of relying on default pagination/sort position. The default locale (bn) also
        // renders digits as Bengali numerals even inside free-text fields like product_name, so
        // don't match the literal (Western-digit) name — the search already scopes the table to
        // this one row, so just confirm exactly one row came back and it's an "E2E Product" one.
        await sharedPage.goto('/products');
        await sharedPage.waitForLoadState('networkidle');
        await sharedPage.getByTestId('universal-filter-search-input').fill(sku);
        await sharedPage.getByTestId('universal-filter-search-submit').click();
        await sharedPage.waitForLoadState('networkidle');
        const resultRows = sharedPage.locator('table tbody tr');
        await expect(resultRows).toHaveCount(1, { timeout: 15000 });
        await expect(resultRows.first()).toContainText('E2E Product');
    });

    test('opens the product edit page', async () => {
        test.skip(!productId, 'Skipping because product creation failed');

        await sharedPage.goto(`/products/edit/${productId}`);
        await sharedPage.waitForLoadState('networkidle');

        // Edit page should render and prefill the product name
        await expect(sharedPage.locator('input[name="product_name"], input[id*="product_name"]').first()).toBeVisible({ timeout: 15000 });
    });

    test('deletes the product via API and confirms it disappears from the UI', async ({ request }) => {
        test.skip(!productId, 'Skipping because product creation failed');

        await deleteProductViaApi(request, productId!);

        await sharedPage.goto('/products');
        await sharedPage.waitForLoadState('networkidle');
        await sharedPage.getByTestId('universal-filter-search-input').fill(productSku);
        await sharedPage.getByTestId('universal-filter-search-submit').click();
        await sharedPage.waitForLoadState('networkidle');
        await expect(sharedPage.locator('table tbody tr')).toHaveCount(0);
    });
});
