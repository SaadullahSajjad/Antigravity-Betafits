import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { generateMagicToken, storeMagicToken } from "@/lib/auth/magicToken";
import { fetchAirtableRecords } from "@/lib/airtable/fetch";

export const dynamic = "force-dynamic";

/**
 * Generate a magic link for a user
 * This endpoint is for Ops/Admin use to generate access links
 * In production, add role-based access control
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // TODO: Add role check - only allow ops/admin
        // if (session?.user?.role !== "admin" && session?.user?.role !== "ops") {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        // }

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
        
        console.log(`[Generate Magic Link API] Searching for user with email: ${normalizedEmail}`);

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
                    console.log(`[Generate Magic Link API] Found user using field: ${fieldName}`);
                    break;
                }
            } catch (fieldError) {
                console.log(`[Generate Magic Link API] Field "${fieldName}" not found or error:`, fieldError);
                continue;
            }
        }
        
        // If still no records, try without LOWER (in case formula doesn't support it)
        if (!records || records.length === 0) {
            try {
                records = await fetchAirtableRecords(usersTableId, {
                    apiKey: token,
                    filterByFormula: `{Email} = '${email}'`,
                    maxRecords: 1,
                });
            } catch (error) {
                console.error(`[Generate Magic Link API] Error fetching records:`, error);
            }
        }
        
        // If still no records, fetch all and filter in code (fallback)
        if (!records || records.length === 0) {
            console.log(`[Generate Magic Link API] No records found with filter, trying to fetch all and filter in code...`);
            try {
                const allRecords = await fetchAirtableRecords(usersTableId, {
                    apiKey: token,
                    maxRecords: 100, // Limit to prevent huge fetches
                });
                
                if (allRecords && allRecords.length > 0) {
                    // Filter in code by checking all possible email fields
                    records = allRecords.filter((record: any) => {
                        const fields = record.fields;
                        for (const fieldName of emailFieldVariations) {
                            const fieldValue = fields[fieldName];
                            if (fieldValue && String(fieldValue).toLowerCase().trim() === normalizedEmail) {
                                return true;
                            }
                        }
                        return false;
                    });
                    
                    if (records.length > 0) {
                        console.log(`[Generate Magic Link API] Found user by filtering in code`);
                    }
                }
            } catch (fallbackError) {
                console.error(`[Generate Magic Link API] Fallback fetch error:`, fallbackError);
            }
        }

        if (!records || records.length === 0) {
            console.log(`[Generate Magic Link API] No user found for email: ${normalizedEmail}`);
            console.log(`[Generate Magic Link API] Tried field variations: ${emailFieldVariations.join(', ')}`);
            // Don't reveal if user exists for security, but log for debugging
            return NextResponse.json({
                success: false,
                message: "User not found. Please verify the email address exists in Airtable.",
                debug: process.env.NODE_ENV === 'development' ? `Searched for: ${normalizedEmail}` : undefined,
            });
        }

        const record = records[0];
        const userId = record.id;
        const recordEmail = record.fields["Email"] || record.fields["email"] || record.fields["E-mail"] || "unknown";
        
        console.log(`[Generate Magic Link API] Found user: ${userId}, email in record: ${recordEmail}`);

        // Generate magic token
        const magicToken = generateMagicToken();
        storeMagicToken(magicToken, userId, normalizedEmail, 24); // 24 hour expiry (in-memory backup)
        
        console.log(`[Generate Magic Link API] Token stored in memory: ${magicToken.substring(0, 10)}...`);
        console.log(`[Generate Magic Link API] Token will be valid for 24 hours from: ${new Date().toISOString()}`);

        // Generate magic link URL - Always use production URL, never localhost
        // Priority:
        // 1. PRODUCTION_URL (dedicated env var for production domain)
        // 2. NEXTAUTH_URL (if it's not localhost)
        // 3. Hardcoded production URL
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
        
        // Ensure baseUrl has protocol
        if (baseUrl && !baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        
        const magicLink = `${baseUrl}/access?token=${magicToken}`;

        // Store token in Airtable for persistence across server contexts
        // Always store token for validation (Magic Link field is separate and won't be overwritten)
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;
        
        try {
            const updateResponse = await fetch(updateUrl, {
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

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error("[Generate Magic Link API] Airtable update error:", errorText);
                console.error("[Generate Magic Link API] This might mean the 'Magic Token' or 'Magic Token Expires' fields don't exist in Airtable");
                console.error("[Generate Magic Link API] ERROR: Magic link may not work if server restarts!");
                console.error("[Generate Magic Link API] Please create 'Magic Token' (Single line text) and 'Magic Token Expires' (Number) fields in Airtable Users table");
                // Still return the link - it will work from in-memory storage on the same server instance
                // But will fail if server restarts or it's a different instance
            } else {
                console.log(`[Generate Magic Link API] ✓ Token stored in Airtable for ${email}`);
                console.log(`[Generate Magic Link API] Token: ${magicToken.substring(0, 10)}...`);
                console.log(`[Generate Magic Link API] Expires at: ${new Date(expiresAt).toISOString()}`);
            }
        } catch (updateError) {
            console.error("[Generate Magic Link API] Error updating Airtable:", updateError);
            // Still return the link
        }

        console.log(`[MAGIC LINK] Generated for ${email}: ${magicLink}`);

        return NextResponse.json({
            success: true,
            magicLink,
            message: "Magic link generated",
        });
    } catch (error) {
        console.error("[Generate Magic Link API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
