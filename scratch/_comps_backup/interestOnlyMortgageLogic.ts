/**
 * interestOnlyMortgageLogic.ts — pure calculation core for InterestOnlyMortgageCalculator.
 * Moved verbatim from InterestOnlyMortgageCalculator.tsx so the math can be unit-tested.
 */

export interface IoMortgageResult {
  principal: number;
  ratePct: number;
  ioYears: number;
  totalYears: number;
  ioPayment: number;
  amortPayment: number;
  interestDuringIo: number;
  principalAfterIo: number;
  totalInterest: number;
  totalPayments: number;
  balanceCurve: { year: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

export function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function fmtPct(v: number): string {
  return `${v.toFixed(2)}%`;
}

export function pmt(principal: number, rMonthly: number, n: number): number {
  const g = Math.pow(1 + rMonthly, n);
  return (principal * rMonthly * g) / (g - 1);
}

export function calcIoMortgage(principal: number, ratePct: number, ioYears: number, totalYears: number): IoMortgageResult {
  const rMonthly = ratePct / 100 / 12;
  const ioMonths = ioYears * 12;
  const amortMonths = Math.max(1, (totalYears - ioYears) * 12);
  const ioPayment = principal * rMonthly;
  const amortPayment = pmt(principal, rMonthly, amortMonths);
  const interestDuringIo = ioPayment * ioMonths;
  const principalAfterIo = principal;
  const totalPayments = interestDuringIo + amortPayment * amortMonths;
  const totalInterest = totalPayments - principal;

  // Balance curve: flat during IO period, then amortizes.
  const curve: { year: number; balance: number }[] = [];
  const years = Math.max(1, Math.ceil(totalYears));
  for (let yr = 0; yr <= years; yr++) {
    const months = yr * 12;
    if (months <= ioMonths) {
      curve.push({ year: yr, balance: Math.round(principal) });
    } else {
      const m = months - ioMonths;
      let bal = principal;
      for (let i = 0; i < m; i++) bal = bal * (1 + rMonthly) - amortPayment;
      curve.push({ year: yr, balance: Math.round(Math.max(0, bal)) });
    }
  }

  const breakdown = [
    { label: "Loan Amount", value: fmt$(principal) },
    { label: "Interest Rate", value: fmtPct(ratePct) },
    { label: "Interest-Only Period", value: `${ioYears} years` },
    { label: "Total Term", value: `${totalYears} years` },
    { label: "Interest-Only Payment", value: fmt$(ioPayment) },
    { label: "Payment After IO Period", value: fmt$(amortPayment) },
    { label: "Interest During IO Period", value: fmt$(interestDuringIo) },
    { label: "Total Interest (Full Loan)", value: fmt$(totalInterest) },
  ];
  const summaryStats = [
    { label: "Interest-Only Payment", value: fmt$(ioPayment) },
    { label: "Payment After IO Period", value: fmt$(amortPayment) },
    { label: "Payment Increase", value: fmt$(amortPayment - ioPayment) },
    { label: "Interest During IO Period", value: fmt$(interestDuringIo) },
    { label: "Principal After IO Period", value: fmt$(principalAfterIo) },
    { label: "Total Interest", value: fmt$(totalInterest) },
    { label: "Total Payments", value: fmt$(totalPayments) },
    { label: "Amortization Length", value: `${totalYears - ioYears} years` },
  ];
  return { principal, ratePct, ioYears, totalYears, ioPayment, amortPayment, interestDuringIo, principalAfterIo, totalInterest, totalPayments, balanceCurve: curve, breakdown, summaryStats };
}
