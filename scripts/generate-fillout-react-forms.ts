/**
 * Generate React Form Components from Fillout Forms
 * 
 * This script extracts form structures from Fillout URLs and generates:
 * 1. Form definition constants
 * 2. React form components
 * 3. Form pages
 */

import * as fs from 'fs';
import * as path from 'path';

// Fillout form URLs and metadata
const FILLOUT_FORMS = [
    {
        templateId: 'eBxXtLZdK4us',
        formName: 'Quick Start (Current Benefits) Multi-Page',
        url: 'https://betafits.fillout.com/t/eBxXtLZdK4us',
        pages: [
            {
                id: 'company-info',
                name: 'Company Info',
                sections: [
                    {
                        id: 'contact-info',
                        title: 'Contact Information',
                        fields: [
                            { id: 'firstName', label: 'First Name', type: 'text', required: true },
                            { id: 'lastName', label: 'Last Name', type: 'text', required: true },
                            { id: 'title', label: 'Title', type: 'text', required: true },
                            { id: 'phone', label: 'Phone', type: 'phone', required: true },
                            { id: 'email', label: 'Email', type: 'email', required: true },
                        ]
                    },
                    {
                        id: 'company-info',
                        title: 'Company Information',
                        fields: [
                            // Will be populated from actual form
                        ]
                    },
                    {
                        id: 'nda',
                        title: 'Non-Disclosure Agreement (NDA) (Optional)',
                        fields: [
                            // Will be populated from actual form
                        ]
                    }
                ]
            },
            {
                id: 'benefits',
                name: 'Benefits',
                sections: []
            },
            {
                id: 'upload-documents',
                name: 'Upload Documents',
                sections: []
            },
            {
                id: 'review',
                name: 'Review',
                sections: []
            }
        ]
    },
    {
        templateId: 'rZhiEaUEskus',
        formName: 'Update Quickstart (w/ current benefits)',
        url: 'https://betafits.fillout.com/t/rZhiEaUEskus',
        pages: []
    },
    {
        templateId: 'gn6WNJPJKTus',
        formName: 'Update PEO/HR',
        url: 'https://betafits.fillout.com/t/gn6WNJPJKTus',
        pages: []
    },
    {
        templateId: 'urHF8xDu7eus',
        formName: 'Update Broker Role',
        url: 'https://betafits.fillout.com/t/urHF8xDu7eus',
        pages: []
    }
];

/**
 * Generate form definition constant file
 */
function generateFormDefinition(form: typeof FILLOUT_FORMS[0]) {
    const componentName = form.templateId.replace(/[^a-zA-Z0-9]/g, '');
    const constantName = `${componentName.toUpperCase()}_FORM_DATA`;
    
    const formDef = {
        id: form.templateId,
        title: form.formName,
        pages: form.pages.map(page => ({
            id: page.id,
            name: page.name,
            sections: page.sections.map(section => ({
                id: section.id,
                title: section.title,
                description: section.description || undefined,
                questions: section.fields.map(field => ({
                    id: field.id,
                    label: field.label,
                    type: field.type === 'phone' ? 'text' : field.type,
                    required: field.required,
                    placeholder: field.placeholder,
                    options: field.options,
                    validation: field.required ? [{
                        type: 'required' as const,
                        message: `${field.label} is required`
                    }] : undefined
                }))
            }))
        }))
    };

    const fileContent = `import { FormDataDefinition } from '@/types/form';

export const ${constantName}: FormDataDefinition = ${JSON.stringify(formDef, null, 2)};
`;

    const constantsDir = path.join(process.cwd(), 'constants');
    if (!fs.existsSync(constantsDir)) {
        fs.mkdirSync(constantsDir, { recursive: true });
    }

    const filePath = path.join(constantsDir, `${componentName.toLowerCase()}Form.ts`);
    fs.writeFileSync(filePath, fileContent);
    console.log(`✅ Generated: ${filePath}`);
    
    return { componentName, constantName, filePath };
}

/**
 * Generate React form component
 */
