const fs = require('fs');
const content = fs.readFileSync('src/data/calculatorRegistry.ts', 'utf8');

// Extract all slugs currently in registry
const slugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));
console.log('Total current slugs:', slugs.size);

// Define the target list of REAL Finance calculators that should exist but don't yet
// These are well-known, specific calculator types grouped by subcategory
const targetFinance = [
  // --- Loans & Mortgages (already have many, check what's missing) ---
  { slug: 'bridge-loan-calculator', name: 'Bridge Loan Calculator', subcategory: 'Loans & Mortgages', icon: 'Landmark' },
  { slug: 'balloon-mortgage-calculator', name: 'Balloon Mortgage Calculator', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'reverse-mortgage-calculator', name: 'Reverse Mortgage Calculator', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'interest-only-mortgage-calculator', name: 'Interest-Only Mortgage Calculator', subcategory: 'Loans & Mortgages', icon: 'Percent' },
  { slug: 'pmi-calculator', name: 'PMI Calculator', subcategory: 'Loans & Mortgages', icon: 'Shield' },
  { slug: 'heloc-calculator', name: 'HELOC Calculator', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'biweekly-mortgage-calculator', name: 'Bi-Weekly Mortgage Calculator', subcategory: 'Loans & Mortgages', icon: 'Calendar' },
  { slug: 'mortgage-affordability-calculator', name: 'Mortgage Affordability Calculator', subcategory: 'Loans & Mortgages', icon: 'Home' },
  { slug: 'points-break-even-calculator', name: 'Mortgage Points Break-Even Calculator', subcategory: 'Loans & Mortgages', icon: 'Target' },
  { slug: 'hard-money-loan-calculator', name: 'Hard Money Loan Calculator', subcategory: 'Loans & Mortgages', icon: 'DollarSign' },
  { slug: 'commercial-loan-calculator', name: 'Commercial Loan Calculator', subcategory: 'Loans & Mortgages', icon: 'Building' },
  { slug: 'construction-loan-draw-calculator', name: 'Construction Loan Draw Calculator', subcategory: 'Loans & Mortgages', icon: 'HardHat' },

  // --- Debt & Credit ---
  { slug: 'debt-to-income-calculator', name: 'Debt-to-Income Ratio Calculator', subcategory: 'Debt & Credit', icon: 'PieChart' },
  { slug: 'balance-transfer-calculator', name: 'Balance Transfer Calculator', subcategory: 'Debt & Credit', icon: 'CreditCard' },
  { slug: 'loan-payoff-calculator', name: 'Loan Payoff Calculator', subcategory: 'Debt & Credit', icon: 'TrendingDown' },
  { slug: 'credit-score-estimator', name: 'Credit Score Estimator', subcategory: 'Debt & Credit', icon: 'Shield' },
  { slug: 'minimum-payment-calculator', name: 'Minimum Payment Calculator', subcategory: 'Debt & Credit', icon: 'CreditCard' },

  // --- Income & Tax ---
  { slug: 'self-employment-tax-calculator', name: 'Self-Employment Tax Calculator', subcategory: 'Income & Tax', icon: 'Briefcase' },
  { slug: 'capital-gains-tax-calculator', name: 'Capital Gains Tax Calculator', subcategory: 'Income & Tax', icon: 'TrendingUp' },
  { slug: 'tax-refund-calculator', name: 'Tax Refund Estimator', subcategory: 'Income & Tax', icon: 'Receipt' },
  { slug: 'quarterly-tax-calculator', name: 'Quarterly Estimated Tax Calculator', subcategory: 'Income & Tax', icon: 'Calendar' },
  { slug: 'tax-bracket-calculator', name: 'Tax Bracket Calculator', subcategory: 'Income & Tax', icon: 'BarChart3' },
  { slug: 'payroll-tax-calculator', name: 'Payroll Tax Calculator', subcategory: 'Income & Tax', icon: 'Wallet' },
  { slug: 'net-pay-calculator', name: 'Net Pay Calculator', subcategory: 'Income & Tax', icon: 'DollarSign' },
  { slug: 'w4-withholding-calculator', name: 'W-4 Withholding Calculator', subcategory: 'Income & Tax', icon: 'FileText' },

  // --- Investment & Growth ---
  { slug: 'stock-calculator', name: 'Stock Return Calculator', subcategory: 'Investment', icon: 'TrendingUp' },
  { slug: 'dividend-reinvestment-calculator', name: 'Dividend Reinvestment Calculator', subcategory: 'Investment', icon: 'RefreshCw' },
  { slug: 'options-profit-calculator', name: 'Options Profit Calculator', subcategory: 'Investment', icon: 'BarChart3' },
  { slug: 'pe-ratio-calculator', name: 'P/E Ratio Calculator', subcategory: 'Investment', icon: 'BarChart3' },
  { slug: 'dcf-calculator', name: 'Discounted Cash Flow (DCF) Calculator', subcategory: 'Investment', icon: 'TrendingDown' },
  { slug: 'portfolio-rebalancing-calculator', name: 'Portfolio Rebalancing Calculator', subcategory: 'Investment', icon: 'PieChart' },
  { slug: 'sharpe-ratio-calculator', name: 'Sharpe Ratio Calculator', subcategory: 'Investment', icon: 'BarChart3' },
  { slug: 'dollar-cost-averaging-calculator', name: 'Dollar Cost Averaging Calculator', subcategory: 'Investment', icon: 'TrendingUp' },
  { slug: 'bond-price-calculator', name: 'Bond Price Calculator', subcategory: 'Investment', icon: 'Landmark' },
  { slug: 'treasury-bill-calculator', name: 'Treasury Bill Calculator', subcategory: 'Investment', icon: 'Shield' },

  // --- Savings ---
  { slug: 'emergency-fund-calculator', name: 'Emergency Fund Calculator', subcategory: 'Savings', icon: 'Shield' },
  { slug: 'savings-goal-calculator', name: 'Savings Goal Calculator', subcategory: 'Savings', icon: 'Target' },
  { slug: 'high-yield-savings-calculator', name: 'High-Yield Savings Account Calculator', subcategory: 'Savings', icon: 'PiggyBank' },
  { slug: 'money-market-calculator', name: 'Money Market Account Calculator', subcategory: 'Savings', icon: 'Coins' },
  { slug: 'certificate-of-deposit-calculator', name: 'Certificate of Deposit Calculator', subcategory: 'Savings', icon: 'Landmark' },
  { slug: 'apy-calculator', name: 'APY Calculator', subcategory: 'Savings', icon: 'Percent' },
  { slug: 'rule-of-72-calculator', name: 'Rule of 72 Calculator', subcategory: 'Savings', icon: 'Zap' },

  // --- Retirement ---
  { slug: 'ira-calculator', name: 'IRA Calculator', subcategory: 'Retirement', icon: 'Landmark' },
  { slug: 'pension-calculator', name: 'Pension Benefit Calculator', subcategory: 'Retirement', icon: 'Award' },
  { slug: 'social-security-benefits-calculator', name: 'Social Security Benefits Calculator', subcategory: 'Retirement', icon: 'Shield' },
  { slug: 'early-retirement-calculator', name: 'Early Retirement Calculator', subcategory: 'Retirement', icon: 'Target' },
  { slug: 'required-minimum-distribution-calculator', name: 'Required Minimum Distribution Calculator', subcategory: 'Retirement', icon: 'Calendar' },
  { slug: 'safe-withdrawal-rate-calculator', name: 'Safe Withdrawal Rate Calculator', subcategory: 'Retirement', icon: 'PiggyBank' },

  // --- Business Finance ---
  { slug: 'business-valuation-calculator', name: 'Business Valuation Calculator', subcategory: 'Business Finance', icon: 'Briefcase' },
  { slug: 'burn-rate-calculator', name: 'Startup Burn Rate Calculator', subcategory: 'Business Finance', icon: 'TrendingDown' },
  { slug: 'customer-acquisition-cost-calculator', name: 'Customer Acquisition Cost Calculator', subcategory: 'Business Finance', icon: 'Target' },
  { slug: 'lifetime-value-calculator', name: 'Customer Lifetime Value Calculator', subcategory: 'Business Finance', icon: 'TrendingUp' },
  { slug: 'net-present-value-calculator', name: 'Net Present Value (NPV) Calculator', subcategory: 'Business Finance', icon: 'BarChart3' },
  { slug: 'payback-period-calculator-advanced', name: 'Payback Period Calculator', subcategory: 'Business Finance', icon: 'Clock' },
  { slug: 'accounts-receivable-calculator', name: 'Accounts Receivable Turnover Calculator', subcategory: 'Business Finance', icon: 'RefreshCw' },
  { slug: 'debt-service-coverage-ratio-calculator', name: 'Debt Service Coverage Ratio Calculator', subcategory: 'Business Finance', icon: 'Shield' },
  { slug: 'return-on-equity-calculator', name: 'Return on Equity (ROE) Calculator', subcategory: 'Business Finance', icon: 'TrendingUp' },
  { slug: 'return-on-assets-calculator', name: 'Return on Assets (ROA) Calculator', subcategory: 'Business Finance', icon: 'BarChart3' },

  // --- Crypto ---
  { slug: 'crypto-profit-calculator', name: 'Crypto Profit Calculator', subcategory: 'Crypto', icon: 'Bitcoin' },
  { slug: 'bitcoin-mining-calculator', name: 'Bitcoin Mining Calculator', subcategory: 'Crypto', icon: 'Cpu' },
  { slug: 'crypto-tax-calculator', name: 'Crypto Tax Calculator', subcategory: 'Crypto', icon: 'Receipt' },
  { slug: 'ethereum-gas-calculator', name: 'Ethereum Gas Fee Calculator', subcategory: 'Crypto', icon: 'Zap' },
  { slug: 'staking-rewards-calculator', name: 'Staking Rewards Calculator', subcategory: 'Crypto', icon: 'TrendingUp' },
  { slug: 'crypto-position-size-calculator', name: 'Crypto Position Size Calculator', subcategory: 'Crypto', icon: 'Target' },

  // --- Personal Finance / Budget ---
  { slug: 'budget-calculator', name: 'Monthly Budget Calculator', subcategory: 'Personal Finance', icon: 'PieChart' },
  { slug: '50-30-20-budget-calculator', name: '50/30/20 Budget Calculator', subcategory: 'Personal Finance', icon: 'PieChart' },
  { slug: 'net-worth-tracker', name: 'Net Worth Tracker', subcategory: 'Personal Finance', icon: 'TrendingUp' },
  { slug: 'cost-of-living-calculator', name: 'Cost of Living Calculator', subcategory: 'Personal Finance', icon: 'Globe' },
  { slug: 'tip-calculator', name: 'Tip Calculator', subcategory: 'Personal Finance', icon: 'DollarSign' },
  { slug: 'bill-split-calculator', name: 'Bill Split Calculator', subcategory: 'Personal Finance', icon: 'Users' },
  { slug: 'grocery-budget-calculator', name: 'Grocery Budget Calculator', subcategory: 'Personal Finance', icon: 'ShoppingBag' },
  { slug: 'subscription-cost-calculator', name: 'Subscription Cost Calculator', subcategory: 'Personal Finance', icon: 'CreditCard' },
  { slug: 'vacation-budget-calculator', name: 'Vacation Budget Calculator', subcategory: 'Personal Finance', icon: 'Globe' },

  // --- Insurance ---
  { slug: 'life-insurance-calculator', name: 'Life Insurance Calculator', subcategory: 'Insurance', icon: 'Heart' },
  { slug: 'home-insurance-calculator', name: 'Home Insurance Calculator', subcategory: 'Insurance', icon: 'Home' },
  { slug: 'car-insurance-calculator', name: 'Car Insurance Calculator', subcategory: 'Insurance', icon: 'Car' },
  { slug: 'health-insurance-calculator', name: 'Health Insurance Premium Calculator', subcategory: 'Insurance', icon: 'Activity' },
  { slug: 'disability-insurance-calculator', name: 'Disability Insurance Calculator', subcategory: 'Insurance', icon: 'Shield' },
  { slug: 'term-life-vs-whole-life-calculator', name: 'Term Life vs Whole Life Calculator', subcategory: 'Insurance', icon: 'BarChart3' },
];

const missing = targetFinance.filter(c => !slugs.has(c.slug));
console.log(`\nFinance calculators to ADD: ${missing.length}`);
console.log('(Already have:', targetFinance.length - missing.length, 'of these)');
missing.forEach(c => console.log(`  [${c.subcategory}] ${c.name} (slug: ${c.slug})`));
