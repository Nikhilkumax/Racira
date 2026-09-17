/**
 * homeLoanLogic.ts — pure calculation core for HomeLoanCalculator.
 * Moved verbatim from HomeLoanCalculator.tsx so the math can be unit-tested.
 */
import type { AmortRow } from "./ui/AmortizationTable";

export interface HomeLoanInputs {
  propertyPrice: number;
  downPaymentPct: number;
  downPaymentAmt: number;
  dpMode: "percent" | "amount";
  interestRate: number;
  loanTerm: number;
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHoa: number;
}

export interface HomeLoanResults {
  loanAmount: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalCostOfLoan: number;
  payoffYear: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; monthly: string; total: string; isTotal?: boolean; colorClass?: string }[];
  yearlyRows: AmortRow[];
  monthlyRows: AmortRow[];
}

export const calculateHomeLoan = (inputs: HomeLoanInputs): HomeLoanResults => {
  const {
    propertyPrice,
    downPaymentPct,
    downPaymentAmt,
    dpMode,
    interestRate,
    loanTerm,
    annualPropertyTax,
    annualInsurance,
    monthlyHoa,
  } = inputs;

  const actualDownPayment = dpMode === "percent" ? propertyPrice * (downPaymentPct / 100) : downPaymentAmt;
  const loanAmount = Math.max(0, propertyPrice - actualDownPayment);

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPI = 0;
  if (loanAmount > 0) {
    if (monthlyRate > 0) {
      monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPI = loanAmount / numberOfPayments;
    }
  }

  const monthlyTax = annualPropertyTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + monthlyHoa;

  let balance = loanAmount;
  let totalInterestPaid = 0;

  const monthlyRows: AmortRow[] = [];
  const yearlyRows: AmortRow[] = [];

  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let i = 1; i <= numberOfPayments && balance > 0.01; i++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPI - interest;

    if (principal > balance) principal = balance;
    balance -= principal;
    totalInterestPaid += interest;

    monthlyRows.push({
      period: i,
      payment: interest + principal,
      principal,
      interest,
      balance: Math.max(0, balance),
    });

    currentYearInterest += interest;
    currentYearPrincipal += principal;
    currentYearPayment += (interest + principal);

    if (i % 12 === 0 || i === numberOfPayments) {
      yearlyRows.push({
        period: Math.ceil(i / 12),
        payment: currentYearPayment,
        principal: currentYearPrincipal,
        interest: currentYearInterest,
        balance: Math.max(0, balance),
      });
      currentYearInterest = 0;
      currentYearPrincipal = 0;
      currentYearPayment = 0;
    }
  }

  const totalPrincipalPaid = loanAmount;

  const totalTaxes = annualPropertyTax * loanTerm;
  const totalIns = annualInsurance * loanTerm;
  const totalHoa = monthlyHoa * 12 * loanTerm;

  const totalCostOfLoan = totalPrincipalPaid + totalInterestPaid + totalTaxes + totalIns + totalHoa;

  const currentYear = new Date().getFullYear();
  const payoffYear = currentYear + loanTerm;

  const chartData = [
    { name: "Principal & Interest", value: monthlyPI, color: "hsl(var(--primary))" },
    { name: "Property Tax", value: monthlyTax, color: "#10b981" },
    { name: "Home Insurance", value: monthlyInsurance, color: "#f59e0b" },
    { name: "HOA Fees", value: monthlyHoa, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Paid", value: `$${totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Taxes & Fees", value: `$${(totalTaxes + totalIns + totalHoa).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Loan Cost", value: `$${totalCostOfLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: `Year ${payoffYear}` },
    { label: "Down Payment", value: `$${actualDownPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Principal & Interest", monthly: `$${monthlyPI.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, total: `$${(totalPrincipalPaid + totalInterestPaid).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-primary" },
    { label: "Property Tax", monthly: `$${monthlyTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, total: `$${totalTaxes.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-emerald-500" },
    { label: "Home Insurance", monthly: `$${monthlyInsurance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, total: `$${totalIns.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-amber-500" },
    { label: "HOA Fees", monthly: `$${monthlyHoa.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, total: `$${totalHoa.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-violet-500" },
    { label: "Total Payment", monthly: `$${totalMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, total: `$${totalCostOfLoan.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true }
  ];

  return {
    loanAmount,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    totalMonthlyPayment,
    totalInterestPaid,
    totalPrincipalPaid,
    totalCostOfLoan,
    payoffYear,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};
