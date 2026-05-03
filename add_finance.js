const fs = require('fs');

const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

// Get existing slugs to avoid duplicates
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // ── Loans & Mortgages ──
  { slug: 'bridge-loan-calculator', name: 'Bridge Loan Calculator', description: 'Calculate payments and costs for short-term bridge financing between properties.', subcategory: 'Loans & Mortgages', icon: 'Landmark' },
  { slug: 'balloon-mortgage-calculator', name: 'Balloon Mortgage Calculator', description: 'Estimate payments for mortgages with a large lump-sum payment at the end.', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'reverse-mortgage-calculator', name: 'Reverse Mortgage Calculator', description: 'Calculate how much equity you can access through a reverse mortgage.', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'interest-only-mortgage-calculator', name: 'Interest-Only Mortgage Calculator', description: 'Calculate monthly payments during the interest-only period of your mortgage.', subcategory: 'Loans & Mortgages', icon: 'Percent' },
  { slug: 'pmi-calculator', name: 'PMI Calculator', description: 'Estimate your Private Mortgage Insurance cost based on loan-to-value ratio.', subcategory: 'Loans & Mortgages', icon: 'Shield' },
  { slug: 'heloc-calculator', name: 'HELOC Calculator', description: 'Calculate payments for a Home Equity Line of Credit during draw and repayment periods.', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'biweekly-mortgage-calculator', name: 'Bi-Weekly Mortgage Calculator', description: 'See how bi-weekly payments reduce your mortgage term and total interest.', subcategory: 'Loans & Mortgages', icon: 'Calendar' },
  { slug: 'mortgage-affordability-calculator', name: 'Mortgage Affordability Calculator', description: 'Find the maximum mortgage you can afford based on income and debts.', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'points-break-even-calculator', name: 'Mortgage Points Break-Even Calculator', description: 'Calculate how long it takes to recoup the cost of buying mortgage discount points.', subcategory: 'Loans & Mortgages', icon: 'Target' },
  { slug: 'hard-money-loan-calculator', name: 'Hard Money Loan Calculator', description: 'Estimate the cost and payments for short-term hard money real estate loans.', subcategory: 'Loans & Mortgages', icon: 'DollarSign' },
  { slug: 'commercial-loan-calculator', name: 'Commercial Loan Calculator', description: 'Calculate monthly payments and amortization for commercial real estate loans.', subcategory: 'Loans & Mortgages', icon: 'Building' },
  { slug: 'construction-loan-draw-calculator', name: 'Construction Loan Draw Calculator', description: 'Track and calculate draw schedules and interest on construction loans.', subcategory: 'Loans & Mortgages', icon: 'HardHat' },
  // ── Debt & Credit ──
  { slug: 'debt-to-income-calculator', name: 'Debt-to-Income Ratio Calculator', description: 'Calculate your DTI ratio to assess mortgage and loan eligibility.', subcategory: 'Debt & Credit', icon: 'PieChart' },
  { slug: 'balance-transfer-calculator', name: 'Balance Transfer Calculator', description: 'Compare savings from transferring high-interest credit card balances.', subcategory: 'Debt & Credit', icon: 'CreditCard' },
  { slug: 'loan-payoff-calculator', name: 'Loan Payoff Calculator', description: 'Find out how much extra you need to pay to become debt-free by a target date.', subcategory: 'Debt & Credit', icon: 'TrendingDown' },
  { slug: 'credit-score-estimator', name: 'Credit Score Estimator', description: 'Estimate your credit score range based on payment history and utilization.', subcategory: 'Debt & Credit', icon: 'Shield' },
  { slug: 'minimum-payment-calculator', name: 'Minimum Payment Calculator', description: 'See how long it takes to pay off debt making only minimum payments.', subcategory: 'Debt & Credit', icon: 'CreditCard' },
  // ── Income & Tax ──
  { slug: 'self-employment-tax-calculator', name: 'Self-Employment Tax Calculator', description: 'Calculate self-employment taxes including Social Security and Medicare contributions.', subcategory: 'Income & Tax', icon: 'Briefcase' },
  { slug: 'capital-gains-tax-calculator', name: 'Capital Gains Tax Calculator', description: 'Estimate taxes on profits from selling stocks, real estate, or other assets.', subcategory: 'Income & Tax', icon: 'TrendingUp' },
  { slug: 'tax-refund-calculator', name: 'Tax Refund Estimator', description: 'Estimate your federal income tax refund or amount owed for the year.', subcategory: 'Income & Tax', icon: 'Receipt' },
  { slug: 'quarterly-tax-calculator', name: 'Quarterly Estimated Tax Calculator', description: 'Calculate quarterly tax payments to avoid IRS underpayment penalties.', subcategory: 'Income & Tax', icon: 'Calendar' },
  { slug: 'tax-bracket-calculator', name: 'Tax Bracket Calculator', description: 'Find your marginal and effective federal income tax rates by bracket.', subcategory: 'Income & Tax', icon: 'BarChart3' },
  { slug: 'payroll-tax-calculator', name: 'Payroll Tax Calculator', description: 'Calculate employer and employee payroll tax obligations by state.', subcategory: 'Income & Tax', icon: 'Wallet' },
  { slug: 'net-pay-calculator', name: 'Net Pay Calculator', description: 'Calculate your actual take-home pay after all taxes and deductions.', subcategory: 'Income & Tax', icon: 'DollarSign' },
  { slug: 'w4-withholding-calculator', name: 'W-4 Withholding Calculator', description: 'Determine the correct withholding allowances for your W-4 form.', subcategory: 'Income & Tax', icon: 'FileText' },
  // ── Investment ──
  { slug: 'stock-calculator', name: 'Stock Return Calculator', description: 'Calculate total return on a stock investment including dividends and price appreciation.', subcategory: 'Investment', icon: 'TrendingUp' },
  { slug: 'dividend-reinvestment-calculator', name: 'Dividend Reinvestment Calculator', description: 'Project long-term wealth from automatically reinvesting dividends (DRIP).', subcategory: 'Investment', icon: 'RefreshCw' },
  { slug: 'options-profit-calculator', name: 'Options Profit Calculator', description: 'Calculate profit, loss, and break-even points for call and put options trades.', subcategory: 'Investment', icon: 'BarChart3' },
  { slug: 'pe-ratio-calculator', name: 'P/E Ratio Calculator', description: 'Calculate Price-to-Earnings ratio to evaluate stock valuation.', subcategory: 'Investment', icon: 'BarChart3' },
  { slug: 'dcf-calculator', name: 'Discounted Cash Flow (DCF) Calculator', description: 'Value an investment based on projected future cash flows discounted to present value.', subcategory: 'Investment', icon: 'TrendingDown' },
  { slug: 'portfolio-rebalancing-calculator', name: 'Portfolio Rebalancing Calculator', description: 'Calculate how to rebalance your investment portfolio to target allocations.', subcategory: 'Investment', icon: 'PieChart' },
  { slug: 'sharpe-ratio-calculator', name: 'Sharpe Ratio Calculator', description: 'Measure risk-adjusted return of an investment or portfolio.', subcategory: 'Investment', icon: 'BarChart3' },
  { slug: 'dollar-cost-averaging-calculator', name: 'Dollar Cost Averaging Calculator', description: 'See the long-term impact of investing a fixed amount at regular intervals.', subcategory: 'Investment', icon: 'TrendingUp' },
  { slug: 'bond-price-calculator', name: 'Bond Price Calculator', description: 'Calculate the current market price of a bond given yield and coupon rate.', subcategory: 'Investment', icon: 'Landmark' },
  { slug: 'treasury-bill-calculator', name: 'Treasury Bill Calculator', description: 'Calculate yield and return on US Treasury Bills at various discount rates.', subcategory: 'Investment', icon: 'Shield' },
  // ── Savings ──
  { slug: 'emergency-fund-calculator', name: 'Emergency Fund Calculator', description: 'Calculate how much you need in an emergency fund based on monthly expenses.', subcategory: 'Savings', icon: 'Shield' },
  { slug: 'savings-goal-calculator', name: 'Savings Goal Calculator', description: 'Find out how much to save monthly to reach a specific financial goal.', subcategory: 'Savings', icon: 'Target' },
  { slug: 'high-yield-savings-calculator', name: 'High-Yield Savings Account Calculator', description: 'Project growth in a high-yield savings account with compound interest.', subcategory: 'Savings', icon: 'PiggyBank' },
  { slug: 'money-market-calculator', name: 'Money Market Account Calculator', description: 'Calculate earnings on money market accounts with tiered interest rates.', subcategory: 'Savings', icon: 'Coins' },
  { slug: 'certificate-of-deposit-calculator', name: 'Certificate of Deposit Calculator', description: 'Calculate maturity value and interest earned on a CD investment.', subcategory: 'Savings', icon: 'Landmark' },
  { slug: 'apy-calculator', name: 'APY Calculator', description: 'Convert annual interest rate to Annual Percentage Yield with any compounding frequency.', subcategory: 'Savings', icon: 'Percent' },
  { slug: 'rule-of-72-calculator', name: 'Rule of 72 Calculator', description: 'Estimate how many years it takes to double your money at a given interest rate.', subcategory: 'Savings', icon: 'Zap' },
  // ── Retirement ──
  { slug: 'ira-calculator', name: 'IRA Calculator', description: 'Project traditional or Roth IRA growth with annual contributions and tax treatment.', subcategory: 'Retirement', icon: 'Landmark' },
  { slug: 'social-security-benefits-calculator', name: 'Social Security Benefits Calculator', description: 'Estimate your monthly Social Security benefit at different claiming ages.', subcategory: 'Retirement', icon: 'Shield' },
  { slug: 'early-retirement-calculator', name: 'Early Retirement Calculator', description: 'Calculate how much you need to save to retire before the traditional age.', subcategory: 'Retirement', icon: 'Target' },
  { slug: 'required-minimum-distribution-calculator', name: 'Required Minimum Distribution Calculator', description: 'Calculate your annual RMD from traditional IRAs and 401(k) accounts.', subcategory: 'Retirement', icon: 'Calendar' },
  { slug: 'safe-withdrawal-rate-calculator', name: 'Safe Withdrawal Rate Calculator', description: 'Determine a sustainable annual withdrawal rate from your retirement portfolio.', subcategory: 'Retirement', icon: 'PiggyBank' },
  // ── Business Finance ──
  { slug: 'business-valuation-calculator', name: 'Business Valuation Calculator', description: 'Estimate the fair market value of a business using earnings-based methods.', subcategory: 'Business Finance', icon: 'Briefcase' },
  { slug: 'burn-rate-calculator', name: 'Startup Burn Rate Calculator', description: 'Calculate monthly cash burn and runway for startups and early-stage companies.', subcategory: 'Business Finance', icon: 'TrendingDown' },
  { slug: 'customer-acquisition-cost-calculator', name: 'Customer Acquisition Cost Calculator', description: 'Calculate the total cost to acquire one new customer across all channels.', subcategory: 'Business Finance', icon: 'Target' },
  { slug: 'lifetime-value-calculator', name: 'Customer Lifetime Value Calculator', description: 'Estimate the total revenue a business can expect from a single customer.', subcategory: 'Business Finance', icon: 'TrendingUp' },
  { slug: 'net-present-value-calculator', name: 'Net Present Value (NPV) Calculator', description: 'Evaluate investment profitability by calculating net present value of future cash flows.', subcategory: 'Business Finance', icon: 'BarChart3' },
  { slug: 'payback-period-calculator-advanced', name: 'Payback Period Calculator', description: 'Calculate how long it takes to recover the initial cost of an investment.', subcategory: 'Business Finance', icon: 'Clock' },
  { slug: 'accounts-receivable-calculator', name: 'Accounts Receivable Turnover Calculator', description: 'Measure how efficiently a company collects revenue from customers.', subcategory: 'Business Finance', icon: 'RefreshCw' },
  { slug: 'debt-service-coverage-ratio-calculator', name: 'Debt Service Coverage Ratio Calculator', description: 'Calculate DSCR to assess a company\'s ability to service its debt.', subcategory: 'Business Finance', icon: 'Shield' },
  { slug: 'return-on-equity-calculator', name: 'Return on Equity (ROE) Calculator', description: 'Measure how effectively a company generates profit from shareholders\' equity.', subcategory: 'Business Finance', icon: 'TrendingUp' },
  { slug: 'return-on-assets-calculator', name: 'Return on Assets (ROA) Calculator', description: 'Calculate how efficiently a company uses its assets to generate earnings.', subcategory: 'Business Finance', icon: 'BarChart3' },
  // ── Crypto ──
  { slug: 'crypto-profit-calculator', name: 'Crypto Profit Calculator', description: 'Calculate profit or loss on any cryptocurrency trade including fees.', subcategory: 'Crypto', icon: 'Bitcoin' },
  { slug: 'bitcoin-mining-calculator', name: 'Bitcoin Mining Calculator', description: 'Estimate Bitcoin mining profitability based on hash rate and electricity cost.', subcategory: 'Crypto', icon: 'Cpu' },
  { slug: 'crypto-tax-calculator', name: 'Crypto Tax Calculator', description: 'Estimate capital gains taxes on cryptocurrency trades using FIFO or LIFO.', subcategory: 'Crypto', icon: 'Receipt' },
  { slug: 'ethereum-gas-calculator', name: 'Ethereum Gas Fee Calculator', description: 'Calculate Ethereum transaction fees based on gas price and usage.', subcategory: 'Crypto', icon: 'Zap' },
  { slug: 'staking-rewards-calculator', name: 'Staking Rewards Calculator', description: 'Estimate annual earnings from staking cryptocurrency tokens.', subcategory: 'Crypto', icon: 'TrendingUp' },
  { slug: 'crypto-position-size-calculator', name: 'Crypto Position Size Calculator', description: 'Calculate the correct position size for crypto trades based on risk tolerance.', subcategory: 'Crypto', icon: 'Target' },
  // ── Personal Finance ──
  { slug: 'budget-calculator', name: 'Monthly Budget Calculator', description: 'Create and track a monthly budget to manage income and expenses effectively.', subcategory: 'Personal Finance', icon: 'PieChart' },
  { slug: '50-30-20-budget-calculator', name: '50/30/20 Budget Calculator', description: 'Allocate income using the 50/30/20 rule: needs, wants, and savings.', subcategory: 'Personal Finance', icon: 'PieChart' },
  { slug: 'net-worth-tracker', name: 'Net Worth Tracker', description: 'Track total assets minus liabilities to calculate and monitor your net worth.', subcategory: 'Personal Finance', icon: 'TrendingUp' },
  { slug: 'cost-of-living-calculator', name: 'Cost of Living Calculator', description: 'Compare the cost of living between two cities to plan a relocation.', subcategory: 'Personal Finance', icon: 'Globe' },
  { slug: 'bill-split-calculator', name: 'Bill Split Calculator', description: 'Easily split a bill equally or by percentage among any number of people.', subcategory: 'Personal Finance', icon: 'Users' },
  { slug: 'grocery-budget-calculator', name: 'Grocery Budget Calculator', description: 'Estimate monthly grocery spending based on household size and diet type.', subcategory: 'Personal Finance', icon: 'ShoppingBag' },
  { slug: 'subscription-cost-calculator', name: 'Subscription Cost Calculator', description: 'Calculate the true annual cost of all your recurring subscription services.', subcategory: 'Personal Finance', icon: 'CreditCard' },
  { slug: 'vacation-budget-calculator', name: 'Vacation Budget Calculator', description: 'Plan and estimate total costs for your next vacation including travel and hotels.', subcategory: 'Personal Finance', icon: 'Globe' },
  // ── Insurance ──
  { slug: 'life-insurance-calculator', name: 'Life Insurance Calculator', description: 'Determine how much life insurance coverage your family needs.', subcategory: 'Insurance', icon: 'Heart' },
  { slug: 'home-insurance-calculator', name: 'Home Insurance Calculator', description: 'Estimate homeowners insurance premiums based on property value and location.', subcategory: 'Insurance', icon: 'Home' },
  { slug: 'car-insurance-calculator', name: 'Car Insurance Calculator', description: 'Estimate auto insurance premiums based on vehicle, driver, and coverage type.', subcategory: 'Insurance', icon: 'Car' },
  { slug: 'health-insurance-calculator', name: 'Health Insurance Premium Calculator', description: 'Compare health insurance plan costs including premiums, deductibles, and out-of-pocket maximums.', subcategory: 'Insurance', icon: 'Activity' },
  { slug: 'disability-insurance-calculator', name: 'Disability Insurance Calculator', description: 'Calculate how much disability insurance you need to replace lost income.', subcategory: 'Insurance', icon: 'Shield' },
  { slug: 'term-life-vs-whole-life-calculator', name: 'Term Life vs Whole Life Calculator', description: 'Compare the long-term costs and benefits of term and whole life insurance policies.', subcategory: 'Insurance', icon: 'BarChart3' },
];

// Filter out any that already exist
const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));

if (skipped.length > 0) {
  console.log('Skipped (already exist):', skipped.map(e => e.slug));
}

// Build the entries string
let entriesStr = '\n\n  // ══════════════════════════════════════════════\n  // 💰 FINANCE — NEW ADDITIONS\n  // ══════════════════════════════════════════════\n';

const subcatGroups = {};
toAdd.forEach(e => {
  if (!subcatGroups[e.subcategory]) subcatGroups[e.subcategory] = [];
  subcatGroups[e.subcategory].push(e);
});

Object.entries(subcatGroups).forEach(([sub, entries]) => {
  entriesStr += `\n  // ${sub}\n`;
  entries.forEach(e => {
    entriesStr += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.description}", category: "Finance", subcategory: "${e.subcategory}", icon: ${e.icon}, isBuilt: false },\n`;
  });
});

// Insert before closing bracket
const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + entriesStr + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');

// Verify
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Finance calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
