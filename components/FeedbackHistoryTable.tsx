'use client';

import React from 'react';
import { FeedbackResponse } from '@/types';

interface Props {
    responses: FeedbackResponse[];
}

export default function FeedbackHistoryTable({ responses }: Props) {
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'negative':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (responses.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Feedback History</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Full history of survey responses.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-gray-500">No feedback history available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Feedback History</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Full history of survey responses.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Score
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Sentiment
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                                Comment
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {responses.map((response) => (
                            <tr key={response.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 text-[14px] text-gray-900 tabular-nums">
                                    {response.date}
                                </td>
                                <td className="py-4 px-4 text-[14px] font-medium text-gray-900">
                                    {response.category}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-3.5 h-3.5 ${star <= response.score ? 'text-yellow-400' : 'text-gray-200'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2 text-[13px] font-semibold text-gray-700">{response.score}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getSentimentColor(response.sentiment)}`}>
                                        {response.sentiment}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-[14px] text-gray-600 max-w-md">
                                    <p className="truncate" title={response.comment}>
                                        {response.comment}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
