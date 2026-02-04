import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { fetchAirtableRecords } from "@/lib/airtable/fetch";

/**
 * Get user's Airtable record ID by email
 * This ensures we can link documents to the specific user
 * 
 * @param email The user's email address
 * @returns The user's Airtable record ID or null if not found
 */
export async function getUserIdFromAirtable(email: string): Promise<string | null> {
    try {
        const token = process.env.AIRTABLE_API_KEY;
        const usersTableId = "tblU9oY6xmTcCuACh"; // Intake - Users table

        if (!token) {
            console.error("[getUserIdFromAirtable] Missing AIRTABLE_API_KEY");
            return null;
        }

        if (!email) {
            console.error("[getUserIdFromAirtable] No email provided");
            return null;
        }

        // Fetch user by email
        const records = await fetchAirtableRecords(usersTableId, {
            apiKey: token,
            filterByFormula: `{Email} = '${email}'`,
            maxRecords: 1,
        });

        if (!records || records.length === 0) {
            console.log(`[getUserIdFromAirtable] User not found for email: ${email}`);
            return null;
        }

        const userId = records[0].id;
        console.log(`[getUserIdFromAirtable] Found user ID: ${userId} for email: ${email}`);
        return userId;
    } catch (error) {
        console.error("[getUserIdFromAirtable] Error:", error);
        return null;
    }
}

/**
 * Get current user's Airtable record ID from session
 * 
 * @returns The user's Airtable record ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return null;
        }

        const user = session.user as any;
        const email = user.email;

        if (!email) {
            return null;
        }

        // Get user ID from Airtable by email
        return await getUserIdFromAirtable(email);
    } catch (error) {
        console.error("[getCurrentUserId] Error:", error);
        return null;
    }
}
