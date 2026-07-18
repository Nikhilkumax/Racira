const fs = require('fs');
const text = fs.readFileSync('src/domains/animator/registry.ts', 'utf8');
const matches = text.match(/mk\(/g);
console.log('Count:', matches ? matches.length : 0);
