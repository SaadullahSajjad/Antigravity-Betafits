import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { DocumentArtifact, DocumentStatus } from '@/types';
import { DOCUMENT_ARTIFACTS } from '@/constants';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblK7H9dLxLqX3kR2Y'; // Intake - Document Upload

    if (!token) {
        return NextResponse.json(DOCUMENT_ARTIFACTS);
    }

    try {
        const base = new Airtable({ apiKey: token }).base(baseId);
        const records = await base(tableId)
            .select({
                sort: [{ field: 'Upload Date', direction: 'desc' }],
                maxRecords: 10,
            })
            .all();

        const documents: DocumentArtifact[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Document Name'] || ''),
            status: String(record.fields['Status'] || 'Received') as DocumentStatus,
            fileName: String(record.fields['File Name'] || ''),
            date: String(record.fields['Upload Date'] || ''),
        }));

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Documents fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
