/**
 * Build `lib/airtable/filloutQuestionMappings.ts`: a per-form mapping of
 * Fillout question IDs -> Airtable field names.
 *
 * Flow:
 *   1. Pull the live Airtable schema (Group Data + EE Pulse Surveys) so we
 *      know which field names are available per target table.
 *   2. Seed the Betafits Quick Start mapping verbatim from the hand-tuned
 *      table that already exists in the submit route.
 *   3. For every other Fillout question, try (a) explicit LABEL_HINTS, then
 *      (b) exact-label match, then (c) fuzzy token overlap, then (d) fall
 *      back to "Additional Notes" on Group Data (skip on EE Pulse).
 *
 * Usage: npx tsx scripts/build-fillout-airtable-mapping.ts
 */

import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config({ path: '.env.local' });

const BASE_ID = 'appdqgKk1fmhfaJoT';
const GROUP_DATA_TABLE = 'tbliXJ7599ngxEriO';
const EE_PULSE_SURVEYS_TABLE = 'tbl28XVUekjvl2Ujn';

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

interface AirtableField {
    id: string;
    name: string;
    type: string;
}
interface AirtableTable {
    id: string;
    name: string;
    fields: AirtableField[];
}

const EE_PULSE_FORM_IDS = new Set<string>(['eQ7FVU76PDus']);
const GROUP_DATA_FALLBACK = 'Additional Notes (Optional)';

/**
 * Hand-tuned ground truth copied from app/api/forms/submit/route.ts
 * (quickStartQuestionIdToAirtable). We seed this verbatim so the Betafits
 * Quick Start form keeps its perfect mapping regardless of fuzzy scoring.
 */
const SEED_MAPPINGS: Record<string, Record<string, string>> = {
    eBxXtLZdK4us: {
        '3khn37NbHQYb7CN6NPgrx2': 'Last Name',
        qYvbJrrJqLQjqQnVip6c3N: 'First Name',
        '2d65uNNeKNqSmZT1k2WVRq': 'Job Title',
        jZa7ip7oU533vM2qLWCkZj: 'Phone Number',
        ckkAfnKZoQag2Kqf7j71Cq: 'Work Email',
        '2UCyRd53bWrtdKXAK1XMy6': 'Company Name',
        ayXo: 'Street Address',
        fT94: 'City',
        hmTa: 'State / Province',
        wLev: 'ZIP Code',
        r1TkXLw3QBZBCkoRHidEPs: 'Year Company Founded',
        uTuDTocoypgCbQCkcHWUXN: 'EIN',
        hf2rRXr8RmGS1o5PFoFJJn: 'Preferred SIC Code',
        xfBVQncwKZoTzx4FDeHDLR: 'Preferred NAICS Code',
        jMkzWAv3b9K5VCyGHPsZmw: 'Benefit-Eligible US Employees Range',
        '87fD37dczxpgzodHMWgvWT': 'Estimated Medical Enrolled EEs',
        onbhhvHYbup9VUBE6eAAaz: 'Estimated Benefit Eligible EEs',
        xcqpaj6Sfv98YJFAUiCZ4z: 'Expected Headcount Growth (next 12 months)',
        opsQwCsEVnschNufM581ph: 'NDA Required',
        d4wVEowxCpRtdsXr81nFnF: 'Offered Benefits',
        iHxYYn5HYHDvKGH7Ec9Z5L: 'Current Start Month',
        gSmJUwa363oWH5x2Q68ojZ: 'Expected Start Month',
        '62Sic2EiCFMVuxwFUM9L1k': 'Medical Offering Type',
        '7XiD4e9FAysNviYb9ocJQd': 'Medical Contribution Strategy',
        aByPiuEENQzRDaTFecMkKT: 'Medical Buy-Up Strategy',
        b5zjBDR1YeKTq9GaVxQYWv: 'Currently with a PEO',
        mM5ZyS9KeVz83eeqfdHoRn: 'Current PEO',
        vPgLS18szbAabJNGiwDnev: 'Evaluated PEOs',
        kewbuyogJjkbbQNNXpbtxe: 'HR Software Used',
        i5Cg: 'Predominant Payroll Frequency',
        eKX8: 'Deduction Frequency',
        hkZ8KcqU7mWUPnJK3WBybe: 'Ideal Number of Medical Plan Options',
        qjLXquRvoppwrWfFrFNEnf: 'Expected Plan Types',
    },
};

