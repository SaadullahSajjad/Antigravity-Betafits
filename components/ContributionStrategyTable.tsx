import React from 'react';
import { ContributionStrategy } from '@/types';

interface Props {
    strategies: ContributionStrategy[];
}

export default function ContributionStrategyTable({ strategies }: Props) {
    if (strategies.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Contribution Strategy</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Displays how employer contributions are structured by strategy type, amount, and plan level across medical, dental, and vision benefits.</p>
                </div>
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="text-[14px] text-gray-500 font-medium">No results found. Please adjust your filter.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Contribution Strategy</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Displays how employer contributions are structured by strategy type, amount, and plan level across medical, dental, and vision benefits.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-white uppercase tracking-wider bg-brand-500">
                                Benefit
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-white uppercase tracking-wider bg-brand-500">
                                Strategy Type
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-white uppercase tracking-wider bg-brand-500">
                                Flat Amount
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-white uppercase tracking-wider bg-brand-500">
                                EE Percent
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {strategies.map((strategy, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 text-[14px] font-semibold text-gray-900">
                                    {strategy.benefit}
                                </td>
                                <td className="py-4 px-4 text-[14px] text-gray-600">
                                    {strategy.strategyType}
                                </td>
                                <td className="py-4 px-4 text-[14px] text-gray-600">
                                    {strategy.flatAmount || '-'}
                                </td>
                                <td className="py-4 px-4 text-[14px] text-gray-600">
                                    {strategy.eePercent || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
