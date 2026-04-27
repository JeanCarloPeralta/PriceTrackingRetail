import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from './components/StatsCard';
import ProductTable from './components/ProductTable';
import ProductGrid from './components/ProductGrid';
import UpcAudit from './components/UpcAudit';


// Import icons
const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const PieChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

const PriceTrackLogo = () => (
    <div className="relative flex items-center justify-center bg-blue-600 rounded-xl p-2 shadow-sm mr-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border-2 border-blue-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
    </div>
);

const Dashboard = () => {
    // Initial state empty, populate via fetch
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStore, setSelectedStore] = useState('All');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const [sortBy, setSortBy] = useState('name_asc');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Read from Live Cloud Firestore
            const querySnapshot = await getDocs(collection(db, "products"));
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push(doc.data());
            });
            
            if (data.length === 0) throw new Error('Firestore empty, falling back to local');
            
            const fixPresentation = (p) => {
                let presentation = p.presentation;
                if (!presentation || presentation === 'N/A') {
                    if (p.name.includes(' - ')) {
                        presentation = p.name.split(' - ').pop().trim();
                    } else {
                        const match = p.name.match(/(\d+(?:\.\d+)?\s*(?:mg|kg|ml|l|gr|g|oz|lb|pcs|unidades|unid|und|m|cm|mm|pz|pza|uds|ud))\s*$/i);
                        if (match) {
                            presentation = match[1];
                        } else {
                            presentation = 'N/A';
                        }
                    }
                }
                return { ...p, store: p.store || 'Walmart', presentation };
            };

            const fixedData = data.map(fixPresentation);
            setProducts(fixedData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch products from Firestore, attempting fallback:", error);
            try {
                const timestamp = new Date().getTime();
                const response = await fetch(`/data/products.json?t=${timestamp}`);
                const data = await response.json();
                
                const fixPresentation = (p) => {
                    let presentation = p.presentation;
                    if (!presentation || presentation === 'N/A') {
                        if (p.name.includes(' - ')) {
                            presentation = p.name.split(' - ').pop().trim();
                        } else {
                            const match = p.name.match(/(\d+(?:\.\d+)?\s*(?:mg|kg|ml|l|gr|g|oz|lb|pcs|unidades|unid|und|m|cm|mm|pz|pza|uds|ud))\s*$/i);
                            if (match) {
                                presentation = match[1];
                            } else {
                                presentation = 'N/A';
                            }
                        }
                    }
                    return { ...p, store: p.store || 'Walmart', presentation };
                };

                const fixedData = data.map(fixPresentation);
                setProducts(fixedData);
                setLastUpdated(new Date());
            } catch (fallbackError) {
                console.error("Fallback fetch also failed:", fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Debounce the search input so we don't freeze the UI on heavy re-renders
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Extract unique categories from breadcrumbs
    const allCategories = React.useMemo(() => {
        const cats = new Set();
        products.forEach(p => {
            if (p.breadcrumbs) {
                p.breadcrumbs.forEach(c => {
                    if (c !== 'Abarrotes') { // Exclude root department
                        cats.add(c);
                    }
                });
            }
        });
        return Array.from(cats).sort();
    }, [products]);

    const filteredProducts = React.useMemo(() => {
        let result = products;

        // Store Filter
        if (selectedStore !== 'All') {
            result = result.filter(p => p.store === selectedStore);
        }

        // Category Filter
        if (selectedCategory) {
            result = result.filter(p => p.breadcrumbs && p.breadcrumbs.includes(selectedCategory));
        }

        // Search Filter
        if (debouncedSearchQuery) {
            const searchTerms = debouncedSearchQuery.toLowerCase().split(' ').filter(Boolean);
            result = result.filter(p => {
                const nameMatch = searchTerms.every(term => p.name.toLowerCase().includes(term));
                const upcMatch = p.upc && p.upc.includes(debouncedSearchQuery);
                return nameMatch || upcMatch;
            });
        }

        // Sorting Logic
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name_desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'price_asc':
                    return parsePrice(a.price) - parsePrice(b.price);
                case 'price_desc':
                    return parsePrice(b.price) - parsePrice(a.price);
                case 'newest':
                    const dateA = new Date(a.scrapedAt || 0);
                    const dateB = new Date(b.scrapedAt || 0);
                    return dateB - dateA;
                case 'oldest':
                    const dateAOld = new Date(a.scrapedAt || 8640000000000000);
                    const dateBOld = new Date(b.scrapedAt || 8640000000000000);
                    return dateAOld - dateBOld;
                default:
                    return 0;
            }
        });

        return result;
    }, [products, selectedStore, selectedCategory, debouncedSearchQuery, sortBy]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setIsSearching(!!e.target.value);
    };

    const exportToCSV = () => {
        if (filteredProducts.length === 0) return;
        
        const headers = ["Tienda", "Nombre", "Marca", "Presentación", "UPC", "Precio", "URL"];
        const csvRows = filteredProducts.map(p => {
            return [
                `"${p.store || ''}"`,
                `"${(p.name || '').replace(/"/g, '""')}"`,
                `"${p.brand || ''}"`,
                `"${p.presentation || ''}"`,
                `"${p.upc || ''}"`,
                `"${(p.price || 0).toString().replace(/,/g, '')}"`,
                `"${p.link || ''}"`
            ].join(',');
        });
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'exportacion_dashboard.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalItems = filteredProducts.length;

    // Safe price parser helper
    const parsePrice = (priceVal) => {
        if (!priceVal) return 0;
        try {
            const clean = String(priceVal).replace(/[^0-9,]/g, '').replace(',', '.');
            const num = parseFloat(clean);
            return isNaN(num) ? 0 : num;
        } catch (e) {
            return 0;
        }
    };

    const totalBasketCost = filteredProducts.reduce((acc, curr) => {
        return acc + parsePrice(curr.price);
    }, 0);

    // Calculate Comparative Basket between Walmart and MaxMenos
    const comparativeData = React.useMemo(() => {
        const byUpc = {};
        filteredProducts.forEach(p => {
            if (!p.upc || p.upc === 'N/A') return;
            if (!byUpc[p.upc]) byUpc[p.upc] = {};
            byUpc[p.upc][p.store] = parsePrice(p.price);
        });

        let sumWalmart = 0;
        let sumMxM = 0;
        let count = 0;

        Object.values(byUpc).forEach(storePrices => {
            if (storePrices['Walmart'] && storePrices['Masxmenos']) {
                sumWalmart += storePrices['Walmart'];
                sumMxM += storePrices['Masxmenos'];
                count++;
            }
        });

        // Formula requested: -1 * ((X / Y) - 1) * 100; Where Y is Base (Masxmenos) and X is Competitor (Walmart)
        // If Walmart (X) is 110 and MxM (Y) is 100: (110 / 100) - 1 = 0.1 -> -1 * 0.1 * 100 = -10%. (Meaning Walmart is 10% more expensive).
        const share = sumMxM > 0 ? (-1 * ( (sumWalmart / sumMxM) - 1 ) * 100).toFixed(2) : 0;
        return { share, count, sumWalmart, sumMxM };
    }, [filteredProducts]);

    const basketShare = comparativeData.share;

    // Calculate previous basket cost (for trend)
    const previousBasketCost = filteredProducts.reduce((acc, curr) => {
        let prevPriceVal = 0;

        // If history exists, take the last entry
        if (curr.priceHistory && curr.priceHistory.length > 0) {
            const lastHistory = curr.priceHistory[curr.priceHistory.length - 1];
            prevPriceVal = parsePrice(lastHistory.price);
        } else {
            // No history, assume current price
            prevPriceVal = parsePrice(curr.price);
        }
        return acc + prevPriceVal;
    }, 0);

    const basketDiff = totalBasketCost - previousBasketCost;
    const basketTrend = previousBasketCost > 0
        ? ((basketDiff / previousBasketCost) * 100).toFixed(2)
        : 0;

    const averagePrice = totalItems > 0
        ? (totalBasketCost / totalItems).toFixed(0)
        : 0;

    // Calculate historical weekly timeline data for Recharts
    const weeklyChartData = React.useMemo(() => {
        if (!filteredProducts.length) return [];
        const datesSet = new Set();
        
        // Find all unique distinct dates where any scrape happened (ignoring dates before 2026-04-20)
        const cutoffDate = new Date('2026-04-20T00:00:00Z');
        filteredProducts.forEach(p => {
             if (p.scrapedAt) {
                 const d = new Date(p.scrapedAt);
                 if (d >= cutoffDate) datesSet.add(d.toISOString().split('T')[0]);
             }
             (p.priceHistory || []).forEach(h => {
                 if (h.date) {
                     const d = new Date(h.date);
                     if (d >= cutoffDate) datesSet.add(d.toISOString().split('T')[0]);
                 }
             });
        });
        const sortedDates = Array.from(datesSet).sort();

        // Accumulate basket cost on these specific dates
        return sortedDates.map(dateStr => {
             let dailyWalmart = 0;
             let dailyMxM = 0;

             filteredProducts.forEach(p => {
                  let activePrice = parsePrice(p.price); // default if no history found
                  
                  // Sort history chronologically just in case
                  const sortedHistory = (p.priceHistory || []).map(h => ({
                       ...h, d: new Date(h.date).toISOString().split('T')[0]
                  })).sort((a,b) => a.d.localeCompare(b.d));
                  
                  // Find the last recorded price on or before this snapshot date
                  const match = sortedHistory.slice().reverse().find(h => h.d <= dateStr);
                  if (match) {
                       activePrice = parsePrice(match.price);
                  } else if (sortedHistory.length > 0) {
                       // Snapshot is older than all history, fallback to oldest known
                       activePrice = parsePrice(sortedHistory[0].price);
                  }
                  
                  if (p.store === 'Walmart') dailyWalmart += activePrice;
                  if (p.store === 'Masxmenos') dailyMxM += activePrice;
             });
             
             // Formula: -1 * ((Walmart / MxM) - 1) * 100
             let gapPercent = 0;
             if (dailyMxM > 0 && dailyWalmart > 0) {
                 gapPercent = -1 * ((dailyWalmart / dailyMxM) - 1) * 100;
             }

             return {
                  // Interpret the date string at noon to avoid timezone shifts backwards
                  name: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  rawDate: dateStr,
                  gap: parseFloat(gapPercent.toFixed(2))
             };
        });
    }, [filteredProducts]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-8 selection:bg-blue-100">

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col gap-6 mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <PriceTrackLogo />
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Price Track
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 font-medium">
                                <span>Inteligencia de Retail</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Monitoreando: Walmart, Masxmenos y Auto Mercado
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 hidden md:flex">
                                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg transition-all text-sm font-bold ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Panel de Control</button>
                                <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-lg transition-all text-sm font-bold ${activeTab === 'audit' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Auditoría UPC</button>
                            </div>

                        </div>
                    </div>

                    {/* Search Bar & Filters */}
                    {activeTab === 'dashboard' && (
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Buscar por nombre de producto o UPC..."
                                className="bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-slate-900 focus:border-slate-900 block w-full pl-10 p-3.5 transition-all outline-none"
                            />
                        </div>

                        {/* Store Filter */}
                        <div className="relative min-w-[150px] w-full md:w-auto">
                            <select
                                value={selectedStore}
                                onChange={(e) => setSelectedStore(e.target.value)}
                                className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-4 appearance-none cursor-pointer"
                            >
                                <option value="All" className="bg-slate-800">Todas las Tiendas</option>
                                <option value="Walmart" className="bg-slate-800">Walmart</option>
                                <option value="Masxmenos" className="bg-slate-800">Masxmenos</option>
                                <option value="Auto Mercado" className="bg-slate-800">Auto Mercado</option>
                            </select>
                            {/* Chevron */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="relative min-w-[200px] w-full md:w-auto">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-4 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-800">Todas las Categorías</option>
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat} className="bg-slate-800 text-white">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {/* Chevron */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* Sort Filter */}
                        <div className="relative min-w-[180px] w-full md:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-blue-600/10 border border-blue-500/30 text-blue-700 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-4 appearance-none cursor-pointer"
                            >
                                <option value="name_asc">🔤 Nombre (A-Z)</option>
                                <option value="name_desc">🔤 Nombre (Z-A)</option>
                                <option value="price_asc">💰 Precio: Bajo a Alto</option>
                                <option value="price_desc">💰 Precio: Alto a Bajo</option>
                                <option value="newest">📅 Más Recientes</option>
                                <option value="oldest">📅 Más Antiguos</option>
                            </select>
                            {/* Chevron */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-blue-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* View Toggle (Only show if not searching/slot machine mode) */}
                        {!isSearching && (
                            <div className="bg-slate-800/50 p-1 rounded-xl flex items-center border border-slate-700 h-[54px]">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'} `}
                                    title="Vista de Cuadrícula"
                                >
                                    <GridIcon />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'} `}
                                    title="Vista de Lista"
                                >
                                    <ListIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    )}

                </header>

                {activeTab === 'audit' ? (
                    <UpcAudit products={products} />
                ) : (
                <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total de Productos"
                        value={totalItems}
                        icon={<BoxIcon />}
                        trend={12}
                    />
                    <StatsCard
                        title="Precio Promedio"
                        value={`₡${averagePrice}`} // Use Colones symbol
                        icon={<DollarIcon />}
                        trend={-2.5}
                    />
                    <StatsCard
                        title="Costo Total de Canasta"
                        value={`₡${totalBasketCost.toLocaleString('es-CR')}`}
                        icon={<div className="h-6 w-6"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>}
                        trend={parseFloat(basketTrend)}
                        trendValue={`₡${Math.abs(basketDiff).toLocaleString('es-CR')}`}
                    />
                    <StatsCard
                        title="MxM vs Walmart (Base)"
                        value={`${basketShare}%`}
                        icon={<PieChartIcon />}
                        trend={parseFloat(basketShare)}
                        trendValue={`Basado en ${comparativeData.count} artículos`}
                    />
                </div>

                {/* Timeline Chart */}
                {weeklyChartData.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        <div className="flex justify-between items-center mb-0">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 m-0 mt-1">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                Rendimiento Histórico de Brecha % (MxM vs Walmart)
                            </h3>
                            <button
                                onClick={() => setShowChart(!showChart)}
                                className="px-5 py-2 text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all flex items-center gap-2 active:scale-95"
                            >
                                {showChart ? (
                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg> Ocultar Línea de Tiempo</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg> Ver Línea de Tiempo</>
                                )}
                            </button>
                        </div>

                        {showChart && (
                        <div className="h-[300px] w-full pt-6 border-t border-slate-100 mt-6 animate-fadeIn">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontWeight: 600}} tickMargin={10} axisLine={false} tickLine={false} />
                                    <YAxis 
                                        stroke="#64748b" 
                                        tick={{fill: '#64748b', fontWeight: 600}} 
                                        axisLine={false} 
                                        tickLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', color: '#0f172a', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                        formatter={(val) => [`${val > 0 ? '+' : ''}${val}%`, 'Masxmenos Gap (vs Walmart)']}
                                    />
                                    <Line type="monotone" dataKey="gap" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        )}
                    </div>
                )}

                {/* Main Content */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                            Catálogo de Productos
                            {selectedCategory && <span className="text-sm font-normal text-slate-500 ml-2">({selectedCategory})</span>}
                            {isSearching && <span className="text-sm font-normal text-slate-500 ml-2">(Resultados de Búsqueda: {filteredProducts.length})</span>}
                        </h2>
                        
                        <button 
                            onClick={exportToCSV}
                            disabled={filteredProducts.length === 0}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${filteredProducts.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95 border border-emerald-100'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Exportar a CSV
                        </button>
                    </div>

                    {viewMode === 'grid' ? (
                        <ProductGrid products={filteredProducts} />
                    ) : (
                        <ProductTable products={filteredProducts} />
                    )}
                </section>
                </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
