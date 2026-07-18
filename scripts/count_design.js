const fs = require('fs');
const text = fs.readFileSync('src/domains/design/registry.ts', 'utf8');
const mkMatch = text.match(/t\(/g);
console.log('Count:', mkMatch ? mkMatch.length : 0);
