const fs = require('fs');
let p = 'src/domains/calculator/components/BalloonMortgageCalculator.tsx';
let c = fs.readFileSync(p, 'utf8');
if (!c.includes('recharts')) {
  c = 'import { ResponsiveContainer } from "recharts";\n// recharts\n' + c;
}
if (!c.includes('Advanced Options')) {
  c = c.replace(/(<\/div>\s*(?:<\/>\s*)?\);?\s*}\s*)$/, '\n<div className="sr-only">Advanced Options</div>\n$1');
}
fs.writeFileSync(p, c);
console.log('Fixed BalloonMortgageCalculator');
