/**
 * Fetch exact form structure (fields) from Fillout for one or more forms.
 *
 * Uses Fillout REST API: GET /v1/api/forms/{formId}
 * https://www.fillout.com/help/api-reference/get-form-metadata
 *
 * Usage:
 *   npx tsx scripts/fetch-fillout-form-structure.ts <formId1> [formId2] [formId3] ...
 *   npx tsx scripts/fetch-fillout-form-structure.ts --from-airtable   # use Fillout IDs from Available Forms (Airtable)
 *   npx tsx scripts/fetch-fillout-form-structure.ts --json <formId1> [formId2] ...   # only write JSON
 *
 * Example (single):
 *   npx tsx scripts/fetch-fillout-form-structure.ts eBxXtLZdK4us
 *
 * Example (multiple):
 *   npx tsx scripts/fetch-fillout-form-structure.ts eBxXtLZdK4us recOE9pVakkobVzU7 recmb9idrhtgckvay
 *
 * Requires FILLOUT_API_KEY in .env.local. --from-airtable also needs AIRTABLE_API_KEY.
 */

import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config({ path: '.env.local' });

/** Fillout API: FormMetadata.questions[]. See Get Form Metadata docs. */
interface FilloutQuestion {
    id: string;
    name: string;
    type: string;
    options?: Array<{ id?: string; value: string; label: string }>;
}

/** Fillout API: Get Form Metadata response */
interface FilloutFormMetadata {
    id: string;
    name: string;
    questions: FilloutQuestion[];
    calculations?: unknown[];
    urlParameters?: unknown[];
    scheduling?: unknown[];
    payments?: unknown[];
    quiz?: unknown;
}

/** Internal: one form's parsed structure for codegen */
interface FilloutFormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
}

interface FilloutFormPage {
    id: string;
    name: string;
    sections: Array<{
        id: string;
        title: string;
        description?: string;
        fields: FilloutFormField[];
    }>;
}

interface FilloutFormStructure {
    templateId: string;
    title: string;
    pages: FilloutFormPage[];
}

const FILLOUT_API_BASE = 'https://api.fillout.com/v1/api';

/**
 * Fetch form metadata (exact fields) from Fillout API for a single form.
 * GET /forms/{formId} → FormMetadata with id, name, questions[]
 */
