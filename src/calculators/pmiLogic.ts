export type LoanType = "conventional" | "fha" | "va" | "usda";
export type PaymentFreq = "monthly" | "biweekly";
export type DpMode = "percent" | "amount";
export type PmiMode = "auto" | "manual";

export interface PmiInputs {
  homeValue: number;
  dpMode: DpMode;
  dpPct: number;
  dpAmt: number;
  interestRate: number;
  loanTerm: number;
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
}

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function autoEstimatePmiRate(ltv: number, creditScore: number): number {
  let base = 0.5;
  if (ltv > 95) base = 1.15;
  else if (ltv > 90) base = 0.85;
  else if (ltv > 85) base = 0.62;
  else if (ltv > 80) base = 0.45;
  if (creditScore >= 760) base *= 0.75;
  else if (creditScore >= 720) base *= 1.0;
  else if (creditScore >= 680) base *= 1.35;
  else if (creditScore >= 640) base *= 1.8;
  else base *= 2.2;
  return Math.round(base * 100) / 100;
}

function autoEstimateFhaMip(ltv: number, loanTerm: number): number {
  if (loanTerm <= 15) {
    if (ltv <= 90) return 0.45;
    return 0.70;
  }
  if (ltv <= 90) return 0.50;
  if (ltv <= 95) return 0.80;
  return 0.85;
}

function addMonths(monthName: string, year: string, n: number): string {
  const idx = MONTHS.indexOf(monthName);
  const y = parseInt(year) || new Date().getFullYear();
  const totalMonths = (y * 12 + idx) + n;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = totalMonths % 12;
  return `${MONTHS[newMonth]} ${newYear}`;
}

export function calculatePmi(inp: PmiInputs): PmiResults {
  const hv = inp.homeValue;
  const la = inp.dpMode === "percent" ? hv * (1 - inp.dpPct / 100) : hv - inp.dpAmt;
  const ltv = hv > 0 ? (la / hv) * 100 : 0;
  const r = inp.interestRate / 100 / 12;
  const n = inp.loanTerm * 12;
  const monthlyPI = la > 0 && r > 0 && n > 0
    ? la * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : 0;

  const monthlyTax = inp.propertyTax / 12;
  const monthlyInsurance = inp.homeInsurance / 12;
  const monthlyHoa = inp.hoaFee;

  // VA / USDA - no PMI
  if (inp.loanType === "va" || inp.loanType === "usda") {
    return {
      loanAmount: la, ltv, monthlyPI, pmiRequired: false, pmiRate: 0,
      monthlyPmi: 0, totalMonthly: monthlyPI + monthlyTax + monthlyInsurance + monthlyHoa,
      monthlyTax, monthlyInsurance, monthlyHoa,
      pmiCancelMonth: 0, pmiCancelDate: "N/A", totalPmiCost: 0,
      monthlySavingsAfterPmi: 0,
      upfrontMip: 0, annualMipRate: 0, monthlyMip: 0, noMipLoan: true,
    };
  }

  // FHA
  if (inp.loanType === "fha") {
    const upfrontMip = la * 0.0175;
    const annualMipRate = inp.fhaMipMode === "manual"
      ? inp.manualFhaMipRate
      : autoEstimateFhaMip(ltv, inp.loanTerm);
    const monthlyMip = (la * annualMipRate / 100) / 12;
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHoa + monthlyMip;
    // FHA MIP: lifetime if dp<10%; else 11 years (132 months) max
    const pmiLifetime = inp.dpPct < 10;
    const fhaCancelMonths = pmiLifetime ? n : Math.min(n, 132);
    return {
      loanAmount: la, ltv, monthlyPI, pmiRequired: true, pmiRate: annualMipRate,
      monthlyPmi: monthlyMip, totalMonthly, monthlyTax, monthlyInsurance, monthlyHoa,
      pmiCancelMonth: fhaCancelMonths,
      pmiCancelDate: pmiLifetime ? "Life of Loan" : addMonths(inp.startMonth, inp.startYear, fhaCancelMonths),
      totalPmiCost: monthlyMip * fhaCancelMonths,
      monthlySavingsAfterPmi: pmiLifetime ? 0 : monthlyMip,
      upfrontMip, annualMipRate, monthlyMip, noMipLoan: false,
    };
  }

  // Conventional
  const pmiRequired = ltv > 80;
  const pmiRate = pmiRequired
    ? (inp.pmiMode === "manual" ? inp.manualPmiRate : autoEstimatePmiRate(ltv, inp.creditScore))
    : 0;
  const monthlyPmi = pmiRequired ? (la * pmiRate / 100) / 12 : 0;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHoa + monthlyPmi;

  // Simulate to 80% LTV
  let balance = la;
  let cancelMonth = 0;
  const target = hv * 0.80;
  const biweeklyExtra = inp.paymentFreq === "biweekly" ? monthlyPI / 12 : 0;
  
  while (balance > target && cancelMonth < n * 2) {
    cancelMonth++;
    const interest = balance * r;
    let principal = monthlyPI - interest + biweeklyExtra + (cancelMonth === 1 ? inp.oneTimeExtra : 0) + inp.extraMonthly + (cancelMonth % 12 === 0 ? inp.annualExtra : 0);
    if (principal > balance) principal = balance;
    balance -= principal;
  }

  return {
    loanAmount: la, ltv, monthlyPI, pmiRequired, pmiRate,
    monthlyPmi, totalMonthly, monthlyTax, monthlyInsurance, monthlyHoa,
    pmiCancelMonth: cancelMonth,
    pmiCancelDate: addMonths(inp.startMonth, inp.startYear, cancelMonth),
    totalPmiCost: monthlyPmi * cancelMonth,
    monthlySavingsAfterPmi: monthlyPmi,
    upfrontMip: 0, annualMipRate: 0, monthlyMip: 0, noMipLoan: false,
  };
}
