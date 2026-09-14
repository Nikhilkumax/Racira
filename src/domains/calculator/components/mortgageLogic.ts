/**
 * mortgageLogic.ts — pure calculation core for MortgageCalculator.
 * Moved verbatim from MortgageCalculator.tsx so the math can be unit-tested.
 */
import type { AmortRow } from "./ui/AmortizationTable";

export const parseMonthStr = (mStr: string): number => {
  if (!mStr) return 1;
  const normalized = mStr.trim().toLowerCase();
  const monthsMap: Record<string, number> = {
    jan: 1, january: 1, "1": 1, "01": 1,
    feb: 2, february: 2, "2": 2, "02": 2,
    mar: 3, march: 3, "3": 3, "03": 3,
    apr: 4, april: 4, "4": 4, "04": 4,
    may: 5, "5": 5, "05": 5,
    jun: 6, june: 6, "6": 6, "06": 6,
    jul: 7, july: 7, "7": 7, "07": 7,
    aug: 8, august: 8, "8": 8, "08": 8,
    sep: 9, september: 9, "9": 9, "09": 9,
    oct: 10, october: 10, "10": 10,
    nov: 11, november: 11, "11": 11,
    dec: 12, december: 12, "12": 12,
  };
  return monthsMap[normalized] || parseInt(normalized) || 1;
};

export interface MortgageResults {
  monthlyPI: number;
  totalMonthly: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  interestSaved: number;
  timeSavedMonths: number;
  loanAmount: number;
  totalTaxInsurance: number;
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
  totalPmiCost: number;
  totalHoaOther: number;
}

