import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

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

        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        const userId = (session.user as any).id;
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID not found' },
                { status: 400 }
            );
        }

        const token = process.env.AIRTABLE_API_KEY;
        const baseId = 'appdqgKk1fmhfaJoT';
        const usersTableId = 'tblU9oY6xmTcCuACh';

        if (!token) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Parse name into first and last name
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;
        const response = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    'First Name': firstName,
                    'Last Name': lastName,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Account Update API] Airtable error:', errorText);
            return NextResponse.json(
                { error: 'Failed to update account' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Account updated successfully',
        });
    } catch (error: any) {
        console.error('[Account Update API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update account' },
            { status: 500 }
        );
    }
}
