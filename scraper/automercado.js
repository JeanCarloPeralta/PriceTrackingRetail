
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/products.json');

async function scrapeAutoMercado() {
    const targetUrl = 'https://automercado.cr/categorias/abarrotes';
    
    // Args
    const args = process.argv.slice(2);
    const getArg = (name) => {
        const index = args.findIndex(arg => arg.startsWith(`--${name}=`));
        if (index !== -1) return args[index].split('=')[1];
        return null;
    };
    const limitArg = parseInt(getArg('limit')) || 200;
    // Default to headful because headless is blocked/empty
    const isHeadless = getArg('headless') === 'true'; 

    console.log(`[${new Date().toISOString()}] Starting Auto Mercado scraper.`);
    console.log(`[${new Date().toISOString()}] Target URL: ${targetUrl}`);
    console.log(`[${new Date().toISOString()}] Mode: ${isHeadless ? 'Headless' : 'Headful (Default)'}`);

    const browser = await puppeteer.launch({
        headless: isHeadless ? "new" : false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=es-419,es', '--start-maximized']
    });

    try {
        const page = await browser.newPage();
        
        // Headers and User Agent
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'es-419,es;q=0.9',
            'Referer': 'https://www.google.com/'
        });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log('Waiting for initial load...');
        await new Promise(r => setTimeout(r, 8000));

        // Scroll and Load Logic
        let extractedCount = 0;
        let noChangeCount = 0;
        let previousHeight = 0;

        // Container for all found items (Set to avoid duplicates)
        const allItemsMap = new Map();

        while (allItemsMap.size < limitArg) {
            // Scroll
            await page.keyboard.press('End');
            await new Promise(r => setTimeout(r, 2000));
            
            // Check for "Ver más" button and click if exists
            const clicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a'));
                const loadMore = buttons.find(b => b.innerText && (b.innerText.toLowerCase().includes('ver más') || b.innerText.toLowerCase().includes('cargar más')));
                if (loadMore) {
                    loadMore.click();
                    return true;
                }
                return false;
            });
            if (clicked) {
                console.log('Clicked "Ver más/Cargar más"');
                await new Promise(r => setTimeout(r, 3000));
            }

            // Extract Items using Visual Logic
            const items = await page.evaluate(() => {
                const results = [];
                // Find all potential images
                const imgs = Array.from(document.querySelectorAll('img'));
                
                imgs.forEach(img => {
                    const rect = img.getBoundingClientRect();
                    // Filter small icons
                    if (rect.width > 100 && rect.height > 100) {
                        // Traverse up to find container
                        let container = img.parentElement;
                        let found = false;
                        let price = null;
                        let name = null;
                        let link = null;

                        for (let i = 0; i < 5; i++) {
                            if (!container) break;
                            const text = container.innerText || '';
                            
                            // Check for price format (digits + maybe currency symbol)
                            // Auto Mercado might show "1.000" or "₡1.000"
                            if (/\d/.test(text) && text.length < 500) {
                                // This container has numbers and is parent of big image -> Candidate
                                
                                // Clean text to find price
                                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                                // Heuristic: Price is usually short and has digits
                                const priceCandidate = lines.find(l => /\d/.test(l) && (l.includes('₡') || l.match(/^\d+[.,]\d+/)));
                                
                                // Heuristic: Name is usually the longest line or specific formatting? 
                                // Actually, name is often close to the image.
                                // Let's try to find name as non-price text.
                                const nameCandidate = lines.find(l => l.length > 5 && l !== priceCandidate && !l.toLowerCase().includes('agregar') && !l.includes('%'));

                                if (priceCandidate && nameCandidate) {
                                    price = priceCandidate;
                                    name = nameCandidate;
                                    
                                    // Try to find link
                                    const a = container.tagName === 'A' ? container : container.querySelector('a');
                                    link = a ? a.href : window.location.href; // Fallback
                                    
                                    found = true;
                                    break;
                                }
                            }
                            container = container.parentElement;
                        }

                        if (found && price && name) {
                            results.push({
                                name: name,
                                priceRaw: price,
                                image: img.src,
                                link: link
                            });
                        }
                    }
                });
                return results;
            });

            // Process extracted items
            let newItems = 0;
            items.forEach(item => {
                // Generate a pseudo-ID or use link
                const id = item.link || item.name;
                if (!allItemsMap.has(id)) {
                    // Refine price
                    const cleanPrice = item.priceRaw.replace(/[^\d.,]/g, '').replace(',', '.'); // naive
                    // Auto Mercado uses "1,000.00" or "1.000,00"? Usually CR is "," for decimal or "."? 
                    // CR uses "." for thousands, "," for decimal. e.g. 1.500,00
                    // But code often normalizes.
                    
                    allItemsMap.set(id, {
                        id: Math.random().toString(36).substr(2, 9),
                        name: item.name,
                        price: cleanPrice, // We will refine this later
                        originalPrice: null, // Hard to detect without specific selector
                        link: item.link,
                        image: item.image,
                        store: 'Auto Mercado',
                        scrapedAt: new Date().toISOString()
                    });
                    newItems++;
                }
            });

            console.log(`[${new Date().toISOString()}] Extracted ${items.length} items (Total Unique: ${allItemsMap.size})`);

            if (newItems === 0) {
                // Check scroll height
                const newHeight = await page.evaluate('document.body.scrollHeight');
                if (newHeight === previousHeight) {
                    noChangeCount++;
                    if (noChangeCount > 5) break; 
                } else {
                    previousHeight = newHeight;
                    noChangeCount = 0;
                }
            } else {
                noChangeCount = 0;
            }
        }

        // Save
        const products = Array.from(allItemsMap.values());
        
        // Merge logic
        let existing = [];
        if (fs.existsSync(OUTPUT_FILE)) {
             existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
        }
        
        // Remove old Auto Mercado items to avoid dupes? Or update?
        // Let's merge based on Link.
        const productMap = new Map();
        existing.forEach(p => productMap.set(p.link, p));
        
        products.forEach(newP => {
             productMap.set(newP.link, newP);
        });
        
        const merged = Array.from(productMap.values());
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
        console.log(`Saved ${products.length} Auto Mercado products. Total DB: ${merged.length}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

scrapeAutoMercado();
