import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { DemographicInsights, FinancialKPIs, BudgetBreakdown } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const token = process.env.AIRTABLE_API_KEY;
    if (!token) {
      return NextResponse.json({ error: 'Airtable API key not configured' }, { status: 500 });
    }

    // Fetch from Intake - Group Data or analysis tables
    // For now, return null - can be populated from Airtable when tables are available
    const demographics: DemographicInsights | null = null;
    const kpis: FinancialKPIs | null = null;
    const breakdown: BudgetBreakdown[] = [];

    return NextResponse.json({
      demographics,
      kpis,
      breakdown,
    }, { status: 200 });
  } catch (error) {
    console.error('[Benefits Analysis API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benefits analysis' },
      { status: 500 }
    );
  }
}
