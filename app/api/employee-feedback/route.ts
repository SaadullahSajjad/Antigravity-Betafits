import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { FeedbackStats, FeedbackResponse } from '@/types';

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

    // Fetch feedback data from Airtable (if table exists)
    // For now, return empty data - can be populated when feedback table is available
    const stats: FeedbackStats | null = null;
    const responses: FeedbackResponse[] = [];

    return NextResponse.json({
      stats,
      responses,
    }, { status: 200 });
  } catch (error) {
    console.error('[Employee Feedback API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee feedback' },
      { status: 500 }
    );
  }
}
