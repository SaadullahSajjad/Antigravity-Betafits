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
        const airtable = new Airtable({ 
            apiKey: token,
            requestTimeout: 30000
        });
        const base = airtable.base(baseId);
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', { errorMessage, errorStack });
        
        // Return mock data on error to prevent complete failure
        return NextResponse.json(ASSIGNED_FORMS);
    }
}
