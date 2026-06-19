function calculate(inputs) {
  const errors = [];
  const sales = inputs.netCreditSales;
  const begAR = inputs.beginningAR;
  const endAR = inputs.endingAR;
  const days = inputs.workingDays;
  const terms = inputs.creditTerms;
  const benchmark = inputs.industryBenchmark;
  const badDebt = inputs.badDebtPercent;
  const overdue = inputs.overdueReceivables;

  const avgAR = (begAR + endAR) / 2;
  const dailyCreditSales = days > 0 ? sales / days : 0;
  const thirtyDayArEstimate = dailyCreditSales * 30;
  const netChangeInAR = begAR - endAR;

  let arTurnover = null;
  let dso = null;

  if (sales <= 0) {
    errors.push("Net Credit Sales must be greater than 0");
  } else if (avgAR <= 0) {
    errors.push("Average AR must be greater than 0");
  } else if (days <= 0) {
    errors.push("Days in Period must be greater than 0");
  } else {
    arTurnover = sales / avgAR;
    dso = days / arTurnover;
  }

  let gapVsTermsDays = null;
  let gapVsTermsPercent = null;
  let gapVsBenchmarkDays = null;
  let gapVsBenchmarkPercent = null;
  let cashReleasePotential = null;
  let workingCapitalOpportunity = null;
  let overdueARRatio = null;
  let collectionRiskScore = null;
  let riskBand = null;

  if (dso !== null) {
    if (terms > 0) {
      gapVsTermsDays = dso - terms;
      gapVsTermsPercent = (gapVsTermsDays / terms) * 100;
      workingCapitalOpportunity = (dso - terms) * dailyCreditSales;
    }
    if (benchmark > 0) {
      gapVsBenchmarkDays = dso - benchmark;
      gapVsBenchmarkPercent = (gapVsBenchmarkDays / benchmark) * 100;
      cashReleasePotential = (dso - benchmark) * dailyCreditSales;
    }
  }

  if (avgAR > 0) {
    if (overdue > avgAR) {
      errors.push("Overdue Receivables cannot exceed Average AR.");
    }
    overdueARRatio = (overdue / avgAR) * 100;
  }

  if (overdueARRatio !== null) {
    let score = (badDebt * 0.5) + (overdueARRatio * 0.5);
    if (score > 100) score = 100;
    collectionRiskScore = score;
    
    if (score <= 20) riskBand = "Low Risk";
    else if (score <= 50) riskBand = "Moderate Risk";
    else riskBand = "High Risk";
  }

  return {
    avgAR, arTurnover, dso, dailyCreditSales, thirtyDayArEstimate, netChangeInAR,
    gapVsTermsDays, gapVsTermsPercent, gapVsBenchmarkDays, gapVsBenchmarkPercent,
    cashReleasePotential, workingCapitalOpportunity, overdueARRatio, collectionRiskScore, riskBand,
    errors
  };
}

const DEFAULTS = {
  netCreditSales: 500000,
  beginningAR: 80000,
  endingAR: 70000,
  workingDays: 365,
  creditTerms: 30,
  industryBenchmark: 45,
  badDebtPercent: 2.0,
  overdueReceivables: 25000
};

console.log("=== STANDARD ===");
console.log(calculate({...DEFAULTS, creditTerms:0, industryBenchmark:0, badDebtPercent:0, overdueReceivables:0}));

console.log("\n=== PROFESSIONAL ===");
console.log(calculate(DEFAULTS));

console.log("\n=== EDGE CASE: Zero Sales ===");
console.log(calculate({...DEFAULTS, netCreditSales: 0}));

console.log("\n=== EDGE CASE: Zero AR ===");
console.log(calculate({...DEFAULTS, beginningAR: 0, endingAR: 0}));

console.log("\n=== EDGE CASE: Ending > Beginning (Negative Net Change) ===");
console.log(calculate({...DEFAULTS, beginningAR: 70000, endingAR: 80000}));

console.log("\n=== EDGE CASE: Non-365 Days (e.g. 91) ===");
console.log(calculate({...DEFAULTS, workingDays: 91}));
