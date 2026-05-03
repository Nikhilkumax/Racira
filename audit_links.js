const fs = require('fs');

// Check all links in page.tsx for <a> tags that should be next/link
const pageContent = fs.readFileSync('src/app/calculator/page.tsx', 'utf8');
const aTagMatches = pageContent.match(/<a\s[^>]*href[^>]*>/g) || [];
console.log('=== <a> tags in page.tsx (should be next/link) ===');
aTagMatches.forEach(t => console.log(' ', t.substring(0, 100)));

// Check SearchCalculators
const searchContent = fs.readFileSync('src/components/SearchCalculators.tsx', 'utf8');
const aTagsSearch = searchContent.match(/<a\s[^>]*href[^>]*>/g) || [];
console.log('\n=== <a> tags in SearchCalculators.tsx ===');
aTagsSearch.forEach(t => console.log(' ', t.substring(0, 100)));

// Check ComingSoonPage
const comingContent = fs.readFileSync('src/components/ComingSoonPage.tsx', 'utf8');
const aTagsComing = comingContent.match(/<a\s[^>]*href[^>]*>/g) || [];
console.log('\n=== <a> tags in ComingSoonPage.tsx ===');
aTagsComing.forEach(t => console.log(' ', t.substring(0, 100)));

// Check getCategoryIcon function has correct category keys
const regContent = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');
console.log('\n=== getCategoryIcon mapping ===');
const iconFnMatch = regContent.match(/getCategoryIcon[\s\S]*?return icons\[category\]/);
if (iconFnMatch) {
  console.log(iconFnMatch[0].substring(0, 500));
}
