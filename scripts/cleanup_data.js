import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/products.json');

function cleanup() {
    if (!fs.existsSync(DATA_FILE)) {
        console.error('Data file not found!');
        return;
    }

    const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`Starting cleanup of ${products.length} products...`);

    const productMap = new Map();

    products.forEach(p => {
        // Clean URL if broken
        if (p.link && p.link.includes('https://www.walmart.co.crhttps://')) {
            p.link = p.link.replace('https://www.walmart.co.crhttps://', 'https://');
        }
        if (p.link && p.link.includes('https://www.masxmenos.crhttps://')) {
            p.link = p.link.replace('https://www.masxmenos.crhttps://', 'https://');
        }

        // Infer store if missing
        if (!p.store) {
            if (p.link && p.link.includes('walmart.co.cr')) p.store = 'Walmart';
            else if (p.link && p.link.includes('masxmenos.cr')) p.store = 'Masxmenos';
        }

        // --- NEW: Professional Presentation Fixes ---
        // Strip HTML from description
        if (p.description) {
            p.description = p.description.replace(/<[^>]*>?/gm, '').trim();
        }
        // Normalize Brand casing (e.g., TIO PELON -> Tio Pelon)
        if (p.brand && p.brand === p.brand.toUpperCase()) {
            p.brand = p.brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }

        // Use UPC + Store as unique key
        const key = (p.upc && p.upc !== 'N/A') ? `${p.upc}_${p.store || 'Unknown'}` : p.link;

        if (productMap.has(key)) {
            const existing = productMap.get(key);
            
            // Compare dates to keep the most recent main record
            const existingDate = new Date(existing.scrapedAt || 0);
            const newDate = new Date(p.scrapedAt || 0);

            let best, other;
            if (newDate >= existingDate) {
                best = p;
                other = existing;
            } else {
                best = existing;
                other = p;
            }

            // Merge price history
            if (!best.priceHistory) best.priceHistory = [];
            if (other.priceHistory) {
                best.priceHistory = [...best.priceHistory, ...other.priceHistory];
            }
            
            // Normalize prices for comparison (remove dots, ensure string)
            const cleanPrice = (val) => String(val).replace(/[^0-9]/g, '');
            const bestPrice = cleanPrice(best.price);
            const otherPrice = cleanPrice(other.price);

            // If the other record had a different price, add it to history
            if (otherPrice !== bestPrice) {
                const found = best.priceHistory.some(h => cleanPrice(h.price) === otherPrice);
                if (!found) {
                    best.priceHistory.push({ price: other.price, date: other.scrapedAt });
                }
            }

            // Deduplicate price history by date and price
            const seenHistory = new Set();
            best.priceHistory = best.priceHistory.filter(h => {
                const hKey = `${cleanPrice(h.price)}_${h.date}`;
                if (seenHistory.has(hKey)) return false;
                seenHistory.add(hKey);
                return true;
            }).sort((a, b) => new Date(b.date) - new Date(a.date));

            productMap.set(key, best);
        } else {
            productMap.set(key, p);
        }
    });

    let finalProducts = Array.from(productMap.values());

    // --- STEP 2: CATEGORY FILTERING (GROCERIES ONLY) ---
    console.log(`Starting category filtering to remove Electronics, Hardware, etc...`);
    const BLOCKED_CATEGORIES = [
        'electrónica', 'electrodomesticos', 'electrodomésticos',
        'computación', 'celulares', 'televisiones', 'audio',
        'hogar', 'ferreteria', 'ferretería', 'automotriz',
        'juguetes', 'deportes', 'ropa', 'moda', 'muebles',
        'oficina', 'papeleria', 'papelería', 'accesorios',
        'frutas y verduras', 'carnes y pescados', 'carnicería', 'frescos',
        'pescadería', 'aves y carnes'
    ];

    const filteredList = finalProducts.filter(p => {
        if (!p.breadcrumbs) return true;
        const catStr = p.category.toLowerCase();
        for (const blocked of BLOCKED_CATEGORIES) {
            if (catStr.includes(blocked)) return false;
        }
        return true;
    });

    console.log(`Removed ${finalProducts.length - filteredList.length} non-grocery products.`);
    finalProducts = filteredList;

    // --- STEP 3: UPC METADATA SYNC (DEDUPLICATION) ---
    console.log(`Syncing metadata for multi-store UPCs...`);
    const masterByUpc = new Map();
    
    // Pass 1: Identify best metadata for each UPC
    finalProducts.forEach(p => {
        if (!p.upc || p.upc === 'N/A') return;
        const existing = masterByUpc.get(p.upc);
        if (!existing || p.name.length > existing.name.length) {
            masterByUpc.set(p.upc, p);
        }
    });

    // Pass 2: Apply master metadata to all records of same UPC
    finalProducts.forEach(p => {
        if (!p.upc || p.upc === 'N/A') return;
        const master = masterByUpc.get(p.upc);
        if (master && master !== p) {
            p.name = master.name;
            p.brand = master.brand;
            p.presentation = master.presentation;
            p.image = master.image;
            p.category = master.category;
            p.breadcrumbs = master.breadcrumbs;
        }
    });

    console.log(`Metadata sync complete for ${masterByUpc.size} unique UPCs.`);

    console.log(`Cleanup complete! Reduced from ${products.length} to ${finalProducts.length} unique products.`);

    fs.writeFileSync(DATA_FILE, JSON.stringify(finalProducts, null, 2));
    console.log(`Saved cleaned data to ${DATA_FILE}`);
}

cleanup();
