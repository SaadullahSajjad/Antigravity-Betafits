/**
 * Extract ALL fields from ALL form definitions
 * This script reads all form constant files and extracts every field
 */

import * as fs from 'fs';
import * as path from 'path';

const constantsDir = path.join(process.cwd(), 'constants');
const formFiles = fs.readdirSync(constantsDir).filter(f => f.endsWith('Form.ts') && !f.includes('index'));

interface FormField {
    formId: string;
    formName: string;
    pageId: string;
    pageName: string;
    sectionId: string;
    sectionTitle: string;
    fieldId: string;
    fieldLabel: string;
    fieldType: string;
    required: boolean;
    options?: Array<{ value: string; label: string }>;
}

const allFields: FormField[] = [];

formFiles.forEach(file => {
    const filePath = path.join(constantsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract form ID and title
    const formIdMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
    
    if (!formIdMatch) return;
    
    const formId = formIdMatch[1];
    const formName = titleMatch ? titleMatch[1] : file.replace('Form.ts', '');
    
    // Extract pages
    const pagesRegex = /pages:\s*\[([\s\S]*?)\]\s*\}\s*;?$/;
    const pagesMatch = content.match(pagesRegex);
    
    if (!pagesMatch) return;
    
    const pagesContent = pagesMatch[1];
    
    // Split by page objects - use a simpler regex approach
    const pageRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*sections:\s*\[([\s\S]*?)\]\s*\}/g;
    let pageMatch;
    
    while ((pageMatch = pageRegex.exec(pagesContent)) !== null) {
        const pageId = pageMatch[1];
        const pageName = pageMatch[2];
        const sectionsContent = pageMatch[3];
        
        // Extract sections
        const sectionRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],[\s\S]*?questions:\s*\[([\s\S]*?)\]\s*\}/g;
        let sectionMatch;
        
        while ((sectionMatch = sectionRegex.exec(sectionsContent)) !== null) {
            const sectionId = sectionMatch[1];
            const sectionTitle = sectionMatch[2];
            const questionsContent = sectionMatch[3];
            
            // Extract questions
            const questionRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*label:\s*['"]([^'"]+)['"],\s*type:\s*['"]([^'"]+)['"],\s*required:\s*(true|false)/g;
            let questionMatch;
            
            while ((questionMatch = questionRegex.exec(questionsContent)) !== null) {
                allFields.push({
                    formId,
                    formName,
                    pageId,
                    pageName,
                    sectionId,
                    sectionTitle,
                    fieldId: questionMatch[1],
                    fieldLabel: questionMatch[2],
                    fieldType: questionMatch[3],
                    required: questionMatch[4] === 'true',
                });
            }
        }
    }
});

// Group by form
const fieldsByForm: Record<string, FormField[]> = {};
allFields.forEach(field => {
    if (!fieldsByForm[field.formId]) {
        fieldsByForm[field.formId] = [];
    }
    fieldsByForm[field.formId].push(field);
});

// Output summary
console.log(`\n📊 Total Forms: ${Object.keys(fieldsByForm).length}`);
console.log(`📝 Total Fields: ${allFields.length}\n`);

Object.entries(fieldsByForm).forEach(([formId, fields]) => {
    const formName = fields[0]?.formName || formId;
    const uniquePages = new Set(fields.map(f => f.pageName));
    console.log(`\n${formName} (${formId})`);
    console.log(`  Pages: ${uniquePages.size}`);
    console.log(`  Fields: ${fields.length}`);
    console.log(`  Field IDs: ${fields.map(f => f.fieldId).join(', ')}`);
});

// Write to JSON file
const output = {
    totalForms: Object.keys(fieldsByForm).length,
    totalFields: allFields.length,
    forms: Object.entries(fieldsByForm).map(([formId, fields]) => ({
        formId,
        formName: fields[0]?.formName || formId,
        pages: Array.from(new Set(fields.map(f => ({ id: f.pageId, name: f.pageName })))),
        fields: fields.map(f => ({
            id: f.fieldId,
            label: f.fieldLabel,
            type: f.fieldType,
            required: f.required,
            page: f.pageName,
            section: f.sectionTitle,
        })),
    })),
};

fs.writeFileSync(
    path.join(process.cwd(), 'all-form-fields-extracted.json'),
    JSON.stringify(output, null, 2)
);

console.log(`\n✅ Extracted all fields to all-form-fields-extracted.json`);
