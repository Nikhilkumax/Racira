/**
 * Shared auto-finance math library for Transportation calculators.
 * Pure, fully-typed functions — no React, no side effects.
 *
 * Used by ~20 of the Transportation batch calculators to keep the
 * amortization, depreciation, and cost-per-mile formulas identical
 * across every page (single source of truth).
 */

/** One row of a loan amortization schedule. */
export interface AmortRow {
  /** 1-based period number. */
  period: number;
  /** Scheduled payment for the period (excludes extra). */
  payment: number;
  /** Principal portion of the payment. */
  principal: number;
  /** Interest portion of the payment. */
  interest: number;
  /** Remaining balance after this period. */
  balance: number;
  /** Extra payment applied this period (optional). */
  extraPayment?: number;
}

/** Inputs for an amortized installment loan. */
export interface LoanInputs {
  /** Amount borrowed, in dollars. */
  principal: number;
  /** Annual percentage rate, as a percent (e.g. 6.5 for 6.5%). */
  aprPct: number;
  /** Loan term in years. */
  termYears: number;
}

/**
 * Standard fixed-rate monthly payment (PMT).
 *
 * M = P * r(1+r)^n / ((1+r)^n - 1)
 *
 * where r is the monthly rate and n the total months. Returns 0 for
 * non-positive principal and handles 0% APR as a straight principal/n split.
 */
export function pmt(principal: number, aprPct: number, termYears: number): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const n = Math.round(termYears * 12);
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Generate a full monthly amortization schedule for an installment loan.
 *
 * Supports an optional recurring extra payment, a one-time lump sum at a
 * given period, and an annual recurring extra. The schedule stops when the
 * balance reaches zero (so early-payoff scenarios produce a shorter array).
 */
export function amortize(
  principal: number,
  aprPct: number,
  termYears: number,
  opts: { extraMonthly?: number; oneTimeExtra?: number; oneTimeAtPeriod?: number; annualExtra?: number } = {}
): AmortRow[] {
  const rows: AmortRow[] = [];
  if (principal <= 0 || termYears <= 0) return rows;

  const scheduledMax = Math.round(termYears * 12);
  const r = aprPct / 100 / 12;
  const monthly = pmt(principal, aprPct, termYears);
  const { extraMonthly = 0, oneTimeExtra = 0, oneTimeAtPeriod = 1, annualExtra = 0 } = opts;

  let balance = principal;
  let totalPrincipal = 0;
  for (let period = 1; period <= scheduledMax && balance > 0.005; period++) {
    const interest = balance * r;
    let principalPortion = monthly - interest;

    let extraThisPeriod = extraMonthly;
    if (period === oneTimeAtPeriod) extraThisPeriod += oneTimeExtra;
    if (period % 12 === 0) extraThisPeriod += annualExtra;

    // Don't overpay the balance.
    if (principalPortion + extraThisPeriod > balance) {
      extraThisPeriod = Math.max(0, balance - principalPortion);
    }

    principalPortion = Math.max(0, principalPortion);
    const payment = principalPortion + interest;
    balance -= principalPortion + extraThisPeriod;
    totalPrincipal += principalPortion + extraThisPeriod;

    rows.push({
      period,
      payment,
      principal: principalPortion,
      interest,
      balance: Math.max(0, balance),
      extraPayment: extraThisPeriod > 0 ? extraThisPeriod : undefined,
    });
  }
  return rows;
}

/** Sum of interest across an amortization schedule. */
export function totalInterest(rows: AmortRow[]): number {
  return rows.reduce((s, r) => s + r.interest, 0);
}

/** Sum of all payments (scheduled + extra) across an amortization schedule. */
export function totalPaid(rows: AmortRow[]): number {
  return rows.reduce((s, r) => s + r.payment + (r.extraPayment ?? 0), 0);
}

/** Yearly roll-up of a monthly amortization schedule. */
export function yearlySchedule(rows: AmortRow[]): AmortRow[] {
  const out: AmortRow[] = [];
  for (let i = 0; i < rows.length; i += 12) {
    const slice = rows.slice(i, i + 12);
    out.push({
      period: Math.floor(i / 12) + 1,
      payment: slice.reduce((s, r) => s + r.payment, 0),
      principal: slice.reduce((s, r) => s + r.principal + (r.extraPayment ?? 0), 0),
      interest: slice.reduce((s, r) => s + r.interest, 0),
      balance: slice[slice.length - 1]?.balance ?? 0,
    });
  }
  return out;
}

