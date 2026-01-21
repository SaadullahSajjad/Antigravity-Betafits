import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { AssignedForm, FormStatus } from '@/types';
import { ASSIGNED_FORMS } from '@/constants';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblNeyKm9sKAKZq9n'; // Assigned Forms table

    if (!token) {
        console.warn('Missing AIRTABLE_API_KEY, returning mock data');
        return NextResponse.json(ASSIGNED_FORMS);
    }

    try {
        const base = new Airtable({ apiKey: token }).base(baseId);
        const records = await base(tableId).select({}).all();

        const forms: AssignedForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Form Name'] || ''),
            status: String(record.fields['Status'] || 'Not Started') as FormStatus,
            description: String(record.fields['Description'] || ''),
            dueDate: record.fields['Due Date'] ? String(record.fields['Due Date']) : undefined,
        }));

        return NextResponse.json(forms);
    } catch (error) {
        console.error('Airtable fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assigned forms' },
            { status: 500 }
        );
    }
}
