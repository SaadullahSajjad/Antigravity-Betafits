'use client';

import React, { useState } from 'react';
import { AvailableForm } from '@/types';

interface Props {
    forms: AvailableForm[];
}

const AvailableForms: React.FC<Props> = ({ forms }) => {
    const [selectedForm, setSelectedForm] = useState<AvailableForm | null>(null);

    const handleStartForm = (form: AvailableForm) => {
        // In a real implementation, this would trigger a modal or navigation
        console.log('Starting form:', form.name);
        setSelectedForm(form);
    };

    return (
        <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Available Forms
                </h2>
                <p className="text-[13px] text-gray-500 mt-0.5">
                    Optional forms you can request to initiate new workflows.
                </p>
            </div>

            <div className="space-y-4">
                {forms.map((form) => (
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
                            <p className="text-[12px] text-gray-500 max-w-lg">
                                {form.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                                    Est. Time
                                </span>
                                <span className="text-[13px] text-gray-700 font-medium">
                                    {form.estimatedTime}
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

            {/* Simple Modal Placeholder */}
            {selectedForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Start {selectedForm.name}?</h3>
                        <p className="text-[13px] text-gray-600 mb-6">
                            This will add the form to your assigned tasks. Expected completion time is {selectedForm.estimatedTime}.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedForm(null)}
                                className="px-4 py-2 border border-gray-200 rounded-md text-[13px] font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setSelectedForm(null)}
                                className="px-4 py-2 bg-brand-500 text-white rounded-md text-[13px] font-semibold hover:bg-brand-600 shadow-sm"
                            >
                                Confirm & Start
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AvailableForms;
