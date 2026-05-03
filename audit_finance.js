const fs = require('fs');
const content = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');

// Extract all Finance entries with their names and subcategories
const entryRegex = /\{[^}]*slug:\s*"([^"]+)"[^}]*name:\s*"([^"]+)"[^}]*category:\s*"Finance"[^}]*(?:subcategory:\s*"([^"]+)")?[^}]*\}/g;
let m;
const financeEntries = [];
while ((m = entryRegex.exec(content)) !== null) {
  financeEntries.push({ slug: m[1], name: m[2], subcategory: m[3] || 'General' });
}

// Group by subcategory
const bySubcat = {};
financeEntries.forEach(e => {
  if (!bySubcat[e.subcategory]) bySubcat[e.subcategory] = [];
  bySubcat[e.subcategory].push(e.name);
});

console.log(`Total Finance calculators: ${financeEntries.length}`);
console.log('\nBy subcategory:');
Object.entries(bySubcat).sort().forEach(([sub, names]) => {
  console.log(`\n  [${sub}] (${names.length})`);
  names.forEach(n => console.log(`    - ${n}`));
});
