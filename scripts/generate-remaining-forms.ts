/**
 * Generate React Components and Pages for Remaining 13 Forms
 */

import * as fs from 'fs';
import * as path from 'path';

const FORMS = [
    { id: 'rec4V98J6aPaM3u9H', name: 'MedicalCoverageSurvey', constant: 'MEDICAL_COVERAGE_SURVEY_FORM_DATA', file: 'medicalCoverageSurveyForm' },
    { id: 'rec7NfuiBQ8wrEmu7', name: 'WorkersCompensation', constant: 'WORKERS_COMPENSATION_FORM_DATA', file: 'workersCompensationForm' },
    { id: 'recFVcfdoXkUjIcod', name: 'AddNewGroup', constant: 'ADD_NEW_GROUP_FORM_DATA', file: 'addNewGroupForm' },
    { id: 'recFxyNqTLDdrxXN2', name: 'BenefitsAdministration', constant: 'BENEFITS_ADMINISTRATION_FORM_DATA', file: 'benefitsAdministrationForm' },
    { id: 'recGrsR8Sdx96pckJ', name: 'BenefitsCompliance', constant: 'BENEFITS_COMPLIANCE_FORM_DATA', file: 'benefitsComplianceForm' },
    { id: 'recKzuznmqq29uASl', name: 'PEOEORAssessment', constant: 'PEO_EOR_ASSESSMENT_FORM_DATA', file: 'peoEORAssessmentForm' },
    { id: 'recOE9pVakkobVzU7', name: 'AppointBetafits', constant: 'APPOINT_BETAFITS_FORM_DATA', file: 'appointBetafitsForm' },
    { id: 'recOt6cX0t1DksDFT', name: 'HRTech', constant: 'HR_TECH_FORM_DATA', file: 'hrTechForm' },
    { id: 'recUnTZFK5UyfWqzm', name: 'ComprehensiveIntake', constant: 'COMPREHENSIVE_INTAKE_FORM_DATA', file: 'comprehensiveIntakeForm' },
    { id: 'recdjXjySYuYUGkdP', name: 'PremiumsContributionStrategy', constant: 'PREMIUMS_CONTRIBUTION_STRATEGY_FORM_DATA', file: 'premiumsContributionStrategyForm' },
    { id: 'rechTHxZIxS3bBcqF', name: 'BasicIntake', constant: 'BASIC_INTAKE_FORM_DATA', file: 'basicIntakeForm' },
    { id: 'reclUQ6KhVzCssuVl', name: 'QuickStartNewBenefits', constant: 'QUICK_START_NEW_BENEFITS_FORM_DATA', file: 'quickStartNewBenefitsForm' },
    { id: 'recmB9IdRhtgckvaY', name: 'BenefitsPulseSurvey', constant: 'BENEFITS_PULSE_SURVEY_FORM_DATA', file: 'benefitsPulseSurveyForm' },
    { id: 'recsLJiBVdED8EEbr', name: 'DocumentUploader', constant: 'DOCUMENT_UPLOADER_FORM_DATA', file: 'documentUploaderForm' },
    { id: 'recufWIRuSFArZ9GG', name: 'QuickStartAlt', constant: 'QUICK_START_ALT_FORM_DATA', file: 'quickStartFormAlt' },
    { id: 'recxH9Jrk10bbqU58', name: 'BrokerRole', constant: 'BROKER_ROLE_FORM_DATA', file: 'brokerRoleForm' },
    { id: 'recySUNj6jv47SOKr', name: 'NDA', constant: 'NDA_FORM_DATA', file: 'ndaForm' },
];

