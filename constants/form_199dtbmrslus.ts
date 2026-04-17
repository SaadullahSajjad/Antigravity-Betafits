import { FormDataDefinition } from '@/types/form';

/**
 * Medical Coverage Survey Census Sub Form
 * Template ID: 199DTBMrsLus
 * URL: https://betafits.fillout.com/t/199DTBMrsLus
 *
 * Auto-generated from Fillout form structure.
 * Last updated: 2026-04-17T15:25:29.487Z
 */
export const FORM_DATA: FormDataDefinition = {
    id: "199DTBMrsLus",
    title: "Medical Coverage Survey Census Sub Form",
    pages: [
        {
            id: "main",
            name: "Medical Coverage Survey Census Sub Form",
            sections: [
                {
                    id: "main",
                    title: "Medical Coverage Survey Census Sub Form",
                    questions: [
                        {
                            id: "4yptyRTf1voVY7sdFoJxGv",
                            label: "First Name",
                            type: "text",
                            required: false,
                        },
                        {
                            id: "vkabBeFF6JFQzMgZ4GNPVy",
                            label: "Last Name",
                            type: "text",
                            required: false,
                        },
                        {
                            id: "qUc44oHzKFJSS5mxgHjNSL",
                            label: "Date of Birth",
                            type: "date",
                            required: false,
                        },
                        {
                            id: "vYP5rMTAgx4DPKvh4NMn9G",
                            label: "Relation",
                            type: "select",
                            required: false,
                            options: [
                                { value: "Employee", label: "Employee" },
                                { value: "Spouse", label: "Spouse" },
                                { value: "Dependent", label: "Dependent" },
                            ],
                        },
                        {
                            id: "qAuXdq5iYpxy1Bp9jMaDWm",
                            label: "Gender",
                            type: "radio",
                            required: false,
                            options: [
                                { value: "Male", label: "Male" },
                                { value: "Female", label: "Female" },
                                { value: "Prefer not to answer", label: "Prefer not to answer" },
                            ],
                        },
                    ],
                }
            ],
        }
    ],
};
