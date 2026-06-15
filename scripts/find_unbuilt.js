const fs = require('fs');
const content = fs.readFileSync('./src/data/calculators/finance.ts', 'utf8');
const regex = /slug:\s*['"]([^'"]+)['"],[\s\S]*?isBuilt:\s*false/g;
let match;
const unbuilt = [];
while ((match = regex.exec(content)) !== null) {
    unbuilt.push(match[1]);
}
console.log(unbuilt);
