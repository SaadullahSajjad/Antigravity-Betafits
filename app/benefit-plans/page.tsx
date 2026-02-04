import React from 'react';
import BenefitPlans from '@/components/BenefitPlans';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { BenefitPlan, BenefitEligibilityData, ContributionStrategy } from '@/types';

export const dynamic = 'force-dynamic';

export default async function BenefitPlansPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure
    // We do NOT import static constants here anymore
    let plans: BenefitPlan[] = [];
    let eligibility: BenefitEligibilityData = {
        waitingPeriod: 'N/A',
        minHoursPerWeek: 0,
        effectiveDateRule: 'N/A',
    };
    let strategies: ContributionStrategy[] = [];

    if (apiKey && companyId) {
        try {
            // 1. Fetch Benefit Plans
            // Use FIND for linked record filtering
            const planRecords = await fetchAirtableRecords('tblPJjWgnbblYLym4', {
                apiKey,
                filterByFormula: `FIND('${companyId}', ARRAYJOIN({Link to Group Data})) > 0`,
            });

            if (planRecords && planRecords.length > 0) {
                plans = planRecords.map(record => ({
                    id: record.id,
                    name: String(record.fields['plan_name_client'] || record.fields['Name'] || 'Unnamed Plan'),
                    carrier: String(record.fields['carrier'] || 'Unknown Carrier'),
                    type: String(record.fields['medical_plan_type'] || 'Medical'),
                    network: String(record.fields['network'] || 'Standard Network'),
                    deductible: String(record.fields['medical_deductible_single'] || '$0'),
                    outOfPocketMax: String(record.fields['medical_oopm_single'] || '$0'),
                    copay: String(record.fields['vision_exam_copay'] || 'N/A'),
                }));
            }

            // 2. Fetch Group Data for Eligibility and Contribution Strategies
            const groupRecords = await fetchAirtableRecords('tbliXJ7599ngxEriO', {
                apiKey,
                filterByFormula: `RECORD_ID() = '${companyId}'`,
            });

            if (groupRecords && groupRecords.length > 0) {
                const group = groupRecords[0].fields;

                eligibility = {
                    waitingPeriod: String(group['benefit_waiting_period'] || 'N/A'),
                    minHoursPerWeek: Number(group['hours_per_week_for_eligibility'] || group['Hours/wk for Eligibility'] || 0),
                    effectiveDateRule: String(group['effective_date'] || 'N/A'),
                };

                const preferredStrategy = String(group['preferred_contribution_strategy'] || '');
                if (preferredStrategy) {
                    strategies = [
                        {
                            id: 'strat-live-1',
                            employeeType: 'Standard Employees',
                            employerContribution: group['medical_er_contribution_strategy'] ? String(group['medical_er_contribution_strategy']) : 'See details',
                            description: preferredStrategy,
                        }
                    ];
                }
            }
        } catch (error) {
            console.error('[BenefitPlansPage] Error fetching live data:', error);
        }
    } else {
        console.warn('[BenefitPlansPage] No API key or company ID available for live data.');
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                    Benefit Plans
                </h1>
                <p className="text-[15px] text-gray-500 font-medium mt-1">
                    Review your organization's benefit plan configurations and eligibility rules.
                </p>
            </header>

            <BenefitPlans
                eligibility={eligibility}
                strategies={strategies}
                plans={plans}
            />
        </div>
    );
}
