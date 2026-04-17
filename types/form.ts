export interface FormValues {
    [key: string]: any;
}

export interface ValidationRule {
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
    value?: any;
    message: string;
}

export interface MatrixRow {
    id: string;
    label: string;
}

export interface Question {
    id: string;
    label: string;
    type:
        | 'text'
        | 'number'
        | 'email'
        | 'select'
        | 'radio'
        | 'checkbox'
        | 'date'
        | 'textarea'
        | 'file'
        | 'matrix';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: ValidationRule[];
    helperText?: string;
    accept?: string; // For file inputs: e.g., ".pdf,.doc,.docx"
    multiple?: boolean; // For file inputs: allow multiple files
    /**
     * For `matrix` questions only: one sub-question per row, each answered on
     * the same shared option scale (the `options` array above). The runtime
     * stores each row's selection under a flat key of `${id}__${row.id}` in
     * the form values object, so the downstream submit/Airtable pipeline keeps
     * seeing one entry per sub-question just like before.
     */
    rows?: MatrixRow[];
}

export interface FormSectionData {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
    isCollapsible?: boolean;
    defaultCollapsed?: boolean;
}

export interface FormPageData {
    id: string;
    name: string;
    sections: FormSectionData[];
}

export interface FormDataDefinition {
    id: string;
    title: string;
    pages: FormPageData[];
}
