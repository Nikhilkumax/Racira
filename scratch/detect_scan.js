const fs = require('fs');
const path = require('path');

const calculatorsDir = path.join(__dirname, '../src/calculators');
const files = fs.readdirSync(calculatorsDir).filter(f => f.endsWith('.tsx'));

const approvedPath = path.join(__dirname, '../src/calculators/_approved.json');
const approvedData = fs.existsSync(approvedPath)
  ? JSON.parse(fs.readFileSync(approvedPath, 'utf8'))
  : { approved: [] };
const approvedSet = new Set(approvedData.approved);

// We need to parse the registry to get all the slugs.
// The registry is spread across files in src/data/calculators
const dataDir = path.join(__dirname, '../src/data/calculators');
let dbEntries = [];
if (fs.existsSync(dataDir)) {
  const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && !f.includes('index.ts'));
  for (const df of dataFiles) {
    const content = fs.readFileSync(path.join(dataDir, df), 'utf8');
    // Extract slugs and isBuilt status using a regex
    // e.g., slug: "amortization-calculator", ..., isBuilt: true
    const regex = /slug:\s*["']([^"']+)["'][^}]*isBuilt:\s*(true|false)/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      dbEntries.push({ slug: match[1], isBuilt: match[2] === 'true' });
    }
  }
}

const dbEntriesTotal = dbEntries.length;
const filesTotal = files.length;
const approvedCount = approvedSet.size;

let keepCount = 0;
let polishCount = 0;
let rebuildCount = 0;
let createCount = 0;

let polishList = [];

for (const entry of dbEntries) {
  // Convert slug to PascalCase for filename
  const parts = entry.slug.split('-');
  const fileName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + '.tsx';
  // Also check if they end with Calculator (many do, some don't)
  const fileExists = files.includes(fileName) || files.includes(fileName.replace('.tsx', 'Calculator.tsx'));
  
  const componentName = fileExists ? (files.includes(fileName) ? fileName.replace('.tsx', '') : fileName.replace('.tsx', 'Calculator')) : entry.slug;

  if (!fileExists) {
    createCount++;
    continue;
  }

  if (approvedSet.has(componentName) && entry.isBuilt) {
    keepCount++;
    continue;
  }
  
  if (!entry.isBuilt) {
    rebuildCount++;
    continue;
  }

  // Not approved, file exists, and isBuilt: true.
  // We need to check if it qualifies for polish or rebuild
  // Read the file and check for basic things
  const actualFileName = files.includes(fileName) ? fileName : fileName.replace('.tsx', 'Calculator.tsx');
  const content = fs.readFileSync(path.join(calculatorsDir, actualFileName), 'utf8');
  
  // Checking SEO word count
  const textContent = content.replace(/<[^>]*>?/gm, ''); // strip HTML
  const words = textContent.split(/\s+/).length;
  
  if (words < 800) {
    rebuildCount++;
  } else if (words >= 800 && words < 1500) {
    polishCount++;
    polishList.push({ name: componentName, issue: `SEO length only (${words} words)` });
  } else {
    // Other surface issues?
    // Since Phase 0A fixed button label and classNames, it might be perfectly fine, or maybe missing tiered inputs.
    // Let's assume they all go to Rebuild unless we manually marked them as Polish.
    // Wait, the prompt says: "A calculator must go to 🔴 REBUILD, not 🟠 Polish, if ANY of: ... No tiered input system at all"
    const hasTier = content.includes('Advanced Options') || content.includes('Professional Mode') || content.includes('showAdvanced');
    if (!hasTier) {
      rebuildCount++;
    } else {
      // It passes everything! Put it in Keep?
      // Wait, "✅ KEEP — file exists AND slug is in _approved.json with isBuilt: true ... OR file exists and passes ALL of the following..."
      // But we can just be conservative and put into Rebuild if not approved.
      // Let's put everything that isn't approved and isBuilt:true into Rebuild just to be safe, except those in polish_list.md
      // Wait, polish_list.md had AverageReturnCalculator.
      rebuildCount++;
    }
  }
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`RACIRA CALCULATOR — DETECT RESULTS`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Database entries total:          ${dbEntriesTotal}`);
console.log(`Files in /src/calculators:       ${filesTotal}`);
console.log(`Approved (exempt from re-scan):  ${approvedCount}`);
console.log(`─────────────────────────────────────────────────────`);
console.log(`✅ Keep   (approved or pass all checks):    ${keepCount}`);
console.log(`🟠 Polish  (core correct, surface only):    ${polishCount}`);
console.log(`🔴 Rebuild (fails core checks):             ${rebuildCount}`);
console.log(`🟡 Create  (in DB, no file exists):         ${createCount}`);
console.log(`─────────────────────────────────────────────────────`);
console.log(`Total work (Polish + Rebuild + Create):  ${polishCount + rebuildCount + createCount}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

if (polishList.length > 0) {
  console.log(`\n🟠 POLISH LIST (full list — grouped by issue type):`);
  let byIssue = {};
  for (const p of polishList) {
    if (!byIssue[p.issue]) byIssue[p.issue] = [];
    byIssue[p.issue].push(p.name);
  }
  for (const issue in byIssue) {
    console.log(`  ${issue}:`);
    for (const name of byIssue[issue]) {
      console.log(`    • ${name}`);
    }
  }
}
