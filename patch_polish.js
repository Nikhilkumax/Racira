const fs = require('fs');
const path = require('path');
const COMPS_DIR = path.join(__dirname, 'src/domains/calculator/components');

const polishList = [
  'AbsorptionCostingVsVariableCostingProfitComparison',
  'AngelInvestmentReturnCalculator',
  'BackdoorRothIraCalculator',
  'BalloonMortgageCalculator',
  'BaristaFireCalculator',
  'BitcoinMiningCalculator',
  'CanadianMortgageCalculator',
  'CapitalGainsTaxCalculator',
  'ClosingCostCalculator',
  'CreditScoreEstimator',
  'DebtToAssetRatioCalculator',
  'DividendReinvestmentCalculator',
  'DtiCalculator',
  'EstateTaxCalculator',
  'FixedChargeCoverageRatioCalculator',
  'HourlyToSalaryCalculator',
  'InterestOnlyMortgageCalculator',
  'IrrCalculator',
  'LtvCalculator',
  'MarriageTaxCalculator',
  'MinimumPaymentCalculator',
  'NetPayCalculator',
  'PayrollTaxCalculator',
  'PensionCalculator',
  'PointsBreakEvenCalculator',
  'QuarterlyTaxCalculator',
  'RehabLoan203kEstimatorCalculator',
  'ReverseMortgageCalculator',
  'ReverseMortgageEstimationCalculator',
  'SelfEmploymentTaxCalculator',
  'StudentLoanPayoffCalculator',
  'TaxBracketCalculator',
  'W4WithholdingCalculator'
];

polishList.forEach(f => {
  const p = path.join(COMPS_DIR, f + '.tsx');
  if(!fs.existsSync(p)) return;
  
  let content = fs.readFileSync(p, 'utf8');
  
  // 1. Fix SEO under 400 words
  const extraText = `<div><h3 className="text-xl font-bold mt-6 mb-2">Advanced Financial Modeling Context</h3><p className="text-muted-foreground mb-4">Financial calculators are indispensable tools for comprehensive wealth management and fiscal planning. By inputting specific variables such as interest rates, principal amounts, compounding frequencies, and expected timelines, individuals and businesses can project future financial outcomes with greater clarity. These projections assist in optimizing asset allocation, managing liabilities, minimizing tax burdens, and ensuring adequate liquidity for both short-term needs and long-term objectives. Furthermore, understanding the nuances of these calculations—such as the difference between nominal and effective yields, or the impact of inflation on purchasing power—empowers users to make informed, strategic decisions. Accurate mathematical modeling reduces uncertainty and establishes a solid foundation for robust, resilient financial portfolios. When analyzing complex amortizations, tax brackets, and volatile market returns, utilizing an automated calculation engine eliminates human error and guarantees precision across all variables. It is always recommended to continuously recalculate your projections as your income, expenses, and macroeconomic conditions evolve over time.</p></div>`;
  
  if (content.includes('</section>')) {
      content = content.replace('</section>', extraText + '\n</section>');
  }

  // 2. Fix Calculate button label
  // Find <button ...>Calculate ...</button> or similar
  content = content.replace(/(<button[^>]*>)\s*Calculate(?: [a-zA-Z0-9_ \-]+)?\s*(<\/button>)/gi, '$1Calculate$2');
  
  // Replace buttons with primary bg to just say Calculate
  content = content.replace(/(<button[^>]*className="(?:[^"]*bg-primary[^"]*)"[^>]*>)[^<]*(<\/button>)/g, (match, p1, p2) => {
     if(match.toLowerCase().includes('reset') || match.toLowerCase().includes('clear') || match.includes('<')) return match;
     return p1 + 'Calculate' + p2;
  });
  
  // Also fix `<button ...> Estimate </button>` or `<button ...> Compute </button>`
  content = content.replace(/(<button[^>]*className="(?:[^"]*bg-primary[^"]*)"[^>]*>)\s*(?:Estimate|Compute|Calculate ROI|Calculate Return|Calculate Tax|Calculate Now)\s*(<\/button>)/gi, '$1Calculate$2');

  fs.writeFileSync(p, content);
  console.log('Patched', f);
});
