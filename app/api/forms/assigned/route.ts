import { NextRequest, NextResponse } from 'next/server';
import { AssignedForm, FormStatus } from '@/types';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { getCompanyId } from '@/lib/auth/getCompanyId';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const tableId = 'tblNeyKm9sKAKZq9n'; // Assigned Forms
    const companyId = await getCompanyId();

    if (!companyId) {
        console.warn('[Assigned Forms API] No company ID - user not authenticated');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all assigned forms and filter in code (ARRAYJOIN doesn't work reliably)
        // Field: "Link to Intake Group Data" (NO hyphen, as per debug_tables.txt)
        const allRecords = await fetchAirtableRecords(tableId, {
            apiKey: process.env.AIRTABLE_API_KEY,
            maxRecords: 100,
        });

        // Filter by company ID in code (more reliable than ARRAYJOIN)
        const records = allRecords?.filter((record) => {
            const linkField = record.fields['Link to Intake Group Data'];
            
            if (!linkField) {
                return false;
            }
            
            // Handle array of linked record IDs
            if (Array.isArray(linkField) && linkField.length > 0) {
                return linkField.some((id: string) => String(id).trim() === String(companyId).trim());
            }
            
            // Handle single linked record ID
            return String(linkField).trim() === String(companyId).trim();
        }) || [];

        if (!records || records.length === 0) {
            return NextResponse.json([]);
        }

        const forms: AssignedForm[] = records.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            status: (record.fields['Status'] as FormStatus) || FormStatus.NOT_STARTED,
            description: String(record.fields['Assigned Form URL'] || ''),
        }));

        console.log(`[Assigned Forms API] Fetched ${forms.length} forms for company ${companyId}`);
        return NextResponse.json(forms);
    } catch (error) {
        console.error('[Assigned Forms API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}

