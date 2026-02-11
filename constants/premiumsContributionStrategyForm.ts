import { FormDataDefinition } from '@/types/form';

/**
 * Premiums / Contribution Strategy Form
 * Form ID: recdjXjySYuYUGkdP
 */
export const PREMIUMS_CONTRIBUTION_STRATEGY_FORM_DATA: FormDataDefinition = {
    id: 'recdjXjySYuYUGkdP',
    title: 'Premiums / Contribution Strategy',
    pages: [
        {
            id: 'premiums-info',
            name: 'Premiums & Contribution Information',
            sections: [
                {
                    id: 'premiums-details',
                    title: 'Premium and Contribution Details',
                    description: 'Please provide information about your premium and contribution strategy',
                    questions: [
                        {
                            id: 'currentPremium',
                            label: 'Current Monthly Premium (Per Employee)',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter monthly premium amount'
                        },
                        {
                            id: 'employerContribution',
                            label: 'Employer Contribution Percentage',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter employer contribution percentage',
                            helperText: 'Enter as a number (e.g., 80 for 80%)'
                        },
                        {
                            id: 'contributionStrategy',
                            label: 'Contribution Strategy',
                            type: 'select',
                            required: false,
                            placeholder: 'Select contribution strategy',
                            options: [
                                { value: 'fixed-dollar', label: 'Fixed Dollar Amount' },
                                { value: 'percentage', label: 'Percentage of Premium' },
                                { value: 'tiered', label: 'Tiered Structure' },
                                { value: 'other', label: 'Other' }
                            ]
                        },
                        {
                            id: 'strategyNotes',
                            label: 'Strategy Notes',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Additional information about your premium and contribution strategy'
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
