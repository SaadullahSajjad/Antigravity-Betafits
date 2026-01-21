import React from 'react';
import BenefitPlans from '@/components/BenefitPlans';
import { BENEFIT_ELIGIBILITY, BENEFIT_PLANS, CONTRIBUTION_STRATEGIES } from '@/constants';

export default function BenefitPlansPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                    Benefit Plans
                </h1>
                <p className="text-[15px] text-gray-500 font-medium mt-1">
                    Review your organization's benefit plan configurations and eligibility rules.
                </p>
            </header>

            <BenefitPlans
                eligibility={BENEFIT_ELIGIBILITY}
                strategies={CONTRIBUTION_STRATEGIES}
                plans={BENEFIT_PLANS}
            />
        </div>
    );
}
