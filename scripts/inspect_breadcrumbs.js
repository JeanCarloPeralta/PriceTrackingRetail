import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const url = "https://www.walmart.co.cr/leche-dos-pinos-delactomy-descremada-946-ml/p";

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Inspect breadcrumbs
    const breadcrumbs = await page.evaluate(() => {
        // Try common VTEX breadcrumb selectors
        const container = document.querySelector('.vtex-breadcrumb-1-x-container');
        if (container) {
             const links = Array.from(container.querySelectorAll('.vtex-breadcrumb-1-x-link'));
             return links.map(l => l.innerText);
        }
        return null;
    });
    
    if (breadcrumbs) {
        console.log('Breadcrumbs found:', breadcrumbs);
    } else {
        console.log('Breadcrumbs NOT found with .vtex-breadcrumb-1-x-container');
        // Dump some HTML to verify
        const html = await page.content();
        if (html.includes('breadcrumb')) {
            console.log('Page contains "breadcrumb" keyword.');
        }
    }
    
    await browser.close();
}

run().catch(console.error);
