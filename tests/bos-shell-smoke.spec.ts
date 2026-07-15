import { expect, test } from '@playwright/test';
import { loginAsDemo } from './helpers';

test.describe.serial('BOS shell smoke', () => {
    test('redirects expired persisted sessions to login', async ({ page }) => {
        await page.goto('/login');
        await page.evaluate(() => {
            localStorage.setItem('persist:root', JSON.stringify({
                auth: JSON.stringify({
                    user: { id: 1, name: 'Expired', role: 'business_admin', status: 'active', stores: [], permissions: [] },
                    token: 'expired-token',
                    tokenExpiresAt: '2000-01-01T00:00:00Z',
                    isAuthenticated: true,
                    currentStore: null,
                    currentStoreId: null,
                }),
                _persist: JSON.stringify({ version: -1, rehydrated: true }),
            }));
            localStorage.setItem('andgatepos_auth_token', 'expired-token');
            localStorage.setItem('token_expires_at', '2000-01-01T00:00:00Z');
        });

        await page.goto('/dashboard', { waitUntil: 'commit' }).catch(() => {
            // Immediate middleware/client redirect can abort original navigation.
        });
        await page.waitForURL(/\/login/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/login/);
    });

    test('dashboard shell, leftnav, onboarding, and PWA manifest load', async ({ page }) => {
        await loginAsDemo(page);

        await page.goto('/dashboard');
        await expect(page.locator('nav.sidebar')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('img[alt="AndgateBOS"]').first()).toBeVisible();

        const collapseButton = page.locator('nav.sidebar button[aria-label="Collapse sidebar"]').first();
        await expect(collapseButton).toBeVisible();
        await collapseButton.click();
        await expect(page.locator('nav.sidebar')).toBeAttached();

        await page.goto('/onboarding');
        await expect(page.locator('body')).toContainText(/AndgateBOS|অনবোর্ডিং|দোকান/i);

        const manifestResponse = await page.request.get('/manifest.webmanifest');
        expect(manifestResponse.ok()).toBeTruthy();
        const manifest = await manifestResponse.json();
        expect(manifest.name).toBe('AndgateBOS');
        expect(manifest.display).toBe('standalone');
        expect(manifest.start_url).toBe('/dashboard');

        const swResponse = await page.request.get('/sw.js');
        expect(swResponse.ok()).toBeTruthy();
    });
});