/**
 * Per-form overrides for specific Fillout question labels that fuzzy matching
 * can't reliably resolve. Key = normalized question label (lowercase, strip
 * punctuation). Value = Airtable field name.
 */
const LABEL_HINTS: Record<string, Record<string, string>> = {
    // ---------- Generic labels that apply to multiple forms ----------
    // (handled via per-form entries below for clarity, but collected here for reference)
    // ---------- Broker Role ----------
    // Airtable Group Data uses: "Type of Broker", "Broker Service Agreement?",
    // "Broker Fees", "Broker Subsidize Cost?", "Broker Contact Frequency",
    // "Broker Meet Frequency". The 5 rating columns do not yet exist in Airtable,
    // so those fall through to Additional Notes (Optional).
    urHF8xDu7eus: {
        'what type of broker platform or consultant supports your employee benefits': 'Type of Broker',
        'do you have a signed service agreement or only a broker of record bor letter':
            'Broker Service Agreement?',
        'do you pay your broker any fees beyond commissions or standard premiums':
            'Broker Fees',
        'does your broker currently pay for or subsidize any of the following services':
            'Broker Subsidize Cost?',
        'how often do you contact your broker for support': 'Broker Contact Frequency',
        'how often do you have strategic or renewal meetings with your broker':
            'Broker Meet Frequency',
    },
    // ---------- Benefits Pulse Survey (EE Pulse Surveys target) ----------
    eQ7FVU76PDus: {
        'company name': 'Company',
        'benefit year': 'Benefit Year',
        'on which medical plan are you enrolled': 'Medical Tier',
        'how are you currently enrolled for health benefits': 'Medical Tier',
        'medical network': 'Medical Network',
        'overall benefits package': 'Overall',
        'medical plan options': 'Medical Options',
        'employee costs': 'Employee Costs',
        'other benefits non medical': 'Non-Medical',
        comments: 'Comments',
        'type your question here': 'Comments',
    },
    // ---------- Workers Compensation ----------
    tE2Bb3x71Cus: {
        'fein': 'EIN',
        'phone': 'Phone Number',
        'dba': 'Doing Business As (DBA)',
        'physical address': 'Street Address',
        state: 'State / Province',
        'zip': 'ZIP Code',
        'zip 1': 'ZIP Code',
        'state 1': 'State (Mail Address)',
        'is your mailing address the same as your physical address':
            'Is Mailing Address Same As Physical',
        'pay frequency': 'Payroll Frequency',
    },
    // ---------- NDA ----------
    '6eUGSndhtYus': {
        'non disclosure agreement nda optional': 'NDA Required',
        'record id': 'Group Data Record ID',
        'what is the company s full legal name': 'Entity Legal Name',
        'what is the entity s state of formation': 'State of Formation',
        'what is the entity type': 'Entity Type',
        'will you be the signer for the nda': 'NDA Signer Type',
        'name of the nda signer': 'Alternate NDA Signer Name',
        'title of the nda signer': 'Alternate NDA Signer Title',
        'email of the nda signer': 'Alternate NDA Signer Email',
        'what is the legal name of the entity': 'Entity Legal Name',
    },
    // ---------- Quick Start (New Benefits) ----------
    jLwpyNvuB2us: {
        title: 'Job Title',
        phone: 'Phone Number',
        'how many benefit eligible us employees does the company have':
            'Estimated Benefit-Eligible Employees',
        'what is your company address': 'Street Address',
        'legal name': 'Entity Legal Name',
        'state of formation': 'State of Formation',
        'what is the entity type': 'Entity Type',
        'what is the tax structure': 'Tax Structure',
        'employer identification number ein': 'EIN',
        'preferred sic code': 'Preferred SIC Code',
        'preferred naics code': 'Preferred NAICS Code',
        'non disclosure agreement nda optional': 'NDA Required',
        'will you be the signer for the nda': 'NDA Signer Type',
        'what peo are you working with': 'Current PEO',
        'what peos have you evaluated': 'Evaluated PEOs',
        'who is your payroll provider': 'Payroll Provider',
        'what is your payroll frequency': 'Payroll Frequency',
        'ideal number of medical plan options': 'Ideal Number of Medical Plan Options',
        'what benefits do you plan to offer at this time': 'Offered Benefits',
        'what contribution strategy do you have in mind': 'Medical Contribution Strategy',
    },
};

