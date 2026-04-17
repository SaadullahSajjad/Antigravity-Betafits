import { FormDataDefinition } from '@/types/form';

/**
 * PEO / EOR Assessment
 * Template ID: cqBbC1vEUcus
 * URL: https://betafits.fillout.com/t/cqBbC1vEUcus
 *
 * Auto-generated from Fillout form structure.
 * Last updated: 2026-04-17T15:25:29.508Z
 */
export const FORM_DATA: FormDataDefinition = {
    id: "cqBbC1vEUcus",
    title: "PEO / EOR Assessment",
    pages: [
        {
            id: "main",
            name: "PEO / EOR Assessment",
            sections: [
                {
                    id: "main",
                    title: "PEO / EOR Assessment",
                    questions: [
                        {
                            id: "e29p",
                            label: "Do you currently use a PEO?",
                            type: "radio",
                            required: false,
                            options: [
                                { value: "Yes", label: "Yes" },
                                { value: "No, we have never considered a PEO", label: "No, we have never considered a PEO" },
                                { value: "No, we have considered but decided against", label: "No, we have considered but decided against" },
                            ],
                        },
                        {
                            id: "tY3h",
                            label: "What were the main reasons you decided not to use a PEO?",
                            type: "checkbox",
                            required: false,
                            options: [
                                { value: "Cost (too expensive)", label: "Cost (too expensive)" },
                                { value: "Complexity (too many layers/processes)", label: "Complexity (too many layers/processes)" },
                                { value: " Lack of clear value", label: " Lack of clear value" },
                                { value: "Prefer in-house management", label: "Prefer in-house management" },
                            ],
                        },
                        {
                            id: "w4Xq",
                            label: "Which PEO do you use?",
                            type: "radio",
                            required: false,
                            options: [
                                { value: "Justworks", label: "Justworks" },
                                { value: "ADP TotalSource", label: "ADP TotalSource" },
                                { value: "TriNet", label: "TriNet" },
                                { value: "Insperity", label: "Insperity" },
                                { value: "Sequoia One", label: "Sequoia One" },
                                { value: "Paychex", label: "Paychex" },
                                { value: "Rippling", label: "Rippling" },
                                { value: "PEO Spectrum", label: "PEO Spectrum" },
                            ],
                        },
                        {
                            id: "pt6E",
                            label: "Would you be open to switching to another PEO or to a payroll-only solution?",
                            type: "radio",
                            required: false,
                            options: [
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                                { value: "Not sure", label: "Not sure" },
                            ],
                        },
                        {
                            id: "bjGS",
                            label: "Which PEOs have you evaluated?",
                            type: "checkbox",
                            required: false,
                            options: [
                                { value: "Justworks", label: "Justworks" },
                                { value: "ADP TotalSource", label: "ADP TotalSource" },
                                { value: "TriNet", label: "TriNet" },
                                { value: "Insperity", label: "Insperity" },
                                { value: "Sequoia One", label: "Sequoia One" },
                                { value: "Paychex", label: "Paychex" },
                                { value: "Rippling", label: "Rippling" },
                            ],
                        },
                        {
                            id: "bPLT",
                            label: "What are your top considerations when exploring a PEO?",
                            type: "checkbox",
                            required: false,
                            options: [
                                { value: "Low Admin Fees", label: "Low Admin Fees" },
                                { value: "Benefits Costs", label: "Benefits Costs" },
                                { value: "Customer Support", label: "Customer Support" },
                                { value: "Ease of Administration", label: "Ease of Administration" },
                                { value: "Technology & Automation", label: "Technology & Automation" },
                                { value: "Multi-State Compliance", label: "Multi-State Compliance" },
                                { value: "International Support", label: "International Support" },
                            ],
                        },
                        {
                            id: "okAk",
                            label: "Do you currently use an EOR?",
                            type: "radio",
                            required: false,
                            options: [
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ],
                        },
                        {
                            id: "tyXd",
                            label: "EOR Vendors You’ve Used",
                            type: "checkbox",
                            required: false,
                            options: [
                                { value: "Deel", label: "Deel" },
                                { value: "Papaya", label: "Papaya" },
                                { value: "Remote", label: "Remote" },
                                { value: "Oyster", label: "Oyster" },
                                { value: "Global", label: "Global" },
                                { value: "Other", label: "Other" },
                            ],
                        },
                        {
                            id: "oswx",
                            label: "Specify other vendor(s)",
                            type: "text",
                            required: false,
                        },
                        {
                            id: "4UzM",
                            label: "EOR Countries & Workforce Details",
                            type: "text",
                            required: false,
                        },
                        {
                            id: "a5L8",
                            label: "Upload current PEO Invoice",
                            type: "file",
                            required: false,
                        },
                        {
                            id: "jZzH",
                            label: "Upload current EOR Invoice",
                            type: "file",
                            required: false,
                        },
                        {
                            id: "84QH",
                            label: "Other details you’d like us to know",
                            type: "textarea",
                            required: false,
                        },
                    ],
                }
            ],
        }
    ],
};
