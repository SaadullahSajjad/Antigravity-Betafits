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

    // Fetch solutions from Airtable
    const tableId = 'tblyp74Xh14940523'; // Solutions / Ecosystem table
    const records = await fetchAirtableRecords(tableId, {
      apiKey: token,
      maxRecords: 100,
    });

    let solutions: Solution[] = [];
    const categories: string[] = ['All Solutions'];

    if (records && records.length > 0) {
      solutions = records.map(record => {
        const fields = record.fields;
        return {
          id: record.id,
          name: String(fields['Name'] || fields['Solution Name'] || ''),
          category: String(fields['Category'] || 'Other'),
          color: String(fields['Color'] || '#97C25E'),
          description: String(fields['Description'] || ''),
          features: Array.isArray(fields['Features']) ? fields['Features'].map((f: any) => String(f)) : [],
          websiteUrl: String(fields['Website URL'] || fields['URL'] || ''),
          integrationType: String(fields['Integration Type'] || ''),
        };
      });

      // Extract unique categories
      const uniqueCategories = new Set(solutions.map(s => s.category));
      categories.push(...Array.from(uniqueCategories));
    }

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
