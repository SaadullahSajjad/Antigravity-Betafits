'use client';

import React, { useState } from 'react';
import { FAQCategory } from '@/types';

interface Props {
    categories: FAQCategory[];
}

export default function FAQAccordion({ categories }: Props) {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            {categories.map((category, catIdx) => (
                <section key={catIdx}>
                    <h2 className="text-[18px] font-bold text-gray-900 tracking-tight mb-4 border-b border-gray-100 pb-2">
                        {category.title}
                    </h2>
                    <div className="space-y-4">
                        {category.items.map((item, itemIdx) => {
                            const itemId = `${catIdx}-${itemIdx}`;
                            const isOpen = openItem === itemId;
                            return (
                                <div
                                    key={itemId}
                                    className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden ${
                                        isOpen ? 'border-brand-200 shadow-md ring-1 ring-brand-100' : 'border-gray-200 shadow-sm hover:border-gray-300'
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleItem(itemId)}
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
                                        className={`transition-all duration-300 ease-in-out px-5 text-gray-600 text-[14px] leading-relaxed bg-gray-50/50 ${
                                            isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'
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
    );
}
