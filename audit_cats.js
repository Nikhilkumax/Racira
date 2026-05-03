const fs = require('fs');

// Check what the page.tsx categoryOrder expects vs what registry has
const pageContent = fs.readFileSync('src/app/calculator/page.tsx', 'utf8');
const regContent = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');

// Extract categoryOrder from page.tsx
const catOrderMatch = pageContent.match(/categoryOrder\s*=\s*\[([\s\S]*?)\]/);
const categoryOrderStr = catOrderMatch ? catOrderMatch[1] : '';
const categoryOrder = categoryOrderStr.match(/"([^"]+)"/g).map(c => c.replace(/"/g, ''));
console.log('categoryOrder in page.tsx:', categoryOrder);

// Extract distinct categories from registry
const catRegex = /\bcategory:\s*"([^"]+)"/g;
let m;
const regCats = new Set();
while ((m = catRegex.exec(regContent)) !== null) {
  regCats.add(m[1]);
}
console.log('\nCategories in registry:', Array.from(regCats));

// Find mismatches
const inPageNotReg = categoryOrder.filter(c => !regCats.has(c));
const inRegNotPage = Array.from(regCats).filter(c => !categoryOrder.includes(c));

console.log('\n🔴 In categoryOrder but NOT in registry:', inPageNotReg);
console.log('🔴 In registry but NOT in categoryOrder:', inRegNotPage);

// Count per category
const countPerCat = {};
const singleLineRegex = /slug:\s*"([^"]+)"[^}]*category:\s*"([^"]+)"/g;
while ((m = singleLineRegex.exec(regContent)) !== null) {
  countPerCat[m[2]] = (countPerCat[m[2]] || 0) + 1;
}
console.log('\nCount per category:');
Object.entries(countPerCat).sort((a, b) => b[1] - a[1]).forEach(([cat, cnt]) => {
  const flag = categoryOrder.includes(cat) ? '✅' : '❌';
  console.log(`  ${flag} ${cat}: ${cnt}`);
});
