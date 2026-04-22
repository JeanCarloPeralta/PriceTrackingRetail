import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/products.json');

// Simple argument parsing
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.findIndex(arg => arg.startsWith(`--${name}=`));
    if (index !== -1) return args[index].split('=')[1];
    return null;
};
const QUERY = getArg('query') || 'abarrotes';
const limitArg = parseInt(getArg('limit')) || 0; 
const PAGE_SIZE = 50;

const STORES = [
    { name: 'Walmart', domain: 'www.walmart.co.cr' },
    { name: 'Masxmenos', domain: 'www.masxmenos.cr' }
];

async function scrapeWalmartAPI() {
    console.log(`[${new Date().toISOString()}] Starting API scraper for query: ${QUERY}`);
    
    let allProducts = [];

    for (const store of STORES) {
        console.log(`[${new Date().toISOString()}] ---> Scraping store: ${store.name} (${store.domain})`);
        let from = 0;
        let hasMore = true;
        let storeProductCount = 0;

        while (hasMore) {
            let to = from + PAGE_SIZE - 1;
            const url = `https://${store.domain}/api/catalog_system/pub/products/search/${QUERY}?_from=${from}&_to=${to}`;
            console.log(`[${new Date().toISOString()}] [${store.name}] Fetching items ${from} to ${to}...`);
            
            try {
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    }
                });
                
                if (!res.ok) {
                    console.error(`[${store.name}] Status Error: ${res.status}`);
                    break;
                }
                
                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                    console.log(`[${new Date().toISOString()}] [${store.name}] No more items found. Ending pagination.`);
                    hasMore = false;
                    break;
                }

                data.forEach(item => {
                    const commOffer = item.items[0]?.sellers[0]?.commertialOffer;
                    const price = commOffer ? commOffer.Price : 0;
                    const listPrice = commOffer ? commOffer.ListPrice : 0;
                    const ean = item.items[0]?.ean || 'N/A';
                    const image = item.items[0]?.images[0]?.imageUrl || 'https://via.placeholder.com/150';
                    
                    let discountText = null;
                    if (listPrice > price && price > 0) {
                        const discount = Math.round((1 - (price / listPrice)) * 100);
                        discountText = `${discount}%`;
                    }
                    
                    const categoryNames = item.categories ? item.categories[0].replace(/^\/|\/$/g, '').split('/') : ['Groceries'];

                    // Fix: Ensure link is absolute and doesn't double-prefix domain
                    let productLink = item.link;
                    if (productLink && !productLink.startsWith('http')) {
                        productLink = `https://${store.domain}${productLink}`;
                    }

                    allProducts.push({
                        id: Math.random().toString(36).substr(2, 9),
                        name: item.productName,
                        description: item.description || item.productName,
                        price: Math.round(price).toString(), // Normalize to whole number string
                        brand: item.brand || `${store.name} Generic`,
                        presentation: 'N/A', 
                        upc: ean,
                        link: productLink,
                        discount: discountText,
                        image: image,
                        category: categoryNames.join(' > '),
                        breadcrumbs: categoryNames,
                        store: store.name,
                        scrapedAt: new Date().toISOString()
                    });
                });

                storeProductCount += data.length;
                console.log(`[${new Date().toISOString()}] [${store.name}] Fetched ${data.length} items. Total for store so far: ${storeProductCount}`);
                
                if (limitArg > 0 && storeProductCount >= limitArg) {
                    console.log(`[${new Date().toISOString()}] [${store.name}] Reached limit of ${limitArg}. Stopping for this store.`);
                    hasMore = false;
                } else {
                    from += PAGE_SIZE;
                    await new Promise(r => setTimeout(r, 1000));
                }

            } catch (e) {
                console.error(`[${new Date().toISOString()}] [${store.name}] Error fetching API:`, e.message);
                hasMore = false;
            }
        }
    }

    // Merge with existing data
    let existingProducts = [];
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            existingProducts = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
            console.log(`[${new Date().toISOString()}] Loaded ${existingProducts.length} existing products for merging.`);
        } catch (e) { }
    }

    let updatedCount = 0;
    let newCount = 0;
    const productMap = new Map();
    
    // Key by UPC + Store to allow same product in different stores
    const getProductKey = (p) => `${p.upc}_${p.store}`;

    existingProducts.forEach(p => {
        if (p.upc && p.upc !== 'N/A') {
            productMap.set(getProductKey(p), p);
        } else {
            // Fallback to link if UPC is missing
            productMap.set(p.link, p);
        }
    });

    allProducts.forEach(newP => {
        const key = (newP.upc && newP.upc !== 'N/A') ? getProductKey(newP) : newP.link;
        if (productMap.has(key)) {
            const existingP = productMap.get(key);
            if (!existingP.priceHistory) existingP.priceHistory = [];
            
            existingP.discount = newP.discount;
            existingP.image = newP.image; 
            existingP.upc = newP.upc !== 'N/A' ? newP.upc : existingP.upc;
            existingP.category = newP.category || existingP.category;
            existingP.breadcrumbs = newP.breadcrumbs || existingP.breadcrumbs;
            existingP.link = newP.link; // Update to corrected link

            const oldPriceNum = Number(String(existingP.price).replace(/[^0-9.]/g, '')) || 0;
            const newPriceNum = Number(newP.price) || 0;

            if (oldPriceNum !== newPriceNum) {
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
            productMap.set(key, newP);
            newCount++;
        }
    });

    const finalProducts = Array.from(productMap.values());
    console.log(`[${new Date().toISOString()}] Merge complete: ${newCount} new, ${updatedCount} updated prices.`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalProducts, null, 2));
    console.log(`[${new Date().toISOString()}] Data saved to ${OUTPUT_FILE} (Total: ${finalProducts.length})`);
}

// Execute if run directly
if (process.argv[1].includes('scraper_api.js')) {
    scrapeWalmartAPI();
}

export { scrapeWalmartAPI };
