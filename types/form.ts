export interface FormValues {
    [key: string]: any;
}

export interface ValidationRule {
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
    value?: any;
    message: string;
}

export interface Question {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'date' | 'textarea' | 'file';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: ValidationRule[];
    helperText?: string;
    accept?: string; // For file inputs: e.g., ".pdf,.doc,.docx"
    multiple?: boolean; // For file inputs: allow multiple files
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
