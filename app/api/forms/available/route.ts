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

        // Filter: respect visibility controls - only show forms explicitly marked for prospect portal
        const ADMIN_CATEGORIES = ['admin', 'system', 'system admin', 'administrator', 'internal only', 'admin only', 'internal'];
        const ADMIN_ASSIGNMENT_TYPES = ['admin', 'system', 'admin only', 'system only', 'administrator'];
        const RESTRICTED_VISIBILITY_KEYWORDS = ['admin', 'internal', 'hide', 'restricted', 'private', 'system', 'staff only', 'employees only'];
        const filteredRecords = allRecords.filter((record: any) => {
            // Filter out "Coming Soon" forms
            const status = String(record.fields['Status'] || '').toLowerCase();
            const name = String(record.fields['Name'] || '').toLowerCase();
            if (status.includes('coming soon') || name.includes('coming soon')) {
                return false;
            }
            // Respect Show in Available Forms: exclude when No; require Yes when field exists
            const showInAvailable = record.fields['Show in Available Forms'];
            if (showInAvailable === false || showInAvailable === 'No' || showInAvailable === 'no') {
                return false;
            }
            if (showInAvailable !== undefined && showInAvailable !== null) {
                const isExplicitlyShown = showInAvailable === true || showInAvailable === 'Yes' || showInAvailable === 'yes' || (typeof showInAvailable === 'object' && showInAvailable?.label === 'Yes');
                if (!isExplicitlyShown) return false;
            }
            // Respect Visibility Rules: exclude forms with restricted visibility
            const visibilityRules = String(record.fields['Visibility Rules'] || '').toLowerCase().trim();
            if (visibilityRules) {
                const isRestricted = RESTRICTED_VISIBILITY_KEYWORDS.some((kw) => visibilityRules.includes(kw));
                if (isRestricted) return false;
            }
            const assignmentType = String(record.fields['Assignment Type'] || '').toLowerCase().trim();
            if (assignmentType && ADMIN_ASSIGNMENT_TYPES.includes(assignmentType)) {
                return false;
            }
            const category = String(record.fields['Category'] || '').toLowerCase().trim();
            if (category && ADMIN_CATEGORIES.includes(category)) {
                return false;
            }
            // Filter out forms that are already assigned to this company
            if (assignedAvailableFormIds.includes(record.id)) {
                return false;
            }
            return true;
        });

        console.log(`[Available Forms API] Returning ${filteredRecords.length} user-assignable forms (excluded system admin actions)`);

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
