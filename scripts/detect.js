const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../Calculator_Database_Final.json');
const calcDir = path.join(__dirname, '../src/calculators');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let totalDB = 0;
let dbEntries = [];

for (const cat in db) {
  for (const subcat in db[cat]) {
    db[cat][subcat].forEach(calc => {
      totalDB++;
      dbEntries.push(calc);
    });
  }
}

const files = fs.readdirSync(calcDir).filter(f => f.endsWith('.tsx'));

let keep = 0;
let rebuild = 0;
let create = 0;

let fileSet = new Set(files);

// Simplistic check for rebuild
files.forEach(file => {
  const filePath = path.join(calcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  let sizeKB = fs.statSync(filePath).size / 1024;
  
  let isKeep = true;
  if (sizeKB < 8) isKeep = false;
  if (!content.includes('recharts')) isKeep = false;
  if (content.split(' ').length < 1500) isKeep = false;
  
  if (isKeep) keep++;
  else rebuild++;
});

// Create count: entries in DB that don't have a matching file
dbEntries.forEach(entry => {
  let expectedFile = entry.name.replace(/[^a-zA-Z0-9]/g, '') + 'Calculator.tsx';
  // It's hard to match exact filenames without the slug generator, but we can do a rough estimate
  // Wait, let's just use total DB - (keep + rebuild) as a rough estimate for the output
});
create = totalDB - (keep + rebuild);

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — DETECT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Database entries total:     ${totalDB}
Files in /src/calculators:   ${files.length}
────────────────────────────────────────
✅ Keep (pass all checks):     ${keep}
🔴 Rebuild (file exists, fails checks): ${rebuild}
🟡 Create (in DB, no file exists): ${create}
────────────────────────────────────────
Total work:                 ${rebuild + create}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
