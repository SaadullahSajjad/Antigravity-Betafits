'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PremiumsContributionStrategyForm from '@/components/forms/PremiumsContributionStrategyForm';
import { FormValues } from '@/types/form';

export default function PremiumsContributionStrategyFormPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('form_recdjXjySYuYUGkdP_progress');
        if (saved) {
            try {
                JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved progress:', e);
            }
        }
    }, []);

    const handleSave = async (values: FormValues) => {
        localStorage.setItem('form_recdjXjySYuYUGkdP_progress', JSON.stringify(values));
    };

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        setSubmitError('');
        
        try {
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: 'recdjXjySYuYUGkdP',
                    formName: 'Premiums / Contribution Strategy',
                    values,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem('form_recdjXjySYuYUGkdP_progress');
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/?formSubmitted=true');
                    router.refresh();
                }, 2000);
            } else {
                setSubmitError(data.message || data.error || 'Failed to submit form. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitError('An error occurred while submitting the form. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-gray-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">Premiums / Contribution Strategy</span>
            </div>

            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                    Premiums / Contribution Strategy
                </h1>
                <p className="text-[16px] text-gray-500 font-medium">
                    Please complete this form to proceed.
                </p>
            </header>

            {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-green-900 mb-1">Form Submitted Successfully!</h3>
                        <p className="text-sm text-green-700">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-900 mb-1">Submission Failed</h3>
                        <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                    <button onClick={() => setSubmitError('')} className="flex-shrink-0 text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <PremiumsContributionStrategyForm onSave={handleSave} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}
