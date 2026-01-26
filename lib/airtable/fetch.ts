import Airtable from 'airtable';

const token = process.env.AIRTABLE_API_KEY;
const baseId = 'appdqgKk1fmhfaJoT';

export async function fetchAirtableRecords(tableId: string, options: any = {}) {
    if (!token) {
        console.warn('Missing AIRTABLE_API_KEY, fetchAirtableRecords returning empty array');
        return [];
    }

    try {
        const base = new Airtable({ apiKey: token }).base(baseId);
        const records = await base(tableId).select(options).all();
        return records;
    } catch (error) {
        console.error(`Error fetching records from table ${tableId}:`, error);
        throw error;
    }
}
