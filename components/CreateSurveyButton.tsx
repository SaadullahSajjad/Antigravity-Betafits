'use client';

import React, { useState } from 'react';

interface CreateSurveyButtonProps {
    variant?: 'header' | 'card';
}

export default function CreateSurveyButton({ variant = 'header' }: CreateSurveyButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [surveyTitle, setSurveyTitle] = useState('');
    const [surveyDescription, setSurveyDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleCreateSurvey = async () => {
        if (!surveyTitle.trim()) {
            setError('Survey title is required');
            return;
        }

        setIsCreating(true);
        setError('');
        
        try {
            const response = await fetch('/api/surveys/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: surveyTitle,
                    description: surveyDescription,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Close modal and refresh after 2 seconds
                setTimeout(() => {
                    setIsModalOpen(false);
                    setSurveyTitle('');
                    setSurveyDescription('');
                    setSuccess(false);
                    // Refresh the page to show new survey
                    window.location.reload();
                }, 2000);
            } else {
                setError(data.error || 'Failed to create survey. Please try again.');
            }
        } catch (error) {
            console.error('Error creating survey:', error);
            setError('An error occurred while creating the survey. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    if (variant === 'card') {
        return (
            <>
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-50 border border-brand-100 rounded-xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-brand-100 transition-colors group"
                >
                    <div className="w-10 h-10 bg-brand-200 text-brand-700 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-[13px] font-bold text-brand-800 uppercase tracking-wider">
                        New Survey
                    </span>
                </div>

                {/* Create Survey Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Survey</h3>
                            
                            {success ? (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-bold text-green-900 mb-1">Survey Created Successfully!</h4>
                                        <p className="text-sm text-green-700">Your survey has been created. Refreshing page...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 space-y-4">
                                        <div>
                                            <label htmlFor="survey-title" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Survey Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="survey-title"
                                                type="text"
                                                value={surveyTitle}
                                                onChange={(e) => setSurveyTitle(e.target.value)}
                                                placeholder="Enter survey title"
                                                required
                                                className="w-full px-4 py-3 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border border-gray-200 focus:ring-1 focus:ring-[#97C25E]/50"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="survey-description" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                id="survey-description"
                                                value={surveyDescription}
                                                onChange={(e) => setSurveyDescription(e.target.value)}
                                                placeholder="Enter survey description"
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border border-gray-200 focus:ring-1 focus:ring-[#97C25E]/50 resize-none"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSurveyTitle('');
                                        setSurveyDescription('');
                                        setError('');
                                        setSuccess(false);
                                    }}
                                    disabled={isCreating || success}
                                    className="px-4 py-2 border border-gray-200 rounded-md text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {success ? 'Close' : 'Cancel'}
                                </button>
                                {!success && (
                                    <button
                                        onClick={handleCreateSurvey}
                                        disabled={isCreating || !surveyTitle.trim()}
                                        className="px-4 py-2 bg-[#97C25E] hover:bg-[#8bb356] text-white rounded-md text-[13px] font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isCreating ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Survey'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Header variant
    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-500 text-white px-4 py-2 rounded-md font-semibold text-[13px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]"
            >
                Create Survey
            </button>

            {/* Create Survey Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Survey</h3>
                        
                        {success ? (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-sm font-bold text-green-900 mb-1">Survey Created Successfully!</h4>
                                    <p className="text-sm text-green-700">Your survey has been created. Refreshing page...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 space-y-4">
                                    <div>
                                        <label htmlFor="survey-title-header" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Survey Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="survey-title-header"
                                            type="text"
                                            value={surveyTitle}
                                            onChange={(e) => setSurveyTitle(e.target.value)}
                                            placeholder="Enter survey title"
                                            required
                                            className="w-full px-4 py-3 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border border-gray-200 focus:ring-1 focus:ring-[#97C25E]/50"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="survey-description-header" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            id="survey-description-header"
                                            value={surveyDescription}
                                            onChange={(e) => setSurveyDescription(e.target.value)}
                                            placeholder="Enter survey description"
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border border-gray-200 focus:ring-1 focus:ring-[#97C25E]/50 resize-none"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSurveyTitle('');
                                    setSurveyDescription('');
                                    setError('');
                                    setSuccess(false);
                                }}
                                disabled={isCreating || success}
                                className="px-4 py-2 border border-gray-200 rounded-md text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {success ? 'Close' : 'Cancel'}
                            </button>
                            {!success && (
                                <button
                                    onClick={handleCreateSurvey}
                                    disabled={isCreating || !surveyTitle.trim()}
                                    className="px-4 py-2 bg-[#97C25E] hover:bg-[#8bb356] text-white rounded-md text-[13px] font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Survey'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
