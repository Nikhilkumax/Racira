const fs = require('fs');
const path = require('path');

// Map each missing component to its best-fit registry file + category/subcategory context
// Format: [componentName, registryFile, insertNearSlug, name, description, tier]
const TO_ADD = [
  // Finance
  ['AutoLeaseCalculator', 'finance.ts', 'auto-loan', 'Auto Lease Calculator', 'Calculate monthly auto lease payments, total cost and compare vs buying.', 'standard'],
  ['CdCalculatorFull', 'finance.ts', 'certificate-of-deposit', 'CD Calculator', 'Calculate certificate of deposit returns with compound interest and maturity value.', 'standard'],
  ['CustomerLifetimeValueCalculator', 'finance.ts', 'customer-acquisition-cost', 'Customer Lifetime Value Calculator', 'Calculate the total revenue a business can expect from a single customer.', 'standard'],
  ['DebtServiceCoverageCalculator', 'finance.ts', 'debt-to-equity', 'Debt Service Coverage Calculator', 'Calculate the DSCR to evaluate ability to service debt from operating income.', 'standard'],
  ['DomainValuationCalculator', 'finance.ts', 'dcf-valuation', 'Domain Valuation Calculator', 'Estimate the market value of a domain name based on traffic and monetization.', 'standard'],
  ['FhaMipCalculator', 'finance.ts', 'mortgage', 'FHA MIP Calculator', 'Calculate FHA mortgage insurance premium (MIP) for upfront and annual costs.', 'standard'],
  ['FifteenVsThirtyMortgageCalculator', 'finance.ts', 'mortgage', '15 vs 30 Year Mortgage Calculator', 'Compare total interest and monthly payments between 15 and 30 year mortgage terms.', 'standard'],
  ['FiveYearOwnershipCostCalculator', 'finance.ts', 'car-loan', '5-Year Car Ownership Cost Calculator', 'Calculate the complete 5-year cost of owning a car including depreciation and insurance.', 'standard'],
  ['Four01kGrowthCalculator', 'finance.ts', 'retirement', '401(k) Growth Calculator', 'Project the growth of your 401(k) retirement savings with employer matching.', 'standard'],
  ['Four03bGrowthCalculator', 'finance.ts', 'retirement', '403(b) Growth Calculator', 'Calculate the projected growth of a 403(b) retirement plan over time.', 'standard'],
  ['Four57bPlanCalculator', 'finance.ts', 'retirement', '457(b) Plan Calculator', 'Estimate deferred compensation growth in a 457(b) governmental plan.', 'standard'],
  ['FourPercentRuleCalculator', 'finance.ts', 'retirement', '4% Rule Calculator', 'Determine how much you need to retire using the 4% safe withdrawal rule.', 'standard'],
  ['HomeLoanEmiIndia', 'finance.ts', 'mortgage', 'Home Loan EMI Calculator (India)', 'Calculate EMI for home loans in India with principal, rate and tenure inputs.', 'standard'],
  ['K401Calculator', 'finance.ts', 'retirement', '401(k) Calculator', 'Calculate 401(k) contributions, employer match and projected balance at retirement.', 'standard'],
  ['LoanDefermentInterestCalculator', 'finance.ts', 'personal-loan', 'Loan Deferment Interest Calculator', 'Calculate accrued interest during a loan deferment period.', 'standard'],
  ['LoanToCostRatioCalculator', 'finance.ts', 'mortgage', 'Loan-to-Cost Ratio Calculator', 'Calculate the LTC ratio for real estate construction and development loans.', 'standard'],
  ['NetWorthTrackerCalc', 'finance.ts', 'net-worth', 'Net Worth Tracker Calculator', 'Track and calculate your net worth by entering assets and liabilities.', 'standard'],
  ['NpvCalculator', 'finance.ts', 'dcf-valuation', 'NPV Calculator', 'Calculate net present value of a series of cash flows at a given discount rate.', 'standard'],
  ['RealEstateCalculatorFull', 'finance.ts', 'cap-rate', 'Real Estate Investment Calculator', 'Comprehensive real estate ROI calculator covering cap rate, cash flow and appreciation.', 'standard'],
  ['StakingRewardsCalculator', 'finance.ts', 'crypto-profit', 'Staking Rewards Calculator', 'Estimate cryptocurrency staking rewards based on APY and staked amount.', 'standard'],
  ['TenYearAveragingDistributionCalculator', 'finance.ts', 'retirement', '10-Year Averaging Distribution Calculator', 'Calculate tax on lump-sum retirement distributions using 10-year averaging.', 'standard'],
  ['TenYearOwnershipCostCalculator', 'finance.ts', 'car-loan', '10-Year Car Ownership Cost Calculator', 'Estimate the total 10-year cost of owning a vehicle including all expenses.', 'standard'],

  // Health
  ['MeatlessDietImpactCalculator', 'health.ts', 'calorie-deficit', 'Meatless Diet Impact Calculator', 'Calculate the environmental and health impact of reducing meat consumption.', 'standard'],
  ['PregnancyWeightTargetCalculator', 'health.ts', 'pregnancy-bmi', 'Pregnancy Weight Target Calculator', 'Calculate recommended pregnancy weight gain targets based on pre-pregnancy BMI.', 'standard'],
  ['TennisFirstServeCalculator', 'health.ts', 'vdot', 'Tennis First Serve Calculator', 'Analyze first serve percentage, speed and point win rate for tennis players.', 'standard'],
  ['ViscerialFatCalculator', 'health.ts', 'body-fat-percentage', 'Visceral Fat Calculator', 'Estimate visceral fat level using waist circumference and body measurements.', 'standard'],

  // Technology
  ['PpiCalculator', 'technology.ts', 'monitor-dpi', 'PPI Calculator', 'Calculate pixels per inch (PPI) for any screen by entering dimensions and resolution.', 'standard'],
  ['PsuCalculator', 'technology.ts', 'server-rack-units', 'PSU Calculator', 'Calculate the recommended power supply unit (PSU) wattage for a PC build.', 'standard'],
  ['SpeedDistanceTimeCalculator', 'technology.ts', 'download-time', 'Speed Distance Time Calculator', 'Calculate speed, distance or time using the classic SDT formula.', 'standard'],
  ['SslCostCalculator', 'technology.ts', 'website-hosting-cost', 'SSL Certificate Cost Calculator', 'Estimate annual SSL certificate costs for websites and web applications.', 'standard'],
  ['ThreeDPrintTimeCalculator', 'technology.ts', 'download-time', '3D Print Time Calculator', 'Estimate 3D printing time based on print volume, speed and layer height.', 'standard'],
  ['ThreeDPrintCharts', 'technology.ts', 'download-time', '3D Print Material Charts', 'Reference charts for 3D printing material properties and settings.', 'standard'],
  ['DomainValuationCalculator', 'technology.ts', 'website-hosting-cost', 'Domain Valuation Calculator', 'Estimate domain name market value based on keywords, length and TLD.', 'standard'],

  // Everyday Life
  ['HpToKwCalculator', 'everyday-life.ts', 'unit-converter', 'HP to kW Calculator', 'Convert horsepower to kilowatts and vice versa for engine and motor specifications.', 'standard'],
  ['MpgCalculator', 'everyday-life.ts', 'unit-converter', 'MPG Calculator', 'Calculate miles per gallon fuel economy from distance traveled and fuel used.', 'standard'],
  ['QuarterToSemesterCreditCalculator', 'education.ts', 'gpa', 'Quarter to Semester Credit Calculator', 'Convert quarter credit hours to semester credit hours for transcript evaluation.', 'standard'],
  ['TeaSteepingCalculator', 'everyday-life.ts', 'cooking-time', 'Tea Steeping Calculator', 'Get precise steeping time and temperature recommendations for different tea types.', 'standard'],
  ['TurkeyRoastingCalculator', 'everyday-life.ts', 'cooking-time', 'Turkey Roasting Calculator', 'Calculate turkey roasting time based on weight and oven temperature.', 'standard'],

  // Engineering
  ['HydraulicRetentionTimeCalculator', 'engineering.ts', 'fluid-flow', 'Hydraulic Retention Time Calculator', 'Calculate the hydraulic retention time for water treatment reactors and tanks.', 'standard'],
];

