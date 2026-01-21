import React from 'react';
import { CompanyData } from '@/types';

interface Props {
    data: CompanyData;
}

const CompanyDetails: React.FC<Props> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
                            {data.companyName}
                        </h2>
                        <p className="text-[15px] text-gray-500 mt-1 font-medium">
                            {data.address || 'Address not provided'}
                        </p>
                    </div>
                    <div className="w-16 h-16 bg-brand-50 rounded-xl flex items-center justify-center text-brand-700 font-bold text-2xl">
                        {data.companyName.charAt(0)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-1">
                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                            Industry
                        </span>
                        <p className="text-[16px] font-medium text-gray-900">
                            {data.industry || '-'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                            Employees
                        </span>
                        <p className="text-[16px] font-medium text-gray-900">
                            {data.employeeCount?.toLocaleString() || '-'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                            Founded
                        </span>
                        <p className="text-[16px] font-medium text-gray-900">
                            {data.foundedYear || '-'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                            Website
                        </span>
                        <p className="text-[16px] font-medium text-brand-600">
                            <a href={data.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {data.website?.replace(/^https?:\/\//, '') || '-'}
                            </a>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                            Primary Contact
                        </span>
                        <p className="text-[16px] font-medium text-gray-900">
                            {data.primaryContact || '-'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                            Phone
                        </span>
                        <p className="text-[16px] font-medium text-gray-900">
                            {data.phone || '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder for Glassdoor Insights or other widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-900 rounded-[28px] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-[20px] font-bold mb-2">Company Insights</h3>
                        <p className="text-brand-400 text-[14px]">
                            AI-driven analysis of your firmographic data suggests optimized benefit packages.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mb-10"></div>
                </div>

                <div className="bg-white border border-gray-200 rounded-[28px] p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-[18px] font-bold text-gray-900">Data Verified</h3>
                    <p className="text-[13px] text-gray-500 mt-1">
                        Your company profile is up to date.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetails;
