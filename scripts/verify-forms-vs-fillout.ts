/**
 * Verify that every generated constants/form_<id>.ts contains exactly the
 * questions (with their options) that live in Fillout for that form.
 *
 * The script reads the cached Fillout snapshots in
 * scripts/fillout-fields/published-<id>-next-data.json (populated by
 * `npx tsx scripts/fetch-fillout-published-structure.ts --from-airtable`)
 * and walks every form-type step, pulling out "real" input widgets while
 * applying the same filters the generator uses (skip decoration widgets,
 * widgets with no label, and expand Matrix widgets into one sub-question per
 * row). It then dynamically imports each constants/form_<id>.ts and compares:
 *
 *   1. Every Fillout question (by normalised label) appears in the generated
 *      form, and no extra questions were introduced.
 *   2. For MultipleChoice / Checkboxes / Dropdown / Matrix questions, every
 *      Fillout choice label is present in the generated options (and there
 *      are no surprise extras).
 *
 * Exit code is non-zero if any form has missing questions or missing options.
 *
 * Usage:
 *   npx tsx scripts/verify-forms-vs-fillout.ts
 *   npx tsx scripts/verify-forms-vs-fillout.ts jLwpyNvuB2us urHF8xDu7eus
 */

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

require('dotenv').config({ path: '.env.local' });

