'use client';

import React, { useState } from 'react';
import CreateSurveyButton from './CreateSurveyButton';

interface Props {
    surveyUrl?: string;
    surveyFormUrl?: string;
}

export default function FeedbackCollectionCard({ surveyUrl, surveyFormUrl }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (surveyUrl) {
            navigator.clipboard.writeText(surveyUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenForm = () => {
        if (surveyFormUrl) {
            window.open(surveyFormUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-[18px] font-bold text-gray-900 mb-1">Feedback Collection</h3>
                <p className="text-[13px] text-gray-500">Distribute your unique survey link to employees to start gathering sentiment data.</p>
            </div>

            {surveyUrl ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded border border-green-200">
                            Active Survey
                        </span>
                    </div>
                    <div>
                        <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                            Survey URL
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={surveyUrl}
                                readOnly
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-mono text-gray-700"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-bold hover:bg-brand-700 transition-colors whitespace-nowrap"
                            >
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                    {surveyFormUrl && (
                        <button
                            onClick={handleOpenForm}
                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors"
                        >
                            Open Form
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-[14px] text-gray-500 mb-4">No active survey. Create a new survey to get started.</p>
                    <CreateSurveyButton variant="card" />
                </div>
            )}
        </div>
    );
}
