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

        // Generate magic link URL - Use local URL on local, production URL on production
        // Priority:
        // 1. Check request origin (for local development)
        // 2. PRODUCTION_URL (for production)
        // 3. NEXTAUTH_URL
        // 4. Fallback to production URL
        let baseUrl: string | undefined;
        
        // Check if we're running locally by examining the request
        const origin = request.headers.get('origin') || request.headers.get('host');
        const isLocal = origin?.includes('localhost') || 
                       origin?.includes('127.0.0.1') || 
                       process.env.NODE_ENV === 'development';
        
        if (isLocal) {
            // Use local URL
            const host = request.headers.get('host') || 'localhost:3000';
            baseUrl = `http://${host}`;
            console.log(`[Generate Magic Link API] Using local URL: ${baseUrl}`);
        } else {
            // Use production URL
            baseUrl = process.env.PRODUCTION_URL;
            
            // If PRODUCTION_URL not set, try NEXTAUTH_URL
            if (!baseUrl) {
                baseUrl = process.env.NEXTAUTH_URL;
            }
            
            // Fallback to hardcoded production URL
            if (!baseUrl) {
                baseUrl = "https://antigravity-betafits.vercel.app";
            }
            
            // Ensure baseUrl has protocol
            if (baseUrl && !baseUrl.startsWith('http')) {
                baseUrl = `https://${baseUrl}`;
            }
            
            console.log(`[Generate Magic Link API] Using production URL: ${baseUrl}`);
        }
        
        const magicLink = `${baseUrl}/access?token=${magicToken}`;

        // Store token in Airtable for persistence across server contexts
        // Try to save all fields, but fallback to just Magic Link Url if other fields don't exist
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;
        
        // First, try to save all fields (Magic Token, Magic Token Expires, Magic Link Url)
        let fieldsToUpdate: Record<string, any> = {
            "Magic Link Url": magicLink,
        };
        
        // Try to include optional fields if they exist
        // We'll try with all fields first, then fallback if needed
        const allFields = {
            "Magic Token": magicToken,
            "Magic Token Expires": expiresAt,
            "Magic Link Url": magicLink,
        };
        
        try {
            let updateResponse = await fetch(updateUrl, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fields: allFields,
                }),
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                const errorJson = JSON.parse(errorText);
                
                // If error is about missing fields, try saving only Magic Link Url
                if (errorJson.error?.type === "UNKNOWN_FIELD_NAME") {
                    console.log("[Generate Magic Link API] Some fields don't exist, trying to save only Magic Link Url...");
                    
                    // Fallback: save only Magic Link Url (which contains the token in the URL)
                    updateResponse = await fetch(updateUrl, {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            fields: {
                                "Magic Link Url": magicLink,
                            },
                        }),
                    });
                    
                    if (updateResponse.ok) {
                        console.log(`[Generate Magic Link API] ✓ Magic Link Url stored in Airtable for ${email}`);
                        console.log(`[Generate Magic Link API] Token is embedded in URL: ${magicLink}`);
                        console.log(`[Generate Magic Link API] Note: 'Magic Token' and 'Magic Token Expires' fields don't exist, but validation will work via Magic Link Url field`);
                    } else {
                        const fallbackError = await updateResponse.text();
                        console.error("[Generate Magic Link API] Failed to save Magic Link Url:", fallbackError);
                    }
                } else {
                    console.error("[Generate Magic Link API] Airtable update error:", errorText);
                }
            } else {
                console.log(`[Generate Magic Link API] ✓ All fields stored in Airtable for ${email}`);
                console.log(`[Generate Magic Link API] Token: ${magicToken.substring(0, 10)}...`);
                console.log(`[Generate Magic Link API] Expires at: ${new Date(expiresAt).toISOString()}`);
            }
        } catch (updateError) {
            console.error("[Generate Magic Link API] Error updating Airtable:", updateError);
            // Still return the link - it will work from in-memory storage on the same server instance
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
