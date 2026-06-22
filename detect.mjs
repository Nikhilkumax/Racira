import fs from 'fs';
import path from 'path';

const calculatorsDir = path.join(process.cwd(), 'src', 'calculators');
const dbDir = path.join(process.cwd(), 'calculator-database');
const registryDir = path.join(process.cwd(), 'src', 'data', 'calculators');

let dbEntries = [];
const categories = ['finance', 'business', 'health', 'math', 'science', 'engineering', 'technology', 'environment', 'everyday-life', 'transportation', 'construction', 'education'];

// Load DB
categories.forEach(cat => {
    const p = path.join(dbDir, `${cat}.json`);
    if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (data.subcategories) {
            Object.values(data.subcategories).forEach(sub => {
                if (sub.calculators) {
                    dbEntries.push(...sub.calculators);
                }
            });
        }
    }
});

const builtRegistrySlugs = new Set();
if (fs.existsSync(registryDir)) {
    const files = fs.readdirSync(registryDir).filter(f => f.endsWith('.ts'));
    files.forEach(f => {
        const content = fs.readFileSync(path.join(registryDir, f), 'utf-8');
        // crude parse
        const matches = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)];
        matches.forEach(m => {
            // Also need to know if isBuilt is true, but we can do a crude regex.
            const block = content.substring(content.indexOf(m[0]), content.indexOf(m[0]) + 300);
            if (block.includes('isBuilt: true')) {
                builtRegistrySlugs.add(m[1]);
            }
        });
    });
}

const dbMap = new Map();
dbEntries.forEach(c => dbMap.set(c.slug, c));

let keepCount = 0;
let polishCount = 0;
let rebuildCount = 0;
let createCount = 0;

const polishList = [];

