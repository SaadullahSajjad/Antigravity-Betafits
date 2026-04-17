import { FormDataDefinition } from '@/types/form';

/**
 * Document Upload Sub Form
 * Template ID: aTDkqH7zTmus
 * URL: https://betafits.fillout.com/t/aTDkqH7zTmus
 *
 * Auto-generated from Fillout form structure.
 * Last updated: 2026-04-17T15:25:29.527Z
 */
export const FORM_DATA: FormDataDefinition = {
    id: "aTDkqH7zTmus",
    title: "Document Upload Sub Form",
    pages: [
        {
            id: "main",
            name: "Document Upload Sub Form",
            sections: [
                {
                    id: "main",
                    title: "Document Upload Sub Form",
                    questions: [
                        {
                            id: "jFiU",
                            label: "Document Type",
                            type: "select",
                            required: false,
                            options: [
                                { value: "Benefit Guide", label: "Benefit Guide" },
                                { value: "ERISA Wrap Document", label: "ERISA Wrap Document" },
                                { value: "Section 125 Document", label: "Section 125 Document" },
                                { value: "Broker Commission Disclosure", label: "Broker Commission Disclosure" },
                                { value: "W9", label: "W9" },
                                { value: "Quarterly Payroll Filing", label: "Quarterly Payroll Filing" },
                                { value: "Voided Check", label: "Voided Check" },
                                { value: "Census Files", label: "Census Files" },
                                { value: "Payroll Deductions", label: "Payroll Deductions" },
                                { value: "Renewal", label: "Renewal" },
                                { value: "Medical SBC", label: "Medical SBC" },
                                { value: "Dental Plan Summary", label: "Dental Plan Summary" },
                                { value: "Vision Plan Summary", label: "Vision Plan Summary" },
                                { value: "Medical Invoice", label: "Medical Invoice" },
                                { value: "Workbook", label: "Workbook" },
                                { value: "Workers Compensation", label: "Workers Compensation" },
                                { value: "Claims Report", label: "Claims Report" },
                                { value: "Dental & Vision Invoice", label: "Dental & Vision Invoice" },
                                { value: "Dental Invoice", label: "Dental Invoice" },
                                { value: "Vision Invoice", label: "Vision Invoice" },
                                { value: "M/D/V Invoice", label: "M/D/V Invoice" },
                                { value: "Invoice", label: "Invoice" },
                            ],
                        },
                        {
                            id: "kZ8Y",
                            label: "To make sure everything is processed correctly, please upload one document at a time.   You can submit additional documents right after",
                            type: "file",
                            required: false,
                        },
                        {
                            id: "mG7t",
                            label: "Groupkey",
                            type: "text",
                            required: false,
                        },
                    ],
                }
            ],
        }
    ],
};
