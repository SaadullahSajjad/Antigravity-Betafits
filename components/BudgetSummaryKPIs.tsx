import React from 'react';
import { FinancialKPIs } from '@/types';

interface Props {
    kpis: FinancialKPIs;
}

export default function BudgetSummaryKPIs({ kpis }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    PEPM Cost
                </span>
                <span className="text-[32px] font-bold text-gray-900">
                    ${kpis.pepm.toLocaleString()}
                </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Annual Spend
                </span>
                <span className="text-[32px] font-bold text-gray-900">
                    ${(kpis.totalAnnualSpend / 1000000).toFixed(2)}M
                </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Employer Contrib.
                </span>
                <span className="text-[32px] font-bold text-gray-900">
                    {kpis.employerContributionPercentage}%
                </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Percentile
                </span>
                <span className="text-[32px] font-bold text-gray-900">
                    {getOrdinal(kpis.benchmarkPercentile)}
                </span>
            </div>
        </div>
    );
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