// Strip punctuation, lowercase, and collapse whitespace.
function normalize(s: string): string {
    return String(s || '')
        .toLowerCase()
        .replace(/[\u2018\u2019\u201C\u201D]/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function tokens(s: string, minLen = 2): Set<string> {
    return new Set(normalize(s).split(' ').filter((t) => t.length >= minLen));
}

function similarity(a: string, b: string): number {
    const ta = tokens(a);
    const tb = tokens(b);
    if (ta.size === 0 || tb.size === 0) return 0;
    let intersect = 0;
    for (const t of ta) if (tb.has(t)) intersect += 1;
    return intersect / Math.max(ta.size, tb.size);
}

async function fetchAirtableSchema(apiKey: string): Promise<AirtableTable[]> {
    const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) throw new Error(`Airtable meta API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { tables: AirtableTable[] };
    return data.tables;
}

function findLatestFilloutJson(): string {
    const dir = path.join(process.cwd(), 'scripts', 'fillout-fields');
    const candidates = fs
        .readdirSync(dir)
        .filter((f) => f.startsWith('forms-') && !f.includes('airtable') && f.endsWith('.json'))
        .map((f) => ({ f, t: Number(f.replace(/\D/g, '')) }))
        .sort((a, b) => b.t - a.t);
    if (!candidates.length) throw new Error('No Fillout snapshot JSON found.');
    return path.join(dir, candidates[0].f);
}

type Confidence = 'seed' | 'hint' | 'exact' | 'fuzzy' | 'fallback';

interface MatchResult {
    airtableField: string;
    confidence: Confidence;
}

function pickAirtableField(
    q: FilloutQuestion,
    formId: string,
    airtableFieldNames: string[],
    isEePulse: boolean,
): MatchResult | null {
    const seed = SEED_MAPPINGS[formId]?.[q.id];
    if (seed && airtableFieldNames.includes(seed)) {
        return { airtableField: seed, confidence: 'seed' };
    }
    const normQ = normalize(q.name);
    const hint = LABEL_HINTS[formId]?.[normQ];
    if (hint && airtableFieldNames.includes(hint)) {
        return { airtableField: hint, confidence: 'hint' };
    }
    // Exact (normalized) match
    for (const f of airtableFieldNames) {
        if (normalize(f) === normQ) return { airtableField: f, confidence: 'exact' };
    }
    // Fuzzy score
    const scored = airtableFieldNames
        .map((f) => ({ f, s: similarity(q.name, f) }))
        .sort((a, b) => b.s - a.s);
    if (scored[0] && scored[0].s >= 0.45) {
        return { airtableField: scored[0].f, confidence: 'fuzzy' };
    }
    // Safe fallback on Group Data (never on EE Pulse)
    if (!isEePulse && airtableFieldNames.includes(GROUP_DATA_FALLBACK)) {
        return { airtableField: GROUP_DATA_FALLBACK, confidence: 'fallback' };
    }
    return null;
}

async function main() {
    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!apiKey) throw new Error('AIRTABLE_API_KEY not set in .env.local');

    console.log('Fetching Airtable schema…');
    const tables = await fetchAirtableSchema(apiKey);
    const tableById = new Map<string, AirtableTable>();
    for (const t of tables) tableById.set(t.id, t);
    const groupData = tableById.get(GROUP_DATA_TABLE)!;
    const eePulse = tableById.get(EE_PULSE_SURVEYS_TABLE)!;
    console.log(`  Group Data: ${groupData.fields.length} fields`);
    console.log(`  EE Pulse Surveys: ${eePulse.fields.length} fields\n`);

    const jsonPath = findLatestFilloutJson();
    console.log(`Fillout snapshot: ${path.basename(jsonPath)}`);
    const fillout = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Record<string, FilloutForm>;

    const mappings: Record<string, Record<string, string>> = {};
    const stats = {
        seed: 0,
        hint: 0,
        exact: 0,
        fuzzy: 0,
        fallback: 0,
        skipped: 0,
        total: 0,
    };
    const perForm: Array<{
        formId: string;
        name: string;
        table: string;
        counts: Record<Confidence | 'skipped', number>;
        totalQ: number;
    }> = [];

    for (const [formId, form] of Object.entries(fillout)) {
        const isEePulse = EE_PULSE_FORM_IDS.has(formId);
        const target = isEePulse ? eePulse : groupData;
        const names = target.fields.map((f) => f.name);
        const map: Record<string, string> = {};
        const c: Record<Confidence | 'skipped', number> = {
            seed: 0,
            hint: 0,
            exact: 0,
            fuzzy: 0,
            fallback: 0,
            skipped: 0,
        };
        for (const q of form.questions) {
            const r = pickAirtableField(q, formId, names, isEePulse);
            if (!r) {
                c.skipped += 1;
                stats.skipped += 1;
            } else {
                map[q.id] = r.airtableField;
                c[r.confidence] += 1;
                stats[r.confidence] += 1;
            }
            stats.total += 1;
        }
        mappings[formId] = map;
        perForm.push({
            formId,
            name: form.name,
            table: target.name,
            counts: c,
            totalQ: form.questions.length,
        });
    }

    // --- Emit TS module -----------------------------------------------
    const banner = `/**
 * AUTO-GENERATED by scripts/build-fillout-airtable-mapping.ts on ${new Date().toISOString()}.
 * Per-form mapping of Fillout question IDs -> Airtable field names.
 *
 * Regenerate:
 *   npx tsx scripts/fetch-fillout-form-structure.ts --from-airtable
 *   npx tsx scripts/build-fillout-airtable-mapping.ts
 */
`;
    let body = '\nexport const FILLOUT_QUESTION_ID_TO_AIRTABLE_FIELD: Record<string, Record<string, string>> = {\n';
    for (const [formId, map] of Object.entries(mappings)) {
        body += `    ${JSON.stringify(formId)}: {\n`;
        for (const q of fillout[formId].questions) {
            if (map[q.id]) {
                const label = q.name.replace(/\r?\n/g, ' ').slice(0, 80);
                body += `        ${JSON.stringify(q.id)}: ${JSON.stringify(map[q.id])}, // ${label}\n`;
            }
        }
        body += `    },\n`;
    }
    body += '};\n';

    body += '\nexport const FILLOUT_QUESTION_ID_TO_LABEL: Record<string, Record<string, string>> = {\n';
    for (const [formId, form] of Object.entries(fillout)) {
        body += `    ${JSON.stringify(formId)}: {\n`;
        for (const q of form.questions) {
            const clean = q.name.replace(/\r?\n/g, ' ').trim();
            body += `        ${JSON.stringify(q.id)}: ${JSON.stringify(clean)},\n`;
        }
        body += `    },\n`;
    }
    body += '};\n';

    const fallbackEntry = `\nexport const GROUP_DATA_FALLBACK_FIELD = ${JSON.stringify(GROUP_DATA_FALLBACK)};\n`;
    body += fallbackEntry;
    const outPath = path.join(process.cwd(), 'lib', 'airtable', 'filloutQuestionMappings.ts');
    fs.writeFileSync(outPath, banner + body, 'utf-8');
    console.log(`\nWrote ${path.relative(process.cwd(), outPath)}`);

    // --- Report --------------------------------------------------------
    console.log('\n' + '─'.repeat(118));
    console.log(
        'formId'.padEnd(16) +
            '  ' +
            'form'.padEnd(38) +
            '  ' +
            'table'.padEnd(22) +
            '  ' +
            'qs'.padStart(4) +
            '  ' +
            'seed'.padStart(5) +
            '  ' +
            'hint'.padStart(5) +
            '  ' +
            'exact'.padStart(6) +
            '  ' +
            'fuzzy'.padStart(6) +
            '  ' +
            'fallb'.padStart(6) +
            '  ' +
            'skip'.padStart(5),
    );
    console.log('─'.repeat(118));
    for (const p of perForm) {
        console.log(
            p.formId.padEnd(16) +
                '  ' +
                p.name.slice(0, 38).padEnd(38) +
                '  ' +
                p.table.slice(0, 22).padEnd(22) +
                '  ' +
                String(p.totalQ).padStart(4) +
                '  ' +
                String(p.counts.seed).padStart(5) +
                '  ' +
                String(p.counts.hint).padStart(5) +
                '  ' +
                String(p.counts.exact).padStart(6) +
                '  ' +
                String(p.counts.fuzzy).padStart(6) +
                '  ' +
                String(p.counts.fallback).padStart(6) +
                '  ' +
                String(p.counts.skipped).padStart(5),
        );
    }
    console.log('─'.repeat(118));
    const mapped = stats.seed + stats.hint + stats.exact + stats.fuzzy + stats.fallback;
    console.log(
        `TOTAL: ${mapped}/${stats.total} mapped (${Math.round(
            (mapped / stats.total) * 100,
        )}%)  — seed:${stats.seed} hint:${stats.hint} exact:${stats.exact} fuzzy:${stats.fuzzy} fallback:${stats.fallback} skipped:${stats.skipped}`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
