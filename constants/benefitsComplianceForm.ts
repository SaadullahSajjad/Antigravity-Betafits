import { FormDataDefinition } from '@/types/form';

/**
 * Benefits Compliance Form
 * Form ID: recGrsR8Sdx96pckJ
 */
export const BENEFITS_COMPLIANCE_FORM_DATA: FormDataDefinition = {
    id: 'recGrsR8Sdx96pckJ',
    title: 'Benefits Compliance',
    pages: [
        {
            id: 'compliance-info',
            name: 'Compliance Information',
            sections: [
                {
                    id: 'compliance-details',
                    title: 'Benefits Compliance Details',
                    description: 'Please provide information about your benefits compliance',
                    questions: [
                        {
                            id: 'complianceConcerns',
                            label: 'Compliance Concerns',
                            type: 'textarea',
                            required: false,
                            placeholder: 'List any compliance concerns you have'
                        },
                        {
                            id: 'currentComplianceStatus',
                            label: 'Current Compliance Status',
                            type: 'select',
                            required: false,
                            placeholder: 'Select compliance status',
                            options: [
                                { value: 'compliant', label: 'Fully Compliant' },
                                { value: 'mostly-compliant', label: 'Mostly Compliant' },
                                { value: 'some-issues', label: 'Some Compliance Issues' },
                                { value: 'non-compliant', label: 'Non-Compliant' },
                                { value: 'unknown', label: 'Unknown' }
                            ]
                        },
                        {
                            id: 'complianceAudits',
                            label: 'Recent Compliance Audits',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Information about recent compliance audits'
                        },
                        {
                            id: 'complianceNotes',
                            label: 'Additional Compliance Information',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information about benefits compliance'
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
