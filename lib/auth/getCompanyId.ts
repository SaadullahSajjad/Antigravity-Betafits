import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { getUserCompanyFromAirtable } from "./getUserCompany";

/**
 * Get company ID from authenticated session
 * This function can be called from Server Components and API routes
 * 
 * It first tries to get company ID from the session, but if that's not available
 * or seems incorrect, it fetches directly from Airtable by email for accuracy.
 * 
 * @returns The company ID from the authenticated user's session or Airtable, or null if not authenticated
 */
export async function getCompanyId(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            // For development/testing: use env variable if set
            const envCompanyId = process.env.DEFAULT_COMPANY_ID;
            if (envCompanyId) {
                console.warn('[getCompanyId] No session found, using DEFAULT_COMPANY_ID from env');
                return envCompanyId;
            }
            return null;
        }

        const user = session.user as any;
        const email = user.email;

        if (!email) {
            console.warn('[getCompanyId] No email in session');
            return null;
        }

        // Always fetch from Airtable to ensure accuracy
        // This ensures the company ID is always up-to-date and correct
        // NO FALLBACK - if user is not linked to a company in Airtable, return null
        const companyId = await getUserCompanyFromAirtable(email);

        if (companyId) {
            return companyId;
        }

        // No fallback - user must be properly linked in Airtable
        console.warn(`[getCompanyId] No company ID found in Airtable for user: ${email}. User must be linked to a company.`);
        return null;
    } catch (error) {
        console.error('[getCompanyId] Error:', error);
        return null;
    }
}
