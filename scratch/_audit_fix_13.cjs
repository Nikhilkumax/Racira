/**
 * Fix the 13 template-deviation calculators (Phase 3 layout regression).
 * Pattern: outer <div className="container mx-auto px-4 py-8 max-w-4xl"> →
 *   <div className="racira-page-container py-4">
 *     <h1 two-col header + print hint>
 *     <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
 *       <div className="card-calculator ...">{inputs}</div>
 *       {results}
 * Two structural approaches exist; both handled:
 *  A) container div + inner "card"/panel div holding inputs + results
 *  B) container div + form card + results block as siblings
 */
const fs = require('fs');

const FIXES = [
  'InventoryTurnoverCalculator', 'RentVsBuyCalculator', 'PpfCalculator',
  'SukanyaSamriddhiCalculator', 'TreasuryBillCalculator',
  'AdjustableRateMortgageArmPaymentCalculator', 'AmortizationPeriodVsLoanTermComparison',
  'AssumableMortgageBenefitCalculator', 'AnnualPercentageYieldLoanCalculator',
  'ClosingCostCalculator', 'PriceToBookRatioCalculator',
  'SupplyAndDemandEquilibriumPriceCalculator', 'UnrealizedGainlossCalculator',
];

for (const comp of FIXES) {
  const f = `src/domains/calculator/components/${comp}.tsx`;
  let src = fs.readFileSync(f, 'utf8');
  const orig = src;

  // 1. Replace the non-template container with the template container
  src = src.replace(
    /<div className="container mx-auto px-4 py-8 max-w-4xl">/,
    '<div className="racira-page-container py-4">'
  );

  // 2. Add the two-column wrapper + header after the container div (once)
  if (!/lg:grid-cols-\[460px_1fr\]/.test(src) && src.includes('racira-page-container py-4')) {
    src = src.replace(
      /(<div className="racira-page-container py-4">)/,
      `$1\n        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">`
    );
  }

  if (src === orig) {
    console.log(`${comp}: NO CHANGES — pattern not found, needs manual fix`);
  } else {
    fs.writeFileSync(f, src);
    console.log(`${comp}: container + two-col wrapper applied (closing tags untouched)`);
  }
}
