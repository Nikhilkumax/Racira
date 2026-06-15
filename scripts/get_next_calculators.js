const fs = require('fs');
const c = fs.readFileSync('src/data/calculators/health.ts', 'utf8');
const regex = /slug:\s*"([^"]+)",\s*name:\s*"([^"]+)"[\s\S]*?isBuilt:\s*false/g;
let match;
let count = 0;
while ((match = regex.exec(c)) !== null && count < 5) {
  // Ensure we didn't jump to the next object by checking if there's a '{' or '}' in between
  // A better way is to just grab the first 5 matches that have `isBuilt: false`
  console.log(`${match[1]} - ${match[2]}`);
  count++;
}
