const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data/calculators');
const SUMMARY_FILE = path.join(ROOT, 'src/app/calculator/summaryData.ts');

let categoryFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));

let categoryOrder = [
  "FINANCE", "BUSINESS", "HEALTH", "MATH", "SCIENCE", 
  "ENGINEERING", "TECHNOLOGY", "ENVIRONMENT", "EVERYDAY_LIFE", 
  "TRANSPORTATION", "CONSTRUCTION", "EDUCATION"
];

let newSummary = [];
let allCalcs = [];

for (let file of categoryFiles) {
    let content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
    let lines = content.split('\n');
    for (let line of lines) {
        if (line.trim().startsWith('{') && line.includes('slug:') && line.includes('subcategory:')) {
            let catMatch = line.match(/category:\s*(["'])(.*?)\1/);
            let subMatch = line.match(/subcategory:\s*(["'])(.*?)\1/);
            if (catMatch && subMatch) {
                allCalcs.push({
                    category: catMatch[2],
                    subcategory: subMatch[2]
                });
            }
        }
    }
}

for (let cat of categoryOrder) {
    let catCalcs = allCalcs.filter(c => c.category === cat);
    let total = catCalcs.length;
    let subCounts = {};
    for (let c of catCalcs) {
        subCounts[c.subcategory] = (subCounts[c.subcategory] || 0) + 1;
    }
    let subcategories = Object.keys(subCounts).map(name => ({
        name, count: subCounts[name]
    })).sort((a, b) => b.count - a.count); // sort by count descending

    newSummary.push({
        category: cat,
        total,
        subcategories
    });
}

let summaryOut = "export const CATEGORY_SUMMARY = " + JSON.stringify(newSummary, null, 2) + ";\n";
fs.writeFileSync(SUMMARY_FILE, summaryOut, 'utf-8');
console.log("Updated summaryData.ts with new counts.");
