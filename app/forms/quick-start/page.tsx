'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuickStartForm from '@/components/forms/QuickStartForm';
import { FormValues } from '@/types/form';

export default function QuickStartFormPage() {
    const router = useRouter();

    const handleSave = async (values: FormValues) => {
        // Mock save
        console.log('Saving progress:', values);
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    const handleSubmit = async (values: FormValues) => {
        // Mock submit
        console.log('Submitting form:', values);
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/');
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

            <QuickStartForm onSave={handleSave} onSubmit={handleSubmit} />
        </div>
    );
}
