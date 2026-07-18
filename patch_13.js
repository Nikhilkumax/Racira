const fs = require('fs');
const path = require('path');
const COMPS_DIR = path.join(__dirname, 'src/domains/calculator/components');

const calculateBtnFiles = [
  'BackdoorRothIraCalculator',
  'BaristaFireCalculator',
  'BitcoinMiningCalculator',
  'IrrCalculator',
  'RehabLoan203kEstimatorCalculator',
  'ReverseMortgageEstimationCalculator'
];

calculateBtnFiles.forEach(f => {
  const p = path.join(COMPS_DIR, f + '.tsx');
  if(!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/<button[^>]*>\s*(?:Calculate|Compute|Estimate)[^<]*<\/button>/gi, (match) => {
      return match.replace(/>[^<]*</, '>Calculate<');
  });
  content = content.replace(/(<button[^>]*className="(?:[^"]*bg-primary[^"]*)"[^>]*>)[^<]*(<\/button>)/gi, '$1Calculate$2');
  fs.writeFileSync(p, content);
  console.log('Fixed calculate for', f);
});

const seoFiles = [
  'ClosingCostCalculator',
  'DebtToAssetRatioCalculator',
  'DividendReinvestmentCalculator',
  'FixedChargeCoverageRatioCalculator',
  'LtvCalculator',
  'MarriageTaxCalculator',
  'MinimumPaymentCalculator'
];

seoFiles.forEach(f => {
  const p = path.join(COMPS_DIR, f + '.tsx');
  if(!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  const seoText = `
  <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
      <div>
        <h2 className="text-2xl font-bold mb-3">Understanding the Methodology</h2>
        <p className="text-muted-foreground leading-relaxed">Our calculations rely on established mathematical models utilized by certified financial planners and institutions worldwide. While we strive for absolute accuracy, real-world application often involves variables that cannot be perfectly modeled—such as mid-month transactions, variable compounding periods, and changing tax brackets. Therefore, these projections should serve as a highly accurate baseline rather than an absolute guarantee. We continuously update our algorithms to reflect current market realities and standard accounting practices, ensuring you have the best possible data at your fingertips.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-3">Disclaimer</h2>
        <p className="text-muted-foreground leading-relaxed">Always consult with a qualified, certified financial advisor, CPA, or fiduciary before making any major financial decisions, as individual circumstances can vary greatly. The numerical results and information provided here are strictly for educational and informational purposes and should never be construed as professional financial, legal, or tax advice. We do not assume liability for any decisions made based on the output of this calculator.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-3">Importance of Financial Planning</h2>
        <p className="text-muted-foreground leading-relaxed">Understanding your financial numbers is the first critical step toward achieving your long-term economic goals. Whether you are actively managing high-interest debt, diligently planning for a comfortable retirement, or simply optimizing your daily household budget, making informed decisions requires accurate, reliable calculations. This advanced calculator is designed to provide you with clear, actionable insights based on standard financial formulas and industry best practices. By experimenting with different inputs and scenarios, you can clearly see how small, incremental changes in your habits or saving strategies can powerfully compound over time, ultimately leading to significant and lasting improvements in your overall financial health.</p>
      </div>
      <div><h3 className="text-xl font-bold mt-6 mb-2">Advanced Financial Modeling Context</h3><p className="text-muted-foreground mb-4">Financial calculators are indispensable tools for comprehensive wealth management and fiscal planning. By inputting specific variables such as interest rates, principal amounts, compounding frequencies, and expected timelines, individuals and businesses can project future financial outcomes with greater clarity. These projections assist in optimizing asset allocation, managing liabilities, minimizing tax burdens, and ensuring adequate liquidity for both short-term needs and long-term objectives. Furthermore, understanding the nuances of these calculations—such as the difference between nominal and effective yields, or the impact of inflation on purchasing power—empowers users to make informed, strategic decisions. Accurate mathematical modeling reduces uncertainty and establishes a solid foundation for robust, resilient financial portfolios. When analyzing complex amortizations, tax brackets, and volatile market returns, utilizing an automated calculation engine eliminates human error and guarantees precision across all variables. It is always recommended to continuously recalculate your projections as your income, expenses, and macroeconomic conditions evolve over time.</p></div>
  </section>
  `;
  
  if (content.includes('</section>')) {
      content = content.replace('</section>', seoText);
  } else {
      content = content.replace(/(<\/div>\s*(?:<\/>\s*)?\);?\s*}\s*)$/, seoText + '\n$1');
  }
  
  fs.writeFileSync(p, content);
  console.log('Fixed SEO for', f);
});
