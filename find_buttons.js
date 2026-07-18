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
const labels = new Map();

for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const buttonRegex = /<button[^>]*>([^<]{1,60})<\/button>/g;
    let m;
    while ((m = buttonRegex.exec(content)) !== null) {
        const label = m[1].trim();
        if (label.toLowerCase().includes('calculate') || label === 'Compute' || label === 'Submit' || label === 'Get Results' || label === 'Get Result') {
            if (!labels.has(label)) labels.set(label, []);
            labels.get(label).push(path.basename(filePath));
        }
    }
}

console.log('Button labels found:');
for (const [label, fileList] of labels) {
    console.log(`  "${label}" — ${fileList.length} files (e.g. ${fileList.slice(0, 3).join(', ')})`);
}