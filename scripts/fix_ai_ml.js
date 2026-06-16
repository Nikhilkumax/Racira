const fs = require('fs');
let file = 'src/data/calculators/technology.ts';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/subcategory: "AI & Machine Learning"/g, 'subcategory: "Data Science & AI/ML"');
fs.writeFileSync(file, data);
console.log('Fixed AI & ML in technology.ts');
