import React from 'react';
import { ContributionStrategy } from '@/types';

interface Props {
    strategies: ContributionStrategy[];
}

export default function ContributionStrategyTable({ strategies }: Props) {
    if (strategies.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Contribution Strategies</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Defined employer contribution levels by employee group.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-gray-500">No contribution strategies configured.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Contribution Strategies</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Defined employer contribution levels by employee group.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Employee Type
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Employer Contribution
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {strategies.map((strategy) => (
                            <tr key={strategy.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 text-[15px] font-semibold text-gray-900">
                                    {strategy.employeeType}
                                </td>
                                <td className="py-4 px-4">
                                    <span className="bg-green-50 text-green-700 text-[13px] font-bold px-3 py-1 rounded-full">
                                        {strategy.employerContribution}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-[14px] text-gray-600">
                                    {strategy.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
