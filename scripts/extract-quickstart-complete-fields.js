const fs = require('fs');
const content = fs.readFileSync('constants/quickStartFormComplete.ts', 'utf8');

// Extract all question IDs
const regex = /id:\s*['"]([^'"]+)['"],\s*label:\s*['"]([^'"]+)['"],\s*type:\s*['"]([^'"]+)['"]/g;
const fields = [];
let match;

while ((match = regex.exec(content)) !== null) {
    fields.push({
        id: match[1],
        label: match[2],
        type: match[3]
    });
}

console.log(`Quick Start Complete (eBxXtLZdK4us): ${fields.length} fields\n`);
fields.forEach(f => {
    console.log(`  - ${f.id} (${f.type}): ${f.label}`);
});

fs.writeFileSync('quickstart-complete-fields.json', JSON.stringify(fields, null, 2));
console.log('\n✅ Saved to quickstart-complete-fields.json');
