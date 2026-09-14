/**
 * personalLoanLogic.ts — pure calculation core for PersonalLoanCalculator.
 * Moved verbatim from PersonalLoanCalculator.tsx so the math can be unit-tested.
 */

export interface PersonalLoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  apr: number;
  chartData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

export function calcPersonalLoan(loanAmount: number, annualRate: number, termMonths: number, originationPct: number): PersonalLoanResult {
  const origFee = loanAmount * (originationPct / 100);
  const r = annualRate / 100 / 12;
  const payment = r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths)) : loanAmount / termMonths;
  const totalPaid = payment * termMonths + origFee;
  const totalInterest = payment * termMonths - loanAmount;

  // Effective APR calculation
  const netProceeds = loanAmount - origFee;
  let lo = 0, hi = 2, apr = annualRate;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const rM = mid / 12;
    const p = rM > 0 ? (netProceeds * rM) / (1 - Math.pow(1 + rM, -termMonths)) : netProceeds / termMonths;
    if (p < payment) lo = mid; else hi = mid;
    apr = mid * 100;
  }

  let balance = loanAmount;
  const chartData = [{ month: 0, balance: Math.round(balance) }];
  for (let m = 1; m <= termMonths; m++) {
    const int = balance * r;
    balance -= (payment - int);
    if (m % Math.ceil(termMonths / 20) === 0 || m === termMonths)
      chartData.push({ month: m, balance: Math.max(0, Math.round(balance)) });
  }

  const breakdown = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString()}` },
    { label: "Annual Interest Rate", value: `${annualRate}%` },
    { label: "Loan Term", value: `${termMonths} months` },
    { label: "Origination Fee", value: `${originationPct}% ($${origFee.toLocaleString("en-US", { maximumFractionDigits: 0 })})` },
    { label: "Monthly Payment", value: `$${payment.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective APR (with fees)", value: `${apr.toFixed(2)}%` },
    { label: "Total Cost of Loan", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${payment.toFixed(2)}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective APR", value: `${apr.toFixed(2)}%` },
    { label: "Interest % of Principal", value: `${((totalInterest / loanAmount) * 100).toFixed(1)}%` },
    { label: "Origination Fee", value: `$${origFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment: payment, totalPaid, totalInterest, apr, chartData, breakdown, summaryStats };
}
