/**
 * biweeklyMortgageLogic.ts — pure calculation cores for the two bi-weekly
 * mortgage calculators. Moved verbatim from the .tsx components so the math
 * can be unit-tested.
 *
 * NOTE on modeling differences (intentional, both are defensible conventions):
 *  - calculateBiweeklyMortgage (BiweeklyMortgageCalculator) accrues interest
 *    as simple interest over 14-day spans (balance × APR/365 × 14).
 *  - calcBiweeklyPayment (BiweeklyMortgagePaymentCalculator) accrues per
 *    bi-weekly period at APR/26 per period. Both round to the same effective
 *    annual rate; results differ only by cents.
 */

export interface BiweeklyMortgageInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  extraBiWeeklyPayment: number;
}

export interface BiweeklyMortgageResults {
  monthlyPayment: number;
  biWeeklyPayment: number;
  standardTotalInterest: number;
  biWeeklyTotalInterest: number;
  interestSaved: number;
  timeSavedYears: number;
  payoffYears: number;
  standardTotalPaid: number;
  biWeeklyTotalPaid: number;
}

export const calculateBiweeklyMortgage = (inputs: BiweeklyMortgageInputs): BiweeklyMortgageResults => {
  const { loanAmount: P, interestRate, loanTerm, extraBiWeeklyPayment } = inputs;

  if (P <= 0 || interestRate <= 0 || loanTerm <= 0) {
    return {
      monthlyPayment: 0, biWeeklyPayment: 0, standardTotalInterest: 0,
      biWeeklyTotalInterest: 0, interestSaved: 0, timeSavedYears: 0, payoffYears: 0,
      standardTotalPaid: 0, biWeeklyTotalPaid: 0
    };
  }

  const monthlyRate = (interestRate / 100) / 12;
  const totalMonths = loanTerm * 12;

  // Standard Monthly Payment
  const M = P * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const standardTotalInterest = (M * totalMonths) - P;
  const standardTotalPaid = M * totalMonths;

  // Bi-Weekly Payment
  const baseBiWeeklyPayment = M / 2;
  const totalBiWeeklyPayment = baseBiWeeklyPayment + extraBiWeeklyPayment;

  // Exact bi-weekly simulation
  const dailyRate = (interestRate / 100) / 365;
  let balance = P;
  let totalInterestBiWeekly = 0;
  let biWeeklyPaymentsCount = 0;

  while (balance > 0.01 && biWeeklyPaymentsCount < 10000) {
    biWeeklyPaymentsCount++;
    // Interest accrues over 14 days
    const interestForPeriod = balance * dailyRate * 14;
    totalInterestBiWeekly += interestForPeriod;

    let principalPaid = totalBiWeeklyPayment - interestForPeriod;
    if (principalPaid > balance) principalPaid = balance;

    balance -= principalPaid;
  }

  const payoffYears = (biWeeklyPaymentsCount * 14) / 365;
  const timeSavedYears = Math.max(0, loanTerm - payoffYears);
  const interestSaved = Math.max(0, standardTotalInterest - totalInterestBiWeekly);
  const biWeeklyTotalPaid = P + totalInterestBiWeekly;

  return {
    monthlyPayment: M,
    biWeeklyPayment: totalBiWeeklyPayment,
    standardTotalInterest,
    biWeeklyTotalInterest: totalInterestBiWeekly,
    interestSaved,
    timeSavedYears,
    payoffYears,
    standardTotalPaid,
    biWeeklyTotalPaid
  };
};

// --- BiweeklyMortgagePaymentCalculator core ---------------------------------

export interface BiweeklyPaymentInputs {
  balance: number;
  apr: number;
  termYears: number;
}

