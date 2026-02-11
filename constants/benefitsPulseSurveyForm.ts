import { FormDataDefinition } from '@/types/form';

/**
 * Benefits Pulse Survey Form (Benefits Feedback Form)
 * Fillout Template ID: eQ7FVU76PDus
 * Airtable Form ID: recmB9IdRhtgckvaY
 * URL: https://betafits.fillout.com/t/eQ7FVU76PDus
 * 
 * Based on actual Fillout form structure:
 * - Company (text input)
 * - How are you currently enrolled for health benefits? (radio)
 * - Overall Benefits Package (slider/range)
 * - Medical Plan Options (slider/range)
 * - Additional fields may be present below
 */
export const BENEFITS_PULSE_SURVEY_FORM_DATA: FormDataDefinition = {
    id: 'eQ7FVU76PDus',
    title: 'Benefits Feedback Form',
    pages: [
        {
            id: 'survey-questions',
            name: 'Survey Questions',
            sections: [
                {
                    id: 'basic-info',
                    title: 'Basic Information',
                    description: 'Please provide your information',
                    questions: [
                        {
                            id: 'company',
                            label: 'Company',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter company name'
                        },
                        {
                            id: 'healthBenefitsEnrollment',
                            label: 'How are you currently enrolled for health benefits?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'employee_only', label: 'Employee Only' },
                                { value: 'employee_spouse', label: 'Employee + Spouse' },
                                { value: 'employee_children', label: 'Employee + Child(ren)' },
                                { value: 'family', label: 'Family' },
                                { value: 'waived', label: 'Waived' },
                                { value: 'not_eligible', label: 'Not Eligible' }
                            ],
                            validation: [{ type: 'required', message: 'Please select your enrollment status' }]
                        }
                    ]
                },
                {
                    id: 'satisfaction',
                    title: 'Benefits Satisfaction',
                    description: 'Please rate your satisfaction with your benefits',
                    questions: [
                        {
                            id: 'overallBenefitsPackage',
                            label: 'Overall Benefits Package',
                            type: 'number', // Slider will be rendered as number input with range
                            required: true,
                            placeholder: 'Rate from 1-10',
                            validation: [
                                { type: 'required', message: 'Please rate your overall benefits package' },
                                { type: 'min', value: 1, message: 'Rating must be at least 1' },
                                { type: 'max', value: 10, message: 'Rating must be at most 10' }
                            ]
                        },
                        {
                            id: 'medicalPlanOptions',
                            label: 'Medical Plan Options',
                            type: 'number', // Slider will be rendered as number input with range
                            required: true,
                            placeholder: 'Rate from 1-10',
                            validation: [
                                { type: 'required', message: 'Please rate your medical plan options' },
                                { type: 'min', value: 1, message: 'Rating must be at least 1' },
                                { type: 'max', value: 10, message: 'Rating must be at most 10' }
                            ]
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
                    title: 'Review Your Responses',
                    questions: [
                        {
                            id: 'confirmAccuracy',
                            label: 'I confirm that all responses are accurate',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes, all responses are accurate' }
                            ],
                            validation: [{ type: 'required', message: 'Please confirm accuracy' }]
                        }
                    ]
                }
            ]
        }
    ]
};
