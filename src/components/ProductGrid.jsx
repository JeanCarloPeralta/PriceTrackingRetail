import React, { useState } from 'react';
import ProductHistoryModal from './ProductHistoryModal';

const ProductGrid = ({ products }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [visibleCount, setVisibleCount] = useState(60);

    // Reset pagination when the filter/search changes our products list
    React.useEffect(() => {
        setVisibleCount(60);
    }, [products]);

    // Group products by UPC
    const groupedProducts = React.useMemo(() => {
        const groups = {};
        const noUpc = [];

        products.forEach(p => {
            // Default to Walmart if store is missing (legacy data)
            const store = p.store || 'Walmart';

            if (!p.upc) {
                noUpc.push({ type: 'single', product: { ...p, store } });
            } else {
                if (!groups[p.upc]) {
                    groups[p.upc] = { wm: null, mm: null, am: null, products: [] };
                }

                if (store === 'Walmart') groups[p.upc].wm = { ...p, store };
                else if (store === 'Masxmenos') groups[p.upc].mm = { ...p, store };
                else if (store === 'Auto Mercado') groups[p.upc].am = { ...p, store };

                // Keep track just in case duplicates or other stores eventually
                groups[p.upc].products.push({ ...p, store });
            }
        });

        const result = [];
        Object.values(groups).forEach(g => {
            const storeCount = (g.wm ? 1 : 0) + (g.mm ? 1 : 0) + (g.am ? 1 : 0);
            if (storeCount > 1) {
                // Match found across at least 2 stores!
                result.push({ type: 'comparison', wm: g.wm, mm: g.mm, am: g.am });
            } else {
                // No match, push individual items
                g.products.forEach(p => result.push({ type: 'single', product: p }));
            }
        });

        return [...result, ...noUpc];
    }, [products]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {groupedProducts.length > 0 ? (
                    groupedProducts.slice(0, visibleCount).map((item, idx) => (
                        <React.Fragment key={idx}>
                            {item.type === 'comparison' ? (
                                <ComparisonCard
                                    wm={item.wm}
                                    mm={item.mm}
                                    onSelect={setSelectedProduct}
                                />
                            ) : (
                                <SingleCard
                                    product={item.product}
                                    onSelect={setSelectedProduct}
                                />
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 italic bg-white/5 rounded-2xl border border-white/10">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        No products found for your competitive study.
                    </div>
                )}
            </div>

            {visibleCount < groupedProducts.length && (
                <div className="mt-8 text-center">
                    <button 
                        onClick={() => setVisibleCount(v => v + 60)}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-full shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
                    >
                        Load More Products ({groupedProducts.length - visibleCount} remaining)
                        <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
            )}

            {selectedProduct && (
                <ProductHistoryModal
                    products={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
};

const SingleCard = ({ product, onSelect }) => {
    const isWalmart = product.store === 'Walmart';
    const isMasxmenos = product.store === 'Masxmenos';

    // Theme colors
    const borderColor = isWalmart ? 'border-blue-500/20' : (isMasxmenos ? 'border-orange-500/20' : 'border-red-500/20');
    const shadowColor = isWalmart ? 'hover:shadow-blue-500/10' : (isMasxmenos ? 'hover:shadow-orange-500/10' : 'hover:shadow-red-500/10');
    const badgeColor = isWalmart ? 'bg-blue-600' : (isMasxmenos ? 'bg-orange-600' : 'bg-emerald-600');
    const badgeText = isWalmart ? 'Walmart' : (isMasxmenos ? 'Masxmenos' : 'Auto Mercado');

    // Price diff logic
    const { diffAmount, diffPercent } = calculateDiff(product);

    return (
        <div
            onClick={() => onSelect([product])}
            className={`group relative bg-white border ${borderColor} rounded-2xl overflow-hidden hover:bg-slate-50 transition-all duration-300 shadow-sm ${shadowColor} flex flex-col h-full cursor-pointer`}
        >
            <StoreBadge color={badgeColor} text={badgeText} />
            <DiscountBadge discount={product.discount} />

            {/* Image */}
            <div className="h-32 w-full p-4 flex items-center justify-center overflow-hidden relative bg-white">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={handleImageError}
                />
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col bg-white">
                <ProductInfo product={product} />

                <div className="mt-auto pt-4 border-t border-orange-900/10">
                    <PriceRow price={product.price} diffAmount={diffAmount} diffPercent={diffPercent} />
                    <UpcRow upc={product.upc} date={product.scrapedAt} />
                </div>
            </div>
        </div>
    );
};

const ComparisonCard = ({ wm, mm, am, onSelect }) => {
    const stores = [wm, mm, am].filter(Boolean);
    const cols = stores.length;

    return (
        <div className={`col-span-1 md:col-span-2 xl:col-span-${Math.min(cols, 3)} relative group mb-6`}>
            {/* Connector Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center justify-center pointer-events-none drop-shadow-xl h-0">
                <div className="bg-white border-2 border-orange-200 rounded-full p-2 shadow-lg text-orange-500 bg-white translate-y-[-50%]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(cols, 3)} gap-px h-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 shadow-sm`}>
                {stores.map((product, i) => (
                    <StoreComparisonColumn 
                        key={product.store} 
                        product={product}
                        allStores={stores}
                        onSelect={onSelect} 
                        isLast={i === stores.length - 1}
                        baselinePrice={mm?.price}
                    />
                ))}
            </div>
        </div>
    );
};

const StoreComparisonColumn = ({ product, allStores, onSelect, isLast, baselinePrice }) => {
    const isWalmart = product.store === 'Walmart';
    const isMasxmenos = product.store === 'Masxmenos';

    // Theme logic bypassing Tailwind purging by explicitly declaring classes
    const theme = isWalmart 
        ? { badgeBg: 'bg-blue-600', priceText: 'text-blue-600', hoverBg: 'hover:bg-blue-50' }
        : (isMasxmenos ? { badgeBg: 'bg-orange-600', priceText: 'text-orange-600', hoverBg: 'hover:bg-orange-50' }
                       : { badgeBg: 'bg-emerald-600', priceText: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50' });

    let gapDisplay = null;
    if (baselinePrice && !isMasxmenos) {
        const gapAmount = product.price - baselinePrice;
        const gapPercent = (gapAmount / baselinePrice) * 100;
        gapDisplay = { amount: gapAmount, percent: gapPercent };
    }

    return (
        <div
            onClick={() => onSelect(allStores)}
            className={`bg-white p-0 flex flex-col transition-colors relative hover:bg-slate-50 cursor-pointer h-full`}
        >
            {/* Glow overlay on hover */}
            <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none ${theme.hoverBg}`}></div>

            <StoreBadge color={theme.badgeBg} text={product.store} />
            <DiscountBadge discount={product.discount} />

            <div className="p-4 h-32 flex items-center justify-center bg-white">
                <img src={product.image} className="h-full w-auto object-contain transition-transform group-hover:scale-105 group-hover:drop-shadow-sm" onError={handleImageError} />
            </div>
            <div className="p-4 flex-1 flex flex-col bg-slate-50 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mb-1">{product.name}</h3>
                <div className="mt-auto pt-2">
                    <p className={`text-lg font-extrabold mb-1 ${theme.priceText}`}>₡{(product.price/1).toLocaleString('es-CR')}</p>
                    
                    {gapDisplay && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${gapDisplay.amount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {gapDisplay.amount > 0 ? '+' : ''}₡{gapDisplay.amount.toLocaleString('es-CR')} ({gapDisplay.amount > 0 ? '+' : ''}{gapDisplay.percent.toFixed(1)}% vs MxM)
                        </div>
                    )}
                    {isMasxmenos && baselinePrice && storesCount(product) > 1 && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mb-2 bg-slate-200 text-slate-600">
                            Baseline Comparison
                        </div>
                    )}
                    
                    <UpcRow upc={product.upc} date={product.scrapedAt} />
                </div>
            </div>
        </div>
    );
};

const storesCount = (p) => p ? 2 : 1; // dummy helper to bypass empty warnings if needed.

// --- Helpers & Subcomponents ---

const calculateDiff = (product) => {
    const history = product.history || [];
    const todayPrice = product.price;
    let diffPercent = 0;
    let diffAmount = 0;

    if (history.length >= 2) {
        const yesterdayPrice = history[history.length - 2].price;
        diffAmount = todayPrice - yesterdayPrice;
        diffPercent = (diffAmount / yesterdayPrice) * 100;
    }
    return { diffAmount, diffPercent };
};

const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='100%25' height='100%25' fill='%23fefce8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23fcd34d'%3ENo Image%3C/text%3E%3C/svg%3E";
};

const StoreBadge = ({ color, text }) => (
    <div className={`absolute top-0 left-0 z-10 ${color} text-white text-[10px] font-bold px-3 py-1.5 rounded-br-2xl shadow-sm uppercase tracking-wider`}>
        {text}
    </div>
);

const DiscountBadge = ({ discount }) => discount ? (
    <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
        {discount} OFF
    </div>
) : null;

const ProductInfo = ({ product }) => (
    <div className="mb-2">
        <p className="text-orange-900/50 text-xs font-bold tracking-wider uppercase mb-1 flex justify-between">
            <span>{product.brand}</span>
            <span className="font-normal">{product.presentation}</span>
        </p>
        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 mb-1" title={product.name}>
            {product.name}
        </h3>
    </div>
);

const PriceRow = ({ price, diffAmount, diffPercent }) => (
    <div className="flex items-end justify-between mb-2">
        <div>
            <p className="text-slate-400 text-[10px] uppercase font-mono mb-0.5">Price</p>
            <div className="flex items-center gap-2">
                <p className="text-2xl font-mono text-slate-800 font-extrabold tracking-tight">
                    ₡{price.toLocaleString()}
                </p>
                {diffAmount !== 0 && (
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center ${diffAmount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {diffAmount > 0 ? '↑' : '↓'} {Math.abs(diffPercent).toFixed(0)}%
                    </div>
                )}
            </div>
        </div>
    </div>
);

const UpcRow = ({ upc, date }) => (
    <div 
        className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200 pt-2 font-medium mt-1"
        onClick={(e) => e.stopPropagation()}
    >
        <div className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 cursor-text select-text hover:border-blue-300">UPC: {upc}</div>
        <div>
            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
    </div>
);


export default ProductGrid;
