import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { fetchAirtableRecords } from "@/lib/airtable/fetch";
import { verifyPassword } from "@/lib/auth/password";
import { validateMagicToken, markMagicTokenAsUsed, magicTokens } from "@/lib/auth/magicToken";

export const authOptions: NextAuthOptions = {
    providers: [
        // Google SSO
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        // LinkedIn SSO (optional - add when credentials are available)
        // Uncomment and configure when LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET are set
        // ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
        //     ? [
        //           {
        //               id: "linkedin",
        //               name: "LinkedIn",
        //               type: "oauth",
        //               authorization: {
        //                   url: "https://www.linkedin.com/oauth/v2/authorization",
        //                   params: { scope: "openid profile email" },
        //               },
        //               token: "https://www.linkedin.com/oauth/v2/accessToken",
        //               userinfo: "https://api.linkedin.com/v2/userinfo",
        //               clientId: process.env.LINKEDIN_CLIENT_ID,
        //               clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        //           },
        //       ]
        //     : []),
        // Email + Password
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your@email.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const token = process.env.AIRTABLE_API_KEY;
                const baseId = "appdqgKk1fmhfaJoT";
                const usersTableId = "tblU9oY6xmTcCuACh"; // Intake - Users table

                if (!token) {
                    console.error("Missing AIRTABLE_API_KEY");
                    return null;
                }

                try {
                    // Query Airtable for user with matching email
                    const records = await fetchAirtableRecords(usersTableId, {
                        apiKey: token,
                        filterByFormula: `{Email} = '${credentials.email}'`,
                        maxRecords: 1,
                    });

                    if (!records || records.length === 0) {
                        console.log("User not found:", credentials.email);
                        return null;
                    }

                    const record = records[0];
                    const fields = record.fields;

                    // Check if user is active
                    const status = String(fields["Status"] || "active").toLowerCase();
                    if (status !== "active") {
                        console.log("User account is disabled:", credentials.email);
                        return null;
                    }

                    // Verify password
                    const passwordHash = String(fields["Password Hash"] || "");
                    if (!passwordHash) {
                        console.log("User has no password set:", credentials.email);
                        return null;
                    }

                    const isValidPassword = await verifyPassword(credentials.password, passwordHash);
                    if (!isValidPassword) {
                        console.log("Invalid password for:", credentials.email);
                        return null;
                    }

                    // Extract user data
                    const user = {
                        id: record.id,
                        email: String(fields["Email"] || ""),
                        firstName: String(fields["First Name"] || ""),
                        lastName: String(fields["Last Name"] || ""),
                        companyId: Array.isArray(fields["Intake - Group Data"])
                            ? fields["Intake - Group Data"][0]
                            : Array.isArray(fields["Link to Intake - Group Data"])
                                ? fields["Link to Intake - Group Data"][0]
                                : Array.isArray(fields["Company Name"])
                                    ? fields["Company Name"][0]
                                    : (fields["Company"] || process.env.DEFAULT_COMPANY_ID || ""),
                        role: String(fields["Role"] || "prospect"),
                        mustChangePassword: Boolean(fields["Must Change Password"] || false),
                    };

                    console.log("[Auth] User authenticated:", user.email, "| ID:", user.id);
                    console.log("[Auth] Linked Company ID:", user.companyId);

                    return user;
                } catch (error) {
                    console.error("Airtable authentication error:", error);
                    return null;
                }
            },
        }),
        // Magic Link (via credentials provider with token)
        CredentialsProvider({
            id: "magic-link",
            name: "Magic Link",
            credentials: {
                token: { label: "Magic Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.token) {
                    return null;
                }

                const token = process.env.AIRTABLE_API_KEY;
                const baseId = "appdqgKk1fmhfaJoT";
                const usersTableId = "tblU9oY6xmTcCuACh";

                if (!token) {
                    console.error("Missing AIRTABLE_API_KEY");
                    return null;
                }

                try {
                    // First, try to validate from in-memory storage (faster)
                    console.log(`[Magic Link Auth] Validating token: ${credentials.token.substring(0, 10)}...`);
                    let tokenData = validateMagicToken(credentials.token);
                    let tokenFromMemory = !!tokenData;
                    console.log(`[Magic Link Auth] Token in memory: ${tokenFromMemory ? 'YES' : 'NO'}`);
                    
                    let record: any = null;
                    let fields: any = null;

                    // If not in memory, check Airtable (for persistence across server contexts)
                    if (!tokenData) {
                        console.log("[Magic Link Auth] Token not in memory, checking Airtable...");
                        // Try to find token in Airtable
                        // Note: If Magic Token field doesn't exist, this will fail
                        // In that case, we'll rely on in-memory storage only
                        let records: any[] = [];
                        let airtableError: any = null;
                        try {
                            records = await fetchAirtableRecords(usersTableId, {
                                apiKey: token,
                                filterByFormula: `{Magic Token} = '${credentials.token}'`,
                                maxRecords: 1,
                            });
                        } catch (filterError: any) {
                            airtableError = filterError;
                            // If field doesn't exist, try alternative field names or skip Airtable lookup
                            console.log("[Magic Link Auth] Magic Token field may not exist, trying alternatives...");
                            console.log("[Magic Link Auth] Error details:", filterError);
                            try {
                                records = await fetchAirtableRecords(usersTableId, {
                                    apiKey: token,
                                    filterByFormula: `{magic token} = '${credentials.token}'`,
                                    maxRecords: 1,
                                });
                            } catch (e) {
                                // If all attempts fail, token is not in Airtable - rely on in-memory only
                                console.log("[Magic Link Auth] Magic Token field not found in Airtable, using in-memory storage only");
                                console.log("[Magic Link Auth] Alternative field name also failed:", e);
                            }
                        }

                        if (records && records.length > 0) {
                            record = records[0];
                            fields = record.fields;
                            const expiresAt = Number(fields["Magic Token Expires"] || 0);
                            
                            // Check if token is expired
                            if (expiresAt > 0 && Date.now() > expiresAt) {
                                console.log("[Magic Link Auth] Magic token expired");
                                return null;
                            }

                            // Create tokenData object for consistency
                            tokenData = {
                                token: credentials.token,
                                userId: record.id,
                                email: String(fields["Email"] || fields["email"] || ""),
                                expiresAt: expiresAt || (Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours if not set
                            };

                            console.log("[Magic Link Auth] Token found in Airtable for user:", tokenData.email);
                        } else {
                            // Token not found in Airtable - this might mean:
                            // 1. The Magic Token field doesn't exist in Airtable
                            // 2. The token wasn't stored properly
                            // 3. We're on a different server instance
                            // Since the token is not in memory and not in Airtable, we cannot validate it
                            // BUT: If this is a fresh token generation, it should be in memory
                            // The issue is likely that the server restarted or it's a different instance
                            console.error("[Magic Link Auth] Magic token not found in Airtable");
                            console.error("[Magic Link Auth] Token:", credentials.token.substring(0, 10) + "...");
                            console.error("[Magic Link Auth] Airtable error:", airtableError);
                            console.error("[Magic Link Auth] This usually means:");
                            console.error("[Magic Link Auth] 1. The 'Magic Token' field doesn't exist in Airtable Users table");
                            console.error("[Magic Link Auth] 2. The token wasn't stored properly when generated");
                            console.error("[Magic Link Auth] 3. The server instance changed and in-memory storage was lost");
                            console.error("[Magic Link Auth] 4. The token was generated on a different server instance");
                            
                            // IMPORTANT: For development/localhost, if Airtable fields don't exist,
                            // we should still allow the magic link to work if it was just generated
                            // The token should be in memory on the same server instance
                            // If it's not, it means the server restarted or it's a different instance
                            // In that case, we need to ensure tokens are stored in Airtable properly
                            
                            return null;
                        }
                    } else {
                        // Token found in memory, fetch user record
                        console.log("[Magic Link Auth] Token found in memory, fetching user...");
                        const records = await fetchAirtableRecords(usersTableId, {
                            apiKey: token,
                            filterByFormula: `RECORD_ID() = '${tokenData.userId}'`,
                            maxRecords: 1,
                        });

                        if (!records || records.length === 0) {
                            console.log("[Magic Link Auth] User not found for magic token");
                            return null;
                        }

                        record = records[0];
                        fields = record.fields;
                    }

                    if (!tokenData || !record || !fields) {
                        console.log("[Magic Link Auth] Invalid or expired magic token - missing data");
                        return null;
                    }

                    // Check if user is active
                    const status = String(fields["Status"] || "active").toLowerCase();
                    if (status !== "active") {
                        console.log("[Magic Link Auth] User account is disabled");
                        return null;
                    }

                    // Don't mark token as used immediately - allow reuse within 24-hour validity period
                    // Only mark as used in memory after successful authentication to prevent immediate reuse in same session
                    // But don't mark it on first validation - allow the user to use it
                    if (tokenFromMemory && tokenData) {
                        // Check if token was already used in this session
                        const existingToken = magicTokens.get(credentials.token);
                        if (existingToken?.usedAt) {
                            console.log("[Magic Link Auth] Token already used in this session");
                            return null;
                        }
                        // Mark as used after successful validation (but allow first use)
                        markMagicTokenAsUsed(credentials.token);
                    }
                    
                    // Don't clear token from Airtable - allow reuse within 24-hour validity period
                    // Token will expire naturally based on timestamp validation
                    console.log("[Magic Link Auth] Token validated successfully (valid for 24 hours)");

                    // Extract user data
                    const user = {
                        id: record.id,
                        email: String(fields["Email"] || ""),
                        firstName: String(fields["First Name"] || ""),
                        lastName: String(fields["Last Name"] || ""),
                        companyId: Array.isArray(fields["Intake - Group Data"])
                            ? fields["Intake - Group Data"][0]
                            : Array.isArray(fields["Link to Intake - Group Data"])
                                ? fields["Link to Intake - Group Data"][0]
                                : Array.isArray(fields["Company Name"])
                                    ? fields["Company Name"][0]
                                    : (fields["Company"] || process.env.DEFAULT_COMPANY_ID || ""),
                        role: String(fields["Role"] || "prospect"),
                        mustChangePassword: Boolean(fields["Must Change Password"] || false),
                    };

                    console.log("[Magic Link Auth] User authenticated via magic link:", user.email, "| Company:", user.companyId);
                    return user;
                } catch (error) {
                    console.error("Airtable authentication error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers (Google, LinkedIn), verify email matches existing user
            if (account?.provider === "google" || account?.provider === "linkedin") {
                const email = user.email || (profile as any)?.email;
                if (!email) {
                    return false;
                }

                const token = process.env.AIRTABLE_API_KEY;
                const baseId = "appdqgKk1fmhfaJoT";
                const usersTableId = "tblU9oY6xmTcCuACh";

                if (!token) {
                    console.error("Missing AIRTABLE_API_KEY");
                    return false;
                }

                try {
                    const records = await fetchAirtableRecords(usersTableId, {
                        apiKey: token,
                        filterByFormula: `{Email} = '${email}'`,
                        maxRecords: 1,
                    });

                    if (!records || records.length === 0) {
                        console.log("SSO user not found in Airtable:", email);
                        return false;
                    }

                    const record = records[0];
                    const fields = record.fields;

                    // Check if user is active
                    const status = String(fields["Status"] || "active").toLowerCase();
                    if (status !== "active") {
                        console.log("SSO user account is disabled:", email);
                        return false;
                    }

                    // Update user object with Airtable data
                    user.id = record.id;
                    (user as any).firstName = String(fields["First Name"] || "");
                    (user as any).lastName = String(fields["Last Name"] || "");
                    (user as any).companyId = Array.isArray(fields["Intake - Group Data"])
                        ? fields["Intake - Group Data"][0]
                        : Array.isArray(fields["Link to Intake - Group Data"])
                            ? fields["Link to Intake - Group Data"][0]
                            : Array.isArray(fields["Company Name"])
                                ? fields["Company Name"][0]
                                : (fields["Company"] || process.env.DEFAULT_COMPANY_ID || "");
                    (user as any).role = String(fields["Role"] || "prospect");
                    (user as any).mustChangePassword = Boolean(fields["Must Change Password"] || false);

                    return true;
                } catch (error) {
                    console.error("SSO authentication error:", error);
                    return false;
                }
            }

            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.companyId = (user as any).companyId;
                token.role = (user as any).role;
                token.portalMode = "prospect";
                token.mustChangePassword = (user as any).mustChangePassword || false;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).email = token.email;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
                (session.user as any).companyId = token.companyId;
                (session.user as any).role = token.role;
                (session.user as any).portalMode = token.portalMode;
                (session.user as any).mustChangePassword = token.mustChangePassword;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 90 * 24 * 60 * 60, // 90 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
