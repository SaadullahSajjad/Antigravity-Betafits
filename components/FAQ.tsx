'use client';

import React, { useState } from 'react';
import { FAQCategory } from '@/types';

interface Props {
    categories: FAQCategory[];
}

const FAQ: React.FC<Props> = ({ categories }) => {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    const handleContactSupport = () => {
        const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@betafits.com';
        window.location.href = `mailto:${supportEmail}?subject=Support Request - Portal Inquiry`;
    };

    return (
        <div className="space-y-8">
            <div className="max-w-3xl mx-auto space-y-12">
                {categories.map((category) => (
                    <section key={category.id}>
                        <h2 className="text-[18px] font-bold text-gray-900 tracking-tight mb-4 border-b border-gray-100 pb-2">
                            {category.title}
                        </h2>
                        <div className="space-y-4">
                            {category.items.map((item) => {
                                const isOpen = openItem === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden ${isOpen ? 'border-brand-200 shadow-md ring-1 ring-brand-100' : 'border-gray-200 shadow-sm hover:border-gray-300'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                        >
                                            <span className={`text-[15px] font-semibold ${isOpen ? 'text-brand-800' : 'text-gray-900'}`}>
                                                {item.question}
                                            </span>
                                            <span className={`ml-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </button>
                                        <div
                                            className={`transition-all duration-300 ease-in-out px-5 text-gray-600 text-[14px] leading-relaxed bg-gray-50/50 ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'
                                                }`}
                                        >
                                            <div className="pt-2 border-t border-gray-100 mt-2">
                                                {item.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            {/* Support Call-to-Action */}
            <div className="bg-brand-900 rounded-[24px] p-8 text-center text-white max-w-2xl mx-auto mt-12 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-[20px] font-bold mb-2">Still have questions?</h3>
                    <p className="text-brand-100 mb-6 font-medium">
                        Our support team is here to help you navigate your benefits packages.
                    </p>
                    <button 
                        onClick={handleContactSupport}
                        className="bg-white text-brand-900 px-6 py-2.5 rounded-full text-[14px] font-bold hover:bg-brand-50 transition-colors shadow-lg active:scale-95"
                    >
                        Contact Support
                    </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mt-10"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mb-16"></div>
            </div>
        </div>
    );
};

export default FAQ;
