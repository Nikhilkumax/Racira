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
  vaFundingFeeRate: number;
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
  vaFundingFee: number;
  fhaPmiLifetime: boolean;
}

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function autoEstimatePmiRate(ltv: number, creditScore: number, propertyUse: string): number {
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
  
  if (propertyUse === "investment") base += 0.4;
  else if (propertyUse === "second") base += 0.15;
  
  return Math.round(base * 100) / 100;
}

function autoEstimateFhaMip(ltv: number, loanTerm: number): number {
  if (loanTerm <= 15) {
    if (ltv <= 90) return 0.55;
    return 0.75;
  }
  if (ltv <= 90) return 0.80;
  if (ltv <= 95) return 0.85;
  return 1.05;
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
  const dpAmt = inp.dpMode === "percent" ? hv * (inp.dpPct / 100) : inp.dpAmt;
  const baseLa = hv - dpAmt;
  const dpPct = hv > 0 ? (dpAmt / hv) * 100 : 0;
  const ltv = hv > 0 ? (baseLa / hv) * 100 : 0;

  let upfrontMip = 0;
  let vaFundingFee = 0;
  let la = baseLa;
  
  if (inp.loanType === "fha") {
    upfrontMip = baseLa * 0.0175;
    la += upfrontMip;
  } else if (inp.loanType === "va") {
    vaFundingFee = baseLa * (inp.vaFundingFeeRate / 100);
    la += vaFundingFee;
  }

  const r = inp.interestRate / 100 / 12;
  const n = inp.loanTerm * 12;
  const monthlyPI = la > 0 && r > 0 && n > 0
    ? la * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : 0;

  const monthlyTax = inp.propertyTax / 12;
  const monthlyInsurance = inp.homeInsurance / 12;
  const monthlyHoa = inp.hoaFee;

  const isFha = inp.loanType === "fha";
  const isConventional = inp.loanType === "conventional";
  const isVa = inp.loanType === "va";
  const isUsda = inp.loanType === "usda";
  const noMipLoan = isVa;

  const pmiRequired = isConventional ? ltv > 80 : (isFha || isUsda);
  const pmiRate = isConventional && pmiRequired
    ? (inp.pmiMode === "manual" ? inp.manualPmiRate : autoEstimatePmiRate(ltv, inp.creditScore, inp.propertyUse))
    : 0;
  
  const monthlyPmi = isConventional && pmiRequired ? (baseLa * pmiRate / 100) / 12 : 0;

  let annualMipRate = 0;
  let monthlyMip = 0;
  let fhaPmiLifetime = false;

  if (isFha) {
    annualMipRate = inp.fhaMipMode === "manual" ? inp.manualFhaMipRate : autoEstimateFhaMip(ltv, inp.loanTerm);
    monthlyMip = (baseLa * annualMipRate / 100) / 12;
    fhaPmiLifetime = dpPct < 10;
  } else if (isUsda) {
    annualMipRate = 0.35;
    monthlyMip = (baseLa * 0.35 / 100) / 12;
  }

  const activeMonthlyPmi = isFha || isUsda ? monthlyMip : (isConventional ? monthlyPmi : 0);
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHoa + activeMonthlyPmi;

  let balance = la;
  let currentPeriod = 0;
  let totalInterest = 0;
  let pmiPeriods = 0;

  const targetLTV = hv * 0.80; 
  
  const isBiweekly = inp.paymentFreq === "biweekly";
  const periodsPerYear = isBiweekly ? 26 : 12;
  const rPeriod = inp.interestRate / 100 / periodsPerYear;
  const piPayment = isBiweekly ? monthlyPI / 2 : monthlyPI;
  const extraPerPeriod = (inp.extraMonthly * 12) / periodsPerYear;
  
  const maxPeriods = 100 * periodsPerYear;

  while (balance > 0.005 && currentPeriod < maxPeriods) {
    currentPeriod++;
    const interest = balance * rPeriod;
    totalInterest += interest;
    
    let principal = piPayment - interest + extraPerPeriod 
                    + (currentPeriod === 1 ? inp.oneTimeExtra : 0) 
                    + (currentPeriod % periodsPerYear === 0 ? inp.annualExtra : 0);
    
    if (principal > balance) principal = balance;
    
    const currentMonthForRules = currentPeriod / (periodsPerYear / 12);
    
    if (isConventional && pmiRequired) {
      if (balance > targetLTV) {
        pmiPeriods++;
      }
    } else if (isFha) {
      if (!fhaPmiLifetime && currentMonthForRules <= 132) {
        pmiPeriods++;
      } else if (fhaPmiLifetime) {
        pmiPeriods++;
      }
    } else if (isUsda) {
      pmiPeriods++;
    }

    balance -= principal;
  }

  const totalPI = la + totalInterest;
  const pmiCancelMonth = Math.ceil(pmiPeriods / (periodsPerYear / 12));
  const payoffMonths = Math.ceil(currentPeriod / (periodsPerYear / 12));
  const totalPmiCost = activeMonthlyPmi * pmiCancelMonth;

  if (noMipLoan) { // VA
    return {
      loanAmount: la, ltv, monthlyPI, pmiRequired: false, pmiRate: 0,
      monthlyPmi: 0, totalMonthly,
      monthlyTax, monthlyInsurance, monthlyHoa,
      pmiCancelMonth: 0, pmiCancelDate: "N/A", totalPmiCost: 0,
      monthlySavingsAfterPmi: 0,
      upfrontMip: 0, annualMipRate: 0, monthlyMip: 0, noMipLoan: true,
      totalInterest, totalPI, payoffMonths, vaFundingFee, fhaPmiLifetime: false
    };
  }

  if (isFha) {
    return {
      loanAmount: la, ltv, monthlyPI, pmiRequired: true, pmiRate: annualMipRate,
      monthlyPmi: monthlyMip, totalMonthly, monthlyTax, monthlyInsurance, monthlyHoa,
      pmiCancelMonth,
      pmiCancelDate: (fhaPmiLifetime && pmiCancelMonth >= payoffMonths) ? "Life of Loan" : addMonths(inp.startMonth, inp.startYear, pmiCancelMonth),
      totalPmiCost,
      monthlySavingsAfterPmi: (fhaPmiLifetime && pmiCancelMonth >= payoffMonths) ? 0 : monthlyMip,
      upfrontMip, annualMipRate, monthlyMip, noMipLoan: false,
      totalInterest, totalPI, payoffMonths, vaFundingFee, fhaPmiLifetime
    };
  }

  if (isUsda) {
    return {
      loanAmount: la, ltv, monthlyPI, pmiRequired: true, pmiRate: annualMipRate,
      monthlyPmi: monthlyMip, totalMonthly, monthlyTax, monthlyInsurance, monthlyHoa,
      pmiCancelMonth,
      pmiCancelDate: "Life of Loan",
      totalPmiCost,
      monthlySavingsAfterPmi: 0,
      upfrontMip: 0, annualMipRate, monthlyMip, noMipLoan: false,
      totalInterest, totalPI, payoffMonths, vaFundingFee: 0, fhaPmiLifetime: false
    };
  }

  // Conventional
  return {
    loanAmount: la, ltv, monthlyPI, pmiRequired, pmiRate,
    monthlyPmi, totalMonthly, monthlyTax, monthlyInsurance, monthlyHoa,
    pmiCancelMonth,
    pmiCancelDate: pmiCancelMonth === 0 ? "N/A" : addMonths(inp.startMonth, inp.startYear, pmiCancelMonth),
    totalPmiCost,
    monthlySavingsAfterPmi: monthlyPmi,
    upfrontMip: 0, annualMipRate: 0, monthlyMip: 0, noMipLoan: false,
    totalInterest, totalPI, payoffMonths, vaFundingFee: 0, fhaPmiLifetime: false
  };
}
