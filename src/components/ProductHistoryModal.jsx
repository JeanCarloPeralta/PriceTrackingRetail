import React from 'react';

const ProductHistoryModal = ({ products, onClose }) => {
    if (!products || products.length === 0) return null;

    // Name and brand will be universal across the comparison block
    const baseProduct = products[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{baseProduct.name}</h3>
                        <p className="text-blue-500 text-sm font-bold">{baseProduct.brand} - {baseProduct.presentation}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-900 transition-colors p-1 bg-white rounded-full border border-slate-200 shadow-sm"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(products.length, 3)} gap-6`}>
                        {products.map((product) => {
                            // Sort history newest first (reverse chronological)
                            const sortedHistory = [...(product.priceHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
                            
                            // Badge matching
                            const isWalmart = product.store === 'Walmart';
                            const isMasxmenos = product.store === 'Masxmenos';
                            const badgeColor = isWalmart ? 'bg-blue-600' : (isMasxmenos ? 'bg-orange-600' : 'bg-emerald-600');
                            const badgeText = isWalmart ? 'Walmart' : (isMasxmenos ? 'Masxmenos' : 'Auto Mercado');

                            return (
                                <div key={product.store} className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded ${badgeColor}`}>
                                            {badgeText}
                                        </span>
                                        <h4 className="text-xs uppercase text-slate-500 font-bold tracking-wider">Price History</h4>
                                    </div>

                                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white flex-1">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3 w-1/3">Date</th>
                                                    <th className="p-3 w-1/3 text-right">Price</th>
                                                    <th className="p-3 w-1/3 text-right">Change</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {sortedHistory.map((entry, index) => {
                                                    // Calculate diff vs previous entry
                                                    const prevEntry = sortedHistory[index + 1];
                                                    let diff = 0;
                                                    let diffPercent = 0;

                                                    if (prevEntry) {
                                                        diff = entry.price - prevEntry.price;
                                                        diffPercent = (diff / prevEntry.price) * 100;
                                                    }

                                                    return (
                                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-3 font-mono text-slate-500 font-medium">
                                                                {new Date(entry.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-3 text-right font-extrabold text-slate-900">
                                                                ₡{entry.price.toLocaleString()}
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                {index === sortedHistory.length - 1 ? (
                                                                    <span className="text-slate-400">-</span>
                                                                ) : diff > 0 ? (
                                                                    <span className="text-red-400 flex items-center justify-end gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                                                        {diffPercent.toFixed(1)}%
                                                                    </span>
                                                                ) : diff < 0 ? (
                                                                    <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                                                        {Math.abs(diffPercent).toFixed(1)}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400">0%</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {sortedHistory.length === 0 && (
                                            <p className="text-center text-slate-400 py-8 italic text-sm">No history available yet.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductHistoryModal;
