import { FormDataDefinition } from '@/types/form';

/**
 * Appoint Betafits Form
 * Form ID: recOE9pVakkobVzU7
 */
export const APPOINT_BETAFITS_FORM_DATA: FormDataDefinition = {
    id: 'recOE9pVakkobVzU7',
    title: 'Appoint Betafits',
    pages: [
        {
            id: 'appointment-info',
            name: 'Appointment Information',
            sections: [
                {
                    id: 'contact-info',
                    title: 'Contact Information',
                    description: 'Please provide your contact information to schedule an appointment',
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
                            id: 'email',
                            label: 'Email',
                            type: 'email',
                            required: true,
                            placeholder: 'Enter your email address',
                            validation: [{ type: 'required', message: 'Email is required' }]
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
                            id: 'preferredDate',
                            label: 'Preferred Appointment Date',
                            type: 'date',
                            required: false,
                            placeholder: 'Select preferred date'
                        },
                        {
                            id: 'preferredTime',
                            label: 'Preferred Time',
                            type: 'select',
                            required: false,
                            placeholder: 'Select preferred time',
                            options: [
                                { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
                                { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
                                { value: 'evening', label: 'Evening (5 PM - 8 PM)' }
                            ]
                        },
                        {
                            id: 'appointmentNotes',
                            label: 'Additional Notes',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional information for the appointment'
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
