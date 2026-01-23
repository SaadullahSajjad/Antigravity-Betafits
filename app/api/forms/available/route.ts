import { NextResponse } from 'next/server';
import { AvailableForm } from '@/types';
import { AVAILABLE_FORMS } from '@/constants';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblZVnNaE4y8e56fa'; // Available Forms

    if (!token) {
        console.warn('[Available Forms API] Missing AIRTABLE_API_KEY environment variable, returning mock data');
        return NextResponse.json(AVAILABLE_FORMS);
    }

    try {
        const records = await fetchAirtableRecords(baseId, tableId, {
            apiKey: token,
        });

        const forms: AvailableForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            category: 'General', // Category field doesn't exist in this table
            estimatedTime: '', // Estimated Time field doesn't exist in this table
            description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
        }));

        console.log(`[Available Forms API] Successfully fetched ${forms.length} forms from Airtable`);
        return NextResponse.json(forms);
    } catch (error) {
        console.error('[Available Forms API] Airtable fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('[Available Forms API] Error details:', { 
            errorMessage, 
            errorStack,
            hasApiKey: !!token,
            baseId,
            tableId
        });
        
        // Return mock data on error to prevent complete failure
        console.warn('[Available Forms API] Falling back to mock data due to Airtable error');
        return NextResponse.json(AVAILABLE_FORMS);
    }
}
