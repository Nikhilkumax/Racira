const fs = require('fs');
const content = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');

// Count unique slug occurrences more carefully
// Use line-by-line approach to count objects
const lines = content.split('\n');
const slugLines = lines.filter(l => l.includes('slug:') && l.includes('name:'));
console.log('Lines with slug+name:', slugLines.length);

// Also count via regex on full content (single line objects)
const singleLineRegex = /slug:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
let m;
const entries = [];
while ((m = singleLineRegex.exec(content)) !== null) {
  entries.push({ slug: m[1], name: m[2] });
}
console.log('Total entries found:', entries.length);

// Check for fake entries (numbered tools)
const fakeEntries = entries.filter(e => /\d+$/.test(e.slug));
console.log('\nEntries with numbered slugs:', fakeEntries.length);
if (fakeEntries.length > 0) {
  fakeEntries.slice(0, 10).forEach(e => console.log(' ', e.slug, '->', e.name));
}

// Check distinct categories
const cats = new Set(entries.map(e => {
  const catMatch = content.substring(content.indexOf(`slug: "${e.slug}"`)).match(/category:\s*"([^"]+)"/);
  return catMatch ? catMatch[1] : 'unknown';
}));
console.log('\nCategories found:', Array.from(cats));

// Check isBuilt count
const builtCount = (content.match(/isBuilt:\s*true/g) || []).length;
console.log('\nBuilt calculators:', builtCount);
console.log('Coming soon:', entries.length - builtCount);
