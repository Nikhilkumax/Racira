/**
 * aprApyLogic.ts — pure calculation cores for AprCalculator and ApyCalculator.
 * Moved verbatim from the .tsx components so the math can be unit-tested.
 */

// --- APR ---------------------------------------------------------------------

export interface AprInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  originationFee: number;
  otherFees: number;
}

export interface AprResults {
  monthlyPayment: number;
  apr: number;
  totalInterest: number;
  totalPaid: number;
  fees: number;
  netAmount: number;
  chartData: Array<{ name: string; value: number }>;
}

export const calculateApr = (inputs: AprInputs): AprResults => {
  const p = inputs.loanAmount;
  const nomRate = inputs.interestRate / 100 / 12;
  const n = inputs.loanTerm;
  const fees = inputs.originationFee + inputs.otherFees;

  if (p <= 0 || inputs.interestRate < 0 || n <= 0) {
    return {
      monthlyPayment: 0,
      apr: 0,
      totalInterest: 0,
      totalPaid: 0,
      fees,
      netAmount: 0,
      chartData: []
    };
  }

  // Stated monthly payment
  const monthlyPayment = nomRate > 0
    ? (p * nomRate * Math.pow(1 + nomRate, n)) / (Math.pow(1 + nomRate, n) - 1)
    : p / n;

  // Net amount received (principal minus fees)
  const netAmount = p - fees;

  // Find APR using Newton-Raphson
  let aprMonthly = nomRate || 0.001;
  for (let i = 0; i < 100; i++) {
    const pv = monthlyPayment * (1 - Math.pow(1 + aprMonthly, -n)) / aprMonthly;
    const f = pv - netAmount;
    const df = monthlyPayment * (n * Math.pow(1 + aprMonthly, -(n + 1)) / aprMonthly - (1 - Math.pow(1 + aprMonthly, -n)) / (aprMonthly * aprMonthly));
    aprMonthly = aprMonthly - f / df;
    if (Math.abs(f) < 0.0001) break;
  }

  const apr = aprMonthly * 12 * 100;
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - p;

  const chartData = [
    { name: "Principal", value: p - fees },
    { name: "Total Interest", value: totalInterest },
    { name: "Total Fees", value: fees }
  ];

  return {
    monthlyPayment,
    apr,
    totalInterest,
    totalPaid,
    fees,
    netAmount,
    chartData
  };
};

// --- APY ---------------------------------------------------------------------

export interface ApyInputs {
  nominalRate: number;
  compounding: number;
  initialDeposit: number;
}

export interface ApyResults {
  apy: number;
  dailyRate: number;
  monthlyRate: number;
  effectiveDailyRate: number;
  chartData: Array<{ year: string; nominal: number; withCompounding: number }>;
  schedule: Array<{ year: number; balance: number; interestEarned: number }>;
  totalInterest: number;
  finalBalance: number;
}

export const calculateApy = (inputs: ApyInputs): ApyResults => {
  const r = inputs.nominalRate / 100;
  const n = inputs.compounding;
  const p = inputs.initialDeposit;

  if (r < 0 || n <= 0 || p < 0) {
    return {
      apy: 0,
      dailyRate: 0,
      monthlyRate: 0,
      effectiveDailyRate: 0,
      chartData: [],
      schedule: [],
      totalInterest: 0,
      finalBalance: p
    };
  }

  const apy = (Math.pow(1 + r / n, n) - 1) * 100;
  const dailyRate = (r / 365) * 100;
  const monthlyRate = (r / 12) * 100;
  const effectiveDailyRate = (Math.pow(1 + r / n, n / 365) - 1) * 100;

  // Chart data: 5 years comparison (Nominal simple vs Compounded)
  const chartData = [];
  const schedule = [];
  let currentBalance = p;

  for (let year = 1; year <= 5; year++) {
    const nominalBalance = p + (p * r * year);
    currentBalance = p * Math.pow(1 + r / n, n * year);

    chartData.push({
      year: `Year ${year}`,
      nominal: Math.round(nominalBalance),
      withCompounding: Math.round(currentBalance)
    });

    schedule.push({
      year,
      balance: currentBalance,
      interestEarned: currentBalance - p
    });
  }

  const finalBalance = currentBalance;
  const totalInterest = currentBalance - p;

  return {
    apy,
    dailyRate,
    monthlyRate,
    effectiveDailyRate,
    chartData,
    schedule,
    totalInterest,
    finalBalance
  };
};
