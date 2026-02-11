/**
 * Airtable Record Update Utility
 */

interface UpdateRecordOptions {
    apiKey: string;
    fields: Record<string, any>;
}

interface AirtableRecord {
    id: string;
    fields: Record<string, any>;
    createdTime: string;
}

/**
 * Update a record in an Airtable table
 */
export async function updateAirtableRecord(
    tableId: string,
    recordId: string,
    options: UpdateRecordOptions
): Promise<AirtableRecord> {
    const { apiKey, fields } = options;

    const baseId = process.env.AIRTABLE_BASE_ID || 'appdqgKk1fmhfaJoT';

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;

    const response = await fetch(url, {
        method: 'PATCH',
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
