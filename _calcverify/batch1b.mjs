/**
 * Batch 1b verification: Home Loan Calculator, Auto Loan Calculator.
 * These cores are moved VERBATIM from the .tsx components; the tests below
 * verify the moved math against independently computed reference values
 * (reciprocal closed form M = P·r/(1 − (1+r)^−n)) and hand-derived
 * downstream quantities. No expected value is taken from the
 * implementation being tested.
 *
 * Run: node --experimental-strip-types --no-warnings --test _calcverify/batch1b.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateHomeLoan } from "../src/domains/calculator/components/homeLoanLogic.ts";
import { calculateAutoLoan } from "../src/domains/calculator/components/autoLoanLogic.ts";

const close = (a, b, tol = 0.02) => Math.abs(a - b) <= tol;

/** Independent annuity payment via the reciprocal closed form (NOT the code's form). */
const M = (P, apr, n) => {
  const r = apr / 100 / 12;
  return (P * r) / (1 - Math.pow(1 + r, -n));
};

// ---------------------------------------------------------------------------
// Home Loan — 20% down on $350k = $280,000 financed, 6.8% / 30y
// Monthly escrow by hand: 4200/12 = 350.00; 1400/12 = 116.67
// ---------------------------------------------------------------------------
test("home loan: standard case matches independent closed form + escrow arithmetic", () => {
  const res = calculateHomeLoan({
    propertyPrice: 350000, downPaymentPct: 20, downPaymentAmt: 70000, dpMode: "percent",
    interestRate: 6.8, loanTerm: 30, annualPropertyTax: 4200, annualInsurance: 1400, monthlyHoa: 0,
  });
  assert.equal(res.loanAmount, 280000);
  assert.ok(close(res.monthlyPI, M(280000, 6.8, 360), 0.01), `PI=${res.monthlyPI}`);
  assert.ok(close(res.monthlyPI, 1825.39, 0.01), `PI published=${res.monthlyPI}`);
  assert.ok(close(res.monthlyTax, 350, 1e-9));
  assert.ok(close(res.monthlyInsurance, 116.67, 0.01));
  assert.ok(close(res.totalMonthlyPayment, 1825.39 + 350 + 116.67, 0.02), `total=${res.totalMonthlyPayment}`);
  assert.ok(close(res.totalInterestPaid, 377140.59, 1.0), `interest=${res.totalInterestPaid}`);
  assert.equal(res.monthlyRows.length, 360, "full 360-row schedule");
  assert.equal(res.yearlyRows.length, 30, "30 yearly rows");
  // Invariant: Σ principal rows = loan amount; final balance 0
  const sumP = res.monthlyRows.reduce((s, r) => s + r.principal, 0);
  assert.ok(close(sumP, 280000, 0.01), `sumP=${sumP}`);
  // Final balance carries only FP residue (< 1e-8) — renders as $0.00 in the table.
  assert.ok(Math.abs(res.monthlyRows[359].balance) < 1e-6, `final=${res.monthlyRows[359].balance}`);
});

test("home loan: amount-mode down payment and 0% rate branch", () => {
  // $120,000 − $20,000 down = $100,000 @ 0% for 10y → P/120 = 833.33/mo, zero interest
  const res = calculateHomeLoan({
    propertyPrice: 120000, downPaymentPct: 0, downPaymentAmt: 20000, dpMode: "amount",
    interestRate: 0, loanTerm: 10, annualPropertyTax: 0, annualInsurance: 0, monthlyHoa: 0,
  });
  assert.equal(res.loanAmount, 100000);
  assert.ok(close(res.monthlyPI, 833.33, 0.01), `PI=${res.monthlyPI}`);
  assert.ok(close(res.totalInterestPaid, 0, 0.01), `interest=${res.totalInterestPaid}`);
});

test("home loan edge: 100% down → zero loan, zero payment, no NaN", () => {
  const res = calculateHomeLoan({
    propertyPrice: 100000, downPaymentPct: 100, downPaymentAmt: 0, dpMode: "percent",
    interestRate: 5, loanTerm: 30, annualPropertyTax: 0, annualInsurance: 0, monthlyHoa: 0,
  });
  assert.equal(res.loanAmount, 0);
  assert.equal(res.monthlyPI, 0);
  assert.equal(res.totalInterestPaid, 0);
  assert.ok(Number.isFinite(res.totalMonthlyPayment));
});

