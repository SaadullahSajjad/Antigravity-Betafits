/**
 * One-shot codemod: swap every form component's inline validatePage()
 * implementation for the shared helper at lib/form/validation.ts.
 *
 * The hand-written forms (23 at time of writing) duplicate the same 10-line
 * validatePage block verbatim. The shared helper handles all the edge cases
 * the inline version misses (empty checkbox arrays, matrix rows, file objects),
 * and picking up `required` flags now that they're populated by the generator.
 *
 * Run:
 *   npx tsx scripts/wire-shared-validator.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const FORMS_DIR = path.join(process.cwd(), 'components', 'forms');
const files = fs
    .readdirSync(FORMS_DIR)
    .filter((f) => f.endsWith('.tsx') && f !== 'FormSection.tsx');

const OLD_BLOCK = /const validatePage = \(\): boolean => \{\s*\n\s*const pageErrors: Record<string, string> = \{\};\s*\n\s*currentPageData\.sections\.forEach\(\(section\) => \{\s*\n\s*section\.questions\.forEach\(\(question\) => \{\s*\n\s*if \(question\.required && !values\[question\.id\]\) \{\s*\n\s*pageErrors\[question\.id\] = question\.validation\?\.\[0\]\?\.message \|\| 'Field is required';\s*\n\s*\}\s*\n\s*\}\);\s*\n\s*\}\);\s*\n\s*setErrors\(pageErrors\);\s*\n\s*return Object\.keys\(pageErrors\)\.length === 0;\s*\n\s*\};\s*/;

const NEW_BLOCK = `const validatePage = (): boolean => {
        const pageErrors = validatePageValues(currentPageData, values);
        setErrors(pageErrors);
        return Object.keys(pageErrors).length === 0;
    };
    `;

const IMPORT_MARKER = /import FormSection from '\.\/FormSection';/;
const NEW_IMPORTS = `import FormSection from './FormSection';
import { validatePageValues } from '@/lib/form/validation';`;

let edited = 0;
let skipped: string[] = [];

for (const file of files) {
    const abs = path.join(FORMS_DIR, file);
    let src = fs.readFileSync(abs, 'utf-8');
    if (src.includes('validatePageValues(')) {
        // Already uses the helper — no-op.
        continue;
    }
    if (!OLD_BLOCK.test(src)) {
        skipped.push(file);
        continue;
    }
    const before = src;
    src = src.replace(OLD_BLOCK, NEW_BLOCK);
    if (IMPORT_MARKER.test(src) && !src.includes("from '@/lib/form/validation'")) {
        src = src.replace(IMPORT_MARKER, NEW_IMPORTS);
    }
    if (src !== before) {
        fs.writeFileSync(abs, src, 'utf-8');
        edited += 1;
        console.log(`  ✓ ${file}`);
    }
}

console.log(`\nEdited ${edited} form component(s).`);
if (skipped.length > 0) {
    console.log(`Skipped (did not match expected block): ${skipped.length}`);
    for (const s of skipped) console.log('  - ' + s);
}
