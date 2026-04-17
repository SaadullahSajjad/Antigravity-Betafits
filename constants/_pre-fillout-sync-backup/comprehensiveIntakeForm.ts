import { FormDataDefinition } from '@/types/form';

/**
 * Comprehensive Intake Form
 * Form ID: recUnTZFK5UyfWqzm
 */
export const COMPREHENSIVE_INTAKE_FORM_DATA: FormDataDefinition = {
    id: 'recUnTZFK5UyfWqzm',
    title: 'Comprehensive Intake',
    pages: [
        {
            id: 'company-info',
            name: 'Company Information',
            sections: [
                {
                    id: 'basic-info',
                    title: 'Basic Company Information',
                    questions: [
                        {
                            id: 'companyName',
                            label: 'Company Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter company name',
                            validation: [{ type: 'required', message: 'Company name is required' }]
                        },
                        {
                            id: 'industry',
                            label: 'Industry',
                            type: 'select',
                            required: false,
                            placeholder: 'Select industry',
                            options: [
                                { value: 'technology', label: 'Technology' },
                                { value: 'healthcare', label: 'Healthcare' },
                                { value: 'finance', label: 'Finance' },
                                { value: 'retail', label: 'Retail' },
                                { value: 'manufacturing', label: 'Manufacturing' },
                                { value: 'other', label: 'Other' }
                            ]
                        },
                        {
                            id: 'employeeCount',
                            label: 'Number of Employees',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter number of employees'
                        }
                    ]
                }
            ]
        },
        {
            id: 'contact-info',
            name: 'Contact Information',
            sections: [
                {
                    id: 'contact-details',
                    title: 'Contact Details',
                    questions: [
                        {
                            id: 'firstName',
                            label: 'First Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your first name',
                            validation: [{ type: 'required', message: 'First Name is required' }]
                        },
                        {
                            id: 'lastName',
                            label: 'Last Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your last name',
                            validation: [{ type: 'required', message: 'Last Name is required' }]
                        },
                        {
                            id: 'email',
                            label: 'Email',
                            type: 'email',
                            required: true,
                            placeholder: 'Enter your email address',
                            validation: [{ type: 'required', message: 'Email is required' }]
                        },
                        {
                            id: 'phone',
                            label: 'Phone',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your phone number',
                            validation: [{ type: 'required', message: 'Phone is required' }]
                        }
                    ]
                }
            ]
        },
        {
            id: 'benefits-info',
            name: 'Benefits Information',
            sections: [
                {
                    id: 'benefits-details',
                    title: 'Current Benefits',
                    questions: [
                        {
                            id: 'currentBenefits',
                            label: 'Current Benefits Overview',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Describe your current benefits setup'
                        },
                        {
                            id: 'benefitsGoals',
                            label: 'Benefits Goals',
                            type: 'textarea',
                            required: false,
                            placeholder: 'What are your goals for benefits?'
                        }
                    ]
                }
            ]
        },
        {
            id: 'review',
            name: 'Review',
            sections: [
                {
                    id: 'review-info',
                    title: 'Review Your Information',
                    questions: [
                        {
                            id: 'confirmAccuracy',
                            label: 'I confirm that all information provided is accurate',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes, all information is accurate' }
                            ],
                            validation: [{ type: 'required', message: 'Please confirm accuracy' }]
                        }
                    ]
                }
            ]
        }
    ]
};