function getPascalCase(str) {
    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Calculator';
}
function getPascalCase2(str) {
    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

const existingFiles = fs.readdirSync(calculatorsDir).filter(f => f.endsWith('.tsx'));
const existingFileNames = new Set(existingFiles.map(f => f.toLowerCase()));

const results = [];

dbEntries.forEach(entry => {
    const expectedName1 = getPascalCase(entry.slug) + '.tsx';
    const expectedName2 = getPascalCase2(entry.slug) + '.tsx';
    const expectedName3 = getPascalCase(entry.slug).replace('CalculatorCalculator', 'Calculator') + '.tsx';
    
    let foundFile = null;
    if (existingFileNames.has(expectedName1.toLowerCase())) {
        foundFile = existingFiles.find(f => f.toLowerCase() === expectedName1.toLowerCase());
    } else if (existingFileNames.has(expectedName2.toLowerCase())) {
        foundFile = existingFiles.find(f => f.toLowerCase() === expectedName2.toLowerCase());
    } else if (existingFileNames.has(expectedName3.toLowerCase())) {
        foundFile = existingFiles.find(f => f.toLowerCase() === expectedName3.toLowerCase());
    }

    if (!foundFile) {
        createCount++;
    } else {
        // Analyze file
        const p = path.join(calculatorsDir, foundFile);
        const stats = fs.statSync(p);
        const content = fs.readFileSync(p, 'utf-8');
        
        let failures = [];
        let isRebuild = false;
        
        // REBUILD conditions
        if (stats.size < 8000) {
            failures.push("File size < 8KB (stub/placeholder)");
            isRebuild = true;
        }
        if (!builtRegistrySlugs.has(entry.slug) && !entry.isBuilt) {
            // failures.push("isBuilt: false in registry");
        }
        if (!content.includes('recharts')) {
            failures.push("No Recharts chart component imported");
            isRebuild = true;
        }
        if (content.match(/fetch\(|axios\.|useSWR|react-query/)) {
            failures.push("Live API calls or network dependencies found");
            isRebuild = true;
        }
        
        // Content extraction for SEO
        const textContent = content.replace(/<[^>]*>?/gm, ' ');
        // simple word count approximation
        const words = content.split(/\s+/).length; 
        
        // SEO Section specific checks
        const seoMatch = content.match(/<section[^>]*>([\s\S]*?)<\/section>/gi);
        let maxWords = 0;
        let hasCardInSeo = false;
        let hasNumberedHeadings = false;
        if (seoMatch) {
            seoMatch.forEach(sec => {
                const innerWords = sec.replace(/<[^>]*>?/gm, ' ').split(/\s+/).length;
                if (innerWords > maxWords) maxWords = innerWords;
                if (sec.includes('bg-card') || sec.includes('border')) hasCardInSeo = true;
                if (sec.match(/<h[2-6][^>]*>\s*\d+\.\s/)) hasNumberedHeadings = true;
                if (sec.includes('<ul') || sec.includes('<ol')) hasNumberedHeadings = true; // bullets
            });
        }
        
        if (maxWords < 800) {
            failures.push(`SEO content under 800 words (~${maxWords} words)`);
            isRebuild = true;
        } else if (maxWords < 1500) {
            failures.push(`SEO word count is between 800–1499 words (~${maxWords} words)`);
        }
        if (hasCardInSeo || hasNumberedHeadings) {
            failures.push("SEO has numbered headings, bullets, or is inside a card/box");
        }
        
        if (!content.includes('bg-primary/10 border-l-4 border-primary rounded-lg p-5')) {
            failures.push("Primary Result Card wrapper className deviates from reference table");
            isRebuild = true;
        }
        if (!content.includes('text-2xl font-bold mb-3')) {
            failures.push("H2 className deviates from `text-2xl font-bold mb-3`");
        }
        
        // Subtitle check: roughly check if H1 has sibling p tag near it before calculator layout
        const h1Match = content.match(/<h1[^>]*>.*?<\/h1>\s*<p/g);
        if (h1Match) {
            failures.push("Subtitle text rendered under the H1");
        }
        
        if (!content.match(/<Button[^>]*>\s*Calculate\s*<\/Button>/) && !content.match(/<Button[^>]*>Calculate<\/Button>/)) {
            if (content.match(/<Button[^>]*>.*?Calculate.*?<\/Button>/i)) {
                failures.push("Calculate button label is not exactly 'Calculate'");
            } else {
                failures.push("Missing 'Calculate' button");
                isRebuild = true;
            }
        }
        
        if (content.includes('Value A') || content.includes('Value B')) {
             failures.push("Generic 'Value A / Value B' inputs found");
             isRebuild = true;
        }
        
        // Check banners
        if (content.match(/<Alert/)) {
            failures.push("Has a banner/alert box");
            isRebuild = true;
        }
        
        if (failures.length > 0) {
            if (isRebuild) {
                rebuildCount++;
                results.push({ type: '🔴 Rebuild', name: foundFile, failures });
            } else {
                polishCount++;
                polishList.push({ name: foundFile, failures });
                results.push({ type: '🟠 Polish', name: foundFile, failures });
            }
        } else {
            keepCount++;
            results.push({ type: '✅ Keep', name: foundFile, failures: [] });
        }
    }
});

// Write markdown
let md = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — DETECT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Database entries total:          ${dbEntries.length.toString().padStart(5, ' ')}
Files in /src/calculators:        ${existingFiles.length.toString().padStart(5, ' ')}
─────────────────────────────────────────────────────
✅ Keep   (pass all checks):        ${keepCount.toString().padStart(3, ' ')}
🟠 Polish  (core correct, surface issues only):  ${polishCount.toString().padStart(3, ' ')}
🔴 Rebuild (file exists, fails core checks):     ${rebuildCount.toString().padStart(3, ' ')}
🟡 Create  (in DB, no file exists):          ${createCount.toString().padStart(5, ' ')}
─────────────────────────────────────────────────────
Total work (Polish + Rebuild + Create):      ${(polishCount + rebuildCount + createCount).toString().padStart(5, ' ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟠 POLISH LIST (top 20 shown — full list in polish_list.md):
`;

polishList.slice(0, 20).forEach(p => {
    md += `  • ${p.name} — ${p.failures.slice(0, 5).join(', ')}\n`;
});

fs.writeFileSync('detect_results.md', md);
fs.writeFileSync('polish_list.md', polishList.map(p => `• ${p.name} — ${p.failures.join(', ')}`).join('\n'));

console.log("Done");
