const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'calculators');
const registryFile = path.join(__dirname, 'src', 'data', 'calculatorRegistry.ts');
const dbFile = path.join(__dirname, 'Calculator_Database_Final.json');

const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const registryContent = fs.readFileSync(registryFile, 'utf8');

// Parse registry to get isBuilt status
const isBuiltMap = {};
const registryRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?isBuilt:\s*(true|false)/g;
let match;
while ((match = registryRegex.exec(registryContent)) !== null) {
  isBuiltMap[match[1]] = match[2] === 'true';
}

let dbTotal = 0;
const dbItems = new Set();
Object.values(dbData).forEach(cat => {
    Object.values(cat).forEach(subcat => {
        dbTotal += subcat.length;
        subcat.forEach(calcName => dbItems.add(calcName));
    });
});

const approvedPath = path.join(__dirname, 'src', 'calculators', '_approved.json');
const approvedData = fs.existsSync(approvedPath)
  ? JSON.parse(fs.readFileSync(approvedPath, 'utf8'))
  : { approved: [] };
const approvedSet = new Set(approvedData.approved);

const files = fs.existsSync(srcDir) ? fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx')) : [];
const filesTotal = files.length;

let keepCount = 0;
let polishCount = 0;
let rebuildCount = 0;
let createCount = 0;

const polishList = [];
const rebuildList = [];

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const size = fs.statSync(filePath).size;
  const id = file.replace('.tsx', '');
  
  const isBuilt = isBuiltMap[id] !== undefined ? isBuiltMap[id] : true; // fallback
  
  // Approved + isBuilt: true → classify as Keep, skip all checks
  if (approvedSet.has(id) && isBuilt) {
    keepCount++;
    return;
  }
  
  let failingCore = [];
  let failingSurface = [];
  
  if (size < 8000) failingCore.push("File size < 8KB (stub)");
  if (!isBuilt) failingCore.push("isBuilt: false in registry");
  if (content.includes('valueA') && content.includes('valueB') && !content.includes('recharts')) {
      failingCore.push("Generic Value A / Value B inputs");
  }
  if (!content.includes('from "recharts"') && !content.includes("from 'recharts'")) failingCore.push("No Recharts chart component");
  
  // Extract SEO article text
  const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  let articleContent = "";
  if (articleMatch) {
      articleContent = articleMatch[1];
      const wordCount = articleContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount < 800) {
          failingCore.push(`SEO under 800 words (${wordCount} words)`);
      } else if (wordCount < 1500) {
          failingSurface.push(`SEO word count is between 800–1499 words (${wordCount})`);
      }
      
      if (articleContent.includes('<ul') || articleContent.includes('<ol') || articleContent.includes('<li')) {
          failingSurface.push("SEO has numbered headings, bullets");
      }
      if (articleContent.match(/className="card/i)) {
          failingSurface.push("SEO is inside a card/box");
      }
  } else {
      failingCore.push("No SEO content section");
  }
  
  if (!content.includes('text-2xl font-bold mb-3')) {
      failingSurface.push("H2 className deviates from text-2xl font-bold mb-3");
  }
  
  // Check subtitle under H1
  if (content.match(/<\/h1>\s*<p/i)) {
      failingSurface.push("Subtitle line exists under H1");
  }
  
  if (!content.includes('bg-primary/10 border-l-4 border-primary rounded-lg p-5')) {
      failingCore.push("Primary Result Card className does not match exactly");
  }
  
  if (!content.match(/>Calculate<\/button>/)) {
      failingSurface.push("Calculate button label is not exactly Calculate");
  }
  
  if (content.includes('fetch(') || content.includes('axios.')) {
      failingCore.push("Live API calls or network dependencies");
  }
  
  if (failingCore.length > 0) {
      rebuildCount++;
      rebuildList.push({ name: id, errors: failingCore });
  } else if (failingSurface.length > 0) {
      polishCount++;
      polishList.push({ name: id, errors: failingSurface });
  } else {
      keepCount++;
  }
});

createCount = dbTotal - filesTotal;
if (createCount < 0) createCount = 0;

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — DETECT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Database entries total:          ${dbTotal.toLocaleString()}
Files in /src/calculators:        ${filesTotal.toLocaleString()}
Approved (exempt from re-scan):     ${approvedSet.size.toLocaleString()}
─────────────────────────────────────────────────────
✅ Keep   (pass all checks):        ${keepCount.toLocaleString()}
🟠 Polish  (core correct, surface issues only):  ${polishCount.toLocaleString()}
🔴 Rebuild (file exists, fails core checks):     ${rebuildCount.toLocaleString()}
🟡 Create  (in DB, no file exists):          ${createCount.toLocaleString()}
─────────────────────────────────────────────────────
Total work (Polish + Rebuild + Create):      ${(polishCount + rebuildCount + createCount).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

if (polishList.length > 0) {
    fs.writeFileSync('polish_list.md', polishList.map(p => `  • ${p.name} — ${p.errors.join(', ')}`).join('\n'));
    console.log(`\n🟠 POLISH LIST (top 20 shown — full list in polish_list.md):`);
    polishList.slice(0, 20).forEach(p => {
        console.log(`  • ${p.name} — ${p.errors.join(', ')}`);
    });
}

if (rebuildList.length > 0) {
    console.log(`\n🔴 REBUILD LIST (top 5 shown):`);
    rebuildList.slice(0, 5).forEach(r => {
        console.log(`  • ${r.name} — ${r.errors.join(', ')}`);
    });
}
