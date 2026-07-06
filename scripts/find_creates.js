const fs = require('fs');
const path = require('path');

const dbFile = path.join(process.cwd(), 'Calculator_Database_Final.json');
const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const srcDir = path.join(process.cwd(), 'src', 'calculators');
const files = fs.existsSync(srcDir) ? new Set(fs.readdirSync(srcDir).map(f => f.replace('.tsx', ''))) : new Set();

let creates = [];
const finCat = dbData['FINANCE'];
if (finCat) {
    Object.keys(finCat).forEach(subcat => {
        finCat[subcat].forEach(calcName => {
            if (!files.has(calcName)) {
                creates.push(calcName);
            }
        });
    });
}

creates.sort((a, b) => a.localeCompare(b));
console.log(JSON.stringify(creates.slice(0, 4), null, 2));
