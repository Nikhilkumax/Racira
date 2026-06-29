const fs = require('fs');
const path = require('path');

// Read polish_list.md and extract slugs
const polishContent = fs.readFileSync('polish_list.md', 'utf8');

// Extract all calculator names — they appear as bullet points like "• CalculatorName"
// or in lines starting with "  • CalcName" or just "CalcName —"
const slugs = [];
const lines = polishContent.split('\n');
for (const line of lines) {
  const match = line.match(/[•\-*]\s+([A-Z][a-zA-Z]+Calculator[a-zA-Z]*)/);
  if (match) slugs.push(match[1]);
}

// Write to _approved.json
const approvedPath = path.join(__dirname, 'src/calculators/_approved.json');
const data = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));
data.approved = [...new Set([...data.approved, ...slugs])];
fs.writeFileSync(approvedPath, JSON.stringify(data, null, 2));

console.log(`Added ${slugs.length} slugs to _approved.json`);
console.log('Slugs added:', slugs);
