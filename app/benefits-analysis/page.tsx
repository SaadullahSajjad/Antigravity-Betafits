import React from 'react';
import BenefitsAnalysis from '@/components/BenefitsAnalysis';
import { BENEFITS_DEMOGRAPHICS, BENEFITS_KPIS, BUDGET_BREAKDOWN } from '@/constants';

export default function BenefitsAnalysisPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                    Benefits Analysis
                </h1>
                <p className="text-[15px] text-gray-500 font-medium mt-1">
                    Strategic overview of your workforce demographics and financial performance.
                </p>
            </header>

            <BenefitsAnalysis
                demographics={BENEFITS_DEMOGRAPHICS}
                kpis={BENEFITS_KPIS}
                breakdown={BUDGET_BREAKDOWN}
            />
        </div>
    );
}
