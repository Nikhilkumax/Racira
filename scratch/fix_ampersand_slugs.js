const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function replaceInFile(filePath, searchRegex, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (searchRegex.test(content)) {
    const updated = content.replace(searchRegex, replacement);
    fs.writeFileSync(filePath, updated);
    console.log(`Updated ${filePath}`);
  }
}

// 1. Fix TS Registry files
const TS_DIR = path.join(ROOT, 'src', 'data', 'calculators');
replaceInFile(path.join(TS_DIR, 'finance.ts'), /r&d-tax-credit-calculator/g, 'r-and-d-tax-credit-calculator');
replaceInFile(path.join(TS_DIR, 'engineering.ts'), /gd&t-tolerance-calculator/g, 'gd-and-t-tolerance-calculator');
replaceInFile(path.join(TS_DIR, 'engineering.ts'), /gauge-r&r-calculator/g, 'gauge-r-and-r-calculator');

// 2. Fix JSON Database files
const DB_DIR = path.join(ROOT, 'calculator-database');
replaceInFile(path.join(DB_DIR, 'finance.json'), /r&d-tax-credit-calculator/g, 'r-and-d-tax-credit-calculator');
replaceInFile(path.join(DB_DIR, 'engineering.json'), /gd&t-tolerance-calculator/g, 'gd-and-t-tolerance-calculator');
replaceInFile(path.join(DB_DIR, 'engineering.json'), /gauge-r&r-calculator/g, 'gauge-r-and-r-calculator');

// Also fix the compiled final DB if it exists
const MASTER_DB = path.join(ROOT, 'Calculator_Database_Final.json');
if (fs.existsSync(MASTER_DB)) {
  replaceInFile(MASTER_DB, /r&d-tax-credit-calculator/g, 'r-and-d-tax-credit-calculator');
  replaceInFile(MASTER_DB, /gd&t-tolerance-calculator/g, 'gd-and-t-tolerance-calculator');
  replaceInFile(MASTER_DB, /gauge-r&r-calculator/g, 'gauge-r-and-r-calculator');
}
