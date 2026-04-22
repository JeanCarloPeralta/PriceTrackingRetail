import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const url = "https://www.walmart.co.cr/abarrotes";

async function run() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Extract links
    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors
            .map(a => a.href)
            .filter(href => href && href.length > 5) // Basic filter
            .filter((v, i, a) => a.indexOf(v) === i); // Unique
    });
    
    console.log('Links found:', links.length);
    console.log('Sample Links:', JSON.stringify(links.slice(0, 50), null, 2));
    // Filter for likely categories (heuristic: no query, no specific excludes)
    const candidates = links.filter(l => 
        !l.includes('login') && 
        !l.includes('account') && 
        !l.includes('checkout') && 
        l.includes('walmart.co.cr/')
    );
     console.log('Candidate Links:', JSON.stringify(candidates, null, 2));
    await browser.close();
}

run().catch(console.error);
