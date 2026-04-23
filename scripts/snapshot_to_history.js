import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public/data/products.json');

if (fs.existsSync(DATA_FILE)) {
    const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`Processing ${products.length} products...`);
    
    products.forEach(p => {
        if (!p.priceHistory) p.priceHistory = [];
        
        const currentScrapeDate = new Date(p.scrapedAt || new Date()).toISOString().split('T')[0];
        const lastHistoryDate = p.priceHistory.length > 0 
            ? new Date(p.priceHistory[p.priceHistory.length - 1].date).toISOString().split('T')[0]
            : null;
            
        if (lastHistoryDate !== currentScrapeDate) {
            p.priceHistory.push({
                price: p.price,
                date: p.scrapedAt || new Date().toISOString()
            });
        }
    });
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    console.log('Successfully moved all current data to history!');
} else {
    console.error('Data file not found!');
}
