/**
 * BUILD MASTER DATABASE
 * 
 * Merges all calculator-database/*.json files
 * into Calculator_Database_Final.json
 * 
 * Usage: node build_master_database.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DB_DIR = path.join(ROOT, 'calculator-database');
const OUTPUT = path.join(ROOT, 'Calculator_Database_Final.json');

const FILES = [
  'finance.json', 'business.json', 'health.json', 'math.json',
  'science.json', 'engineering.json', 'technology.json', 'environment.json',
  'everyday-life.json', 'transportation.json', 'construction.json', 'education.json'
];

const master = {};
let total = 0;

for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(path.join(DB_DIR, file), 'utf-8'));
  const cat = data.category;
  master[cat] = {};
  
  for (const [subcat, calcs] of Object.entries(data.subcategories)) {
    master[cat][subcat] = calcs.map(c => c.name);
    total += calcs.length;
  }
  console.log(`${file}: ${Object.values(data.subcategories).reduce((s, a) => s + a.length, 0)} calculators`);
}

fs.writeFileSync(OUTPUT, JSON.stringify(master, null, 2));
console.log(`\n✅ Calculator_Database_Final.json regenerated with ${total} calculators`);

// Update metadata
const meta = JSON.parse(fs.readFileSync(path.join(DB_DIR, 'metadata.json'), 'utf-8'));
meta.totalCalculators = total;
meta.lastRebuilt = new Date().toISOString();
fs.writeFileSync(path.join(DB_DIR, 'metadata.json'), JSON.stringify(meta, null, 2));
console.log('✅ metadata.json updated');