function generateComponent(form: typeof FORMS[0]) {
    const componentContent = `'use client';

import React, { useState } from 'react';
import { FormValues } from '@/types/form';
import { ${form.constant} } from '@/constants/${form.file}';
import FormSection from './FormSection';

interface Props {
    onSave: (values: FormValues) => Promise<void>;
    onSubmit: (values: FormValues) => Promise<void>;
    isSubmitting?: boolean;
}

const ${form.name}Form: React.FC<Props> = ({ onSave, onSubmit, isSubmitting = false }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [values, setValues] = useState<FormValues>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const pages = ${form.constant}.pages;
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

export default ${form.name}Form;
`;

    const componentsDir = path.join(process.cwd(), 'components', 'forms');
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    const filePath = path.join(componentsDir, `${form.name}Form.tsx`);
    fs.writeFileSync(filePath, componentContent);
    console.log(`✅ Generated component: ${filePath}`);
}

function generatePage(form: typeof FORMS[0], formTitle: string) {
    const routeId = form.id.toLowerCase();
    const pageContent = `'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ${form.name}Form from '@/components/forms/${form.name}Form';
import { FormValues } from '@/types/form';

export default function ${form.name}FormPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('form_${form.id}_progress');
        if (saved) {
            try {
                JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved progress:', e);
            }
        }
    }, []);

    const handleSave = async (values: FormValues) => {
        localStorage.setItem('form_${form.id}_progress', JSON.stringify(values));
    };

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        setSubmitError('');
        
        try {
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: '${form.id}',
                    formName: '${formTitle}',
                    values,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem('form_${form.id}_progress');
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/?formSubmitted=true');
                    router.refresh();
                }, 2000);
            } else {
                setSubmitError(data.message || data.error || 'Failed to submit form. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitError('An error occurred while submitting the form. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-gray-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">${formTitle}</span>
            </div>

            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                    ${formTitle}
                </h1>
                <p className="text-[16px] text-gray-500 font-medium">
                    Please complete this form to proceed.
                </p>
            </header>

            {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-green-900 mb-1">Form Submitted Successfully!</h3>
                        <p className="text-sm text-green-700">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-900 mb-1">Submission Failed</h3>
                        <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                    <button onClick={() => setSubmitError('')} className="flex-shrink-0 text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <${form.name}Form onSave={handleSave} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}
`;

    const pagesDir = path.join(process.cwd(), 'app', 'forms', routeId);
    if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
    }

    const filePath = path.join(pagesDir, 'page.tsx');
    fs.writeFileSync(filePath, pageContent);
    console.log(`✅ Generated page: ${filePath}`);
}

// Generate all components and pages
console.log('🚀 Generating React components and pages for all forms...\n');

const formTitles: Record<string, string> = {
    'rec4V98J6aPaM3u9H': 'Medical Coverage Survey',
    'rec7NfuiBQ8wrEmu7': 'Workers Compensation',
    'recFVcfdoXkUjIcod': 'Add New Group',
    'recFxyNqTLDdrxXN2': 'Benefits Administration',
    'recGrsR8Sdx96pckJ': 'Benefits Compliance',
    'recKzuznmqq29uASl': 'PEO/EOR Assessment',
    'recOE9pVakkobVzU7': 'Appoint Betafits',
    'recOt6cX0t1DksDFT': 'HR Tech',
    'recUnTZFK5UyfWqzm': 'Comprehensive Intake',
    'recdjXjySYuYUGkdP': 'Premiums / Contribution Strategy',
    'rechTHxZIxS3bBcqF': 'Basic Intake Form',
    'reclUQ6KhVzCssuVl': 'Quick Start (New Benefits)',
    'recmB9IdRhtgckvaY': 'Benefits Pulse Survey',
    'recsLJiBVdED8EEbr': 'Document Uploader',
    'recufWIRuSFArZ9GG': 'Quick Start',
    'recxH9Jrk10bbqU58': 'Broker Role',
    'recySUNj6jv47SOKr': 'NDA',
};

FORMS.forEach(form => {
    const title = formTitles[form.id] || form.name;
    generateComponent(form);
    generatePage(form, title);
});

console.log('\n✨ All forms generated successfully!');
