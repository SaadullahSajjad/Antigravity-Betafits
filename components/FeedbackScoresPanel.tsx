'use client';

import React from 'react';
import { FeedbackResponse } from '@/types';

interface Props {
    responses: FeedbackResponse[];
}

export default function FeedbackScoresPanel({ responses }: Props) {
    // Group by tier instead of category
    const tierScores: Record<string, { total: number; count: number; avg: number }> = {};

    responses.forEach(response => {
        if (!tierScores[response.tier]) {
            tierScores[response.tier] = { total: 0, count: 0, avg: 0 };
        }
        tierScores[response.tier].total += response.overallRating;
        tierScores[response.tier].count += 1;
    });

    Object.keys(tierScores).forEach(tier => {
        tierScores[tier].avg = tierScores[tier].total / tierScores[tier].count;
    });

    const sortedTiers = Object.entries(tierScores).sort((a, b) => b[1].avg - a[1].avg);

    if (sortedTiers.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Scores by Tier</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Average ratings grouped by coverage tier.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-gray-500">No feedback data available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Scores by Tier</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Average ratings grouped by coverage tier.</p>
            </div>
            <div className="space-y-4">
                {sortedTiers.map(([tier, data]) => (
                    <div key={tier} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[14px] font-semibold text-gray-900">{tier}</span>
                                <span className="text-[14px] font-bold text-gray-700">{data.avg.toFixed(1)}/5.0</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(data.avg / 5) * 100}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">{data.count} response{data.count !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
