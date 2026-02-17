import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { AvailableForm } from '@/types';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const tableId = 'tblZVnNaE4y8e56fa'; // Available Forms
    const companyId = await getCompanyId();

    try {
        // Fetch all available forms
        const allRecords = await fetchAirtableRecords(tableId, {
            apiKey: process.env.AIRTABLE_API_KEY,
            maxRecords: 100,
        });

        if (!allRecords || allRecords.length === 0) {
            return NextResponse.json([]);
        }

        // Get list of Available Form IDs that are already assigned to this company
        const assignedAvailableFormIds: string[] = [];
        if (companyId) {
            try {
                const assignedFormsTableId = 'tblNeyKm9sKAKZq9n'; // Assigned Forms
                const allAssignedRecords = await fetchAirtableRecords(assignedFormsTableId, {
                    apiKey: process.env.AIRTABLE_API_KEY,
                    maxRecords: 100,
                });

                if (allAssignedRecords && allAssignedRecords.length > 0) {
                    // Filter assigned forms by company ID
                    const companyAssignedForms = allAssignedRecords.filter((record: any) => {
                        const linkField = record.fields['Link to Intake Group Data'];
                        
                        if (!linkField) {
                            return false;
                        }
                        
                        if (Array.isArray(linkField) && linkField.length > 0) {
                            return linkField.some((id: string) => String(id).trim() === String(companyId).trim());
                        }
                        
                        return String(linkField).trim() === String(companyId).trim();
                    });

                    // Extract Available Form IDs from assigned forms
                    companyAssignedForms.forEach((assignedRecord: any) => {
                        const linkToAvailable = assignedRecord.fields['Link to Available Forms'];
                        if (linkToAvailable) {
                            const linkedIds = Array.isArray(linkToAvailable) ? linkToAvailable : [linkToAvailable];
                            linkedIds.forEach((id: string) => {
                                if (!assignedAvailableFormIds.includes(String(id).trim())) {
                                    assignedAvailableFormIds.push(String(id).trim());
                                }
                            });
                        }
                    });
                }
            } catch (error) {
                console.warn('[Available Forms API] Error fetching assigned forms:', error);
            }
        }

        // Filter: exclude "Coming Soon" and already assigned forms
        const filteredRecords = allRecords.filter((record: any) => {
            // Filter out "Coming Soon" forms
            const status = String(record.fields['Status'] || '').toLowerCase();
            const name = String(record.fields['Name'] || '').toLowerCase();
            if (status.includes('coming soon') || name.includes('coming soon')) {
                return false;
            }
            
            // Filter out forms that are already assigned to this company
            if (assignedAvailableFormIds.includes(record.id)) {
                return false;
            }
            
            return true;
        });

        const forms: AvailableForm[] = filteredRecords.map((record) => ({
            id: record.id,
            name: String(record.fields['Name'] || ''),
            category: String(record.fields['Category'] || 'General'),
            estimatedTime: String(record.fields['Estimated Time'] || record.fields['Estimated Completion Time'] || record.fields['Completion Time'] || ''),
            description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
        }));

        return NextResponse.json(forms);
    } catch (error) {
        console.error('[Available Forms API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
