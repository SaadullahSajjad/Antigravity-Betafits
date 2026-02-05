import React from 'react';
import { BenefitEligibilityData } from '@/types';

interface Props {
    eligibility: BenefitEligibilityData;
}

export default function BenefitEligibilityCard({ eligibility }: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Eligibility Rules</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Configuration for employee benefit eligibility.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Waiting Period
                    </span>
                    <div className="text-[16px] font-bold text-gray-900 bg-brand-50 inline-block px-4 py-2 rounded-lg text-brand-700">
                        {eligibility.waitingPeriod}
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Min Hours / Week
                    </span>
                    <div className="text-[16px] font-bold text-gray-900 bg-brand-50 inline-block px-4 py-2 rounded-lg text-brand-700">
                        {eligibility.minHoursPerWeek} Hours
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Effective Date Rule
                    </span>
                    <div className="text-[16px] font-medium text-gray-900">
                        {eligibility.effectiveDateRule}
                    </div>
                </div>
            </div>
        </div>
    );
}
