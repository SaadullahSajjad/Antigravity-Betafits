
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

const TABLES = {
    'Pulse Surveys': 'tbl28XVUekjvl2Ujn',
    'Documents': 'tblBgAZKJln76anVn',
    'Assigned Forms': 'tblNeyKm9sKAKZq9n'
};

const API_KEY = process.env.AIRTABLE_API_KEY;

async function checkTables() {
    if (!API_KEY) {
        console.error('No API Key');
        return;
    }

    const results = {};

    for (const [name, id] of Object.entries(TABLES)) {
        console.log(`Checking ${name} (${id})...`);
        try {
            const url = `https://api.airtable.com/v0/appdqgKk1fmhfaJoT/${id}?maxRecords=1`;
            const response = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
            const data = await response.json();

            if (data.records && data.records.length > 0) {
                const keys = Object.keys(data.records[0].fields);
                const likelyKeys = keys.filter(k =>
                    k.toLowerCase().includes('company') ||
                    k.toLowerCase().includes('group') ||
                    k.toLowerCase().includes('client') ||
                    k.toLowerCase().includes('intake')
                );
                results[name] = likelyKeys;
            } else {
                results[name] = 'No records found or error';
            }
        } catch (err) {
            results[name] = `Error: ${err.message}`;
        }
    }

    fs.writeFileSync('debug_tables.txt', JSON.stringify(results, null, 2));
    console.log('Results written to debug_tables.txt');
}

checkTables();
