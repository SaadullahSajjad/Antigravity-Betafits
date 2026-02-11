/**
 * Extract ALL fields from ALL form definitions - Simple Node.js version
 */

const fs = require('fs');
const path = require('path');

const constantsDir = path.join(process.cwd(), 'constants');
const formFiles = fs.readdirSync(constantsDir).filter(f => f.endsWith('Form.ts') && !f.includes('index'));

const allFields = [];

formFiles.forEach(file => {
    const filePath = path.join(constantsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract form ID and title
    const formIdMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
    
    if (!formIdMatch) return;
    
    const formId = formIdMatch[1];
    const formName = titleMatch ? titleMatch[1] : file.replace('Form.ts', '');
    
    // Extract all question IDs using a simple regex
    const questionIdRegex = /id:\s*['"]([^'"]+)['"],\s*label:\s*['"]([^'"]+)['"],\s*type:\s*['"]([^'"]+)['"]/g;
    let match;
    const fields = [];
    
    while ((match = questionIdRegex.exec(content)) !== null) {
        const fieldId = match[1];
        const fieldLabel = match[2];
        const fieldType = match[3];
        
        // Check if required
        const requiredMatch = content.substring(match.index, match.index + 500).match(/required:\s*(true|false)/);
        const required = requiredMatch ? requiredMatch[1] === 'true' : false;
        
        fields.push({
            formId,
            formName,
            fieldId,
            fieldLabel,
            fieldType,
            required,
        });
    }
    
    allFields.push(...fields);
    
    console.log(`${formName} (${formId}): ${fields.length} fields`);
    console.log(`  Fields: ${fields.map(f => f.fieldId).join(', ')}\n`);
});

// Group by form
const fieldsByForm = {};
allFields.forEach(field => {
    if (!fieldsByForm[field.formId]) {
        fieldsByForm[field.formId] = [];
    }
    fieldsByForm[field.formId].push(field);
});

console.log(`\n📊 Total Forms: ${Object.keys(fieldsByForm).length}`);
console.log(`📝 Total Fields: ${allFields.length}\n`);

// Write to JSON file
const output = {
    totalForms: Object.keys(fieldsByForm).length,
    totalFields: allFields.length,
    forms: Object.entries(fieldsByForm).map(([formId, fields]) => ({
        formId,
        formName: fields[0]?.formName || formId,
        fieldCount: fields.length,
        fields: fields.map(f => ({
            id: f.fieldId,
            label: f.fieldLabel,
            type: f.fieldType,
            required: f.required,
        })),
    })),
};

fs.writeFileSync(
    path.join(process.cwd(), 'all-form-fields-extracted.json'),
    JSON.stringify(output, null, 2)
);

console.log(`\n✅ Extracted all fields to all-form-fields-extracted.json`);
