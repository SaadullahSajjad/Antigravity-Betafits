import React from 'react';
import CompanyDetails from '@/components/CompanyDetails';
import { COMPANY_DATA } from '@/constants';

export default function CompanyDetailsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                    Company Details
                </h1>
                <p className="text-[15px] text-gray-500 font-medium mt-1">
                    Manage your company profile and view firmographic insights.
                </p>
            </header>

            <CompanyDetails data={COMPANY_DATA} />
        </div>
    );
}
