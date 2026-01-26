import { NextResponse } from 'next/server';
import { DocumentArtifact, DocumentStatus } from '@/types';
import { DOCUMENT_ARTIFACTS } from '@/constants';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export async function GET() {
    const tableId = 'tblBgAZKJln76anVn'; // Documents / Intake - Document Upload

    try {
        const records = await fetchAirtableRecords(tableId, {
            sort: [{ field: 'Name', direction: 'desc' }],
            maxRecords: 10,
        });

        if (!records || records.length === 0) {
            return NextResponse.json(DOCUMENT_ARTIFACTS);
        }

        const documents: DocumentArtifact[] = records.map((record) => {
            const fileField = record.fields['File'];
            const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
            const fileName = fileAttachment?.filename || String(record.fields['Name'] || '');
            const fileDate = fileAttachment?.createdTime
                ? new Date(fileAttachment.createdTime).toISOString()
                : new Date().toISOString();

            return {
                id: record.id,
                name: String(record.fields['Name'] || record.fields['Extracted Document Title'] || ''),
                status: DocumentStatus.RECEIVED,
                fileName: fileName,
                date: fileDate,
            };
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Documents fetch error:', error);
        return NextResponse.json(DOCUMENT_ARTIFACTS); // Always fallback to mock on error for safety
    }
}
