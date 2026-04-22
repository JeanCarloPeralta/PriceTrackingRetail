import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    try {
        console.log('Navigating to Abarrotes...');
        await page.goto('https://automercado.cr/categorias/abarrotes', { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log('Waiting for products...');
        await new Promise(r => setTimeout(r, 10000));
        
        // Find links to products as a starting point
        const productsInfo = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            // Filter ones that look like product links
            const productLinks = links.filter(l => l.href && l.href.includes('/producto/'));
            
            if (productLinks.length === 0) return { count: 0 };
            
            // Go up to a container that has price (₡)
            const getProductData = (linkEl) => {
                let container = linkEl;
                for (let i = 0; i < 5; i++) {
                    if (container.innerText && container.innerText.includes('₡')) {
                        return {
                            html: container.innerHTML,
                            text: container.innerText,
                            href: linkEl.href,
                            imgSrc: container.querySelector('img') ? container.querySelector('img').src : null
                        };
                    }
                    if (container.parentElement) {
                        container = container.parentElement;
                    } else {
                        break;
                    }
                }
                return null;
            };

            const data = productLinks.map(getProductData).filter(x => x);
            return {
                count: data.length,
                firstText: data.length > 0 ? data[0].text : '',
                firstHref: data.length > 0 ? data[0].href : '',
                firstImg: data.length > 0 ? data[0].imgSrc : ''
            };
        });

        console.log('Products Found:', productsInfo);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
})();
