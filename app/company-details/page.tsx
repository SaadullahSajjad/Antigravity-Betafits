import React from 'react';
import CompanyDetails from '@/components/CompanyDetails';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById } from '@/lib/airtable/fetch';
import { CompanyData } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CompanyDetailsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <CompanyDetails data={null} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <CompanyDetails data={null} />;
  }

  const token = process.env.AIRTABLE_API_KEY;
  if (!token) {
    return <CompanyDetails data={null} />;
  }

  try {
    const tableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
    const record = await fetchAirtableRecordById(tableId, companyId, {
      apiKey: token,
    });

    if (!record) {
      return <CompanyDetails data={null} />;
    }

    const fields = record.fields;

    const companyData: CompanyData = {
      name: String(fields['Company Name'] || fields['Name'] || ''),
      entityType: String(fields['Entity Type'] || ''),
      legalName: String(fields['Entity Legal Name'] || fields['Legal Name'] || ''),
      ein: String(fields['EIN'] || ''),
      sicCode: String(fields['SIC Code'] || ''),
      naicsCode: String(fields['NAICS Code'] || ''),
      address: String(fields['HQ Address'] || fields['Address'] || ''),
      renewalMonth: String(fields['Renewal Month'] || ''),
      contact: {
        firstName: String(fields['First Name'] || ''),
        lastName: String(fields['Last Name'] || ''),
        jobTitle: String(fields['Job Title'] || ''),
        phone: String(fields['Phone Number'] || fields['Phone'] || ''),
        email: String(fields['Work Email'] || fields['Email'] || ''),
      },
      workforce: {
        totalEmployees: String(fields['Total Employees'] || ''),
        usHqEmployees: String(fields['U.S. HQ Employees'] || ''),
        hqCity: String(fields['HQ City'] || ''),
        otherUsCities: Array.isArray(fields['Other US Cities']) ? fields['Other US Cities'] : [],
        otherCountries: Array.isArray(fields['Other Countries']) ? fields['Other Countries'] : [],
        openJobs: String(fields['Open Jobs'] || ''),
        linkedInUrl: String(fields['LinkedIn URL'] || ''),
      },
      glassdoor: {
        overallRating: parseFloat(String(fields['Glassdoor Overall Rating'] || '0')) || 0,
        benefitsRating: parseFloat(String(fields['Glassdoor Benefits Rating'] || '0')) || 0,
        healthInsuranceRating: parseFloat(String(fields['Glassdoor Health Insurance Rating'] || '0')) || 0,
        retirementRating: parseFloat(String(fields['Glassdoor Retirement Rating'] || '0')) || 0,
        overallReviews: parseInt(String(fields['Glassdoor Overall Reviews'] || '0')) || 0,
        benefitsReviews: parseInt(String(fields['Glassdoor Benefits Reviews'] || '0')) || 0,
        glassdoorUrl: String(fields['Glassdoor URL'] || ''),
      },
    };

    return <CompanyDetails data={companyData} />;
  } catch (error) {
    console.error('[CompanyDetailsPage] Error:', error);
    return <CompanyDetails data={null} />;
  }
}
