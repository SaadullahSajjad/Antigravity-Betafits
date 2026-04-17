/**
 * Compare each hand-written form definition in `constants/` against the
 * corresponding live Fillout form, using the raw Fillout API JSON produced by
 * `scripts/fetch-fillout-form-structure.ts`.
 *
 * For every hand-written form we:
 *   1. Import its FORM_DATA default export at runtime.
 *   2. Flatten its pages/sections into a question list.
 *   3. Find the Fillout form with the matching `id` (or the same title).
 *   4. Report: # questions in hand-written vs Fillout, which labels match /
 *      mismatch, and any questions that only exist on one side.
 *
 * Usage: npx tsx scripts/compare-handwritten-vs-fillout.ts
 */

import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config({ path: '.env.local' });

interface Question {
    id: string;
    label: string;
    type: string;
    options?: Array<{ value: string; label: string }>;
}
interface FormDataDef {
    id: string;
    title: string;
    pages: Array<{
        id: string;
        name: string;
        sections: Array<{ id: string; title: string; questions: Question[] }>;
    }>;
}

interface FilloutQuestion {
    id: string;
    name: string;
    type: string;
    options?: Array<{ value: string; label: string }>;
}
interface FilloutForm {
    id: string;
    name: string;
    questions: FilloutQuestion[];
}

const CONSTANTS_DIR = path.join(process.cwd(), 'constants');
const FILLOUT_JSON_DIR = path.join(process.cwd(), 'scripts', 'fillout-fields');

function findLatestFilloutJson(): string | null {
    if (!fs.existsSync(FILLOUT_JSON_DIR)) return null;
    const candidates = fs
        .readdirSync(FILLOUT_JSON_DIR)
        .filter((f) => f.startsWith('forms-') && !f.includes('airtable') && f.endsWith('.json'))
        .map((f) => ({ f, t: Number(f.replace(/\D/g, '')) }))
        .sort((a, b) => b.t - a.t);
    return candidates.length ? path.join(FILLOUT_JSON_DIR, candidates[0].f) : null;
}

