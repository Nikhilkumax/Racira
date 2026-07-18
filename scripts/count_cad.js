const fs = require('fs');
const text = fs.readFileSync('./src/domains/cad/registry.ts', 'utf8');
const toolRegex = /\[\s*"([^"]+)",\s*"([^"]+)"\s*\]/g;
let match;
let count = 0;
while ((match = toolRegex.exec(text)) !== null) count++;
console.log(`Regex tool count: ${count}`);
