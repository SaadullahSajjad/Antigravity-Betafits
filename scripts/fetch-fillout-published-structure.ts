/**
 * Fetch the PUBLISHED Fillout form structure (with pages & sections) and
 * regenerate constants/form_<id>.ts with a real multi-page wizard layout.
 *
 * Fillout's public REST API returns a flat question list (no page / section
 * breaks), so that endpoint alone can only render a single long page. This
 * script scrapes the published form HTML at
 *   https://betafits.fillout.com/t/<filloutId>
 * and pulls the full form template from the embedded <script id="__NEXT_DATA__">
 * JSON (props.pageProps.flowSnapshot.template). That template gives us:
 *
 *   template.steps      : map of stepId -> step (with type=form|cover|ending|…)
 *   template.firstStep  : the starting step id
 *   template.settings.progressBar.stages : ordered stage labels, used as a
 *                                          best-effort step ordering hint
 *
 * Each form-type step has `template.widgets`: a map of widgetId -> widget
 * with `type`, `position.row/column`, and `template.label.logic.value`.
 * `SectionCollapse` / `SectionHeader` widgets act as section dividers within
 * a page; everything else is a question widget we render.
 *
 * Usage:
 *   npx tsx scripts/fetch-fillout-published-structure.ts --from-airtable
 *   npx tsx scripts/fetch-fillout-published-structure.ts <filloutId1> [filloutId2] ...
 *
 * Writes:
 *   - constants/form_<filloutId>.ts             (multi-page form definition)
 *   - scripts/fillout-fields/published-<formId>-next-data.json (raw snapshot)
 */

import * as fs from 'fs';
import * as path from 'path';
import { mapFilloutTypeToReactType } from './fetch-fillout-form-structure';

require('dotenv').config({ path: '.env.local' });

const PUBLISHED_BASE = 'https://betafits.fillout.com/t';

// Widget types that are pure decoration and should be skipped entirely.
const DECORATION_TYPES = new Set<string>([
    'Divider',
    'Text', // free-text copy blocks Fillout places between real questions
    'ShortText', // static labels/paragraphs on some forms
    'LongText',
    'Paragraph',
    'Image',
    'Video',
    'Embed',
    'Button',
    'Captcha',
    'Calcom',
    'Calendly',
    'Appointment',
    'Heading',
    'HTMLBlock',
]);

// Widget types that define section boundaries.
const SECTION_TYPES = new Set<string>(['SectionCollapse', 'SectionHeader']);

/**
 * A Fillout "logic-wrapped string" — values are stored as
 *   { logic: { value: <actual string>, references: {} }, ... }
 * on the form template. We normalise these via `logicValue()` below.
 */
type LogicString = { logic?: { value?: string | number | boolean } };
type LogicBool = { logic?: { value?: boolean } };

interface Widget {
    id: string;
    type: string;
    position?: { row?: number; column?: number };
    template?: {
        label?: LogicString;
        description?: LogicString;
        placeholder?: LogicString;
        // Multiple-choice / checkbox / dropdown widgets store their choices in
        // `options.staticOptions`, each with logic-wrapped `label` and `value`.
        options?: {
            staticOptions?: Array<{
                id?: string;
                label?: LogicString;
                value?: LogicString;
            }>;
        };
        // Matrix widgets use `rows` and `columns` at the template root instead
        // of `options.staticOptions`.
        rows?: Array<{ id?: string; label?: LogicString }>;
        columns?: Array<{ id?: string; label?: LogicString; value?: LogicString }>;
        required?: LogicBool | boolean;
        defaultOpen?: boolean;
        isDefaultOpen?: boolean;
        isCollapsable?: boolean;
    };
}

interface Step {
    id: string;
    name?: string;
    type: string;
    position?: unknown;
    nextStep?:
        | string
        | {
              isFinal?: boolean;
              branches?: unknown[];
              defaultNextStep?: string;
          };
    template?: {
        widgets?: Record<string, Widget>;
    };
}

interface Template {
    steps: Record<string, Step>;
    firstStep: string;
    settings?: {
        progressBar?: {
            stages?: Array<{ label?: { logic?: { value?: string } } }>;
        };
    };
}

interface FlowSnapshot {
    template: Template;
}

interface FormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
}

interface FormSection {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
}

interface FormPage {
    id: string;
    name: string;
    sections: FormSection[];
}

