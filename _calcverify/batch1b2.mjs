/**
 * Batch 1b2 verification: Amortization Calculator + Mortgage Calculator.
 * Cores moved verbatim into amortizationLogic.ts / mortgageLogic.ts.
 * Expected values are computed independently in-line (different closed forms,
 * NPER formula) or by hand arithmetic — never by calling the code under test.
 *
 * Run: node --experimental-strip-types --no-warnings --test _calcverify/batch1b2.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateAmortization } from "../src/domains/calculator/components/amortizationLogic.ts";
import { calculateMortgage } from "../src/domains/calculator/components/mortgageLogic.ts";

const close = (a, b, tol = 0.02) => Math.abs(a - b) <= tol;
const M = (P, apr, n) => {
  const r = apr / 100 / 12;
  return (P * r) / (1 - Math.pow(1 + r, -n));
};

// ---------------------------------------------------------------------------
// Amortization — $300,000 @ 6.5% / 30y. Reference: M = 1896.20,
// std total interest = 1896.20×360 − 300000 = 382,633.47
// ---------------------------------------------------------------------------
test("amortization: baseline schedule matches closed form and NPER-derived payoff", () => {
  const res = calculateAmortization({ loanAmount: 300000, interestRate: 6.5, loanTermYears: 30, extraMonthlyPayment: 0 });
  assert.ok(close(res.monthlyPayment, 1896.20, 0.01), `pay=${res.monthlyPayment}`);
  assert.ok(close(res.totalInterest, 382633.47, 1.0), `interest=${res.totalInterest}`);
  assert.equal(res.monthsToPayoff, 360);
  assert.equal(res.monthsSaved, 0);
  // interestSaved is closed-form minus loop-sum interest: FP residue only.
  assert.ok(Math.abs(res.interestSaved) < 0.01, `saved=${res.interestSaved}`); // displays $0.00
});

test("amortization: +$100/mo extra → payoff ≈312 months (NPER: −ln(1−rP/M)/ln(1+r))", () => {
  // Independent NPER: r = 0.065/12, M = 1896.20+100 = 1996.20 → n ≈ 311.4
  // Loop counts a final partial period → 312 months.
  const res = calculateAmortization({ loanAmount: 300000, interestRate: 6.5, loanTermYears: 30, extraMonthlyPayment: 100 });
  assert.ok(res.monthsToPayoff >= 311 && res.monthsToPayoff <= 313, `months=${res.monthsToPayoff}`);
  assert.ok(close(res.monthsSaved, 360 - res.monthsToPayoff, 0.01));
  // Interest saved must be positive and large (a 48-month acceleration on 300k)
  assert.ok(res.interestSaved > 20000, `saved=${res.interestSaved}`);
  // Final row balance ~0, sum of principal = loan
  const sumP = res.monthlyRows.reduce((s, r) => s + r.principal, 0);
  assert.ok(close(sumP, 300000, 0.01), `sumP=${sumP}`);
});

test("amortization edge: extra ≥ payment balance pays off in 1 month", () => {
  const res = calculateAmortization({ loanAmount: 12000, interestRate: 6, loanTermYears: 5, extraMonthlyPayment: 50000 });
  assert.equal(res.monthsToPayoff, 1);
  assert.ok(close(res.monthlyRows[0].balance, 0, 1e-6), `bal=${res.monthlyRows[0].balance}`);
});

test("amortization edge: 0% rate with extras still terminates, zero interest", () => {
  const res = calculateAmortization({ loanAmount: 24000, interestRate: 0, loanTermYears: 4, extraMonthlyPayment: 100 });
  assert.ok(close(res.monthlyPayment, 500, 0.01));
  assert.ok(close(res.totalInterest, 0, 0.01), `interest=${res.totalInterest}`);
  assert.equal(res.monthsToPayoff, 40); // 24000 / 600 = 40 months
});

// ---------------------------------------------------------------------------
// Mortgage — $400k home, 20% down → P = 320,000 @ 6.5% / 30y, tax 3600/yr,
// ins 1200/yr, PMI $150/mo (NOT active: LTV 0.80 is not > 0.80)
// Reference PI = 2022.62; monthly escrows: 300.00 + 100.00 + 0 + 0 + 0
// ---------------------------------------------------------------------------
const mortgageInputsA = {
  homePriceVal: 400000, dpModeVal: "percent", dpPctVal: 20, dpAmtVal: 80000,
  interestRateVal: 6.5, loanTermVal: 30, startDateVal: "2026-Sep",
  extraMonthlyVal: 0, oneTimeExtraVal: 0, annualExtraVal: 0,
  propertyTaxVal: 3600, homeInsuranceVal: 1200, pmiVal: 150,
  hoaFeeVal: 0, otherCostsVal: 0, paymentFreqVal: "monthly",
};
const Mref = (P, apr, nPeriods, periodsPerYear) => {
  const r = apr / 100 / periodsPerYear;
  return (P * r) / (1 - Math.pow(1 + r, -nPeriods));
};

test("mortgage: 20% down → no PMI (LTV 0.80 not > 0.80), full PITI arithmetic", () => {
  const res = calculateMortgage(mortgageInputsA);
  assert.ok(close(res.loanAmount, 320000, 1e-6), `loan=${res.loanAmount}`);
  assert.ok(close(res.monthlyPI, 2022.62, 0.01), `PI=${res.monthlyPI}`);
  // totalMonthly = PI + 3600/12 + 1200/12 + PMI(0) + HOA(0) + other(0)
  assert.ok(close(res.totalMonthly, 2022.62 + 300 + 100, 0.02), `totalMonthly=${res.totalMonthly}`);
  assert.ok(close(res.totalPmiCost, 0, 1e-9), `pmi=${res.totalPmiCost}`);
  assert.equal(res.monthlyRows.length, 360);
  const sumP = res.monthlyRows.reduce((s, r) => s + r.principal, 0);
  assert.ok(close(sumP, 320000, 0.01), `sumP=${sumP}`);
  // Interest: 2022.62×360 − 320000 = 408,142.36 (loop-accurate within cents)
  assert.ok(close(res.totalInterest, 408142.36, 1.0), `interest=${res.totalInterest}`);
});

test("mortgage: 10% down → PMI active, accrues on declining balance until LTV ≤ 0.80", () => {
  // P = 360,000; LTV0 = 0.90 > 0.80 → PMI on. pmiVal=150 → annualPmiRate = 150·12/360000 = 0.005/yr.
  // Month-1 PMI = 0.005·360000/12 = 150.00, declining as balance falls.
  const res = calculateMortgage({ ...mortgageInputsA, dpPctVal: 10 });
  assert.ok(close(res.loanAmount, 360000, 1e-6));
  assert.ok(res.totalPmiCost > 0, `pmi=${res.totalPmiCost}`);
  // First period's PMI portion: payment1 − PI − principal1... verify via first-row decomposition:
  // row1 = PI + principal1? No: row.payment = interest + principal; PMI is NOT in rows.
  // Instead: totalPmiCost < naive ceiling 150×360 and ≥ 12 payments' worth while active.
  assert.ok(res.totalPmiCost < 150 * 360, "PMI must cancel before term end");
  assert.ok(res.totalPmiCost > 150 * 24, "PMI should last well over 2 years at 10% down");
});

test("mortgage: extra $200/mo → interestSaved > 0 and payoff earlier than 30y", () => {
  const res = calculateMortgage({ ...mortgageInputsA, extraMonthlyVal: 200 });
  assert.ok(res.interestSaved > 0, `saved=${res.interestSaved}`);
  assert.ok(res.timeSavedMonths > 0, `timeSaved=${res.timeSavedMonths}`);
  assert.ok(res.monthlyRows.length < 360, `rows=${res.monthlyRows.length}`);
  // Payoff date math: start Sep 2026, ~307 months for base+200 → ≈ Aug 2052 (±3 mo)
  const [, yrStr] = res.payoffDate.split(" ");
  const py = parseInt(yrStr, 10);
  assert.ok(py >= 2050 && py <= 2054, `payoff=${res.payoffDate}`);
});

test("mortgage: biweekly mode — 26 periods/yr, per-period PI = 933.08 (independent)", () => {
  // r = 0.065/26, n = 780 → M = 933.08
  const res = calculateMortgage({ ...mortgageInputsA, paymentFreqVal: "biweekly" });
  assert.ok(close(res.monthlyPI, 933.08, 0.01), `biweeklyPI=${res.monthlyPI}`);
  assert.equal(res.monthlyRows.length, 780);
  // Escrow per biweekly period: 3600/26 + 1200/26 = 138.46 + 46.15
  assert.ok(close(res.totalMonthly, 933.08 + 3600 / 26 + 1200 / 26, 0.02), `total=${res.totalMonthly}`);
});

test("mortgage edge: 100% down → guarded zero result, no NaN", () => {
  const res = calculateMortgage({ ...mortgageInputsA, dpPctVal: 100 });
  assert.equal(res.monthlyPI, 0);
  assert.equal(res.totalMonthly, 0);
  assert.ok(Number.isFinite(res.totalCost));
  assert.equal(res.payoffDate, "N/A");
});

test("mortgage payoff-date: Sep 2026 + 360 monthly periods → Sep 2056", () => {
  const res = calculateMortgage(mortgageInputsA);
  assert.equal(res.payoffDate, "Sep 2056");
});
