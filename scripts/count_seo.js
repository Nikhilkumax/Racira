const fs = require('fs');
const text = fs.readFileSync('src/domains/seo/registry.ts', 'utf8');
const matches = text.match(/tools: \[\s*([\s\S]+?)\s*\]/g);
let c = 0;
matches.forEach(x => c += [...x.matchAll(/"([^"]+)"/g)].length);
console.log('Count:', c);
