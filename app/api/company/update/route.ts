import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { updateAirtableRecord } from '@/lib/airtable/update';

export const dynamic = 'force-dynamic';

/** Airtable field name alternatives (primary first; used for retry if primary fails) */
const AIRTABLE_FIELD_ALTERNATIVES: Record<string, string[]> = {
    'Company Name': ['Company Name', 'Name'],
    'Entity Type': ['Entity Type'],
    'Entity Legal Name': ['Entity Legal Name', 'Legal Name'],
    'EIN': ['EIN'],
    'SIC Code': ['SIC Code'],
    'NAICS Code': ['NAICS Code'],
    'Street Address': ['Street Address', 'Address', 'HQ Address'],
    'Renewal Month': ['Renewal Month'],
    'Industry': ['Industry'],
    'Website': ['Website'],
    'First Name': ['First Name'],
    'Last Name': ['Last Name'],
    'Job Title': ['Job Title'],
    'Phone Number': ['Phone Number', 'Phone'],
};

/** Map request body (CompanyData shape) to Airtable Group Data field names (primary names) */
function buildAirtableFields(body: Record<string, any>): Record<string, any> {
    const fields: Record<string, any> = {};
    if (body.name !== undefined) fields['Company Name'] = body.name;
    if (body.companyName !== undefined) fields['Company Name'] = body.companyName;
    if (body.entityType !== undefined) fields['Entity Type'] = body.entityType;
    if (body.legalName !== undefined) fields['Entity Legal Name'] = body.legalName;
    if (body.ein !== undefined) fields['EIN'] = body.ein;
    if (body.sicCode !== undefined) fields['SIC Code'] = body.sicCode;
    if (body.naicsCode !== undefined) fields['NAICS Code'] = body.naicsCode;
    if (body.address !== undefined) fields['Street Address'] = body.address;
    if (body.renewalMonth !== undefined) fields['Renewal Month'] = body.renewalMonth;
    if (body.industry !== undefined) fields['Industry'] = body.industry;
    if (body.website !== undefined) fields['Website'] = body.website;
    const contact = body.contact;
    if (contact && typeof contact === 'object') {
        if (contact.firstName !== undefined) fields['First Name'] = contact.firstName;
        if (contact.lastName !== undefined) fields['Last Name'] = contact.lastName;
        if (contact.jobTitle !== undefined) fields['Job Title'] = contact.jobTitle;
        if (contact.phone !== undefined) fields['Phone Number'] = contact.phone;
    }
    if (body.phone !== undefined) fields['Phone Number'] = body.phone;
    return fields;
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const companyId = await getCompanyId();

        if (!companyId) {
            return NextResponse.json(
                { error: 'User must be linked to a company' },
                { status: 400 }
            );
        }

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        let fields = buildAirtableFields(body);

        if (Object.keys(fields).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const apiKey = process.env.AIRTABLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const tableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
        const maxRetries = 5;
        let retryCount = 0;
        let record: { id: string } | null = null;

        while (retryCount < maxRetries) {
            try {
                record = await updateAirtableRecord(tableId, companyId, {
                    apiKey,
                    fields,
                });
                break;
            } catch (err: any) {
                const msg = (err?.message || '').toLowerCase();
                const isFieldError =
                    err?.message?.includes('UNKNOWN_FIELD_NAME') ||
                    err?.message?.includes('INVALID_VALUE_FOR_COLUMN') ||
                    msg.includes('unknown field') ||
                    msg.includes('invalid value');

                if (!isFieldError || retryCount >= maxRetries - 1) {
                    console.error('[Company Update API] Error:', err);
                    return NextResponse.json(
                        { error: err?.message || 'Failed to update company details' },
                        { status: 500 }
                    );
                }

                const fieldMatch = err?.message?.match(/"([^"]+)"/);
                const invalidField = fieldMatch?.[1];
                if (invalidField && invalidField in fields) {
                    const alternatives = AIRTABLE_FIELD_ALTERNATIVES[invalidField];
                    if (alternatives && alternatives.length > 1) {
                        const nextName = alternatives[alternatives.indexOf(invalidField) + 1];
                        if (nextName) {
                            fields[nextName] = fields[invalidField];
                        }
                    }
                    delete fields[invalidField];
                    retryCount++;
                    continue;
                }
                if (invalidField) {
                    delete fields[invalidField];
                    retryCount++;
                    continue;
                }
                throw err;
            }
        }

        if (!record) {
            return NextResponse.json(
                { error: 'Failed to update company details' },
                { status: 500 }
            );
        }

        try {
            revalidatePath('/company-details');
            revalidatePath('/');
        } catch (_) {}

        return NextResponse.json({
            success: true,
            message: 'Company details updated successfully',
            recordId: record.id,
        });
    } catch (error: any) {
        console.error('[Company Update API] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to update company details' },
            { status: 500 }
        );
    }
}
