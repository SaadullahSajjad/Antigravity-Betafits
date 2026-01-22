import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { AvailableForm } from '@/types';
import { AVAILABLE_FORMS } from '@/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblZVnNaE4y8e56fa'; // Available Forms

    if (!token) {
        return NextResponse.json(AVAILABLE_FORMS);
    }

    try {
        const airtable = new Airtable({ 
            apiKey: token,
            requestTimeout: 30000
        });
        const base = airtable.base(baseId);
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', { errorMessage, errorStack });
        
        // Return mock data on error to prevent complete failure
        return NextResponse.json(AVAILABLE_FORMS);
    }
}
