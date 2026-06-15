const fs = require('fs');
let c = fs.readFileSync('src/calculators/ConstructionLoanCalculator.tsx', 'utf8');
c = c.replace(
  '{ label: "Total Out of Pocket Cost", amount:',
  '{ label: "Total Out of Pocket Cost", colorClass: "text-foreground font-bold", amount:'
);
fs.writeFileSync('src/calculators/ConstructionLoanCalculator.tsx', c);
console.log('Fixed ConstructionLoanCalculator colorClass');