export interface BiweeklyPaymentResult {
  monthlyPayment: number;
  biweeklyPayment: number;
  monthlyPayoffMonths: number;
  biweeklyPayoffMonths: number;
  yearsSaved: string;
  interestMonthly: number;
  interestBiweekly: number;
  interestSaved: number;
  totalBiweeklyPaid: number;
  chartData: { label: string; monthly: number; biweekly: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function balAfterMonthly(p: number, r: number, pay: number, months: number) {
  let b = p;
  for (let m = 0; m < months && b > 0.5; m++) {
    const int = b * r;
    b = b + int - Math.min(pay, b + int);
  }
  return b;
}
function balAfterBiweekly(p: number, r: number, pay: number, periods: number) {
  let b = p;
  for (let k = 0; k < periods && b > 0.5; k++) {
    const int = b * r;
    b = b + int - Math.min(pay, b + int);
  }
  return b;
}

export function calcBiweeklyPayment(inp: BiweeklyPaymentInputs): BiweeklyPaymentResult {
  const rM = inp.apr / 100 / 12;
  const nMonthly = inp.termYears * 12;
  const monthlyPayment = rM > 0 ? (inp.balance * rM * Math.pow(1 + rM, nMonthly)) / (Math.pow(1 + rM, nMonthly) - 1) : inp.balance / nMonthly;
  const biweeklyPayment = monthlyPayment / 2;

  // Biweekly schedule: 26 equal 2-week periods per year. US loans accrue
  // simple interest per period, so the 2-week rate is the APR divided by the
  // number of periods per year: rB = APR/26 (≈ daily-simple interest over 14 days).
  const rB = inp.apr / 100 / 26;

  let balM = inp.balance;
  let tiM = 0;
  let moM = 0;
  while (balM > 0.5 && moM < nMonthly + 1) {
    moM++;
    const int = balM * rM;
    const paid = Math.min(monthlyPayment, balM + int);
    tiM += int;
    balM = balM + int - paid;
  }

  let balB = inp.balance;
  let tiB = 0;
  let perB = 0;
  const capB = nMonthly * 2 + 26;
  while (balB > 0.5 && perB < capB) {
    perB++;
    const int = balB * rB;
    const paid = Math.min(biweeklyPayment, balB + int);
    tiB += int;
    balB = balB + int - paid;
  }
  const biweeklyPayoffMonths = Math.round((perB / 26) * 12);
  const interestMonthly = tiM;
  const interestBiweekly = tiB;
  const interestSaved = Math.max(0, interestMonthly - interestBiweekly);
  const totalBiweeklyPaid = inp.balance + tiB;

  const yDiff = nMonthly / 12 - biweeklyPayoffMonths / 12;
  const yearsSaved = (Math.floor(yDiff * 12) + " mo").replace(" mo", " months");

  // Sample remaining balances once per year for the chart.
  const chartData: { label: string; monthly: number; biweekly: number }[] = [];
  for (let y = 0; y <= inp.termYears; y++) {
    const mIdx = y * 12;
    const pIdx = Math.min(y * 26, perB);
    chartData.push({
      label: y === 0 ? "Start" : "Yr " + y,
      monthly: mIdx >= moM ? 0 : Math.round(balAfterMonthly(inp.balance, rM, monthlyPayment, mIdx)),
      biweekly: pIdx >= perB ? 0 : Math.round(balAfterBiweekly(inp.balance, rB, biweeklyPayment, pIdx)),
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Mortgage Balance", value: fmt(inp.balance) },
    { label: "APR", value: inp.apr + "%" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Biweekly Payment (Half)", value: fmtD(biweeklyPayment), highlight: true },
    { label: "Monthly Payoff Time", value: moM + " months (" + inp.termYears + " yrs)" },
    { label: "Biweekly Payoff Time", value: biweeklyPayoffMonths + " months", highlight: true },
    { label: "Time Saved", value: yearsSaved },
    { label: "Interest (Monthly Plan)", value: fmt(interestMonthly) },
    { label: "Interest (Biweekly Plan)", value: fmt(interestBiweekly) },
    { label: "Interest Saved", value: fmt(interestSaved), isTotal: true },
    { label: "Total Paid (Biweekly)", value: fmt(totalBiweeklyPaid), isTotal: true },
  ];

  const summaryStats = [
    { label: "Biweekly Payment", value: fmtD(biweeklyPayment) },
    { label: "Payoff Time", value: biweeklyPayoffMonths + " months" },
    { label: "Time Saved", value: yearsSaved },
    { label: "Interest Saved", value: fmt(interestSaved) },
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Interest (Monthly)", value: fmt(interestMonthly) },
    { label: "Interest (Biweekly)", value: fmt(interestBiweekly) },
    { label: "Total Paid (Biweekly)", value: fmt(totalBiweeklyPaid) },
  ];

  return { monthlyPayment, biweeklyPayment, monthlyPayoffMonths: moM, biweeklyPayoffMonths, yearsSaved, interestMonthly, interestBiweekly, interestSaved, totalBiweeklyPaid, chartData, breakdown, summaryStats };
}
