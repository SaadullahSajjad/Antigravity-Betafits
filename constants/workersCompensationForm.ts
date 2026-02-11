import { FormDataDefinition } from '@/types/form';

/**
 * Workers Compensation Form
 * Form ID: rec7NfuiBQ8wrEmu7
 */
export const WORKERS_COMPENSATION_FORM_DATA: FormDataDefinition = {
    id: 'rec7NfuiBQ8wrEmu7',
    title: 'Workers Compensation',
    pages: [
        {
            id: 'workers-comp',
            name: 'Workers Compensation Information',
            sections: [
                {
                    id: 'comp-details',
                    title: 'Workers Compensation Details',
                    description: 'Please provide information about your workers compensation coverage',
                    questions: [
                        {
                            id: 'hasWorkersComp',
                            label: 'Do you currently have workers compensation coverage?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ],
                            validation: [{ type: 'required', message: 'Please select an option' }]
                        },
                        {
                            id: 'compCarrier',
                            label: 'Workers Compensation Carrier',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter carrier name'
                        },
                        {
                            id: 'policyNumber',
                            label: 'Policy Number',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter policy number'
                        },
                        {
                            id: 'coverageStates',
                            label: 'States Covered',
                            type: 'textarea',
                            required: false,
                            placeholder: 'List states where you have workers compensation coverage'
                        },
                        {
                            id: 'compNotes',
                            label: 'Additional Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about workers compensation'
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
