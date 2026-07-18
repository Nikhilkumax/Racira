const fs = require('fs');
const text = fs.readFileSync('src/domains/insight/registry.ts', 'utf8');
const mkMatch = text.match(/mk\(/g);
console.log('Count:', mkMatch ? mkMatch.length : 0);
