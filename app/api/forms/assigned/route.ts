import { NextResponse } from 'next/server';
import { AssignedForm, FormStatus } from '@/types';
import { ASSIGNED_FORMS } from '@/constants';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblNeyKm9sKAKZq9n'; // Assigned Forms

    if (!token) {
        console.warn('[Assigned Forms API] Missing AIRTABLE_API_KEY environment variable, returning mock data');
        return NextResponse.json(ASSIGNED_FORMS);
    }

    try {
        const records = await fetchAirtableRecords(baseId, tableId, {
            apiKey: token,
        });

        const forms: AssignedForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            status: String(record.fields['Status'] || 'Not Started') as FormStatus,
            description: String(record.fields['Assigned Form URL'] || ''),
            dueDate: undefined, // Due Date field doesn't exist in this table
        }));

        console.log(`[Assigned Forms API] Successfully fetched ${forms.length} forms from Airtable`);
        return NextResponse.json(forms);
    } catch (error) {
        console.error('[Assigned Forms API] Airtable fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('[Assigned Forms API] Error details:', { 
            errorMessage, 
            errorStack,
            hasApiKey: !!token,
            baseId,
            tableId
        });
        
        // Return mock data on error to prevent complete failure
        console.warn('[Assigned Forms API] Falling back to mock data due to Airtable error');
        return NextResponse.json(ASSIGNED_FORMS);
    }
}
