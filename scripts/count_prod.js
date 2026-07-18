const fs = require('fs');
const text = fs.readFileSync('src/data/productivity/tools.ts', 'utf8');
const count = [...text.matchAll(/\{ slug: "[^"]+", name: "[^"]+", description: "[^"]+", icon: [^,]+, status: "[^"]+" \}/g)].length;
console.log('Count:', count);
