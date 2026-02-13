'use client';

import React from 'react';
import { FeedbackStats } from '@/types';
import CreateSurveyButton from './CreateSurveyButton';

interface Props {
    stats: FeedbackStats;
}

export default function FeedbackKPIs({ stats }: Props) {
    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'text-green-600';
        if (score >= 3.5) return 'text-brand-600';
        if (score >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Overall Rating
                </span>
                <div className="flex items-end gap-2">
                    <span className={`text-[32px] font-bold ${getScoreColor(stats.overall)}`}>
                        {stats.overall.toFixed(1)}
                    </span>
                    <span className="text-[13px] text-gray-400 mb-1.5">/ 5.0</span>
                </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Total Responses
                </span>
                <div className="flex items-end gap-2">
                    <span className="text-[32px] font-bold text-gray-900">
                        {stats.responses}
                    </span>
                </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Non-Medical Rating
                </span>
                <div className="flex items-end gap-2">
                    <span className={`text-[32px] font-bold ${getScoreColor(stats.nonMedical)}`}>
                        {stats.nonMedical.toFixed(1)}
                    </span>
                    <span className="text-[13px] text-gray-400 mb-1.5">/ 5.0</span>
                </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                <CreateSurveyButton variant="card" />
            </div>
        </div>
    );
}
