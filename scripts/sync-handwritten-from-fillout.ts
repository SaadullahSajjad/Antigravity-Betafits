/**
 * Rewrite every hand-written form definition in `constants/` so that its
 * question list, types, and options come verbatim from Fillout.
 *
 * Strategy: replace the body of each matched file with a one-line re-export
 * of the auto-generated `constants/form_<id>.ts` file (produced by
 * `scripts/fetch-fillout-form-structure.ts`). The original `export const`
 * identifier is preserved so React components keep compiling without edits.
 *
 * Files with no Fillout equivalent (appointBetafitsForm.ts, hrTechForm.ts,
 * anything not listed in MAPPING) are left untouched.
 *
 * Caveats:
 *   - Field IDs change to Fillout's opaque IDs (e.g. '4yptyRTf1voVY7sdFoJxGv').
 *     If any submission endpoint reads keys like 'firstName' it must be
 *     updated accordingly.
 *   - The Fillout public API does not expose page breaks, section headings,
 *     required flags, placeholders, or conditional logic, so every synced
 *     form renders as a single page / single section.
 *
 * Usage:  npx tsx scripts/sync-handwritten-from-fillout.ts [--dry]
 */

import * as fs from 'fs';
import * as path from 'path';

const MAPPING: Record<string, { formId: string; confidence: 'explicit' | 'inferred' }> = {
    // -------- explicit: name or title matched cleanly --------
    'brokerRoleForm.ts': { formId: 'urHF8xDu7eus', confidence: 'explicit' },
    'updateBrokerRoleForm.ts': { formId: 'urHF8xDu7eus', confidence: 'explicit' },
    'benefitsAdministrationForm.ts': { formId: 'fYJ3MNj7VQus', confidence: 'explicit' },
    'benefitsPulseSurveyForm.ts': { formId: 'eQ7FVU76PDus', confidence: 'explicit' },
    'medicalCoverageSurveyForm.ts': { formId: '199DTBMrsLus', confidence: 'explicit' },
    'ndaForm.ts': { formId: '6eUGSndhtYus', confidence: 'explicit' },
    'peoEORAssessmentForm.ts': { formId: 'cqBbC1vEUcus', confidence: 'explicit' },
    'premiumsContributionStrategyForm.ts': { formId: 'jgaiJJZJvjus', confidence: 'explicit' },
    'quickStartFormAlt.ts': { formId: 'jLwpyNvuB2us', confidence: 'explicit' },
    'quickStartNewBenefitsForm.ts': { formId: 'jLwpyNvuB2us', confidence: 'explicit' },
    'quickStartFormComplete.ts': { formId: 'eBxXtLZdK4us', confidence: 'explicit' },
    'workersCompensationForm.ts': { formId: 'tE2Bb3x71Cus', confidence: 'explicit' },
    // -------- inferred: picked by filename / title similarity --------
    'quickStartForm.ts': { formId: 'eBxXtLZdK4us', confidence: 'inferred' },
    'updateQuickstartForm.ts': { formId: 'eBxXtLZdK4us', confidence: 'inferred' },
    'updatePEOHRForm.ts': { formId: 'cqBbC1vEUcus', confidence: 'inferred' },
    'basicIntakeForm.ts': { formId: 'wpjffs7r5pus', confidence: 'inferred' },
    'comprehensiveIntakeForm.ts': { formId: 'wpjffs7r5pus', confidence: 'inferred' },
    'benefitsComplianceForm.ts': { formId: 'ujTSx72pr5us', confidence: 'inferred' },
    'addNewGroupForm.ts': { formId: 'xn4WCJ9D8pus', confidence: 'inferred' },
    'documentUploaderForm.ts': { formId: 'aTDkqH7zTmus', confidence: 'inferred' },
};

const CONSTANTS_DIR = path.join(process.cwd(), 'constants');

function extractExportName(src: string): string | null {
    // Match `export const IDENTIFIER(: Type)? = {`
    const m = src.match(/export\s+const\s+([A-Z0-9_]+)\s*(?::[^=]+)?=\s*\{/);
    return m ? m[1] : null;
}

function buildReExport(originalExportName: string, formId: string): string {
    const lowerId = formId.toLowerCase();
    return `import { FormDataDefinition } from '@/types/form';
import { FORM_DATA } from './form_${lowerId}';

/**
 * Auto-synced from Fillout. DO NOT EDIT DIRECTLY.
 *
 * Source: https://betafits.fillout.com/t/${formId}
 * Regenerate (fetch real multi-page/section structure from the published form):
 *   npx tsx scripts/fetch-fillout-published-structure.ts --from-airtable
 *   npx tsx scripts/sync-handwritten-from-fillout.ts
 *   npx tsx scripts/build-fillout-airtable-mapping.ts
 *
 * Required flags, placeholders, and conditional logic are not preserved — only
 * pages, sections, questions, and options.
 */
export const ${originalExportName}: FormDataDefinition = FORM_DATA;
`;
}

function main() {
    const dryRun = process.argv.includes('--dry');
    const backupsDir = path.join(CONSTANTS_DIR, '_pre-fillout-sync-backup');
    if (!dryRun && !fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }

    const touched: Array<{ file: string; exportName: string; formId: string; confidence: string }> = [];
    const skipped: Array<{ file: string; reason: string }> = [];

    for (const [file, { formId, confidence }] of Object.entries(MAPPING)) {
        const abs = path.join(CONSTANTS_DIR, file);
        if (!fs.existsSync(abs)) {
            skipped.push({ file, reason: 'file not found' });
            continue;
        }
        const genFile = path.join(CONSTANTS_DIR, `form_${formId.toLowerCase()}.ts`);
        if (!fs.existsSync(genFile)) {
            skipped.push({ file, reason: `generated ${path.basename(genFile)} not found — run fetch script first` });
            continue;
        }
        const src = fs.readFileSync(abs, 'utf-8');
        const exportName = extractExportName(src);
        if (!exportName) {
            skipped.push({ file, reason: 'no `export const NAME` found' });
            continue;
        }
        const newSrc = buildReExport(exportName, formId);
        if (dryRun) {
            touched.push({ file, exportName, formId, confidence });
            continue;
        }
        fs.writeFileSync(path.join(backupsDir, file), src, 'utf-8');
        fs.writeFileSync(abs, newSrc, 'utf-8');
        touched.push({ file, exportName, formId, confidence });
    }

    // Report
    console.log(`\n${dryRun ? 'DRY RUN — ' : ''}Synced ${touched.length} file(s) from Fillout:\n`);
    console.log('file'.padEnd(40) + '  ' + 'export'.padEnd(38) + '  ' + 'Fillout id'.padEnd(14) + '  conf');
    console.log('─'.repeat(106));
    for (const t of touched) {
        console.log(
            t.file.padEnd(40) +
                '  ' +
                t.exportName.padEnd(38) +
                '  ' +
                t.formId.padEnd(14) +
                '  ' +
                t.confidence,
        );
    }
    if (skipped.length) {
        console.log(`\nSkipped ${skipped.length}:`);
        for (const s of skipped) console.log(`  - ${s.file}: ${s.reason}`);
    }
    if (!dryRun) {
        console.log(`\nBackups of originals: constants/_pre-fillout-sync-backup/`);
        console.log(`To revert: copy files from that folder back into constants/.`);
    }
}

main();
