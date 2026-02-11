import { FormDataDefinition } from '@/types/form';

/**
 * Quick Start Form (Alternative)
 * Form ID: recufWIRuSFArZ9GG
 */
export const QUICK_START_ALT_FORM_DATA: FormDataDefinition = {
    id: 'recufWIRuSFArZ9GG',
    title: 'Quick Start',
    pages: [
        {
            id: 'company-info',
            name: 'Company Information',
            sections: [
                {
                    id: 'contact-info',
                    title: 'Contact Information',
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
                },
                {
                    id: 'company-details',
                    title: 'Company Details',
                    questions: [
                        {
                            id: 'companyName',
                            label: 'Company Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your company name',
                            validation: [{ type: 'required', message: 'Company Name is required' }]
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
