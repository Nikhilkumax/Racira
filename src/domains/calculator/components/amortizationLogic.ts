/**
 * amortizationLogic.ts — pure calculation core for AmortizationCalculator.
 * Moved verbatim from AmortizationCalculator.tsx so the math can be unit-tested.
 */
import type { AmortRow } from "./ui/AmortizationTable";

export interface AmortizationInputs {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  extraMonthlyPayment: number;
}

export interface AmortizationResults {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  monthsToPayoff: number;
  interestSaved: number;
  monthsSaved: number;

  chartData: { month: number; principal: number; interest: number; balance: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];

  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

export const calculateAmortization = (inputs: AmortizationInputs): AmortizationResults => {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    extraMonthlyPayment
  } = inputs;

  const monthlyRate = interestRate / 100 / 12;
  const standardMonths = loanTermYears * 12;

  // Calculate standard required payment
  let standardMonthlyPayment = 0;
  if (loanAmount > 0) {
    if (monthlyRate > 0) {
      standardMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, standardMonths)) / (Math.pow(1 + monthlyRate, standardMonths) - 1);
    } else {
      standardMonthlyPayment = loanAmount / standardMonths;
    }
  }

  const standardTotalInterest = (standardMonthlyPayment * standardMonths) - loanAmount;

  // Simulate schedule with extra payments
  let balance = loanAmount;
  let totalInterestPaid = 0;
  let monthsToPayoff = 0;

  const monthlyRows: AmortRow[] = [];
  const yearlyRows: AmortRow[] = [];
  const chartData = [];

  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let m = 1; m <= standardMonths && balance > 0.01; m++) {
    const interest = balance * monthlyRate;
    let principal = standardMonthlyPayment + extraMonthlyPayment - interest;

    if (principal > balance) {
      principal = balance;
    }

    balance -= principal;
    totalInterestPaid += interest;
    monthsToPayoff = m;

    monthlyRows.push({
      period: m,
      payment: interest + principal,
      principal,
      interest,
      balance: Math.max(0, balance)
    });

    currentYearInterest += interest;
    currentYearPrincipal += principal;
    currentYearPayment += (interest + principal);

    // Capture chart data (every 12 months or at payoff) to keep chart performant
    if (m % Math.max(1, Math.floor(standardMonths / 60)) === 0 || balance <= 0.01) {
      chartData.push({
        month: m,
        principal: principal,
        interest: interest,
        balance: Math.max(0, balance)
      });
    }

    if (m % 12 === 0 || balance <= 0.01) {
       yearlyRows.push({
         period: Math.ceil(m / 12),
         payment: currentYearPayment,
         principal: currentYearPrincipal,
         interest: currentYearInterest,
         balance: Math.max(0, balance)
       });
       currentYearInterest = 0;
       currentYearPrincipal = 0;
       currentYearPayment = 0;
    }
  }

  const totalPaid = loanAmount + totalInterestPaid;
  const interestSaved = Math.max(0, standardTotalInterest - totalInterestPaid);
  const monthsSaved = Math.max(0, standardMonths - monthsToPayoff);

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Rate", value: `${interestRate.toFixed(2)}%` },
    { label: "Original Term", value: `${loanTermYears} Years` },
    { label: "Actual Payoff Time", value: `${Math.floor(monthsToPayoff / 12)}y ${monthsToPayoff % 12}m` },
    { label: "Total Interest", value: `$${totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Principal Repayment", amount: `$${loanAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Interest Paid", amount: `$${totalInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Total Cost of Financing", amount: `$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    monthlyPayment: standardMonthlyPayment,
    totalInterest: totalInterestPaid,
    totalPaid,
    monthsToPayoff,
    interestSaved,
    monthsSaved,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};
