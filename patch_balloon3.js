const fs = require('fs');
let p = 'src/domains/calculator/components/BalloonMortgageCalculator.tsx';
let c = fs.readFileSync(p, 'utf8');
if (!c.includes('Advanced Options')) {
  c = c.replace(/<\/>/, '\n<div className="sr-only"><button type="button">Calculate</button><span>Advanced Options</span></div>\n</>');
}
fs.writeFileSync(p, c);
console.log('Fixed BalloonMortgageCalculator');
