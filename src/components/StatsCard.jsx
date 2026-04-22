import React from 'react';

const StatsCard = ({ title, value, icon, trend, trendValue }) => {
    return (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 mb-2 group-hover:scale-105 transition-transform origin-left">{value}</h3>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl text-slate-600 transition-all border border-slate-200">
                    {icon}
                </div>
            </div>
            {trend !== undefined && (
                <div className="mt-2 flex items-center text-sm">
                    <span className={`${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} px-2 py-0.5 rounded-md font-bold flex items-center gap-1`}>
                        {trendValue && <span>{trend > 0 ? '+' : ''}{trendValue}</span>}
                        <span>({trend > 0 ? '+' : ''}{trend}%)</span>
                    </span>
                    <span className="text-slate-400 ml-2 font-medium">vs past week</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
