/**
 * Direct Airtable REST API client to avoid AbortSignal issues with the Airtable.js library
 * in Next.js/Vercel production environments
 */

interface AirtableRecord {
    id: string;
    fields: Record<string, any>;
    createdTime?: string;
}

interface AirtableResponse {
    records: AirtableRecord[];
    offset?: string;
}

export async function fetchAirtableRecords(
    baseId: string,
    tableId: string,
    options: {
        apiKey: string;
        maxRecords?: number;
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
        filterByFormula?: string;
    }
): Promise<AirtableRecord[]> {
    const { apiKey, maxRecords, sort, filterByFormula } = options;
    
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    
    if (maxRecords) {
        url.searchParams.append('maxRecords', maxRecords.toString());
    }
    
    if (sort && sort.length > 0) {
        url.searchParams.append('sort[0][field]', sort[0].field);
        url.searchParams.append('sort[0][direction]', sort[0].direction);
    }
    
    if (filterByFormula) {
        url.searchParams.append('filterByFormula', filterByFormula);
    }

    const allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
        if (offset) {
            url.searchParams.set('offset', offset);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Airtable API error: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data: AirtableResponse = await response.json();
        allRecords.push(...data.records);
        offset = data.offset;
    } while (offset);

    return allRecords;
}
