const fs = require('fs');

const regContent = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');

// Count all distinct categories that actually appear in registry
const catMatches = [...regContent.matchAll(/\bcategory:\s*"([^"]+)"/g)].map(m => m[1]);
const catCounts = {};
catMatches.forEach(c => { catCounts[c] = (catCounts[c] || 0) + 1; });

// Expected categories from page.tsx categoryOrder
const expected = ['Finance', 'Health', 'Math', 'Science', 'Everyday Life', 'Construction', 'Sports', 'Ecology', 'Technology', 'Education', 'Conversion', 'Automobile'];

console.log('=== Category Mismatch Analysis ===');
console.log('\nCategories currently in registry (with counts):');
Object.entries(catCounts).sort().forEach(([c, n]) => {
  const isExpected = expected.includes(c);
  console.log(`  ${isExpected ? '✅' : '❌'} "${c}": ${n} calculators`);
});

console.log('\nExpected categories with ZERO calculators assigned to them:');
expected.forEach(e => {
  if (!catCounts[e]) console.log(`  ❌ "${e}" - 0 calculators`);
});

// Also check getCategoryIcon keys
const iconBlock = regContent.match(/getCategoryIcon[\s\S]*?\};/);
if (iconBlock) {
  const keys = [...iconBlock[0].matchAll(/"([^"]+)":\s*\w+/g)].map(m => m[1]);
  console.log('\ngetCategoryIcon keys:', keys);
  
  const missingIcons = expected.filter(e => !keys.includes(e));
  console.log('Missing icon mappings for:', missingIcons);
}
