const fs = require('fs');
let c = fs.readFileSync('src/data/calculators/health.ts', 'utf8');
const slugs = [
  'pregnancy-calculator',
  'steroid-equivalence-calculator',
  'dead-space-fraction-calculator',
  'radiation-dose-fractionation-calculator',
  'insulin-to-carb-ratio-calculator'
];
for (const slug of slugs) {
  const regex = new RegExp(`slug: "${slug}"[\\s\\S]*?isBuilt: false`, 'g');
  c = c.replace(regex, match => match.replace('isBuilt: false', 'isBuilt: true'));
}
fs.writeFileSync('src/data/calculators/health.ts', c);
console.log('Updated isBuilt to true for Batch 18');
