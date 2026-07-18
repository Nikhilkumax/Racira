const fs = require('fs');
const text = fs.readFileSync('src/domains/crypto/registry.ts', 'utf8');
const mkMatch = text.match(/mk\(/g);
const pushMatch = text.match(/TOOLS\.push\(/g);
const arrayMatch = text.match(/const extraCategories = \[\s*([\s\S]*?)\];/);
let extraCount = 0;
if (arrayMatch) {
  const inner = arrayMatch[1];
  extraCount = (inner.match(/\[/g) || []).length;
}
console.log('Base mk() count:', mkMatch ? mkMatch.length : 0);
console.log('Extra categories count:', extraCount);
console.log('Total count:', (mkMatch ? mkMatch.length : 0) - (pushMatch ? pushMatch.length : 0) + extraCount);
