'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Solution } from '@/types';

interface Props {
    solutions: Solution[];
}

const SolutionsCatalog: React.FC<Props> = ({ solutions }) => {
    const [filter, setFilter] = useState<string>('All');

    const filteredSolutions = filter === 'All'
        ? solutions
        : solutions.filter(s => s.category === filter);

    const categories = ['All', 'Provider', 'Platform', 'Wellness'];

    return (
        <div className="space-y-8">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${filter === cat
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
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[18px] font-bold text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                    {/* Placeholder Logo */}
                                    {solution.name.charAt(0)}
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-[12px] font-bold">
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    {solution.rating}
                                </div>
                            </div>

                            <h3 className="text-[18px] font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">
                                {solution.name}
                            </h3>
                            <p className="text-[14px] text-gray-500 leading-relaxed mb-4 flex-grow">
                                {solution.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {solution.tags.map((tag) => (
                                    <span key={tag} className="bg-gray-50 text-gray-600 text-[11px] font-semibold px-2 py-1 rounded border border-gray-100">
                                        {tag}
                                    </span>
                                ))}
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
};

export default SolutionsCatalog;