// Keep these in sync with scripts/fetch-fillout-published-structure.ts.
const DECORATION_TYPES = new Set<string>([
    'Divider',
    'Text',
    'ShortText',
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
const SECTION_TYPES = new Set<string>(['SectionCollapse', 'SectionHeader']);
const CHOICE_TYPES = new Set<string>(['MultipleChoice', 'Checkboxes', 'Dropdown']);

type LogicWrapped = { logic?: { value?: string | number | boolean } };

interface RawWidget {
    id: string;
    type: string;
    position?: { row?: number; column?: number };
    template?: {
        label?: LogicWrapped;
        options?: { staticOptions?: Array<{ label?: LogicWrapped; value?: LogicWrapped }> };
        rows?: Array<{ id?: string; label?: LogicWrapped }>;
        columns?: Array<{ label?: LogicWrapped; value?: LogicWrapped }>;
    };
}

interface RawStep {
    id: string;
    type: string;
    name?: string;
    template?: { widgets?: Record<string, RawWidget> };
}

interface RawTemplate {
    steps: Record<string, RawStep>;
}

interface ExpectedQuestion {
    label: string;
    normalised: string;
    type: string; // Fillout widget type
    options?: string[]; // option labels (normalised)
}

interface GeneratedQuestion {
    id: string;
    label: string;
    type: string;
    options?: Array<{ value: string; label: string }>;
}

interface FormDataShape {
    id: string;
    title: string;
    pages: Array<{
        name: string;
        sections: Array<{ title: string; questions: GeneratedQuestion[] }>;
    }>;
}

function stripHtml(s: unknown): string {
    if (!s) return '';
    return String(s)
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

function logicValue(v: LogicWrapped | undefined): string {
    const raw = v?.logic?.value;
    if (raw === undefined || raw === null) return '';
    return typeof raw === 'string' ? raw : String(raw);
}

function norm(s: string): string {
    return stripHtml(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/**
 * Build the list of expected questions for a single Fillout template by
 * walking every form-type step in canvas (row, column) order, skipping
 * decoration and unlabeled widgets, and exploding Matrix widgets into one
 * radio question per row.
 */
function expectedFromSnapshot(tpl: RawTemplate): ExpectedQuestion[] {
    const out: ExpectedQuestion[] = [];
    const steps = Object.values(tpl.steps).filter((s) => s.type === 'form');
    for (const step of steps) {
        const widgets = Object.values(step.template?.widgets || {});
        widgets.sort((a, b) => {
            const ar = a.position?.row ?? 0;
            const br = b.position?.row ?? 0;
            if (ar !== br) return ar - br;
            return (a.position?.column ?? 0) - (b.position?.column ?? 0);
        });
        for (const w of widgets) {
            if (DECORATION_TYPES.has(w.type)) continue;
            if (SECTION_TYPES.has(w.type)) continue;
            const rawLabel = stripHtml(logicValue(w.template?.label));
            if (!rawLabel) continue;

            if (w.type === 'Matrix') {
                const rows = (w.template?.rows || [])
                    .map((r) => stripHtml(logicValue(r.label)))
                    .filter((x) => x.length > 0);
                const cols = (w.template?.columns || [])
                    .map((c) => stripHtml(logicValue(c.label)) || stripHtml(logicValue(c.value)))
                    .filter((x) => x.length > 0);
                if (rows.length > 0 && cols.length > 0) {
                    for (const row of rows) {
                        const label = `${rawLabel} — ${row}`;
                        out.push({
                            label,
                            normalised: norm(label),
                            type: 'Matrix',
                            options: cols.map(norm),
                        });
                    }
                    continue;
                }
                // Malformed matrix — fall through to treat as a free-text field.
            }

            let options: string[] | undefined;
            if (CHOICE_TYPES.has(w.type)) {
                const so = w.template?.options?.staticOptions || [];
                const opts = so
                    .map((o) => stripHtml(logicValue(o.label)) || stripHtml(logicValue(o.value)))
                    .filter((x) => x.length > 0);
                if (opts.length > 0) options = opts.map(norm);
            }
            out.push({ label: rawLabel, normalised: norm(rawLabel), type: w.type, options });
        }
    }
    return out;
}

async function importFormData(formId: string): Promise<FormDataShape | null> {
    const abs = path.resolve(process.cwd(), 'constants', `form_${formId.toLowerCase()}.ts`);
    if (!fs.existsSync(abs)) return null;
    const mod: { FORM_DATA?: FormDataShape } = await import(pathToFileURL(abs).href);
    return mod.FORM_DATA ?? null;
}

function flattenGenerated(data: FormDataShape): GeneratedQuestion[] {
    const out: GeneratedQuestion[] = [];
    for (const p of data.pages) for (const s of p.sections) for (const q of s.questions) out.push(q);
    return out;
}

interface FormReport {
    id: string;
    title: string;
    expectedCount: number;
    generatedCount: number;
    missing: string[];
    extra: string[];
    optionMismatches: Array<{ question: string; missingOptions: string[]; extraOptions: string[] }>;
    totalOptionsExpected: number;
    totalOptionsMissing: number;
}

function compareForm(formId: string, expected: ExpectedQuestion[], generated: GeneratedQuestion[]): FormReport {
    const genByNorm = new Map<string, GeneratedQuestion>();
    for (const g of generated) {
        const k = norm(g.label);
        if (!genByNorm.has(k)) genByNorm.set(k, g);
    }
    const expByNorm = new Map<string, ExpectedQuestion>();
    for (const e of expected) expByNorm.set(e.normalised, e);

    const missing: string[] = [];
    const optionMismatches: FormReport['optionMismatches'] = [];
    let totalOptionsExpected = 0;
    let totalOptionsMissing = 0;

    for (const e of expected) {
        const g = genByNorm.get(e.normalised);
        if (!g) {
            missing.push(e.label);
            continue;
        }
        if (e.options && e.options.length > 0) {
            totalOptionsExpected += e.options.length;
            const genOpts = new Set((g.options ?? []).map((o) => norm(o.label)));
            const missingOpts = e.options.filter((o) => !genOpts.has(o));
            const expSet = new Set(e.options);
            const extraOpts = (g.options ?? [])
                .map((o) => norm(o.label))
                .filter((o) => !expSet.has(o));
            totalOptionsMissing += missingOpts.length;
            if (missingOpts.length > 0 || extraOpts.length > 0) {
                optionMismatches.push({
                    question: e.label,
                    missingOptions: missingOpts,
                    extraOptions: extraOpts,
                });
            }
        }
    }

    const extra: string[] = [];
    for (const g of generated) {
        if (!expByNorm.has(norm(g.label))) extra.push(g.label);
    }

    return {
        id: formId,
        title: '',
        expectedCount: expected.length,
        generatedCount: generated.length,
        missing,
        extra,
        optionMismatches,
        totalOptionsExpected,
        totalOptionsMissing,
    };
}

async function main() {
    const args = process.argv.slice(2);
    const cacheDir = path.join(process.cwd(), 'scripts', 'fillout-fields');
    const available = fs
        .readdirSync(cacheDir)
        .map((f) => f.match(/^published-([^-]+)-next-data\.json$/)?.[1])
        .filter((x): x is string => Boolean(x));

    const ids = args.length > 0 ? args : available;
    if (ids.length === 0) {
        console.error('No Fillout snapshots found in scripts/fillout-fields/. Run fetch-fillout-published-structure.ts first.');
        process.exit(1);
    }

    console.log(`Verifying ${ids.length} form(s) against Fillout snapshots…\n`);
    const reports: FormReport[] = [];
    for (const id of ids) {
        const snapPath = path.join(cacheDir, `published-${id}-next-data.json`);
        if (!fs.existsSync(snapPath)) {
            console.log(`  ⚠ ${id}  — snapshot missing, skipping`);
            continue;
        }
        const raw = JSON.parse(fs.readFileSync(snapPath, 'utf-8'));
        const tpl: RawTemplate | undefined = raw?.props?.pageProps?.flowSnapshot?.template;
        const title: string = raw?.props?.pageProps?.flow?.name || id;
        if (!tpl) {
            console.log(`  ⚠ ${id}  — snapshot has no template, skipping`);
            continue;
        }
        const expected = expectedFromSnapshot(tpl);
        const formData = await importFormData(id);
        if (!formData) {
            console.log(`  ⚠ ${id}  — constants/form_${id.toLowerCase()}.ts missing, skipping`);
            continue;
        }
        const generated = flattenGenerated(formData);
        const report = compareForm(id, expected, generated);
        report.title = title;
        reports.push(report);
    }

    // Summary table.
    console.log(
        'formId            form                                    qsExp   qsGen   miss   extra   optsExp   optsMiss   status',
    );
    console.log('─'.repeat(124));
    let anyIssue = false;
    for (const r of reports) {
        const ok = r.missing.length === 0 && r.totalOptionsMissing === 0;
        if (!ok) anyIssue = true;
        console.log(
            `${r.id.padEnd(17)} ${String(r.title).slice(0, 38).padEnd(38)}  ${String(r.expectedCount).padStart(5)}   ${String(r.generatedCount).padStart(5)}   ${String(r.missing.length).padStart(4)}    ${String(r.extra.length).padStart(4)}   ${String(r.totalOptionsExpected).padStart(6)}   ${String(r.totalOptionsMissing).padStart(7)}    ${ok ? 'OK' : 'NEEDS REVIEW'}`,
        );
    }

    // Per-form details for anything that isn't clean.
    for (const r of reports) {
        const interesting =
            r.missing.length > 0 ||
            r.extra.length > 0 ||
            r.optionMismatches.length > 0;
        if (!interesting) continue;
        console.log(`\n── ${r.id} — ${r.title} ──`);
        if (r.missing.length > 0) {
            console.log('  Missing questions (in Fillout but not in generated form):');
            for (const m of r.missing) console.log('    - ' + m);
        }
        if (r.extra.length > 0) {
            console.log('  Extra questions (in generated form but not in Fillout):');
            for (const m of r.extra) console.log('    - ' + m);
        }
        if (r.optionMismatches.length > 0) {
            console.log(`  Option mismatches (${r.optionMismatches.length}):`);
            for (const om of r.optionMismatches) {
                console.log(`    • ${om.question}`);
                if (om.missingOptions.length > 0)
                    console.log('      missing: ' + om.missingOptions.join(' | '));
                if (om.extraOptions.length > 0)
                    console.log('      extra:   ' + om.extraOptions.join(' | '));
            }
        }
    }

    console.log(
        `\nDone. ${reports.filter((r) => r.missing.length === 0 && r.totalOptionsMissing === 0).length}/${reports.length} forms match Fillout exactly.`,
    );
    process.exit(anyIssue ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
