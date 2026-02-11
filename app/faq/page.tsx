import React from 'react';
import FAQ from '@/components/FAQ';
import { FAQ_DATA } from '@/constants';

export default function FAQPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-3">
                    Frequently Asked Questions
                </h1>
                <p className="text-[16px] text-gray-500 font-medium">
                    This portal is designed to guide you through benefits onboarding step by step. Below are answers to common questions about forms, documents, timelines, and how to complete required tasks.
                </p>
            </header>

            <FAQ categories={FAQ_DATA} />
        </div>
    );
}
