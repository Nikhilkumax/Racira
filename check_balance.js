const fs = require('fs');
const content = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');
const lines = content.split('\n');
let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let char of line) {
    if (char === '{') balance++;
    if (char === '}') balance--;
  }
  if (balance < 0) {
    console.log(`Line ${i + 1}: Negative balance! (${balance})`);
  }
}
console.log(`Final balance: ${balance}`);
