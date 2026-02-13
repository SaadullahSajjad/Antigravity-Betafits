/**
 * Parse Fillout template JSON and update form definition
 * 
 * Usage: npx tsx scripts/parse-fillout-template.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface FilloutWidget {
    id: string;
    name: string;
    type: string;
    position: { row: number; column: number };
    template: any;
}

interface FilloutStep {
    id: string;
    name: string;
    type: string;
    template: {
        widgets: Record<string, FilloutWidget>;
    };
}

interface FilloutTemplate {
    steps: Record<string, FilloutStep>;
    firstStep: string;
}

/**
 * Map Fillout field types to React form types
 */
function mapFilloutTypeToReactType(filloutType: string): string {
    const typeMap: Record<string, string> = {
        'ShortAnswer': 'text',
        'LongAnswer': 'textarea',
        'Email': 'email',
        'Phone': 'text', // Phone is handled as text with validation
        'Number': 'number',
        'NumberInput': 'number', // Number input field
        'Dropdown': 'select',
        'MultipleChoice': 'radio',
        'Checkboxes': 'checkbox',
        'FileUpload': 'file',
        'Date': 'date',
        'Text': 'text', // Rich text/HTML content
        'Paragraph': 'text', // HTML paragraph
        'SectionCollapse': 'section', // Section divider
        'Image': 'image', // Image display
        'Button': 'button', // Navigation button
    };
    
    return typeMap[filloutType] || 'text';
}

/**
 * Extract label from Fillout widget
 */
function extractLabel(widget: FilloutWidget): string {
    if (!widget.template.label) return widget.name;
    
    const labelLogic = widget.template.label.logic;
    if (labelLogic && labelLogic.value) {
        // Remove HTML tags
        const htmlValue = labelLogic.value;
        // Simple HTML tag removal
        return htmlValue.replace(/<[^>]*>/g, '').trim() || widget.name;
    }
    
    return widget.name;
}

/**
 * Extract placeholder from Fillout widget
 */
function extractPlaceholder(widget: FilloutWidget): string {
    if (!widget.template.placeholder) return '';
    
    const placeholderLogic = widget.template.placeholder.logic;
    if (placeholderLogic && placeholderLogic.value) {
        return placeholderLogic.value;
    }
    
    return '';
}

/**
 * Check if field is required
 */
function isRequired(widget: FilloutWidget): boolean {
    if (!widget.template.required) return false;
    
    const requiredLogic = widget.template.required.logic;
    if (typeof requiredLogic === 'boolean') {
        return requiredLogic;
    }
    
    return false;
}

/**
 * Extract options for select/radio/checkbox
 */
function extractOptions(widget: FilloutWidget): Array<{ value: string; label: string }> | undefined {
    if (!widget.template.options || !widget.template.options.staticOptions) {
        return undefined;
    }
    
    return widget.template.options.staticOptions.map((opt: any) => {
        const labelLogic = opt.label?.logic;
        const valueLogic = opt.value?.logic;
        
        const label = labelLogic?.value || opt.label || '';
        const value = valueLogic?.value || opt.value || label;
        
        // Remove HTML tags from label
        const cleanLabel = typeof label === 'string' ? label.replace(/<[^>]*>/g, '').trim() : label;
        
        return {
            value: String(value),
            label: cleanLabel || String(value)
        };
    });
}

/**
 * Parse Fillout template and convert to React form definition
 */
