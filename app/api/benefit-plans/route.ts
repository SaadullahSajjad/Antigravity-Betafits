import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { BenefitEligibilityData, ContributionStrategy, BenefitPlan } from '@/types';

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

    // Fetch eligibility data from Intake - Group Data
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

    // Fetch contribution strategies (if stored in a separate table)
    // For now, return empty array - can be populated from Airtable if table exists
    const strategies: ContributionStrategy[] = [];

    // Fetch benefit plans (if stored in a separate table)
    // For now, return empty array - can be populated from Airtable if table exists
    const plans: BenefitPlan[] = [];

    return NextResponse.json({
      eligibility,
      strategies,
      plans,
    }, { status: 200 });
  } catch (error) {
    console.error('[Benefit Plans API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benefit plans' },
      { status: 500 }
    );
  }
}
