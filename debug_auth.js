
const { fetchAirtableRecords } = require('./lib/airtable/fetch');
require('dotenv').config({ path: '.env.local' });

async function debugUsersTable() {
    const TABLE_ID = 'tblU9oY6xmTcCuACh'; // Intake - Users
    const API_KEY = process.env.AIRTABLE_API_KEY;

    if (!API_KEY) {
        console.error('No API Key');
        return;
    }

    console.log(`Fetching 1 record from ${TABLE_ID}...`);
    try {
        // We'll reimplement a basic fetch here to avoid TS compilation complexity for a quick script
        // or just rely on the existing lib if we run with ts-node. 
        // to be safe/fast, I'll just use a direct fetch in this script.

        const url = `https://api.airtable.com/v0/appdqgKk1fmhfaJoT/${TABLE_ID}?maxRecords=1`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const data = await response.json();
        if (data.records && data.records.length > 0) {
            const record = data.records[0];
            console.log('Record ID:', record.id);
            console.log('Field Names found:', Object.keys(record.fields));
            console.log('Full Fields:', JSON.stringify(record.fields, null, 2));
        } else {
            console.log('No records found or error:', data);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

debugUsersTable();
