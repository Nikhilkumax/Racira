const fs = require('fs');
const text = fs.readFileSync('src/domains/colors/registry.ts', 'utf8');
const matches = text.match(/\{ slug:/g);
console.log('Count:', matches ? matches.length : 0);
