'use client';

import React from 'react';
import { BudgetBreakdown, DemographicInsights, FinancialKPIs } from '@/types';

interface Props {
    demographics: DemographicInsights;
    kpis: FinancialKPIs;
    breakdown: BudgetBreakdown[];
}

const BenefitsAnalysis: React.FC<Props> = ({ demographics, kpis, breakdown }) => {
    return (
        <div className="space-y-10">
            {/* Top Row: Demographics & KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workforce Demographics */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Workforce Demographics</h2>
                        <p className="text-[13px] text-gray-500 mt-0.5">Key population metrics impacting plan design.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm h-full">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                    Avg Age
                                </span>
                                <span className="text-[32px] font-bold text-gray-900">
                                    {demographics.averageAge}
                                </span>
                                <span className="text-[13px] text-gray-500 ml-1">years</span>
                            </div>
                            <div>
                                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                    Avg Tenure
                                </span>
                                <span className="text-[32px] font-bold text-gray-900">
                                    {demographics.averageTenure}
                                </span>
                                <span className="text-[13px] text-gray-500 ml-1">years</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                                    Dependency Ratio
                                </span>
                                <div className="flex items-center gap-4">
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className="bg-brand-500 h-3 rounded-full"
                                            style={{ width: `${demographics.dependentCoverageRatio * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[14px] font-bold text-gray-900 min-w-[3rem] text-right">
                                        {(demographics.dependentCoverageRatio * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-[12px] text-gray-400 mt-2">
                                    Percentage of employees enrolling dependents.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Financial Benchmarks */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Financial Benchmarks</h2>
                        <p className="text-[13px] text-gray-500 mt-0.5">Cost performance relative to industry standards.</p>
                    </div>
                    <div className="bg-brand-900 rounded-[28px] p-8 shadow-sm text-white relative overflow-hidden h-full">
                        <div className="relative z-10 grid grid-cols-2 gap-8">
                            <div>
                                <span className="text-[13px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                                    PEPM Cost
                                </span>
                                <span className="text-[32px] font-bold text-white">
                                    ${kpis.pepm}
                                </span>
                            </div>
                            <div>
                                <span className="text-[13px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                                    Annual Spend
                                </span>
                                <span className="text-[32px] font-bold text-white">
                                    ${(kpis.totalAnnualSpend / 1000000).toFixed(2)}M
                                </span>
                            </div>
                            <div>
                                <span className="text-[13px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                                    Employer Contrib.
                                </span>
                                <span className="text-[32px] font-bold text-white">
                                    {kpis.employerContributionPercentage}%
                                </span>
                            </div>
                            <div>
                                <span className="text-[13px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                                    Percentile
                                </span>
                                <span className="text-[32px] font-bold text-white">
                                    {getOrdinal(kpis.benchmarkPercentile)}
                                </span>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full filter blur-xl"></div>
                        <div className="absolute bottom-0 left-10 w-32 h-32 bg-brand-500/20 rounded-full filter blur-2xl"></div>
                    </div>
                </section>
            </div>

            {/* Budget Distribution */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Budget Distribution</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Breakdown of total benefits spend by category.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
                    {/* Bar Chart Visualization */}
                    <div className="flex h-12 w-full rounded-full overflow-hidden mb-8">
                        {breakdown.map((item) => (
                            <div
                                key={item.category}
                                className={`${item.color} h-full flex items-center justify-center text-white font-bold text-[13px] hover:opacity-90 transition-opacity cursor-pointer`}
                                style={{ width: `${item.percentage}%` }}
                                title={`${item.category}: $${item.amount.toLocaleString()}`}
                            >
                                {item.percentage > 5 && `${item.percentage}%`}
                            </div>
                        ))}
                    </div>

                    {/* Legend / Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {breakdown.map((item) => (
                            <div key={item.category} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className={`w-4 h-4 rounded-full mt-1 ${item.color}`} />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-[14px]">{item.category}</h4>
                                    <p className="text-[13px] text-gray-500 font-medium">
                                        ${item.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {item.percentage}% of total
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default BenefitsAnalysis;
