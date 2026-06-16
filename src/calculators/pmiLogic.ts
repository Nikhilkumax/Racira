import {
  getConventionalPmiRate,
  getFhaAnnualMipRate,
  FHA_UPFRONT_MIP_RATE,
} from "./pmiRates";

export type LoanType = "conventional" | "fha" | "va" | "usda";
export type PaymentFreq = "monthly" | "biweekly" | "weekly";
export type DpMode = "percent" | "amount";
export type PmiMode = "auto" | "manual";

export interface PmiInputs {
  homeValue: number;
  dpMode: DpMode;
  dpPct: number;
  dpAmt: number;
  interestRate: number;
  loanTerm: number; // years
  creditScore: number;
  loanType: LoanType;
  propertyUse: string;
  startMonth: string;
  startYear: string;
  paymentFreq: PaymentFreq;
  pmiMode: PmiMode;
  manualPmiRate: number;
  propertyTax: number;
  homeInsurance: number;
  hoaFee: number;
  extraMonthly: number;
  oneTimeExtra: number;
  annualExtra: number;
  fhaMipMode: PmiMode;
  manualFhaMipRate: number;
  vaFundingFeeRate: number;
  appreciationRate: number; // annual %
}

export interface AmortizationRow {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  pmi: number;
  balance: number;
  cumulativeInterest: number;
  isPmiCancelRow: boolean;
}

export interface LtvPoint {
  month: number;
  ltv: number;
}

export interface PmiResults {
  loanAmount: number;
  ltv: number;
  monthlyPI: number;
  pmiRequired: boolean;
  pmiRate: number;
  monthlyPmi: number;
  totalMonthly: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  pmiCancelMonth: number;
  pmiCancelDate: string;
  totalPmiCost: number;
  monthlySavingsAfterPmi: number;
  upfrontMip: number;
  annualMipRate: number;
  monthlyMip: number;
  noMipLoan: boolean;
  totalInterest: number;
  totalPI: number;
  payoffMonths: number;
  payoffPeriods: number;
  vaFundingFee: number;
  fhaPmiLifetime: boolean;
  creditTierLabel: string;
  interestSaved: number;
  pmiMonthsSaved: number;
  ltvCurve: LtvPoint[];
  ltvCurveAccel: LtvPoint[];
  ltvCurveAppreciation: LtvPoint[];
  amortizationRows: AmortizationRow[];
  noPmiSavingsVs10: number;
  // Savings vs monthly (for bi-weekly/weekly)
  interestSavedVsMonthly: number;
  payoffMonthsSavedVsMonthly: number;
  pmiMonthsSavedVsMonthly: number;
}

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function addMonths(monthName: string, year: string, n: number): string {
  const idx = MONTHS.indexOf(monthName);
  const y = parseInt(year) || new Date().getFullYear();
  const totalMonths = y * 12 + idx + n;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = totalMonths % 12;
  return `${MONTHS[newMonth]} ${newYear}`;
}

// ─── Amortization Loop ────────────────────────────────────────────────────────
interface LoopOpts {
  la: number;
  annualRate: number;
  loanTermMonths: number;
  freq: PaymentFreq;
  extraMonthly: number;
  oneTimeExtra: number;
  annualExtra: number;
  activeMonthlyPmi: number;
  pmiRequired: boolean;
  isFha: boolean;
  isUsda: boolean;
  fhaPmiLifetime: boolean;
  initHomeValue: number;
  appreciationRate: number; // annual %
  startMonth: string;
  startYear: string;
  collectRows: boolean;
}

interface LoopResult {
  totalInterest: number;
  pmiCancelMonth: number;
  payoffMonths: number;
  payoffPeriods: number;
  totalPmiCost: number;
  ltvCurve: LtvPoint[];
  amortizationRows: AmortizationRow[];
}

function periodsConfig(freq: PaymentFreq): { periodsPerYear: number; rDivisor: number } {
  if (freq === "weekly")   return { periodsPerYear: 52, rDivisor: 52 };
  if (freq === "biweekly") return { periodsPerYear: 26, rDivisor: 26 };
  return { periodsPerYear: 12, rDivisor: 12 };
}

