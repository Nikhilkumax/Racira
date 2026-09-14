/**
 * logicCore.ts — pure calculation cores for finance calculators.
 *
 * Each function is extracted verbatim (same arithmetic, same variable roles)
 * from the corresponding component so the math can be unit-tested directly.
 * No React, no DOM, no formatting — numbers in, numbers out.
 */

/** Shared shape for periodic amortization schedule rows. */
export interface AmortPeriod {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  extraPayment?: number;
  balance: number;
}

/**
 * Standard annuity payment (EMI) for a fully amortizing loan.
 * M = P * r * (1+r)^n / ((1+r)^n - 1); r = periodic rate as a decimal,
 * n = number of periods. Returns the payment (or P/n when r === 0).
 */
export function annuityPayment(P: number, periodicRate: number, n: number): number {
  if (n <= 0) return 0;
  if (periodicRate === 0) return P / n;
  const pow = Math.pow(1 + periodicRate, n);
  return (P * periodicRate * pow) / (pow - 1);
}

/**
 * Core of CompoundInterestCalculator.
 * A = P(1+r/n)^(nt) + C * [((1+r/n)^(nt) - 1) / (r/n)]
 * rAnnualPct is the annual rate in percent (e.g. 7 for 7%).
 */
export function compoundInterestCore(
  P: number,
  rAnnualPct: number,
  years: number,
  periodsPerYear: number,
  contributionPerPeriod: number
): { principalGrowth: number; contribGrowth: number; total: number; totalContrib: number; totalInterest: number } {
  const r = rAnnualPct / 100;
  const rN = r / periodsPerYear;
  const periods = periodsPerYear * years;

  const principalGrowth = P * Math.pow(1 + rN, periods);
  // Contribution future value of an ordinary annuity; at rN === 0 the
  // contributions simply accumulate without growth (was 0/0 -> NaN before).
  const contribGrowth =
    rN === 0 ? contributionPerPeriod * periods : contributionPerPeriod * ((Math.pow(1 + rN, periods) - 1) / rN);

  const total = principalGrowth + contribGrowth;
  const totalContrib = contributionPerPeriod * periods;
  const totalInterest = total - P - totalContrib;
  return { principalGrowth, contribGrowth, total, totalContrib, totalInterest };
}

/**
 * Core of SimpleInterestCalculator.
 * I = P * r * t (r as a decimal), A = P + I.
 */
export function simpleInterestCore(P: number, rAnnualPct: number, years: number): { interest: number; total: number } {
  const r = rAnnualPct / 100;
  const interest = P * r * years;
  const total = P + interest;
  return { interest, total };
}

/**
 * Core of LoanCalculator (generic EMI loan).
 * Simulates the amortization period-by-period so schedules/invariants can be
 * verified, and returns headline numbers identical to the component's math.
 */
export function loanEmiCore(P: number, aprPct: number, years: number): {
  monthly: number;
  totalPaid: number;
  totalInterest: number;
  schedule: AmortPeriod[];
} {
  const r = aprPct / 100 / 12;
  const n = years * 12;
  const monthly = annuityPayment(P, r, n);
  const schedule: AmortPeriod[] = [];
  let balance = P;
  let totalInterest = 0;
  for (let period = 1; period <= n && balance > 0.005; period++) {
    const interest = balance * r;
    let principal = monthly - interest;
    if (principal > balance) principal = balance;
    totalInterest += interest;
    balance -= principal;
    schedule.push({
      period,
      payment: interest + principal,
      interest,
      principal,
      balance: Math.max(0, balance),
    });
  }
  const totalPaid = monthly * n;
  return { monthly, totalPaid, totalInterest, schedule };
}
