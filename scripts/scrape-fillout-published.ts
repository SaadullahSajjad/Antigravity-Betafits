/**
 * One-off: fetch a published Fillout form, extract the embedded JSON config
 * (Fillout publishes forms via Next.js, so form definition lives in
 * <script id="__NEXT_DATA__">). If it contains page/section structure we
 * can build a richer multi-step wizard locally.
 *
 * Usage: npx tsx scripts/scrape-fillout-published.ts <filloutFormId>
 */

import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const formId = process.argv[2] || 'urHF8xDu7eus';
    const url = `https://betafits.fillout.com/t/${formId}`;
    console.log(`GET ${url}`);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    console.log(`status=${res.status} bytes=${html.length}`);

    const matchers: Array<{ label: string; regex: RegExp }> = [
        { label: '__NEXT_DATA__', regex: /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/ },
        { label: 'self.__next_f.push', regex: /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g as unknown as RegExp },
    ];

    const outDir = path.join(process.cwd(), 'scripts', 'fillout-fields');
    fs.mkdirSync(outDir, { recursive: true });

    // 1) __NEXT_DATA__
    const nextData = html.match(matchers[0].regex);
    if (nextData) {
        const parsed = JSON.parse(nextData[1]);
        const outPath = path.join(outDir, `published-${formId}-next-data.json`);
        fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
        console.log(`\nWrote ${outPath}`);
        const pp = parsed.props?.pageProps;
        if (pp) {
            console.log('pageProps keys:', Object.keys(pp));
        }
    } else {
        console.log('\n__NEXT_DATA__ not present.');
    }

    // 2) Next 13 RSC flight chunks
    const flightMatches = Array.from(html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g));
    console.log(`\nRSC flight chunks: ${flightMatches.length}`);
    if (flightMatches.length) {
        const decoded = flightMatches.map((m) => JSON.parse('"' + m[1] + '"')).join('');
        const outPath = path.join(outDir, `published-${formId}-flight.txt`);
        fs.writeFileSync(outPath, decoded);
        console.log(`Wrote ${outPath} (${decoded.length} bytes)`);
    }

    // 3) Scan HTML for any JSON blob mentioning "pages" and "questions"
    const candidates: string[] = [];
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
    let m: RegExpExecArray | null;
    while ((m = scriptRegex.exec(html))) {
        const s = m[1];
        if (/"pages"\s*:/.test(s) && /"questions"\s*:/.test(s)) candidates.push(s);
    }
    console.log(`\n<script> blocks mentioning pages+questions: ${candidates.length}`);
    if (candidates.length) {
        const outPath = path.join(outDir, `published-${formId}-candidates.txt`);
        fs.writeFileSync(outPath, candidates.join('\n\n=====\n\n'));
        console.log(`Wrote ${outPath}`);
    }

    // 4) Also try Fillout's public schema endpoint (undocumented)
    const schemaUrl = `https://api.fillout.com/public/v1/forms/${formId}`;
    try {
        const sr = await fetch(schemaUrl);
        console.log(`\n${schemaUrl} -> ${sr.status}`);
        if (sr.ok) {
            const j = await sr.json();
            fs.writeFileSync(
                path.join(outDir, `published-${formId}-publicv1.json`),
                JSON.stringify(j, null, 2),
            );
            console.log('Wrote publicv1 schema.');
        }
    } catch (err) {
        console.log('public/v1 schema fetch failed:', (err as Error).message);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
