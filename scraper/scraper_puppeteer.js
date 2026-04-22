import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/products.json');

// Simple argument parsing
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.findIndex(arg => arg.startsWith(`--${name}=`));
    if (index !== -1) return args[index].split('=')[1];
    return null;
};
const hasArg = (name) => args.includes(`--${name}`);

const QUERY = getArg('query') || 'abarrotes';
const urlArg = getArg('url');
const limitArg = parseInt(getArg('limit')) || 0; // 0 = no limit (scrape all)
// Default to 'abarrotes' search if nothing provided
const effectiveQuery = urlArg ? '' : QUERY;
const targetUrl = urlArg || (QUERY === 'abarrotes' ? 'https://www.walmart.co.cr/abarrotes' : `https://www.walmart.co.cr/${effectiveQuery}?_q=${effectiveQuery}&map=ft`);

const showBrowser = hasArg('show') || hasArg('no-headless') || getArg('headless') === 'false';
const headless = !showBrowser;

const GLOBAL_TIMEOUT = 300000; // 5 minutes

async function scrapeWalmart() {
    // Construct URL
    // Construct URL
    const url = targetUrl;

    console.log(`[${new Date().toISOString()}] Starting scraper.`);
    console.log(`[${new Date().toISOString()}] Target URL: ${url}`);
    console.log(`[${new Date().toISOString()}] Mode: ${headless ? 'Headless' : 'Visible Browser'}`);
    console.log(`[${new Date().toISOString()}] Target Limit: ${limitArg === 0 ? 'All Products' : limitArg}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: headless ? "shell" : false, 
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });

        const page = await browser.newPage();
        
        page.on('console', msg => {
            const text = msg.text();
            if (!text.includes('JSHandle')) {
               // console.log('PAGE LOG:', text);
            }
        });
        
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`[${new Date().toISOString()}] Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // --- PAGINATION LOOP ---
        let hasMore = true;
        
        // Wait for first load
        await page.waitForSelector('.vtex-product-summary-2-x-container', { timeout: 30000 }).catch(() => console.log('No products found initially.'));

        while (hasMore) {
            let currentCount = await page.$$eval('.vtex-product-summary-2-x-container', els => els.length);
            
            if (limitArg > 0 && currentCount >= limitArg) {
                console.log(`[${new Date().toISOString()}] Reached limit of ${limitArg} items (Current: ${currentCount}).`);
                break;
            }

            // --- PAGINATION & INFINITE SCROLL ---
            const previousHeight = await page.evaluate('document.body.scrollHeight');
            
            // Keyboard Scroll
            await page.keyboard.press('End');
            await new Promise(r => setTimeout(r, 1000));
            // Small scroll up
            await page.evaluate(() => window.scrollBy(0, -100));
            await new Promise(r => setTimeout(r, 500));
            await page.keyboard.press('End');
            
            await new Promise(r => setTimeout(r, 6000));

            // Check if items increased
            const newCount = await page.$$eval('.vtex-product-summary-2-x-container', els => els.length);
            
            if (newCount > currentCount) {
                console.log(`[${new Date().toISOString()}] Items loaded: ${newCount}`);
            } else {
                 // Check height
                 const newHeight = await page.evaluate('document.body.scrollHeight');
                 if (newHeight === previousHeight) {
                     // Try finding button as fallback
                     const showMoreBtn = await page.$('.vtex-search-result-3-x-buttonShowMore button');
                     if (showMoreBtn) {
                         console.log('  Found Show More button, clicking...');
                         await showMoreBtn.click();
                         await new Promise(r => setTimeout(r, 4000));
                     } else {
                         console.log('  No new items and no button. Stopping.');
                         hasMore = false;
                     }
                 }
            }
            
            // Update checking count
            currentCount = await page.$$eval('.vtex-product-summary-2-x-container', els => els.length);
            
            // Safety break if loop is too fast/broken
            if (hasMore) {
                 await new Promise(r => setTimeout(r, 2000)); 
            }
        }

        console.log(`[${new Date().toISOString()}] Extracting final list...`);
        
        // --- EXTRACTION ---
        const result = await page.evaluate(() => {
            const items = [];
            const cards = document.querySelectorAll('.vtex-product-summary-2-x-container');
            const productData = []; 
            
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            scripts.forEach(s => {
                try {
                    const json = JSON.parse(s.innerText);
                    if (json['@type'] === 'ItemList' && Array.isArray(json.itemListElement)) {
                        productData.push(...json.itemListElement);
                    }
                } catch(e) {}
            });

            cards.forEach((card, index) => {
                const nameEl = card.querySelector('.vtex-product-summary-2-x-nameContainer') || card.querySelector('.vtex-product-summary-2-x-productBrand');
                const priceEl = card.querySelector('.vtex-store-components-3-x-sellingPriceValue');
                const discountEl = card.querySelector('.vtex-product-price-1-x-savingsPercentage') || card.querySelector('.vtex-product-summary-2-x-badgeText');
                // Updated image selector based on inspection
                const imgEl = card.querySelector('.vtex-product-summary-2-x-image') || card.querySelector('img.vtex-store-components-3-x-productImageTag') || card.querySelector('img');
                const brandEl = card.querySelector('.vtex-product-summary-2-x-productBrand') || card.querySelector('.vtex-product-summary-2-x-brandName'); 
                const linkEl = card.querySelector('a.vtex-product-summary-2-x-clearLink') || card.querySelector('a');

                let nameText = nameEl ? nameEl.innerText.trim() : '';
                if (!nameText && linkEl) {
                    nameText = linkEl.getAttribute('aria-label') || linkEl.innerText.trim();
                }
                const brandText = brandEl ? brandEl.innerText.trim() : 'Walmart Generic';
                const link = linkEl ? linkEl.href : '';
                
                // Fallback UPC
                const ldItem = productData[index];
                const upc = ldItem ? (ldItem.sku || ldItem.mpn || 'N/A') : 'N/A';

                let discountText = discountEl ? discountEl.innerText.trim() : null;

                if (nameText && priceEl) {
                    items.push({
                        id: Math.random().toString(36).substr(2, 9),
                        name: nameText,
                        description: nameText,
                        price: priceEl.innerText.replace(/[^0-9,.]/g, '').trim(), 
                        brand: brandText,
                        presentation: 'N/A', 
                        upc: upc,
                        link: link,
                        discount: discountText,
                        image: imgEl ? imgEl.src : 'https://via.placeholder.com/150',
                        store: 'Walmart', // Added store field
                        scrapedAt: new Date().toISOString()
                    });
                }
            });
            return { items, cardCount: cards.length };
        });

        let products = result.items;
        console.log(`[${new Date().toISOString()}] Extracted ${products.length} products.`);

        // --- ENRICHMENT ---

        console.log(`[${new Date().toISOString()}] Enriching products (extracting EAN and Hierarchy)...`);
        
        // Define enrichment worker
        const enrichProduct = async (product, workerId) => {
            if (!product.link) return;
            let pageEnrich;
            try {
                pageEnrich = await browser.newPage();
                // Block resources
                await pageEnrich.setRequestInterception(true);
                pageEnrich.on('request', (req) => {
                    const type = req.resourceType();
                    if (['image', 'stylesheet', 'font', 'media'].includes(type) || req.url().includes('google') || req.url().includes('facebook')) {
                        req.abort();
                    } else {
                        req.continue();
                    }
                });

                await pageEnrich.goto(product.link, { waitUntil: 'domcontentloaded', timeout: 45000 });
                
                const data = await pageEnrich.evaluate(() => {
                    // Extract EAN
                    let ean = null;
                    const s = document.querySelector('.vtex-product-identifier-0-x-product-identifier__value');
                    if (s) ean = s.innerText.trim();
                    if (!ean) {
                        const sc = document.querySelector('script[data-flix-ean]');
                        if (sc) ean = sc.getAttribute('data-flix-ean');
                    }
                    
                    // Extract Breadcrumbs (Category Hierarchy)
                    let breadcrumbs = [];
                    const bcContainer = document.querySelector('.vtex-breadcrumb-1-x-container');
                    if (bcContainer) {
                         const links = Array.from(bcContainer.querySelectorAll('.vtex-breadcrumb-1-x-link'));
                         breadcrumbs = links.map(l => l.innerText).filter(t => t && t.trim().length > 0);
                    }

                    return { ean, breadcrumbs };
                });

                if (data.ean && data.ean.length > 6) {
                    product.upc = data.ean;
                }
                
                if (data.breadcrumbs && data.breadcrumbs.length > 0) {
                    product.breadcrumbs = data.breadcrumbs;
                    product.category = data.breadcrumbs.join(' > ');
                    
                    // Check exclusion
                    const hasExcluded = data.breadcrumbs.some(bc => 
                        EXCLUDED_CATEGORIES.some(ex => bc.includes(ex))
                    );
                    if (hasExcluded) {
                        product.exclude = true;
                    }
                } else {
                    product.category = 'Groceries'; // Default fallback
                }

            } catch (err) {
                // console.error(`[Worker ${workerId}] Error enriching ${product.name}: ${err.message}`);
            } finally {
                if (pageEnrich) await pageEnrich.close();
            }
        };

        // Concurrency Control
        const CONCURRENCY = 4; // 4 parallel tabs
        const chunks = [];
        for (let i = 0; i < products.length; i += CONCURRENCY) {
            chunks.push(products.slice(i, i + CONCURRENCY));
        }

        for (let i = 0; i < chunks.length; i++) {
            console.log(`[${new Date().toISOString()}] Processing batch ${i+1}/${chunks.length} (${chunks[i].length} items)...`);
            await Promise.all(chunks[i].map((p, idx) => enrichProduct(p, idx)));
        }

        console.log(`[${new Date().toISOString()}] Enrichment complete.`);

        // Filter out excluded products
        products = products.filter(p => !p.exclude);

        // Merge with existing data
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

        // Create a map for faster lookup
        const productMap = new Map();
        existingProducts.forEach(p => productMap.set(p.link, p));

        products.forEach(newP => {
            if (productMap.has(newP.link)) {
                const existingP = productMap.get(newP.link);
                
                // Initialize history if missing
                if (!existingP.priceHistory) existingP.priceHistory = [];

                // ALWAYS update discount (promotion) to add or quit promotion
                existingP.discount = newP.discount;

                // normalized prices for comparison
                const oldPrice = String(existingP.price).replace(/[^0-9]/g, '');
                const newPrice = String(newP.price).replace(/[^0-9]/g, '');

                if (oldPrice !== newPrice) {
                    // Price changed! Record history
                    existingP.priceHistory.push({
                        price: existingP.price,
                        date: existingP.scrapedAt
                    });
                    existingP.price = newP.price; // Update to new price
                    existingP.scrapedAt = newP.scrapedAt;
                    updatedCount++;
                } else {
                    // Just update timestamp if seen again? Or keep original "first seen"? 
                    // Let's update scrapedAt to show it's fresh
                    existingP.scrapedAt = newP.scrapedAt;
                }
            } else {
                newP.priceHistory = [];
                productMap.set(newP.link, newP);
                newCount++;
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

// Execute if run directly
if (process.argv[1].includes('scraper.js')) {
    scrapeWalmart();
}

export { scrapeWalmart };
