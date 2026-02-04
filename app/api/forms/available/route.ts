import { NextResponse } from 'next/server';
import { AvailableForm } from '@/types';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
    const tableId = 'tblZVnNaE4y8e56fa'; // Available Forms

    try {
        const records = await fetchAirtableRecords(tableId, {
            apiKey: process.env.AIRTABLE_API_KEY,
        });

        if (!records || records.length === 0) {
            return NextResponse.json([]);
        }

        const forms: AvailableForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            category: String(record.fields['Category'] || 'General'),
            estimatedTime: String(record.fields['Estimated Time'] || record.fields['Estimated Completion Time'] || record.fields['Completion Time'] || ''),
            description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
        }));

        return NextResponse.json(forms);
    } catch (error) {
        console.error('[Available Forms API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
