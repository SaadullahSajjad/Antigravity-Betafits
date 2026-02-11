import { FormDataDefinition } from '@/types/form';

/**
 * Quick Start (New Benefits) Form
 * Form ID: reclUQ6KhVzCssuVl
 */
export const QUICK_START_NEW_BENEFITS_FORM_DATA: FormDataDefinition = {
    id: 'reclUQ6KhVzCssuVl',
    title: 'Quick Start (New Benefits)',
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
            id: 'new-benefits',
            name: 'New Benefits',
            sections: [
                {
                    id: 'benefits-info',
                    title: 'New Benefits Information',
                    description: 'Tell us about the new benefits you want to set up',
                    questions: [
                        {
                            id: 'benefitsNeeded',
                            label: 'Benefits Needed',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Describe the benefits you need'
                        },
                        {
                            id: 'targetStartDate',
                            label: 'Target Start Date',
                            type: 'date',
                            required: false,
                            placeholder: 'Select target start date'
                        },
                        {
                            id: 'benefitsNotes',
                            label: 'Additional Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about new benefits'
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