function parseFilloutTemplate(template: FilloutTemplate) {
    const pages: any[] = [];
    const stepIds = Object.keys(template.steps);
    
    // Sort steps by their order (we'll use firstStep and nextStep to determine order)
    const orderedSteps: FilloutStep[] = [];
    let currentStepId = template.firstStep;
    const visited = new Set<string>();
    
    // Build step order
    while (currentStepId && !visited.has(currentStepId)) {
        visited.add(currentStepId);
        const step = template.steps[currentStepId];
        if (step) {
            orderedSteps.push(step);
            // Try to find next step from button widgets
            const nextStepId = findNextStep(step);
            currentStepId = nextStepId || undefined;
        } else {
            break;
        }
    }
    
    // Add any remaining steps
    stepIds.forEach(stepId => {
        if (!visited.has(stepId)) {
            orderedSteps.push(template.steps[stepId]);
        }
    });
    
    // Convert each step to a page
    orderedSteps.forEach((step, stepIndex) => {
        // Skip cover page and review page for now (we'll handle them separately)
        if (step.name === 'cover' || step.name === 'Review' || step.type === 'submission_review') {
            return;
        }
        
        const sections: any[] = [];
        const widgets = Object.values(step.template.widgets || {});
        
        // Sort widgets by row position
        widgets.sort((a, b) => a.position.row - b.position.row);
        
        let currentSection: any = null;
        let currentSectionWidgets: FilloutWidget[] = [];
        
        widgets.forEach((widget) => {
            // Skip hidden fields and system fields
            if (widget.template.alwaysHide || widget.id === 'khqL') { // khqL is Group Data Record ID
                return;
            }
            
            // Skip non-input widgets (buttons, images, text/paragraph for display)
            if (['Button', 'Image', 'Text', 'Paragraph'].includes(widget.type)) {
                return;
            }
            
            // Handle section collapse (creates a new section)
            if (widget.type === 'SectionCollapse') {
                // Save previous section if it has widgets
                if (currentSection && currentSectionWidgets.length > 0) {
                    currentSection.questions = convertWidgetsToQuestions(currentSectionWidgets);
                    sections.push(currentSection);
                }
                
                // Start new section
                const sectionLabel = extractLabel(widget);
                currentSection = {
                    id: widget.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    title: sectionLabel,
                    questions: []
                };
                currentSectionWidgets = [];
                return;
            }
            
            // Add widget to current section
            if (!currentSection) {
                // Create default section if none exists
                const stepName = step.name || `Step ${stepIndex + 1}`;
                currentSection = {
                    id: step.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    title: stepName,
                    questions: []
                };
            }
            
            currentSectionWidgets.push(widget);
        });
        
        // Save last section
        if (currentSection && currentSectionWidgets.length > 0) {
            currentSection.questions = convertWidgetsToQuestions(currentSectionWidgets);
            sections.push(currentSection);
        }
        
        // Only add page if it has sections
        if (sections.length > 0) {
            pages.push({
                id: step.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: step.name,
                sections
            });
        }
    });
    
    return {
        id: 'eBxXtLZdK4us',
        title: 'Quick Start (Current Benefits) Multi-Page',
        pages
    };
}

/**
 * Find next step from button widgets
 */
function findNextStep(step: FilloutStep): string | null {
    const widgets = Object.values(step.template.widgets || {});
    const buttonWidget = widgets.find(w => w.type === 'Button');
    if (buttonWidget && buttonWidget.template.nextStep) {
        return buttonWidget.template.nextStep.defaultNextStep || null;
    }
    return null;
}

/**
 * Convert widgets to questions
 */
function convertWidgetsToQuestions(widgets: FilloutWidget[]): any[] {
    return widgets.map(widget => {
        const reactType = mapFilloutTypeToReactType(widget.type);
        const question: any = {
            id: widget.id,
            label: extractLabel(widget),
            type: reactType,
            required: isRequired(widget)
        };
        
        const placeholder = extractPlaceholder(widget);
        if (placeholder) {
            question.placeholder = placeholder;
        }
        
        // Add options for select/radio/checkbox
        if (['select', 'radio', 'checkbox'].includes(reactType)) {
            const options = extractOptions(widget);
            if (options && options.length > 0) {
                question.options = options;
            }
        }
        
        // Add validation
        if (question.required) {
            question.validation = [{
                type: 'required',
                message: `${question.label} is required`
            }];
        }
        
        // Handle file uploads
        if (reactType === 'file') {
            question.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png';
        }
        
        return question;
    });
}

/**
 * Main execution
 */
