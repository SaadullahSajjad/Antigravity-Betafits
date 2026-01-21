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
    type: 'text' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'date' | 'textarea';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: ValidationRule[];
    helperText?: string;
}

export interface FormSectionData {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
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
