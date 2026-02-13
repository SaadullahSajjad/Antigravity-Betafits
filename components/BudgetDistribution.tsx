import React from 'react';
import { BudgetBreakdown } from '@/types';

interface Props {
    breakdown: BudgetBreakdown[];
}

export default function BudgetDistribution({ breakdown }: Props) {
    if (breakdown.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Budget Distribution</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Breakdown of total benefits spend by category.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-gray-500">No budget data available at this time.</p>
                </div>
            </div>
        );
    }

    const total = breakdown.reduce((sum, b) => sum + b.monthlyTotal, 0);
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    
    const getBenefitColor = (benefit: string) => {
        if (benefit === 'Medical') return 'bg-brand-500';
        if (benefit === 'Dental') return 'bg-blue-500';
        return 'bg-amber-500';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Budget Distribution</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Breakdown of total benefits spend by category.</p>
            </div>
            {/* Bar Chart Visualization */}
            <div className="flex h-12 w-full rounded-full overflow-hidden mb-8 bg-gray-100">
                {breakdown.map((item, idx) => {
                    const percentage = total > 0 ? (item.monthlyTotal / total) * 100 : 0;
                    return (
                        <div
                            key={idx}
                            className={`${getBenefitColor(item.benefit)} h-full flex items-center justify-center text-white font-bold text-[13px] hover:opacity-90 transition-opacity cursor-pointer min-w-[2px]`}
                            style={{ width: `${percentage}%` }}
                            title={`${item.benefit}: ${formatCurrency(item.monthlyTotal)}`}
                        >
                            {percentage > 5 && `${percentage.toFixed(1)}%`}
                        </div>
                    );
                })}
            </div>

            {/* Legend / Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {breakdown.map((item, idx) => {
                    const percentage = total > 0 ? (item.monthlyTotal / total) * 100 : 0;
                    return (
                        <div
                            key={idx}
                            className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                            <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${getBenefitColor(item.benefit)}`} />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-gray-900 text-[14px] truncate">{item.benefit}</h4>
                                <p className="text-[13px] text-gray-500 font-medium">
                                    {formatCurrency(item.monthlyTotal)}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {percentage.toFixed(1)}% of total
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
