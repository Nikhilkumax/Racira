const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

const str = '\n  // ══════════════════════════════════════════════\n  // 🏁 EXACTLY 980\n  // ══════════════════════════════════════════════\n  { slug: "horsepower-to-kilowatts-calculator", name: "Horsepower to Kilowatts Calculator", description: "Convert mechanical or electrical horsepower to kilowatts.", category: "Conversion", subcategory: "Power", icon: Calculator, isBuilt: false },\n';

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');

const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`📊 Total registry count: ${finalCount}`);
