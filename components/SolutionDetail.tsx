'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Solution } from '@/types';

interface Props {
  solution: Solution | null;
}

const SolutionDetail: React.FC<Props> = ({ solution }) => {
  const router = useRouter();

  if (!solution) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        <div className="text-center py-20">
          <p className="text-gray-500 font-medium">Solution not found.</p>
        </div>
      </div>
    );
  }

  const getLogoPlaceholder = (name: string, color: string) => {
    const baseColor = color === 'brand' ? 'brand' : color;
    return (
      <div className={`w-20 h-20 rounded-md flex items-center justify-center text-3xl font-black bg-${baseColor}-500 text-white shadow-lg flex-shrink-0`}>
        {name[0]}
      </div>
    );
  };

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Navigation */}
      <nav className="flex items-center">
        <button 
          onClick={() => router.push('/solutions-catalog')}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-900 transition-all flex items-center gap-2 text-sm font-bold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Back to Catalog
        </button>
      </nav>

      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        {getLogoPlaceholder(solution.name, solution.color)}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
             <h1 className="text-4xl font-black text-gray-900 tracking-tight">{solution.name}</h1>
             <span className={`px-3 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getTagColor(solution.color)}`}>
               {solution.category}
             </span>
          </div>
          <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">
            {solution.description}
          </p>
          <div className="pt-4 flex justify-center md:justify-start">
            <a 
              href={solution.websiteUrl} 
              target="_blank" 
              rel="noreferrer"
              className="bg-brand-500 text-white px-10 py-3 rounded-md font-bold text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
            >
              Visit Website ↗
            </a>
          </div>
        </div>
      </div>

      {/* Primary Info Row: Aligned Key Offerings & Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Key Offerings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 items-start">
              {solution.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-md border border-gray-100 transition-all hover:border-brand-100">
                  <div className="w-6 h-6 bg-brand-50 text-brand-500 rounded-md flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[14px] font-bold text-gray-900 truncate" title={feature}>{feature}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Profile Details</h3>
            <div className="space-y-5 flex-1">
               <div className="flex flex-col">
                 <span className="text-[11px] font-bold text-gray-400 uppercase mb-1">Integration</span>
                 <span className="text-[15px] font-bold text-gray-900">{solution.integrationType}</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[11px] font-bold text-gray-400 uppercase mb-1">Availability</span>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                    <span className="text-[15px] font-bold text-gray-900">National</span>
                 </div>
               </div>
            </div>
          </section>
        </div>
      </div>

      {/* Secondary Row: Support Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8"></div> {/* Spacer */}
        <div className="lg:col-span-4">
          <div className="bg-brand-900 rounded-xl p-8 text-white shadow-xl shadow-brand-100 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-3 tracking-tight">Have a question?</h3>
              <p className="text-sm text-brand-100/90 mb-8 leading-relaxed font-normal">
                Contact our support team or your account manager for detailed insights about {solution.name}.
              </p>
              <button className="w-full bg-brand-500 hover:bg-brand-400 py-3.5 rounded-md text-sm font-bold transition-all shadow-lg active:scale-[0.98]">
                Contact Support
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-400/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetail;
