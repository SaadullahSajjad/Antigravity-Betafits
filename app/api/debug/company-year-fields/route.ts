import { NextResponse } from 'next/server';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.AIRTABLE_API_KEY;
  const tableId = 'tblbtLkv8l4uAm5h6'; // Company x Year

  if (!token) {
    return NextResponse.json(
      { error: 'Missing AIRTABLE_API_KEY' },
      { status: 500 }
    );
  }

  try {
    const records = await fetchAirtableRecords(tableId, {
      apiKey: token,
      maxRecords: 3,
    });

    if (!records || records.length === 0) {
      return NextResponse.json({
        message: 'No records found',
        fields: [],
      });
    }

    const firstRecord = records[0];
    const fieldNames = Object.keys(firstRecord.fields);

    // Extract all fields with their values and types
    const fields = fieldNames.map(name => ({
      name,
      value: firstRecord.fields[name],
      type: typeof firstRecord.fields[name],
      isArray: Array.isArray(firstRecord.fields[name]),
    }));

    // Identify score-related fields
    const scoreFields = fields.filter(f => 
      f.name.toLowerCase().includes('overall') ||
      f.name.toLowerCase().includes('score') ||
      f.name.toLowerCase().includes('rating') ||
      f.name.toLowerCase().includes('average') ||
      f.name.toLowerCase().includes('medical') ||
      f.name.toLowerCase().includes('cost') ||
      f.name.toLowerCase().includes('network') ||
      f.name.toLowerCase().includes('options') ||
      f.name.toLowerCase().includes('retirement') ||
      f.name.toLowerCase().includes('non-medical') ||
      f.name.toLowerCase().includes('response')
    );

    return NextResponse.json({
      totalRecords: records.length,
      allFields: fields,
      scoreFields: scoreFields,
      sampleRecord: firstRecord.fields,
    });
  } catch (error: any) {
    console.error('[CompanyYearFields] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch table structure' },
      { status: 500 }
    );
  }
}
