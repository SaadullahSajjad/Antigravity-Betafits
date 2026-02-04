'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AssignedForm, FormStatus } from '@/types';

interface Props {
    forms: AssignedForm[];
}

const ITEMS_PER_PAGE = 4;

const AssignedForms: React.FC<Props> = ({ forms }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const getStatusStyle = (status: FormStatus) => {
        switch (status) {
            case FormStatus.COMPLETED:
                return 'bg-brand-50 text-brand-700 border-brand-100';
            case FormStatus.IN_PROGRESS:
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case FormStatus.SUBMITTED:
                return 'bg-gray-50 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-500 border-gray-200';
        }
    };

    const getFormRoute = (formId: string, formName: string, description: string): string => {
        // Check if form name includes "quick start"
        if (formName.toLowerCase().includes('quick start')) {
            return '/forms/quick-start';
        }
        // Check if description contains a URL
        if (description && description.trim() && !description.startsWith('?id=')) {
            // If description is a URL, use it
            if (description.startsWith('http://') || description.startsWith('https://')) {
                return description;
            }
            // If description starts with /, treat as internal route
            if (description.startsWith('/')) {
                return description;
            }
        }
        // Default: return form ID route (can be expanded later)
        return `/forms/${formId}`;
    };

    const totalPages = Math.ceil(forms.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentForms = forms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <section>
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        Assigned Forms
                    </h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                        Core tasks required for your enrollment profile.
                    </p>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-[12px] font-medium text-gray-600 min-w-[60px] text-center">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                {currentForms.map((form) => {
                    const formRoute = getFormRoute(form.id, form.name, form.description);
                    // Check if it's a valid route (not empty and not just company ID)
                    const isLink = formRoute !== '#' && 
                                   formRoute !== `/forms/${form.id}` && 
                                   !form.description.startsWith('?id=');
                    // Use a better description if current one is just an ID
                    const displayDescription = form.description && !form.description.startsWith('?id=')
                        ? form.description
                        : 'Complete this form to proceed with your enrollment.';

                    return (
                        <div
                            key={form.id}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors h-full"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-[15px]">
                                            {form.name}
                                        </h3>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getStatusStyle(form.status)}`}
                                        >
                                            {form.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2">
                                    {displayDescription}
                                </p>
                            </div>
                            {isLink ? (
                                formRoute.startsWith('http://') || formRoute.startsWith('https://') ? (
                                    <a href={formRoute} target="_blank" rel="noopener noreferrer">
                                        <button className="w-full mt-4 py-2.5 bg-brand-500 text-white rounded-md font-semibold text-[12px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]">
                                            {form.status === FormStatus.NOT_STARTED ? 'Start Form' : 'Continue'}
                                        </button>
                                    </a>
                                ) : (
                                    <Link href={formRoute}>
                                        <button className="w-full mt-4 py-2.5 bg-brand-500 text-white rounded-md font-semibold text-[12px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]">
                                            {form.status === FormStatus.NOT_STARTED ? 'Start Form' : 'Continue'}
                                        </button>
                                    </Link>
                                )
                            ) : (
                                <button
                                    className="w-full mt-4 py-2.5 bg-brand-500 text-white rounded-md font-semibold text-[12px] cursor-not-allowed opacity-50"
                                    disabled
                                >
                                    Coming Soon
                                </button>
                            )}
                        </div>
                    );
                })}
                {forms.length === 0 && (
                    <div className="md:col-span-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <p className="text-gray-500 font-medium">No forms currently assigned.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AssignedForms;
