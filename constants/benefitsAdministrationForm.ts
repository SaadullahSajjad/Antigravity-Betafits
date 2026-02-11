import { FormDataDefinition } from '@/types/form';

/**
 * Benefits Administration Form
 * Form ID: recFxyNqTLDdrxXN2
 */
export const BENEFITS_ADMINISTRATION_FORM_DATA: FormDataDefinition = {
    id: 'recFxyNqTLDdrxXN2',
    title: 'Benefits Administration',
    pages: [
        {
            id: 'admin-info',
            name: 'Administration Information',
            sections: [
                {
                    id: 'admin-details',
                    title: 'Benefits Administration Details',
                    description: 'Please provide information about your benefits administration',
                    questions: [
                        {
                            id: 'currentAdmin',
                            label: 'Current Benefits Administrator',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter administrator name or company'
                        },
                        {
                            id: 'adminServices',
                            label: 'Administration Services Used',
                            type: 'textarea',
                            required: false,
                            placeholder: 'List the administration services you currently use'
                        },
                        {
                            id: 'satisfactionLevel',
                            label: 'Satisfaction Level with Current Administration',
                            type: 'select',
                            required: false,
                            placeholder: 'Select satisfaction level',
                            options: [
                                { value: 'very-satisfied', label: 'Very Satisfied' },
                                { value: 'satisfied', label: 'Satisfied' },
                                { value: 'neutral', label: 'Neutral' },
                                { value: 'dissatisfied', label: 'Dissatisfied' },
                                { value: 'very-dissatisfied', label: 'Very Dissatisfied' }
                            ]
                        },
                        {
                            id: 'adminNotes',
                            label: 'Additional Administration Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about benefits administration'
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
