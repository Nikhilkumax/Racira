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

// Fix B: H2 className in SEO sections
const h2Variants = new Map();
let h2FilesChanged = 0;

// Fix C: subtitle line under H1
let subtitleFilesChanged = 0;
const subtitleVariants = new Map();

for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix B: Find all <h2 className="..."> and check if className is not exactly "text-2xl font-bold mb-3"
    const h2Regex = /<h2\s+className="([^"]*)">/g;
    let m;
    let newContent = content;
    while ((m = h2Regex.exec(content)) !== null) {
        const className = m[1];
        if (className !== 'text-2xl font-bold mb-3') {
            const variant = className;
            if (!h2Variants.has(variant)) h2Variants.set(variant, []);
            h2Variants.get(variant).push(path.basename(filePath));
            newContent = newContent.replace(`className="${className}"`, 'className="text-2xl font-bold mb-3"');
            modified = true;
        }
    }

    if (modified) {
        h2FilesChanged++;
        content = newContent;
    }

    // Fix C: Find subtitle <p> or <span> immediately after <h1> and before the grid
    const subtitleRegex = /(<h1[^>]*>[\s\S]*?<\/h1>)\s*\n\s*<(p|span)\s+className="([^"]*)"[^>]*>[\s\S]*?<\/\2>\s*\n(\s*<div className="grid)/g;
    const subtitleMatch = subtitleRegex.exec(content);
    if (subtitleMatch) {
        const fullMatch = subtitleMatch[0];
        const h1Part = subtitleMatch[1];
        const gridPart = subtitleMatch[4];
        const className = subtitleMatch[3];
        subtitleVariants.set(className, (subtitleVariants.get(className) || 0) + 1);
        const newContent2 = content.replace(fullMatch, h1Part + '\n\n' + gridPart);
        content = newContent2;
        modified = true;
        subtitleFilesChanged++;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
    }
}

console.log('=== Fix B: H2 classNames ===');
console.log(`Files changed: ${h2FilesChanged}`);
console.log('Unique className variants replaced:');
for (const [variant, fileList] of h2Variants) {
    console.log(`  "${variant}" - ${fileList.length} occurrences`);
}

console.log('\n=== Fix C: Subtitle lines under H1 ===');
console.log(`Files changed: ${subtitleFilesChanged}`);
console.log('Unique className variants removed:');
for (const [variant, count] of subtitleVariants) {
    console.log(`  "${variant}" - ${count} occurrences`);
}