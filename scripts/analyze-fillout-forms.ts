/**
 * Fillout Form Analyzer
 * 
 * This script:
 * 1. Fetches all Available Forms from Airtable
 * 2. Extracts Fillout URLs
 * 3. Analyzes form structure (via browser automation or manual inspection)
 * 4. Maps fields to Airtable fields
 * 5. Generates React form component definitions
 */

import { fetchAirtableRecords } from '../lib/airtable/fetch';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    process.env[key.trim()] = value.trim();
                }
            }
        });
    }
}

loadEnvFile();

interface FilloutFormAnalysis {
    formId: string;
    formName: string;
    filloutUrl?: string;
    filloutTemplateId?: string;
    pages: FilloutPage[];
    airtableFields: string[];
}

interface FilloutPage {
    id: string;
    name: string;
    sections: FilloutSection[];
}

interface FilloutSection {
    id: string;
    title: string;
    fields: FilloutField[];
}

interface FilloutField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'date' | 'textarea' | 'file';
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: any[];
    airtableFieldMapping?: string;
}

async function analyzeFilloutForms() {
    const apiKey = process.env.AIRTABLE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ AIRTABLE_API_KEY not found in environment variables');
        console.log('💡 Set it in .env.local or pass as environment variable');
        process.exit(1);
    }

    console.log('🔍 Starting Fillout Form Analysis...\n');

    // Step 1: Fetch Available Forms and Fillout IDs (shared with fetch-fillout-form-structure and getFilloutFormIds)
    console.log('📋 Step 1: Fetching Available Forms from Airtable...');
    const { getFilloutFormIdsFromAirtable } = await import('../lib/airtable/getFilloutFormIds');
    let formAnalysesRaw: Awaited<ReturnType<typeof getFilloutFormIdsFromAirtable>>;
    try {
        formAnalysesRaw = await getFilloutFormIdsFromAirtable({ apiKey, maxRecords: 100 });
        console.log(`✅ Fetched ${formAnalysesRaw.length} available forms\n`);
    } catch (error) {
        console.error('❌ Error fetching available forms:', error);
        process.exit(1);
    }

    // Step 2: Build form analyses (need Airtable field names — re-fetch records for that)
    console.log('🔗 Step 2: Extracting Fillout URLs...\n');
    const availableFormsTableId = 'tblZVnNaE4y8e56fa';
    const availableForms = await fetchAirtableRecords(availableFormsTableId, { apiKey, maxRecords: 100 });
    const formAnalyses: FilloutFormAnalysis[] = formAnalysesRaw.map((row) => {
        const record = availableForms.find((r) => r.id === row.airtableId);
        const airtableFields = record ? Object.keys(record.fields) : [];
        return {
            formId: row.airtableId,
            formName: row.name,
            filloutUrl: row.filloutUrl,
            filloutTemplateId: row.filloutTemplateId ?? undefined,
            pages: [],
            airtableFields,
        };
    });

    for (const f of formAnalyses) {
        console.log(`📝 Form: ${f.formName}`);
        console.log(`   ID: ${f.formId}`);
        if (f.filloutUrl) console.log(`   Fillout URL: ${f.filloutUrl}`);
        if (f.filloutTemplateId) console.log(`   Template ID: ${f.filloutTemplateId}`);
        console.log('');
    }

    // Step 3: Load Airtable field mappings from Data Dictionary
    console.log('🗺️  Step 3: Loading Airtable field mappings...\n');
    
    const dataDictionaryPath = path.join(process.cwd(), 'Data Dictionary-Form Base view.csv');
    let fieldMappings: Record<string, any> = {};
    
    if (fs.existsSync(dataDictionaryPath)) {
        const csvContent = fs.readFileSync(dataDictionaryPath, 'utf-8');
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        
        // Find relevant columns
        const fieldNameIdx = headers.findIndex(h => h.includes('Field Name'));
        const fieldKeyIdx = headers.findIndex(h => h.includes('Field Key'));
        const fieldTypeIdx = headers.findIndex(h => h.includes('Field Type'));
        const optionsIdx = headers.findIndex(h => h.includes('Options'));
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values[fieldNameIdx]) {
                const fieldName = values[fieldNameIdx].trim();
                const fieldKey = values[fieldKeyIdx]?.trim() || '';
                const fieldType = values[fieldTypeIdx]?.trim() || '';
                
                fieldMappings[fieldName] = {
                    key: fieldKey,
                    type: fieldType,
                    options: values[optionsIdx] || '',
                };
            }
        }
        
        console.log(`✅ Loaded ${Object.keys(fieldMappings).length} field mappings\n`);
    } else {
        console.log('⚠️  Data Dictionary CSV not found, skipping field mappings\n');
    }

    // Step 4: Generate analysis report
    console.log('📊 Step 4: Generating analysis report...\n');
    
    const report = {
        generatedAt: new Date().toISOString(),
        totalForms: formAnalyses.length,
        forms: formAnalyses,
        fieldMappings,
        nextSteps: [
            '1. Manually inspect each Fillout form to extract field structure',
            '2. Map Fillout fields to Airtable fields using the field mappings',
            '3. Generate React form components based on the structure',
            '4. Implement validation and conditional logic',
        ],
    };

    // Save report
    const reportPath = path.join(process.cwd(), 'fillout-forms-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Analysis report saved to: ${reportPath}\n`);

    // Step 5: Generate summary
    console.log('📋 Summary:');
    console.log(`   Total Forms: ${formAnalyses.length}`);
    console.log(`   Forms with Fillout URLs: ${formAnalyses.filter(f => f.filloutUrl).length}`);
    console.log(`   Forms with Template IDs: ${formAnalyses.filter(f => f.filloutTemplateId).length}`);
    console.log(`   Field Mappings Loaded: ${Object.keys(fieldMappings).length}\n`);

    // List all Fillout URLs for manual inspection
    console.log('🔗 Fillout URLs to inspect:');
    formAnalyses
        .filter(f => f.filloutUrl)
        .forEach(f => {
            console.log(`   ${f.formName}: ${f.filloutUrl}`);
        });
    console.log('');

    console.log('✅ Analysis complete!');
    console.log('💡 Next: Manually inspect Fillout forms or use browser automation to extract field structures');
}

// Run the analysis
analyzeFilloutForms().catch(console.error);
