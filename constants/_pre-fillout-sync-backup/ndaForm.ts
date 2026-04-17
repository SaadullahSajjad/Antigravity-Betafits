import { FormDataDefinition } from '@/types/form';

/**
 * NDA Form
 * Form ID: recySUNj6jv47SOKr
 */
export const NDA_FORM_DATA: FormDataDefinition = {
    id: 'recySUNj6jv47SOKr',
    title: 'NDA',
    pages: [
        {
            id: 'nda-info',
            name: 'NDA Information',
            sections: [
                {
                    id: 'nda-details',
                    title: 'Non-Disclosure Agreement Details',
                    description: 'Please provide information about your NDA',
                    questions: [
                        {
                            id: 'hasNDA',
                            label: 'Do you have an NDA to upload?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes, I will upload it' },
                                { value: 'no', label: 'No, I do not have an NDA' }
                            ],
                            validation: [{ type: 'required', message: 'Please select an option' }]
                        },
                        {
                            id: 'ndaType',
                            label: 'NDA Type',
                            type: 'select',
                            required: false,
                            placeholder: 'Select NDA type',
                            options: [
                                { value: 'mutual', label: 'Mutual NDA' },
                                { value: 'unilateral', label: 'Unilateral NDA' },
                                { value: 'other', label: 'Other' }
                            ]
                        },
                        {
                            id: 'ndaNotes',
                            label: 'NDA Notes',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional notes about the NDA'
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
