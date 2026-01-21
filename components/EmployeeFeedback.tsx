'use client';

import React from 'react';
import { FeedbackResponse, FeedbackStats } from '@/types';

interface Props {
    stats: FeedbackStats;
    responses: FeedbackResponse[];
}

const EmployeeFeedback: React.FC<Props> = ({ stats, responses }) => {
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return 'bg-green-50 text-green-700 border-green-100';
            case 'negative':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'text-green-600';
        if (score >= 3.5) return 'text-brand-600';
        if (score >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-10">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                        Avg Score
                    </span>
                    <div className="flex items-end gap-2">
                        <span className={`text-[32px] font-bold ${getScoreColor(stats.averageScore)}`}>
                            {stats.averageScore}
                        </span>
                        <span className="text-[13px] text-gray-400 mb-1.5">/ 5.0</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                        Participation
                    </span>
                    <div className="flex items-end gap-2">
                        <span className="text-[32px] font-bold text-gray-900">
                            {stats.participationRate}%
                        </span>
                        <span className="text-[13px] text-green-600 font-semibold mb-1.5 flex items-center">
                            <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            2%
                        </span>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                        Total Responses
                    </span>
                    <div className="text-[32px] font-bold text-gray-900">
                        {stats.totalResponses}
                    </div>
                </div>
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-brand-100 transition-colors group">
                    <div className="w-10 h-10 bg-brand-200 text-brand-700 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-[13px] font-bold text-brand-800 uppercase tracking-wider">
                        New Survey
                    </span>
                </div>
            </div>

            {/* Recent Responses */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Feedback</h2>
                        <p className="text-[13px] text-gray-500 mt-0.5">Latest comments from your team.</p>
                    </div>
                    <button className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
                        View All
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {responses.map((response) => (
                        <div key={response.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-gray-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getSentimentColor(response.sentiment)}`}>
                                        {response.sentiment}
                                    </span>
                                    <span className="text-[12px] text-gray-400 font-medium">
                                        {response.category}
                                    </span>
                                </div>
                                <span className="text-[12px] text-gray-400 tabular-nums">
                                    {response.date}
                                </span>
                            </div>
                            <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                                "{response.comment}"
                            </p>
                            <div className="mt-4 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        className={`w-4 h-4 ${star <= response.score ? 'text-yellow-400' : 'text-gray-200'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EmployeeFeedback;
