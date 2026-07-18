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
const noCalculate = [];

for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasCalculate = /<button[^>]*>[^<]*Calculate[^<]*<\/button>/.test(content) ||
        /<button[^>]*>[\s\S]*?Calculate[\s\S]*?<\/button>/.test(content);
    if (!hasCalculate) {
        const buttonRegex = /<button[^>]*>([\s\S]{1,200}?)<\/button>/g;
        let m;
        const btnLabels = [];
        while ((m = buttonRegex.exec(content)) !== null) {
            const label = m[1].trim().replace(/\s+/g, ' ').substring(0, 80);
            if (label.length > 0 && !label.includes('RotateCcw') && !label.includes('ChevronDown') && !label.includes('Yearly') && !label.includes('Monthly') && !label.includes('Print')) {
                btnLabels.push(label);
            }
        }
        noCalculate.push({ file: path.basename(filePath), labels: btnLabels });
    }
}

console.log(`Files without "Calculate" button: ${noCalculate.length}`);
for (const item of noCalculate.slice(0, 50)) {
    console.log(`  ${item.file}: ${item.labels.length > 0 ? item.labels.join(' | ') : 'NO BUTTONS FOUND'}`);
}