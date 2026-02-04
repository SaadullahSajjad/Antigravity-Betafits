import { fetchAirtableRecords } from "@/lib/airtable/fetch";

/**
 * Fetch user's company ID from Airtable by email
 * This ensures we get the correct company ID directly from Airtable
 * 
 * @param email The user's email address
 * @returns The company ID (record ID) or null if not found
 */
export async function getUserCompanyFromAirtable(email: string): Promise<string | null> {
    try {
        const token = process.env.AIRTABLE_API_KEY;
        const usersTableId = "tblU9oY6xmTcCuACh"; // Intake - Users table

        if (!token) {
            console.error("[getUserCompanyFromAirtable] Missing AIRTABLE_API_KEY");
            return null;
        }

        if (!email) {
            console.error("[getUserCompanyFromAirtable] No email provided");
            return null;
        }

        // Fetch user by email
        const records = await fetchAirtableRecords(usersTableId, {
            apiKey: token,
            filterByFormula: `{Email} = '${email}'`,
            maxRecords: 1,
        });

        if (!records || records.length === 0) {
            console.log(`[getUserCompanyFromAirtable] User not found for email: ${email}`);
            return null;
        }

        const record = records[0];
        const fields = record.fields;

        // Try multiple possible field names for company link
        let companyId: string | null = null;

        // Priority order for company field names
        if (Array.isArray(fields["Intake - Group Data"]) && fields["Intake - Group Data"].length > 0) {
            companyId = fields["Intake - Group Data"][0];
        } else if (Array.isArray(fields["Link to Intake - Group Data"]) && fields["Link to Intake - Group Data"].length > 0) {
            companyId = fields["Link to Intake - Group Data"][0];
        } else if (Array.isArray(fields["Company Name"]) && fields["Company Name"].length > 0) {
            companyId = fields["Company Name"][0];
        } else if (Array.isArray(fields["Company"]) && fields["Company"].length > 0) {
            companyId = fields["Company"][0];
        } else if (fields["Company"]) {
            companyId = String(fields["Company"]);
        }

        if (companyId) {
            console.log(`[getUserCompanyFromAirtable] Found company ID: ${companyId} for user: ${email}`);
            return String(companyId);
        }

        console.log(`[getUserCompanyFromAirtable] No company ID found for user: ${email}`);
        return null;
    } catch (error) {
        console.error("[getUserCompanyFromAirtable] Error:", error);
        return null;
    }
}
