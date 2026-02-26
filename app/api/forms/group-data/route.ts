import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById } from '@/lib/airtable/fetch';

const GROUP_DATA_TABLE_ID = 'tbliXJ7599ngxEriO'; // Intake - Group Data

/**
 * GET /api/forms/group-data
 * Returns the current company's Group Data record from Airtable.
 * Used to prefill forms with existing data (Airtable → portal sync).
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const companyId = await getCompanyId();
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found. Ensure your account is linked to a company.' },
                { status: 400 }
            );
        }

        const apiKey = process.env.AIRTABLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Airtable not configured' },
                { status: 500 }
            );
        }

        const record = await fetchAirtableRecordById(GROUP_DATA_TABLE_ID, companyId, {
            apiKey,
        });

        if (!record) {
            return NextResponse.json(
                { error: 'Company record not found in Airtable' },
                { status: 404 }
            );
        }

        // Return fields for form prefill; avoid exposing internal IDs/link arrays if not needed
        const fields = record.fields || {};
        return NextResponse.json({
            recordId: record.id,
            fields,
        });
    } catch (error: unknown) {
        console.error('[Group Data API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to load company data' },
            { status: 500 }
        );
    }
}
