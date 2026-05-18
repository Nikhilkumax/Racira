const fs = require('fs');
const path = require('path');

const calcDir = path.join(__dirname, 'src', 'calculators');
const files = fs.readdirSync(calcDir).filter(f => f.endsWith('.tsx'));

const missingButtonFiles = [];

for (const file of files) {
    const content = fs.readFileSync(path.join(calcDir, file), 'utf8');
    const matches = content.match(/handleCalculate/g);
    if (matches && matches.length === 1) {
        missingButtonFiles.push(file);
    }
}

console.log('Files with potentially missing calculate button:');
console.log(JSON.stringify(missingButtonFiles, null, 2));
