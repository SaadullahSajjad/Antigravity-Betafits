import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { AvailableForm } from '@/types';
import { AVAILABLE_FORMS } from '@/constants';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblZVnNaE4y8e56fa'; // Available Forms

    if (!token) {
        return NextResponse.json(AVAILABLE_FORMS);
    }

    try {
        const base = new Airtable({ apiKey: token }).base(baseId);
        const records = await base(tableId).select({}).all();

        const forms: AvailableForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            category: 'General', // Category field doesn't exist in this table
            estimatedTime: '', // Estimated Time field doesn't exist in this table
            description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
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
