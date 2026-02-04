
const fs = require('fs');
const path = require('path');

// Basic .env parsing
try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) process.env[key.trim()] = val.trim();
    });
} catch (e) {
    console.log('Could not read .env.local', e);
}

async function debugUsersTable() {
    const TABLE_ID = 'tblPJjWgnbblYLym4'; // Intake - Plan Data
    const API_KEY = process.env.AIRTABLE_API_KEY;

    if (!API_KEY) {
        console.error('No API Key found in process.env');
        return;
    }

    console.log(`Fetching 1 record from ${TABLE_ID}...`);
    try {
        const url = `https://api.airtable.com/v0/appdqgKk1fmhfaJoT/${TABLE_ID}?maxRecords=1`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const data = await response.json();
        if (data.records && data.records.length > 0) {
            const record = data.records[0];
            const keys = Object.keys(record.fields);
            // console.log('ALL KEYS:', JSON.stringify(keys));

            const likelyKeys = keys.filter(k =>
                k.toLowerCase().includes('company') ||
                k.toLowerCase().includes('group') ||
                k.toLowerCase().includes('client') ||
                k.toLowerCase().includes('intake')
            );
            fs.writeFileSync('debug_output.txt', JSON.stringify(likelyKeys, null, 2));
            console.log('Wrote matches to debug_output.txt');
        } else {
            console.log('No records found or error:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

debugUsersTable();