function normalize(s: string): string {
    return String(s || '')
        .toLowerCase()
        .replace(/[\s:?.,’'"`\-–—()/]+/g, ' ')
        .trim();
}

function flatten(def: FormDataDef): Question[] {
    const out: Question[] = [];
    for (const page of def.pages || []) {
        for (const section of page.sections || []) {
            for (const q of section.questions || []) out.push(q);
        }
    }
    return out;
}

async function loadHandwrittenDefs(): Promise<Array<{ file: string; def: FormDataDef }>> {
    if (!fs.existsSync(CONSTANTS_DIR)) return [];
    const files = fs
        .readdirSync(CONSTANTS_DIR)
        .filter((f) => f.endsWith('.ts') && !f.startsWith('form_') && !f.endsWith('.backup'));

    const { pathToFileURL } = await import('url');
    const results: Array<{ file: string; def: FormDataDef }> = [];
    const failures: string[] = [];
    for (const file of files) {
        const abs = path.join(CONSTANTS_DIR, file);
        const url = pathToFileURL(abs).href;
        try {
            const mod = await import(url);
            let found = false;
            for (const [, value] of Object.entries(mod)) {
                const v = value as Partial<FormDataDef>;
                if (v && typeof v === 'object' && 'pages' in v && 'title' in v && 'id' in v) {
                    results.push({ file, def: v as FormDataDef });
                    found = true;
                    break;
                }
            }
            if (!found) failures.push(`${file} (no FormDataDefinition export)`);
        } catch (err) {
            failures.push(`${file} (${(err as Error).message.split('\n')[0]})`);
        }
    }
    if (failures.length) {
        console.log('Skipped constants files:');
        for (const f of failures) console.log(`  - ${f}`);
        console.log('');
    }
    return results;
}

function matchFillout(
    def: FormDataDef,
    fillout: Record<string, FilloutForm>,
): FilloutForm | null {
    if (fillout[def.id]) return fillout[def.id];
    const wantTitle = normalize(def.title);
    for (const form of Object.values(fillout)) {
        if (normalize(form.name) === wantTitle) return form;
    }
    // Partial: same first 3 words
    const want3 = wantTitle.split(' ').slice(0, 3).join(' ');
    for (const form of Object.values(fillout)) {
        if (normalize(form.name).startsWith(want3)) return form;
    }
    return null;
}

interface Diff {
    file: string;
    handTitle: string;
    filloutTitle: string | null;
    filloutId: string | null;
    handCount: number;
    filloutCount: number | null;
    labelMatches: number;
    onlyInHand: string[];
    onlyInFillout: string[];
}

function diffQuestions(hand: Question[], fillout: FilloutQuestion[]): {
    labelMatches: number;
    onlyInHand: string[];
    onlyInFillout: string[];
} {
    const normHand = new Map<string, string>();
    for (const q of hand) normHand.set(normalize(q.label), q.label);
    const normFill = new Map<string, string>();
    for (const q of fillout) normFill.set(normalize(q.name), q.name);

    let labelMatches = 0;
    const onlyInHand: string[] = [];
    const onlyInFillout: string[] = [];
    for (const [key, orig] of normHand) {
        if (normFill.has(key)) labelMatches += 1;
        else onlyInHand.push(orig);
    }
    for (const [key, orig] of normFill) {
        if (!normHand.has(key)) onlyInFillout.push(orig);
    }
    return { labelMatches, onlyInHand, onlyInFillout };
}

async function main() {
    const jsonPath = findLatestFilloutJson();
    if (!jsonPath) {
        console.error('No scripts/fillout-fields/forms-*.json found. Run fetch-fillout-form-structure.ts first.');
        process.exit(1);
    }
    console.log(`\nFillout snapshot: ${path.basename(jsonPath)}\n`);
    const fillout = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Record<string, FilloutForm>;

    const hand = await loadHandwrittenDefs();
    console.log(`Found ${hand.length} hand-written form definitions in constants/.`);
    console.log(`Found ${Object.keys(fillout).length} Fillout forms in snapshot.\n`);

    const diffs: Diff[] = [];
    const unmatched: Array<{ file: string; title: string }> = [];

    for (const { file, def } of hand) {
        const match = matchFillout(def, fillout);
        const handQs = flatten(def);
        if (!match) {
            unmatched.push({ file, title: def.title });
            diffs.push({
                file,
                handTitle: def.title,
                filloutTitle: null,
                filloutId: null,
                handCount: handQs.length,
                filloutCount: null,
                labelMatches: 0,
                onlyInHand: handQs.map((q) => q.label),
                onlyInFillout: [],
            });
            continue;
        }
        const d = diffQuestions(handQs, match.questions);
        diffs.push({
            file,
            handTitle: def.title,
            filloutTitle: match.name,
            filloutId: match.id,
            handCount: handQs.length,
            filloutCount: match.questions.length,
            labelMatches: d.labelMatches,
            onlyInHand: d.onlyInHand,
            onlyInFillout: d.onlyInFillout,
        });
    }

    diffs.sort((a, b) => a.file.localeCompare(b.file));

    console.log('─'.repeat(110));
    console.log('Summary (hand-written vs Fillout — by question label match)');
    console.log('─'.repeat(110));
    console.log(
        [
            'file'.padEnd(38),
            'Fillout form'.padEnd(34),
            'hand'.padStart(5),
            'fillout'.padStart(8),
            'matched'.padStart(8),
            'accuracy'.padStart(9),
        ].join('  '),
    );
    console.log('─'.repeat(110));
    for (const d of diffs) {
        const total = d.filloutCount ?? 0;
        const pct = total ? Math.round((d.labelMatches / total) * 100) : 0;
        console.log(
            [
                d.file.padEnd(38),
                (d.filloutTitle ?? '(no match)').slice(0, 34).padEnd(34),
                String(d.handCount).padStart(5),
                (d.filloutCount ?? '-').toString().padStart(8),
                String(d.labelMatches).padStart(8),
                (d.filloutCount ? `${pct}%` : '—').padStart(9),
            ].join('  '),
        );
    }

    console.log('\n' + '─'.repeat(110));
    console.log('Per-form details');
    console.log('─'.repeat(110));
    for (const d of diffs) {
        if (!d.filloutId) {
            console.log(`\n${d.file} — ${d.handTitle}: NO MATCHING FILLOUT FORM (keep as custom).`);
            continue;
        }
        const total = d.filloutCount ?? 0;
        const pct = total ? Math.round((d.labelMatches / total) * 100) : 0;
        console.log(
            `\n${d.file} → Fillout "${d.filloutTitle}" (${d.filloutId})  hand=${d.handCount} fillout=${d.filloutCount} matched=${d.labelMatches} (${pct}%)`,
        );
        if (d.onlyInHand.length) {
            console.log(`  - extra in hand-written (${d.onlyInHand.length}):`);
            for (const l of d.onlyInHand.slice(0, 10)) console.log(`      · ${l}`);
            if (d.onlyInHand.length > 10) console.log(`      ... and ${d.onlyInHand.length - 10} more`);
        }
        if (d.onlyInFillout.length) {
            console.log(`  - missing from hand-written (${d.onlyInFillout.length}):`);
            for (const l of d.onlyInFillout.slice(0, 10)) console.log(`      · ${l}`);
            if (d.onlyInFillout.length > 10)
                console.log(`      ... and ${d.onlyInFillout.length - 10} more`);
        }
    }

    if (unmatched.length) {
        console.log('\nUnmatched hand-written forms (no Fillout equivalent by id or title):');
        for (const u of unmatched) console.log(`  - ${u.file} — "${u.title}"`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
