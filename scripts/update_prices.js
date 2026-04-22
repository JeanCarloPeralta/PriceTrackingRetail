import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products.json');

function getRandomChange(price) {
    // 30% chance of price change
    if (Math.random() > 0.7) {
        const changePercent = (Math.random() * 0.1) - 0.05; // +/- 5%
        const newPrice = Math.round(price * (1 + changePercent) / 10) * 10; // Round to nearest 10
        return newPrice;
    }
    return price;
}

try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    let products = JSON.parse(data);
    
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Running Daily Price Update for ${today}...`);

    products = products.map(product => {
        let history = product.history || [];
        
        // If we already have an entry for today, don't double add, just update it
        const todayEntryIndex = history.findIndex(h => h.date === today);
        
        // Simulate a new price (or keep existing)
        // For demo purposes, we'll base it on the last known price
        const lastPrice = history.length > 0 ? history[history.length - 1].price : product.price;
        const newPrice = getRandomChange(lastPrice);

        if (todayEntryIndex >= 0) {
            history[todayEntryIndex].price = newPrice;
        } else {
            history.push({
                date: today,
                price: newPrice
            });
        }
        
        // Update main fields to reflect "Live" status
        return {
            ...product,
            price: newPrice,
            history: history,
            scrapedAt: new Date().toISOString()
        };
    });

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 4));
    console.log('✅ Prices updated successfully!');
    console.log('check src/data/products.json to see changes.');

} catch (error) {
    console.error('❌ Error updating prices:', error);
}
