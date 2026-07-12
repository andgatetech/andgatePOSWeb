import { chromium } from 'playwright';

const BASE_URL = 'https://andgatepos.com';

async function getDemoCredentials() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });

    // Look for demo credential buttons/text
    const content = await page.content();
    const text = await page.evaluate(() => document.body.innerText);

    console.log('=== Page text (first 3000 chars) ===');
    console.log(text.slice(0, 3000));

    console.log('\n=== Looking for demo credentials ===');
    // Find buttons or text containing demo credentials
    const demoElements = await page.$$('[data-no-localize-digits], [translate="no"], button');
    for (const el of demoElements.slice(0, 20)) {
        const txt = await el.textContent();
        if (txt && (txt.toLowerCase().includes('demo') || txt.includes('@'))) {
            console.log(txt.trim());
        }
    }

    await browser.close();
}

getDemoCredentials();
