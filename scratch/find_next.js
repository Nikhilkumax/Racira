const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '../calculator-database');
const financeDb = JSON.parse(fs.readFileSync(path.join(dbDir, 'finance.json'), 'utf8'));
const srcDir = path.join(__dirname, '../src/calculators');

const calcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

const completed = [
  "amortization-calculator",
  "amortization-schedule-calculator",
  "amt-calculator",
  "loan-to-cost-ltc-ratio-calculator"
];

let rebuilds = [];

for (const sub of Object.values(financeDb.subcategories)) {
    for (const calc of sub.calculators) {
        if (completed.includes(calc.slug)) continue;

        let matchedFile = null;
        const expectedSlugNoDashes = calc.slug.replace(/-/g, '').toLowerCase();
        
        for (const file of calcFiles) {
            if (file.toLowerCase().includes(expectedSlugNoDashes)) {
                matchedFile = file;
                break;
            }
        }
        
        if (matchedFile) {
            rebuilds.push({ slug: calc.slug, name: calc.name, file: matchedFile });
        }
    }
}

rebuilds.sort((a, b) => a.slug.localeCompare(b.slug));

console.log("Next 5 Finance Rebuilds:");
rebuilds.slice(0, 5).forEach(r => console.log(`- ${r.slug} (${r.file})`));