interface FormStructure {
    templateId: string;
    title: string;
    pages: FormPage[];
}

/** Strip HTML tags and decode a handful of entities so UI strings look clean. */
function stripHtml(html: string | undefined): string {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Unwrap Fillout's `{ logic: { value } }` wrapper into a plain string. */
function logicValue(v: LogicString | undefined): string {
    const raw = v?.logic?.value;
    if (raw === undefined || raw === null) return '';
    return typeof raw === 'string' ? raw : String(raw);
}

function widgetLabel(w: Widget): string {
    return stripHtml(logicValue(w.template?.label));
}

function widgetPlaceholder(w: Widget): string | undefined {
    const p = stripHtml(logicValue(w.template?.placeholder));
    return p || undefined;
}

function widgetRequired(w: Widget): boolean {
    const r = w.template?.required;
    if (typeof r === 'boolean') return r;
    if (r && typeof r === 'object') return Boolean((r as LogicBool).logic?.value);
    return false;
}

/**
 * Extract choice options for MultipleChoice / Checkboxes / Dropdown widgets.
 * Fillout stores them under `template.options.staticOptions`, where each entry
 * has a logic-wrapped `label` and `value` (the value usually duplicates the
 * label, but we preserve it when they differ).
 */
function widgetOptions(w: Widget): Array<{ value: string; label: string }> | undefined {
    const staticOptions = w.template?.options?.staticOptions;
    if (!staticOptions || !Array.isArray(staticOptions) || staticOptions.length === 0) return undefined;
    const out: Array<{ value: string; label: string }> = [];
    for (const o of staticOptions) {
        const label = stripHtml(logicValue(o.label));
        const value = stripHtml(logicValue(o.value)) || label;
        if (!label && !value) continue;
        out.push({ value: value || label, label: label || value });
    }
    return out.length > 0 ? out : undefined;
}

/** Pull Matrix column labels — used as the shared options for each row question. */
function matrixColumnOptions(w: Widget): Array<{ value: string; label: string }> | undefined {
    const cols = w.template?.columns;
    if (!cols || cols.length === 0) return undefined;
    const out: Array<{ value: string; label: string }> = [];
    for (const c of cols) {
        const label = stripHtml(logicValue(c.label));
        const value = stripHtml(logicValue(c.value)) || label;
        if (!label && !value) continue;
        out.push({ value: value || label, label: label || value });
    }
    return out.length > 0 ? out : undefined;
}

/** Pull Matrix row definitions (each becomes its own sub-question). */
function matrixRows(w: Widget): Array<{ id: string; label: string }> {
    const rows = w.template?.rows;
    if (!rows || rows.length === 0) return [];
    const out: Array<{ id: string; label: string }> = [];
    for (const r of rows) {
        const label = stripHtml(logicValue(r.label));
        if (!label) continue;
        out.push({ id: r.id || label, label });
    }
    return out;
}

/** Synthesize 1..10 options for rating-scale types (matches FormSection renderer). */
function synthesizeRatingOptions(filloutType: string): Array<{ value: string; label: string }> | undefined {
    if (filloutType === 'OpinionScale' || filloutType === 'Slider' || filloutType === 'StarRating') {
        return Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
    }
    return undefined;
}

/**
 * Given the full template, return form-type steps in intended display order.
 * Ordering signals, in priority: firstStep → linear `defaultNextStep` walk →
 * progressBar.stages name-matching → `Page N` numeric sort → insertion order.
 */
function orderFormSteps(tpl: Template): Step[] {
    const allSteps = Object.values(tpl.steps);
    const formSteps = allSteps.filter((s) => s.type === 'form');
    if (formSteps.length === 0) return [];

    const byId = new Map(formSteps.map((s) => [s.id, s]));
    const ordered: Step[] = [];
    const seen = new Set<string>();

    // 1) Follow the nextStep chain starting from firstStep.
    let cur: string | undefined = tpl.firstStep;
    while (cur && byId.has(cur) && !seen.has(cur)) {
        const s = byId.get(cur)!;
        ordered.push(s);
        seen.add(cur);
        const nx = s.nextStep;
        if (!nx) break;
        if (typeof nx === 'string') {
            cur = nx;
        } else if (nx.defaultNextStep) {
            cur = nx.defaultNextStep;
        } else {
            cur = undefined;
        }
    }

    // Also include steps reachable from the Cover step (firstStep might be the cover).
    for (const s of allSteps) {
        if (s.type !== 'cover') continue;
        let nx: string | undefined;
        if (typeof s.nextStep === 'string') nx = s.nextStep;
        else if (s.nextStep?.defaultNextStep) nx = s.nextStep.defaultNextStep;
        while (nx && byId.has(nx) && !seen.has(nx)) {
            const step = byId.get(nx)!;
            ordered.push(step);
            seen.add(nx);
            const n = step.nextStep;
            if (!n) break;
            if (typeof n === 'string') nx = n;
            else if (n.defaultNextStep) nx = n.defaultNextStep;
            else nx = undefined;
        }
    }

    // 2) Append remaining form steps using progressBar / Page-N / insertion order.
    const remaining = formSteps.filter((s) => !seen.has(s.id));
    if (remaining.length === 0) return ordered;

    const stages = tpl.settings?.progressBar?.stages ?? [];
    const stageLabels = stages.map((s) => stripHtml(s.label?.logic?.value).toLowerCase());
    const pageNRegex = /^page\s*(\d+)\s*$/i;

    const allArePageN = remaining.every((s) => pageNRegex.test(s.name ?? ''));
    if (allArePageN) {
        remaining.sort((a, b) => {
            const ma = (a.name ?? '').match(pageNRegex);
            const mb = (b.name ?? '').match(pageNRegex);
            return Number(ma?.[1] ?? 0) - Number(mb?.[1] ?? 0);
        });
    } else if (stageLabels.length > 0) {
        remaining.sort((a, b) => {
            const ai = stageLabels.indexOf(String(a.name ?? '').toLowerCase());
            const bi = stageLabels.indexOf(String(b.name ?? '').toLowerCase());
            const aa = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
            const bb = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
            return aa - bb;
        });
    }
    ordered.push(...remaining);
    return ordered;
}

/** Sort widgets by their canvas row (then column) so the order matches Fillout. */
function orderedWidgets(step: Step): Widget[] {
    const widgets = step.template?.widgets;
    if (!widgets) return [];
    return Object.values(widgets).sort((a, b) => {
        const ar = a.position?.row ?? 0;
        const br = b.position?.row ?? 0;
        if (ar !== br) return ar - br;
        return (a.position?.column ?? 0) - (b.position?.column ?? 0);
    });
}

/**
 * Convert a single Fillout form-step into one-or-more wizard PAGES.
 *
 * Fillout represents logical chunks of a long step with `SectionCollapse`
 * widgets (rendered as collapsible section headings). We promote each of those
 * to its own wizard page so the UI feels like a proper multi-step wizard.
 *
 * Rules:
 *   - Widgets before the first SectionCollapse → a page named after the
 *     Fillout step (fallback: "Page N").
 *   - Each SectionCollapse/SectionHeader starts a NEW page, whose name is the
 *     section label. That page gets every subsequent question until the next
 *     section widget (or end of step).
 *   - Every emitted page has exactly one `FormSection` (title = page name) so
 *     the existing React renderer keeps working without changes.
 *   - Decorative widgets (Divider/Text/Image/Button/…) and widgets without a
 *     label are skipped silently.
 *   - Pages that would end up with zero fields are dropped (a standalone
 *     heading with no questions shouldn't produce an empty wizard step).
 */
function buildStepPages(step: Step, pageIndex: number, formId: string): FormPage[] {
    const widgets = orderedWidgets(step);
    const pages: FormPage[] = [];
    let current: FormPage | null = null;

    const startPage = (id: string, name: string, description?: string) => {
        current = {
            id,
            name,
            sections: [
                {
                    id: `${id}-s0`,
                    title: name,
                    ...(description ? { description } : {}),
                    fields: [],
                },
            ],
        };
    };

    const closePage = () => {
        if (current && current.sections[0].fields.length > 0) pages.push(current);
        current = null;
    };

    const defaultPageName = step.name || `Page ${pageIndex + 1}`;
    startPage(step.id, defaultPageName);

    let sectionCounter = 0;
    for (const w of widgets) {
        if (DECORATION_TYPES.has(w.type)) continue;

        if (SECTION_TYPES.has(w.type)) {
            // Close whatever was being built and start a fresh page for this section.
            closePage();
            sectionCounter += 1;
            const title = widgetLabel(w) || `Section ${sectionCounter}`;
            const desc = stripHtml(logicValue(w.template?.description)) || undefined;
            startPage(`${step.id}-s${sectionCounter}-${w.id}`, title, desc);
            continue;
        }

        const rawLabel = widgetLabel(w);
        // Widgets with no label are decorative/helper elements Fillout placed
        // on the canvas (e.g. an empty Text block). Skip so we don't surface
        // phantom "Question N" entries in the UI.
        if (!rawLabel) continue;

        // Matrix widgets represent a grid of (row × column) radio choices.
        // Fillout renders one rating control per row, sharing the same column
        // labels as options. We explode it into one radio question per row so
        // our existing FormSection renderer (which knows radio/select/etc.) can
        // still show every sub-question faithfully.
        if (w.type === 'Matrix') {
            const rows = matrixRows(w);
            const colOpts = matrixColumnOptions(w);
            if (rows.length > 0 && colOpts && colOpts.length > 0) {
                if (!current) startPage(step.id, defaultPageName);
                const required = widgetRequired(w);
                for (const row of rows) {
                    current!.sections[0].fields.push({
                        id: `${w.id}__${row.id}`,
                        label: `${rawLabel} — ${row.label}`,
                        type: 'radio',
                        required,
                        options: colOpts,
                    });
                }
                continue;
            }
            // Fallback if the Matrix is malformed — treat it as a free-text field.
        }

        const reactType = mapFilloutTypeToReactType(w.type);
        const opts = widgetOptions(w) || synthesizeRatingOptions(w.type);
        const field: FormField = {
            id: w.id,
            label: rawLabel,
            type: reactType,
            required: widgetRequired(w),
            ...(widgetPlaceholder(w) ? { placeholder: widgetPlaceholder(w)! } : {}),
            ...(opts ? { options: opts } : {}),
        };
        if (!current) startPage(step.id, defaultPageName);
        current!.sections[0].fields.push(field);
    }
    closePage();

    // Suppress unused warning: formId is kept in the signature to allow future
    // ID namespacing if two Fillout steps share a section-widget id.
    void formId;
    return pages;
}

function buildFormStructure(formId: string, snapshot: FlowSnapshot, formTitle: string): FormStructure {
    const tpl = snapshot.template;
    const steps = orderFormSteps(tpl);
    const pages: FormPage[] = [];
    steps.forEach((step, i) => {
        pages.push(...buildStepPages(step, i, formId));
    });
    // If after all splitting we ended up with zero pages (e.g., a form where
    // every widget was decorative), fall back to one empty page per Fillout
    // step so the renderer still has something valid to show.
    if (pages.length === 0) {
        steps.forEach((step, i) => {
            pages.push({
                id: step.id,
                name: step.name || `Page ${i + 1}`,
                sections: [{ id: `${step.id}-s0`, title: step.name || `Page ${i + 1}`, fields: [] }],
            });
        });
    }
    return { templateId: formId, title: formTitle || formId, pages };
}

function generateFormDefinitionWithPages(structure: FormStructure): string {
    const { templateId, title, pages } = structure;
    const s = (v: string) => JSON.stringify(v);
    let out = `import { FormDataDefinition } from '@/types/form';

/**
 * ${title.replace(/\*\//g, '*\\/')}
 * Fillout template ID: ${templateId}
 * Published URL: https://betafits.fillout.com/t/${templateId}
 *
 * AUTO-GENERATED by scripts/fetch-fillout-published-structure.ts on ${new Date().toISOString()}.
 * Do not edit by hand — regenerate instead so the multi-page wizard layout
 * stays in sync with Fillout.
 */
export const FORM_DATA: FormDataDefinition = {
    id: ${s(templateId)},
    title: ${s(title)},
    pages: [`;

    pages.forEach((page, pi) => {
        out += `
        {
            id: ${s(page.id)},
            name: ${s(page.name)},
            sections: [`;
        page.sections.forEach((section, si) => {
            out += `
                {
                    id: ${s(section.id)},
                    title: ${s(section.title)},`;
            if (section.description) {
                out += `
                    description: ${s(section.description)},`;
            }
            out += `
                    questions: [`;
            section.fields.forEach((f) => {
                out += `
                        {
                            id: ${s(f.id)},
                            label: ${s(f.label)},
                            type: ${s(f.type)},
                            required: ${f.required},`;
                if (f.placeholder) {
                    out += `
                            placeholder: ${s(f.placeholder)},`;
                }
                if (f.options && f.options.length > 0) {
                    out += `
                            options: [`;
                    for (const o of f.options) {
                        out += `
                                { value: ${s(o.value)}, label: ${s(o.label)} },`;
                    }
                    out += `
                            ],`;
                }
                if (f.required) {
                    out += `
                            validation: [{ type: 'required', message: ${s(`${f.label} is required`)} }],`;
                }
                out += `
                        },`;
            });
            out += `
                    ],
                }${si < page.sections.length - 1 ? ',' : ''}`;
        });
        out += `
            ],
        }${pi < pages.length - 1 ? ',' : ''}`;
    });
    out += `
    ],
};
`;
    return out;
}

async function fetchPublished(formId: string): Promise<{ snapshot: FlowSnapshot; title: string } | null> {
    const url = `${PUBLISHED_BASE}/${formId}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
        console.error(`  ✗ ${formId}: HTTP ${res.status}`);
        return null;
    }
    const html = await res.text();
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) {
        console.error(`  ✗ ${formId}: __NEXT_DATA__ not present`);
        return null;
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(m[1]);
    } catch (err) {
        console.error(`  ✗ ${formId}: failed to parse __NEXT_DATA__ (${(err as Error).message})`);
        return null;
    }
    const pp = (parsed as { props?: { pageProps?: { flowSnapshot?: FlowSnapshot; flow?: { name?: string } } } }).props
        ?.pageProps;
    if (!pp?.flowSnapshot?.template) {
        console.error(`  ✗ ${formId}: no flowSnapshot.template`);
        return null;
    }
    // Persist raw snapshot for debugging / future re-use.
    const outDir = path.join(process.cwd(), 'scripts', 'fillout-fields');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
        path.join(outDir, `published-${formId}-next-data.json`),
        JSON.stringify(parsed, null, 2),
    );
    return { snapshot: pp.flowSnapshot, title: pp.flow?.name || formId };
}

async function main() {
    const args = process.argv.slice(2);
    let ids: string[] = [];

    if (args[0] === '--from-airtable') {
        const { getFilloutTemplateIdsOnly } = await import('../lib/airtable/getFilloutFormIds');
        ids = await getFilloutTemplateIdsOnly();
    } else {
        ids = args.filter((a) => !a.startsWith('--'));
    }

    if (ids.length === 0) {
        console.error(
            'Usage:\n  npx tsx scripts/fetch-fillout-published-structure.ts --from-airtable\n  npx tsx scripts/fetch-fillout-published-structure.ts <filloutId1> [filloutId2] ...',
        );
        process.exit(1);
    }

    console.log(`Fetching ${ids.length} published form(s):`);
    const failed: string[] = [];
    const summary: Array<{ id: string; title: string; pages: number; fields: number }> = [];

    for (const id of ids) {
        const result = await fetchPublished(id);
        if (!result) {
            failed.push(id);
            continue;
        }
        const structure = buildFormStructure(id, result.snapshot, result.title);
        const code = generateFormDefinitionWithPages(structure);
        const outPath = path.join(process.cwd(), 'constants', `form_${id.toLowerCase()}.ts`);
        fs.writeFileSync(outPath, code, 'utf-8');
        const fieldCount = structure.pages.reduce(
            (a, p) => a + p.sections.reduce((aa, s) => aa + s.fields.length, 0),
            0,
        );
        summary.push({ id, title: structure.title, pages: structure.pages.length, fields: fieldCount });
        console.log(
            `  ✓ ${id.padEnd(16)} ${String(structure.title).slice(0, 40).padEnd(40)} pages=${String(structure.pages.length).padStart(2)}  fields=${String(fieldCount).padStart(3)}`,
        );
    }

    if (failed.length) {
        console.log(`\nFailed: ${failed.join(', ')}`);
    }
    console.log(
        `\nWrote ${summary.length} constants/form_<id>.ts file(s). Total pages: ${summary.reduce((a, s) => a + s.pages, 0)}, total fields: ${summary.reduce((a, s) => a + s.fields, 0)}.`,
    );
    console.log('\nNext:');
    console.log('  npx tsx scripts/build-fillout-airtable-mapping.ts   # refresh Airtable field mappings');
    console.log('  npx tsc --noEmit                                    # confirm type check');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
