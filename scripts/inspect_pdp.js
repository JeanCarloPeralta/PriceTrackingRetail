import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const url = "https://www.walmart.co.cr/leche-dos-pinos-delactomy-descremada-946-ml/p";

async function run() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log('Navigating...');
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Dump full HTML
    const html = await page.content();
    fs.writeFileSync('pdp_dump.html', html);
    
    // Try to find the ean in the page text
    const found = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        return bodyText.includes('7441001698644');
    });
    
    console.log('EAN found in text:', found);
    
    await browser.close();
}

run();
