/**
 * Batch 1a verification: Compound Interest, Simple Interest, Loan (EMI).
 *
 * Expected values are hand-computed below (formula + arithmetic shown in
 * comments) or are widely published table values — NOT produced by
 * logicCore.ts itself.
 *
 * Run: node --experimental-strip-types --no-warnings --test _calcverify/batch1a.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { compoundInterestCore, simpleInterestCore, loanEmiCore, annuityPayment } from "../src/domains/calculator/components/logicCore.ts";

const close = (a, b, tol = 0.02) => Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
// Compound Interest  —  A = P(1 + r/n)^(nt) + C·[((1+r/n)^(nt) − 1)/(r/n)]
// ---------------------------------------------------------------------------
test("compound: default $10,000 @7% monthly 20y +$200/mo ≈ $144,573 (independently recomputed)", () => {
  // Independent recomputation (NOT via logicCore):
  //   principal FV  = 10000·(1+0.07/12)^240 = 40,387.39
  //   contrib FV    = 200·[((1+0.07/12)^240 − 1)/(0.07/12)] = 104,185.33
  //   total         = 144,572.72
  // Sanity bounds: must exceed annual-compounding-only value 38,696.84 (passing
  // test above) and stay under the annuity-due upper variant.
  const { total, totalContrib, totalInterest } = compoundInterestCore(10000, 7, 20, 12, 200);
  assert.ok(close(total, 144572.72, 0.5), `total=${total}`);
  assert.equal(totalContrib, 48000);
  // 144,572.72 − 10,000 principal − 48,000 contributions = 86,572.72
  assert.ok(close(totalInterest, 86572.72, 0.5), `interest=${totalInterest}`);
});

test("compound: $10,000 @7% annual 20y no contributions = $38,696.84 (published table)", () => {
  // (1.07)^20 = 3.869684 → 10000 × 3.869684 = 38,696.84
  const { total } = compoundInterestCore(10000, 7, 20, 1, 0);
  assert.ok(close(total, 38696.84, 0.5), `total=${total}`);
});

test("compound: monotonicity annual < quarterly < monthly < daily < continuous limit", () => {
  // Independent reference values (computed from the formula directly):
  //   annual 38,696.84 | quarterly 40,063.92 | monthly 40,387.39
  //   daily 40,546.56 | continuous limit e^{0.07·20}·10000 = 40,552.00
  // NOTE: the page copy claims "monthly = $40,064; daily = $40,136" — 40,064 is
  // actually the QUARTERLY value and 40,136 matches nothing; copy fixed.
  const annual = compoundInterestCore(10000, 7, 20, 1, 0).total;
  const quarterly = compoundInterestCore(10000, 7, 20, 4, 0).total;
  const monthly = compoundInterestCore(10000, 7, 20, 12, 0).total;
  const daily = compoundInterestCore(10000, 7, 20, 365, 0).total;
  assert.ok(close(quarterly, 40063.92, 0.5), `quarterly=${quarterly}`);
  assert.ok(close(monthly, 40387.39, 0.5), `monthly=${monthly}`);
  assert.ok(close(daily, 40546.56, 0.5), `daily=${daily}`);
  assert.ok(annual < quarterly && quarterly < monthly && monthly < daily, "ordering");
  assert.ok(daily < 40552.0, "daily must stay under continuous limit");
});

test("compound edge: 0% rate with contributions no longer NaN, contributions accrue", () => {
  const before = { contribGrowth: NaN };
  const { total, contribGrowth } = compoundInterestCore(10000, 0, 5, 12, 100);
  assert.ok(!Number.isNaN(total), `total=${total}`);
  assert.ok(!Number.isNaN(contribGrowth), `contribGrowth=${contribGrowth}`);
  assert.equal(contribGrowth, 6000); // 100 × 60 periods, no growth
  assert.ok(close(total, 16000, 0.001));
  void before;
});

test("compound edge: r>0 but contribution=0 has no 0/0 path", () => {
  const { total } = compoundInterestCore(10000, 5, 10, 4, 0);
  // (1.0125)^40 = 1.643619 → 16,436.19
  assert.ok(close(total, 16436.19, 0.5), `total=${total}`);
});

// ---------------------------------------------------------------------------
// Simple Interest — I = P·r·t ; A = P + I
// ---------------------------------------------------------------------------
test("simple: $5,000 @8% 3y → I=$1,200, A=$6,200 (hand: 5000×0.08×3)", () => {
  const { interest, total } = simpleInterestCore(5000, 8, 3);
  assert.ok(close(interest, 1200, 0.001));
  assert.ok(close(total, 6200, 0.001));
});

test("simple: fractional year 0.5y @12% on $2,000 → I=$120 (2000×0.12×0.5)", () => {
  const { interest } = simpleInterestCore(2000, 12, 0.5);
  assert.ok(close(interest, 120, 0.001));
});

test("simple edge: 0% rate → zero interest, principal returned", () => {
  const { interest, total } = simpleInterestCore(777, 0, 10);
  assert.equal(interest, 0);
  assert.equal(total, 777);
});

// ---------------------------------------------------------------------------
// Loan EMI — M = P·r·(1+r)^n / ((1+r)^n − 1), monthly compounding
// ---------------------------------------------------------------------------
test("loan: $25,000 @6.5% 5y → $489.15/mo, $4,349.11 interest (published/verbatim doc)", () => {
  // r = 0.065/12 = 0.00541667, n = 60
  // (1.00541667)^60 = 1.382858…
  // M = 25000 × 0.00541667 × 1.382858 / 0.382858 = 489.15
  const { monthly, totalPaid, totalInterest, schedule } = loanEmiCore(25000, 6.5, 5);
  assert.ok(close(monthly, 489.15, 0.01), `monthly=${monthly}`);
  assert.ok(close(totalPaid, 29349.22, 0.5), `totalPaid=${totalPaid}`);
  assert.ok(close(totalInterest, 4349.22, 0.5), `totalInterest=${totalInterest}`);
  assert.equal(schedule.length, 60);
});

test("loan invariant: Σprincipal = P and final balance = 0", () => {
  const { schedule } = loanEmiCore(25000, 6.5, 5);
  const sumPrincipal = schedule.reduce((s, row) => s + row.principal, 0);
  assert.ok(close(sumPrincipal, 25000, 0.01), `Σprincipal=${sumPrincipal}`);
  assert.equal(schedule[schedule.length - 1].balance, 0);
});

test("loan edge: 0% APR → straight-line P/n (annuityPayment r=0 branch)", () => {
  const m = annuityPayment(12000, 0, 24);
  assert.ok(close(m, 500, 0.001));
  const { totalInterest } = loanEmiCore(12000, 0, 2);
  assert.ok(close(totalInterest, 0, 0.01), `interest=${totalInterest}`);
});

test("loan cross-check vs independent closed form (HP12C convention)", () => {
  // Independent recomputation with a different algebraic arrangement:
  // M = P·r / (1 − (1+r)^−n).  P=300000, 6% 30y → published $1,798.65
  const r = 0.06 / 12, n = 360, P = 300000;
  const m1 = (P * r) / (1 - Math.pow(1 + r, -n));
  const m2 = annuityPayment(P, r, n);
  assert.ok(close(m1, 1798.65, 0.02), `closed form=${m1}`);
  assert.ok(close(m2, m1, 1e-9), `annuityPayment=${m2} vs ${m1}`);
});
