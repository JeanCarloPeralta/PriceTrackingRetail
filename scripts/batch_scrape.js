import { execSync } from 'child_process';

const keywords = [
    'arroz',
    'frijol',
    'leche',
    'atun',
    'aceite',
    'pasta',
    'cafe',
    'azucar',
    'sal',
    'galletas',
    'salsa',
    'huevo',
    'jabon',
    'shampoo',
    'papel',
    'cereal',
    'yogurt',
    'pan',
    'mantequilla',
    'queso'
];

console.log(`Starting batch scrape for ${keywords.length} keywords...`);

for (const keyword of keywords) {
    console.log(`\n--- Scraping keyword: ${keyword} ---`);
    try {
        // Run scraper synchronously for each keyword
        // Using limit=50 to try to get more than 8 if possible, but it might stop at 8. 
        // Even 8 * 20 = 160 products, which is a good start.
        execSync(`node scraper/scraper.js --query="${keyword}" --limit=50`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to scrape ${keyword}:`, e.message);
    }
    
    // Wait a bit between runs to avoid rate limits
    const waitTime = 5000; 
    console.log(`Waiting ${waitTime}ms...`);
    const end = Date.now() + waitTime;
    while (Date.now() < end) {}
}

console.log('\nBatch scrape complete!');
