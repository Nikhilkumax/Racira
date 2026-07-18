const fs = require('fs');
const text = fs.readFileSync('src/data/typography/tools.ts', 'utf8');
const count = [...text.matchAll(/\["[^"]+", "[^"]+"\]/g)].length;
console.log('Count:', count);
