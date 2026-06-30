import { expect, test } from '@playwright/test';
import { API_BASE_URL, createProductViaApi, deleteProductViaApi, DEMO_EMAIL, DEMO_PASSWORD, getApiContext, loginAsDemo } from './helpers';

const testSku = () => `E2E-SKU-${Date.now()}`;

test.describe.serial('Product CRUD smoke', () => {
    let productId: number | null = null;

    test('creates a product via API and surfaces it in the UI', async ({ page, request }) => {
        await loginAsDemo(page);

        const sku = testSku();
        const payload = {
            product_name: `E2E Product ${sku}`,
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

        // Navigate to product list and verify the new product appears
        await page.goto('/products');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=/E2E Product/i').first()).toBeVisible({ timeout: 15000 });
        await expect(page.locator(`text=${sku}`).first()).toBeVisible({ timeout: 5000 });
    });

    test('opens the product edit page', async ({ page }) => {
        test.skip(!productId, 'Skipping because product creation failed');
        await loginAsDemo(page);

        await page.goto(`/products/edit/${productId}`);
        await page.waitForLoadState('networkidle');

        // Edit page should render and prefill the product name
        await expect(page.locator('input[name="product_name"], input[id*="product_name"]').first()).toBeVisible({ timeout: 15000 });
    });

    test('deletes the product via API and confirms it disappears from the UI', async ({ page, request }) => {
        test.skip(!productId, 'Skipping because product creation failed');
        await loginAsDemo(page);

        await deleteProductViaApi(request, productId!);

        await page.goto('/products');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=/E2E Product/i').first()).not.toBeVisible();
    });
});
