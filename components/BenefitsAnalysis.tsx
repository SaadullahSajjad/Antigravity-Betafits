'use client';

import React from 'react';
import { DemographicInsights, FinancialKPIs, BudgetBreakdown } from '@/types';

interface Props {
  demographics: DemographicInsights | null;
  kpis: FinancialKPIs | null;
  breakdown: BudgetBreakdown[];
  reportUrl?: string;
}

const BenefitsAnalysis: React.FC<Props> = ({ demographics, kpis, breakdown, reportUrl }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Default values if not provided
  const defaultDemographics: DemographicInsights = {
    eligibleEmployees: 0,
    averageSalary: 0,
    averageAge: 0,
    malePercentage: 0,
    femalePercentage: 0,
  };

  const defaultKpis: FinancialKPIs = {
    totalMonthlyCost: 0,
    totalEmployerContribution: 0,
    totalEmployeeContribution: 0,
    erCostPerEligible: 0,
  };

  const displayDemographics = demographics || defaultDemographics;
  const displayKpis = kpis || defaultKpis;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Header & Report Asset */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Benefits Analysis</h1>
          <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
            A strategic overview of workforce demographics, financial benchmarks, and budget distribution across your benefit ecosystem.
          </p>
        </div>
        
        {/* Featured Report Card */}
        <div className="flex-shrink-0 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer w-full md:w-auto">
          <div className="w-12 h-12 bg-brand-50 rounded-md flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <div className="text-[14px] font-bold text-gray-900 leading-tight">Benefit Budget Report</div>
            <div className="text-[12px] text-gray-400 font-medium">E$1,000 — (AA) • PDF</div>
          </div>
          <button 
            onClick={() => {
              if (reportUrl) {
                window.open(reportUrl, '_blank', 'noopener,noreferrer');
              } else {
                console.warn('[BenefitsAnalysis] No report URL available');
                alert('Report URL not found. Please check Airtable configuration.');
              }
            }}
            className="ml-4 bg-brand-500 text-white px-5 py-2 rounded-md text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-100 cursor-pointer"
          >
            View Report
          </button>
        </div>
      </div>

      {/* Financial KPIs - Large Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Monthly Cost', value: formatCurrency(displayKpis.totalMonthlyCost), color: 'gray' },
          { label: 'Total Employer Contribution', value: formatCurrency(displayKpis.totalEmployerContribution), color: 'brand' },
          { label: 'Total Employee Contribution', value: formatCurrency(displayKpis.totalEmployeeContribution), color: 'blue' },
          { label: 'ER Cost per Eligible Employee', value: formatCurrency(displayKpis.erCostPerEligible), color: 'amber', highlight: true },
        ].map((item, idx) => (
          <div key={idx} className={`bg-white border ${item.highlight ? 'border-amber-200 bg-amber-50/10' : 'border-gray-200'} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{item.label}</div>
            <div className={`text-2xl font-black ${item.color === 'brand' ? 'text-brand-600' : 'text-gray-900'} tracking-tight`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Demographic Insights */}
      <div className="w-full">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 opacity-30"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Demographic Insights</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Key company demographics shaping benefit needs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-brand-600 mb-3 shadow-sm">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                 </div>
                 <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Eligible Employees</div>
                 <div className="text-2xl font-black text-gray-900">{displayDemographics.eligibleEmployees}</div>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Average Salary</div>
                 <div className="text-2xl font-black text-gray-900">{formatCurrency(displayDemographics.averageSalary)}</div>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-amber-600 mb-3 shadow-sm">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Average Age</div>
                 <div className="text-2xl font-black text-gray-900">{displayDemographics.averageAge} <span className="text-sm font-medium text-gray-400">YRS</span></div>
              </div>
            </div>

            {/* Gender Composition Viz */}
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Gender Composition</div>
                  <div className="text-[16px] font-bold text-gray-900">Workforce Split</div>
                </div>
                <div className="flex gap-4">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md">Male {displayDemographics.malePercentage}%</span>
                  <span className="text-sm font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-md">Female {displayDemographics.femalePercentage}%</span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${displayDemographics.malePercentage}%` }}></div>
                <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${displayDemographics.femalePercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefit Budget Breakdown - Data Grid */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Benefit Budget Breakdown</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Plan-by-plan cost distribution matrix.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Benefit</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Carrier</th>
                <th className="px-6 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Participation</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Monthly Total</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Annual Total</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">ER Cost/Month</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">EE Cost/Month</th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">ER Cost/Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {breakdown.length > 0 ? (
                breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-brand-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${row.benefit === 'Medical' ? 'bg-brand-500' : row.benefit === 'Dental' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                        <div className="text-[16px] font-bold text-gray-900">{row.benefit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[15px] font-medium text-gray-600">{row.carrier}</td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center">
                        <span className="text-[15px] font-bold text-gray-900">{row.participation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right text-[16px] font-bold text-gray-900">{formatCurrency(row.monthlyTotal)}</td>
                    <td className="px-6 py-6 text-right text-[16px] font-bold text-gray-900">{formatCurrency(row.annualTotal)}</td>
                    <td className="px-6 py-6 text-right text-[15px] font-bold text-brand-600">{formatCurrency(row.erCostMonth)}</td>
                    <td className="px-6 py-6 text-right text-[15px] font-bold text-blue-600">{formatCurrency(row.eeCostMonth)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-block px-3 py-1 bg-gray-50 border border-gray-100 rounded-md text-[15px] font-bold text-gray-900">
                        {formatCurrency(row.erCostEnrolled)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-8 py-12">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {breakdown.length > 0 && (
              <tfoot className="bg-gray-50/50">
                <tr>
                  <td colSpan={3} className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Totals</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-gray-900">{formatCurrency(breakdown.reduce((acc, r) => acc + r.monthlyTotal, 0))}</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-gray-900">{formatCurrency(breakdown.reduce((acc, r) => acc + r.annualTotal, 0))}</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-brand-700">{formatCurrency(breakdown.reduce((acc, r) => acc + r.erCostMonth, 0))}</td>
                  <td className="px-6 py-5 text-right text-[17px] font-black text-blue-700">{formatCurrency(breakdown.reduce((acc, r) => acc + r.eeCostMonth, 0))}</td>
                  <td className="px-8 py-5"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default BenefitsAnalysis;
