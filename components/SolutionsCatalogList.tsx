'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Solution, SolutionCategory } from '@/types';

interface Props {
    solutions: Solution[];
}

const CATEGORIES = [
    'All Solutions',
    '401(k)',
    'Analytics',
    'Ancillary',
    'Apps / Navigation',
    'COBRA / HRA / FSA',
    'HCM / Payroll',
    'HSA',
    'Lifestyle',
    'National Carriers',
    'PBM',
];

export default function SolutionsCatalogList({ solutions }: Props) {
    const [filter, setFilter] = useState<string>('All Solutions');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredSolutions = solutions.filter(solution => {
        const matchesCategory = filter === 'All Solutions' || solution.category === filter;
        const matchesSearch = searchQuery === '' || 
            solution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            solution.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            solution.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8">
            {/* Search Input */}
            <div>
                <input
                    type="text"
                    placeholder="Type here to search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${
                            filter === cat
                                ? 'bg-brand-900 text-white shadow-md'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Solutions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions.map((solution) => (
                    <Link href={`/solutions/${solution.id}`} key={solution.id} className="group cursor-pointer">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                {solution.logoUrl ? (
                                    <img
                                        src={solution.logoUrl}
                                        alt={solution.name}
                                        className="w-12 h-12 object-contain rounded-xl"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[18px] font-bold text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                        {solution.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-[12px] font-bold">
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    {solution.rating}
                                </div>
                            </div>

                            <div className="mb-2">
                                <span className="inline-block bg-brand-50 text-brand-700 text-[11px] font-bold px-2 py-1 rounded border border-brand-200 mb-2">
                                    {solution.category}
                                </span>
                            </div>

                            <h3 className="text-[18px] font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">
                                {solution.name}
                            </h3>
                            <p className="text-[14px] text-gray-500 leading-relaxed mb-4 flex-grow line-clamp-2">
                                {solution.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {solution.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="bg-gray-50 text-gray-600 text-[11px] font-semibold px-2 py-1 rounded border border-gray-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <span className="text-[13px] font-bold text-brand-600 group-hover:text-brand-700">
                                    View Profile →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredSolutions.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p>No solutions found in this category.</p>
                </div>
            )}
        </div>
    );
}
