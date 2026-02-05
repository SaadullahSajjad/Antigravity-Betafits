import React from 'react';
import { CompanyData } from '@/types';

interface Props {
    data: CompanyData;
}

export default function WorkforceOverview({ data }: Props) {
    // Placeholder data - in production, this would come from employee census
    const workforceData = {
        totalEmployees: data.employeeCount || 0,
        averageAge: 0,
        genderDistribution: { male: 0, female: 0, other: 0 },
        tenureDistribution: { '0-2': 0, '3-5': 0, '6-10': 0, '10+': 0 },
    };

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Workforce Overview</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Demographic insights and distribution metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                        Total Employees
                    </span>
                    <span className="text-[32px] font-bold text-gray-900">
                        {workforceData.totalEmployees.toLocaleString()}
                    </span>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                        Average Age
                    </span>
                    <span className="text-[32px] font-bold text-gray-900">
                        {workforceData.averageAge || 'N/A'}
                    </span>
                </div>
            </div>

            {workforceData.totalEmployees === 0 && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
                    <p className="text-[14px] text-gray-500">
                        Workforce data will be available once employee census is uploaded.
                    </p>
                </div>
            )}
        </div>
    );
}
