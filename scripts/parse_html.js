import fs from 'fs';
const html = fs.readFileSync('automercado_dump.html', 'utf8');

// Find script tags
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1];
    if (content.length > 1000) {
        console.log(`\n\n--- LARGE SCRIPT BLOCK (${content.length} bytes) ---`);
        console.log(content.substring(0, 1000));
        
        if (content.includes('precio') || content.includes('products') || content.includes('data')) {
            fs.appendFileSync('automercado_scripts_dump.txt', content + '\n\n------------------------\n\n');
        }
    }
}
