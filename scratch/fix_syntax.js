const fs = require('fs');
const files = [
  'src/calculators/CarInsuranceCalculator.tsx',
  'src/calculators/BondYieldCalculator.tsx',
  'src/calculators/HighYieldSavingsCalculator.tsx',
  'src/calculators/TaxRefundCalculator.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // the string has a literal backslash followed by a backtick
  // we want to replace `\` with ```
  content = content.replace(/\\`/g, '`');
  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});
