/**
 * balloonMortgageLogic.ts — pure calculation core for BalloonMortgageCalculator.
 * Moved verbatim from BalloonMortgageCalculator.tsx so the math can be unit-tested.
 */

export interface BalloonMortgageInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  balloonTerm: number;
  propertyTax: number;
  homeInsurance: number;
  pmiRate: number;
  downPaymentPercent: number;
  refinanceRate: number;
  refinanceTerm: number;
}

export interface BalloonMortgageResults {
  monthlyPI: number;
  monthlyTaxIns: number;
  monthlyPMI: number;
  monthlyTotal: number;
  balloonBalance: number;
  totalInterest: number;
  paymentsBeforeBalloon: number;
  principalPaid: number;
  balloonPaymentDate: string;
  amortizationEndDate: string;
  refinancePayment: number;
  refinanceTotalCost: number;
  refinanceInterestCost: number;
}

const num = (v: number): number => (isNaN(v) || !isFinite(v) || v < 0 ? 0 : v);

export const calculateBalloonMortgage = (inputs: BalloonMortgageInputs): BalloonMortgageResults => {
  const {
    loanAmount: P,
    interestRate,
    loanTerm,
    balloonTerm,
    propertyTax,
    homeInsurance,
    pmiRate,
    downPaymentPercent,
    refinanceRate,
    refinanceTerm,
  } = inputs;

  const safeP = num(P);
  const safeRate = num(interestRate);
  const safeTerm = num(loanTerm);
  const safeBalloon = num(balloonTerm);

  if (safeP <= 0 || safeRate <= 0 || safeTerm <= 0 || safeBalloon <= 0) {
    return {
      monthlyPI: 0,
      monthlyTaxIns: 0,
      monthlyPMI: 0,
      monthlyTotal: 0,
      balloonBalance: 0,
      totalInterest: 0,
      paymentsBeforeBalloon: 0,
      principalPaid: 0,
      balloonPaymentDate: "",
      amortizationEndDate: "",
      refinancePayment: 0,
      refinanceTotalCost: 0,
      refinanceInterestCost: 0,
    };
  }

  const r = (safeRate / 100) / 12;
  const n = Math.round(safeTerm * 12);
  const p = Math.round(safeBalloon * 12);
  const paymentsBeforeBalloon = Math.min(p, n);

  // Standard fully-amortizing monthly payment
  const M = r === 0
    ? safeP / n
    : safeP * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // Remaining balance after p payments (amortization formula)
  const balloonBalance = r === 0
    ? Math.max(0, safeP - M * paymentsBeforeBalloon)
    : safeP * ((Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1));

  const principalPaid = Math.max(0, safeP - balloonBalance);

  // Additional monthly costs
  const monthlyTaxIns = (num(propertyTax) + num(homeInsurance)) / 12;
  const dp = num(downPaymentPercent) / 100;
  const needsPMI = dp > 0 && dp < 0.2;
  const pmiAnnual = needsPMI ? safeP * (num(pmiRate) / 100) : 0;
  const monthlyPMI = pmiAnnual / 12;
  const monthlyTotal = M + monthlyTaxIns + monthlyPMI;

  // Total interest paid across the balloon period
  const totalPaidBeforeBalloon = M * paymentsBeforeBalloon;
  const totalInterest = Math.max(0, totalPaidBeforeBalloon - principalPaid);

  // Dates
  const today = new Date();
  const balloonPaymentDate = new Date(today.getFullYear(), today.getMonth() + paymentsBeforeBalloon, today.getDate())
    .toLocaleDateString(undefined, { year: "numeric", month: "long" });
  const amortizationEndDate = new Date(today.getFullYear(), today.getMonth() + n, today.getDate())
    .toLocaleDateString(undefined, { year: "numeric", month: "long" });

  // Refinance comparison
  const refRate = num(refinanceRate);
  const refTerm = num(refinanceTerm);
  let refinancePayment = 0;
  let refinanceInterestCost = 0;
  if (balloonBalance > 0 && refRate > 0 && refTerm > 0) {
    const rr = (refRate / 100) / 12;
    const rn = Math.round(refTerm * 12);
    refinancePayment = balloonBalance * (rr * Math.pow(1 + rr, rn)) / (Math.pow(1 + rr, rn) - 1);
    refinanceInterestCost = Math.max(0, refinancePayment * rn - balloonBalance);
  }
  const refinanceTotalCost = refinancePayment * (refTerm > 0 ? Math.round(refTerm * 12) : 0);

  return {
    monthlyPI: M,
    monthlyTaxIns,
    monthlyPMI,
    monthlyTotal,
    balloonBalance,
    totalInterest,
    paymentsBeforeBalloon,
    principalPaid,
    balloonPaymentDate,
    amortizationEndDate,
    refinancePayment,
    refinanceTotalCost,
    refinanceInterestCost,
  };
};
