'use client';

import React from 'react';
import { BudgetBreakdown } from '@/types';

interface Props {
    breakdown: BudgetBreakdown[];
}

export default function BudgetBreakdownTable({ breakdown }: Props) {
    if (breakdown.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Budget Breakdown</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Detailed breakdown of budget by benefit type.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-gray-500">No budget breakdown data available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Budget Breakdown</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Detailed breakdown of budget by benefit type.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Benefit
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Carrier
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Monthly Total
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Annual Total
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                ER Cost/Month
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                EE Cost/Month
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {breakdown.map((item, idx) => {
                            const formatCurrency = (val: number) => 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
                            
                            const getBenefitColor = (benefit: string) => {
                                if (benefit === 'Medical') return 'bg-brand-500';
                                if (benefit === 'Dental') return 'bg-blue-500';
                                return 'bg-amber-500';
                            };
                            
                            return (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getBenefitColor(item.benefit)}`} />
                                            <span className="text-[15px] font-semibold text-gray-900">{item.benefit}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-[15px] font-medium text-gray-600">
                                        {item.carrier}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-gray-900">
                                        {formatCurrency(item.monthlyTotal)}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-gray-900">
                                        {formatCurrency(item.annualTotal)}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-brand-600">
                                        {formatCurrency(item.erCostMonth)}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-blue-600">
                                        {formatCurrency(item.eeCostMonth)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
