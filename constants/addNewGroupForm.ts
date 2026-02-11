import { FormDataDefinition } from '@/types/form';

/**
 * Add New Group Form
 * Form ID: recFVcfdoXkUjIcod
 */
export const ADD_NEW_GROUP_FORM_DATA: FormDataDefinition = {
    id: 'recFVcfdoXkUjIcod',
    title: 'Add New Group',
    pages: [
        {
            id: 'group-info',
            name: 'Group Information',
            sections: [
                {
                    id: 'basic-info',
                    title: 'Basic Group Information',
                    description: 'Please provide information about the new group',
                    questions: [
                        {
                            id: 'groupName',
                            label: 'Group Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter group name',
                            validation: [{ type: 'required', message: 'Group name is required' }]
                        },
                        {
                            id: 'groupType',
                            label: 'Group Type',
                            type: 'select',
                            required: false,
                            placeholder: 'Select group type',
                            options: [
                                { value: 'corporate', label: 'Corporate' },
                                { value: 'non-profit', label: 'Non-Profit' },
                                { value: 'government', label: 'Government' },
                                { value: 'other', label: 'Other' }
                            ]
                        },
                        {
                            id: 'employeeCount',
                            label: 'Number of Employees',
                            type: 'number',
                            required: false,
                            placeholder: 'Enter number of employees',
                            validation: [{ type: 'min', value: 1, message: 'Must have at least 1 employee' }]
                        },
                        {
                            id: 'groupDescription',
                            label: 'Group Description',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Describe the group'
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
