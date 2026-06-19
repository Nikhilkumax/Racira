const { calculatePmi } = require("./src/calculators/pmiLogic");

const baseInputs = {
  homeValue: 400000,
  dpMode: "percent",
  dpPct: 10,
  dpAmt: 40000,
  interestRate: 6.5,
  loanTerm: 30,
  creditScore: 720,
  loanType: "conventional",
  propertyUse: "primary",
  startMonth: "Jan",
  startYear: "2026",
  pmiMode: "auto",
  manualPmiRate: 0,
  propertyTax: 0,
  homeInsurance: 0,
  hoaFee: 0,
  extraMonthly: 0,
  oneTimeExtra: 0,
  annualExtra: 0,
  fhaMipMode: "auto",
  manualFhaMipRate: 0,
  vaFundingFeeRate: 0,
  appreciationRate: 0,
};

const monthly = calculatePmi({ ...baseInputs, paymentFreq: "monthly" });
const biweekly = calculatePmi({ ...baseInputs, paymentFreq: "biweekly" });

console.log("=== MONTHLY ===");
console.log(`Payment: $${monthly.periodicTotal.toFixed(2)} /mo`);
console.log(`Total Interest: $${monthly.totalInterest.toFixed(2)}`);
console.log(`PMI Ends: ${monthly.pmiCancelDate} (Month ${monthly.pmiCancelMonth})`);
console.log(`Total PMI Cost: $${monthly.totalPmiCost.toFixed(2)}`);
console.log(`Payoff Months: ${monthly.payoffMonths}`);

console.log("\n=== BI-WEEKLY ===");
console.log(`Payment: $${biweekly.periodicTotal.toFixed(2)} /bi-wk`);
console.log(`Total Interest: $${biweekly.totalInterest.toFixed(2)}`);
console.log(`PMI Ends: ${biweekly.pmiCancelDate} (Month ${biweekly.pmiCancelMonth})`);
console.log(`Total PMI Cost: $${biweekly.totalPmiCost.toFixed(2)}`);
console.log(`Payoff Months: ${biweekly.payoffMonths}`);
