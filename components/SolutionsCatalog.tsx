'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Solution } from '@/types';

interface Props {
  solutions: Solution[];
  categories: string[];
}

const SolutionsCatalog: React.FC<Props> = ({ solutions, categories }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Solutions');

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = solution.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All Solutions' || 
                           solution.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
                           (activeCategory === 'HCM/Payroll' && solution.category.includes('HR/Payroll'));
    return matchesSearch && matchesCategory;
  });

  const getTagColor = (color: string) => {
    switch (color) {
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'pink': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'green': return 'bg-brand-50 text-brand-700 border-brand-100';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'gray': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getLogoPlaceholder = (name: string, color: string) => {
    const baseColor = color === 'brand' ? 'brand' : color;
    return (
      <div className={`w-12 h-12 rounded-md flex items-center justify-center text-lg font-black bg-${baseColor}-500 text-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
        {name[0]}
      </div>
    );
  };

  const handleSelectSolution = (solution: Solution) => {
    router.push(`/solutions/${solution.id}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Solutions Catalog</h1>
        <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
          Discover and explore our ecosystem of benefit providers, technology platforms, and financial wellness partners.
        </p>
      </div>

      {/* Modern Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Type here to search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-md pl-14 pr-6 py-4 text-[16px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar: Filter Categories */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-28">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">Filter by Category</h2>
            <nav className="flex flex-wrap lg:flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-md text-sm font-bold transition-all text-left truncate ${
                    activeCategory === cat 
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-100' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right Main Content: Solution Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSolutions.map((solution) => (
              <div 
                key={solution.id} 
                onClick={() => handleSelectSolution(solution)}
                className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group flex flex-col items-start min-h-[160px] cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-4 w-full">
                  {getLogoPlaceholder(solution.name, solution.color)}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-brand-600 transition-colors truncate">
                      {solution.name}
                    </h3>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getTagColor(solution.color)}`}>
                      {solution.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed mb-6">
                  {solution.description}
                </p>

                <div className="mt-auto flex w-full justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                   <span className="text-brand-600 font-bold text-[13px]">View Profile</span>
                   <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))}

            {filteredSolutions.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-gray-900 font-bold text-lg">No solutions found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search or category filter.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setActiveCategory('All Solutions');}}
                  className="mt-6 text-brand-600 font-bold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {filteredSolutions.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="bg-white border border-gray-200 text-gray-900 px-10 py-3.5 rounded-md font-bold text-sm hover:bg-gray-50 transition-all shadow-sm hover:shadow active:scale-95">
                See more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionsCatalog;
