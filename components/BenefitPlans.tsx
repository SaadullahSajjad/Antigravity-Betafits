'use client';

import React from 'react';
import { BenefitEligibilityData, BenefitPlan, ContributionStrategy } from '@/types';

interface Props {
    eligibility: BenefitEligibilityData;
    strategies: ContributionStrategy[];
    plans: BenefitPlan[];
}

const BenefitPlans: React.FC<Props> = ({ eligibility, strategies, plans }) => {
    return (
        <div className="space-y-10">
            {/* Eligibility Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Eligibility Rules</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Configuration for employee benefit eligibility.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
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
            </section>

            {/* Contribution Strategies */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Contribution Strategies</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Defined employer contribution levels by employee group.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {strategies.map((strategy) => (
                        <div key={strategy.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-brand-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[16px] font-bold text-gray-900">{strategy.employeeType}</h3>
                                <span className="bg-green-50 text-green-700 text-[12px] font-bold px-3 py-1 rounded-full">
                                    {strategy.employerContribution} Covered
                                </span>
                            </div>
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                                {strategy.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefit Plans */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Plans</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Current benefit plans available for enrollment.</p>
                </div>
                <div className="space-y-4">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                        {plan.type}
                                    </div>
                                    <div>
                                        <h3 className="text-[18px] font-bold text-gray-900">{plan.name}</h3>
                                        <p className="text-[13px] text-gray-500 font-medium">
                                            {plan.carrier} • {plan.network}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6 md:gap-12">
                                    <div>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            Deductible
                                        </span>
                                        <span className="text-[15px] font-semibold text-gray-900">
                                            {plan.deductible}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            Max OOP
                                        </span>
                                        <span className="text-[15px] font-semibold text-gray-900">
                                            {plan.outOfPocketMax}
                                        </span>
                                    </div>
                                    {plan.copay && (
                                        <div>
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                                Copay
                                            </span>
                                            <span className="text-[15px] font-semibold text-gray-900">
                                                {plan.copay}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BenefitPlans;
