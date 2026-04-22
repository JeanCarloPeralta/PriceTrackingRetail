import React, { useState } from 'react';

const ProductTable = ({ products }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [visibleCount, setVisibleCount] = useState(100);

    // Reset pagination when the filter/search changes our products list
    React.useEffect(() => {
        setVisibleCount(100);
    }, [products]);

    const sortedProducts = React.useMemo(() => {
        let sortableItems = [...products];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Parse price for sorting (remove currency symbol ₡ and commas)
                if (sortConfig.key === 'price') {
                    aValue = parseFloat(String(aValue).replace(/[^0-9.]/g, ''));
                    bValue = parseFloat(String(bValue).replace(/[^0-9.]/g, ''));
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [products, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => requestSort('name')}>
                                Product {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => requestSort('brand')}>
                                Brand {sortConfig.key === 'brand' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4">UPC</th>
                            <th className="px-6 py-4">Pres.</th>
                            <th className="px-6 py-4 cursor-pointer hover:text-slate-900 transition-colors text-right" onClick={() => requestSort('price')}>
                                Price {sortConfig.key === 'price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 text-center">Img</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedProducts.length > 0 ? (
                            sortedProducts.slice(0, visibleCount).map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-200">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 max-w-xs truncate" title={product.name}>{product.name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{product.description}</div>
                                        {product.discount && <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">{product.discount}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{product.brand}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{product.upc}</td>
                                    <td className="px-6 py-4 text-slate-500">{product.presentation}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-base">
                                        {product.price}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center">
                                        <div className="h-10 w-10 rounded overflow-hidden border border-white/10 bg-white p-0.5">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-full w-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'%3ENo Img%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500 italic">
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {visibleCount < sortedProducts.length && (
                <div className="p-6 border-t border-slate-200 text-center">
                    <button 
                        onClick={() => setVisibleCount(v => v + 100)}
                        className="px-8 py-3 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-full shadow-sm hover:shadow-md hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
                    >
                        Load More Rows ({sortedProducts.length - visibleCount} remaining)
                        <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductTable;
