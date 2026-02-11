import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { updateAirtableRecord } from '@/lib/airtable/update';

export const dynamic = 'force-dynamic';

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

        const body = await request.json();
        const { companyName, industry, website, phone, address } = body;

        const apiKey = process.env.AIRTABLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const fields: Record<string, any> = {};
        
        if (companyName !== undefined) fields['Company Name'] = companyName;
        if (industry !== undefined) fields['Industry'] = industry;
        if (website !== undefined) fields['Website'] = website;
        if (phone !== undefined) fields['Phone Number'] = phone;
        if (address !== undefined) {
            // Parse address if it's a string, or use as-is
            fields['Street Address'] = address;
        }

        const tableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
        const record = await updateAirtableRecord(tableId, companyId, {
            apiKey,
            fields,
        });

        return NextResponse.json({
            success: true,
            message: 'Company details updated successfully',
            recordId: record.id,
        });
    } catch (error: any) {
        console.error('[Company Update API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update company details' },
            { status: 500 }
        );
    }
}
