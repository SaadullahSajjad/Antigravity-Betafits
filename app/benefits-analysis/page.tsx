import React from 'react';
import BenefitsAnalysis from '@/components/BenefitsAnalysis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById } from '@/lib/airtable/fetch';
import { DemographicInsights, FinancialKPIs, BudgetBreakdown } from '@/types';

export const dynamic = 'force-dynamic';

export default async function BenefitsAnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} />;
  }

  const token = process.env.AIRTABLE_API_KEY;
  if (!token) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} />;
  }

  try {
    const tableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
    const record = await fetchAirtableRecordById(tableId, companyId, {
      apiKey: token,
    });

    if (!record) {
      return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} />;
    }

    const fields = record.fields;

    // Map demographics from Airtable fields
    const demographics: DemographicInsights = {
      eligibleEmployees: parseInt(String(fields['Eligible Employees'] || fields['Total Employees'] || '0')) || 0,
      averageSalary: parseFloat(String(fields['Average Salary'] || '0')) || 0,
      averageAge: parseFloat(String(fields['Average Age'] || '0')) || 0,
      malePercentage: parseFloat(String(fields['Male Percentage'] || '0')) || 0,
      femalePercentage: parseFloat(String(fields['Female Percentage'] || '0')) || 0,
    };

    // Map financial KPIs from Airtable fields
    const kpis: FinancialKPIs = {
      totalMonthlyCost: parseFloat(String(fields['Total Monthly Cost'] || '0')) || 0,
      totalEmployerContribution: parseFloat(String(fields['Total Employer Contribution'] || '0')) || 0,
      totalEmployeeContribution: parseFloat(String(fields['Total Employee Contribution'] || '0')) || 0,
      erCostPerEligible: parseFloat(String(fields['ER Cost per Eligible'] || '0')) || 0,
    };

    // Map budget breakdown - try to extract from Group Data or calculate from existing fields
    let breakdown: BudgetBreakdown[] = [];
    
    if (record) {
      const fields = record.fields;
      
      // Try to get budget breakdown from linked records or fields
      const breakdownLinkFields = [
        'Link to Budget Breakdown',
        'Budget Breakdown',
        'Breakdown',
      ];
      
      for (const linkField of breakdownLinkFields) {
        const linkedBreakdown = fields[linkField];
        if (Array.isArray(linkedBreakdown) && linkedBreakdown.length > 0) {
          // TODO: Need to know the budget breakdown table ID to fetch linked records
          // For now, breakdown remains empty until table structure is confirmed
          break;
        }
      }
    }
    
    // TODO: If breakdown is in a separate table, fetch from there

    // Get the Benefit Budget Report URL from Airtable
    // Try multiple field name variations
    const reportUrlFieldVariations = [
      'ROI Workbook URL',
      'Benefit Budget Report URL',
      'Report URL',
      'Budget Report URL',
      'Benefit Report URL',
      'Budget Report',
      'Report Link',
      'Document URL',
    ];
    
    // Log all available fields for debugging
    console.log('[BenefitsAnalysisPage] Available fields:', Object.keys(fields));
    
    let reportUrl: string | undefined;
    for (const fieldName of reportUrlFieldVariations) {
      const url = fields[fieldName];
      if (url && typeof url === 'string' && url.trim() !== '') {
        reportUrl = url.trim();
        console.log(`[BenefitsAnalysisPage] Found report URL in field "${fieldName}": ${reportUrl}`);
        break;
      } else if (fields[fieldName]) {
        console.log(`[BenefitsAnalysisPage] Field "${fieldName}" exists but value is:`, fields[fieldName], typeof fields[fieldName]);
      }
    }
    
    // If not found in direct fields, check if it's in linked Documents table
    if (!reportUrl) {
      const documentLinkFields = [
        'Link to Intake Document Upload',
        'Link to Intake - Document Upload',
        'Documents',
        'Link to Documents',
      ];
      
      for (const linkField of documentLinkFields) {
        const linkedDocs = fields[linkField];
        if (Array.isArray(linkedDocs) && linkedDocs.length > 0) {
          console.log(`[BenefitsAnalysisPage] Found linked documents in field "${linkField}":`, linkedDocs);
          // TODO: Could fetch document records and find one with type "Benefit Budget Report"
          // For now, we'll rely on the direct URL field
        }
      }
    }

    return <BenefitsAnalysis demographics={demographics} kpis={kpis} breakdown={breakdown} reportUrl={reportUrl} />;
  } catch (error) {
    console.error('[BenefitsAnalysisPage] Error:', error);
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} />;
  }
}
