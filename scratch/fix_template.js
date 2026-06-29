const fs = require('fs');
const files = [
  'src/calculators/CarInsuranceCalculator.tsx',
  'src/calculators/BondYieldCalculator.tsx',
  'src/calculators/HighYieldSavingsCalculator.tsx',
  'src/calculators/TaxRefundCalculator.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\\${/g, '${');
  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});
