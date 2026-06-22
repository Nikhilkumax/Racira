const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/calculators');
const dbDir = path.join(__dirname, '../calculator-database');
const registryDir = path.join(__dirname, '../src/data/calculators');

let dbEntriesTotal = 0;
let filesInSrc = 0;
let keepCount = 0;
let rebuildCount = 0;
let createCount = 0;

// Read all JSON files in calculator-database
const dbFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'metadata.json');
const allSlugs = new Set();
const registryBuiltStatus = new Map();

for (const file of dbFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(dbDir, file), 'utf8'));
    if (data.subcategories) {
        for (const sub of Object.values(data.subcategories)) {
            for (const calc of sub.calculators) {
                allSlugs.add(calc.slug);
                registryBuiltStatus.set(calc.slug, calc.isBuilt);
            }
        }
    }
}
dbEntriesTotal = allSlugs.size;

// Helper to convert PascalCase filename to kebab-case slug
function toSlug(filename) {
    return filename.replace('.tsx', '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
}

const calcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));
filesInSrc = calcFiles.length;

for (const file of calcFiles) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const size = fs.statSync(filePath).size;
    
    // It's hard to perfectly match filename to slug without the registry,
    // but we can check the file contents for generic rules
    let isRebuild = false;

    // Rule 1: File size < 8KB
    if (size < 8000) isRebuild = true;

    // Rule 2: Recharts imported
    if (!content.includes('recharts')) isRebuild = true;

    // Rule 3: SEO Content - we can approximate by file size or specific SEO tags
    // Let's check for minimum word count or something. A full page with 1500 words is large.
    if (size < 15000) isRebuild = true; // Rough proxy for 1500 words + code

    // Rule 4: className exact strings
    if (!content.includes('text-2xl font-bold mb-3')) isRebuild = true;
    if (!content.includes('bg-primary/10 border-l-4 border-primary rounded-lg p-5')) isRebuild = true;

    // Rule 5: Calculate button exactly "Calculate"
    // We check for variants that are wrong, or ensure <Button...>Calculate</Button> exists
    if (!content.match(/>\s*Calculate\s*<\/Button>/) && !content.match(/>Calculate<\/button>/)) {
        isRebuild = true;
    }

    // Rule 6: No live API calls
    if (content.includes('fetch(') || content.includes('axios')) isRebuild = true;

    // Rule 7: Registry says not built
    // Just finding the slug might be imperfect, but we'll try
    let matchedSlug = null;
    for (const slug of allSlugs) {
        if (content.toLowerCase().includes(slug.replace(/-/g, ''))) {
            matchedSlug = slug;
            break;
        }
    }
    
    // fallback to heuristic
    if (!matchedSlug) {
        matchedSlug = toSlug(file);
    }
    
    if (registryBuiltStatus.has(matchedSlug) && registryBuiltStatus.get(matchedSlug) === false) {
        isRebuild = true;
    }

    // We can also check for dummy math
    if (content.includes('valueA') || content.includes('valueB') || content.includes('Dummy')) {
        isRebuild = true;
    }

    if (isRebuild) {
        rebuildCount++;
    } else {
        keepCount++;
    }
}

// Calculate CREATE
createCount = dbEntriesTotal - keepCount - rebuildCount;
if (createCount < 0) createCount = 0; // fallback if mappings mismatch
// Actually, CREATE is simply entries in DB that don't have a matching Keep or Rebuild
// Since we iterated files to find keep/rebuild, Create = dbEntriesTotal - (files that match a DB entry)
// Let's just estimate it as dbEntriesTotal - keepCount - rebuildCount.
// Or more accurately: files in src vs db entries.
createCount = dbEntriesTotal - calcFiles.length; // Approximate, but maybe some files aren't in DB

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`RACIRA CALCULATOR — DETECT RESULTS`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Database entries total:     ${dbEntriesTotal.toLocaleString()}`);
console.log(`Files in /src/calculators:   ${filesInSrc.toLocaleString()}`);
console.log(`────────────────────────────────────────`);
console.log(`✅ Keep (pass all checks):     ${keepCount.toLocaleString()}`);
console.log(`🔴 Rebuild (file exists, fails checks): ${rebuildCount.toLocaleString()}`);
console.log(`🟡 Create (in DB, no file exists): ${(dbEntriesTotal - filesInSrc > 0 ? dbEntriesTotal - filesInSrc : createCount).toLocaleString()}`);
console.log(`────────────────────────────────────────`);
console.log(`Total work:                 ${(rebuildCount + (dbEntriesTotal - filesInSrc)).toLocaleString()}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
