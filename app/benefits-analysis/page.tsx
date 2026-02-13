import React from 'react';
import BenefitsAnalysis from '@/components/BenefitsAnalysis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
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

  // For now, return empty data - can be populated from Airtable when tables are available
  const demographics: DemographicInsights | null = null;
  const kpis: FinancialKPIs | null = null;
  const breakdown: BudgetBreakdown[] = [];

  return <BenefitsAnalysis demographics={demographics} kpis={kpis} breakdown={breakdown} />;
}
