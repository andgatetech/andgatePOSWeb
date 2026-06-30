import { APIRequestContext, Page } from '@playwright/test';

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000';
export const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';
export const DEMO_EMAIL = process.env.PLAYWRIGHT_DEMO_EMAIL || process.env.DEMO_EMAIL || 'user@demo.com';
export const DEMO_PASSWORD = process.env.PLAYWRIGHT_DEMO_PASSWORD || process.env.DEMO_PASSWORD || 'user123';

export async function loginAsDemo(page: Page): Promise<void> {
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', DEMO_EMAIL);
    await page.fill('input[type="password"]', DEMO_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|business-os)/, { timeout: 20000 });
}

export async function getApiContext(request: APIRequestContext): Promise<{ token: string; storeId: number }> {
    const loginResp = await request.post(`${API_BASE_URL}/api/v1/login`, {
        data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
        headers: { Accept: 'application/json' },
    });
    if (!loginResp.ok()) {
        throw new Error(`API login failed: ${loginResp.status()} ${await loginResp.text()}`);
    }
    const loginJson = await loginResp.json();
    const token = loginJson.data?.token || loginJson.token;
    const user = loginJson.data?.user || loginJson.user;
    const storeId = user?.stores?.[0]?.id || user?.current_store_id;
    if (!token || !storeId) {
        throw new Error('API login response did not return token/store');
    }
    return { token, storeId };
}

export async function createProductViaApi(request: APIRequestContext, payload: Record<string, unknown>): Promise<number> {
    const { token } = await getApiContext(request);
    // Product store endpoint expects multipart/form-data
    const multipart: Record<string, string> = {};
    Object.entries(payload).forEach(([key, value]) => {
        multipart[key] = value === null || value === undefined ? '' : String(value);
    });
    const resp = await request.post(`${API_BASE_URL}/api/v1/products`, {
        multipart,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (!resp.ok()) {
        throw new Error(`Create product failed: ${resp.status()} ${await resp.text()}`);
    }
    const json = await resp.json();
    return json.data?.id || json.data?.product?.id || json.id;
}

export async function deleteProductViaApi(request: APIRequestContext, productId: number): Promise<void> {
    const { token } = await getApiContext(request);
    const resp = await request.delete(`${API_BASE_URL}/api/v1/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok()) {
        throw new Error(`Delete product failed: ${resp.status()} ${await resp.text()}`);
    }
}
