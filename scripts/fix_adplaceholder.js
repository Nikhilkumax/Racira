const fs = require('fs');
const path = require('path');

const files = [
  'src/calculators/OverweightPercentageCalculator.tsx',
  'src/calculators/AnorexicBmiCalculator.tsx',
  'src/calculators/AdolescentBmiCalculator.tsx',
  'src/calculators/SeniorBmiCalculator.tsx',
  'src/calculators/IdealBmiWeightCalculator.tsx',
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  // Remove id prop from AdPlaceholder tags
  c = c.replace(/<AdPlaceholder id="[^"]*" \/>/g, '<AdPlaceholder />');
  fs.writeFileSync(file, c);
  console.log(`Fixed AdPlaceholder in ${file}`);
}
