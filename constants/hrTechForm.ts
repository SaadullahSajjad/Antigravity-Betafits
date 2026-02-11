import { FormDataDefinition } from '@/types/form';

/**
 * HR Tech Form
 * Form ID: recOt6cX0t1DksDFT
 */
export const HR_TECH_FORM_DATA: FormDataDefinition = {
    id: 'recOt6cX0t1DksDFT',
    title: 'HR Tech',
    pages: [
        {
            id: 'hr-tech-info',
            name: 'HR Technology Information',
            sections: [
                {
                    id: 'tech-details',
                    title: 'HR Technology Details',
                    description: 'Please provide information about your HR technology',
                    questions: [
                        {
                            id: 'currentHRSystem',
                            label: 'Current HR System',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter current HR system name'
                        },
                        {
                            id: 'hrTechServices',
                            label: 'HR Technology Services Used',
                            type: 'textarea',
                            required: false,
                            placeholder: 'List the HR technology services you currently use'
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
                            id: 'hrTechNotes',
                            label: 'Additional HR Technology Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about HR technology'
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