// ---------------------------------------------------------------------------
// Auto Loan — $35,000, $5k down, $4k trade-in, 7% tax, $750 fees, 6.5%/60mo
// Hand: taxable = 35000 − 4000 = 31000 → tax = 2,170.00
//       fees = 250 + 500 = 750; netTrade = 4000 − 0 = 4000
//       financed = 35000 − 5000 − 4000 − 0 + 2170 + 750 = 28,920.00
// ---------------------------------------------------------------------------
test("auto loan: tax on price-minus-trade, fees, financed amount, payment", () => {
  const res = calculateAutoLoan({
    vehiclePrice: 35000, downPaymentAmt: 5000, tradeInValue: 4000, amountOwedOnTradeIn: 0,
    salesTaxRate: 7, titleAndRegistrationFees: 250, otherDealerFees: 500, cashIncentives: 0,
    interestRate: 6.5, loanTermMonths: 60, includeTaxAndFeesInLoan: true,
  });
  assert.ok(close(res.totalSalesTax, 2170.0, 0.01), `tax=${res.totalSalesTax}`);
  assert.equal(res.totalFees, 750);
  assert.ok(close(res.totalLoanAmount, 28920, 0.01), `loan=${res.totalLoanAmount}`);
  assert.ok(close(res.monthlyPayment, M(28920, 6.5, 60), 0.01), `pay=${res.monthlyPayment}`);
  assert.ok(close(res.monthlyPayment, 565.85, 0.01), `pay published=${res.monthlyPayment}`);
  assert.ok(close(res.totalInterestPaid, 5031.18, 1.0), `interest=${res.totalInterestPaid}`);
  // Out of pocket at purchase = down payment only (tax/fees financed)
  const oop = 5000;
  const totalCostHand = oop + 60 * 565.85;
  assert.ok(close(res.totalCostOfVehicle, totalCostHand, 1.0), `cost=${res.totalCostOfVehicle}`);
  assert.equal(res.monthlyRows.length, 60);
  const sumP = res.monthlyRows.reduce((s, r) => s + r.principal, 0);
  assert.ok(close(sumP, 28920, 0.01));
});

test("auto loan: tax/fees paid in cash shrink the loan, not the payment base", () => {
  // financed = 35000 − 5000 − 4000 + 0 (tax/fees in cash) = 26,000
  const res = calculateAutoLoan({
    vehiclePrice: 35000, downPaymentAmt: 5000, tradeInValue: 4000, amountOwedOnTradeIn: 0,
    salesTaxRate: 7, titleAndRegistrationFees: 250, otherDealerFees: 500, cashIncentives: 0,
    interestRate: 6.5, loanTermMonths: 60, includeTaxAndFeesInLoan: false,
  });
  assert.ok(close(res.totalLoanAmount, 26000, 0.01), `loan=${res.totalLoanAmount}`);
  assert.ok(close(res.monthlyPayment, M(26000, 6.5, 60), 0.01), `pay=${res.monthlyPayment}`);
  assert.ok(close(res.monthlyPayment, 508.72, 0.01));
});

test("auto loan edge: underwater trade-in (owed > value) increases amount financed", () => {
  // netTrade = 4000 − 5000 = −1000
  // financed = 35000 − 5000 − (−1000) − 0 + 2170 + 750 = 33,920
  const res = calculateAutoLoan({
    vehiclePrice: 35000, downPaymentAmt: 5000, tradeInValue: 4000, amountOwedOnTradeIn: 5000,
    salesTaxRate: 7, titleAndRegistrationFees: 250, otherDealerFees: 500, cashIncentives: 0,
    interestRate: 6.5, loanTermMonths: 60, includeTaxAndFeesInLoan: true,
  });
  assert.ok(close(res.totalLoanAmount, 33920, 0.01), `loan=${res.totalLoanAmount}`);
  assert.ok(close(res.monthlyPayment, M(33920, 6.5, 60), 0.01), `pay=${res.monthlyPayment}`);
  assert.ok(close(res.monthlyPayment, 663.68, 0.01));
});

test("auto loan edge: huge down payment → zero loan, zero payment, no NaN", () => {
  const res = calculateAutoLoan({
    vehiclePrice: 30000, downPaymentAmt: 50000, tradeInValue: 0, amountOwedOnTradeIn: 0,
    salesTaxRate: 0, titleAndRegistrationFees: 0, otherDealerFees: 0, cashIncentives: 0,
    interestRate: 6.5, loanTermMonths: 60, includeTaxAndFeesInLoan: false,
  });
  assert.equal(res.totalLoanAmount, 0);
  assert.equal(res.monthlyPayment, 0);
  assert.ok(Number.isFinite(res.totalCostOfVehicle));
  assert.equal(res.monthlyRows.length, 0);
});
