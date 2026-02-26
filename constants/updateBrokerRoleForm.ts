import { FormDataDefinition } from '@/types/form';

/**
 * Update Broker Role Form
 * Template ID: urHF8xDu7eus
 * URL: https://betafits.fillout.com/t/urHF8xDu7eus
 * 
 * Based on actual Fillout form structure:
 * - Page 1: Broker Relationship (General Broker Info, Agreements and Compensation)
 * - Page 2: Broker Support & Services
 * - Page 3: Broker Evaluation (Broker Scorecard with 5 rating questions)
 * - Page 4: Review
 * 
 * Verified against actual Fillout form on 2026-02-10
 */
export const UPDATE_BROKER_ROLE_FORM_DATA: FormDataDefinition = {
    id: 'urHF8xDu7eus',
    title: 'Update Broker Role',
    pages: [
        {
            id: 'broker-relationship',
            name: 'Broker Relationship',
            sections: [
                {
                    id: 'general-broker-info',
                    title: 'General Broker Info',
                    questions: [
                        {
                            id: 'brokerType',
                            label: 'What type of broker, platform, or consultant supports your employee benefits?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'small_firm', label: 'Small Firm' },
                                { value: 'city_regional_brokerage', label: 'City or Regional Brokerage' },
                                { value: 'national_brokerage', label: 'National Brokerage' },
                                { value: 'payroll_provider', label: 'Payroll Provider' }
                            ],
                            validation: [{ type: 'required', message: 'Please select a broker type' }]
                        }
                    ]
                },
                {
                    id: 'agreements-compensation',
                    title: 'Agreements and Compensation',
                    questions: [
                        {
                            id: 'hasServiceAgreement',
                            label: 'Do you have a signed service agreement or only a Broker of Record (BOR) letter?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ],
                            validation: [{ type: 'required', message: 'Please select an option' }]
                        },
                        {
                            id: 'paysBrokerFees',
                            label: 'Do you pay your broker any fees beyond commissions or standard premiums?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ],
                            validation: [{ type: 'required', message: 'Please select an option' }]
                        },
                        {
                            id: 'brokerSubsidizedServices',
                            label: 'Does your broker currently pay for or subsidize any of the following services?',
                            type: 'checkbox',
                            required: false,
                            options: [
                                { value: 'hr_support_line', label: 'HR Support Line' },
                                { value: 'benefits_app', label: 'Benefits App' },
                                { value: 'cobra_administration', label: 'COBRA Administration' },
                                { value: 'hra_administration', label: 'HRA Administration' },
                                { value: 'benefits_administration_platform', label: 'Benefits Administration Platform' }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'broker-support-services',
            name: 'Broker Support & Services',
            sections: [
                {
                    id: 'support-services',
                    title: 'Broker Support & Services',
                    description: 'Information about broker support and services',
                    questions: [
                        {
                            id: 'brokerContactFrequency',
                            label: 'How often do you contact your broker for support?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'daily', label: 'Daily' },
                                { value: 'weekly_or_more', label: 'Weekly or more' },
                                { value: 'monthly', label: 'Monthly' },
                                { value: 'quarterly', label: 'Quarterly' },
                                { value: 'rarely', label: 'Rarely' },
                                { value: 'never', label: 'Never' }
                            ]
                        },
                        {
                            id: 'brokerStrategicFrequency',
                            label: 'How often do you have strategic meetings with your broker?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'weekly_or_more', label: 'Weekly or more' },
                                { value: 'monthly', label: 'Monthly' },
                                { value: 'quarterly', label: 'Quarterly' },
                                { value: 'semi_annually', label: 'Semi-annually' },
                                { value: 'annually', label: 'Annually' },
                                { value: 'rarely', label: 'Rarely' },
                                { value: 'never', label: 'Never' }
                            ]
                        },
                        {
                            id: 'brokerSupportNotes',
                            label: 'Additional notes about broker support and services',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Enter any additional information'
                        }
                    ]
                }
            ]
        },
        {
            id: 'broker-evaluation',
            name: 'Broker Evaluation',
            sections: [
                {
                    id: 'evaluation',
                    title: 'Broker Evaluation & Satisfaction',
                    description: 'Rate your broker on the following criteria',
                    questions: [
                        {
                            id: 'brokerResponsiveness',
                            label: 'How would you rate your broker\'s responsiveness and communication?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: '1', label: '1' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5' },
                                { value: '6', label: '6' },
                                { value: '7', label: '7' },
                                { value: '8', label: '8' },
                                { value: '9', label: '9' },
                                { value: '10', label: '10' }
                            ],
                            validation: [{ type: 'required', message: 'Please rate responsiveness' }],
                            helperText: '1 = Poor communication, 10 = Always quick and helpful'
                        },
                        {
                            id: 'brokerRenewalStrategy',
                            label: 'How would you rate your broker\'s renewal strategy and plan benchmarking?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: '1', label: '1' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5' },
                                { value: '6', label: '6' },
                                { value: '7', label: '7' },
                                { value: '8', label: '8' },
                                { value: '9', label: '9' },
                                { value: '10', label: '10' }
                            ],
                            validation: [{ type: 'required', message: 'Please rate renewal strategy' }],
                            helperText: '1 = Minimal support, 10 = Highly strategic and data-driven'
                        },
                        {
                            id: 'brokerCompliance',
                            label: 'How would you rate your broker\'s compliance and documentation support?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: '1', label: '1' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5' },
                                { value: '6', label: '6' },
                                { value: '7', label: '7' },
                                { value: '8', label: '8' },
                                { value: '9', label: '9' },
                                { value: '10', label: '10' }
                            ],
                            validation: [{ type: 'required', message: 'Please rate compliance support' }],
                            helperText: '1 = No support, 10 = Fully compliant and proactive'
                        },
                        {
                            id: 'brokerAdminSupport',
                            label: 'How would you rate your broker\'s admin coordination and day-to-day support?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: '1', label: '1' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5' },
                                { value: '6', label: '6' },
                                { value: '7', label: '7' },
                                { value: '8', label: '8' },
                                { value: '9', label: '9' },
                                { value: '10', label: '10' }
                            ],
                            validation: [{ type: 'required', message: 'Please rate admin support' }],
                            helperText: '1 = Minimal help, 10 = Handles most admin tasks with ease'
                        },
                        {
                            id: 'brokerStrategicValue',
                            label: 'How would you rate your broker\'s value as a strategic partner?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: '1', label: '1' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5' },
                                { value: '6', label: '6' },
                                { value: '7', label: '7' },
                                { value: '8', label: '8' },
                                { value: '9', label: '9' },
                                { value: '10', label: '10' }
                            ],
                            validation: [{ type: 'required', message: 'Please rate strategic value' }],
                            helperText: '1 = Just a vendor, 10 = Trusted strategic advisor'
                        },
                        {
                            id: 'brokerEvaluationNotes',
                            label: 'Broker Evaluation Notes',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional comments about your broker'
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
