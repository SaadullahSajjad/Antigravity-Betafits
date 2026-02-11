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

    // Step 1: Fetch Available Forms from Airtable
    console.log('📋 Step 1: Fetching Available Forms from Airtable...');
    const availableFormsTableId = 'tblZVnNaE4y8e56fa';
    
    let availableForms: any[] = [];
    try {
        availableForms = await fetchAirtableRecords(availableFormsTableId, {
            apiKey,
            maxRecords: 100,
        });
        console.log(`✅ Fetched ${availableForms.length} available forms\n`);
    } catch (error) {
        console.error('❌ Error fetching available forms:', error);
        process.exit(1);
    }

    // Step 2: Extract Fillout URLs and analyze
    console.log('🔗 Step 2: Extracting Fillout URLs...\n');
    
    const formAnalyses: FilloutFormAnalysis[] = [];
    
    for (const form of availableForms) {
        const formName = String(form.fields['Name'] || 'Unknown Form');
        const formId = form.id;
        
        // Try to find Fillout URL in various fields
        const filloutUrl = String(
            form.fields['Fillout URL'] || 
            form.fields['Form URL'] || 
            form.fields['URL'] ||
            form.fields['Link'] ||
            form.fields['Assigned Form URL'] ||
            ''
        );

        // Extract template ID from URL (e.g., https://betafits.fillout.com/t/eBxXtLZdK4us)
        let filloutTemplateId: string | undefined;
        if (filloutUrl.includes('fillout.com/t/')) {
            const match = filloutUrl.match(/fillout\.com\/t\/([a-zA-Z0-9]+)/);
            if (match) {
                filloutTemplateId = match[1];
            }
        }

        console.log(`📝 Form: ${formName}`);
        console.log(`   ID: ${formId}`);
        if (filloutUrl) {
            console.log(`   Fillout URL: ${filloutUrl}`);
        }
        if (filloutTemplateId) {
            console.log(`   Template ID: ${filloutTemplateId}`);
        }
        console.log('');

        // Get all Airtable field names for this form
        const airtableFields = Object.keys(form.fields);
        
        formAnalyses.push({
            formId,
            formName,
            filloutUrl: filloutUrl || undefined,
            filloutTemplateId,
            pages: [], // Will be populated by manual inspection or API
            airtableFields,
        });
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
