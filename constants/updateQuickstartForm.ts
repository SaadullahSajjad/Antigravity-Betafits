import { FormDataDefinition } from '@/types/form';

/**
 * Update Quickstart (w/ current benefits) Form
 * Template ID: rZhiEaUEskus
 * URL: https://betafits.fillout.com/t/rZhiEaUEskus
 */
export const UPDATE_QUICKSTART_FORM_DATA: FormDataDefinition = {
    id: 'rZhiEaUEskus',
    title: 'Update Quickstart (w/ current benefits)',
    pages: [
        {
            id: 'company-update',
            name: 'Company Update',
            sections: [
                {
                    id: 'contact-update',
                    title: 'Contact Information Update',
                    description: 'Update your contact information',
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
                    id: 'company-details',
                    title: 'Company Details',
                    description: 'Update company information',
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
                            placeholder: 'Enter number of employees',
                            validation: [{ type: 'min', value: 1, message: 'Must have at least 1 employee' }]
                        },
                        {
                            id: 'address',
                            label: 'Company Address',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Enter your company address'
                        }
                    ]
                }
            ]
        },
        {
            id: 'current-benefits',
            name: 'Current Benefits',
            sections: [
                {
                    id: 'benefits-info',
                    title: 'Current Benefits Information',
                    description: 'Update your current benefits information',
                    questions: [
                        {
                            id: 'hasMedical',
                            label: 'Do you currently offer medical benefits?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ]
                        },
                        {
                            id: 'medicalDetails',
                            label: 'Medical Benefits Details',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Provide details about your medical benefits'
                        },
                        {
                            id: 'hasDental',
                            label: 'Do you currently offer dental benefits?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ]
                        },
                        {
                            id: 'dentalDetails',
                            label: 'Dental Benefits Details',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Provide details about your dental benefits'
                        },
                        {
                            id: 'hasVision',
                            label: 'Do you currently offer vision benefits?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ]
                        },
                        {
                            id: 'visionDetails',
                            label: 'Vision Benefits Details',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Provide details about your vision benefits'
                        },
                        {
                            id: 'benefitsNotes',
                            label: 'Additional Benefits Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about your current benefits'
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
                    title: 'Review Your Updates',
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
