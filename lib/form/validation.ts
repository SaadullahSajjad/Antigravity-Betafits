import type { FormPageData, FormValues, Question } from '@/types/form';

/**
 * Return true when the question is empty / unanswered given the current form
 * values. Handles the tricky cases the naive `!values[id]` check misses:
 *
 *   - Empty-string, null, undefined        → empty
 *   - Checkbox arrays with zero elements    → empty (an empty array is truthy!)
 *   - Matrix questions where any row is blank → empty (values keyed by row.id)
 *   - Files: a File object / non-empty array of Files is treated as answered
 */
export function isAnswerEmpty(question: Question, values: FormValues): boolean {
    if (question.type === 'matrix') {
        // Each matrix row must have its own answer, keyed by the Fillout row id
        // (same id the REST API / Airtable mapping use).
        if (!question.rows || question.rows.length === 0) return false;
        return question.rows.some((row) => {
            const v = values[row.id];
            return v === undefined || v === null || v === '';
        });
    }

    const v = values[question.id];
    if (v === undefined || v === null) return true;
    if (typeof v === 'string') return v.trim().length === 0;
    if (Array.isArray(v)) return v.length === 0;
    if (v instanceof File) return false;
    if (typeof v === 'object' && v !== null) {
        // Generic object (e.g., nested structured answer) — count as answered
        // when it has any keys with a non-empty value.
        return Object.keys(v as Record<string, unknown>).length === 0;
    }
    // Numbers, booleans, etc. are considered answered once set.
    return false;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validate a single wizard page against its current values. Returns an
 * `{ [questionId]: errorMessage }` map. An empty map means the page is valid.
 *
 * Checks, in order:
 *   - required: the question is flagged required and currently empty
 *     (handles text / select / radio / checkbox arrays / matrix rows / files)
 *   - file size: any File larger than 10 MB is rejected
 *   - number: negative values are rejected, and any `min` validation rule fires
 *
 * For matrix questions the error is pinned to the matrix question's own id so
 * the form can surface a single "Please answer every row" message near the
 * matrix header.
 */
export function validatePageValues(page: FormPageData, values: FormValues): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const section of page.sections) {
        for (const question of section.questions) {
            const value = values[question.id];

            if (question.required && isAnswerEmpty(question, values)) {
                errors[question.id] =
                    question.validation?.[0]?.message ||
                    (question.type === 'matrix'
                        ? 'Please answer every row'
                        : question.type === 'file'
                          ? 'Please upload a file'
                          : 'This field is required');
                continue;
            }

            if (question.type === 'file' && value) {
                if (value instanceof File && value.size > MAX_FILE_SIZE_BYTES) {
                    errors[question.id] = 'File size must be less than 10 MB';
                } else if (Array.isArray(value)) {
                    for (const file of value) {
                        if (file instanceof File && file.size > MAX_FILE_SIZE_BYTES) {
                            errors[question.id] = 'One or more files exceed the 10 MB limit';
                            break;
                        }
                    }
                }
                continue;
            }

            if (
                question.type === 'number' &&
                value !== undefined &&
                value !== null &&
                value !== ''
            ) {
                const num = parseFloat(String(value));
                if (!isNaN(num) && num < 0) {
                    errors[question.id] = 'Value cannot be negative';
                    continue;
                }
                const minRule = question.validation?.find((v) => v.type === 'min');
                if (minRule && !isNaN(num) && num < Number(minRule.value)) {
                    errors[question.id] = minRule.message;
                }
            }
        }
    }
    return errors;
}
