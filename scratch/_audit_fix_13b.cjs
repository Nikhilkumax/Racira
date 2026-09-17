/**
 * Finish template compliance:
 * 1. Group A files: tag their top input panel with card-calculator.
 * 2. The container-swapped files: tag their input card (first bg-card/rounded panel after the grid).
 * 3. AnnualPercentageYieldLoanCalculator: full A-fix (own h1 removal is NOT needed —
 *    hidden by ToolView CSS — but grid must become 460px template).
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
  const before = src;
  src = src.replace(
    '<div className="bg-card border border-border rounded-lg p-4">',
    '<div className="card-calculator bg-card border border-border rounded-lg p-4">'
  );
  console.log(comp, src !== before ? 'card-calculator added' : 'PANEL NOT FOUND — check');
  fs.writeFileSync(f, src);
}

// Container-swapped files: add card-calculator to their first card-ish panel
const GROUP_B = [
  'InventoryTurnoverCalculator', 'RentVsBuyCalculator', 'PpfCalculator',
  'SukanyaSamriddhiCalculator', 'TreasuryBillCalculator', 'ClosingCostCalculator',
  'PriceToBookRatioCalculator', 'SupplyAndDemandEquilibriumPriceCalculator',
  'UnrealizedGainlossCalculator',
];
for (const comp of GROUP_B) {
  const f = `src/domains/calculator/components/${comp}.tsx`;
  let src = fs.readFileSync(f, 'utf8');
  const before = src;
  // first bg-card panel inside the new grid
  src = src.replace(
    /(<div className=")((?:bg-card|card-calculator)[^"]*)(">)/,
    (m, a, cls, c) => cls.includes('card-calculator') ? m : a + 'card-calculator ' + cls + c
  );
  console.log(comp, src !== before ? 'card-calculator added to first panel' : 'PANEL NOT FOUND — check');
  fs.writeFileSync(f, src);
}

// APY Loan: 50/50 → 460px template grid
{
  const f = 'src/domains/calculator/components/AnnualPercentageYieldLoanCalculator.tsx';
  let src = fs.readFileSync(f, 'utf8');
  const before = src;
  src = src.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
    '<div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">'
  );
  // wrap width container -> template container
  src = src.replace('<div className="w-full">', '<div className="racira-page-container py-4">');
  console.log('AnnualPercentageYieldLoanCalculator', src !== before ? 'grid+container fixed' : 'NO CHANGES — check');
  fs.writeFileSync(f, src);
}
