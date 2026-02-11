import { FormDataDefinition } from '@/types/form';

/**
 * PEO/EOR Assessment Form
 * Form ID: recKzuznmqq29uASl
 */
export const PEO_EOR_ASSESSMENT_FORM_DATA: FormDataDefinition = {
    id: 'recKzuznmqq29uASl',
    title: 'PEO/EOR Assessment',
    pages: [
        {
            id: 'peo-assessment',
            name: 'PEO/EOR Assessment',
            sections: [
                {
                    id: 'assessment-details',
                    title: 'Assessment Information',
                    description: 'Please provide information for the PEO/EOR assessment',
                    questions: [
                        {
                            id: 'currentPEO',
                            label: 'Current PEO/EOR Provider',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter current PEO/EOR provider name'
                        },
                        {
                            id: 'peoServices',
                            label: 'PEO/EOR Services Used',
                            type: 'textarea',
                            required: false,
                            placeholder: 'List the PEO/EOR services you currently use'
                        },
                        {
                            id: 'satisfactionLevel',
                            label: 'Satisfaction Level',
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
                            id: 'assessmentNotes',
                            label: 'Assessment Notes',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional assessment information'
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
