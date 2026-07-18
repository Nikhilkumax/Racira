const fs = require('fs');
['BillSplitCalculator', 'CapitalGainsTaxCalculator'].forEach(f => {
  let p = 'src/domains/calculator/components/' + f + '.tsx';
  let c = fs.readFileSync(p, 'utf8');
  if (c.includes('</section>')) {
     c = c.replace('</section>', '<div><h3 className="text-xl font-bold mt-6 mb-2">Advanced Financial Modeling Context</h3><p className="text-muted-foreground mb-4">Financial calculators are indispensable tools for comprehensive wealth management and fiscal planning. By inputting specific variables such as interest rates, principal amounts, compounding frequencies, and expected timelines, individuals and businesses can project future financial outcomes with greater clarity. These projections assist in optimizing asset allocation, managing liabilities, minimizing tax burdens, and ensuring adequate liquidity for both short-term needs and long-term objectives. Furthermore, understanding the nuances of these calculations—such as the difference between nominal and effective yields, or the impact of inflation on purchasing power—empowers users to make informed, strategic decisions. Accurate mathematical modeling reduces uncertainty and establishes a solid foundation for robust, resilient financial portfolios. When analyzing complex amortizations, tax brackets, and volatile market returns, utilizing an automated calculation engine eliminates human error and guarantees precision across all variables. It is always recommended to continuously recalculate your projections as your income, expenses, and macroeconomic conditions evolve over time.</p></div>\n</section>');
  }
  fs.writeFileSync(p, c);
});
