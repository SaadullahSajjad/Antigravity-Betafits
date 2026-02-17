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
                    id: 'contact-info',
                    title: 'Contact Information',
                    questions: [
                        {
                            id: 'firstName',
                            label: 'First Name',
                            type: 'text',
                            placeholder: 'Enter your first name',
                            required: true,
                            validation: [{ type: 'required', message: 'First Name is required' }]
                        },
                        {
                            id: 'lastName',
                            label: 'Last Name',
                            type: 'text',
                            placeholder: 'Enter your last name',
                            required: true,
                            validation: [{ type: 'required', message: 'Last Name is required' }]
                        },
                        {
                            id: 'email',
                            label: 'Email',
                            type: 'email',
                            placeholder: 'Enter your email address',
                            required: true,
                            validation: [
                                { type: 'required', message: 'Email is required' },
                                { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Please enter a valid email address' }
                            ]
                        },
                        {
                            id: 'phone',
                            label: 'Phone',
                            type: 'text',
                            placeholder: 'Enter your phone number',
                            required: true,
                            validation: [{ type: 'required', message: 'Phone is required' }]
                        }
                    ]
                },
                {
                    id: 'company-details',
                    title: 'Company Details',
                    questions: [
                        {
                            id: 'companyName',
                            label: 'Company Name',
                            type: 'text',
                            placeholder: 'Enter your company name',
                            required: true,
                            validation: [{ type: 'required', message: 'Company Name is required' }]
                        },
                        {
                            id: 'employeeCount',
                            label: 'Number of Employees',
                            type: 'number',
                            placeholder: 'Enter number of employees',
                            required: false
                        }
                    ]
                },
                {
                    id: 'location',
                    title: 'Primary Location',
                    isCollapsible: true,
                    defaultCollapsed: false,
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
