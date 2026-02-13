import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import BudgetSummaryKPIs from '@/components/BudgetSummaryKPIs';
import DemographicInsights from '@/components/DemographicInsights';
import FinancialBenchmarks from '@/components/FinancialBenchmarks';
import BudgetDistribution from '@/components/BudgetDistribution';
import BudgetBreakdownTable from '@/components/BudgetBreakdownTable';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
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
            // Fetch company group data for demographics and financial overview
            const records = await fetchAirtableRecords('tbliXJ7599ngxEriO', {
                apiKey,
                filterByFormula: `RECORD_ID() = '${companyId}'`,
            });

            if (records && records.length > 0) {
                const fields = records[0].fields;

                demographics = {
                    eligibleEmployees: 0,
                    averageSalary: 0,
                    averageAge: 0,
                    malePercentage: 0,
                    femalePercentage: 0,
                };

                kpis = {
                    totalMonthlyCost: 0,
                    totalEmployerContribution: 0,
                    totalEmployeeContribution: 0,
                    erCostPerEligible: 0,
                };
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
