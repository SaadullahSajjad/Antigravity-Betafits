import { NextRequest, NextResponse } from "next/server";
import { generateMagicToken, storeMagicToken } from "@/lib/auth/magicToken";
import { fetchAirtableRecords } from "@/lib/airtable/fetch";
import { sendMagicLinkEmail } from "@/lib/email/sendMagicLink";

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

        // Get user's name if available (try common field name variations)
        const userName = fields["Name"] || 
                         fields["Full Name"] || 
                         fields["User Name"] || 
                         fields["First Name"] || 
                         undefined;

        // Generate magic token
        const magicToken = generateMagicToken();
        storeMagicToken(magicToken, userId, normalizedEmail, 24); // 24 hour expiry
        
        console.log(`[Send Magic Link API] Token generated: ${magicToken.substring(0, 10)}...`);

        // Generate magic link URL - Always prioritize production URLs
        // Priority:
        // 1. PRODUCTION_URL (for production)
        // 2. NEXTAUTH_URL
        // 3. Check if actually running locally (only if no production URL set)
        // 4. Fallback to production URL
        let baseUrl: string | undefined;
        
        // First, try production URLs (these should always be used in production)
        baseUrl = process.env.PRODUCTION_URL || process.env.NEXTAUTH_URL;
        
        // Only use localhost if no production URL is configured AND we're actually running locally
        if (!baseUrl) {
            const origin = request.headers.get('origin') || request.headers.get('host');
            const isActuallyLocal = origin?.includes('localhost') || origin?.includes('127.0.0.1');
            
            if (isActuallyLocal) {
                // Use local URL only if we're actually running locally
                const host = request.headers.get('host') || 'localhost:3000';
                baseUrl = `http://${host}`;
                console.log(`[Send Magic Link API] Using local URL: ${baseUrl}`);
            } else {
                // Fallback to hardcoded production URL
                baseUrl = "https://antigravity-betafits.vercel.app";
                console.log(`[Send Magic Link API] Using fallback production URL: ${baseUrl}`);
            }
        } else {
            // Ensure baseUrl has protocol
            if (!baseUrl.startsWith('http')) {
                baseUrl = `https://${baseUrl}`;
            }
            console.log(`[Send Magic Link API] Using production URL: ${baseUrl}`);
        }
        
        const magicLink = `${baseUrl}/access?token=${magicToken}`;

        // Store token and full magic link URL in Airtable for persistence
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;
        
        try {
            // Try to save all fields first
            let updateResponse = await fetch(updateUrl, {
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
                const errorJson = JSON.parse(errorText);
                
                // If error is about missing fields, try saving only Magic Link Url
                if (errorJson.error?.type === "UNKNOWN_FIELD_NAME") {
                    console.log("[Send Magic Link API] Some fields don't exist, trying to save only Magic Link Url...");
                    
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
                        console.log(`[Send Magic Link API] ✓ Magic Link Url stored in Airtable for user: ${userId}`);
                        console.log(`[Send Magic Link API] Token is embedded in URL: ${magicLink}`);
                    } else {
                        const fallbackError = await updateResponse.text();
                        console.error(`[Send Magic Link API] Failed to store Magic Link Url:`, fallbackError);
                    }
                } else {
                    console.error(`[Send Magic Link API] Failed to store token in Airtable:`, errorText);
                }
            } else {
                console.log(`[Send Magic Link API] ✓ All fields stored in Airtable for user: ${userId}`);
            }
        } catch (updateError: any) {
            console.error(`[Send Magic Link API] Failed to store token in Airtable:`, updateError);
            // Continue anyway - token is stored in memory
        }

        // Send email with magic link
        console.log(`[Send Magic Link API] Magic link generated: ${magicLink}`);
        const emailResult = await sendMagicLinkEmail({
            email: normalizedEmail,
            magicLink,
            userName,
        });

        if (!emailResult.success) {
            console.error(`[Send Magic Link API] Failed to send email: ${emailResult.error}`);
            // Still return success to user (don't reveal email service issues)
            // Log the error for debugging
        } else {
            console.log(`[Send Magic Link API] Magic link email sent successfully to ${normalizedEmail}`);
        }

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
