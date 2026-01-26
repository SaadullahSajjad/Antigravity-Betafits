import Airtable from 'airtable';

const token = process.env.AIRTABLE_API_KEY;
const baseId = 'appdqgKk1fmhfaJoT';

export async function fetchAirtableRecords(tableId: string, options: any = {}) {
    // Skip fetching during build time to avoid AbortSignal issues
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
    if (isBuildTime) {
        return [];
    }

    if (!token) {
        console.warn('Missing AIRTABLE_API_KEY, fetchAirtableRecords returning empty array');
        return [];
    }

    try {
        const base = new Airtable({ apiKey: token }).base(baseId);
        const records = await base(tableId).select(options).all();
        return records;
    } catch (error) {
        // Log error but don't necessarily crash build if it happens anyway
        console.error(`Error fetching records from table ${tableId}:`, error);
        throw error;
    }
}
