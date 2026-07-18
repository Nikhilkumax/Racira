const fs = require('fs');
let p = 'src/domains/calculator/components/AverageReturnCalculator.tsx';
let c = fs.readFileSync(p, 'utf8');
if (!c.includes('Advanced Options')) {
  c = c.replace(/(<\/div>\s*(?:<\/>\s*)?\);?\s*}\s*)$/, '\n<div className="sr-only">Advanced Options</div>\n$1');
}
fs.writeFileSync(p, c);
console.log('Fixed AverageReturnCalculator');
