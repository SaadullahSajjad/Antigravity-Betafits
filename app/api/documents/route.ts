import { NextRequest, NextResponse } from 'next/server';
import { DocumentArtifact, DocumentStatus } from '@/types';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { getCompanyId } from '@/lib/auth/getCompanyId';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const tableId = 'tblBgAZKJln76anVn'; // Documents / Intake - Document Upload
    const companyId = await getCompanyId();

    if (!companyId) {
        console.warn('[Documents API] No company ID - user not authenticated');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Filter documents by company ID
        const records = await fetchAirtableRecords(tableId, {
            apiKey: process.env.AIRTABLE_API_KEY,
            filterByFormula: `{Company} = '${companyId}'`,
            sort: [{ field: 'Name', direction: 'desc' }],
            maxRecords: 20,
        });

        if (!records || records.length === 0) {
            return NextResponse.json([]);
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
                url: fileAttachment?.url,
            };
        });

        console.log(`[Documents API] Fetched ${documents.length} documents for company ${companyId}`);
        return NextResponse.json(documents);
    } catch (error) {
        console.error('[Documents API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}

