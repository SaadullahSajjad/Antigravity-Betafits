import { NextResponse } from 'next/server';
import { AssignedForm, FormStatus } from '@/types';
import { ASSIGNED_FORMS } from '@/constants';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export async function GET() {
    const tableId = 'tblNeyKm9sKAKZq9n'; // Assigned Forms

    try {
        const records = await fetchAirtableRecords(tableId);

        if (!records || records.length === 0) {
            return NextResponse.json(ASSIGNED_FORMS);
        }

        const forms: AssignedForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            status: (record.fields['Status'] as FormStatus) || FormStatus.NOT_STARTED,
            description: String(record.fields['Assigned Form URL'] || ''),
        }));

        return NextResponse.json(forms);
    } catch (error) {
        console.error('Assigned forms fetch error:', error);
        return NextResponse.json(ASSIGNED_FORMS); // Fallback to mock on error
    }
}
