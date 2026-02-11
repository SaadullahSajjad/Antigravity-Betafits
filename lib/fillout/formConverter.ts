/**
 * Fillout to React Form Converter
 * 
 * This utility converts Fillout form structures to React form component definitions
 * that match the existing form system in the project.
 */

import { FormDataDefinition, FormPageData, FormSectionData, Question, ValidationRule } from '@/types/form';

interface FilloutFormData {
    templateId: string;
    formName: string;
    pages: FilloutPage[];
    introText?: string;
    estimatedTime?: string;
    minQuestions?: number;
    maxQuestions?: number;
    requiredDocuments?: string[];
}

interface FilloutPage {
    id: string;
    name: string;
    order: number;
    sections: FilloutSection[];
}

interface FilloutSection {
    id: string;
    title: string;
    description?: string;
    fields: FilloutField[];
}

interface FilloutField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'date' | 'textarea' | 'file' | 'phone' | 'url';
    required: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: {
        type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url';
        value?: any;
        message: string;
    }[];
    conditionalLogic?: {
        showIf?: { field: string; operator: 'equals' | 'notEquals' | 'contains'; value: any };
        hideIf?: { field: string; operator: 'equals' | 'notEquals' | 'contains'; value: any };
    };
    airtableMapping?: string;
}

/**
 * Converts Fillout form data to React FormDataDefinition
 */
export function convertFilloutToReactForm(filloutData: FilloutFormData): FormDataDefinition {
    const pages: FormPageData[] = filloutData.pages.map((filloutPage) => {
        const sections: FormSectionData[] = filloutPage.sections.map((filloutSection) => {
            const questions: Question[] = filloutSection.fields.map((filloutField) => {
                const question: Question = {
                    id: filloutField.id,
                    label: filloutField.label,
                    type: mapFilloutTypeToReactType(filloutField.type),
                    required: filloutField.required,
                    placeholder: filloutField.placeholder,
                    options: filloutField.options,
                    validation: filloutField.validation?.map(v => {
                        // Map validation types to match ValidationRule type
                        // FilloutField validation type is: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url'
                        // ValidationRule type is: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max'
                        let mappedType: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
                        if (v.type === 'email' || v.type === 'url') {
                            // Convert email/url to pattern validation
                            mappedType = 'pattern';
                        } else if (v.type === 'required' || v.type === 'min' || v.type === 'max' || v.type === 'pattern') {
                            // Direct mapping for these types
                            mappedType = v.type;
                        } else {
                            // Fallback to pattern for unknown types
                            mappedType = 'pattern';
                        }
                        return {
                            type: mappedType,
                            value: v.value,
                            message: v.message,
                        };
                    }) as ValidationRule[] | undefined,
                };

                return question;
            });

            return {
                id: filloutSection.id,
                title: filloutSection.title,
                description: filloutSection.description,
                questions,
            };
        });

        return {
            id: filloutPage.id,
            name: filloutPage.name,
            sections,
        };
    });

    return {
        id: filloutData.templateId,
        title: filloutData.formName,
        pages,
    };
}

/**
 * Maps Fillout field types to React form field types
 */
function mapFilloutTypeToReactType(filloutType: FilloutField['type']): Question['type'] {
    const typeMap: Record<FilloutField['type'], Question['type']> = {
        'text': 'text',
        'number': 'number',
        'email': 'email',
        'select': 'select',
        'radio': 'radio',
        'checkbox': 'checkbox',
        'date': 'date',
        'textarea': 'textarea',
        'file': 'text', // File uploads handled separately
        'phone': 'text',
        'url': 'text',
    };

    return typeMap[filloutType] || 'text';
}

/**
 * Maps Fillout field IDs to Airtable field names
 * Uses the Data Dictionary mappings
 */
export function mapFilloutFieldToAirtable(filloutFieldId: string, fieldMappings: Record<string, string>): string | null {
    // Try direct match first
    if (fieldMappings[filloutFieldId]) {
        return fieldMappings[filloutFieldId];
    }

    // Try case-insensitive match
    const lowerId = filloutFieldId.toLowerCase();
    for (const [key, value] of Object.entries(fieldMappings)) {
        if (key.toLowerCase() === lowerId) {
            return value;
        }
    }

    return null;
}

/**
 * Generates React form component code from FormDataDefinition
 */
export function generateReactFormComponent(formDef: FormDataDefinition, componentName: string): string {
    return `'use client';

import React, { useState } from 'react';
import { FormValues } from '@/types/form';
import { ${formDef.id.toUpperCase().replace(/-/g, '_')}_FORM_DATA } from '@/constants/${formDef.id}Form';
import FormSection from '@/components/forms/FormSection';

interface Props {
    onSave: (values: FormValues) => Promise<void>;
    onSubmit: (values: FormValues) => Promise<void>;
    isSubmitting?: boolean;
}

const ${componentName}: React.FC<Props> = ({ onSave, onSubmit, isSubmitting = false }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [values, setValues] = useState<FormValues>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const pages = ${formDef.id.toUpperCase().replace(/-/g, '_')}_FORM_DATA.pages;
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
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
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

export default ${componentName};`;
}
