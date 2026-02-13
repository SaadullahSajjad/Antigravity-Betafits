import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { Solution } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = process.env.AIRTABLE_API_KEY;
    if (!token) {
      return NextResponse.json({ error: 'Airtable API key not configured' }, { status: 500 });
    }

    // Fetch solutions from Airtable (if table exists)
    // For now, return empty arrays - can be populated when solutions table is available
    const solutions: Solution[] = [];
    const categories: string[] = ['All Solutions'];

    return NextResponse.json({
      solutions,
      categories,
    }, { status: 200 });
  } catch (error) {
    console.error('[Solutions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solutions' },
      { status: 500 }
    );
  }
}
