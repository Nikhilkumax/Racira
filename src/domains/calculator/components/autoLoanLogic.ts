/**
 * autoLoanLogic.ts — pure calculation core for AutoLoanCalculator.
 * Moved verbatim from AutoLoanCalculator.tsx so the math can be unit-tested.
 */
import type { AmortRow } from "./ui/AmortizationTable";

export interface AutoLoanInputs {
  vehiclePrice: number;
  downPaymentAmt: number;
  tradeInValue: number;
  amountOwedOnTradeIn: number;
  salesTaxRate: number;
  titleAndRegistrationFees: number;
  otherDealerFees: number;
  cashIncentives: number;
  interestRate: number;
  loanTermMonths: number;
  includeTaxAndFeesInLoan: boolean;
}

export interface AutoLoanResults {
  totalLoanAmount: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalSalesTax: number;
  totalFees: number;
  totalCostOfVehicle: number;
  payoffDate: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

export const calculateAutoLoan = (inputs: AutoLoanInputs): AutoLoanResults => {
  const {
    vehiclePrice,
    downPaymentAmt,
    tradeInValue,
    amountOwedOnTradeIn,
    salesTaxRate,
    titleAndRegistrationFees,
    otherDealerFees,
    cashIncentives,
    interestRate,
    loanTermMonths,
    includeTaxAndFeesInLoan
  } = inputs;

  // Net trade-in equity (can be negative if underwater)
  const netTradeInEquity = tradeInValue - amountOwedOnTradeIn;

  // Taxable amount is typically vehicle price minus trade-in value (some states vary, but this is standard)
  const taxableAmount = Math.max(0, vehiclePrice - tradeInValue);
  const totalSalesTax = taxableAmount * (salesTaxRate / 100);

  const totalFees = titleAndRegistrationFees + otherDealerFees;

  // Initial out-of-pocket reductions
  let amountToFinance = vehiclePrice - downPaymentAmt - netTradeInEquity - cashIncentives;

  if (includeTaxAndFeesInLoan) {
    amountToFinance += totalSalesTax + totalFees;
  }

  // Ensure loan amount isn't negative
  const totalLoanAmount = Math.max(0, amountToFinance);

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermMonths;

  let monthlyPayment = 0;
  if (totalLoanAmount > 0) {
    if (monthlyRate > 0) {
      monthlyPayment = (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = totalLoanAmount / numberOfPayments;
    }
  }

  // Amortization Schedule
  let balance = totalLoanAmount;
  const monthlyRows: AmortRow[] = [];
  let totalPaid = 0;

  for (let m = 1; m <= numberOfPayments && balance > 0.01; m++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance; // Final payment adjustment
    balance -= principal;
    totalPaid += interest + principal;
    monthlyRows.push({
      period: m,
      payment: interest + principal,
      principal,
      interest,
      balance: Math.max(0, balance)
    });
  }

  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
    const slice = monthlyRows.slice(y * 12, (y + 1) * 12);
    if (!slice.length) break;
    yearlyRows.push({
      period: y + 1,
      payment: slice.reduce((s, r) => s + r.payment, 0),
      principal: slice.reduce((s, r) => s + r.principal, 0),
      interest: slice.reduce((s, r) => s + r.interest, 0),
      balance: slice[slice.length - 1].balance,
    });
  }

  const totalPrincipalPaid = totalLoanAmount;
  const totalInterestPaid = Math.max(0, totalPaid - totalLoanAmount);

  // Total cost includes everything paid out of pocket (down payment, loan payments, tax/fees if paid in cash)
  let totalCostOfVehicle = downPaymentAmt + totalPaid;
  if (!includeTaxAndFeesInLoan) {
    totalCostOfVehicle += totalSalesTax + totalFees;
  }

  // Dates
  const currentDate = new Date();
  const payoffYear = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + loanTermMonths) / 12);
  const payoffMonthIndex = (currentDate.getMonth() + loanTermMonths) % 12;
  const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payoffDate = `${monthsStr[payoffMonthIndex]} ${payoffYear}`;

  const chartData = [
    { name: "Principal", value: vehiclePrice, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterestPaid, color: "#f59e0b" },
    { name: "Taxes & Fees", value: totalSalesTax + totalFees, color: "#10b981" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Total Loan Amount", value: `$${totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Paid", value: `$${totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Taxes & Fees", value: `$${(totalSalesTax + totalFees).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Out of Pocket at Purchase", value: `$${(downPaymentAmt + (includeTaxAndFeesInLoan ? 0 : totalSalesTax + totalFees)).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
    { label: "Total Cost", value: `$${totalCostOfVehicle.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Vehicle Price", amount: `$${vehiclePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Interest", amount: `$${totalInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Sales Tax", amount: `$${totalSalesTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Dealer & Title Fees", amount: `$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Net Trade-In Equity", amount: `-$${netTradeInEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Cash Incentives", amount: `-$${cashIncentives.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Total Cost of Vehicle", amount: `$${totalCostOfVehicle.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    totalLoanAmount,
    monthlyPayment,
    totalInterestPaid,
    totalPrincipalPaid,
    totalSalesTax,
    totalFees,
    totalCostOfVehicle,
    payoffDate,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};
