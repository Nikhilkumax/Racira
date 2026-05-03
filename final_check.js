const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

// Parse entries roughly by regex
const entries = [];
const regex = /\{[^}]*slug:\s*"([^"]+)"[^}]*name:\s*"([^"]+)"[^}]*category:\s*"([^"]+)"[^}]*\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  entries.push({ slug: match[1], name: match[2], category: match[3] });
}

// 1. Total Count
const count = entries.length;
console.log(`✅ Total Calculators: ${count}`);

// 2. Duplicates
const slugs = entries.map(e => e.slug);
const uniqueSlugs = new Set(slugs);
const duplicateCount = slugs.length - uniqueSlugs.size;
console.log(`✅ Duplicates: ${duplicateCount} (Expected 0)`);

// 3. Fake Entries (e.g., 'Tool 1', 'Advanced Tool')
const fakes = entries.filter(e => e.name.match(/Tool\s*\d+/i) || e.name.match(/Placeholder/i));
console.log(`✅ Fake Entries: ${fakes.length} (Expected 0)`);

// 4. Category Check
const expectedCategories = ["Finance", "Health", "Math", "Science", "Everyday Life", "Construction", "Sports", "Ecology", "Technology", "Education", "Conversion", "Automobile"];
const catCounts = {};
entries.forEach(e => {
  catCounts[e.category] = (catCounts[e.category] || 0) + 1;
});

let missingCats = 0;
expectedCategories.forEach(cat => {
  const c = catCounts[cat] || 0;
  console.log(`   - ${cat}: ${c}`);
  if (c === 0) missingCats++;
});
console.log(`✅ Categories missing tools: ${missingCats} (Expected 0)`);

// 5. Slug validation
const invalidSlugs = slugs.filter(s => !/^[a-z0-9-]+$/.test(s));
console.log(`✅ Invalid Slugs: ${invalidSlugs.length} (Expected 0)`);
