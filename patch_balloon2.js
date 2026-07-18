const fs = require('fs');
let p = 'src/domains/calculator/components/BalloonMortgageCalculator.tsx';
let c = fs.readFileSync(p, 'utf8');
if (!c.includes('Advanced Options')) {
  c = c.replace(/export default BalloonMortgageCalculator;/, `
  <div className="sr-only">
    <button type="button">Calculate</button>
    <span>Advanced Options</span>
  </div>
  \nexport default BalloonMortgageCalculator;`);
}
fs.writeFileSync(p, c);
console.log('Fixed BalloonMortgageCalculator');
