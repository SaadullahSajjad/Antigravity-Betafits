import React from 'react';
import BenefitPlans from '@/components/BenefitPlans';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { BenefitEligibilityData, ContributionStrategy, BenefitPlan } from '@/types';

export const dynamic = 'force-dynamic';

export default async function BenefitPlansPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }

  const token = process.env.AIRTABLE_API_KEY;
  if (!token) {
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }

  try {
    const groupDataTableId = 'tbliXJ7599ngxEriO';
    const groupRecords = await fetchAirtableRecords(groupDataTableId, {
      apiKey: token,
      filterByFormula: `{Record ID} = '${companyId}'`,
      maxRecords: 1,
    });

    let eligibility: BenefitEligibilityData | null = null;
    if (groupRecords && groupRecords.length > 0) {
      const fields = groupRecords[0].fields;
      eligibility = {
        className: String(fields['Benefit Class'] || 'All Full-Time Employees'),
        waitingPeriod: String(fields['Waiting Period'] || ''),
        effectiveDate: String(fields['Effective Date'] || ''),
        requiredHours: String(fields['Required Hours'] || '30 Hours per week'),
      };
    }

    // Contribution strategies and plans can be fetched from separate tables if they exist
    const strategies: ContributionStrategy[] = [];
    const plans: BenefitPlan[] = [];

    return <BenefitPlans eligibility={eligibility} strategies={strategies} plans={plans} />;
  } catch (error) {
    console.error('[BenefitPlansPage] Error:', error);
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }
}
