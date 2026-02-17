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
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} />;
  }

  const token = process.env.AIRTABLE_API_KEY;
  if (!token) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} />;
  }

  try {
    const tableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
    const record = await fetchAirtableRecordById(tableId, companyId, {
      apiKey: token,
    });

    if (!record) {
      return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} />;
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

    return <BenefitsAnalysis demographics={demographics} kpis={kpis} breakdown={breakdown} />;
  } catch (error) {
    console.error('[BenefitsAnalysisPage] Error:', error);
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} />;
  }
}
