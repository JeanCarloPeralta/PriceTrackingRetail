import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/products.json');

// Simple argument parsing
const args = process.argv.slice(2);
const limitArg = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || 0; 
const showBrowser = args.includes('--show') || args.includes('--no-headless');
const headless = !showBrowser;

const URL = 'https://automercado.cr/categorias/abarrotes';

async function scrapeAutoMercado() {
    console.log(`[${new Date().toISOString()}] Starting Auto Mercado Scraper.`);
    console.log(`[${new Date().toISOString()}] Target URL: ${URL}`);
    console.log(`[${new Date().toISOString()}] Target Limit: ${limitArg === 0 ? 'All Products' : limitArg}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, 
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--window-size=1920,1080',
                '--lang=es-419,es'
            ]
        });

        const page = await browser.newPage();
        
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'es-419,es;q=0.9',
            'Referer': 'https://www.google.com/'
        });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`[${new Date().toISOString()}] Bouncing off Home page to bypass anti-bot...`);
        await page.goto('https://automercado.cr/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 5000));

        console.log(`[${new Date().toISOString()}] Navigating to ${URL}...`);
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Waiting 10s for page hydration...');
        await new Promise(r => setTimeout(r, 10000));

        // Use the safe text-based selector instead of class names that might change
        const found = await page.evaluate(() => {
             const divs = Array.from(document.querySelectorAll('div'));
             const products = divs.filter(d => d.innerText.includes('₡') && document.querySelectorAll('a.title-product').length > 0);
             return products.length > 0;
        });

        if (!found) {
             console.log('Timeout waiting for products. Trying alternative...');
        } else {
             console.log('Products found on page.');
        }

        // --- PAGINATION LOOP ---
        let hasMore = true;
        let previousCount = 0;
        let noChangeAttempts = 0;

        while (hasMore) {
            let currentCount = await page.$$eval('a.title-product', els => els.length);
            
            if (limitArg > 0 && currentCount >= limitArg) {
                console.log(`[${new Date().toISOString()}] Reached limit of ${limitArg} items (Current: ${currentCount}).`);
                break;
            }

            // Keyboard Scroll
            await page.keyboard.press('End');
            await new Promise(r => setTimeout(r, 1000));
            await page.evaluate(() => window.scrollBy(0, -300));
            await new Promise(r => setTimeout(r, 500));
            await page.keyboard.press('End');
            
            await new Promise(r => setTimeout(r, 3000));

            // Check if "Ver más" button exists and click it
            const verMasClicked = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('.text-success'));
                const btn = elements.find(el => el.innerText.includes('Ver más') || el.innerText.includes('Cargar'));
                if (btn) {
                    btn.click();
                    return true;
                }
                return false;
            });
            
            if (verMasClicked) {
                 await new Promise(r => setTimeout(r, 4000));
            }

            const newCount = await page.$$eval('a.title-product', els => els.length);
            
            if (newCount > currentCount) {
                console.log(`[${new Date().toISOString()}] Items loaded: ${newCount}`);
                noChangeAttempts = 0;
            } else {
                 noChangeAttempts++;
                 if (noChangeAttempts >= 3) {
                     console.log('  No new items loaded after multiple attempts. Stopping pagination.');
                     hasMore = false;
                 }
            }
        }

        console.log(`[${new Date().toISOString()}] Extracting final list...`);
        
        // --- EXTRACTION ---
        const result = await page.evaluate(() => {
            const items = [];
            const links = document.querySelectorAll('a.title-product');
            
            links.forEach(linkEl => {
                const name = linkEl.innerText.trim();
                const url = linkEl.href;
                
                // Find parent container to locate price and image
                let container = linkEl;
                let price = "0";
                let presentation = "N/A";
                let img = "https://via.placeholder.com/150";
                
                for (let i = 0; i < 5; i++) {
                    if (container.parentElement) container = container.parentElement;
                }
                // At this container level, search down for details
                const priceEl = container.querySelector('.text-currency');
                if (priceEl) price = priceEl.innerText.replace(/[^0-9]/g, '').trim();
                
                const presEl = container.querySelector('.text-subtitle');
                if (presEl) presentation = presEl.innerText.trim();

                const imgEl = container.querySelector('img');
                if (imgEl) img = imgEl.src;

                // AutoMercado brand parsing is rarely prominent on cards, fallback or parse from title
                // Usually titles are like "Arroz Tio Pelon 99% ..."
                let brand = "Auto Mercado Generic";

                items.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: name,
                    description: name,
                    price: price,
                    brand: brand,
                    presentation: presentation,
                    upc: 'N/A', // UPC not available on category page
                    link: url,
                    discount: null,
                    image: img,
                    store: 'Auto Mercado',
                    category: 'Abarrotes',
                    breadcrumbs: ['Abarrotes'],
                    scrapedAt: new Date().toISOString()
                });
            });
            return items;
        });

        let products = result;
        console.log(`[${new Date().toISOString()}] Extracted ${products.length} products from Auto Mercado.`);

        // --- MERGE WITH EXISTING JSON ---
        let existingProducts = [];
        if (fs.existsSync(OUTPUT_FILE)) {
            try {
                existingProducts = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
                console.log(`[${new Date().toISOString()}] Loaded ${existingProducts.length} existing products for merging.`);
            } catch (e) {
                console.log('Error reading existing file, starting fresh.');
            }
        }

        let updatedCount = 0;
        let newCount = 0;

        const productMap = new Map();
        existingProducts.forEach(p => productMap.set(p.link, p));

        products.forEach(newP => {
            if (productMap.has(newP.link)) {
                const existingP = productMap.get(newP.link);
                if (!existingP.priceHistory) existingP.priceHistory = [];

                existingP.image = newP.image; 
                existingP.presentation = newP.presentation;

                const oldPrice = String(existingP.price).replace(/[^0-9]/g, '');
                const newPrice = String(newP.price).replace(/[^0-9]/g, '');

                if (oldPrice !== newPrice && newPrice !== "0") {
                    existingP.priceHistory.push({
                        price: existingP.price,
                        date: existingP.scrapedAt
                    });
                    existingP.price = newP.price; 
                    existingP.scrapedAt = newP.scrapedAt;
                    updatedCount++;
                } else {
                    existingP.scrapedAt = newP.scrapedAt;
                }
            } else {
                newP.priceHistory = [];
                // Only add if price is valid to avoid garbage cards
                if (newP.price !== "0") {
                    productMap.set(newP.link, newP);
                    newCount++;
                }
            }
        });

        const finalProducts = Array.from(productMap.values());
        
        console.log(`[${new Date().toISOString()}] Merge complete: ${newCount} new, ${updatedCount} updated prices.`);
        
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalProducts, null, 2));
        console.log(`[${new Date().toISOString()}] Data saved to ${OUTPUT_FILE} (Total: ${finalProducts.length})`);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Fatal Error:`, error);
        process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        console.log(`[${new Date().toISOString()}] Browser closed.`);
    }
}

scrapeAutoMercado();
