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
console.log(`Scanning ${files.length} .tsx files in ${CALC_DIR}...`);

let fixAChanged = 0;
const fixAVariants = new Set();
let fixBChanged = 0;
const fixBVariants = new Set();
let fixCChanged = 0;

for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let aChanged = false;
    let bChanged = false;
    let cChanged = false;

    // ===== FIX A: Calculate Button Label =====
    const buttonLabelRegex = />(\s*Calculate\s+[^<]+?)</g;
    let aMatch;
    while ((aMatch = buttonLabelRegex.exec(content)) !== null) {
        const fullLabel = aMatch[1].trim();
        if (fullLabel !== 'Calculate' && fullLabel.toLowerCase().startsWith('calculate')) {
            fixAVariants.add(fullLabel);
            content = content.replace(aMatch[0], '>Calculate<');
            modified = true;
            aChanged = true;
        }
    }
    const altLabels = ['Get Results', 'Compute', 'Submit', 'Calculate Now', 'Get Result'];
    for (const alt of altLabels) {
        const altRegex = new RegExp(`>(\\s*${alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*)<`, 'g');
        let altMatch;
        while ((altMatch = altRegex.exec(content)) !== null) {
            const beforeText = content.substring(Math.max(0, altMatch.index - 200), altMatch.index);
            if (beforeText.includes('<button') || beforeText.includes('onClick')) {
                fixAVariants.add(altMatch[1].trim());
                content = content.replace(altMatch[0], '>Calculate<');
                modified = true;
                aChanged = true;
            }
        }
    }

    // ===== FIX B: H2 className in SEO sections =====
    const h2Regex = /<h2\s+className="([^"]*)">/g;
    let bMatch;
    while ((bMatch = h2Regex.exec(content)) !== null) {
        const className = bMatch[1];
        if (className !== 'text-2xl font-bold mb-3') {
            const afterText = content.substring(bMatch.index);
            const beforeText = content.substring(0, bMatch.index);
            if (beforeText.includes('grid') && (afterText.includes('leading-relaxed') || beforeText.includes('prose') || beforeText.includes('mt-12') || beforeText.includes('mt-8'))) {
                fixBVariants.add(className);
                content = content.replace(bMatch[0], '<h2 className="text-2xl font-bold mb-3">');
                modified = true;
                bChanged = true;
            }
        }
    }

    // ===== FIX C: Subtitle line under H1 =====
    const subtitleRegex = /(<\/h1>\s*\n)\s*<(?:p|span)\s+className="[^"]*text-muted-foreground[^"]*"[^>]*>[\s\S]*?<\/(?:p|span)>\s*(\n\s*<div\s+className="[^"]*grid)/g;
    let cMatch;
    while ((cMatch = subtitleRegex.exec(content)) !== null) {
        content = content.replace(cMatch[0], cMatch[1] + cMatch[2]);
        modified = true;
        cChanged = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        if (aChanged) fixAChanged++;
        if (bChanged) fixBChanged++;
        if (cChanged) fixCChanged++;
    }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('GLOBAL FIX COMPLETE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Fix A (button labels):    ${fixAChanged} files changed`);
console.log(`  Variants replaced: ${fixAVariants.size > 0 ? [...fixAVariants].join(', ') : 'none'}`);
console.log(`Fix B (H2 classNames):    ${fixBChanged} files changed`);
console.log(`  Variants replaced: ${fixBVariants.size > 0 ? [...fixBVariants].join(' | ') : 'none'}`);
console.log(`Fix C (subtitle lines):   ${fixCChanged} files changed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');