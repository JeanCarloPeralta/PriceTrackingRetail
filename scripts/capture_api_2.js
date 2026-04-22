import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Intercept responses to find the JSON API
    page.on('response', async (response) => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
            try {
                const text = await response.text();
                if (text.length > 500) { // Likely contains interesting data if it's large
                    console.log(`\n\n=== FOUND JSON API: ${url} ===`);
                    fs.appendFileSync('automercado_api_log2.txt', `URL: ${url}\n\nRESPONSE:\n${text.substring(0, 1000)}\n\n`);
                }
            } catch (e) {
                // ignore
            }
        }
    });

    try {
        console.log('Navigating to Abarrotes...');
        await page.goto('https://automercado.cr/categorias/abarrotes', { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('Scrolling down to trigger lazy loading...');
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        console.log('Waiting 10s for APIs to settle...');
        await new Promise(r => setTimeout(r, 10000));
        console.log('Done scanning.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
})();
