import React from 'react';
import { FeedbackResponse } from '@/types';

interface Props {
    responses: FeedbackResponse[];
}

export default function FeedbackScoresPanel({ responses }: Props) {
    // Calculate average scores by category
    const categoryScores: Record<string, { total: number; count: number; avg: number }> = {};
    
    responses.forEach(response => {
        if (!categoryScores[response.category]) {
            categoryScores[response.category] = { total: 0, count: 0, avg: 0 };
        }
        categoryScores[response.category].total += response.score;
        categoryScores[response.category].count += 1;
    });

    Object.keys(categoryScores).forEach(category => {
        const data = categoryScores[category];
        data.avg = data.total / data.count;
    });

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'bg-green-50 text-green-700 border-green-200';
        if (score >= 3.5) return 'bg-brand-50 text-brand-700 border-brand-200';
        if (score >= 2.5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        return 'bg-red-50 text-red-700 border-red-200';
    };

    if (Object.keys(categoryScores).length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Scores by Category</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Average feedback scores organized by category.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-gray-500">No feedback data available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Scores by Category</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Average feedback scores organized by category.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryScores).map(([category, data]) => (
                    <div
                        key={category}
                        className={`border rounded-xl p-4 ${getScoreColor(data.avg)}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px] font-bold uppercase tracking-wider">{category}</span>
                            <span className="text-[20px] font-bold">{data.avg.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= data.avg ? 'fill-current' : 'text-transparent'}`}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-[11px] text-opacity-70 mt-1">{data.count} responses</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
