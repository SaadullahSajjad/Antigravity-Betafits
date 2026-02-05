import React from 'react';
import { FinancialKPIs } from '@/types';

interface Props {
    kpis: FinancialKPIs;
}

export default function FinancialBenchmarks({ kpis }: Props) {
    return (
        <div className="bg-brand-900 rounded-[28px] p-8 shadow-sm text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="mb-6">
                    <h2 className="text-[20px] font-bold mb-1">Financial Benchmarks</h2>
                    <p className="text-brand-400 text-[13px]">Cost performance relative to industry standards.</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <span className="text-[13px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                            PEPM Cost
                        </span>
                        <span className="text-[32px] font-bold text-white">
                            ${kpis.pepm.toLocaleString()}
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
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full filter blur-xl"></div>
            <div className="absolute bottom-0 left-10 w-32 h-32 bg-brand-500/20 rounded-full filter blur-2xl"></div>
        </div>
    );
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
