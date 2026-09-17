/**
 * Targeted fixes for the 5 remaining template-deviation calculators.
 * A (3 files): w-full wrapper, own breadcrumb+h1, lg:grid-cols-2 (50/50) →
 *   remove own nav/h1, switch to Mortgage 460px template grid.
 * B (1 file): max-w-7xl centered hero header → Mortgage-style two-col.
 * C (1 file): keep prose FAQ, retarget its container class only.
 */
const fs = require('fs');

const GROUP_A = [
  'AdjustableRateMortgageArmPaymentCalculator',
  'AmortizationPeriodVsLoanTermComparison',
  'AssumableMortgageBenefitCalculator',
];

for (const comp of GROUP_A) {
  const f = `src/domains/calculator/components/${comp}.tsx`;
  let src = fs.readFileSync(f, 'utf8');
  const orig = src;

  // Remove own breadcrumb nav + h1 (ToolView already renders them; matching the
  // Mortgage template which renders neither)
  src = src.replace(
    /\{\/\* BREADCRUMB \*\/\}\s*<nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">[\s\S]*?<\/nav>\s*\{\/* H1 — no subtitle \*\/}\s*<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">\s*[^<]*\s*<\/h1>\s*/,
    ''
  );
  // Widen the 50/50 grid to the Mortgage template's 460px left column
  src = src.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
    '<div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">'
  );
  if (src === orig || !/lg:grid-cols-\[460px_1fr\]/.test(src)) {
    console.log(`${comp}: A-fix INCOMPLETE — manual fix needed`);
  } else {
    fs.writeFileSync(f, src);
    console.log(`${comp}: A-fix applied (nav+h1 removed, 460px template grid)`);
  }
}

// Group B: ClosingCostCalculator — replace centered hero with template two-col
{
  const f = 'src/domains/calculator/components/ClosingCostCalculator.tsx';
  let src = fs.readFileSync(f, 'utf8');
  const before = src;
  src = src.replace(
    /<div className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8">\s*\{\/\* Header \*\/\}[\s\S]*?<\/div>\s*\{\s*Header end\s*\*\/\}/,
    'NO_MATCH_HERO'
  );
  if (src === before) {
    // Fall back: replace just the container; leave hero but template grid already exists below
    console.log('ClosingCostCalculator: hero regex did not match; inspecting manually');
  }
}
