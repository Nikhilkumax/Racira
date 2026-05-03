const fs = require('fs');

const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

// Order matters: do longer/specific strings first to avoid partial matches
const mapping = [
  ['Financial & Loan',        'Finance'],
  ['Indian Finance',          'Finance'],
  ['Investment & Retirement', 'Finance'],
  ['Real Estate',             'Finance'],
  ['Business',                'Finance'],
  ['Fitness & Health',        'Health'],
  ['Science & Engineering',   'Science'],
  ['Time & Date',             'Everyday Life'],
  ['Lifestyle',               'Everyday Life'],
  ['Tech',                    'Technology'],
];

mapping.forEach(([from, to]) => {
  // Replace only in `category: "..."` context, not subcategory or other strings
  content = content.split(`category: "${from}"`).join(`category: "${to}"`);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Fix 1 applied: category remapping done.');

// Verify
const remaining = mapping.map(([from]) => {
  const count = (content.match(new RegExp(`category: "${from.replace(/&/g, '\\&')}"`, 'g')) || []).length;
  return { from, count };
}).filter(r => r.count > 0);

if (remaining.length === 0) {
  console.log('✅ All old category names replaced successfully.');
} else {
  console.log('⚠️  Some old names remain:', remaining);
}

// Count new distribution
const cats = {};
const reg = /\bcategory:\s*"([^"]+)"/g;
let m;
while ((m = reg.exec(content)) !== null) cats[m[1]] = (cats[m[1]] || 0) + 1;
console.log('\nNew category distribution:');
Object.entries(cats).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log(`  ${c}: ${n}`));