export const calculateMortgage = ({
  homePriceVal,
  dpModeVal,
  dpPctVal,
  dpAmtVal,
  interestRateVal,
  loanTermVal,
  startDateVal,
  extraMonthlyVal,
  oneTimeExtraVal,
  annualExtraVal,
  propertyTaxVal,
  homeInsuranceVal,
  pmiVal,
  hoaFeeVal,
  otherCostsVal,
  paymentFreqVal,
}: {
  homePriceVal: number;
  dpModeVal: "percent" | "amount";
  dpPctVal: number;
  dpAmtVal: number;
  interestRateVal: number;
  loanTermVal: number;
  startDateVal: string;
  extraMonthlyVal: number;
  oneTimeExtraVal: number;
  annualExtraVal: number;
  propertyTaxVal: number;
  homeInsuranceVal: number;
  pmiVal: number;
  hoaFeeVal: number;
  otherCostsVal: number;
  paymentFreqVal: "monthly" | "biweekly";
}): MortgageResults => {
  const isBiweekly = paymentFreqVal === "biweekly";
  const periodsPerYear = isBiweekly ? 26 : 12;
  const hp = homePriceVal;
  const P = dpModeVal === "percent" ? hp * (1 - dpPctVal / 100) : hp - dpAmtVal;
  const annualRate = interestRateVal;
  const years = loanTermVal;
  const extraM = extraMonthlyVal;
  const oneTime = oneTimeExtraVal;
  const annualE = annualExtraVal;

  const taxPeriodic = propertyTaxVal / periodsPerYear;
  const insPeriodic = homeInsuranceVal / periodsPerYear;
  const hoaPeriodic = (hoaFeeVal * 12) / periodsPerYear;
  const otherPeriodic = (otherCostsVal * 12) / periodsPerYear;

  // annualPmiRate derived from monthly input assuming it's based on initial loan
  const annualPmiRate = P > 0 ? (pmiVal * 12) / P : 0;

  const periodicRate = annualRate / 100 / periodsPerYear;
  const n = years * periodsPerYear;

  if (P <= 0 || n <= 0) {
    return {
      monthlyPI: 0, totalMonthly: 0, totalInterest: 0, totalCost: 0, payoffDate: "N/A",
      interestSaved: 0, timeSavedMonths: 0, loanAmount: P, totalTaxInsurance: 0,
      monthlyRows: [], yearlyRows: [], totalPmiCost: 0, totalHoaOther: 0
    };
  }

  const basePayment = periodicRate > 0
    ? P * (periodicRate * Math.pow(1 + periodicRate, n)) / (Math.pow(1 + periodicRate, n) - 1)
    : P / n;

  // Baseline loop (no extra payments) to calculate savings
  let balanceBase = P;
  let totalInterestBase = 0;
  let periodBase = 0;
  while (balanceBase > 0.01 && periodBase < n * 2) {
    periodBase++;
    const intPmt = periodicRate > 0 ? balanceBase * periodicRate : 0;
    let prinPmt = basePayment - intPmt;
    if (prinPmt > balanceBase) prinPmt = balanceBase;
    totalInterestBase += intPmt;
    balanceBase -= prinPmt;
  }
  const totalPeriodsBase = periodBase;

  // Actual loop with extras and PMI tracking
  let balance = P;
  const periodicRows: AmortRow[] = [];
  let totalPaidLoop = 0;
  let period = 0;
  let totalPmiCost = 0;
  let pmiActive = (P / hp) > 0.80;

  while (balance > 0.01 && period < n * 2) {
    period++;
    const intPayment = periodicRate > 0 ? balance * periodicRate : 0;
    let prinPayment = basePayment - intPayment;

    // Add extra payments properly scaled
    let extra = isBiweekly ? (extraM * 12 / 26) : extraM;
    if (period === 1) extra += oneTime;
    if (period % periodsPerYear === 0) extra += annualE;

    prinPayment += extra;
    if (prinPayment > balance) prinPayment = balance;

    // Check PMI auto-cancellation
    const currentLTV = balance / hp;
    if (currentLTV <= 0.80) {
      pmiActive = false;
    }
    let currentPeriodicPMI = 0;
    if (pmiActive) {
      currentPeriodicPMI = (annualPmiRate * balance) / periodsPerYear;
      totalPmiCost += currentPeriodicPMI;
    }

    const totalPayment = intPayment + prinPayment;
    balance -= prinPayment;
    totalPaidLoop += totalPayment;

    periodicRows.push({
      period,
      payment: totalPayment,
      principal: prinPayment,
      interest: intPayment,
      extraPayment: extra,
      balance: Math.max(0, balance),
    });
  }

  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(periodicRows.length / periodsPerYear); y++) {
    const yearSlice = periodicRows.slice(y * periodsPerYear, (y + 1) * periodsPerYear);
    if (yearSlice.length === 0) break;
    yearlyRows.push({
      period: y + 1,
      payment: yearSlice.reduce((s, row) => s + row.payment, 0),
      principal: yearSlice.reduce((s, row) => s + row.principal, 0),
      interest: yearSlice.reduce((s, row) => s + row.interest, 0),
      balance: yearSlice[yearSlice.length - 1].balance,
    });
  }

  const sd = startDateVal.split("-");
  const startMonth = parseMonthStr(sd[1]);
  const startYear = parseInt(sd[0]) || new Date().getFullYear();

  // Calculate exact payoff date based on periods
  const payoffMonth = ((startMonth - 1 + Math.ceil(period * 12 / periodsPerYear)) % 12) + 1;
  const payoffYear = startYear + Math.floor((startMonth - 1 + Math.ceil(period * 12 / periodsPerYear)) / 12);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const actualInterestPaid = totalPaidLoop - P;
  const periodsSaved = totalPeriodsBase - period;
  const timeSavedMonths = periodsSaved * 12 / periodsPerYear;
  const interestSaved = Math.max(0, totalInterestBase - actualInterestPaid);
  const hasExtras = extraM > 0 || oneTime > 0 || annualE > 0;

  const totalTaxInsurance = (propertyTaxVal + homeInsuranceVal) * years;

  const totalHoaOther = (hoaFeeVal * 12 + otherCostsVal * 12) * years;
  const totalCost = totalPaidLoop + totalTaxInsurance + totalPmiCost + totalHoaOther;

  return {
    monthlyPI: basePayment,
    totalMonthly: basePayment + taxPeriodic + insPeriodic + (pmiActive ? (annualPmiRate * P) / periodsPerYear : 0) + hoaPeriodic + otherPeriodic,
    totalInterest: actualInterestPaid,
    totalCost: totalCost,
    payoffDate: `${monthNames[payoffMonth - 1]} ${payoffYear}`,
    interestSaved: hasExtras ? interestSaved : 0,
    timeSavedMonths: hasExtras ? timeSavedMonths : 0,
    loanAmount: P,
    totalTaxInsurance: totalTaxInsurance,
    monthlyRows: periodicRows,
    yearlyRows,
    totalPmiCost,
    totalHoaOther: totalHoaOther,
  };
};
