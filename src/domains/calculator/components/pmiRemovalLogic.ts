import { getConventionalPmiRate } from "./pmiRates";
import { MONTHS, addMonths } from "./pmiLogic";

// ─── Shared helpers (re-export so the component imports from one place) ──────
export { MONTHS, addMonths } from "./pmiLogic";

export type RemovalLoanType = "conventional" | "fha";
export type RemovalPmiMode = "auto" | "manual";

export interface RemovalInputs {
  homeValue: number;          // original purchase price / appraised value at origination
  loanAmount: number;         // original loan amount
  interestRate: number;       // annual % (note rate)
  loanTermYears: number;
  loanType: RemovalLoanType;
  startMonth: string;         // e.g. "Jan"
  startYear: number;
  appreciationRate: number;   // annual % (for current-value path)
  extraMonthly: number;       // extra principal paid monthly (acceleration)
  creditScore: number;
  propertyUse: string;        // primary | second | investment
  pmiMode: RemovalPmiMode;
  manualPmiRate: number;      // annual % (manual override)
  seasoningMonths: number;    // borrower-requested seasoning floor (default 24)
}

export interface RemovalPath {
  label: string;
  months: number;             // -1 = never within term, 0 = not applicable
  dateLabel: string;
  basis: "original" | "current" | "schedule" | "statutory";
  description: string;
}

export interface AccelerationRow {
  extra: number;
  months: number;
  dateLabel: string;
  totalPmiPaid: number;
  pmiSavedVsBaseline: number;
  monthsSaved: number;
}

export interface LtvPoint {
  month: number;
  ltvOriginal: number;   // actual balance / original value
  ltvCurrent: number;    // actual balance / appreciated value
}

export interface RemovalResults {
  pmiRequired: boolean;
  initialLtv: number;
  baseLoanAmount: number;
  monthlyPmi: number;
  pmiRate: number;          // annual %
  pmiTierLabel: string;
  monthlyPi: number;

  autoTermination78: RemovalPath;      // HPA automatic @ 78% scheduled, original value
  borrowerRequested80: RemovalPath;    // @ 80% current value (appreciation + paydown)
  midpoint: RemovalPath;               // statutory midpoint backstop
  fhaRule: RemovalPath | null;         // FHA 11-year / life-of-loan

  earliest: RemovalPath;               // earliest achievable path for the loan type
  pmiAlreadyRemovable: boolean;

  totalPmiPaid: number;                // until earliest removal
  monthlySavings: number;              // $/month freed after removal
  pmiPaidUntilDate: string;

  acceleration: AccelerationRow[];
  ltvCurve: LtvPoint[];

  fhaLifetime: boolean;
  isError: boolean;
  errorMsg?: string;
}

