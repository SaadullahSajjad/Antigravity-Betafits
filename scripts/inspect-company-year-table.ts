/**
 * Script to inspect the Company x Year table structure
 * Run with: npx tsx scripts/inspect-company-year-table.ts
 */

import { fetchAirtableRecords } from '../lib/airtable/fetch';

const TABLE_ID = 'tblbtLkv8l4uAm5h6'; // Company x Year

async function inspectTable() {
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!apiKey) {
    console.error('❌ Missing AIRTABLE_API_KEY in .env.local');
    process.exit(1);
  }

  console.log(`\n🔍 Fetching records from Company x Year table (${TABLE_ID})...\n`);

  try {
    const records = await fetchAirtableRecords(TABLE_ID, {
      apiKey,
      maxRecords: 5, // Just get a few records to inspect
    });

    if (!records || records.length === 0) {
      console.log('⚠️  No records found in the table');
      return;
    }

    console.log(`✅ Found ${records.length} record(s)\n`);

    // Get the first record to inspect fields
    const firstRecord = records[0];
    
    console.log('📋 ALL FIELD NAMES:');
    console.log('='.repeat(60));
    const fieldNames = Object.keys(firstRecord.fields);
    fieldNames.forEach((fieldName, index) => {
      const value = firstRecord.fields[fieldName];
      const valueType = typeof value;
      const valuePreview = Array.isArray(value) 
        ? `[Array(${value.length})]` 
        : value !== null && value !== undefined 
        ? String(value).substring(0, 50) 
        : 'null/undefined';
      
      console.log(`${index + 1}. "${fieldName}"`);
      console.log(`   Type: ${valueType}${Array.isArray(value) ? ' (Array)' : ''}`);
      console.log(`   Value: ${valuePreview}`);
      console.log('');
    });

    console.log('\n📊 FULL RECORD STRUCTURE:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(firstRecord.fields, null, 2));

    // Look for score-related fields
    console.log('\n🎯 SCORE-RELATED FIELDS:');
    console.log('='.repeat(60));
    const scoreFields = fieldNames.filter(name => 
      name.toLowerCase().includes('overall') ||
      name.toLowerCase().includes('score') ||
      name.toLowerCase().includes('rating') ||
      name.toLowerCase().includes('average') ||
      name.toLowerCase().includes('medical') ||
      name.toLowerCase().includes('cost') ||
      name.toLowerCase().includes('network') ||
      name.toLowerCase().includes('options') ||
      name.toLowerCase().includes('retirement') ||
      name.toLowerCase().includes('non-medical') ||
      name.toLowerCase().includes('response')
    );

    if (scoreFields.length > 0) {
      scoreFields.forEach(fieldName => {
        const value = firstRecord.fields[fieldName];
        console.log(`"${fieldName}": ${JSON.stringify(value)}`);
      });
    } else {
      console.log('⚠️  No obvious score-related fields found');
    }

  } catch (error) {
    console.error('❌ Error fetching records:', error);
    process.exit(1);
  }
}

inspectTable();
