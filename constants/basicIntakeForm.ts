import { FormDataDefinition } from '@/types/form';

/**
 * Basic Intake Form
 * Form ID: rechTHxZIxS3bBcqF
 */
export const BASIC_INTAKE_FORM_DATA: FormDataDefinition = {
    id: 'rechTHxZIxS3bBcqF',
    title: 'Basic Intake Form',
    pages: [
        {
            id: 'basic-info',
            name: 'Basic Information',
            sections: [
                {
                    id: 'company-contact',
                    title: 'Company and Contact Information',
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
                        },
                        {
                            id: 'employeeCount',
                            label: 'Number of Employees',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter number of employees',
                            validation: [{ type: 'min', value: 0, message: 'Number of employees cannot be negative' }]
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