// ─── Math primitives ─────────────────────────────────────────────────────────
function monthlyPi(la: number, annualRate: number, termMonths: number): number {
  const r = annualRate / 100 / 12;
  if (termMonths <= 0) return 0;
  if (r === 0) return la / termMonths;
  return la * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

interface Schedules {
  scheduled: number[]; // [i] = balance after i months, minimum payments only
  actual: number[];    // [i] = balance after i months, with extra payments
}

function buildSchedules(
  la: number,
  annualRate: number,
  termMonths: number,
  extraMonthly: number
): Schedules {
  const pi = monthlyPi(la, annualRate, termMonths);
  const r = annualRate / 100 / 12;
  const scheduled: number[] = [la];
  const actual: number[] = [la];
  let bs = la;
  let ba = la;
  for (let i = 1; i <= termMonths; i++) {
    // Scheduled (minimum payment) — the legal schedule for auto-termination
    let intS = bs * r;
    let princS = pi - intS;
    if (princS < 0) princS = 0;
    if (princS > bs) princS = bs;
    bs = Math.max(0, bs - princS);
    scheduled.push(bs);

    // Actual (with extra principal)
    let intA = ba * r;
    let princA = pi - intA + extraMonthly;
    if (princA < 0) princA = 0;
    if (princA > ba) princA = ba;
    ba = Math.max(0, ba - princA);
    actual.push(ba);

    if (ba <= 0.005 && bs <= 0.005) break;
  }
  return { scheduled, actual };
}

// First month at which `balances[i] <= target`. Returns -1 if never in array.
function firstMonthAt(balances: number[], target: number, floor = 0): number {
  for (let i = 1; i < balances.length; i++) {
    if (i >= floor && balances[i] <= target) return i;
  }
  return -1;
}

function fmtDate(startMonth: string, startYear: number, months: number): string {
  if (months < 0) return "Not within loan term";
  return addMonths(startMonth, String(startYear), months);
}

// ─── Public entry point ──────────────────────────────────────────────────────
export function calculatePmiRemoval(inp: RemovalInputs): RemovalResults {
  const hv = Math.max(0, inp.homeValue);
  const termMonths = Math.max(1, Math.round(inp.loanTermYears * 12));
  const baseLoan = Math.max(0, inp.loanAmount);
  const initialLtv = hv > 0 ? (baseLoan / hv) * 100 : 0;
  const pmiRequired = initialLtv > 80 && inp.loanType === "conventional";

  const empty: RemovalResults = {
    pmiRequired, initialLtv, baseLoanAmount: baseLoan, monthlyPmi: 0, pmiRate: 0,
    pmiTierLabel: "", monthlyPi: monthlyPi(baseLoan, inp.interestRate, termMonths),
    autoTermination78: emptyPath(), borrowerRequested80: emptyPath(),
    midpoint: emptyPath(), fhaRule: null, earliest: emptyPath(), pmiAlreadyRemovable: false,
    totalPmiPaid: 0, monthlySavings: 0, pmiPaidUntilDate: "", acceleration: [], ltvCurve: [],
    fhaLifetime: false, isError: false,
  };

  if (hv <= 0 || baseLoan <= 0) {
    return { ...empty, isError: true, errorMsg: "Enter a home value and a down payment of less than 20%." };
  }

  // ── PMI rate & monthly cost (conventional) ──────────────────────────────
  let pmiRate = 0;
  let pmiTierLabel = "";
  if (inp.loanType === "conventional") {
    if (inp.pmiMode === "manual") {
      pmiRate = inp.manualPmiRate;
      pmiTierLabel = "Manual rate";
    } else {
      const res = getConventionalPmiRate(initialLtv, inp.creditScore, inp.propertyUse);
      pmiRate = res.rate;
      pmiTierLabel = res.tierLabel;
      // Tier unavailable (<620) — fall back to a mid-tier estimate so $ figures are still useful
      if (pmiRate === 0) {
        pmiRate = 0.79;
        pmiTierLabel = "Estimated (<620 unavailable)";
      }
    }
  }
  const monthlyPmi = pmiRequired ? (baseLoan * pmiRate / 100) / 12 : 0;
  const pi = monthlyPi(baseLoan, inp.interestRate, termMonths);

  // ── FHA path ────────────────────────────────────────────────────────────
  if (inp.loanType === "fha") {
    // Loans endorsed on/after June 3, 2013 (virtually all current FHA loans)
    const fhaLifetime = initialLtv > 90; // down payment < 10%
    let fhaPath: RemovalPath;
    if (fhaLifetime) {
      fhaPath = {
        label: "FHA MIP — Life of Loan",
        months: termMonths,
        dateLabel: "Life of Loan",
        basis: "statutory",
        description:
          "FHA loans with less than 10% down (endorsed on/after June 3, 2013) carry MIP for the entire life of the loan. MIP cannot be cancelled by reaching an LTV threshold — the only way to remove it is to refinance into a conventional loan once you reach 80% LTV.",
      };
    } else {
      const m = Math.min(132, termMonths); // 11 years
      fhaPath = {
        label: "FHA MIP — 11 Years",
        months: m,
        dateLabel: fmtDate(inp.startMonth, inp.startYear, m),
        basis: "statutory",
        description:
          "FHA loans with 10%+ down (endorsed on/after June 3, 2013) automatically cancel MIP after 11 years (132 months), regardless of LTV. You may also refinance into a conventional loan earlier once you reach 80% LTV.",
      };
    }
    const earliest = fhaPath;
    const monthsActive = fhaLifetime ? termMonths : Math.min(132, termMonths);
    const fhaAnnualMip = initialLtv > 95 ? 0.55 : 0.50;
    const fhaMonthlyMip = (baseLoan * fhaAnnualMip / 100) / 12;
    const totalPmiPaid = fhaMonthlyMip * monthsActive;

    // LTV curve for FHA too
    const { actual } = buildSchedules(baseLoan, inp.interestRate, termMonths, inp.extraMonthly);
    const ltvCurve: LtvPoint[] = [];
    for (let i = 0; i < actual.length; i += 3) {
      const curVal = hv * Math.pow(1 + inp.appreciationRate / 100, i / 12);
      ltvCurve.push({
        month: i,
        ltvOriginal: curVal > 0 ? parseFloat(((actual[i] / hv) * 100).toFixed(2)) : 0,
        ltvCurrent: curVal > 0 ? parseFloat(((actual[i] / curVal) * 100).toFixed(2)) : 0,
      });
    }

    return {
      ...empty,
      pmiRequired: true,
      monthlyPmi: fhaMonthlyMip,
      pmiRate: fhaAnnualMip,
      pmiTierLabel: `FHA annual MIP ${fhaAnnualMip.toFixed(2)}%`,
      monthlyPi: pi,
      fhaRule: fhaPath,
      earliest,
      pmiAlreadyRemovable: false,
      totalPmiPaid,
      monthlySavings: fhaLifetime ? 0 : fhaMonthlyMip,
      pmiPaidUntilDate: fhaPath.dateLabel,
      ltvCurve,
      fhaLifetime,
    };
  }

  // ── Conventional path ───────────────────────────────────────────────────
  if (!pmiRequired) {
    return {
      ...empty,
      pmiRequired: false,
      monthlyPmi: 0,
      pmiRate,
      pmiTierLabel,
      monthlyPi: pi,
      isError: false,
      errorMsg: undefined,
      autoTermination78: emptyPath(),
      borrowerRequested80: emptyPath(),
      midpoint: emptyPath(),
      earliest: {
        label: "PMI Not Required",
        months: 0,
        dateLabel: "Never had PMI",
        basis: "statutory",
        description:
          "Your down payment is 20% or more, so no PMI was required at origination. No action needed.",
      },
      pmiAlreadyRemovable: true,
    };
  }

  const { scheduled, actual } = buildSchedules(baseLoan, inp.interestRate, termMonths, inp.extraMonthly);

  // 1. Automatic termination @ 78% of ORIGINAL value on the SCHEDULED amortization.
  //    This is fixed by law regardless of extra payments or appreciation.
  const target78 = 0.78 * hv;
  let autoMonth = firstMonthAt(scheduled, target78);
  // HPA floors automatic termination at the later of 78% scheduled date; servicers also require
  // the borrower be current. There is no seasoning floor for automatic termination.
  const autoTermination78: RemovalPath = {
    label: "Automatic Termination @ 78% LTV",
    months: autoMonth,
    dateLabel: autoMonth > 0 ? fmtDate(inp.startMonth, inp.startYear, autoMonth) : "Not within loan term",
    basis: "schedule",
    description:
      "By federal law (HPA), your servicer MUST automatically cancel PMI the month your loan is scheduled to reach 78% LTV based on the ORIGINAL value and the standard amortization schedule — even if you never make an extra payment. No request or appraisal is required; you only need to be current on payments.",
  };

  // 2. Borrower-requested @ 80% of CURRENT (appraised) value.
  //    Uses actual balance (with extra payments) vs. appreciated value. Seasoning floor applies.
  const target80cur = (i: number) => 0.80 * hv * Math.pow(1 + inp.appreciationRate / 100, i / 12);
  let borrMonth = -1;
  for (let i = Math.max(1, inp.seasoningMonths); i < actual.length; i++) {
    if (actual[i] <= target80cur(i)) { borrMonth = i; break; }
  }
  const borrowerRequested80: RemovalPath = {
    label: "Borrower-Requested @ 80% LTV",
    months: borrMonth,
    dateLabel: borrMonth > 0 ? fmtDate(inp.startMonth, inp.startYear, borrMonth) : "Not within loan term",
    basis: "current",
    description:
      "You may request PMI cancellation as soon as your loan balance reaches 80% of the home's CURRENT value — which falls faster when the home appreciates and when you make extra principal payments. This requires a written request, a good payment history, and usually a paid appraisal (typically $500–$700). In rising markets this is usually the fastest path.",
  };

  // 3. Statutory midpoint backstop
  const midMonth = Math.round(termMonths / 2);
  const midpoint: RemovalPath = {
    label: "Final Termination @ Loan Midpoint",
    months: midMonth,
    dateLabel: fmtDate(inp.startMonth, inp.startYear, midMonth),
    basis: "statutory",
    description:
      "As an absolute backstop, federal law requires PMI to terminate no later than the midpoint of your loan term (year 15 of a 30-year loan), assuming you are current on payments.",
  };

  // Determine earliest achievable
  const candidates = [autoTermination78, borrowerRequested80].filter(p => p.months > 0);
  let earliest: RemovalPath;
  if (candidates.length === 0) {
    earliest = midpoint;
  } else {
    candidates.sort((a, b) => a.months - b.months);
    earliest = candidates[0].months < midMonth ? candidates[0] : midpoint;
  }

  const monthsActive = earliest.months > 0 ? earliest.months : midMonth;
  const totalPmiPaid = monthlyPmi * monthsActive;

  // ── Acceleration scenarios (borrower-requested path, current value) ─────
  const baselineBorrMonth = (() => {
    const { actual: a0 } = buildSchedules(baseLoan, inp.interestRate, termMonths, 0);
    for (let i = Math.max(1, inp.seasoningMonths); i < a0.length; i++) {
      if (a0[i] <= target80cur(i)) return i;
    }
    return -1;
  })();
  const accelExtras = [0, 25, 50, 100, 200, 300, 500];
  const acceleration: AccelerationRow[] = accelExtras.map(extra => {
    const { actual: aE } = buildSchedules(baseLoan, inp.interestRate, termMonths, extra);
    let m = -1;
    for (let i = Math.max(1, inp.seasoningMonths); i < aE.length; i++) {
      if (aE[i] <= target80cur(i)) { m = i; break; }
    }
    if (m < 0) m = earliest.months > 0 ? earliest.months : midMonth;
    const savedMonths = baselineBorrMonth > 0 ? Math.max(0, baselineBorrMonth - m) : 0;
    return {
      extra,
      months: m,
      dateLabel: fmtDate(inp.startMonth, inp.startYear, m),
      totalPmiPaid: monthlyPmi * m,
      monthsSaved: savedMonths,
      pmiSavedVsBaseline: monthlyPmi * savedMonths,
    };
  });

  // ── LTV curve (every 3 months) ──────────────────────────────────────────
  const ltvCurve: LtvPoint[] = [];
  for (let i = 0; i < actual.length; i += 3) {
    const curVal = hv * Math.pow(1 + inp.appreciationRate / 100, i / 12);
    ltvCurve.push({
      month: i,
      ltvOriginal: parseFloat(Math.max(0, (actual[i] / hv) * 100).toFixed(2)),
      ltvCurrent: curVal > 0 ? parseFloat(Math.max(0, (actual[i] / curVal) * 100).toFixed(2)) : 0,
    });
  }

  return {
    pmiRequired,
    initialLtv,
    baseLoanAmount: baseLoan,
    monthlyPmi,
    pmiRate,
    pmiTierLabel,
    monthlyPi: pi,
    autoTermination78,
    borrowerRequested80,
    midpoint,
    fhaRule: null,
    earliest,
    pmiAlreadyRemovable: false,
    totalPmiPaid,
    monthlySavings: monthlyPmi,
    pmiPaidUntilDate: earliest.dateLabel,
    acceleration,
    ltvCurve,
    fhaLifetime: false,
    isError: false,
  };
}

function emptyPath(): RemovalPath {
  return { label: "—", months: 0, dateLabel: "—", basis: "schedule", description: "" };
}
