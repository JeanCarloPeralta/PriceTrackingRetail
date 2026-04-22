import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const url = "https://www.walmart.co.cr/abarrotes";

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Check for product cards
    const cardSelector = '.vtex-product-summary-2-x-container';
    const initialCards = await page.$$eval(cardSelector, els => els.length);
    console.log(`Initial items found: ${initialCards}`);
    
    // Check for "Show More" button
    // Common VTEX selector: .vtex-search-result-3-x-buttonShowMore
    // Or plain scroll
    const showMoreSelector = '.vtex-search-result-3-x-buttonShowMore';
    const hasShowMore = await page.$(showMoreSelector);
    
    if (hasShowMore) {
        console.log('Found "Show More" button.');
    } else {
        console.log('"Show More" button NOT found.');
    }
    
    // Check if scroll triggers load
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 5000));
    
    const postScrollCards = await page.$$eval(cardSelector, els => els.length);
    console.log(`Items after scroll: ${postScrollCards}`);
    
    await browser.close();
}

run().catch(console.error);
