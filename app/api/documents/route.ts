import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { DocumentArtifact, DocumentStatus } from '@/types';
import { DOCUMENT_ARTIFACTS } from '@/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblBgAZKJln76anVn'; // Documents / Intake - Document Upload

    if (!token) {
        return NextResponse.json(DOCUMENT_ARTIFACTS);
    }

    try {
        const airtable = new Airtable({ 
            apiKey: token,
            requestTimeout: 30000
        });
        const base = airtable.base(baseId);
        const records = await base(tableId)
            .select({
                sort: [{ field: 'Name', direction: 'desc' }],
                maxRecords: 10,
            })
            .all();

        const documents: DocumentArtifact[] = records.map((record) => {
            // Get file name from File attachment array
            const fileField = record.fields['File'];
            const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? fileField[0] : null;
            const fileName = fileAttachment?.filename || String(record.fields['Name'] || '');
            
            // Try to get date from file attachment or use a fallback
            // Airtable file attachments have a 'createdTime' property
            const fileDate = fileAttachment?.createdTime 
                ? new Date(fileAttachment.createdTime).toISOString()
                : new Date().toISOString();
            
            return {
                id: record.id,
                name: String(record.fields['Name'] || record.fields['Extracted Document Title'] || ''),
                status: 'Received' as DocumentStatus, // Status field doesn't exist in this table
                fileName: fileName,
                date: fileDate,
            };
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Documents fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', { errorMessage, errorStack });
        
        // Return mock data on error to prevent complete failure
        return NextResponse.json(DOCUMENT_ARTIFACTS);
    }
}
