import { FormDataDefinition } from '@/types/form';

/**
 * Medical Coverage Survey Form
 * Form ID: rec4V98J6aPaM3u9H
 */
export const MEDICAL_COVERAGE_SURVEY_FORM_DATA: FormDataDefinition = {
    id: 'rec4V98J6aPaM3u9H',
    title: 'Medical Coverage Survey',
    pages: [
        {
            id: 'medical-coverage',
            name: 'Medical Coverage Information',
            sections: [
                {
                    id: 'coverage-details',
                    title: 'Current Medical Coverage',
                    description: 'Please provide information about your current medical coverage',
                    questions: [
                        {
                            id: 'hasMedicalCoverage',
                            label: 'Do you currently have medical coverage?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ],
                            validation: [{ type: 'required', message: 'Please select an option' }]
                        },
                        {
                            id: 'coverageType',
                            label: 'Type of Coverage',
                            type: 'select',
                            required: false,
                            placeholder: 'Select coverage type',
                            options: [
                                { value: 'individual', label: 'Individual' },
                                { value: 'family', label: 'Family' },
                                { value: 'employer', label: 'Employer-Provided' },
                                { value: 'other', label: 'Other' }
                            ]
                        },
                        {
                            id: 'insuranceCarrier',
                            label: 'Insurance Carrier',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter insurance carrier name'
                        },
                        {
                            id: 'planName',
                            label: 'Plan Name',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter plan name'
                        },
                        {
                            id: 'coverageNotes',
                            label: 'Additional Coverage Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about your medical coverage'
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
                    description: 'Please review all information before submitting',
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
