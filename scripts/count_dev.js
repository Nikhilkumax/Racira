const fs = require('fs');
const text = fs.readFileSync('src/data/developers/tools.ts', 'utf8');
const count = [...text.matchAll(/\["[^"]+", [A-Za-z0-9]+, "[^"]+"\]/g)].length;
console.log('Count:', count);
