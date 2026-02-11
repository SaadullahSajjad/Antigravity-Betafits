import { FormDataDefinition } from '@/types/form';

/**
 * Broker Role Form
 * Form ID: recxH9Jrk10bbqU58
 */
export const BROKER_ROLE_FORM_DATA: FormDataDefinition = {
    id: 'recxH9Jrk10bbqU58',
    title: 'Broker Role',
    pages: [
        {
            id: 'broker-info',
            name: 'Broker Information',
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
                    id: 'broker-details',
                    title: 'Broker Details',
                    questions: [
                        {
                            id: 'brokerName',
                            label: 'Broker/Company Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter broker or company name',
                            validation: [{ type: 'required', message: 'Broker/Company Name is required' }]
                        },
                        {
                            id: 'brokerLicense',
                            label: 'Broker License Number',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter broker license number if applicable'
                        },
                        {
                            id: 'brokerNotes',
                            label: 'Additional Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about your broker role'
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
