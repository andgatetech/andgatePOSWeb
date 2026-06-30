import { expect, test } from '@playwright/test';
import { loginAsDemo } from './helpers';

test.describe.serial('POS sale flow', () => {
    test('adds a product to cart and completes a cash sale', async ({ page }) => {
        await loginAsDemo(page);

        await page.goto('/pos');
        await page.waitForSelector('[data-testid="pos-product-grid"]', { timeout: 20000 });

        // Ensure there is at least one product card
        const firstCard = page.locator('[data-testid="pos-product-card"]').first();
        await expect(firstCard).toBeVisible({ timeout: 10000 });

        // Click the first in-stock product card to add to cart
        await firstCard.click();

        // Wait for the cart summary to reflect an item
        await expect(page.locator('text=/1 item/i').first()).toBeVisible({ timeout: 10000 });

        // Select customer if the customer section prompts (default walk-in may already be selected)
        const customerTrigger = page.locator('[data-testid="pos-customer-trigger"]').or(page.locator('text=Walk-in'));
        if (await customerTrigger.isVisible().catch(() => false)) {
            await customerTrigger.click();
            await page.locator('[data-testid="pos-customer-option"]').first().click();
        }

        // Confirm order
        const confirmBtn = page.locator('[data-testid="pos-confirm-order"]');
        await expect(confirmBtn).toBeEnabled({ timeout: 10000 });
        await confirmBtn.click();

        // Wait for success indicator: either a toast, invoice preview, or redirect to orders
        await Promise.race([
            page.waitForURL('/orders', { timeout: 20000 }),
            page.waitForSelector('[data-testid="invoice-preview"]', { timeout: 20000 }),
            page.waitForSelector('.Toastify__toast--success', { timeout: 20000 }),
        ]);

        // Verify we did not land back on login
        expect(page.url()).not.toContain('/login');
    });
});
