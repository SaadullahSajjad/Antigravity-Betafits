import React from 'react';
import { CompanyData } from '@/types';

interface Props {
    data: CompanyData;
}

export default function CompanySummaryCard({ data }: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
                        {data.companyName || 'Company Name'}
                    </h2>
                    <p className="text-[15px] text-gray-500 mt-1 font-medium">
                        {data.address || 'Address not provided'}
                    </p>
                </div>
                <div className="w-16 h-16 bg-brand-50 rounded-xl flex items-center justify-center text-brand-700 font-bold text-2xl">
                    {data.companyName?.charAt(0) || 'C'}
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
                        {data.website ? (
                            <a href={data.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {data.website.replace(/^https?:\/\//, '')}
                            </a>
                        ) : '-'}
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
    );
}