function main() {
    const jsonPath = path.join(process.cwd(), 'public', 'fillout-template-eBxXtLZdK4us.json');
    
    if (!fs.existsSync(jsonPath)) {
        console.error('❌ Template JSON file not found:', jsonPath);
        process.exit(1);
    }
    
    console.log('📖 Reading template JSON...');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const template: FilloutTemplate = JSON.parse(jsonContent);
    
    console.log('🔍 Parsing template...');
    console.log(`   Steps found: ${Object.keys(template.steps).length}`);
    
    const formDefinition = parseFilloutTemplate(template);
    
    console.log('\n📋 Parsed Form Structure:');
    console.log(`   Pages: ${formDefinition.pages.length}`);
    formDefinition.pages.forEach((page, idx) => {
        const totalFields = page.sections.reduce((sum: number, section: any) => 
            sum + (section.questions?.length || 0), 0);
        console.log(`   Page ${idx + 1}: ${page.name} (${page.sections.length} sections, ${totalFields} fields)`);
    });
    
    // Generate TypeScript code
    const outputPath = path.join(process.cwd(), 'constants', 'quickStartFormComplete.ts');
    const code = generateTypeScriptCode(formDefinition);
    
    // Backup existing file
    if (fs.existsSync(outputPath)) {
        const backupPath = outputPath + '.backup';
        fs.copyFileSync(outputPath, backupPath);
        console.log(`\n💾 Backed up existing file to: ${backupPath}`);
    }
    
    // Write new file
    fs.writeFileSync(outputPath, code, 'utf-8');
    console.log(`\n✅ Updated form definition: ${outputPath}`);
    console.log('\n✨ Done! Review the file and test the form.');
}

/**
 * Generate TypeScript code from form definition
 */
function generateTypeScriptCode(formDefinition: any): string {
    let code = `import { FormDataDefinition } from '@/types/form';

/**
 * Quick Start (Current Benefits) Multi-Page Form
 * Template ID: eBxXtLZdK4us
 * URL: https://betafits.fillout.com/t/eBxXtLZdK4us
 * 
 * Auto-generated from Fillout template JSON
 * Generated: ${new Date().toISOString()}
 */
export const QUICK_START_COMPLETE_FORM_DATA: FormDataDefinition = {
    id: '${formDefinition.id}',
    title: '${formDefinition.title}',
    pages: [`;

    formDefinition.pages.forEach((page: any, pageIndex: number) => {
        code += `
        {
            id: '${page.id}',
            name: '${page.name}',
            sections: [`;
        
        page.sections.forEach((section: any, sectionIndex: number) => {
            code += `
                {
                    id: '${section.id}',
                    title: '${escapeString(section.title)}',`;
            
            if (section.description) {
                code += `
                    description: '${escapeString(section.description)}',`;
            }
            
            code += `
                    questions: [`;
            
            section.questions.forEach((question: any) => {
                code += `
                        {
                            id: '${question.id}',
                            label: '${escapeString(question.label)}',
                            type: '${question.type}',`;
                
                if (question.required !== undefined) {
                    code += `
                            required: ${question.required},`;
                }
                
                if (question.placeholder) {
                    code += `
                            placeholder: '${escapeString(question.placeholder)}',`;
                }
                
                if (question.options && question.options.length > 0) {
                    code += `
                            options: [`;
                    question.options.forEach((opt: any) => {
                        code += `
                                { value: '${escapeString(opt.value)}', label: '${escapeString(opt.label)}' },`;
                    });
                    code += `
                            ],`;
                }
                
                if (question.accept) {
                    code += `
                            accept: '${question.accept}',`;
                }
                
                if (question.validation && question.validation.length > 0) {
                    code += `
                            validation: [`;
                    question.validation.forEach((val: any) => {
                        code += `
                                { type: '${val.type}', message: '${escapeString(val.message)}' },`;
                    });
                    code += `
                            ]`;
                }
                
                code += `
                        },`;
            });
            
            code += `
                    ]
                }${sectionIndex < page.sections.length - 1 ? ',' : ''}`;
        });
        
        code += `
            ]
        }${pageIndex < formDefinition.pages.length - 1 ? ',' : ''}`;
    });
    
    code += `
    ]
};
`;

    return code;
}

/**
 * Escape string for TypeScript
 */
function escapeString(str: any): string {
    if (typeof str !== 'string') {
        return String(str || '');
    }
    return str.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

export { parseFilloutTemplate, mapFilloutTypeToReactType };
