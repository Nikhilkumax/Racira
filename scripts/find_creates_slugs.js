const fs = require('fs');
const path = require('path');

const financePath = path.join(process.cwd(), 'src', 'data', 'calculators', 'finance.ts');
const content = fs.readFileSync(financePath, 'utf8');

const regex = /slug:\s*['"]([^'"]+)['"]/g;
let match;
const slugs = [];
while ((match = regex.exec(content)) !== null) {
    if (!match[1].match(/^\d/)) {
        slugs.push(match[1]);
    }
}

function toPascalCase(str) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const srcDir = path.join(process.cwd(), 'src', 'calculators');
const files = new Set(fs.readdirSync(srcDir).map(f => f.replace('.tsx', '')));

const creates = slugs.filter(slug => !files.has(toPascalCase(slug)));
creates.sort((a, b) => a.localeCompare(b));

console.log(JSON.stringify(creates.slice(0, 4), null, 2));
console.log(creates.slice(0, 4).map(toPascalCase));
