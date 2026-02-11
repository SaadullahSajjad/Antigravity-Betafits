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

        const documents: DocumentArtifact[] = records
            .map((record) => {
            const fileField = record.fields['File'];
            console.log(`[Documents API] Processing document ${record.id}, File field:`, fileField);
            
            // Airtable file attachments can be an array of objects
            const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
            
            if (fileAttachment) {
                console.log(`[Documents API] File attachment found:`, {
                    id: fileAttachment.id,
                    url: fileAttachment.url,
                    filename: fileAttachment.filename,
                });
            } else {
                console.warn(`[Documents API] No file attachment found for document ${record.id}`);
            }
            
            const fileName = fileAttachment?.filename || String(record.fields['Name'] || '');
            const fileDate = fileAttachment?.createdTime
                ? new Date(fileAttachment.createdTime).toISOString()
                : record.createdTime
                ? new Date(record.createdTime).toISOString()
                : new Date().toISOString();

            // Get the document URL - Airtable attachment objects have a 'url' property
            let documentUrl = fileAttachment?.url;
            
            // If Airtable attachment URL exists, use it directly
            if (documentUrl && typeof documentUrl === 'string' && documentUrl.trim() !== '') {
                if (documentUrl.startsWith('https://dl.airtable.com')) {
                    // This is Airtable's attachment URL - use it directly
                    console.log(`[Documents API] Using Airtable attachment URL for document ${record.id}`);
                } else if (documentUrl.includes('/api/files/')) {
                    // This is our file storage URL - ensure it's accessible
                    const fileIdMatch = documentUrl.match(/\/api\/files\/([^\/\?]+)/);
                    if (fileIdMatch) {
                        const fileId = fileIdMatch[1];
                        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                        documentUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${fileId}`;
                        console.log(`[Documents API] Reconstructed file storage URL for document ${record.id}`);
                    }
                }
            } else {
                // No URL from Airtable attachment - try to reconstruct from stored fileId or File URL
                const fileId = record.fields['File ID'] || record.fields['FileId'] || record.fields['file_id'];
                const storedFileUrl = record.fields['File URL'] || record.fields['FileUrl'] || record.fields['file_url'];
                
                if (fileId && typeof fileId === 'string') {
                    // Reconstruct URL from stored fileId
                    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                    documentUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${fileId}`;
                    console.log(`[Documents API] Reconstructed URL from stored fileId for document ${record.id}`);
                } else if (storedFileUrl && typeof storedFileUrl === 'string' && storedFileUrl.includes('/api/files/')) {
                    // Use stored file URL
                    const fileIdMatch = storedFileUrl.match(/\/api\/files\/([^\/\?]+)/);
                    if (fileIdMatch) {
                        const extractedFileId = fileIdMatch[1];
                        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                        documentUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${extractedFileId}`;
                        console.log(`[Documents API] Reconstructed URL from stored File URL for document ${record.id}`);
                    }
                } else {
                    console.warn(`[Documents API] Document ${record.id} has no file URL, fileId, or stored URL`);
                    documentUrl = undefined;
                }
            }

                    // Only return documents that have a valid file attachment or URL
                    // Documents without files are likely failed uploads or incomplete records
                    if (!documentUrl && !fileAttachment) {
                        console.warn(`[Documents API] Skipping document ${record.id} - no file attachment found`);
                        return null;
                    }

                    return {
                        id: record.id,
                        name: String(record.fields['Name'] || record.fields['Extracted Document Title'] || fileName || 'Untitled Document'),
                        status: DocumentStatus.RECEIVED,
                        fileName: fileName,
                        date: fileDate,
                        url: documentUrl,
                    };
            })
            .filter((doc) => doc !== null) as DocumentArtifact[]; // Filter out null documents

        console.log(`[Documents API] Fetched ${documents.length} documents for company ${companyId}`);
        return NextResponse.json(documents);
    } catch (error) {
        console.error('[Documents API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}

