import React from 'react';
import BenefitsAnalysis from '@/components/BenefitsAnalysis';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { DemographicInsights, FinancialKPIs, BudgetBreakdown } from '@/types';

export const dynamic = 'force-dynamic';

export default async function BenefitsAnalysisPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure matching Types
    let demographics: DemographicInsights = {
        averageAge: 0,
        averageTenure: 0,
        genderRatio: { male: 0, female: 0, other: 0 },
        dependentCoverageRatio: 0,
    };

    let kpis: FinancialKPIs = {
        pepm: 0,
        totalAnnualSpend: 0,
        employerContributionPercentage: 0,
        benchmarkPercentile: 0,
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

                // Map whatever live data is available
                // Many fields are missing in Group Data (require Employee Census), so defaulting to 0

                demographics = {
                    averageAge: 0,
                    averageTenure: 0,
                    genderRatio: { male: 0, female: 0, other: 0 },
                    dependentCoverageRatio: 0,
                };

                kpis = {
                    pepm: 0,
                    totalAnnualSpend: 0,
                    employerContributionPercentage: Number(fields['medical_er_contribution_strategy']) || 0,
                    benchmarkPercentile: 0,
                };

                // Budget breakdown is usually derived, leaving empty implies "No Data"
            }
        } catch (error) {
            console.error('[BenefitsAnalysisPage] Error fetching live data:', error);
        }
    } else {
        console.warn('[BenefitsAnalysisPage] No API key or company ID available for live data.');
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                    Benefits Analysis
                </h1>
                <p className="text-[15px] text-gray-500 font-medium mt-1">
                    Strategic overview of your workforce demographics and financial performance.
                </p>
            </header>

            <BenefitsAnalysis
                demographics={demographics}
                kpis={kpis}
                breakdown={breakdown}
            />
        </div>
    );
}
