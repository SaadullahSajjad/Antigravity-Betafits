import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import CompanyDetailsTabs from '@/components/CompanyDetailsTabs';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { CompanyData } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CompanyDetailsPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure
    let companyData: CompanyData = {
        id: '',
        companyName: '',
        industry: '',
        employeeCount: 0,
        website: '',
        address: '',
        primaryContact: '',
        phone: '',
        foundedYear: '',
    };

    if (apiKey && companyId) {
        try {
            // Fetch the specific company record from Intake - Group Data table
            const records = await fetchAirtableRecords('tbliXJ7599ngxEriO', {
                apiKey,
                filterByFormula: `RECORD_ID() = '${companyId}'`,
            });

            if (records && records.length > 0) {
                const fields = records[0].fields;

                // Map fields to CompanyData structure
                companyData = {
                    id: records[0].id,
                    companyName: String(fields['Company Name'] || fields['Name'] || fields['company_name'] || ''),
                    industry: String(fields['Industry'] || fields['entity_type'] || ''),
                    employeeCount: Number(fields['estimated_benefit_eligible_employees'] || fields['employee_count'] || 0),
                    website: String(fields['Website'] || fields['work_email'] || ''),
                    address: `${fields['street_address'] || ''} ${fields['city'] || ''} ${fields['state_province'] || ''} ${fields['zip_code'] || ''}`.trim(),
                    primaryContact: `${fields['first_name'] || ''} ${fields['last_name'] || ''}`.trim(),
                    phone: String(fields['phone_number'] || fields['Phone Number'] || ''),
                    foundedYear: String(fields['year_company_founded'] || fields['Year Company Founded'] || ''),
                };
            }
        } catch (error) {
            console.error('[CompanyDetailsPage] Error fetching live data:', error);
        }
    } else {
        console.warn('[CompanyDetailsPage] No API key or company ID available for live data.');
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader
                title="Company Details"
                subtitle="Manage and review company information, eligibility, forms, and configurations."
            />

            <CompanyDetailsTabs data={companyData} />
        </div>
    );
}
