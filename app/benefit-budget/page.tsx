import React from 'react';
import { unstable_noStore } from 'next/cache';
import DashboardHeader from '@/components/DashboardHeader';
import BudgetSummaryKPIs from '@/components/BudgetSummaryKPIs';
import DemographicInsights from '@/components/DemographicInsights';
import FinancialBenchmarks from '@/components/FinancialBenchmarks';
import BudgetDistribution from '@/components/BudgetDistribution';
import BudgetBreakdownTable from '@/components/BudgetBreakdownTable';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById, fetchAirtableRecords } from '@/lib/airtable/fetch';
import { DemographicInsights as DemographicInsightsType, FinancialKPIs, BudgetBreakdown } from '@/types';

export const dynamic = 'force-dynamic';

function parseEmployeeCount(value: unknown): number {
  if (value == null) return 0;
  const str = String(value).trim();
  const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return Math.round((min + max) / 2);
  }
  const numberMatch = str.match(/(\d+)/);
  if (numberMatch) return parseInt(numberMatch[1], 10);
  const parsed = parseInt(str, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default async function BenefitBudgetPage() {
  unstable_noStore();
  const companyId = await getCompanyId();
  const apiKey = process.env.AIRTABLE_API_KEY;

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
  let sourceFields: Record<string, unknown> = {};

  if (apiKey && companyId) {
    try {
      const groupDataTableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
      const kpiMetricsTableId = 'tblMSbQDSGoiPBWxy'; // Intake - KPI Metrics
      const planTableId = 'tblPJjWgnbblYLym4'; // Intake - Plan Data
      const planView = 'All Fields 1st Plan';

      const groupRecord = await fetchAirtableRecordById(groupDataTableId, companyId, { apiKey });
      if (groupRecord) sourceFields = groupRecord.fields;

      // Prefer KPI Metrics (linked from Group Data or filter by company)
      let kpiRecordId: string | null = null;
      if (groupRecord) {
        const linkFields = ['Intake - KPI Metrics', 'Link to Intake - KPI Metrics', 'Link to KPI Metrics', 'KPI Metrics'];
        for (const f of linkFields) {
          const v = (groupRecord.fields as Record<string, unknown>)[f];
          if (Array.isArray(v) && v.length > 0) {
            kpiRecordId = String(v[0]);
            break;
          }
          if (v != null && String(v).trim()) {
            kpiRecordId = String(v);
            break;
          }
        }
      }

      let kpiRecord: { fields: Record<string, unknown> } | null = null;
      if (kpiRecordId) {
        try {
          const r = await fetchAirtableRecordById(kpiMetricsTableId, kpiRecordId, { apiKey });
          if (r) kpiRecord = r;
        } catch {
          // ignore
        }
      }
      if (!kpiRecord) {
        const allKpi = await fetchAirtableRecords(kpiMetricsTableId, { apiKey, maxRecords: 1000 });
        const linkFieldVariations = ['Link to Intake - Group Data', 'Link to Intake Group Data', 'Link to Group Data', 'Company', 'Link to Company'];
        const matched = allKpi?.find((rec: { fields: Record<string, unknown> }) => {
          for (const field of linkFieldVariations) {
            const link = rec.fields[field];
            if (Array.isArray(link) && link.some((id: string) => String(id).trim() === String(companyId).trim())) return true;
            if (link != null && String(link).trim() === String(companyId).trim()) return true;
          }
          return false;
        });
        if (matched) kpiRecord = matched;
      }
      if (kpiRecord) sourceFields = kpiRecord.fields;

      // Demographics – same field variations as benefits-analysis
      demographics = {
        eligibleEmployees: parseEmployeeCount(
          sourceFields['# Eligible'] ?? sourceFields['Eligible Employees'] ?? sourceFields['Total Employees'] ?? sourceFields['Benefit Eligible Employees'] ?? sourceFields['Employee Count'] ?? sourceFields['Number of Employees'] ?? sourceFields['Headcount'] ?? '0'
        ),
        averageSalary: parseFloat(String(sourceFields['Salary (Avg)'] ?? sourceFields['Average Salary'] ?? sourceFields['Avg Salary'] ?? '0')) || 0,
        averageAge: parseFloat(String(sourceFields['Age (Avg)'] ?? sourceFields['Average Age'] ?? sourceFields['Avg Age'] ?? '0')) || 0,
        malePercentage: parseFloat(String(sourceFields['Male %'] ?? sourceFields['Male Percentage'] ?? sourceFields['Male'] ?? '0')) || 0,
        femalePercentage: parseFloat(String(sourceFields['Female %'] ?? sourceFields['Female Percentage'] ?? sourceFields['Female'] ?? '0')) || 0,
      };

      // KPIs – same field variations as benefits-analysis
      kpis = {
        totalMonthlyCost: parseFloat(String(sourceFields['Monthly Spend Total'] ?? sourceFields['Total Monthly Cost'] ?? sourceFields['Monthly Cost'] ?? '0')) || 0,
        totalEmployerContribution: parseFloat(String(sourceFields['Monthly Spend Medical'] ?? sourceFields['Total Employer Contribution'] ?? sourceFields['Employer Contribution'] ?? '0')) || 0,
        totalEmployeeContribution: parseFloat(String(sourceFields['Total Employee Contribution'] ?? sourceFields['Employee Contribution'] ?? '0')) || 0,
        erCostPerEligible: parseFloat(String(sourceFields['ER $/Eligible'] ?? sourceFields['ER Cost per Eligible'] ?? sourceFields['Cost per Eligible'] ?? '0')) || 0,
      };

      // Budget breakdown from Intake - Plan Data (linked or view fallback)
      if (groupRecord) {
        const gFields = groupRecord.fields as Record<string, unknown>;
        const planLinkFields = ['Intake - Plan Data', 'Link to Intake - Plan Data', 'Link to Benefit Plans', 'Benefit Plans', 'Plans', 'Link to Plans', 'Link to Plan Data'];
        let linkedPlanIds: string[] = [];
        for (const f of planLinkFields) {
          const v = gFields[f];
          if (Array.isArray(v) && v.length > 0) {
            linkedPlanIds = v.map((id) => String(id));
            break;
          }
        }

        let plansToProcess: { id: string; fields: Record<string, unknown> }[] = [];
        if (linkedPlanIds.length > 0) {
          for (const planId of linkedPlanIds) {
            try {
              const planRecord = await fetchAirtableRecordById(planTableId, planId, { apiKey });
              if (planRecord) plansToProcess.push(planRecord);
            } catch {
              // skip
            }
          }
        } else {
          const allPlans = await fetchAirtableRecords(planTableId, { apiKey, maxRecords: 100, view: planView });
          const companyLinkFields = ['Link to Intake - Group Data', 'Link to Intake Group Data', 'Link to Group Data', 'Company', 'Link to Company'];
          plansToProcess = (allPlans || []).filter((planRecord: { fields: Record<string, unknown> }) => {
            for (const f of companyLinkFields) {
              const link = planRecord.fields[f];
              if (Array.isArray(link) && link.includes(companyId)) return true;
              if (link != null && String(link).trim() === String(companyId).trim()) return true;
            }
            return false;
          });
        }

        const findFieldValue = (planFields: Record<string, unknown>, possibleNames: string[], defaultValue: number = 0): number => {
          for (const name of possibleNames) {
            const value = planFields[name];
            if (value !== undefined && value !== null && value !== '') {
              const parsed = parseFloat(String(value));
              if (!Number.isNaN(parsed)) return parsed;
            }
          }
          return defaultValue;
        };
        const findIntFieldValue = (planFields: Record<string, unknown>, possibleNames: string[], defaultValue: number = 0): number => {
          for (const name of possibleNames) {
            const value = planFields[name];
            if (value !== undefined && value !== null && value !== '') {
              const parsed = parseInt(String(value), 10);
              if (!Number.isNaN(parsed)) return parsed;
            }
          }
          return defaultValue;
        };

        for (const planRecord of plansToProcess) {
          const planFields = planRecord.fields;
          const benefitTypeFields = ['Benefit Type', 'Category', 'Type', 'Plan Category', 'Benefit Category'];
          let benefitType = '';
          for (const name of benefitTypeFields) {
            const v = planFields[name];
            if (v != null && String(v).trim()) {
              benefitType = String(v).trim().toLowerCase();
              break;
            }
          }
          if (!benefitType) {
            const planName = String(planFields['Plan Name (Client)'] ?? planFields['Plan Name'] ?? planFields['Name'] ?? '').toLowerCase();
            benefitType = planName.includes('dental') ? 'Dental' : planName.includes('vision') ? 'Vision' : 'Medical';
          } else {
            benefitType = benefitType.includes('dental') ? 'Dental' : benefitType.includes('vision') ? 'Vision' : 'Medical';
          }

          const breakdownItem: BudgetBreakdown = {
            benefit: benefitType,
            carrier: String(planFields['Carrier'] ?? planFields['Carrier Name'] ?? ''),
            participation: findIntFieldValue(planFields, ['Participation', 'Enrolled', '# Enrolled', 'Enrollment', 'Number Enrolled', 'Participants']),
            monthlyTotal: findFieldValue(planFields, ['Monthly Total', 'Total Monthly Cost', 'Monthly Cost', 'Total Monthly', 'Monthly Spend']),
            annualTotal: findFieldValue(planFields, ['Annual Total', 'Total Annual Cost', 'Annual Cost', 'Yearly Total', 'Total Annual', 'Annual Spend']),
            erCostMonth: findFieldValue(planFields, ['ER Cost/Month', 'Employer Cost/Month', 'ER Monthly Cost', 'Monthly ER Cost', 'ER Cost per Month']),
            eeCostMonth: findFieldValue(planFields, ['EE Cost/Month', 'Employee Cost/Month', 'EE Monthly Cost', 'Monthly EE Cost', 'EE Cost per Month']),
            erCostEnrolled: findFieldValue(planFields, ['ER Cost/Enrolled', 'Employer Cost per Enrolled', 'ER Cost per Enrolled', 'Cost per Enrolled']),
            erCostFte: findFieldValue(planFields, ['ER Cost/FTE', 'Employer Cost per FTE', 'ER Cost per FTE', 'Cost per FTE']),
          };
          if (breakdownItem.carrier || breakdownItem.participation > 0 || breakdownItem.monthlyTotal > 0) {
            breakdown.push(breakdownItem);
          }
        }
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
