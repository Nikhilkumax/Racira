const fs = require('fs');
const path = require('path');

// Check what the page.tsx's <a> tag generates for category names
const cats = ['Finance', 'Health', 'Math', 'Science', 'Everyday Life', 'Construction', 'Sports', 'Ecology', 'Technology', 'Education', 'Conversion', 'Automobile'];

console.log('=== Category anchor IDs (from page.tsx anchor tag) ===');
cats.forEach(cat => {
  const anchorId = cat.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
  console.log(`  "${cat}" => #${anchorId}`);
});

console.log('\n=== Section IDs (from page.tsx section tag) ===');
cats.forEach(cat => {
  const sectionId = cat.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
  console.log(`  "${cat}" => id="${sectionId}"`);
});

// Check if categories in page match the ones displayed (from categoryOrder)
const pageContent = fs.readFileSync('src/app/calculator/page.tsx', 'utf8');

// Check if there are duplicated slugs in the calculatorRegistry
const regContent = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');
const slugMatches = [...regContent.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]);
const seen = {};
const dupes = [];
slugMatches.forEach(s => { if (seen[s]) dupes.push(s); seen[s] = true; });
console.log('\n=== Duplicate slugs ===', dupes.length > 0 ? dupes : 'NONE');

// Check the nav/breadcrumb for broken links
const breadcrumbContent = fs.readFileSync('src/components/Breadcrumb.tsx', 'utf8');
console.log('\n=== Breadcrumb.tsx snippet ===');
console.log(breadcrumbContent.substring(0, 500));