const REGISTRY_DIR = path.join(__dirname, '../src/domains/calculator/registry');

function toSlug(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function buildEntry(compName, name, description, tier) {
  const slug = toSlug(compName);
  return `  {
    slug: '${slug}',
    name: '${name}',
    description: '${description}',
    tier: '${tier}',
    status: 'live',
    isBuilt: true,
  },`;
}

// Group by registry file
const byFile = {};
for (const [comp, file, , name, desc, tier] of TO_ADD) {
  if (!byFile[file]) byFile[file] = [];
  byFile[file].push({ comp, name, desc, tier });
}

let totalAdded = 0;

for (const [file, items] of Object.entries(byFile)) {
  const filePath = path.join(REGISTRY_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  for (const { comp, name, desc, tier } of items) {
    const slug = toSlug(comp);
    // Skip if already exists
    if (content.includes(`slug: '${slug}'`) || content.includes(`slug: "${slug}"`)) {
      console.log(`⏩ Already exists: ${comp}`);
      continue;
    }

    const entry = '\n' + buildEntry(comp, name, desc, tier) + '\n';
    // Append before the last closing bracket of the export array
    const lastBracket = content.lastIndexOf('];');
    if (lastBracket === -1) {
      console.log(`❌ Could not find export array end in ${file} for ${comp}`);
      continue;
    }
    content = content.slice(0, lastBracket) + entry + content.slice(lastBracket);
    console.log(`✅ Added: ${comp} → ${file}`);
    totalAdded++;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log(`\n✅ Total new entries added: ${totalAdded}`);
