import { FormDataDefinition } from '@/types/form';

/**
 * Update PEO/HR Form
 * Template ID: gn6WNJPJKTus
 * URL: https://betafits.fillout.com/t/gn6WNJPJKTus
 */
export const UPDATE_PEO_HR_FORM_DATA: FormDataDefinition = {
    id: 'gn6WNJPJKTus',
    title: 'Update PEO/HR',
    pages: [
        {
            id: 'peo-info',
            name: 'PEO/HR Information',
            sections: [
                {
                    id: 'contact-info',
                    title: 'Contact Information',
                    description: 'Your contact details',
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
                            id: 'title',
                            label: 'Title',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your job title',
                            validation: [{ type: 'required', message: 'Title is required' }]
                        },
                        {
                            id: 'phone',
                            label: 'Phone',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your phone number',
                            validation: [{ type: 'required', message: 'Phone is required' }]
                        },
                        {
                            id: 'email',
                            label: 'Email',
                            type: 'email',
                            required: true,
                            placeholder: 'Enter your email address',
                            validation: [{ type: 'required', message: 'Email is required' }]
                        }
                    ]
                },
                {
                    id: 'peo-details',
                    title: 'PEO/HR Details',
                    description: 'Information about your PEO/HR setup',
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
                            id: 'currentPEO',
                            label: 'Current PEO/HR Provider',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter current PEO/HR provider name'
                        },
                        {
                            id: 'peoServices',
                            label: 'PEO/HR Services Used',
                            type: 'textarea',
                            required: false,
                            placeholder: 'List the PEO/HR services you currently use'
                        },
                        {
                            id: 'employeeCount',
                            label: 'Number of Employees',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter number of employees',
                            validation: [{ type: 'min', value: 1, message: 'Must have at least 1 employee' }]
                        },
                        {
                            id: 'peoNotes',
                            label: 'Additional PEO/HR Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about your PEO/HR setup'
                        }
                    ]
                }
            ]
        },
        {
            id: 'benefits',
            name: 'Benefits',
            sections: [
                {
                    id: 'benefits-info',
                    title: 'Benefits Information',
                    description: 'Current benefits through PEO/HR',
                    questions: [
                        {
                            id: 'hasMedical',
                            label: 'Do you offer medical benefits through your PEO/HR?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ]
                        },
                        {
                            id: 'hasDental',
                            label: 'Do you offer dental benefits through your PEO/HR?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ]
                        },
                        {
                            id: 'hasVision',
                            label: 'Do you offer vision benefits through your PEO/HR?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ]
                        },
                        {
                            id: 'benefitsNotes',
                            label: 'Benefits Notes',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Additional information about benefits through PEO/HR'
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
                    description: 'Please review all the information before submitting',
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