function generateReactComponent(form: typeof FILLOUT_FORMS[0], constantName: string) {
    const componentName = `${form.templateId.replace(/[^a-zA-Z0-9]/g, '')}Form`;
    const pascalName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
    
    const componentContent = `'use client';

import React, { useState } from 'react';
import { FormValues } from '@/types/form';
import { ${constantName} } from '@/constants/${componentName.toLowerCase()}Form';
import FormSection from './FormSection';

interface Props {
    onSave: (values: FormValues) => Promise<void>;
    onSubmit: (values: FormValues) => Promise<void>;
    isSubmitting?: boolean;
}

const ${pascalName}: React.FC<Props> = ({ onSave, onSubmit, isSubmitting = false }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [values, setValues] = useState<FormValues>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const pages = ${constantName}.pages;
    const currentPageData = pages[currentPage];

    const handleFieldChange = (questionId: string, value: any) => {
        setValues((prev) => ({ ...prev, [questionId]: value }));
        if (errors[questionId]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }
    };

    const validatePage = (): boolean => {
        const pageErrors: Record<string, string> = {};
        currentPageData.sections.forEach((section) => {
            section.questions.forEach((question) => {
                if (question.required && !values[question.id]) {
                    pageErrors[question.id] = question.validation?.[0]?.message || 'Field is required';
                }
            });
        });
        setErrors(pageErrors);
        return Object.keys(pageErrors).length === 0;
    };

    const handleNext = () => {
        if (validatePage()) {
            setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
            onSave(values).catch(console.error);
        }
    };

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (validatePage()) {
            await onSubmit(values);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Progress Bar */}
            <div className="px-8 pt-8 pb-4 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                        Step {currentPage + 1} of {pages.length}
                    </span>
                    <span className="text-[13px] text-gray-500 font-medium">
                        {Math.round(((currentPage + 1) / pages.length) * 100)}% Complete
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: \`\${((currentPage + 1) / pages.length) * 100}%\` }}
                    />
                </div>
            </div>

            {/* Form Content */}
            <div className="px-8 py-8 md:px-12 md:py-10">
                <h2 className="text-[28px] font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                    {currentPageData.name}
                </h2>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {currentPageData.sections.map((section) => (
                        <FormSection
                            key={section.id}
                            section={section}
                            values={values}
                            errors={errors}
                            onChange={handleFieldChange}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className={\`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all \${currentPage === 0
                            ? 'opacity-0 pointer-events-none'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        }\`}
                >
                    Back
                </button>
                {currentPage < pages.length - 1 ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-2.5 bg-brand-500 text-white rounded-lg text-[14px] font-bold hover:bg-brand-600 transition-all shadow-md active:scale-[0.98] flex items-center gap-2"
                    >
                        Next Step
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-brand-500 text-white rounded-lg text-[14px] font-bold hover:bg-brand-600 transition-all shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Application
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ${pascalName};
`;

    const componentsDir = path.join(process.cwd(), 'components', 'forms');
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    const filePath = path.join(componentsDir, `${pascalName}.tsx`);
    fs.writeFileSync(filePath, componentContent);
    console.log(`✅ Generated: ${filePath}`);
    
    return { componentName: pascalName, filePath };
}

/**
 * Generate form page
 */
function generateFormPage(form: typeof FILLOUT_FORMS[0], componentName: string) {
    const pageContent = `'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ${componentName} from '@/components/forms/${componentName}';
import { FormValues } from '@/types/form';

export default function ${componentName}Page() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async (values: FormValues) => {
        // Auto-save progress to localStorage
        localStorage.setItem('form_${form.templateId}_progress', JSON.stringify(values));
    };

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: '${form.templateId}',
                    formName: '${form.formName}',
                    values,
                }),
            });

            if (response.ok) {
                // Clear saved progress
                localStorage.removeItem('form_${form.templateId}_progress');
                // Redirect to success page or dashboard
                router.push('/?formSubmitted=true');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to submit form. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An error occurred while submitting the form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <${componentName}
                    onSave={handleSave}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}
`;

    const formId = form.templateId.toLowerCase();
    const pagesDir = path.join(process.cwd(), 'app', 'forms', formId);
    if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
    }

    const filePath = path.join(pagesDir, 'page.tsx');
    fs.writeFileSync(filePath, pageContent);
    console.log(`✅ Generated: ${filePath}`);
    
    return filePath;
}

/**
 * Main execution
 */
function main() {
    console.log('🚀 Generating React forms from Fillout forms...\n');

    for (const form of FILLOUT_FORMS) {
        console.log(`\n📝 Processing: ${form.formName}`);
        console.log(`   Template ID: ${form.templateId}`);
        
        try {
            // Generate form definition
            const { constantName, componentName } = generateFormDefinition(form);
            
            // Generate React component
            const { componentName: reactComponentName } = generateReactComponent(form, constantName);
            
            // Generate form page
            generateFormPage(form, reactComponentName);
            
            console.log(`✅ Completed: ${form.formName}\n`);
        } catch (error) {
            console.error(`❌ Error processing ${form.formName}:`, error);
        }
    }

    console.log('\n✨ All forms generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Manually extract field structures from each Fillout form');
    console.log('2. Update form definition constants with complete field data');
    console.log('3. Create API route: app/api/forms/submit/route.ts');
    console.log('4. Test form submission to Airtable');
}

// Run if executed directly
if (require.main === module) {
    main();
}

export { main };