/**
 * Car depreciation curve using the industry-standard accelerated model.
 *
 * New cars lose ~20% in year 1, then ~15% per year after, applied to the
 * remaining balance (exponential decay). Returns the market value at the
 * end of each year from 0..years (inclusive), so curve[0] is MSRP.
 *
 * @param initialValue Purchase / MSRP in dollars
 * @param years How many years of curve to produce
 * @param firstYearRate First-year loss as a decimal (default 0.20)
 * @param annualRate Subsequent-year loss as a decimal (default 0.15)
 */
export function depreciate(
  initialValue: number,
  years: number,
  firstYearRate = 0.2,
  annualRate = 0.15
): number[] {
  const curve: number[] = [initialValue];
  let value = initialValue;
  for (let y = 1; y <= years; y++) {
    const rate = y === 1 ? firstYearRate : annualRate;
    value *= 1 - rate;
    curve.push(value);
  }
  return curve;
}

/** Total depreciation = initial - value-after-n-years. */
export function totalDepreciation(initialValue: number, years: number, curve?: number[]): number {
  const c = curve ?? depreciate(initialValue, years);
  return initialValue - (c[years] ?? 0);
}

/**
 * Cost per mile given an annual cost total and annual miles driven.
 * Guarded against zero miles.
 */
export function costPerMile(annualCost: number, annualMiles: number): number {
  if (annualMiles <= 0) return 0;
  return annualCost / annualMiles;
}

/** Inputs for a total-ownership-cost model. */
export interface OwnershipCostInputs {
  /** Purchase price of the vehicle, dollars. */
  purchasePrice: number;
  /** Years of ownership. */
  years: number;
  /** Annual miles driven. */
  annualMiles: number;
  /** Loan APR percent (0 if paid cash). */
  aprPct: number;
  /** Loan term in years (0 if paid cash). */
  loanTermYears: number;
  /** Down payment dollars. */
  downPayment: number;
  /** Annual insurance premium. */
  insuranceAnnual: number;
  /** Annual fuel cost. */
  fuelAnnual: number;
  /** Annual maintenance/repair cost. */
  maintenanceAnnual: number;
  /** Annual registration/fees/taxes. */
  registrationAnnual: number;
  /** Annual parking/tolls. */
  parkingAnnual: number;
  /** Estimated resale value at end of ownership. */
  resaleValue: number;
}

/** Result of a total-ownership-cost computation. */
export interface OwnershipCostResult {
  loanAmount: number;
  monthlyPayment: number;
  totalLoanPayments: number;
  totalInterest: number;
  depreciation: number;
  insurance: number;
  fuel: number;
  maintenance: number;
  registration: number;
  parking: number;
  /** Loan payments + depreciation + running costs (everything out of pocket). */
  totalOutOfPocket: number;
  /** Net cost after subtracting resale value from out-of-pocket. */
  netCost: number;
  annualCost: number;
  monthlyCost: number;
  costPerMile: number;
}

/**
 * Compute the full cost of vehicle ownership over a number of years.
 * Depreciation is the drop in market value; loan interest is the finance
 * cost; running costs (insurance, fuel, etc.) accrue yearly.
 */
export function ownershipCost(input: OwnershipCostInputs): OwnershipCostResult {
  const loanAmount = Math.max(0, input.purchasePrice - input.downPayment);
  const monthlyPayment = input.loanTermYears > 0 ? pmt(loanAmount, input.aprPct, input.loanTermYears) : 0;

  // Loan only runs for min(loan term, ownership horizon).
  const loanMonths = Math.min(Math.round(input.loanTermYears * 12), Math.round(input.years * 12));
  const schedule = input.loanTermYears > 0 ? amortize(loanAmount, input.aprPct, input.loanTermYears).slice(0, loanMonths) : [];
  const totalLoanPayments = schedule.reduce((s, r) => s + r.payment + (r.extraPayment ?? 0), 0) + input.downPayment;
  const totalInterest = totalInterest_(schedule);

  const depreciation = Math.max(0, input.purchasePrice - input.resaleValue);
  const insurance = input.insuranceAnnual * input.years;
  const fuel = input.fuelAnnual * input.years;
  const maintenance = input.maintenanceAnnual * input.years;
  const registration = input.registrationAnnual * input.years;
  const parking = input.parkingAnnual * input.years;

  // Out-of-pocket includes down payment + loan payments (which contain the
  // principal), but to avoid double counting the vehicle's purchase we use
  // depreciation as the "vehicle cost" and only add loan *interest* + the
  // down payment. This is the standard TCO accounting approach.
  // Out-of-pocket includes down payment + loan *interest* (not principal, to
  // avoid double counting) + depreciation (which is the net vehicle cost
  // already accounting for resale) + all running costs.
  const totalOutOfPocket =
    input.downPayment + totalInterest + depreciation + insurance + fuel + maintenance + registration + parking;
  // Depreciation already subtracts resale, so net cost equals out of pocket.
  const netCost = totalOutOfPocket;

  const annualCost = totalOutOfPocket / Math.max(1, input.years);
  const monthlyCost = annualCost / 12;
  const cpm = costPerMile(totalOutOfPocket, input.annualMiles * input.years);

  return {
    loanAmount,
    monthlyPayment,
    totalLoanPayments,
    totalInterest,
    depreciation,
    insurance,
    fuel,
    maintenance,
    registration,
    parking,
    totalOutOfPocket,
    netCost,
    annualCost,
    monthlyCost,
    costPerMile: cpm,
  };
}

