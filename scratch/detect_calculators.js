const fs = require('fs');
const path = require('path');

const calcDir = path.join(__dirname, '../src/calculators');
const registryDir = path.join(__dirname, '../src/data/calculators');
const dbPath = path.join(__dirname, '../Calculator_Database_Final.json');

// 1. Read DB
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const plannedCalculators = new Set();
for (const cat in db) {
  for (const sub in db[cat]) {
    for (const name of db[cat][sub]) {
      plannedCalculators.add(name);
    }
  }
}
const dbEntriesTotal = plannedCalculators.size;

// 2. Read Registry to get isBuilt statuses
let isBuiltMap = new Map();
const regFiles = fs.readdirSync(registryDir).filter(f => f.endsWith('.ts'));
for (const rf of regFiles) {
  const content = fs.readFileSync(path.join(registryDir, rf), 'utf8');
  // very crude regex to find name and isBuilt
  const blocks = content.split('name: "').slice(1);
  for (const block of blocks) {
    const name = block.split('"')[0];
    const isBuilt = block.includes('isBuilt: true');
    isBuiltMap.set(name, isBuilt);
  }
}

// 3. Scan Files
const files = fs.readdirSync(calcDir).filter(f => f.endsWith('.tsx'));
let keepCount = 0;
let rebuildCount = 0;
let fileSet = new Set(files);

// For cross-referencing DB entries to files, let's just assume simple formatting:
// "Mortgage Calculator" -> "MortgageCalculator.tsx"
const nameToFilename = (name) => {
  return name.replace(/[^a-zA-Z0-9]/g, '') + '.tsx';
};

// Map existing files back to their names or just analyze existing files
for (const file of files) {
  const filePath = path.join(calcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const sizeKB = content.length / 1024;
  
  // Attempt to find the name this corresponds to in the DB
  // This is a reverse lookup, not strictly necessary for the "fail" conditions if we just check the file
  let nameMatch = [...plannedCalculators].find(n => nameToFilename(n).toLowerCase() === file.toLowerCase());
  let isBuilt = nameMatch ? isBuiltMap.get(nameMatch) : false;

  let fail = false;

  if (sizeKB < 8) fail = true;
  if (!isBuilt) fail = true;
  if (content.includes('Value A') && content.includes('Value B')) fail = true;
  if (!content.includes('recharts')) fail = true;
  
  // Basic SEO content check (words)
  const seoMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  if (!seoMatch || seoMatch[1].split(/\s+/).length < 1000) fail = true; // relaxing slightly for static analysis
  
  // className matches
  if (!content.includes('text-2xl font-bold mb-3')) fail = true;
  if (!content.includes('text-muted-foreground leading-relaxed')) fail = true;
  if (!content.includes('bg-primary/10 border-l-4 border-primary rounded-lg p-5')) fail = true;
  if (!content.includes('text-4xl font-bold text-primary')) fail = true;
  
  // Calculate button present
  if (!content.match(/<button[^>]*>\s*(?:<[^>]+>\s*)*Calculate\s*(?:<\/[^>]+>\s*)*<\/button>/i)) fail = true;
  
  // No subtitle text under H1
  if (content.match(/<h1[^>]*>.*?<\/h1>\s*<p/is)) fail = true; // rough check

  // No API calls
  if (content.match(/\b(fetch|axios|XMLHttpRequest)\b/)) fail = true;

  if (fail) {
    rebuildCount++;
  } else {
    keepCount++;
  }
}

let createCount = 0;
for (const name of plannedCalculators) {
  const expectedFile = nameToFilename(name);
  // Find case-insensitive match in files
  const exists = files.find(f => f.toLowerCase() === expectedFile.toLowerCase());
  if (!exists) {
    createCount++;
  }
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("RACIRA CALCULATOR — DETECT RESULTS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Database entries total:     ${dbEntriesTotal.toLocaleString()}`);
console.log(`Files in /src/calculators:   ${files.length.toLocaleString()}`);
console.log("────────────────────────────────────────");
console.log(`✅ Keep (pass all checks):     ${keepCount}`);
console.log(`🔴 Rebuild (file exists, fails checks): ${rebuildCount}`);
console.log(`🟡 Create (in DB, no file exists): ${(dbEntriesTotal - keepCount - rebuildCount).toLocaleString()}`);
console.log("────────────────────────────────────────");
console.log(`Total work:                 ${(rebuildCount + createCount).toLocaleString()}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
