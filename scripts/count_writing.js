const fs = require('fs');
const text = fs.readFileSync('src/domains/writing/registry.ts', 'utf8');
const count = [...text.matchAll(/mk\("/g)].length;
console.log('Count:', count);
