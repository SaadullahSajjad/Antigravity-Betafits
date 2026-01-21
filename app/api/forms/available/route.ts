import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { AvailableForm } from '@/types';
import { AVAILABLE_FORMS } from '@/constants';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblxX9KJkN5Q4xJ9G'; // Available Forms table

    if (!token) {
        return NextResponse.json(AVAILABLE_FORMS);
    }

    try {
        const base = new Airtable({ apiKey: token }).base(baseId);
        const records = await base(tableId).select({}).all();

        const forms: AvailableForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Form Name'] || ''),
            category: String(record.fields['Category'] || 'General'),
            estimatedTime: String(record.fields['Estimated Time'] || ''),
            description: String(record.fields['Description'] || ''),
        }));

        return NextResponse.json(forms);
    } catch (error) {
        console.error('Available forms fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch available forms' },
            { status: 500 }
        );
    }
}
