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
    const { fetchAirtableRecords, fetchAirtableRecordById } = await import('@/lib/airtable/fetch');
    
    // Fetch Group Data first
    const groupDataTableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
    const groupDataRecord = await fetchAirtableRecordById(groupDataTableId, companyId, {
      apiKey: token,
    });

    if (!groupDataRecord) {
      return <CompanyDetails data={null} />;
    }

    const groupDataFields = groupDataRecord.fields;

    // Try to fetch KPI Metrics record via linked record from Group Data
    let kpiMetricsRecord: any = null;
    const kpiMetricsTableId = 'tblMSbQDSGoiPBWxy'; // Intake - KPI Metrics
    
    // Check for link field in Group Data
    const kpiMetricsLinkFields = [
      'Intake - KPI Metrics',
      'Link to Intake - KPI Metrics',
      'Link to KPI Metrics',
      'KPI Metrics',
    ];
    
    let kpiMetricsRecordId: string | null = null;
    for (const linkField of kpiMetricsLinkFields) {
      const linkedKpi = groupDataFields[linkField];
      if (Array.isArray(linkedKpi) && linkedKpi.length > 0) {
        kpiMetricsRecordId = linkedKpi[0];
        break;
      } else if (linkedKpi) {
        kpiMetricsRecordId = String(linkedKpi);
        break;
      }
    }

    // Fetch KPI Metrics record if we have the ID
    if (kpiMetricsRecordId) {
      try {
        kpiMetricsRecord = await fetchAirtableRecordById(kpiMetricsTableId, kpiMetricsRecordId, {
          apiKey: token,
        });
      } catch (error) {
        console.log('[CompanyDetailsPage] Could not fetch KPI Metrics record:', error);
      }
    }

    // Use KPI Metrics fields if available, otherwise fall back to Group Data
    const kpiFields = kpiMetricsRecord?.fields || {};
    const sourceFields = { ...groupDataFields, ...kpiFields }; // Merge, with KPI Metrics taking priority

    // Helper to parse employee count (handles ranges)
    const parseEmployeeCount = (value: any): string => {
      if (!value) return '0';
      const str = String(value).trim();
      // Return as-is if it's already a good format, or parse ranges
      const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        return str; // Keep the range format
      }
      return str;
    };

    const companyData: CompanyData = {
      name: String(sourceFields['Company Name'] || sourceFields['Name'] || ''),
      entityType: String(sourceFields['Entity Type'] || ''),
      legalName: String(sourceFields['Entity Legal Name'] || sourceFields['Legal Name'] || ''),
      ein: String(sourceFields['EIN'] || ''),
      sicCode: String(sourceFields['SIC Code'] || ''),
      naicsCode: String(sourceFields['NAICS Code'] || ''),
      address: String(
        sourceFields['Street Address'] ||
        sourceFields['HQ Address'] ||
        sourceFields['Address'] ||
        ''
      ),
      renewalMonth: String(sourceFields['Renewal Month'] || ''),
      contact: {
        firstName: String(sourceFields['First Name'] || ''),
        lastName: String(sourceFields['Last Name'] || ''),
        jobTitle: String(sourceFields['Job Title'] || ''),
        phone: String(sourceFields['Phone Number'] || sourceFields['Phone'] || ''),
        email: String(sourceFields['Work Email'] || sourceFields['Email'] || ''),
      },
      workforce: {
        totalEmployees: parseEmployeeCount(
          kpiFields['# Eligible'] ||
          kpiFields['Total EEs (Scraped)'] ||
          sourceFields['Estimated Benefit-Eligible Employees'] ||
          sourceFields['Benefit-Eligible US Employees Range'] ||
          sourceFields['Total Employees'] ||
          sourceFields['Eligible Employees'] ||
          '0'
        ),
        usHqEmployees: parseEmployeeCount(
          kpiFields['US EEs (Scraped)'] ||
          sourceFields['U.S. HQ Employees'] ||
          sourceFields['US HQ Employees'] ||
          sourceFields['HQ Employees'] ||
          '0'
        ),
        hqCity: String(
          kpiFields['HQ City (Scraped)'] ||
          sourceFields['HQ City'] ||
          sourceFields['City'] ||
          ''
        ),
        otherUsCities: Array.isArray(kpiFields['Other US Cities (Scraped)'])
          ? kpiFields['Other US Cities (Scraped)']
          : Array.isArray(sourceFields['Other US Cities'])
            ? sourceFields['Other US Cities']
            : [],
        otherCountries: Array.isArray(kpiFields['Other Countries (Scraped)'])
          ? kpiFields['Other Countries (Scraped)']
          : Array.isArray(sourceFields['Other Countries'])
            ? sourceFields['Other Countries']
            : [],
        openJobs: String(sourceFields['Open Jobs'] || sourceFields['Open Job Count'] || ''),
        linkedInUrl: String(
          kpiFields['LinkedIn URL (from Company)'] ||
          sourceFields['LinkedIn URL'] ||
          sourceFields['LinkedIn'] ||
          ''
        ),
      },
      glassdoor: {
        overallRating: parseFloat(String(
          kpiFields['GD Overall Review'] ||
          kpiFields['Glassdoor Overall'] ||
          sourceFields['Glassdoor Overall Rating'] ||
          sourceFields['Glassdoor Rating'] ||
          sourceFields['Overall Rating'] ||
          '0'
        )) || 0,
        benefitsRating: parseFloat(String(
          kpiFields['GD Benefits Review'] ||
          kpiFields['Glassdoor Benefits'] ||
          sourceFields['Glassdoor Benefits Rating'] ||
          sourceFields['Benefits Rating'] ||
          '0'
        )) || 0,
        healthInsuranceRating: parseFloat(String(
          kpiFields['GD Health Insurance Review'] ||
          sourceFields['Glassdoor Health Insurance Rating'] ||
          sourceFields['Health Insurance Rating'] ||
          '0'
        )) || 0,
        retirementRating: parseFloat(String(
          kpiFields['GD Retirement'] ||
          sourceFields['Glassdoor Retirement Rating'] ||
          sourceFields['Retirement Rating'] ||
          '0'
        )) || 0,
        overallReviews: parseInt(String(
          kpiFields['GD # of Reviews (Overall)'] ||
          sourceFields['Glassdoor Overall Reviews'] ||
          sourceFields['Overall Reviews'] ||
          '0'
        )) || 0,
        benefitsReviews: parseInt(String(
          kpiFields['GD # of Reviews (Benefits)'] ||
          sourceFields['Glassdoor Benefits Reviews'] ||
          sourceFields['Benefits Reviews'] ||
          '0'
        )) || 0,
        glassdoorUrl: String(
          kpiFields['Glassdoor URL'] ||
          sourceFields['Glassdoor URL'] ||
          sourceFields['Glassdoor Link'] ||
          ''
        ),
      },
    };

    return <CompanyDetails data={companyData} />;
  } catch (error) {
    console.error('[CompanyDetailsPage] Error:', error);
    return <CompanyDetails data={null} />;
  }
}
