import { NextResponse } from 'next/server';
import { DocumentArtifact, DocumentStatus } from '@/types';
import { DOCUMENT_ARTIFACTS } from '@/constants';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.AIRTABLE_API_KEY;
    const baseId = 'appdqgKk1fmhfaJoT';
    const tableId = 'tblBgAZKJln76anVn'; // Documents / Intake - Document Upload

    if (!token) {
        console.warn('[Documents API] Missing AIRTABLE_API_KEY environment variable, returning mock data');
        return NextResponse.json(DOCUMENT_ARTIFACTS);
    }

    try {
        const records = await fetchAirtableRecords(baseId, tableId, {
            apiKey: token,
            maxRecords: 10,
            sort: [{ field: 'Name', direction: 'desc' }],
        });

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

        console.log(`[Documents API] Successfully fetched ${documents.length} documents from Airtable`);
        return NextResponse.json(documents);
    } catch (error) {
        console.error('[Documents API] Airtable fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('[Documents API] Error details:', { 
            errorMessage, 
            errorStack,
            hasApiKey: !!token,
            baseId,
            tableId
        });
        
        // Return mock data on error to prevent complete failure
        console.warn('[Documents API] Falling back to mock data due to Airtable error');
        return NextResponse.json(DOCUMENT_ARTIFACTS);
    }
}