function calcPiPayment(la: number, annualRate: number, loanTermMonths: number, freq: PaymentFreq): number {
  const rMonthly = annualRate / 100 / 12;
  const nMonthly = loanTermMonths;
  const monthlyPi = rMonthly === 0 ? la / nMonthly : la * (rMonthly * Math.pow(1 + rMonthly, nMonthly)) / (Math.pow(1 + rMonthly, nMonthly) - 1);
  if (freq === "weekly") return monthlyPi / 4;
  if (freq === "biweekly") return monthlyPi / 2;
  return monthlyPi;
}

function runLoop(opts: LoopOpts): LoopResult {
  const { la, annualRate, loanTermMonths, freq, extraMonthly, oneTimeExtra, annualExtra,
    activeMonthlyPmi, pmiRequired, isFha, isUsda, fhaPmiLifetime,
    initHomeValue, appreciationRate, startMonth, startYear, collectRows } = opts;

  const { periodsPerYear, rDivisor } = periodsConfig(freq);
  const rPeriod = annualRate / 100 / rDivisor;
  const piPayment = calcPiPayment(la, annualRate, loanTermMonths, freq);
  // Extra monthly converted to per-period equivalent
  const extraPerPeriod = (extraMonthly * 12) / periodsPerYear;

  const isCustomTerm = ![120, 180, 240, 300, 360].includes(loanTermMonths);
  const pmiAmortTermMonths = isCustomTerm ? 360 : loanTermMonths;
  const stdPiPayment = calcPiPayment(la, annualRate, pmiAmortTermMonths, freq);

  let balance = la;
  let standardBalance = la;
  let totalInterest = 0;
  let totalPmiCost = 0;
  let pmiCancelPeriod = -1;
  let currentPeriod = 0;
  const maxPeriods = 100 * periodsPerYear;
  const ltvCurve: LtvPoint[] = [];
  const rows: AmortizationRow[] = [];
  let cumulativeInterest = 0;
  // Monthly appreciation multiplier
  const monthlyApprFactor = appreciationRate > 0 ? Math.pow(1 + appreciationRate / 100, 1 / 12) : 1;
  let currentHv = initHomeValue;
  let lastApprMonth = 0;

  while (balance > 0.005 && currentPeriod < maxPeriods) {
    currentPeriod++;

    // Advance appreciation by elapsed months
    const elapsedMonth = Math.ceil(currentPeriod * 12 / periodsPerYear);
    if (appreciationRate > 0 && elapsedMonth > lastApprMonth) {
      const newMonths = elapsedMonth - lastApprMonth;
      currentHv *= Math.pow(monthlyApprFactor, newMonths);
      lastApprMonth = elapsedMonth;
    }

    const interest = balance * rPeriod;
    totalInterest += interest;
    cumulativeInterest += interest;

    // Extra payments
    let extra = extraPerPeriod;
    if (currentPeriod === 1) extra += oneTimeExtra;
    // Annual extra: at each full year's worth of periods
    if (annualExtra > 0 && currentPeriod % periodsPerYear === 0) extra += annualExtra;

    let principal = piPayment - interest + extra;
    if (principal < 0) principal = 0;
    const prevBalance = balance;
    if (principal > balance) principal = balance;
    balance = prevBalance - principal;
    if (balance < 0) balance = 0;

    // Standard Amortization tracking (ignores extra payments, uses pmiAmortTermMonths)
    const stdInterest = standardBalance * rPeriod;
    let stdPrincipal = stdPiPayment - stdInterest;
    if (stdPrincipal < 0) stdPrincipal = 0;
    const prevStandardBalance = standardBalance;
    if (stdPrincipal > standardBalance) stdPrincipal = standardBalance;
    standardBalance -= stdPrincipal;
    if (standardBalance < 0) standardBalance = 0;

    const currentMonth = Math.ceil(currentPeriod * 12 / periodsPerYear);
    const currentTarget = currentHv * 0.80;

    // PMI tracking
    let pmiThisPeriod = 0;
    if (pmiRequired) {
      let pmiActive = false;
      if (isUsda) {
        pmiActive = true;
      } else if (isFha) {
        pmiActive = fhaPmiLifetime || currentMonth <= 132; // 11 years
      } else {
        // Conventional: PMI active while prev standard balance > 80% threshold
        pmiActive = prevStandardBalance > currentTarget;
      }

      if (pmiActive) {
        pmiThisPeriod = activeMonthlyPmi * (12 / periodsPerYear);
        totalPmiCost += pmiThisPeriod;
      }

      // Record cancel period for conventional (first period where standard balance crosses below threshold)
      if (!isFha && !isUsda && pmiCancelPeriod === -1 && prevStandardBalance > currentTarget && standardBalance <= currentTarget) {
        pmiCancelPeriod = currentPeriod;
      }
    }

    // LTV curve: record once per month
    if (currentPeriod % Math.max(1, Math.round(periodsPerYear / 12)) === 0) {
      ltvCurve.push({ month: currentMonth, ltv: parseFloat(Math.max(0, (balance / currentHv) * 100).toFixed(2)) });
    }

    if (collectRows) {
      const dateStr = addMonths(startMonth, startYear, currentMonth);
      rows.push({
        month: currentMonth,
        date: dateStr,
        payment: parseFloat((piPayment + extra).toFixed(2)),
        principal: parseFloat(principal.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
        pmi: parseFloat(pmiThisPeriod.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        cumulativeInterest: parseFloat(cumulativeInterest.toFixed(2)),
        isPmiCancelRow: pmiCancelPeriod === currentPeriod,
      });
    }
  }

  // Determine PMI cancel month in calendar months
  let pmiCancelMonth: number;
  if (isFha) {
    pmiCancelMonth = fhaPmiLifetime
      ? Math.ceil(currentPeriod * 12 / periodsPerYear)
      : Math.min(132, Math.ceil(currentPeriod * 12 / periodsPerYear));
  } else if (isUsda) {
    pmiCancelMonth = Math.ceil(currentPeriod * 12 / periodsPerYear);
  } else if (pmiRequired) {
    pmiCancelMonth = pmiCancelPeriod > 0
      ? Math.ceil(pmiCancelPeriod * 12 / periodsPerYear)
      : Math.ceil(currentPeriod * 12 / periodsPerYear);
  } else {
    pmiCancelMonth = 0;
  }

  return {
    totalInterest,
    pmiCancelMonth,
    payoffMonths: Math.ceil(currentPeriod * 12 / periodsPerYear),
    payoffPeriods: currentPeriod,
    totalPmiCost,
    ltvCurve,
    amortizationRows: rows,
  };
}

// ─── Public Entry Point ───────────────────────────────────────────────────────
export function calculatePmi(inp: PmiInputs): PmiResults {
  const hv = inp.homeValue;
  const dpAmt = inp.dpMode === "percent" ? hv * (inp.dpPct / 100) : inp.dpAmt;
  const baseLa = hv - dpAmt;
  const dpPct = hv > 0 ? (dpAmt / hv) * 100 : 0;
  const ltv = hv > 0 ? (baseLa / hv) * 100 : 0;

  const isFha = inp.loanType === "fha";
  const isConventional = inp.loanType === "conventional";
  const isVa = inp.loanType === "va";
  const isUsda = inp.loanType === "usda";
  const noMipLoan = isVa;
  const loanTermMonths = inp.loanTerm * 12;

  // Financed fees
  let upfrontMip = 0;
  let vaFundingFee = 0;
  let la = baseLa;
  if (isFha) {
    upfrontMip = baseLa * FHA_UPFRONT_MIP_RATE;
    la += upfrontMip;
  } else if (isVa) {
    vaFundingFee = baseLa * (inp.vaFundingFeeRate / 100);
    la += vaFundingFee;
  }

  // Standard monthly P&I for display
  const rM = inp.interestRate / 100 / 12;
  const nM = loanTermMonths;
  const monthlyPI = la > 0 && rM > 0 && nM > 0
    ? la * (rM * Math.pow(1 + rM, nM)) / (Math.pow(1 + rM, nM) - 1)
    : la > 0 && nM > 0 ? la / nM : 0;

  const monthlyTax = inp.propertyTax / 12;
  const monthlyInsurance = inp.homeInsurance / 12;
  const monthlyHoa = inp.hoaFee;

  // PMI rate & tier
  let pmiRate = 0;
  let creditTierLabel = "";
  const pmiRequired = isConventional ? ltv > 80 : (isFha || isUsda);

  if (isConventional && pmiRequired) {
    if (inp.pmiMode === "manual") {
      pmiRate = inp.manualPmiRate;
      creditTierLabel = "Manual rate";
    } else {
      const res = getConventionalPmiRate(ltv, inp.creditScore, inp.propertyUse);
      pmiRate = res.rate;
      creditTierLabel = res.tierLabel;
    }
  } else {
    const { label } = { label: getConventionalPmiRate(ltv, inp.creditScore, inp.propertyUse).tierLabel };
    creditTierLabel = label;
  }

  const monthlyPmi = isConventional && pmiRequired ? (baseLa * pmiRate / 100) / 12 : 0;

  // FHA MIP
  let annualMipRate = 0;
  let monthlyMip = 0;
  let fhaPmiLifetime = false;
  if (isFha) {
    annualMipRate = inp.fhaMipMode === "manual"
      ? inp.manualFhaMipRate
      : getFhaAnnualMipRate(ltv);
    monthlyMip = (baseLa * annualMipRate / 100) / 12;
    fhaPmiLifetime = dpPct < 10;
  } else if (isUsda) {
    annualMipRate = 0.35;
    monthlyMip = (baseLa * 0.35 / 100) / 12;
  }

  const activeMonthlyPmi = isFha || isUsda ? monthlyMip : (isConventional ? monthlyPmi : 0);
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHoa + activeMonthlyPmi;

  const commonOpts = {
    la, annualRate: inp.interestRate, loanTermMonths,
    freq: inp.paymentFreq,
    activeMonthlyPmi, pmiRequired, isFha, isUsda, fhaPmiLifetime,
    initHomeValue: hv, appreciationRate: inp.appreciationRate,
    startMonth: inp.startMonth, startYear: inp.startYear,
  };

  // ── VA / No PMI early exit ──────────────────────────────────────────────
  if (noMipLoan) {
    const loop = runLoop({ ...commonOpts, extraMonthly: inp.extraMonthly, oneTimeExtra: inp.oneTimeExtra, annualExtra: inp.annualExtra, collectRows: true });
    return {
      loanAmount: la, ltv, monthlyPI, pmiRequired: false, pmiRate: 0, monthlyPmi: 0,
      totalMonthly, monthlyTax, monthlyInsurance, monthlyHoa,
      pmiCancelMonth: 0, pmiCancelDate: "Not Required", totalPmiCost: 0, monthlySavingsAfterPmi: 0,
      upfrontMip: 0, annualMipRate: 0, monthlyMip: 0, noMipLoan: true,
      totalInterest: loop.totalInterest, totalPI: la + loop.totalInterest,
      payoffMonths: loop.payoffMonths, payoffPeriods: loop.payoffPeriods, vaFundingFee, fhaPmiLifetime: false,
      creditTierLabel, interestSaved: 0, pmiMonthsSaved: 0,
      ltvCurve: loop.ltvCurve, ltvCurveAccel: [], ltvCurveAppreciation: [],
      amortizationRows: loop.amortizationRows, noPmiSavingsVs10: 0,
      interestSavedVsMonthly: 0, payoffMonthsSavedVsMonthly: 0, pmiMonthsSavedVsMonthly: 0,
    };
  }

  // ── Main loop (with user's extra payments) ──────────────────────────────
  const main = runLoop({ ...commonOpts, extraMonthly: inp.extraMonthly, oneTimeExtra: inp.oneTimeExtra, annualExtra: inp.annualExtra, collectRows: true });

  // ── No-extra baseline (for interestSaved / pmiMonthsSaved) ─────────────
  const hasExtra = inp.extraMonthly > 0 || inp.oneTimeExtra > 0 || inp.annualExtra > 0;
  let interestSaved = 0;
  let pmiMonthsSaved = 0;
  let noExtraLtvCurve: LtvPoint[] = main.ltvCurve; // default: same
  let accelLtvCurve: LtvPoint[] = [];

  if (hasExtra) {
    const noExtra = runLoop({ ...commonOpts, extraMonthly: 0, oneTimeExtra: 0, annualExtra: 0, collectRows: true });
    interestSaved = Math.max(0, noExtra.totalInterest - main.totalInterest);
    pmiMonthsSaved = Math.max(0, noExtra.pmiCancelMonth - main.pmiCancelMonth);
    noExtraLtvCurve = noExtra.ltvCurve;
    accelLtvCurve = main.ltvCurve;
  }

  // ── Appreciation curve ──────────────────────────────────────────────────
  let ltvCurveAppreciation: LtvPoint[] = [];
  if (inp.appreciationRate > 0) {
    const apprLoop = runLoop({ ...commonOpts, extraMonthly: inp.extraMonthly, oneTimeExtra: inp.oneTimeExtra, annualExtra: inp.annualExtra, collectRows: false });
    ltvCurveAppreciation = apprLoop.ltvCurve;
  }

  // ── Savings vs monthly baseline ─────────────────────────────────────────
  let interestSavedVsMonthly = 0;
  let payoffMonthsSavedVsMonthly = 0;
  let pmiMonthsSavedVsMonthly = 0;
  if (inp.paymentFreq !== "monthly") {
    const monthlyLoop = runLoop({ ...commonOpts, freq: "monthly", extraMonthly: inp.extraMonthly, oneTimeExtra: inp.oneTimeExtra, annualExtra: inp.annualExtra, collectRows: false });
    interestSavedVsMonthly = Math.max(0, monthlyLoop.totalInterest - main.totalInterest);
    payoffMonthsSavedVsMonthly = Math.max(0, monthlyLoop.payoffMonths - main.payoffMonths);
    pmiMonthsSavedVsMonthly = Math.max(0, monthlyLoop.pmiCancelMonth - main.pmiCancelMonth);
  }

  // ── No PMI savings vs 10% down ──────────────────────────────────────────
  let noPmiSavingsVs10 = 0;
  if (!pmiRequired && isConventional) {
    const { rate: rate10 } = getConventionalPmiRate(90, inp.creditScore, inp.propertyUse);
    noPmiSavingsVs10 = (hv * 0.90 * rate10 / 100) / 12;
  }

  // ── PMI cancel date ─────────────────────────────────────────────────────
  const pmiCancelMonth = main.pmiCancelMonth;
  let pmiCancelDate: string;
  if (isFha) {
    pmiCancelDate = (fhaPmiLifetime && pmiCancelMonth >= main.payoffMonths)
      ? "Life of Loan"
      : addMonths(inp.startMonth, inp.startYear, pmiCancelMonth);
  } else if (isUsda) {
    pmiCancelDate = "Life of Loan";
  } else if (isVa) {
    pmiCancelDate = "Not Required";
  } else {
    pmiCancelDate = pmiCancelMonth === 0 ? "Not Required" : addMonths(inp.startMonth, inp.startYear, pmiCancelMonth);
  }

  const monthlySavingsAfterPmi = isFha
    ? (fhaPmiLifetime && pmiCancelMonth >= main.payoffMonths ? 0 : monthlyMip)
    : isUsda ? 0 : monthlyPmi;

  return {
    loanAmount: la, ltv, monthlyPI, pmiRequired, pmiRate, monthlyPmi,
    totalMonthly, monthlyTax, monthlyInsurance, monthlyHoa,
    pmiCancelMonth, pmiCancelDate,
    totalPmiCost: main.totalPmiCost,
    monthlySavingsAfterPmi,
    upfrontMip, annualMipRate, monthlyMip, noMipLoan: false,
    totalInterest: main.totalInterest, totalPI: la + main.totalInterest,
    payoffMonths: main.payoffMonths, payoffPeriods: main.payoffPeriods,
    vaFundingFee, fhaPmiLifetime,
    creditTierLabel, interestSaved, pmiMonthsSaved,
    ltvCurve: noExtraLtvCurve,
    ltvCurveAccel: accelLtvCurve,
    ltvCurveAppreciation,
    amortizationRows: main.amortizationRows,
    noPmiSavingsVs10,
    interestSavedVsMonthly, payoffMonthsSavedVsMonthly, pmiMonthsSavedVsMonthly,
  };
}
