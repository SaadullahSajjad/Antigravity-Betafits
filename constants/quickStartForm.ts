import { FormDataDefinition } from '@/types/form';

export const QUICK_START_FORM_DATA: FormDataDefinition = {
    id: 'quick-start',
    title: 'Quick Start Onboarding',
    pages: [
        {
            id: 'company-info',
            name: 'Company Information',
            sections: [
                {
                    id: 'basic-details',
                    title: 'Basic Details',
                    description: 'Tell us a bit about your organization.',
                    questions: [
                        {
                            id: 'companyName',
                            label: 'Company Name',
                            type: 'text',
                            placeholder: 'Acme Corp',
                            required: true,
                            validation: [{ type: 'required', message: 'Company name is required' }]
                        },
                        {
                            id: 'industry',
                            label: 'Industry',
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'tech', label: 'Technology' },
                                { value: 'healthcare', label: 'Healthcare' },
                                { value: 'finance', label: 'Finance' },
                                { value: 'retail', label: 'Retail' },
                                { value: 'other', label: 'Other' }
                            ]
                        },
                        {
                            id: 'employeeCount',
                            label: 'Number of Employees',
                            type: 'number',
                            required: true,
                            validation: [{ type: 'min', value: 1, message: 'Must have at least 1 employee' }]
                        }
                    ]
                },
                {
                    id: 'location',
                    title: 'Primary Location',
                    questions: [
                        {
                            id: 'address',
                            label: 'Street Address',
                            type: 'text',
                            required: true
                        },
                        {
                            id: 'city',
                            label: 'City',
                            type: 'text',
                            required: true
                        },
                        {
                            id: 'state',
                            label: 'State',
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'NY', label: 'New York' },
                                { value: 'CA', label: 'California' },
                                { value: 'TX', label: 'Texas' },
                                { value: 'FL', label: 'Florida' }
                                // Add more as needed
                            ]
                        },
                        {
                            id: 'zipCode',
                            label: 'Zip Code',
                            type: 'text',
                            required: true,
                            validation: [{ type: 'pattern', value: '^\\d{5}$', message: 'Invalid Zip Code' }]
                        }
                    ]
                }
            ]
        },
        {
            id: 'benefits-goals',
            name: 'Benefits Goals',
            sections: [
                {
                    id: 'goals',
                    title: 'What matters most?',
                    description: 'Select your top priorities for your benefits package.',
                    questions: [
                        {
                            id: 'primaryGoal',
                            label: 'Primary Goal',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'cost', label: 'Reducing Cost' },
                                { value: 'retention', label: 'Talent Retention' },
                                { value: 'compliance', label: 'Compliance & Risk' },
                                { value: 'wellness', label: 'Employee Wellness' }
                            ]
                        },
                        {
                            id: 'budgetPerEmployee',
                            label: 'Target Monthly Budget (Per Employee)',
                            type: 'number',
                            placeholder: 'e.g. 500',
                            validation: [{ type: 'min', value: 0, message: 'Budget cannot be negative' }]
                        }
                    ]
                }
            ]
        },
        {
            id: 'census',
            name: 'Employee Census',
            sections: [
                {
                    id: 'census-upload',
                    title: 'Upload Census',
                    description: 'If you have an employee census file, please upload it later in the Documents section.',
                    questions: [
                        {
                            id: 'hasCensus',
                            label: 'Do you have a census ready?',
                            type: 'radio',
                            options: [
                                { value: 'yes', label: 'Yes, I will upload it' },
                                { value: 'no', label: 'No, I need a template' }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
