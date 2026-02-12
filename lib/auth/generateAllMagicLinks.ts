import { fetchAirtableRecords } from "@/lib/airtable/fetch";
import { generateMagicToken, storeMagicToken } from "@/lib/auth/magicToken";

const baseId = "appdqgKk1fmhfaJoT";
const usersTableId = "tblU9oY6xmTcCuACh";

/**
 * Get the base URL for magic links
 * Always returns production URL, never localhost
 */
function getBaseUrl(): string {
    // Priority order:
    // 1. PRODUCTION_URL env var (explicit production URL)
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
    
    // If still not set, use hardcoded production URL
    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        baseUrl = "https://antigravity-betafits.vercel.app";
    }
    
    // Ensure it has protocol
    if (baseUrl && !baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
    }
    
    return baseUrl;
}

/**
 * Generate magic link URL for a user
 */
function generateMagicLinkUrl(token: string): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/access?token=${token}`;
}

/**
 * Update a single user's magic link URL in Airtable
 */
async function updateUserMagicLink(
    userId: string,
    magicToken: string,
    magicLinkUrl: string,
    apiKey: string
): Promise<boolean> {
    try {
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;
        
        // Only update Magic Link Url field (as requested by user)
        // Other fields (Magic Token, Magic Token Expires) are optional
        const fieldsToUpdate: Record<string, any> = {
            "Magic Link Url": magicLinkUrl,
        };
        
        // Try to also update Magic Token and Magic Token Expires if they exist
        // But don't fail if they don't exist
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        fieldsToUpdate["Magic Token"] = magicToken;
        fieldsToUpdate["Magic Token Expires"] = expiresAt;
        
        const response = await fetch(updateUrl, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields: fieldsToUpdate,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            
            // If error is about unknown fields (Magic Token, Magic Token Expires), 
            // try again with only Magic Link Url
            if (errorData.error?.type === "UNKNOWN_FIELD_NAME") {
                console.log(`[Generate All Magic Links] Some fields don't exist, trying with only Magic Link Url...`);
                
                const retryResponse = await fetch(updateUrl, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fields: {
                            "Magic Link Url": magicLinkUrl,
                        },
                    }),
                });
                
                if (!retryResponse.ok) {
                    const retryErrorText = await retryResponse.text();
                    console.error(`[Generate All Magic Links] Failed to update user ${userId}:`, retryErrorText);
                    return false;
                }
                
                return true;
            }
            
            console.error(`[Generate All Magic Links] Failed to update user ${userId}:`, errorText);
            return false;
        }

        return true;
    } catch (error: any) {
        console.error(`[Generate All Magic Links] Error updating user ${userId}:`, error);
        return false;
    }
}

/**
 * Generate and update magic link URLs for all users in the Intake - Users table
 * 
 * @param options Optional configuration
 * @returns Summary of the operation
 */
export async function generateAllUsersMagicLinks(options: {
    apiKey?: string;
    onlyActive?: boolean;
    batchSize?: number;
} = {}): Promise<{
    success: boolean;
    totalUsers: number;
    updated: number;
    failed: number;
    skipped: number;
    errors: string[];
}> {
    const apiKey = options.apiKey || process.env.AIRTABLE_API_KEY;
    const onlyActive = options.onlyActive ?? true;
    const batchSize = options.batchSize || 10; // Process in batches to avoid rate limits

    if (!apiKey) {
        throw new Error("AIRTABLE_API_KEY is required");
    }

    const errors: string[] = [];
    let totalUsers = 0;
    let updated = 0;
    let failed = 0;
    let skipped = 0;

    try {
        console.log("[Generate All Magic Links] Fetching all users from Airtable...");

        // Fetch all users (we'll filter by status in code to avoid field name issues)
        let allUsers: any[] = [];
        try {
            // Try to fetch with status filter first
            if (onlyActive) {
                const statusFieldVariations = ['Status', 'status', 'User Status', 'Account Status'];
                for (const fieldName of statusFieldVariations) {
                    try {
                        allUsers = await fetchAirtableRecords(usersTableId, {
                            apiKey,
                            filterByFormula: `{${fieldName}} = 'active'`,
                        });
                        if (allUsers.length > 0) {
                            console.log(`[Generate All Magic Links] Found users using status field: ${fieldName}`);
                            break;
                        }
                    } catch (filterError: any) {
                        // Field name doesn't match, try next
                        continue;
                    }
                }
            }
            
            // If filter didn't work or we want all users, fetch all
            if (allUsers.length === 0) {
                console.log("[Generate All Magic Links] Fetching all users (no status filter)...");
                allUsers = await fetchAirtableRecords(usersTableId, {
                    apiKey,
                });
            }
        } catch (fetchError: any) {
            console.error("[Generate All Magic Links] Error fetching users:", fetchError);
            throw fetchError;
        }

        totalUsers = allUsers.length;
        console.log(`[Generate All Magic Links] Found ${totalUsers} user(s) to process`);

        if (totalUsers === 0) {
            return {
                success: true,
                totalUsers: 0,
                updated: 0,
                failed: 0,
                skipped: 0,
                errors: [],
            };
        }

        // Process users in batches
        for (let i = 0; i < allUsers.length; i += batchSize) {
            const batch = allUsers.slice(i, i + batchSize);
            console.log(`[Generate All Magic Links] Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} users)...`);

            // Process batch in parallel
            const batchPromises = batch.map(async (user: any) => {
                const userId = user.id;
                const fields = user.fields;
                
                // Get user email (try multiple field variations)
                const email = fields["Email"] || fields["email"] || fields["E-mail"] || fields["User Email"] || "";
                
                if (!email) {
                    console.log(`[Generate All Magic Links] Skipping user ${userId} - no email found`);
                    skipped++;
                    return;
                }

                // Check if user is active (if filtering by active)
                if (onlyActive) {
                    // Try multiple field name variations for status
                    const statusFieldVariations = ['Status', 'status', 'User Status', 'Account Status'];
                    let userStatus = "active";
                    for (const fieldName of statusFieldVariations) {
                        if (fields[fieldName]) {
                            userStatus = String(fields[fieldName]).toLowerCase();
                            break;
                        }
                    }
                    
                    if (userStatus !== "active") {
                        console.log(`[Generate All Magic Links] Skipping user ${userId} - status: ${userStatus}`);
                        skipped++;
                        return;
                    }
                }

                // Generate magic token
                const magicToken = generateMagicToken();
                const magicLinkUrl = generateMagicLinkUrl(magicToken);
                
                // Store in memory
                storeMagicToken(magicToken, userId, String(email).toLowerCase().trim(), 24);
                
                // Update in Airtable
                const success = await updateUserMagicLink(userId, magicToken, magicLinkUrl, apiKey);
                
                if (success) {
                    updated++;
                    console.log(`[Generate All Magic Links] ✓ Updated magic link for ${email}`);
                } else {
                    failed++;
                    const errorMsg = `Failed to update magic link for user ${userId} (${email})`;
                    errors.push(errorMsg);
                    console.error(`[Generate All Magic Links] ✗ ${errorMsg}`);
                }
            });

            await Promise.all(batchPromises);

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < allUsers.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        console.log(`[Generate All Magic Links] Complete! Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}`);

        return {
            success: failed === 0,
            totalUsers,
            updated,
            failed,
            skipped,
            errors,
        };
    } catch (error: any) {
        console.error("[Generate All Magic Links] Error:", error);
        return {
            success: false,
            totalUsers,
            updated,
            failed,
            skipped,
            errors: [...errors, error.message || String(error)],
        };
    }
}
