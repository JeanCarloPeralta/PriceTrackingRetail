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
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Inspect images
    const images = await page.evaluate(() => {
        const cards = document.querySelectorAll('.vtex-product-summary-2-x-container');
        const results = [];
        cards.forEach((card, i) => {
            if (i >= 3) return; // Only check first 3
            
            const img = card.querySelector('img.vtex-store-components-3-x-productImageTag');
            const allImgs = Array.from(card.querySelectorAll('img')).map(img => ({
                src: img.src,
                class: img.className,
                alt: img.alt
            }));

            results.push({
                index: i,
                foundWithSelector: !!img,
                srcWithSelector: img ? img.src : null,
                allImagesInCard: allImgs
            });
        });
        return results;
    });
    
    console.log('Image Inspection Results:', JSON.stringify(images, null, 2));
    
    await browser.close();
}

run().catch(console.error);
