'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface CreateSurveyButtonProps {
    variant?: 'header' | 'card';
}

export default function CreateSurveyButton({ variant = 'header' }: CreateSurveyButtonProps) {
    const router = useRouter();

    const handleOpenSurveyForm = () => {
        // Navigate to the React form page for Benefits Feedback Form (Fillout template ID: eQ7FVU76PDus)
        router.push('/forms/eq7fvu76pdus');
    };

    if (variant === 'card') {
        return (
            <button
                onClick={handleOpenSurveyForm}
                className="w-full bg-brand-500 text-white rounded-lg py-3 px-4 font-bold text-[14px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>OPEN FORM</span>
            </button>
        );
    }

    // Header variant
    return (
        <button 
            onClick={handleOpenSurveyForm}
            className="bg-brand-500 text-white px-4 py-2 rounded-md font-semibold text-[13px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]"
        >
            Open Form
        </button>
    );
}