// Local alias to avoid clashing with the public totalInterest().
function totalInterest_(rows: AmortRow[]): number {
  return rows.reduce((s, r) => s + r.interest, 0);
}

/**
 * Federal EV tax credit under IRC §30D (Inflation Reduction Act rules).
 *
 * - New clean vehicles: up to $7,500.
 * - Used clean vehicles: up to $4,000 (30% of sale price, capped).
 * - MSRP caps: $55K (sedans) / $80K (SUVs/pickups/vans) for new.
 * - Income caps: $300K (joint) / $150K (single) for new; $75K single /
 *   $150K joint for used.
 *
 * Returns the estimated credit amount and reason codes for the UI.
 */
export interface EvCreditResult {
  amount: number;
  maxAmount: number;
  eligible: boolean;
  reason: string;
}

export function evTaxCredit(
  msrp: number,
  vehicleClass: "sedan" | "suv" | "pickup" | "van",
  isNew: boolean,
  income: number,
  filingJoint: boolean
): EvCreditResult {
  if (isNew) {
    const msrpCap = vehicleClass === "sedan" ? 55000 : 80000;
    const incomeCap = filingJoint ? 300000 : 150000;
    const maxAmount = 7500;
    if (msrp > msrpCap) {
      return { amount: 0, maxAmount, eligible: false, reason: `MSRP exceeds $${msrpCap.toLocaleString()} cap for ${vehicleClass}s.` };
    }
    if (income > incomeCap) {
      return { amount: 0, maxAmount, eligible: false, reason: `Modified AGI exceeds $${incomeCap.toLocaleString()} limit.` };
    }
    // Simplified: assume full $7,500 (battery sourcing halves it in practice,
    // but exact determination requires the IRS eligibility list).
    return { amount: maxAmount, maxAmount, eligible: true, reason: "Eligible for the full $7,500 new clean vehicle credit." };
  }
  // Used vehicle credit.
  const incomeCap = filingJoint ? 150000 : 75000;
  const maxAmount = 4000;
  if (income > incomeCap) {
    return { amount: 0, maxAmount, eligible: false, reason: `Modified AGI exceeds $${incomeCap.toLocaleString()} used-vehicle limit.` };
  }
  if (msrp > 25000) {
    return { amount: 0, maxAmount, eligible: false, reason: "Sale price exceeds $25,000 used-vehicle cap." };
  }
  const amount = Math.min(maxAmount, msrp * 0.3);
  return { amount: Math.round(amount), maxAmount, eligible: true, reason: "Eligible for the used clean vehicle credit (30% of price, capped at $4,000)." };
}

/**
 * Annual fuel cost for a gas vehicle.
 *
 * cost = (annualMiles / mpg) * pricePerGallon
 */
export function annualFuelCost(annualMiles: number, mpg: number, pricePerGallon: number): number {
  if (mpg <= 0) return 0;
  return (annualMiles / mpg) * pricePerGallon;
}

/**
 * Annual charging cost for an EV.
 *
 * cost = (annualMiles / mpkwh) * pricePerKwh
 * where mpkwh = miles per kWh (efficiency).
 */
export function annualEvCost(annualMiles: number, milesPerKwh: number, pricePerKwh: number): number {
  if (milesPerKwh <= 0) return 0;
  return (annualMiles / milesPerKwh) * pricePerKwh;
}

/** Format a number as USD currency with no decimals. */
export function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Format a number as USD currency with 2 decimals. */
export function fmtUsd2(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format a percentage with 1 decimal. */
export function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}
