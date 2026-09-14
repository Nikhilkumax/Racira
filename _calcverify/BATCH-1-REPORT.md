# Batch 1 Report — Calculator Functional Verification (Finance)

**Scope:** 15 finance calculators. Stopping here per protocol — awaiting explicit "proceed" before Batch 2.

**How to re-run everything yourself (no trust required):**

```
node --experimental-strip-types --no-warnings --test _calcverify/batch1a.mjs _calcverify/batch1b.mjs _calcverify/batch1b2.mjs _calcverify/batch1c.mjs
```

Last run's real output: `tests 46 · pass 46 · fail 0` (Node v24.14.0, no new dependencies — uses built-in `node:test` + native TS type-stripping).

**Typecheck gate:** `npx tsc --noEmit` reports **zero errors in any file touched by this batch**. Note: the repo has pre-existing tsc errors in other files (`currentSlug` prop misuse in ~20 components, `DependentCoverageCostCalculator` result-shape errors, `e2e/scale-calculator.spec.ts` implicit-any). Those are outside this audit's scope and were not modified.

## Batch Report

| Calculator | Path | Formula verified? | Dead inputs found? | Test file | Result | Root cause (if fixed) |
|---|---|---|---|---|---|---|
| Compound Interest | `src/domains/calculator/components/CompoundInterestCalculator.tsx` | Yes — A = P(1+r/n)^(nt) + C·[((1+r/n)^(nt)−1)/(r/n)] | No | `_calcverify/batch1a.mjs` | FIXED | 0%-rate + contributions produced NaN (0/0 in annuity term). Math moved verbatim to `logicCore.ts`; contribution term now degenerates to C×periods at r=0. Also: page's own FAQ/prose displayed wrong figures ($40,064 labeled "monthly" is the quarterly value; true monthly $40,387, daily $40,547; $152,000 example corrected to $144,573) — corrected against independently recomputed values |
| Simple Interest | `src/domains/calculator/components/SimpleInterestCalculator.tsx` | Yes — I = Prt, A = P+I | No | `_calcverify/batch1a.mjs` | PASS | — (math moved verbatim to `logicCore.ts` for testability) |
| Loan (EMI) | `src/domains/calculator/components/LoanCalculator.tsx` | Yes — M = P·r(1+r)^n/((1+r)^n−1) | No | `_calcverify/batch1a.mjs` | PASS | Cross-checked against independent closed form M = P·r/(1−(1+r)^−n); schedule invariant Σprincipal = P verified (logic in `logicCore.ts`) |
| Home Loan | `src/domains/calculator/components/HomeLoanCalculator.tsx` | Yes — annuity + escrow (tax/12, ins/12, HOA) | No | `_calcverify/batch1b.mjs` | PASS | Verbatim move to `homeLoanLogic.ts`; verified vs closed form + hand escrow arithmetic |
| Mortgage | `src/domains/calculator/components/MortgageCalculator.tsx` | Yes — annuity + PMI cancel at LTV≤0.80 + extras + biweekly | No | `_calcverify/batch1b2.mjs` | PASS | Verbatim move to `mortgageLogic.ts` (diff-verified identical); PMI boundary (LTV exactly 0.80 → inactive) confirmed correct |
| Auto Loan | `src/domains/calculator/components/AutoLoanCalculator.tsx` | Yes — tax on (price − trade-in), fees, net trade equity | No | `_calcverify/batch1b.mjs` | PASS | Verbatim move to `autoLoanLogic.ts`; underwater trade-in case verified (owed > value correctly increases amount financed) |
| Amortization | `src/domains/calculator/components/AmortizationCalculator.tsx` | Yes — schedule + extra payments | No | `_calcverify/batch1b2.mjs` | PASS | Verbatim move to `amortizationLogic.ts`; extra-payment payoff verified vs independent NPER formula (−ln(1−rP/M)/ln(1+r) = 311.4 → 312 months) |
| Personal Loan | `src/domains/calculator/components/PersonalLoanCalculator.tsx` | Yes — payment + effective APR with origination fee | No | `_calcverify/batch1c.mjs` | PASS | Verbatim move to `personalLoanLogic.ts`; APR verified against independent bisection (12.9066% vs Newton-Raphson implementation) |
| Credit Card Payoff | `src/domains/calculator/components/CreditCardPayoffCalculator.tsx` | **No (was wrong) — now canonical avalanche/snowball** | N/A | `_calcverify/batch1c.mjs` | FIXED | **Real bug:** old code pooled minimums + extra and dumped the entire budget onto the priority card; other cards' minimums were never paid and their balances silently accrued interest. Fixed in `creditCardPayoffLogic.ts`: interest accrues → every card receives its minimum → all remaining budget (extra + freed minimums) hits the priority card. Regression test proves minimums reach every card; avalanche ≤ snowball interest verified; single-card payoff (52 months) matches an independently coded recursion |
| Interest-Only Mortgage | `src/domains/calculator/components/InterestOnlyMortgageCalculator.tsx` | Yes — IO = P·r; post-IO annuity over remaining term | No | `_calcverify/batch1c.mjs` | PASS | Verbatim move to `interestOnlyMortgageLogic.ts`; total interest 540,248.59 and yr-6 balance 393,396 verified against closed forms; io=total edge clamps safely |
| Balloon Mortgage | `src/domains/calculator/components/BalloonMortgageCalculator.tsx` | Yes — B = P·((1+r)^n−(1+r)^p)/((1+r)^n−1) | No | `_calcverify/batch1c.mjs` | PASS | Verbatim move to `balloonMortgageLogic.ts`; balloon balance 271,248.73 and refinance arm verified vs closed forms |
| Bi-Weekly Mortgage | `src/domains/calculator/components/BiweeklyMortgageCalculator.tsx` | Yes (documented convention: APR×14/365 per period) | No | `_calcverify/batch1c.mjs` | PASS | Verbatim move to `biweeklyMortgageLogic.ts`; 13th-payment effect confirmed (payoff 23.97y, interest saved > $30k) |
| Bi-Weekly Mortgage Payment | `src/domains/calculator/components/BiweeklyMortgagePaymentCalculator.tsx` | Yes (documented convention: APR/26 per period) | No | `_calcverify/batch1c.mjs` | PASS | Verbatim move to `biweeklyMortgageLogic.ts`; the two biweekly variants' cents-level modeling difference is intentional and now documented in code |
| APR | `src/domains/calculator/components/AprCalculator.tsx` | Yes — Newton-Raphson on PV of payments vs net proceeds | No | `_calcverify/batch1c.mjs` | PASS | Verbatim move to `aprApyLogic.ts`; verified against independent bisection on two cases; zero-fee → APR = nominal confirmed |
| APY | `src/domains/calculator/components/ApyCalculator.tsx` | Yes — APY = (1+r/n)^n − 1 | No | `_calcverify/batch1c.mjs` | PASS | Verbatim move to `aprApyLogic.ts`; matches published table (5% annual/quarterly/monthly/daily = 5.0000/5.0945/5.1162/5.1267) |

