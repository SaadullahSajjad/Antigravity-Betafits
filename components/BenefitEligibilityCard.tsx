import React from 'react';
import { BenefitEligibilityData } from '@/types';

interface Props {
    eligibility: BenefitEligibilityData;
}

export default function BenefitEligibilityCard({ eligibility }: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Eligibility Rules</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Configuration for employee benefit eligibility.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Benefit Class
                    </span>
                    <div className="text-[16px] font-bold text-gray-900 bg-brand-50 inline-block px-4 py-2 rounded-lg text-brand-700">
                        {eligibility.className || '-'}
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Waiting Period
                    </span>
                    <div className="text-[16px] font-bold text-gray-900 bg-brand-50 inline-block px-4 py-2 rounded-lg text-brand-700">
                        {eligibility.waitingPeriod || '-'}
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Effective Date
                    </span>
                    <div className="text-[16px] font-bold text-gray-900 bg-brand-50 inline-block px-4 py-2 rounded-lg text-brand-700">
                        {eligibility.effectiveDate || '-'}
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Required Hours
                    </span>
                    <div className="text-[16px] font-bold text-gray-900 bg-brand-50 inline-block px-4 py-2 rounded-lg text-brand-700">
                        {eligibility.requiredHours || '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}
