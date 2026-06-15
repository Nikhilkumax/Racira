const fs = require('fs');
const file2 = './src/data/calculators/health.ts';
let content = fs.readFileSync(file2, 'utf8');
content = content.replace(/slug:\s*["']horse-calorie-calculator["'],([\s\S]*?)isBuilt:\s*false/, (match, p1) => {
    return 'slug: "horse-calorie-calculator",' + p1 + 'isBuilt: true';
});
fs.writeFileSync(file2, content);
console.log('Done!');
