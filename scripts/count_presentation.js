const fs = require('fs');
const text = fs.readFileSync('src/data/presentation/tools.ts', 'utf8');
const matches = [...text.matchAll(/mk\(/g)];
console.log('Count:', matches.length);
