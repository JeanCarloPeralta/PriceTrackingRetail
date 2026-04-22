import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import { scrapeWalmart } from './scraper.js'; // We might want to unify this, but for now let's keep separate or reuse logic if extracted.
// Actually, since the logic is almost identical (VTEX), let's create a reusable function in scraper.js? 
// But strictly following the plan: "Implement Masxmenos scraper using scraper.js logic".

// To avoid duplicate code, I should ideally refactor scraper.js to accept config.
// However, to save time and risk, I will duplicate the script structure but adapted for Masxmenos, 
// OR better: Refactor scraper.js to be generic. 
// Let's stick to the plan of a new file, but maybe we can just import the scrape function if I refactor it to accept args?
// The current `scrapeWalmart` is hardcoded for Walmart.

// Let's create a standalone masxmenos.js for now to be safe and specific, 
// as requested in the plan "[NEW] masxmenos.js".

puppeteer.use(StealthPlugin());

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/products.json');

// ... (Copy of scraper.js logic but with Masxmenos URLs and specific selectors if different, though they seemed identical)

// Masxmenos URL: https://www.masxmenos.cr/abarrotes
// Selectors are identical as verified.

async function scrapeMasxmenos() {
    const url = `https://www.masxmenos.cr/abarrotes?_q=abarrotes&map=ft`; // Search query might need adjustment
    // Actually user said "search for items". 
    
    // Command line args support
    const args = process.argv.slice(2);
    const getArg = (name) => {
        const index = args.findIndex(arg => arg.startsWith(`--${name}=`));
        if (index !== -1) return args[index].split('=')[1];
        return null;
    };
    const queryArg = getArg('query') || 'abarrotes'; 
    
    // Excluded categories
    const EXCLUDED_CATEGORIES = [
        'Tecnología', 'Electrodomésticos', 'Juguetes', 
        'Deportes', 'Muebles', 'Automotriz', 'Jardín'
    ];

    let targetUrl;
    if (queryArg === 'abarrotes') {
         targetUrl = `https://www.masxmenos.cr/abarrotes`;
    } else {
         targetUrl = `https://www.masxmenos.cr/${queryArg}?_q=${queryArg}&map=ft`;
    }

    console.log(`[${new Date().toISOString()}] Starting Masxmenos scraper.`);
    console.log(`[${new Date().toISOString()}] Target URL: ${targetUrl}`);

    const limitArg = parseInt(getArg('limit')) || 50;
    const headless = getArg('show') === 'true' ? false : true;

    const browser = await puppeteer.launch({
        headless: headless ? "new" : false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Store Selection Logic
    const selectSantaAnaStore = async (page) => {
        console.log(`[${new Date().toISOString()}] Selecting 'Santa Ana' store...`);
        try {
            // Wait for modal or button
            // If modal is not present, we might need to click "Tienda" header, but let's assume modal/dropdowns are there or we can find them.
            // Based on subagent, dropdowns are .vtex-dropdown__container
            
            await page.waitForSelector('.vtex-dropdown__container', { timeout: 10000 }).catch(() => console.log('Dropdowns not found initially.'));
            
            // Allow time for all dropdowns to mount
            await new Promise(r => setTimeout(r, 2000));

            const selects = await page.$$('.vtex-dropdown__container select');
            
            if (selects.length >= 3) {
                 // 1. Provincia: San José
                 await selects[0].select('San José');
                 await new Promise(r => setTimeout(r, 2000)); // Wait for reload/update
                 
                 // Re-fetch selects as DOM might have updated
                 const selects2 = await page.$$('.vtex-dropdown__container select');
                 if (selects2.length >= 2) {
                     // 2. Cantón: Santa Ana
                     // Check if option exists first
                     const santaAnaOption = await selects2[1].evaluate(el => {
                         return Array.from(el.options).some(o => o.text === 'Santa Ana' || o.value === 'Santa Ana');
                     });
                     
                     if (santaAnaOption) {
                        await selects2[1].select('Santa Ana');
                     } else {
                         console.log('Santa Ana cantón option not found yet.');
                     }
                     await new Promise(r => setTimeout(r, 2000));
                 }

                 // Re-fetch again
                 const selects3 = await page.$$('.vtex-dropdown__container select');
                 if (selects3.length >= 3) {
                     // 3. Distrito: Santa Ana
                     await selects3[2].select('Santa Ana');
                     await new Promise(r => setTimeout(r, 2000));
                 }
                 
                 // 4. Click Buscar
                 const searchBtn = await page.waitForSelector('.vtex-button:not(.bg-disabled)');
                 if (searchBtn) await searchBtn.click();
                 
                 await new Promise(r => setTimeout(r, 2000));

                 // 5. Select Radio and Accept
                 const radio = await page.waitForSelector('input[type="radio"]', { timeout: 5000 }).catch(() => null);
                 if (radio) await radio.click();
                 
                 await new Promise(r => setTimeout(r, 500));
                 
                 await page.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const acceptBtn = btns.find(b => b.innerText.includes('ACEPTAR'));
                    if (acceptBtn) acceptBtn.click();
                 });
                 
                 console.log(`[${new Date().toISOString()}] Store 'Santa Ana' selected.`);
                 await new Promise(r => setTimeout(r, 5000)); // Wait for reload
            } else {
                console.log('Store selection dropdowns not found. Proceeding with default store.');
            }
        } catch (e) {
            console.error('Error selecting store:', e);
        }
    };

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        // Arg parsing
        const getArg = (name) => {
            const arg = process.argv.find(a => a.startsWith(`--${name}=`));
            return arg ? arg.split('=')[1] : null;
        };
        const limitArg = parseInt(getArg('limit')) || 50;
        const queryArg = getArg('query') || 'abarrotes';

        // Select Store
        await selectSantaAnaStore(page);
        
        // Reload to ensure products are from the store
         await page.reload({ waitUntil: 'networkidle2' });

        // ... Pagination Logic (Same as Walmart) ...
        // For brevity in this initial implementation, let's just scrape the first page to verify.
        // Or copy the pagination logic. Let's copy the pagination logic for robustness.
        
        // Packet/Limit Logic
        let extractedCount = 0;
        let previousHeight = 0;
        let noChangeCount = 0;

        while (extractedCount < limitArg) {
            // Get current scroll height
            const currentHeight = await page.evaluate('document.body.scrollHeight');
            
            // Keyboard Scroll (More human-like)
            await page.keyboard.press('End');
            await new Promise(r => setTimeout(r, 1000));
            // Small scroll up to trigger observability?
            await page.evaluate(() => window.scrollBy(0, -100));
            await new Promise(r => setTimeout(r, 500));
            await page.keyboard.press('End');
            
            // Wait for load
            await new Promise(r => setTimeout(r, 6000));

            // Check if new items loaded
            const currentItemCount = await page.$$eval('.vtex-product-summary-2-x-container', els => els.length);
            console.log(`[${new Date().toISOString()}] Scrolled. Items: ${currentItemCount}`);
            
            if (currentItemCount > extractedCount) {
                extractedCount = currentItemCount;
                noChangeCount = 0;
            } else {
                // If height didn't change (and no new items), retry or break
                const newHeight = await page.evaluate('document.body.scrollHeight');
                if (newHeight === previousHeight) {
                    noChangeCount++;
                    console.log(`  No new content loaded. Retry ${noChangeCount}/3`);
                    if (noChangeCount >= 3) break;
                } else {
                     // Height changed but maybe items aren't counted yet?
                     previousHeight = newHeight;
                     noChangeCount = 0;
                }
            }
        }

        // Extraction
        let products = await page.evaluate(() => {
            const items = [];
            const cards = document.querySelectorAll('.vtex-product-summary-2-x-container');
            
            cards.forEach((card) => {
                const nameEl = card.querySelector('.vtex-product-summary-2-x-nameContainer');
                
                // Price Selectors (Updated)
                const priceEl = card.querySelector('.vtex-product-price-1-x-sellingPriceValue') || card.querySelector('.vtex-store-components-3-x-sellingPriceValue');
                const listPriceEl = card.querySelector('.vtex-product-price-1-x-listPriceValue') || card.querySelector('.vtex-store-components-3-x-listPriceValue');
                
                const imgEl = card.querySelector('.vtex-product-summary-2-x-image') || card.querySelector('img.vtex-store-components-3-x-productImageTag');
                const linkEl = card.querySelector('a.vtex-product-summary-2-x-clearLink');
                
                // Discount Selectors (Updated)
                const discountBadge = card.querySelector('.vtex-product-summary-2-x-badgeContainer');
                const discountValue = card.querySelector('.vtex-product-price-1-x-savingsValue');
                
                let discountText = null;
                if (discountValue) {
                    discountText = discountValue.innerText.trim();
                } else if (discountBadge && discountBadge.innerText.includes('REBAJA')) {
                     // Fallback if we see REBAJA but no specific value yet (though value is better)
                     discountText = 'REBAJA';
                }

                if (nameEl && priceEl) {
                    // Calculate discount if missing
                    // Robust parsing for CR locale (1.000,00)
                    const parsePrice = (str) => {
                        if (!str) return 0;
                        const clean = str.replace(/[^\d,]/g, '').replace(',', '.');
                        return parseFloat(clean);
                    };

                    const priceVal = parsePrice(priceEl.innerText);
                    let originalPriceVal = null;
                    
                    if (listPriceEl) {
                        originalPriceVal = parsePrice(listPriceEl.innerText);
                        if (!discountText && originalPriceVal > priceVal) {
                            const diff = originalPriceVal - priceVal;
                            const pct = Math.round((diff / originalPriceVal) * 100);
                            if (pct > 0) discountText = `${pct}%`;
                        }
                    }

                   items.push({
                       id: Math.random().toString(36).substr(2, 9),
                       name: nameEl.innerText.trim(),
                       price: priceEl.innerText.replace(/[^0-9,.]/g, '').trim(),
                       originalPrice: listPriceEl ? listPriceEl.innerText.replace(/[^0-9,.]/g, '').trim() : null,
                       link: linkEl ? linkEl.href : '',
                       image: imgEl ? imgEl.src : '',
                       discount: discountText, 
                       store: 'Masxmenos',
                       scrapedAt: new Date().toISOString()
                   });
                }
            });
            return items;
        });

        console.log(`[${new Date().toISOString()}] Extracted ${products.length} items from Masxmenos.`);

        // Enrichment (Fetching UPC)
        const enrichProduct = async (product) => {
            if (!product.link) return;
            const pPage = await browser.newPage();
            try {
                await pPage.goto(product.link, { waitUntil: 'domcontentloaded' });
                const upc = await pPage.evaluate(() => {
                     const el = document.querySelector('.vtex-product-identifier-0-x-product-identifier__value');
                     return el ? el.innerText.trim() : null;
                });
                if (upc) product.upc = upc;
                
                // Breadcrumbs
                 const breadcrumbs = await pPage.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('.vtex-breadcrumb-1-x-link'));
                    return links.map(l => l.innerText).filter(t => t);
                 });
                 if (breadcrumbs.length) {
                    product.breadcrumbs = breadcrumbs;
                     // Check exclusion
                    const hasExcluded = breadcrumbs.some(bc => 
                        EXCLUDED_CATEGORIES.some(ex => bc.includes(ex))
                    );
                    if (hasExcluded) {
                        product.exclude = true;
                    }
                 }

            } catch(e) { console.error('Enrich error', e); }
            finally { await pPage.close(); }
        };

        // Limit concurrency
        const CONCURRENCY = 4;
        for (let i = 0; i < products.length; i += CONCURRENCY) {
            const chunk = products.slice(i, i+CONCURRENCY);
            await Promise.all(chunk.map(p => enrichProduct(p)));
            console.log(`Enriched batch ${i}`);
        }

        // Filter excluded
        products = products.filter(p => !p.exclude);

        // Merge logic
        let existing = [];
        if (fs.existsSync(OUTPUT_FILE)) {
            existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
        }
        
        // Merge
        const productMap = new Map();
        existing.forEach(p => productMap.set(p.link, p));
        
        products.forEach(newP => {
             // If existing, we might want to preserve history?
             // Since we are fixing data, let's overwrite for now or merge smartly.
             if (productMap.has(newP.link)) {
                 const old = productMap.get(newP.link);
                 newP.priceHistory = old.priceHistory || [];
                 if (old.price !== newP.price) {
                     newP.priceHistory.push({ price: old.price, date: old.scrapedAt });
                 }
             }
             productMap.set(newP.link, newP);
        });

        const merged = Array.from(productMap.values());
        
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
        console.log('Saved Masxmenos data.');

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

// Execute if run directly
scrapeMasxmenos();

export { scrapeMasxmenos };
