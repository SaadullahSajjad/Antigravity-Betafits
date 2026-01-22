import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { AssignedForm, FormStatus } from '@/types';
import { ASSIGNED_FORMS } from '@/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblNeyKm9sKAKZq9n'; // Assigned Forms

    if (!token) {
        console.warn('Missing AIRTABLE_API_KEY, returning mock data');
        return NextResponse.json(ASSIGNED_FORMS);
    }

    try {
        const base = new Airtable({ apiKey: token }).base(baseId);
        const records = await base(tableId).select({}).all();

        const forms: AssignedForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            status: String(record.fields['Status'] || 'Not Started') as FormStatus,
            description: String(record.fields['Assigned Form URL'] || ''),
            dueDate: undefined, // Due Date field doesn't exist in this table
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
