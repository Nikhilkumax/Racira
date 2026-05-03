const fs = require('fs');
const content = fs.readFileSync('C:/Racira/racira-nextjs/src/data/calculatorRegistry.ts', 'utf8');
const allowed = ['Finance', 'Health', 'Math', 'Science', 'Everyday Life', 'Construction', 'Sports', 'Ecology', 'Technology', 'Education', 'Conversion', 'Automobile'];
const regex = /\bcategory:\s*"([^"]+)"/g;
let match;
const invalid = new Set();
while ((match = regex.exec(content)) !== null) {
  if (!allowed.includes(match[1])) invalid.add(match[1]);
}
console.log('Invalid categories:', Array.from(invalid));
