/**
 * Extract Fillout URLs from Data Dictionary
 * 
 * This script extracts all Fillout URLs from the Data Dictionary CSV
 * and maps them to their corresponding forms and Airtable fields.
 */

import * as fs from 'fs';
import * as path from 'path';

interface FilloutURLMapping {
    fieldName: string;
    fieldKey: string;
    filloutUrl: string;
    templateId: string;
    tableName: string;
    tableId: string;
    description: string;
}

function extractFilloutURLs() {
    console.log('🔍 Extracting Fillout URLs from Data Dictionary...\n');

    const dataDictionaryPath = path.join(process.cwd(), 'Data Dictionary-Form Base view.csv');
    
    if (!fs.existsSync(dataDictionaryPath)) {
        console.error('❌ Data Dictionary CSV not found');
        process.exit(1);
    }

    const csvContent = fs.readFileSync(dataDictionaryPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    // Find relevant column indices
    const fieldNameIdx = headers.findIndex(h => h.includes('Field Name'));
    const fieldKeyIdx = headers.findIndex(h => h.includes('Field Key'));
    const formulaIdx = headers.findIndex(h => h.includes('Formula'));
    const tableNameIdx = headers.findIndex(h => h.includes('Table Name'));
    const tableIdIdx = headers.findIndex(h => h.includes('Table ID'));
    const descriptionIdx = headers.findIndex(h => h.includes('Field Description'));

    const filloutMappings: FilloutURLMapping[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Simple CSV parsing - split by comma but handle JSON in formula field
        const parts = line.split(',');
        
        // Try to find formula field which may contain JSON
        let formula = '';
        let formulaStart = -1;
        let formulaEnd = -1;
        
        // Find where formula JSON starts and ends
        for (let j = 0; j < parts.length; j++) {
            if (parts[j].includes('"formula"') || parts[j].includes('fillout.com')) {
                formulaStart = j;
                // Formula JSON spans multiple parts, find the end
                let jsonStr = '';
                for (let k = j; k < parts.length; k++) {
                    jsonStr += (k > j ? ',' : '') + parts[k];
                    // Try to parse as JSON
                    try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.formula) {
                            formula = parsed.formula;
                            formulaEnd = k;
                            break;
                        }
                    } catch (e) {
                        // Continue building JSON string
                    }
                }
                break;
            }
        }

        // If we found formula in JSON, extract it
        if (!formula && line.includes('fillout.com')) {
            // Try to extract directly from line
            const formulaMatch = line.match(/"formula"\s*:\s*"([^"]+)"/);
            if (formulaMatch) {
                formula = formulaMatch[1].replace(/\\"/g, '"');
            }
        }

        const fieldName = parts[fieldNameIdx]?.trim() || '';
        const fieldKey = parts[fieldKeyIdx]?.trim() || '';
        const tableName = parts[tableNameIdx]?.trim() || '';
        const tableId = parts[tableIdIdx]?.trim() || '';
        const description = parts[descriptionIdx]?.trim() || '';

        // Check if formula or line contains Fillout URL
        const searchText = formula || line;
        if (searchText.includes('fillout.com/t/')) {
            // Extract URL from formula
            const urlMatch = searchText.match(/https?:\/\/[^"&]*fillout\.com\/t\/([a-zA-Z0-9]+)/);
            if (urlMatch) {
                const templateId = urlMatch[1];
                const filloutUrl = `https://betafits.fillout.com/t/${templateId}`;

                filloutMappings.push({
                    fieldName,
                    fieldKey,
                    filloutUrl,
                    templateId,
                    tableName,
                    tableId,
                    description,
                });
            }
        }
    }

    console.log(`✅ Found ${filloutMappings.length} Fillout URL mappings\n`);

    // Group by template ID
    const byTemplate: Record<string, FilloutURLMapping[]> = {};
    filloutMappings.forEach(mapping => {
        if (!byTemplate[mapping.templateId]) {
            byTemplate[mapping.templateId] = [];
        }
        byTemplate[mapping.templateId].push(mapping);
    });

    console.log('📋 Fillout Forms Found:\n');
    Object.keys(byTemplate).forEach(templateId => {
        const mappings = byTemplate[templateId];
        const firstMapping = mappings[0];
        console.log(`🔗 Template ID: ${templateId}`);
        console.log(`   URL: ${firstMapping.filloutUrl}`);
        console.log(`   Forms: ${mappings.length}`);
        mappings.forEach(m => {
            console.log(`     - ${m.fieldName} (${m.tableName})`);
        });
        console.log('');
    });

    // Save mappings
    const outputPath = path.join(process.cwd(), 'fillout-url-mappings.json');
    fs.writeFileSync(outputPath, JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalMappings: filloutMappings.length,
        uniqueTemplates: Object.keys(byTemplate).length,
        mappings: filloutMappings,
        byTemplate,
    }, null, 2));

    console.log(`✅ Mappings saved to: ${outputPath}\n`);

    // Generate list of unique Fillout URLs for inspection
    const uniqueUrls = [...new Set(filloutMappings.map(m => m.filloutUrl))];
    console.log('🔗 Unique Fillout URLs to inspect:');
    uniqueUrls.forEach(url => {
        console.log(`   ${url}`);
    });
    console.log('');

    return filloutMappings;
}

extractFilloutURLs();
