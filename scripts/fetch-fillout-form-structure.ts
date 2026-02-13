/**
 * Fetch exact form structure from Fillout
 * 
 * This script fetches the actual form structure from Fillout's API or by analyzing the form
 * and generates/updates the form definition to match exactly.
 * 
 * Usage:
 *   npx tsx scripts/fetch-fillout-form-structure.ts <templateId>
 * 
 * Example:
 *   npx tsx scripts/fetch-fillout-form-structure.ts eBxXtLZdK4us
 */

import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config({ path: '.env.local' });

interface FilloutFormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    validation?: any;
    conditionalLogic?: any;
}

interface FilloutFormPage {
    id: string;
    name: string;
    sections: Array<{
        id: string;
        title: string;
        description?: string;
        fields: FilloutFormField[];
    }>;
}

interface FilloutFormStructure {
    templateId: string;
    title: string;
    pages: FilloutFormPage[];
}

/**
 * Fetch form structure from Fillout API
 * Note: This requires Fillout API credentials
 */
async function fetchFromFilloutAPI(templateId: string): Promise<FilloutFormStructure | null> {
    const filloutApiKey = process.env.FILLOUT_API_KEY;
    
    if (!filloutApiKey) {
        console.log('⚠️  FILLOUT_API_KEY not found. Using alternative method...');
        return null;
    }

    try {
        // Fillout API endpoint (adjust based on actual API documentation)
        const response = await fetch(`https://api.fillout.com/v1/forms/${templateId}`, {
            headers: {
                'Authorization': `Bearer ${filloutApiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.log(`⚠️  Fillout API returned ${response.status}. Using alternative method...`);
            return null;
        }

        const data = await response.json();
        return parseFilloutAPIResponse(data, templateId);
    } catch (error) {
        console.log('⚠️  Error fetching from Fillout API:', error);
        return null;
    }
}

/**
 * Parse Fillout API response
 */
function parseFilloutAPIResponse(data: any, templateId: string): FilloutFormStructure {
    // This structure depends on Fillout's actual API response format
    // Adjust based on their documentation
    return {
        templateId,
        title: data.name || data.title || 'Form',
        pages: data.pages || [],
    };
}

/**
 * Alternative: Fetch by analyzing the form HTML/JavaScript
 * This uses the public form URL to extract structure
 */
async function fetchFromFormURL(templateId: string): Promise<FilloutFormStructure | null> {
    const formUrl = `https://betafits.fillout.com/t/${templateId}`;
    
    console.log(`\n📋 Fetching form structure from: ${formUrl}`);
    console.log('⚠️  This method requires manual inspection or browser automation.');
    console.log('   For now, please manually verify the form and update the definition.\n');
    
    // Option 1: Use Puppeteer/Playwright to scrape the form
    // Option 2: Manual inspection and update
    // Option 3: Use Fillout's embed API if available
    
    return null;
}

/**
 * Generate form definition file from structure
 */
function generateFormDefinition(structure: FilloutFormStructure): string {
    const { templateId, title, pages } = structure;
    
    let output = `import { FormDataDefinition } from '@/types/form';

/**
 * ${title}
 * Template ID: ${templateId}
 * URL: https://betafits.fillout.com/t/${templateId}
 * 
 * Auto-generated from Fillout form structure
 * Last updated: ${new Date().toISOString()}
 */
export const FORM_DATA: FormDataDefinition = {
    id: '${templateId}',
    title: '${title}',
    pages: [`;

    pages.forEach((page, pageIndex) => {
        output += `
        {
            id: '${page.id}',
            name: '${page.name}',
            sections: [`;
        
        page.sections.forEach((section, sectionIndex) => {
            output += `
                {
                    id: '${section.id}',
                    title: '${section.title}',`;
            
            if (section.description) {
                output += `
                    description: '${section.description}',`;
            }
            
            output += `
                    questions: [`;
            
            section.fields.forEach((field) => {
                output += `
                        {
                            id: '${field.id}',
                            label: '${field.label.replace(/'/g, "\\'")}',
                            type: '${mapFilloutTypeToReactType(field.type)}',
                            required: ${field.required},`;
                
                if (field.placeholder) {
                    output += `
                            placeholder: '${field.placeholder.replace(/'/g, "\\'")}',`;
                }
                
                if (field.options && field.options.length > 0) {
                    output += `
                            options: [`;
                    field.options.forEach((opt) => {
                        output += `
                                { value: '${opt.value}', label: '${opt.label.replace(/'/g, "\\'")}' },`;
                    });
                    output += `
                            ],`;
                }
                
                if (field.required) {
                    output += `
                            validation: [{ type: 'required', message: '${field.label} is required' }]`;
                }
                
                output += `
                        },`;
            });
            
            output += `
                    ]
                }${sectionIndex < page.sections.length - 1 ? ',' : ''}`;
        });
        
        output += `
            ]
        }${pageIndex < pages.length - 1 ? ',' : ''}`;
    });
    
    output += `
    ]
};
`;

    return output;
}

/**
 * Map Fillout field types to React form types
 */
function mapFilloutTypeToReactType(filloutType: string): string {
    const typeMap: Record<string, string> = {
        'text': 'text',
        'email': 'email',
        'phone': 'text',
        'number': 'number',
        'textarea': 'textarea',
        'select': 'select',
        'radio': 'radio',
        'checkbox': 'checkbox',
        'date': 'date',
        'file': 'file',
        'url': 'url',
    };
    
    return typeMap[filloutType.toLowerCase()] || 'text';
}

/**
 * Main execution
 */
async function main() {
    const templateId = process.argv[2];
    
    if (!templateId) {
        console.error('❌ Error: Template ID is required');
        console.log('\nUsage:');
        console.log('  npx tsx scripts/fetch-fillout-form-structure.ts <templateId>');
        console.log('\nExample:');
        console.log('  npx tsx scripts/fetch-fillout-form-structure.ts eBxXtLZdK4us');
        process.exit(1);
    }
    
    console.log(`\n🔍 Fetching form structure for: ${templateId}\n`);
    
    // Try API first, then fallback to URL analysis
    let structure = await fetchFromFilloutAPI(templateId);
    
    if (!structure) {
        structure = await fetchFromFormURL(templateId);
    }
    
    if (!structure) {
        console.log('\n❌ Could not fetch form structure automatically.');
        console.log('\n📝 Manual Steps:');
        console.log('1. Open the form in browser: https://betafits.fillout.com/t/' + templateId);
        console.log('2. Inspect the form fields using browser DevTools');
        console.log('3. Check the network tab for API calls that return form structure');
        console.log('4. Update the form definition file manually');
        console.log('\n💡 Alternative: Use Fillout API if you have credentials');
        console.log('   Add FILLOUT_API_KEY to .env.local');
        process.exit(1);
    }
    
    // Generate form definition
    const formDefinition = generateFormDefinition(structure);
    
    // Determine output file based on template ID
    const outputFile = path.join(
        process.cwd(),
        'constants',
        `form_${templateId.toLowerCase()}.ts`
    );
    
    // Write to file
    fs.writeFileSync(outputFile, formDefinition, 'utf-8');
    
    console.log(`\n✅ Form structure fetched and saved to: ${outputFile}`);
    console.log(`\n📋 Form Structure:`);
    console.log(`   Title: ${structure.title}`);
    console.log(`   Pages: ${structure.pages.length}`);
    structure.pages.forEach((page, index) => {
        const totalFields = page.sections.reduce((sum, section) => sum + section.fields.length, 0);
        console.log(`   Page ${index + 1}: ${page.name} (${page.sections.length} sections, ${totalFields} fields)`);
    });
    console.log('\n✨ Done!');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

export { fetchFromFilloutAPI, fetchFromFormURL, generateFormDefinition };
