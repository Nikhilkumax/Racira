// Fix cramped input grids: change lg:grid-cols-4 to just sm:grid-cols-2
// Only target input sections (those with InputField or input-calc components)
// NOT result display sections

const fs = require('fs');
const path = require('path');

const calcDir = path.join(__dirname, 'src', 'calculators');
const files = fs.readdirSync(calcDir).filter(f => f.endsWith('.tsx'));

// These files have grid-cols-4 in RESULT sections that should NOT be changed
// (they display 4 metric cards side-by-side which is fine on desktop)
const SKIP_FOR_COL4 = new Set([
  'AgeCalculator.tsx',         // 4 result metric cards - fine
  'ACTScoreCalculator.tsx',    // 4 result cards - fine
  'HashCalculator.tsx',        // 4 hash result cards - fine
  'HydrationCalculator.tsx',   // 4 result metric cards - fine
  'OhmsLawCalculator.tsx',     // 4 result cards - fine
  'GpaCalculator.tsx',         // 4 grade scale cards - fine
  'TestGradeCalculator.tsx',   // grading scale display - fine
  'LinearEquationCalculator.tsx', // math equation grid - intentional
  'DebtSnowballCalculator.tsx', // debt row items - intentional
  'DebtAvalancheCalculator.tsx', // debt row items - intentional
  'DebtConsolidationCalculator.tsx', // debt row items - intentional
  'CanadianMortgageCalculator.tsx', // result metrics - fine
  'MeatlessDietImpactCalculator.tsx', // result cards - fine
  'CreditCardPayoffCalculator.tsx', // result section - fine
  'ContrastRatioCalculator.tsx',    // result section - fine
  'UptimeCalculator.tsx',           // result metrics - fine
  'LedSavingsCalculator.tsx',       // result section - fine
  'PaperSavingsCalculator.tsx',     // result section - fine
  'MolarityCalculator.tsx',         // result section - fine
  'WaterFootprintCalculator.tsx',   // nested result section - fine
]);

// Files where lg:grid-cols-4 IS on the input section - these need fixing
const INPUT_COL4_FILES = [
  'AdjustedBodyWeightCalculator.tsx',
  'BacCalculator.tsx',
  'CaloriesBurnedCalculator.tsx',
  'CatCalorieCalculator.tsx',
  'DogCalorieCalculator.tsx',
  'DogSizePredictor.tsx',
  'DownPaymentCalculator.tsx',
  'GfrCalculator.tsx',
  'InstagramEngagementCalculator.tsx',
  'InterestOnlyCalculator.tsx',
  'MortgageAffordabilityCalculator.tsx',
  'PaceConverter.tsx',
  'ProteinIntakeCalculator.tsx',
  'TimeZoneConverter.tsx',
  'WaistToHipRatioCalculator.tsx',
  'WaterIntakeCalculator.tsx',
];

let fixedCount = 0;

for (const file of INPUT_COL4_FILES) {
  const filePath = path.join(calcDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace `sm:grid-cols-2 lg:grid-cols-4` → `sm:grid-cols-2`
  content = content.replace(/sm:grid-cols-2 lg:grid-cols-4/g, 'sm:grid-cols-2');
  
  // Replace bare `grid-cols-4` (no breakpoint) in input sections → `sm:grid-cols-2`
  // Only if it's in a mb-6 section (input area)
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✓ Fixed input grid: ${file}`);
  }
}

console.log(`\nDone! Fixed ${fixedCount} files with cramped input grids.`);
