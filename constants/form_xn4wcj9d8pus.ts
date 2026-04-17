import { FormDataDefinition } from '@/types/form';

/**
 * New Group Form
 * Template ID: xn4WCJ9D8pus
 * URL: https://betafits.fillout.com/t/xn4WCJ9D8pus
 *
 * Auto-generated from Fillout form structure.
 * Last updated: 2026-04-17T15:25:29.499Z
 */
export const FORM_DATA: FormDataDefinition = {
    id: "xn4WCJ9D8pus",
    title: "New Group Form",
    pages: [
        {
            id: "main",
            name: "New Group Form",
            sections: [
                {
                    id: "main",
                    title: "New Group Form",
                    questions: [
                        {
                            id: "vATB",
                            label: "Company Name",
                            type: "text",
                            required: false,
                        },
                        {
                            id: "2uHd",
                            label: "Link to Users",
                            type: "text",
                            required: false,
                        },
                        {
                            id: "jf4z",
                            label: "Link to Assigned Forms",
                            type: "text",
                            required: false,
                        },
                        {
                            id: "rT74",
                            label: "Document Type",
                            type: "select",
                            required: false,
                            options: [
                                { value: "Benefit Guide", label: "Benefit Guide" },
                                { value: "Census Files", label: "Census Files" },
                                { value: "Medical SBC", label: "Medical SBC" },
                                { value: "Dental Plan Summary", label: "Dental Plan Summary" },
                                { value: "Vision Plan Summary", label: "Vision Plan Summary" },
                                { value: "Invoice", label: "Invoice" },
                            ],
                        },
                        {
                            id: "vr6K",
                            label: "Upload New Group Document",
                            type: "file",
                            required: false,
                        },
                        {
                            id: "ewYV",
                            label: "Upload Group's Document",
                            type: "text",
                            required: false,
                        },
                    ],
                }
            ],
        }
    ],
};
