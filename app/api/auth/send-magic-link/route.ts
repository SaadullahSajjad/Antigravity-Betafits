import { NextRequest, NextResponse } from "next/server";
import { generateMagicToken, storeMagicToken } from "@/lib/auth/magicToken";
import { fetchAirtableRecords } from "@/lib/airtable/fetch";

export const dynamic = "force-dynamic";

/**
 * Send a magic link to a user's email
 * Public endpoint for login flow (no authentication required)
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const token = process.env.AIRTABLE_API_KEY;
        const baseId = "appdqgKk1fmhfaJoT";
        const usersTableId = "tblU9oY6xmTcCuACh";

        if (!token) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Normalize email for matching (lowercase, trim)
        const normalizedEmail = email.toLowerCase().trim();
        
        console.log(`[Send Magic Link API] Searching for user with email: ${normalizedEmail}`);

        // Find user by email - try multiple field name variations
        let records: any[] = [];
        const emailFieldVariations = ['Email', 'email', 'E-mail', 'User Email', 'Email Address'];
        
        for (const fieldName of emailFieldVariations) {
            try {
                records = await fetchAirtableRecords(usersTableId, {
                    apiKey: token,
                    filterByFormula: `LOWER({${fieldName}}) = '${normalizedEmail}'`,
                    maxRecords: 1,
                });
                
                if (records && records.length > 0) {
                    console.log(`[Send Magic Link API] Found user using field: ${fieldName}`);
                    break;
                }
            } catch (fieldError: any) {
                // Field doesn't exist, try next variation
                console.log(`[Send Magic Link API] Field '${fieldName}' not found, trying next...`);
                continue;
            }
        }

        if (!records || records.length === 0) {
            // Don't reveal if user exists for security - always return success message
            // This prevents email enumeration attacks
            console.log(`[Send Magic Link API] No user found for email: ${normalizedEmail}`);
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, a magic link has been sent.",
            });
        }

        const record = records[0];
        const userId = record.id;
        const fields = record.fields;

        // Check if user is active
        const status = String(fields["Status"] || "active").toLowerCase();
        if (status !== "active") {
            // Don't reveal account status - return generic success
            console.log(`[Send Magic Link API] User account is disabled: ${normalizedEmail}`);
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, a magic link has been sent.",
            });
        }

        // Generate magic token
        const magicToken = generateMagicToken();
        storeMagicToken(magicToken, userId, normalizedEmail, 24); // 24 hour expiry
        
        console.log(`[Send Magic Link API] Token generated: ${magicToken.substring(0, 10)}...`);

        // Generate magic link URL - Always use production URL, never localhost
        let baseUrl = process.env.PRODUCTION_URL;
        
        // If PRODUCTION_URL not set, try NEXTAUTH_URL (but skip if it's localhost)
        if (!baseUrl) {
            const nextAuthUrl = process.env.NEXTAUTH_URL;
            if (nextAuthUrl && !nextAuthUrl.includes('localhost') && !nextAuthUrl.includes('127.0.0.1')) {
                baseUrl = nextAuthUrl;
            }
        }
        
        // Always use production URL, never localhost
        if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = "https://antigravity-betafits.vercel.app";
        }
        
        if (baseUrl && !baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        
        const magicLink = `${baseUrl}/access?token=${magicToken}`;

        // Store token and full magic link URL in Airtable for persistence
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;
        
        try {
            await fetch(updateUrl, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fields: {
                        "Magic Token": magicToken,
                        "Magic Token Expires": expiresAt,
                        "Magic Link Url": magicLink,
                    },
                }),
            });
            console.log(`[Send Magic Link API] Token and magic link URL stored in Airtable for user: ${userId}`);
        } catch (updateError: any) {
            console.error(`[Send Magic Link API] Failed to store token in Airtable:`, updateError);
            // Continue anyway - token is stored in memory
        }

        // TODO: Send email with magic link
        // For now, we'll just return success
        // In production, integrate with email service (SendGrid, Resend, etc.)
        console.log(`[Send Magic Link API] Magic link generated: ${magicLink}`);
        console.log(`[Send Magic Link API] TODO: Send email to ${normalizedEmail} with magic link`);

        // Return success (don't expose the magic link in response for security)
        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, a magic link has been sent.",
        });
    } catch (error: any) {
        console.error("[Send Magic Link API] Error:", error);
        return NextResponse.json(
            { 
                error: "An error occurred. Please try again.",
                ...(process.env.NODE_ENV === 'development' ? { details: error.message } : {})
            },
            { status: 500 }
        );
    }
}
