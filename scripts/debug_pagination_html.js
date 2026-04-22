import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const url = "https://www.walmart.co.cr/abarrotes";

async function run() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 2000));

    const debugInfo = await page.evaluate(() => {
        const container = document.querySelector('.vtex-search-result-3-x-buttonShowMore');
        if (!container) return { found: false };
        
        const btn = container.querySelector('button');
        const clickTarget = btn || container;
        const rect = clickTarget.getBoundingClientRect();
        
        return {
            found: true,
            outerHTML: container.outerHTML,
            btnHTML: btn ? btn.outerHTML : 'No <button> tag found',
            isButton: !!btn,
            rect: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                bottom: rect.bottom
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    });
    
    console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));
    await browser.close();
}

run().catch(console.error);
