const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src', 'calculators');
const files = fs.existsSync(srcDir) ? fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx')) : [];

let fixA_count = 0;
let fixB_count = 0;
let fixC_count = 0;

const fixAVariants = new Set();
const fixBVariants = new Set();

files.forEach(file => {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix A: Calculate Button Label
    // Look for <button ...> something </button> that contains 'Calculate' or 'Compute' or 'Submit' or 'Get Results'
    // Usually it has a className containing "w-full" or "bg-primary".
    // Alternatively, just replace any text inside <button...>...Calculate...</button> to <button...>Calculate</button>
    // A regex to find the button label:
    // This matches a button with some classes and a label that isn't exactly "Calculate"
    const buttonRegex = /<button([^>]*(?:onClick|type="submit"|bg-primary)[^>]*)>([^<]*(?:Calculate|Compute|Submit|Get Results|Get result|Calculate Results)[^<]*)<\/button>/gi;
    content = content.replace(buttonRegex, (match, attrs, label) => {
        const trimmedLabel = label.trim();
        if (trimmedLabel !== 'Calculate' && !trimmedLabel.includes('<')) {
            if (!modified) { modified = true; }
            fixAVariants.add(trimmedLabel);
            return `<button${attrs}>Calculate</button>`;
        }
        return match;
    });

    // Fix B: H2 className in SEO Sections
    // The SEO section usually contains <h2 className="...">...</h2>
    // Let's replace any <h2 className="..."> with <h2 className="text-2xl font-bold mb-3">
    const h2Regex = /<h2\s+className="([^"]+)"/g;
    content = content.replace(h2Regex, (match, className) => {
        if (className !== 'text-2xl font-bold mb-3') {
            if (!modified) { modified = true; }
            fixBVariants.add(className);
            return `<h2 className="text-2xl font-bold mb-3"`;
        }
        return match;
    });

    // Fix C: Subtitle Line Under H1
    // <h1 ...>...</h1>\s*<p className="text-sm text-muted-foreground[^"]*">...</p>\s*<div className="grid
    const subtitleRegex = /(<h1[^>]*>[\s\S]*?<\/h1>)\s*<(?:p|span)[^>]*className="text-sm text-muted-foreground[^"]*"[^>]*>[\s\S]*?<\/(?:p|span)>\s*(<div[^>]*className="[^"]*grid)/g;
    const initialContent = content;
    content = content.replace(subtitleRegex, '$1\n        $2');
    if (content !== initialContent) {
        fixC_count++;
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        // We need to count files, not replacements, so we just check if it changed at all
        if (initialContent !== content) {
            // We can check which fix applied
        }
    }
});

// Since the loop above checks changes collectively, let's recount accurately.
// Actually, I should count per file exactly.
fixA_count = 0;
fixB_count = 0;
fixC_count = 0;

files.forEach(file => {
    const filePath = path.join(srcDir, file);
    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    const buttonRegex = /<button([^>]*(?:onClick|type="submit"|bg-primary)[^>]*)>\s*([^<]*(?:Calculate|Compute|Submit|Get Results|Get result|Calculate Results)[^<]*?)\s*<\/button>/gi;
    let fileFixA = false;
    content = content.replace(buttonRegex, (match, attrs, label) => {
        const trimmedLabel = label.trim();
        if (trimmedLabel !== 'Calculate' && !trimmedLabel.includes('<')) {
            fileFixA = true;
            fixAVariants.add(trimmedLabel);
            return `<button${attrs}>Calculate</button>`;
        }
        return match;
    });
    if (fileFixA) fixA_count++;

    let fileFixB = false;
    const h2Regex = /<h2\s+className="([^"]+)"/g;
    content = content.replace(h2Regex, (match, className) => {
        if (className !== 'text-2xl font-bold mb-3') {
            fileFixB = true;
            fixBVariants.add(className);
            return `<h2 className="text-2xl font-bold mb-3"`;
        }
        return match;
    });
    if (fileFixB) fixB_count++;

    let fileFixC = false;
    const subtitleRegex = /(<h1[^>]*>[\s\S]*?<\/h1>)\s*<(?:p|span)[^>]*>[\s\S]*?<\/(?:p|span)>\s*(<div[^>]*className="[^"]*grid)/g;
    content = content.replace(subtitleRegex, (match, p1, p2) => {
        fileFixC = true;
        return `${p1}\n\n        ${p2}`;
    });
    if (fileFixC) fixC_count++;

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`GLOBAL FIX COMPLETE`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Fix A (button labels):    ${fixA_count} files changed`);
console.log(`Fix B (H2 classNames):    ${fixB_count} files changed`);
console.log(`Fix C (subtitle lines):   ${fixC_count} files changed`);
console.log(`Fix A variants:`, Array.from(fixAVariants));
console.log(`Fix B variants:`, Array.from(fixBVariants));

// Run Build
console.log(`Building project...`);
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`Build: ✅ clean / ⚠️ [0 errors fixed]`);
} catch (e) {
    console.log(`Build failed, need to fix TS errors`);
}
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
