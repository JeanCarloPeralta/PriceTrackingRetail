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
                // Find anything related to search, products, or abarrotes
                if (url.includes('search') || url.includes('products') || url.includes('item') || text.includes('price') || text.includes('precio') || text.includes('abarrotes')) {
                    fs.appendFileSync('automercado_search_log.txt', `URL: ${url}\n\nRESPONSE:\n${text.substring(0, 1000)}\n\n`);
                }
            } catch (e) {
                // ignore
            }
        }
    });

    try {
        console.log('Navigating to AutoMercado Home...');
        await page.goto('https://automercado.cr/', { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log('Waiting to load...');
        await new Promise(r => setTimeout(r, 5000));
        
        console.log('Searching for "arroz"...');
        // Let's use the UI to search. I'll just find an input and type 'arroz'.
        const inputs = await page.$$('input');
        if (inputs.length > 0) {
            await inputs[0].type('arroz');
            await inputs[0].press('Enter');
        }

        console.log('Waiting 10s for APIs to settle...');
        await new Promise(r => setTimeout(r, 10000));
        console.log('Done scanning.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
})();
