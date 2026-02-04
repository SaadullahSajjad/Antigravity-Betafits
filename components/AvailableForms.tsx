'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AvailableForm } from '@/types';

interface Props {
    forms: AvailableForm[];
}

const ITEMS_PER_PAGE = 5;

const AvailableForms: React.FC<Props> = ({ forms }) => {
    const router = useRouter();
    const [selectedForm, setSelectedForm] = useState<AvailableForm | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignError, setAssignError] = useState('');
    const [assignSuccess, setAssignSuccess] = useState(false);

    const handleStartForm = (form: AvailableForm) => {
        setSelectedForm(form);
        setAssignError('');
        setAssignSuccess(false);
    };

    const handleConfirmAssign = async () => {
        if (!selectedForm) return;

        setIsAssigning(true);
        setAssignError('');

        try {
            const response = await fetch('/api/forms/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: selectedForm.id,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setAssignSuccess(true);
                // Close modal and refresh after 1.5 seconds
                // Add a small delay to allow Airtable to process the record
                setTimeout(() => {
                    setSelectedForm(null);
                    setAssignSuccess(false);
                    // Use router.refresh() first to re-fetch server data, then hard reload
                    router.refresh();
                    // Force a hard reload after a brief moment to ensure fresh data
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 300);
                }, 1500);
            } else {
                setAssignError(data.error || 'Failed to assign form. Please try again.');
            }
        } catch (error) {
            console.error('Error assigning form:', error);
            setAssignError('An error occurred while assigning the form. Please try again.');
        } finally {
            setIsAssigning(false);
        }
    };

    const totalPages = Math.ceil(forms.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentForms = forms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        Available Forms
                    </h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                        Optional forms you can request to initiate new workflows.
                    </p>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-1.5 rounded-lg border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-[12px] font-medium text-gray-500 min-w-[80px] text-center">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-1.5 rounded-lg border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4 min-h-[300px]">
                {currentForms.map((form) => (
                    <div
                        key={form.id}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:border-gray-200 transition-all"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[14px] font-semibold text-gray-900">
                                    {form.name}
                                </h3>
                                <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                    {form.category}
                                </span>
                            </div>
                            <p className="text-[12px] text-gray-500 max-w-lg line-clamp-1">
                                {form.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                                    Est. Time
                                </span>
                                <span className="text-[13px] text-gray-700 font-medium">
                                    {form.estimatedTime?.trim() || 'N/A'}
                                </span>
                            </div>
                            <button
                                onClick={() => handleStartForm(form)}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-[12px] font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98]"
                            >
                                Start
                            </button>
                        </div>
                    </div>
                ))}
                {forms.length === 0 && (
                    <p className="text-[13px] text-gray-500 text-center py-4">
                        No additional forms available at this time.
                    </p>
                )}
            </div>

            {/* Assign Form Modal */}
            {selectedForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Start {selectedForm.name}?</h3>
                        
                        {assignSuccess ? (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-sm font-bold text-green-900 mb-1">Form Assigned Successfully!</h4>
                                    <p className="text-sm text-green-700">The form has been added to your assigned tasks. Refreshing page...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-[13px] text-gray-600 mb-6">
                                    This will add the form to your assigned tasks.{' '}
                                    {selectedForm.estimatedTime?.trim() ? (
                                        <>Expected completion time is <strong>{selectedForm.estimatedTime}</strong>.</>
                                    ) : (
                                        'Expected completion time is not specified.'
                                    )}
                                </p>

                                {assignError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {assignError}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setSelectedForm(null);
                                    setAssignError('');
                                    setAssignSuccess(false);
                                }}
                                disabled={isAssigning || assignSuccess}
                                className="px-4 py-2 border border-gray-200 rounded-md text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {assignSuccess ? 'Close' : 'Cancel'}
                            </button>
                            {!assignSuccess && (
                                <button
                                    onClick={handleConfirmAssign}
                                    disabled={isAssigning}
                                    className="px-4 py-2 bg-brand-500 text-white rounded-md text-[13px] font-semibold hover:bg-brand-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isAssigning ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Assigning...
                                        </>
                                    ) : (
                                        'Confirm & Start'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AvailableForms;