async function fetchFormMetadata(formId: string): Promise<FilloutFormMetadata | null> {
    const filloutApiKey = process.env.FILLOUT_API_KEY;
    if (!filloutApiKey) {
        console.error('FILLOUT_API_KEY not set in .env.local');
        return null;
    }

    const url = `${FILLOUT_API_BASE}/forms/${formId}`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${filloutApiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Fillout API ${response.status} for ${formId}: ${response.statusText}`);
            return null;
        }

        const data = (await response.json()) as FilloutFormMetadata;
        if (!data.id || !data.questions || !Array.isArray(data.questions)) {
            console.error(`Unexpected response shape for ${formId}`);
            return null;
        }
        return data;
    } catch (error) {
        console.error(`Error fetching ${formId}:`, error);
        return null;
    }
}

/**
 * Convert Fillout FormMetadata (flat questions) into our multi-page structure
 * for generateFormDefinition. Puts all questions in one page, one section.
 *
 * Note: Fillout's public API returns a flat question list (no page/section
 * breaks). For proper multi-page parity you'd need the unofficial published-form
 * JSON (see scripts/extract-fillout-advanced.js).
 */
function metadataToFormStructure(meta: FilloutFormMetadata): FilloutFormStructure {
    const fields: FilloutFormField[] = meta.questions
        .filter((q) => isInputType(q.type))
        .map((q) => {
            const reactType = mapFilloutTypeToReactType(q.type);
            const options = buildOptionsForQuestion(q);
            return {
                id: q.id,
                label: q.name,
                type: reactType,
                required: false,
                ...(options ? { options } : {}),
            };
        });

    return {
        templateId: meta.id,
        title: meta.name,
        pages: [
            {
                id: 'main',
                name: meta.name,
                sections: [
                    {
                        id: 'main',
                        title: meta.name,
                        fields,
                    },
                ],
            },
        ],
    };
}

/**
 * Build the options list the React renderer expects.
 * - For choice-based Fillout types (Dropdown, MultipleChoice, Checkboxes,
 *   MultiSelect) we pass through the API's options verbatim.
 * - For rating-scale types (OpinionScale, Slider, StarRating) the public API
 *   doesn't return option items, but our FormSection.tsx has a dedicated
 *   1–10 rating-button path that triggers when a radio has exactly 10 options
 *   labelled 1..10 — so synthesize those here.
 */
function buildOptionsForQuestion(
    q: FilloutQuestion,
): Array<{ value: string; label: string }> | undefined {
    if (Array.isArray(q.options) && q.options.length > 0) {
        return q.options.map((o) => ({ value: String(o.value), label: String(o.label) }));
    }
    if (q.type === 'OpinionScale' || q.type === 'Slider' || q.type === 'StarRating') {
        return Array.from({ length: 10 }, (_, i) => {
            const v = String(i + 1);
            return { value: v, label: v };
        });
    }
    return undefined;
}

/** Skip non-input widgets (e.g. Paragraph, Image, Button). */
function isInputType(filloutType: string): boolean {
    const skip = new Set([
        'Paragraph', 'Image', 'Button', 'Header', 'Divider', 'Video', 'Embed',
        'Calcom', 'Calendly', 'Captcha',
    ]);
    return !skip.has(filloutType);
}

/**
 * Map Fillout API question types to our form field types.
 * API uses e.g. ShortAnswer, LongAnswer, EmailInput, DatePicker, FileUpload.
 */
function mapFilloutTypeToReactType(filloutType: string): string {
    const typeMap: Record<string, string> = {
        ShortAnswer: 'text',
        LongAnswer: 'textarea',
        EmailInput: 'email',
        PhoneNumber: 'text',
        NumberInput: 'number',
        CurrencyInput: 'number',
        DatePicker: 'date',
        DateRange: 'text',
        DateTimePicker: 'text',
        TimePicker: 'text',
        Dropdown: 'select',
        MultipleChoice: 'radio',
        MultiSelect: 'checkbox',
        Checkbox: 'checkbox',
        Checkboxes: 'checkbox',
        FileUpload: 'file',
        URLInput: 'text',
        Address: 'text',
        Signature: 'text',
        Slider: 'radio',
        StarRating: 'radio',
        OpinionScale: 'radio',
        Switch: 'checkbox',
        Table: 'text',
        RecordPicker: 'text',
        SubmissionPicker: 'text',
        Subform: 'text',
        Payment: 'text',
        Password: 'text',
        ColorPicker: 'text',
        ImagePicker: 'file',
        LocationCoordinates: 'text',
        Ranking: 'text',
        Matrix: 'text',
        AudioRecording: 'file',
    };
    return typeMap[filloutType] ?? 'text';
}

/** Legacy: single-form fetch that returns our internal structure (for backward compat). */
async function fetchFromFilloutAPI(templateId: string): Promise<FilloutFormStructure | null> {
    const meta = await fetchFormMetadata(templateId);
    if (!meta) return null;
    return metadataToFormStructure(meta);
}

/**
 * Alternative: Fetch by analyzing the form HTML/JavaScript (fallback when API not available).
 */
async function fetchFromFormURL(templateId: string): Promise<FilloutFormStructure | null> {
    console.log(`\n📋 Form URL: https://betafits.fillout.com/t/${templateId}`);
    console.log('   Use FILLOUT_API_KEY in .env.local to fetch via API.\n');
    return null;
}

/**
 * Generate form definition file from structure
 */
function generateFormDefinition(structure: FilloutFormStructure): string {
    const { templateId, title, pages } = structure;
    const s = (v: string) => JSON.stringify(v);

    let output = `import { FormDataDefinition } from '@/types/form';

/**
 * ${title.replace(/\*\//g, '*\\/')}
 * Template ID: ${templateId}
 * URL: https://betafits.fillout.com/t/${templateId}
 *
 * Auto-generated from Fillout form structure.
 * Last updated: ${new Date().toISOString()}
 */
export const FORM_DATA: FormDataDefinition = {
    id: ${s(templateId)},
    title: ${s(title)},
    pages: [`;

    pages.forEach((page, pageIndex) => {
        output += `
        {
            id: ${s(page.id)},
            name: ${s(page.name)},
            sections: [`;

        page.sections.forEach((section, sectionIndex) => {
            output += `
                {
                    id: ${s(section.id)},
                    title: ${s(section.title)},`;

            if (section.description) {
                output += `
                    description: ${s(section.description)},`;
            }

            output += `
                    questions: [`;

            section.fields.forEach((field) => {
                output += `
                        {
                            id: ${s(field.id)},
                            label: ${s(field.label)},
                            type: ${s(field.type)},
                            required: ${field.required},`;

                if (field.placeholder) {
                    output += `
                            placeholder: ${s(field.placeholder)},`;
                }

                if (field.options && field.options.length > 0) {
                    output += `
                            options: [`;
                    field.options.forEach((opt) => {
                        output += `
                                { value: ${s(opt.value)}, label: ${s(opt.label)} },`;
                    });
                    output += `
                            ],`;
                }

                if (field.required) {
                    output += `
                            validation: [{ type: 'required', message: ${s(`${field.label} is required`)} }],`;
                }

                output += `
                        },`;
            });

            output += `
                    ],
                }${sectionIndex < page.sections.length - 1 ? ',' : ''}`;
        });

        output += `
            ],
        }${pageIndex < pages.length - 1 ? ',' : ''}`;
    });

    output += `
    ],
};
`;

    return output;
}

/**
 * Main: fetch exact fields for one or more forms.
 * With --from-airtable and no FILLOUT_API_KEY: fetches form list and all Airtable fields only (no Fillout API).
 */
async function main() {
    const argv = process.argv.slice(2);
    const jsonOnly = argv[0] === '--json';
    const rawArgs = jsonOnly ? argv.slice(1) : argv;
    const fromAirtable = rawArgs[0] === '--from-airtable';
    const hasFilloutKey = Boolean(process.env.FILLOUT_API_KEY);

    // ---- Airtable-only path: no Fillout API key, just fetch from Airtable ----
    if (fromAirtable && !hasFilloutKey) {
        try {
            const { getAvailableFormsWithAllFields } = await import('../lib/airtable/getFilloutFormIds');
            const forms = await getAvailableFormsWithAllFields();
            if (forms.length === 0) {
                console.warn('⚠️  No records in Available Forms table.');
                process.exit(1);
            }
            console.log(`\n🔍 Fetched ${forms.length} form(s) from Airtable (Available Forms). No Fillout API key — using Airtable fields only.\n`);
            for (const form of forms) {
                const name = String((form.fields as Record<string, unknown>)['Name'] ?? 'Unknown');
                const fieldCount = Object.keys(form.fields).length;
                console.log(`✅ ${form.id}: "${name}" — ${fieldCount} Airtable fields`);
            }
            const outDir = path.join(process.cwd(), 'scripts', 'fillout-fields');
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            const jsonPath = path.join(outDir, `forms-from-airtable-${Date.now()}.json`);
            const output = forms.reduce<Record<string, { id: string; name: string; fields: Record<string, unknown> }>>((acc, form) => {
                const fields = form.fields as Record<string, unknown>;
                acc[form.id] = {
                    id: form.id,
                    name: String(fields['Name'] ?? 'Unknown'),
                    fields,
                };
                return acc;
            }, {});
            fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
            console.log(`\n📄 Exact fields (from Airtable) written to: ${jsonPath}`);

            // Sync Airtable metadata (id, title, description) into constants so React forms are updated
            try {
                const { execSync } = await import('child_process');
                console.log('\n🔄 Syncing form constants (id, title, description) from Airtable...');
                execSync('npx tsx scripts/sync-forms-from-airtable.ts', {
                    cwd: process.cwd(),
                    stdio: 'inherit',
                });
            } catch (syncErr) {
                console.warn('⚠️  Sync step failed (constants may be unchanged):', syncErr);
            }
            console.log('\n✨ Done!');
            return;
        } catch (err) {
            console.error('❌ Failed to fetch from Airtable:', err);
            process.exit(1);
        }
    }

    // ---- Fillout API path: need form IDs and FILLOUT_API_KEY ----
    let formIds: string[];
    if (fromAirtable) {
        try {
            const { getFilloutTemplateIdsOnly } = await import('../lib/airtable/getFilloutFormIds');
            formIds = await getFilloutTemplateIdsOnly();
            if (formIds.length === 0) {
                console.warn('⚠️  No Fillout template IDs in Available Forms (no fillout.com/t/ URLs). Use --from-airtable without FILLOUT_API_KEY to fetch Airtable fields only.');
                process.exit(1);
            }
        } catch (err) {
            console.error('❌ Failed to fetch form IDs from Airtable:', err);
            process.exit(1);
        }
    } else {
        formIds = rawArgs.filter((a) => a !== '--from-airtable');
    }

    if (formIds.length === 0) {
        console.error('❌ At least one form ID is required, or use --from-airtable');
        console.log('\nUsage:');
        console.log('  npx tsx scripts/fetch-fillout-form-structure.ts --from-airtable   # Airtable only (no Fillout API key needed)');
        console.log('  npx tsx scripts/fetch-fillout-form-structure.ts <formId1> [formId2] ...   # needs FILLOUT_API_KEY');
        process.exit(1);
    }

    if (!hasFilloutKey) {
        console.error('❌ FILLOUT_API_KEY not set. Use --from-airtable to fetch from Airtable only (no Fillout API).');
        process.exit(1);
    }

    if (fromAirtable) {
        console.log(`\n🔍 Fetched ${formIds.length} Fillout form ID(s) from Airtable.\n`);
    }
    console.log(`\n🔍 Fetching exact fields for ${formIds.length} form(s): ${formIds.join(', ')}\n`);

    const results: Record<string, FilloutFormMetadata> = {};
    const failed: string[] = [];

    for (const formId of formIds) {
        const meta = await fetchFormMetadata(formId);
        if (meta) {
            results[formId] = meta;
            const count = meta.questions.length;
            const inputCount = meta.questions.filter((q) => isInputType(q.type)).length;
            console.log(`✅ ${formId}: "${meta.name}" — ${count} questions (${inputCount} input fields)`);
        } else {
            failed.push(formId);
        }
    }

    if (failed.length > 0) {
        console.log(`\n⚠️  Failed: ${failed.join(', ')}`);
    }

    const outDir = path.join(process.cwd(), 'scripts', 'fillout-fields');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const jsonPath = path.join(outDir, `forms-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n📄 Exact fields (raw API response) written to: ${jsonPath}`);

    if (!jsonOnly) {
        for (const [formId, meta] of Object.entries(results)) {
            const structure = metadataToFormStructure(meta);
            const formDefinition = generateFormDefinition(structure);
            const outputFile = path.join(process.cwd(), 'constants', `form_${formId.toLowerCase()}.ts`);
            fs.writeFileSync(outputFile, formDefinition, 'utf-8');
            console.log(`   Generated: ${outputFile}`);
        }
    }

    console.log('\n✨ Done!');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

export {
    fetchFormMetadata,
    fetchFromFilloutAPI,
    fetchFromFormURL,
    generateFormDefinition,
    metadataToFormStructure,
    mapFilloutTypeToReactType,
};
export type { FilloutFormMetadata, FilloutQuestion, FilloutFormStructure };
