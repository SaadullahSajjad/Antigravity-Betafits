'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FeedbackStats, FeedbackResponse } from '@/types';

interface Props {
  stats: FeedbackStats | null;
  responses: FeedbackResponse[];
}

const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = "w-3.5 h-3.5" }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${
            star <= rating ? 'text-amber-400' : 'text-gray-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' }>({ vertical: 'top', horizontal: 'left' });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isVisible && containerRef.current) {
      // Check position immediately before rendering tooltip
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 16; // 1rem
      const estimatedTooltipHeight = 150; // Estimate tooltip height
      
      // Check vertical positioning - if near top of viewport (first row), show below
      const spaceAbove = containerRect.top;
      const spaceBelow = window.innerHeight - containerRect.bottom;
      
      let vertical: 'top' | 'bottom' = 'top';
      // If container is near top (within 200px) or not enough space above, show below
      if (spaceAbove < 200 || (spaceAbove < estimatedTooltipHeight + padding && spaceBelow >= estimatedTooltipHeight + padding)) {
        vertical = 'bottom';
      } else if (spaceAbove >= estimatedTooltipHeight + padding) {
        vertical = 'top';
      } else {
        // Default to below if uncertain
        vertical = 'bottom';
      }
      
      // Check horizontal positioning - estimate based on container position
      let horizontal: 'left' | 'right' = 'left';
      const estimatedTooltipWidth = 320;
      if (containerRect.right + estimatedTooltipWidth > viewportWidth - padding) {
        // Would overflow on right - position from right
        horizontal = 'right';
      } else {
        horizontal = 'left';
      }
      
      setTooltipPosition({ vertical, horizontal });
      
      // After tooltip renders, fine-tune position
      requestAnimationFrame(() => {
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          
          // Check if tooltip overflows horizontally
          if (tooltipRect.right > viewportWidth - padding) {
            setTooltipPosition(prev => ({ ...prev, horizontal: 'right' }));
          } else if (tooltipRect.left < padding) {
            setTooltipPosition(prev => ({ ...prev, horizontal: 'left' }));
          }
        }
      });
    }
  }, [isVisible]);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block max-w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-[9999] p-3 bg-gray-900 text-white text-[12px] font-medium rounded-md shadow-xl break-words whitespace-normal pointer-events-none ${
            tooltipPosition.vertical === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            tooltipPosition.horizontal === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'
          }`}
          style={{
            maxWidth: 'min(320px, calc(100vw - 2rem))',
            width: 'max-content',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {text}
          <div className={`absolute ${
            tooltipPosition.vertical === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1 rotate-180'
          } ${
            tooltipPosition.horizontal === 'right' ? 'right-4' : 'left-4'
          } border-4 border-transparent ${
            tooltipPosition.vertical === 'top' ? 'border-t-gray-900' : 'border-b-gray-900'
          }`}></div>
        </div>
      )}
    </div>
  );
};

const EmployeeFeedback: React.FC<Props> = ({ stats, responses }) => {
  const [copied, setCopied] = useState(false);
  // Use internal React form route instead of Fillout URL
  const surveyFormRoute = '/forms/eq7fvu76pdus';
  const surveyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${surveyFormRoute}`
    : surveyFormRoute;

  const escapeCsv = (v: string | number | null | undefined): string => {
    const s = v === null || v === undefined ? '' : String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const handleExportCsv = () => {
    const headers = ['Submitted', 'Coverage Tier', 'Overall', 'Options', 'Network', 'Cost', 'Non-Med', 'Retirement', 'Comments'];
    const rows = responses.map((r) => [
      r.submittedAt,
      r.tier,
      r.overallRating,
      r.medicalOptions,
      r.medicalNetwork,
      r.medicalCost,
      r.nonMedical,
      r.retirement ?? '',
      r.comments ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Default stats if not provided
  const defaultStats: FeedbackStats = {
    overall: 0,
    responses: 0,
    nonMedical: 0,
    employeeCost: 0,
    medicalNetwork: 0,
    medicalOptions: 0,
    retirement: null,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Employee Feedback</h1>
        <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
          Monitor workforce sentiment and manage your feedback collection pipeline from one integrated dashboard.
        </p>
      </div>

      {/* Side-by-Side Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Collection Hub (4 columns) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col h-full">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-brand-50 rounded-md flex items-center justify-center text-brand-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Feedback Collection</h2>
              </div>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                Distribute your unique survey link to employees to start gathering sentiment data.
              </p>
            </div>

            <div className="space-y-4 mt-auto">
              <div className="relative group">
                <div className="absolute -top-6 right-0 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Active Survey</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                </div>
                <input 
                  type="text" 
                  readOnly 
                  value={surveyUrl}
                  className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-4 text-xs font-bold text-gray-400 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleCopy}
                  className={`py-3.5 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-100 ${
                    copied ? 'bg-brand-600 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                  {!copied && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                </button>
                <Link 
                  href={surveyFormRoute}
                  className="py-3.5 border border-gray-200 rounded-md font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Open Form
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Score Summary (8 columns) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-col md:flex-row items-stretch h-full">
            
            {/* Hero Card - Overall */}
            <div className="md:w-1/3 bg-gray-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center border-r border-gray-50">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Overall Score</div>
              <div className="text-5xl font-black text-brand-600 tracking-tighter mb-4">{displayStats.overall.toFixed(1)}</div>
              <StarRating rating={Math.round(displayStats.overall)} size="w-4 h-4" />
              <div className="mt-4 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {displayStats.responses} Total Responses
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Non-Medical', value: displayStats.nonMedical },
                { label: 'Employee Cost', value: displayStats.employeeCost },
                { label: 'Medical Network', value: displayStats.medicalNetwork },
                { label: 'Medical Options', value: displayStats.medicalOptions },
                { label: 'Retirement', value: displayStats.retirement, isRetirement: true },
              ].map((item, idx) => (
                <div key={idx} className={`flex flex-col justify-center ${item.isRetirement ? 'col-span-2 md:col-span-1' : ''}`}>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 truncate" title={item.label}>{item.label}</div>
                  {item.value !== null ? (
                    <div className="text-xl font-black text-gray-900 tracking-tight">{item.value}</div>
                  ) : (
                    <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Pending</div>
                  )}
                  {item.value !== null && (
                    <div className="mt-1">
                      <StarRating rating={Math.round(item.value as number)} size="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Individual Responses Table */}
      <section>
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Feedback History</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Detailed review of all employee survey submissions.</p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={responses.length === 0}
            className="text-[12px] font-bold text-brand-600 flex items-center gap-1.5 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export to CSV
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Submitted</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Coverage Tier</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Overall</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Options</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Network</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Cost</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Non-Med</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Retirement</th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                      Comments
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {responses.length > 0 ? (
                  responses.map((row) => (
                    <tr key={row.id} className="hover:bg-brand-50/5 transition-colors group">
                      <td className="px-8 py-6 text-[13px] font-medium text-gray-600 whitespace-nowrap">
                        {row.submittedAt}
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${
                          row.tier.includes('Family') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                          row.tier.includes('Only') ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          {row.tier || 'Individual Only'}
                        </span>
                      </td>
                      <td className="px-6 py-6"><StarRating rating={row.overallRating} /></td>
                      <td className="px-6 py-6"><StarRating rating={row.medicalOptions} /></td>
                      <td className="px-6 py-6"><StarRating rating={row.medicalNetwork} /></td>
                      <td className="px-6 py-6"><StarRating rating={row.medicalCost} /></td>
                      <td className="px-6 py-6"><StarRating rating={row.nonMedical} /></td>
                      <td className="px-6 py-6">
                        {row.retirement != null ? (
                          <StarRating rating={row.retirement} />
                        ) : (
                          <span className="text-[13px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-6 min-w-[200px]">
                        {row.comments ? (
                          <Tooltip text={row.comments}>
                            <p className="text-[13px] text-gray-600 font-medium truncate max-w-[180px] cursor-help">
                              {row.comments}
                            </p>
                          </Tooltip>
                        ) : (
                          <div className="h-px w-4 bg-gray-100"></div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-8 py-12">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {responses.length > 0 && (
            <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
              <Link
                href="/employee-feedback/all"
                className="inline-block text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-brand-600 transition-colors py-2"
              >
                Show More History
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EmployeeFeedback;
