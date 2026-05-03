const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
const content = fs.readFileSync(file, 'utf8');

const slugs = [...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]);
const names = [...content.matchAll(/\bname:\s*"([^"]+)"/g)].map(m => m[1]);
const categories = [...content.matchAll(/\bcategory:\s*"([^"]+)"/g)].map(m => m[1]);

console.log(`✅ Total Slugs: ${slugs.length}`);
console.log(`✅ Total Names: ${names.length}`);
console.log(`✅ Total Categories: ${categories.length}`);

// Duplicates
const uniqueSlugs = new Set(slugs);
const duplicateCount = slugs.length - uniqueSlugs.size;
console.log(`✅ Duplicate Slugs: ${duplicateCount} (Expected 0)`);

// Fake entries
const fakes = names.filter(n => n.match(/Tool\s*\d+/i) || n.match(/Placeholder/i));
console.log(`✅ Fake Entries: ${fakes.length} (Expected 0)`);

// Categories
const expectedCategories = ["Finance", "Health", "Math", "Science", "Everyday Life", "Construction", "Sports", "Ecology", "Technology", "Education", "Conversion", "Automobile"];
const catCounts = {};
categories.forEach(cat => {
  catCounts[cat] = (catCounts[cat] || 0) + 1;
});

let missingCats = 0;
console.log("📊 Category Breakdown:");
expectedCategories.forEach(cat => {
  const c = catCounts[cat] || 0;
  console.log(`   - ${cat}: ${c}`);
  if (c === 0) missingCats++;
});
console.log(`✅ Categories missing tools: ${missingCats} (Expected 0)`);

const invalidSlugs = slugs.filter(s => !/^[a-z0-9-]+$/.test(s));
console.log(`✅ Invalid Slugs: ${invalidSlugs.length} (Expected 0)`);
