const fs = require('fs');
let c = fs.readFileSync('src/app/calculator/[slug]/page.tsx', 'utf8');
const inserts = `  "pregnancy-calculator": () => import("@/calculators/PregnancyCalculator"),
  "steroid-equivalence-calculator": () => import("@/calculators/SteroidEquivalenceCalculator"),
  "dead-space-fraction-calculator": () => import("@/calculators/DeadSpaceFractionCalculator"),
  "radiation-dose-fractionation-calculator": () => import("@/calculators/RadiationDoseFractionationCalculator"),
  "insulin-to-carb-ratio-calculator": () => import("@/calculators/InsulinToCarbRatioCalculator"),
`;
c = c.replace('// New calculators', '// New calculators\n' + inserts);
fs.writeFileSync('src/app/calculator/[slug]/page.tsx', c);
console.log("Updated page.tsx with Batch 18 tools!");
