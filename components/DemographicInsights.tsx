import React from 'react';
import { DemographicInsights as DemographicInsightsType } from '@/types';

interface Props {
    demographics: DemographicInsightsType;
}

export default function DemographicInsights({ demographics }: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Demographic Insights</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Key company demographics that shape benefit needs and cost trends.</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Avg Age
                    </span>
                    <span className="text-[32px] font-bold text-gray-900">
                        {demographics.averageAge || 0}
                    </span>
                    <span className="text-[13px] text-gray-500 ml-1">years</span>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Avg Tenure
                    </span>
                    <span className="text-[32px] font-bold text-gray-900">
                        {demographics.averageTenure || 0}
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
                                style={{ width: `${(demographics.dependentCoverageRatio || 0) * 100}%` }}
                            />
                        </div>
                        <span className="text-[14px] font-bold text-gray-900 min-w-[3rem] text-right">
                            {((demographics.dependentCoverageRatio || 0) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <p className="text-[12px] text-gray-400 mt-2">
                        Percentage of employees enrolling dependents.
                    </p>
                </div>
            </div>
        </div>
    );
}
