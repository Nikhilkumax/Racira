const fs = require('fs');
const text = fs.readFileSync('src/domains/music/registry.ts', 'utf8');
const lines = text.split('\n');
const count = lines.filter(line => line.includes('[\"')).length;
console.log(count);
