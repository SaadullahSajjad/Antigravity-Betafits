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

export default async function BenefitsAnalysisPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure matching Types
    let demographics: DemographicInsightsType = {
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
            }
        } catch (error) {
            console.error('[BenefitsAnalysisPage] Error fetching live data:', error);
        }
    } else {
        console.warn('[BenefitsAnalysisPage] No API key or company ID available for live data.');
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader
                title="Benefits Analysis"
                subtitle="Analyze benefit trends, costs, and performance metrics."
            />

            {/* Benefit Budget Report Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Benefit Budget Report</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Download plan summaries and detailed cost reports.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-[14px] text-gray-500 font-medium">No results found, try adjusting your search and filters.</p>
                </div>
            </section>

            {/* Demographic Insights Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Demographic Insights</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Key company demographics that shape benefit needs and cost trends.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <p className="text-[14px] text-gray-500">Financial data will be displayed here.</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
