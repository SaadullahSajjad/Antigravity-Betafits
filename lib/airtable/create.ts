/**
 * Airtable Record Creation Utility
 * 
 * Functions to create records in Airtable tables
 */

interface CreateRecordOptions {
    apiKey: string;
    fields: Record<string, any>;
}

interface AirtableRecord {
    id: string;
    fields: Record<string, any>;
    createdTime: string;
}

/**
 * Create a single record in an Airtable table
 */
export async function createAirtableRecord(
    tableId: string,
    options: CreateRecordOptions
): Promise<AirtableRecord> {
    const { apiKey, fields } = options;

    const baseId = process.env.AIRTABLE_BASE_ID || 'appdqgKk1fmhfaJoT';

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fields,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `Airtable API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
    }

    const data = await response.json();
    return data;
}

/**
 * Create multiple records in an Airtable table
 */
export async function createAirtableRecords(
    tableId: string,
    options: CreateRecordOptions & { records: Array<{ fields: Record<string, any> }> }
): Promise<AirtableRecord[]> {
    const { apiKey, records } = options;

    const baseId = process.env.AIRTABLE_BASE_ID || 'appdqgKk1fmhfaJoT';

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: records.map(r => ({ fields: r.fields })),
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `Airtable API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
    }

    const data = await response.json();
    return data.records;
}
