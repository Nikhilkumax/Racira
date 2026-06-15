const fs = require('fs');
let c = fs.readFileSync('src/app/calculator/[slug]/page.tsx', 'utf8');
c = c.replace('  "anorexic-bmi-calculator": () => import("@/calculators/AnorexicBmiCalculator"),\n', '');
fs.writeFileSync('src/app/calculator/[slug]/page.tsx', c);
console.log('Removed duplicate anorexic-bmi-calculator');
