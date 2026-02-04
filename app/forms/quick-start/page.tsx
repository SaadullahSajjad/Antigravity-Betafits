'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuickStartForm from '@/components/forms/QuickStartForm';
import { FormValues } from '@/types/form';

export default function QuickStartFormPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSave = async (values: FormValues) => {
        // Mock save
        console.log('Saving progress:', values);
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        setSubmitError('');
        
        try {
            // Mock submit
            console.log('Submitting form:', values);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            setIsSuccess(true);
            
            // Redirect to dashboard after showing success message
            setTimeout(() => {
                router.push('/');
                router.refresh(); // Refresh to show updated form status
            }, 2000);
        } catch (error) {
            setSubmitError('Failed to submit form. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-gray-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">
                    Dashboard
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">Quick Start</span>
            </div>

            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                    Quick Start
                </h1>
                <p className="text-[16px] text-gray-500 font-medium">
                    Complete your organization profile to unlock better benefits recommendations.
                </p>
            </header>

            {/* Success Message */}
            {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-green-900 mb-1">Form Submitted Successfully!</h3>
                        <p className="text-sm text-green-700">Your form has been completed and submitted. Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-900 mb-1">Submission Failed</h3>
                        <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                    <button
                        onClick={() => setSubmitError('')}
                        className="flex-shrink-0 text-red-400 hover:text-red-600"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <QuickStartForm onSave={handleSave} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}
