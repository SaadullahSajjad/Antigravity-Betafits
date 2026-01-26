import { NextResponse } from 'next/server';
import { AvailableForm } from '@/types';
import { AVAILABLE_FORMS } from '@/constants';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export async function GET() {
    const tableId = 'tblZVnNaE4y8e56fa'; // Available Forms

    try {
        const records = await fetchAirtableRecords(tableId);

        if (!records || records.length === 0) {
            return NextResponse.json(AVAILABLE_FORMS);
        }

        const forms: AvailableForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            category: 'General',
            estimatedTime: '',
            description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
        }));

        return NextResponse.json(forms);
    } catch (error) {
        console.error('Available forms fetch error:', error);
        return NextResponse.json(AVAILABLE_FORMS); // Fallback to mock on error
    }
}
