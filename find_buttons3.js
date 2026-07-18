const fs = require('fs');
const path = require('path');

const CALC_DIR = 'src/domains/calculator/components';

function getAllTsFiles(dir) {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(getAllTsFiles(full));
        } else if (entry.name.endsWith('.tsx')) {
            files.push(full);
        }
    }
    return files;
}

const files = getAllTsFiles(CALC_DIR);
const variants = new Map();

for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const buttonRegex = /<button[^>]*>([\s\S]{1,120}?)<\/button>/g;
    let m;
    while ((m = buttonRegex.exec(content)) !== null) {
        const inner = m[1].trim().replace(/\s+/g, ' ');
        const textOnly = inner.replace(/<[^>]+\/>/g, '').replace(/<[^>]+>[^<]*<\/[^>]+>/g, '').trim();
        if (textOnly.toLowerCase().includes('calculate')) {
            if (!variants.has(textOnly)) variants.set(textOnly, []);
            variants.get(textOnly).push(path.basename(filePath));
        }
    }
}

console.log('All button labels containing "Calculate":');
for (const [label, fileList] of variants) {
    const isExact = label === 'Calculate';
    console.log(`  ${isExact ? 'OK' : 'FIX'} "${label}" - ${fileList.length} files`);
}
console.log(`\nTotal unique labels: ${variants.size}`);
console.log(`Files with exact "Calculate": ${variants.get('Calculate')?.length || 0}`);
console.log(`Files with variants needing fix: ${[...variants.entries()].filter(([l]) => l !== 'Calculate').reduce((s, [, f]) => s + f.length, 0)}`);