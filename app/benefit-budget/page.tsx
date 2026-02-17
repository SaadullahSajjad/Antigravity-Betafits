import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import BudgetSummaryKPIs from '@/components/BudgetSummaryKPIs';
import DemographicInsights from '@/components/DemographicInsights';
import FinancialBenchmarks from '@/components/FinancialBenchmarks';
import BudgetDistribution from '@/components/BudgetDistribution';
import BudgetBreakdownTable from '@/components/BudgetBreakdownTable';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById } from '@/lib/airtable/fetch';
import { DemographicInsights as DemographicInsightsType, FinancialKPIs, BudgetBreakdown } from '@/types';

export const dynamic = 'force-dynamic';

export default async function BenefitBudgetPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure matching Types
    let demographics: DemographicInsightsType = {
        eligibleEmployees: 0,
        averageSalary: 0,
        averageAge: 0,
        malePercentage: 0,
        femalePercentage: 0,
    };

    let kpis: FinancialKPIs = {
        totalMonthlyCost: 0,
        totalEmployerContribution: 0,
        totalEmployeeContribution: 0,
        erCostPerEligible: 0,
    };

    let breakdown: BudgetBreakdown[] = [];

    if (apiKey && companyId) {
        try {
            // Fetch company group data using fetchAirtableRecordById (more reliable)
            const tableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
            const record = await fetchAirtableRecordById(tableId, companyId, {
                apiKey,
            });

            if (record) {
                const fields = record.fields;

                // Map demographics from Airtable fields
                demographics = {
                    eligibleEmployees: parseInt(String(fields['Eligible Employees'] || fields['Total Employees'] || '0')) || 0,
                    averageSalary: parseFloat(String(fields['Average Salary'] || '0')) || 0,
                    averageAge: parseFloat(String(fields['Average Age'] || '0')) || 0,
                    malePercentage: parseFloat(String(fields['Male Percentage'] || '0')) || 0,
                    femalePercentage: parseFloat(String(fields['Female Percentage'] || '0')) || 0,
                };

                // Map financial KPIs from Airtable fields
                kpis = {
                    totalMonthlyCost: parseFloat(String(fields['Total Monthly Cost'] || '0')) || 0,
                    totalEmployerContribution: parseFloat(String(fields['Total Employer Contribution'] || '0')) || 0,
                    totalEmployeeContribution: parseFloat(String(fields['Total Employee Contribution'] || '0')) || 0,
                    erCostPerEligible: parseFloat(String(fields['ER Cost per Eligible'] || '0')) || 0,
                };

                // TODO: Budget breakdown might come from a separate table or linked records
                // For now, breakdown remains empty until table structure is confirmed
            }
        } catch (error) {
            console.error('[BenefitBudgetPage] Error fetching live data:', error);
        }
    } else {
        console.warn('[BenefitBudgetPage] No API key or company ID available for live data.');
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader
                title="Benefit Budget"
                subtitle="Provide financial overview and cost breakdown of benefits."
            />

            <BudgetSummaryKPIs kpis={kpis} />
            <DemographicInsights demographics={demographics} />
            <FinancialBenchmarks kpis={kpis} />
            <BudgetDistribution breakdown={breakdown} />
            <BudgetBreakdownTable breakdown={breakdown} />
        </div>
    );
}
