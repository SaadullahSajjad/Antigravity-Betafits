import { FormDataDefinition } from '@/types/form';

/**
 * Quick Start (Current Benefits) Multi-Page Form
 * Template ID: eBxXtLZdK4us
 * URL: https://betafits.fillout.com/t/eBxXtLZdK4us
 * 
 * 4 Pages: Company Info, Benefits, Upload Documents, Review
 * 
 * Verified against actual Fillout form on 2026-02-10
 */
export const QUICK_START_COMPLETE_FORM_DATA: FormDataDefinition = {
    id: 'eBxXtLZdK4us',
    title: 'Quick Start (Current Benefits) Multi-Page',
    pages: [
        {
            id: 'company-info',
            name: 'Company Info',
            sections: [
                {
                    id: 'contact-info',
                    title: 'Contact Information',
                    description: 'Please provide your contact details',
                    questions: [
                        {
                            id: 'firstName',
                            label: 'First Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your first name',
                            validation: [{ type: 'required', message: 'First Name is required' }]
                        },
                        {
                            id: 'lastName',
                            label: 'Last Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your last name',
                            validation: [{ type: 'required', message: 'Last Name is required' }]
                        },
                        {
                            id: 'title',
                            label: 'Title',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your job title',
                            validation: [{ type: 'required', message: 'Title is required' }]
                        },
                        {
                            id: 'phone',
                            label: 'Phone',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your phone number',
                            validation: [{ type: 'required', message: 'Phone is required' }]
                        },
                        {
                            id: 'email',
                            label: 'Email',
                            type: 'email',
                            required: true,
                            placeholder: 'Enter your email address',
                            validation: [{ type: 'required', message: 'Email is required' }]
                        }
                    ]
                },
                {
                    id: 'company-info',
                    title: 'Company Information',
                    description: 'Details about your company',
                    questions: [
                        {
                            id: 'companyName',
                            label: 'Company Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your company name',
                            validation: [{ type: 'required', message: 'Company Name is required' }]
                        },
                        {
                            id: 'address',
                            label: 'Address',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter your company address'
                        },
                        {
                            id: 'city',
                            label: 'City',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter city'
                        },
                        {
                            id: 'state',
                            label: 'State / Province',
                            type: 'select',
                            required: false,
                            placeholder: 'Select state',
                            options: [
                                { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
                                { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
                                { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
                                { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
                                { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
                                { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
                                { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
                                { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
                                { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
                                { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
                                { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
                                { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
                                { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
                                { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
                                { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
                                { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
                                { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
                                { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
                                { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
                                { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
                                { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
                                { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
                                { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
                                { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
                                { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
                            ]
                        },
                        {
                            id: 'zipCode',
                            label: 'ZIP Code',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter zip code'
                        },
                        {
                            id: 'ein',
                            label: 'Employer Identification Number (EIN)',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter EIN if available',
                            helperText: 'Optional - can be provided later'
                        },
                        {
                            id: 'yearFounded',
                            label: 'Year company founded',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter year company was founded'
                        },
                        {
                            id: 'sicCode',
                            label: 'Preferred SIC Code',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter SIC code'
                        },
                        {
                            id: 'naicsCode',
                            label: 'Preferred NAICS Code',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter NAICS code'
                        }
                    ]
                },
                {
                    id: 'nda',
                    title: 'Non-Disclosure Agreement (NDA) (Optional)',
                    description: 'This will be sent separately via DropboxSign.',
                    questions: [
                        {
                            id: 'hasNDA',
                            label: 'Would you like Betafits to sign an NDA regarding your company and employee information?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ],
                            validation: [{ type: 'required', message: 'Please select an option' }]
                        }
                    ]
                }
            ]
        },
        {
            id: 'benefits',
            name: 'Benefits',
            sections: [
                {
                    id: 'employee-info',
                    title: 'Employee Information',
                    questions: [
                        {
                            id: 'benefitEligibleEmployees',
                            label: 'How many benefit-eligible US employees does the company have?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: '1-9', label: '1 - 9' },
                                { value: '10-24', label: '10 - 24' },
                                { value: '25-49', label: '25 - 49' },
                                { value: '50-99', label: '50 - 99' },
                                { value: '100-249', label: '100 - 249' },
                                { value: '250-499', label: '250 - 499' },
                                { value: '500-999', label: '500 - 999' },
                                { value: '1000-4999', label: '1000 - 4999' },
                                { value: '5000+', label: '5000+' }
                            ],
                            validation: [{ type: 'required', message: 'Please select employee count range' }]
                        },
                        {
                            id: 'estimatedBenefitEligibleEEs',
                            label: 'Estimated Benefit Eligible EEs',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter estimated number'
                        },
                        {
                            id: 'estimatedMedicalEnrolledEEs',
                            label: 'Estimated Medical Enrolled EEs',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter estimated number'
                        },
                        {
                            id: 'expectedHeadcountGrowth',
                            label: 'Expected Headcount Growth (next 12 months)',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter expected growth'
                        }
                    ]
                },
                {
                    id: 'benefits-overview',
                    title: 'Benefits Overview',
                    questions: [
                        {
                            id: 'offeredBenefits',
                            label: 'Which of the following benefits do you offer at this time?',
                            type: 'checkbox',
                            required: true,
                            options: [
                                { value: 'medical', label: 'Medical' },
                                { value: 'dental', label: 'Dental' },
                                { value: 'vision', label: 'Vision' },
                                { value: '401k', label: '401(k)' },
                                { value: 'life', label: 'Life' },
                                { value: 'disability', label: 'Disability' },
                                { value: 'other', label: 'Other' }
                            ],
                            validation: [{ type: 'required', message: 'Please select at least one benefit' }]
                        },
                        {
                            id: 'medicalOfferingType',
                            label: 'How do you currently offer medical benefits?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'fully_insured', label: 'Fully Insured' },
                                { value: 'level_funded', label: 'Level Funded' },
                                { value: 'self_funded', label: 'Self-Funded' },
                                { value: 'ichra_qsehra', label: 'ICHRA/QSEHRA' },
                                { value: 'taxable_stipend', label: 'Taxable Stipend' },
                                { value: 'fully_insured_peo', label: 'Fully Insured (PEO)' },
                                { value: 'other', label: 'Other' }
                            ]
                        },
                        {
                            id: 'medicalContributionStrategy',
                            label: 'What is the medical contribution strategy?',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: 'flat_dollar_employer', label: 'Flat Dollar Employer Contribution' },
                                { value: 'percentage_employer', label: 'Percentage Employer Contribution' },
                                { value: 'tiered_contribution', label: 'Tiered Contribution' },
                                { value: 'employee_pays_all', label: 'Employee Pays All' },
                                { value: 'other', label: 'Other' }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'upload-documents',
            name: 'Upload Documents',
            sections: [
                {
                    id: 'documents',
                    title: 'Upload Required Documents',
                    description: 'Please upload the following documents if available',
                    questions: [
                        {
                            id: 'benefitGuide',
                            label: 'Benefit Guide',
                            type: 'file',
                            required: false,
                            placeholder: 'Upload Benefit Guide',
                            helperText: 'If available',
                            accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png'
                        },
                        {
                            id: 'sbcPlanSummaries',
                            label: 'SBC/Plan Summaries',
                            type: 'file',
                            required: false,
                            placeholder: 'Upload SBC/Plan Summaries',
                            helperText: 'If available',
                            accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png'
                        },
                        {
                            id: 'census',
                            label: 'Employee Census',
                            type: 'file',
                            required: false,
                            placeholder: 'Upload Employee Census',
                            helperText: 'If available',
                            accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png'
                        },
                        {
                            id: 'otherDocuments',
                            label: 'Other Documents',
                            type: 'file',
                            required: false,
                            placeholder: 'Upload other documents',
                            helperText: 'Optional - You can upload multiple files',
                            accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png',
                            multiple: true
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
                    description: 'Please review all the information you have provided before submitting',
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
                        },
                        {
                            id: 'additionalNotes',
                            label: 'Additional Notes or Comments',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information you would like to provide'
                        }
                    ]
                }
            ]
        }
    ]
};
