'use client';

import React from 'react';
import { CompanyData } from '@/types';
import CompanyDetailsInfo from '@/components/CompanyDetailsInfo';

interface Props {
  data: CompanyData | null;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'
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

const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex py-3 border-b border-gray-50 last:border-0 items-start">
    <div className="w-1/2 text-[13px] font-medium text-gray-500 pt-0.5">{label}</div>
    <div className="w-1/2 text-[14px] font-bold text-gray-900 leading-snug">{value || '-'}</div>
  </div>
);

const CompanyDetails: React.FC<Props> = ({ data }) => {
  // Default data structure if not provided
  const defaultData: CompanyData = {
    name: '',
    entityType: '',
    legalName: '',
    ein: '',
    sicCode: '',
    naicsCode: '',
    address: '',
    renewalMonth: '',
    contact: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      phone: '',
      email: '',
    },
    workforce: {
      totalEmployees: '',
      usHqEmployees: '',
      hqCity: '',
      otherUsCities: [],
      otherCountries: [],
      openJobs: '',
      linkedInUrl: '',
    },
    glassdoor: {
      overallRating: 0,
      benefitsRating: 0,
      healthInsuranceRating: 0,
      retirementRating: 0,
      overallReviews: 0,
      benefitsReviews: 0,
      glassdoorUrl: '',
    },
  };

  const displayData = data || defaultData;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Company Insights</h1>
        <p className="text-gray-500 font-medium">Detailed firmographic profile and market reputation data.</p>
      </div>

      {/* Legal & Contact – editable, persists to Airtable */}
      {displayData && (
        <CompanyDetailsInfo data={displayData} />
      )}

      {/* 2x2 Grid Layout for the 4 Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Company Info Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Company Info</h2>
          </div>
          <div className="p-8 space-y-0.5">
            <DataRow label="Company Name" value={displayData.name} />
            <DataRow label="Entity Type" value={displayData.entityType} />
            <DataRow label="Entity Legal Name" value={displayData.legalName} />
            <DataRow label="EIN" value={displayData.ein} />
            <DataRow label="SIC Code" value={displayData.sicCode} />
            <DataRow label="NAICS Code" value={displayData.naicsCode} />
            <DataRow label="HQ Address" value={displayData.address} />
            <DataRow label="Renewal Month" value={displayData.renewalMonth} />
          </div>
        </section>

        {/* 2. Contact Info Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Contact Info</h2>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8 bg-brand-50/30 p-4 rounded-xl border border-brand-100">
              <div className="w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center text-lg font-black shadow-lg shadow-brand-100">
                {(displayData.contact.firstName[0] || '') + (displayData.contact.lastName[0] || '') || 'U'}
              </div>
              <div>
                <div className="text-[16px] font-bold text-gray-900">{displayData.contact.firstName} {displayData.contact.lastName}</div>
                <div className="text-[13px] text-brand-600 font-medium">{displayData.contact.jobTitle}</div>
              </div>
            </div>
            <div className="space-y-0.5">
              <DataRow label="First Name" value={displayData.contact.firstName} />
              <DataRow label="Last Name" value={displayData.contact.lastName} />
              <DataRow label="Job Title" value={displayData.contact.jobTitle} />
              <DataRow label="Phone Number" value={displayData.contact.phone} />
              <DataRow label="Work Email" value={displayData.contact.email} />
            </div>
          </div>
        </section>

        {/* 3. Workforce Overview Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Workforce Overview</h2>
          </div>
          <div className="p-8 flex flex-col h-full">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100">
                <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Total Employees</div>
                <div className="text-xl font-black text-brand-900">{displayData.workforce.totalEmployees || '0'}</div>
              </div>
              <div className="bg-blue-50/40 p-4 rounded-lg border border-blue-100">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">U.S. HQ Employees</div>
                <div className="text-xl font-black text-blue-900">{displayData.workforce.usHqEmployees || '0'}</div>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <DataRow label="HQ City" value={displayData.workforce.hqCity} />
              <div className="flex py-3 border-b border-gray-50 last:border-0 items-start">
                <div className="w-1/2 text-[13px] font-medium text-gray-500 pt-0.5">Other US Cities</div>
                <div className="w-1/2 flex flex-wrap gap-1.5">
                  {displayData.workforce.otherUsCities.length > 0 ? (
                    displayData.workforce.otherUsCities.map(city => (
                      <span key={city} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[12px] font-bold border border-gray-200">{city}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-[12px]">-</span>
                  )}
                </div>
              </div>
              <DataRow label="Other Countries" value={displayData.workforce.otherCountries.join(', ') || '-'} />
              <DataRow label="Open Jobs" value={displayData.workforce.openJobs} />
            </div>

            {displayData.workforce.linkedInUrl && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <a href={displayData.workforce.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-bold hover:underline flex items-center gap-2 text-[14px]">
                  Go to LinkedIn ↗
                </a>
              </div>
            )}
          </div>
        </section>

        {/* 4. Glassdoor Overview Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Glassdoor Overview</h2>
          </div>
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center gap-6 mb-10">
              <div className="flex flex-col items-center justify-center bg-gray-900 text-white w-20 h-20 rounded-xl shadow-lg">
                <span className="text-2xl font-black leading-none">{displayData.glassdoor.overallRating.toFixed(1)}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-70">Rating</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-medium text-gray-500">Benefits Rating</span>
                  <span className="text-[14px] font-bold text-gray-900">{displayData.glassdoor.benefitsRating.toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(displayData.glassdoor.benefitsRating / 5) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
               {/* Star Ratings */}
               <div className="flex items-center justify-between">
                 <span className="text-[13px] font-medium text-gray-500">Health Insurance</span>
                 <StarRating rating={displayData.glassdoor.healthInsuranceRating} />
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[13px] font-medium text-gray-500">Retirement Reviews</span>
                 <StarRating rating={displayData.glassdoor.retirementRating} />
               </div>

               {/* Review Counts - Aligned under stars */}
               <div className="pt-4 space-y-4">
                 <div className="flex items-center justify-between py-1">
                   <span className="text-[13px] font-medium text-gray-500">Overall Reviews</span>
                   <span className="text-[15px] font-bold text-gray-900 pr-1">{displayData.glassdoor.overallReviews}</span>
                 </div>
                 <div className="flex items-center justify-between py-1">
                   <span className="text-[13px] font-medium text-gray-500">Benefits Reviews</span>
                   <span className="text-[15px] font-bold text-gray-900 pr-1">{displayData.glassdoor.benefitsReviews}</span>
                 </div>
               </div>
            </div>

            {displayData.glassdoor.glassdoorUrl && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <a href={displayData.glassdoor.glassdoorUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-bold hover:underline flex items-center gap-2 text-[14px]">
                  View Glassdoor account ↗
                </a>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default CompanyDetails;