## Notable findings

1. **1 genuine calculation bug (Credit Card Payoff)** — wrong distribution model, not just cosmetics. Every multi-card scenario previously overstated the priority card's payment and silently grew the others. Fixed + regression-tested.
2. **1 NaN edge (Compound Interest at 0%)** — `0/0` in the contribution annuity term. Fixed with a mathematically exact degenerate case.
3. **1 user-visible wrong-copy cluster (Compound Interest page)** — the FAQ/prose quoted incorrect dollar figures for its own worked example. Corrected to independently verified values.
4. **Convention note:** the two biweekly calculators use slightly different per-period interest conventions (APR×14/365 vs APR/26). Both are defensible; results differ by cents; both documented in `biweeklyMortgageLogic.ts`. Flagging for Nikhil in case brand-wide consistency is wanted.
5. **Pre-existing, out of scope:** `MortgageCalculator`'s PMI input is labeled monthly and works, but internally converts to an annual-rate-on-balance model; PMI accrues on the *declining* balance (initial monthly amount ≠ constant). Not a bug, but worth a product decision eventually.

## What I did NOT do

- No `isBuilt` flags, no `lazyComponents.tsx`, no `_approved.json` touched.
- No commits, pushes, or deploys.
- No UI/styling changes — only extraction of math into importable `.ts` modules (a pattern the repo already uses: `pmiLogic.ts`, `scaleLogic.ts`, `ZeroAprPromoLogic.ts`), the Credit Card fix, the Compound Interest 0% fix, and the Compound Interest page copy corrections.
- I did not verify any calculator beyond the 15 listed above, and I did not run the app's UI (all verification is at the math level via direct function calls).

**Stopping here per the batch protocol. Awaiting explicit "proceed" for Batch 2.**
