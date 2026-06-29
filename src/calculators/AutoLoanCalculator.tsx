"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Calculator, Car } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface AutoLoanInputs {
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

interface AutoLoanResults {
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

// 2. Pure Calculation Function
const calculateAutoLoan = (inputs: AutoLoanInputs): AutoLoanResults => {
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

// 3. DEFAULTS Object
const DEFAULTS = {
  vehiclePrice: "35000",
  downPaymentAmt: "5000",
  tradeInValue: "4000",
  amountOwedOnTradeIn: "0",
  salesTaxRate: "7.0",
  titleAndRegistrationFees: "250",
  otherDealerFees: "500",
  cashIncentives: "0",
  interestRate: "6.5",
  loanTermMonths: "60",
  includeTaxAndFeesInLoan: true
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function AutoLoanCalculator() {
  // 4. Component State
  const [vehiclePrice, setVehiclePrice] = useState(DEFAULTS.vehiclePrice);
  const [downPaymentAmt, setDownPaymentAmt] = useState(DEFAULTS.downPaymentAmt);
  const [tradeInValue, setTradeInValue] = useState(DEFAULTS.tradeInValue);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermMonths, setLoanTermMonths] = useState(DEFAULTS.loanTermMonths);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [amountOwedOnTradeIn, setAmountOwedOnTradeIn] = useState(DEFAULTS.amountOwedOnTradeIn);
  const [salesTaxRate, setSalesTaxRate] = useState(DEFAULTS.salesTaxRate);
  const [titleAndRegistrationFees, setTitleAndRegistrationFees] = useState(DEFAULTS.titleAndRegistrationFees);
  const [otherDealerFees, setOtherDealerFees] = useState(DEFAULTS.otherDealerFees);
  const [cashIncentives, setCashIncentives] = useState(DEFAULTS.cashIncentives);
  const [includeTaxAndFeesInLoan, setIncludeTaxAndFeesInLoan] = useState(DEFAULTS.includeTaxAndFeesInLoan);

  const [results, setResults] = useState<AutoLoanResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: AutoLoanInputs = {
      vehiclePrice: parseFloat(vehiclePrice) || 0,
      downPaymentAmt: parseFloat(downPaymentAmt) || 0,
      tradeInValue: parseFloat(tradeInValue) || 0,
      amountOwedOnTradeIn: parseFloat(amountOwedOnTradeIn) || 0,
      salesTaxRate: parseFloat(salesTaxRate) || 0,
      titleAndRegistrationFees: parseFloat(titleAndRegistrationFees) || 0,
      otherDealerFees: parseFloat(otherDealerFees) || 0,
      cashIncentives: parseFloat(cashIncentives) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTermMonths: parseFloat(loanTermMonths) || 0,
      includeTaxAndFeesInLoan
    };
    setResults(calculateAutoLoan(inputs));
  };

  const handleReset = () => {
    setVehiclePrice(DEFAULTS.vehiclePrice);
    setDownPaymentAmt(DEFAULTS.downPaymentAmt);
    setTradeInValue(DEFAULTS.tradeInValue);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermMonths(DEFAULTS.loanTermMonths);
    setAmountOwedOnTradeIn(DEFAULTS.amountOwedOnTradeIn);
    setSalesTaxRate(DEFAULTS.salesTaxRate);
    setTitleAndRegistrationFees(DEFAULTS.titleAndRegistrationFees);
    setOtherDealerFees(DEFAULTS.otherDealerFees);
    setCashIncentives(DEFAULTS.cashIncentives);
    setIncludeTaxAndFeesInLoan(DEFAULTS.includeTaxAndFeesInLoan);
    setShowAdvanced(false);
    
    setResults(calculateAutoLoan({
      vehiclePrice: parseFloat(DEFAULTS.vehiclePrice),
      downPaymentAmt: parseFloat(DEFAULTS.downPaymentAmt),
      tradeInValue: parseFloat(DEFAULTS.tradeInValue),
      amountOwedOnTradeIn: parseFloat(DEFAULTS.amountOwedOnTradeIn),
      salesTaxRate: parseFloat(DEFAULTS.salesTaxRate),
      titleAndRegistrationFees: parseFloat(DEFAULTS.titleAndRegistrationFees),
      otherDealerFees: parseFloat(DEFAULTS.otherDealerFees),
      cashIncentives: parseFloat(DEFAULTS.cashIncentives),
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTermMonths: parseFloat(DEFAULTS.loanTermMonths),
      includeTaxAndFeesInLoan: DEFAULTS.includeTaxAndFeesInLoan
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Auto Loan Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How is my auto loan payment calculated?", answer: "Auto loan payments use standard amortizing loan formulas. Your monthly payment is determined by the total loan amount (vehicle price minus down payment and trade-in, plus taxes and fees if included), the annual interest rate, and the loan term in months. Shorter terms yield higher monthly payments but lower total interest costs." },
    { question: "Should I roll taxes and fees into my loan?", answer: "Rolling taxes and dealer fees into your auto loan allows you to keep more cash in your pocket at signing. However, this means you will pay interest on those taxes and fees for the next 4 to 7 years. Paying them upfront in cash is the financially optimal choice if you can afford it." },
    { question: "How does a trade-in affect my loan and taxes?", answer: "A trade-in vehicle acts as a substantial down payment, reducing your required loan amount. In many states, trade-ins also offer a massive tax advantage: you only pay sales tax on the difference between the new car's price and your trade-in value, saving you hundreds or thousands of dollars." },
    { question: "What is negative equity ('underwater' or 'upside-down')?", answer: "Negative equity happens when you owe more on your trade-in vehicle than the dealer is willing to pay for it. If you owe $15,000 on your current car but it is only worth $10,000, you have $5,000 of negative equity. Dealers will often roll this $5,000 into your new auto loan, meaning you are paying interest on an old car you no longer own." },
    { question: "What is a good auto loan interest rate?", answer: "Auto loan interest rates are highly dependent on the Federal Reserve's prime rate and your personal credit score. Generally, borrowers with excellent credit (750+) qualify for the lowest promotional rates (often between 2% and 5% depending on the year), while borrowers with poor credit may see rates above 15%." },
    { question: "Are longer loan terms (72 or 84 months) a bad idea?", answer: "While longer terms lower your monthly payment, they drastically increase the total interest you pay. Furthermore, because cars depreciate rapidly, an 84-month loan significantly increases your risk of being 'underwater' (owing more than the car is worth) for several years. We recommend keeping loan terms at 60 months or less whenever possible." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Auto Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Vehicle Price" value={vehiclePrice} onChange={setVehiclePrice} prefix="$" />
              <CompactInput id="down" label="Down Payment" value={downPaymentAmt} onChange={setDownPaymentAmt} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="term" label="Loan Term" value={loanTermMonths} onChange={setLoanTermMonths} suffix="months" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="trade" label="Trade-In Value" value={tradeInValue} onChange={setTradeInValue} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="trade-owed" label="Owed on Trade-In" value={amountOwedOnTradeIn} onChange={setAmountOwedOnTradeIn} prefix="$" />
                  <CompactInput id="tax" label="Sales Tax Rate" value={salesTaxRate} onChange={setSalesTaxRate} suffix="%" />
                  <CompactInput id="fees1" label="Title & Reg Fees" value={titleAndRegistrationFees} onChange={setTitleAndRegistrationFees} prefix="$" />
                  <CompactInput id="fees2" label="Other Dealer Fees" value={otherDealerFees} onChange={setOtherDealerFees} prefix="$" />
                  <CompactInput id="cash-inc" label="Cash Incentives" value={cashIncentives} onChange={setCashIncentives} prefix="$" />
                  <div className="flex items-center gap-2 col-span-2 mt-2">
                    <input
                      type="checkbox"
                      id="tax-in-loan"
                      checked={includeTaxAndFeesInLoan}
                      onChange={(e) => setIncludeTaxAndFeesInLoan(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="tax-in-loan" className="text-sm font-medium text-foreground cursor-pointer">Include taxes and fees in the loan</label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid: Results */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">For {loanTermMonths} months at {interestRate}% APR</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Loan Amount</div>
                    <div className="text-lg font-bold">${results.totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Payoff Date</div>
                    <div className="text-lg font-bold text-emerald-600">{results.payoffDate}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Total Cost Breakdown</h3>
                    <table className="w-full text-base">
                      <tbody>
                        {results.breakdown.map((row, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${row.isTotal ? "font-bold border-t-2 border-border" : ""}`}>
                            <td className="py-2.5">
                              <span className="flex items-center gap-2">
                                {!row.isTotal && <span className={`w-2.5 h-2.5 rounded-full bg-current ${row.colorClass}`} />}
                                {row.label}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">{row.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Cost Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={85}
                          paddingAngle={2} dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                      {results.chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Loan Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {results.summaryStats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 sm:[&:nth-last-child(1)]:border-0 sm:[&:nth-last-child(2)]:border-0">
                        <span className="text-muted-foreground">{stat.label}:</span>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-5 border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Amortization Schedule</h3>
                    <div className="flex rounded-md border border-input overflow-hidden h-8">
                      <button onClick={() => setViewMode("monthly")} className={`px-3 text-xs font-semibold transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Monthly</button>
                      <button onClick={() => setViewMode("yearly")} className={`px-3 text-xs font-semibold transition-colors border-l border-input ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly</button>
                    </div>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Auto Loan Calculator</h2>
            <p>Buying a car is typically the second largest purchase an average consumer will make, following only the purchase of a home. Yet, while home buyers spend months analyzing mortgages, car buyers often make rushed decisions in the finance office of a dealership. An <strong>Auto Loan Calculator</strong> is your primary defense against overpaying. It is an essential financial tool that demystifies dealership mathematics, allowing you to accurately estimate your monthly payments and uncover the true, long-term cost of vehicle ownership before you sign a contract.</p>
            <p>Dealerships frequently negotiate based on the "monthly payment" rather than the total purchase price of the vehicle. This tactic obscures the actual cost. By stretching a loan over 72 or 84 months, a salesperson can hit your target monthly payment while quietly increasing the total vehicle price and inflating the interest charges by thousands of dollars. Our comprehensive Auto Loan Calculator prevents this by giving you the power to see the entire amortization schedule, factoring in trade-in values, local taxes, dealer fees, and manufacturer incentives.</p>

            <h2>How Auto Loan Amortization Works</h2>
            <p>An auto loan is a structured, amortizing debt. This means that your monthly payment remains fixed for the duration of the loan term, but the underlying composition of that payment shifts every single month. In the early stages of your loan, a substantial portion of your monthly payment goes toward the lender's interest charges. As you slowly chip away at the principal balance, the interest charges decrease, allowing more of your payment to pay down the actual vehicle debt.</p>
            <p>The mathematical formula used to calculate your fixed monthly payment is:</p>
            <p><strong>M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1 ]</strong></p>
            <p>Where <em>M</em> is your monthly payment, <em>P</em> is the total principal loan amount, <em>r</em> is your monthly interest rate (your Annual Percentage Rate divided by 12), and <em>n</em> is the total number of months in your loan term.</p>

            <h2>Analyzing Your Calculator Results</h2>
            <p>Once you input your specific vehicle parameters, our calculator processes the data to generate a multi-faceted financial profile of your prospective purchase.</p>
            <p><strong>Estimated Monthly Payment:</strong> This is the headline number. It is the exact amount of cash you must pull from your bank account every month to avoid defaulting on the loan. It is critical that this number comfortably fits within your monthly household budget.</p>
            <p><strong>Total Cost Breakdown:</strong> This table is arguably more important than the monthly payment. It breaks down the total cost of the vehicle, separating the sticker price from the "invisible" costs of financing. It shows exactly how much money you are losing to interest payments over the life of the loan. This is the amount you pay for the privilege of borrowing the bank's money.</p>
            <p><strong>Cost Distribution Chart:</strong> A visual representation (pie chart) illustrating where your money is going. If the slice representing "Total Interest" looks aggressively large compared to the "Principal" slice, you may need to reconsider your loan term or secure a better interest rate.</p>

            <h2>Critical Loan Variables</h2>
            <p>Understanding how different variables manipulate your loan is the key to mastering automotive finance.</p>
            <p><strong>Vehicle Price vs. Total Loan Amount:</strong> The sticker price of the car is rarely your loan amount. Your loan amount is the vehicle price, minus any down payments and trade-in equity, plus applicable state sales taxes and dealer documentation fees. A $30,000 car can quickly turn into a $34,000 loan if you finance the taxes and fees with zero money down.</p>
            <p><strong>The Interest Rate (APR):</strong> Your Annual Percentage Rate dictates the cost of borrowing. Auto loan rates are tied to the broader economic environment (the Federal Reserve) and your personal FICO credit score. An excellent credit score (750+) might secure a 4% APR, while a subprime score (below 600) might face punishing rates of 15% to 20%.</p>
            <p><strong>The Loan Term:</strong> The loan term is the length of the loan, measured in months. Standard terms are 36, 48, and 60 months. Recently, 72-month and 84-month terms have become prevalent. While extending the term from 60 to 84 months lowers your monthly payment, it drastically increases your total interest costs and exposes you to the massive risk of "negative equity."</p>

            <h2>Advanced Features: Trade-Ins and Taxes</h2>
            <p>Our calculator includes an Advanced Options suite that models real-world dealership scenarios.</p>
            <p><strong>Negative Equity on Trade-Ins:</strong> If you owe $15,000 on your current car, but the dealer only offers you $10,000 for it as a trade-in, you have $5,000 in "negative equity" (also known as being underwater or upside-down). If you proceed with the trade-in, that $5,000 is added to your new car loan. You are effectively paying interest on a car you no longer drive.</p>
            <p><strong>Sales Tax Strategies:</strong> Most states charge sales tax on vehicle purchases. The advanced calculator allows you to toggle whether you want to "Include taxes and fees in the loan." Rolling taxes into the loan requires less cash upfront, but it means you are paying 5% to 10% interest on a tax bill for the next five years. Paying taxes in cash at signing is the superior financial move.</p>

            <h2>Practical Examples of Auto Financing</h2>
            <p><strong>Example 1: The Danger of Long Terms.</strong> You want to buy a $40,000 SUV with no money down at an 8% APR. The dealer offers a 60-month term at $811 per month. You say that is too high. The dealer stretches the loan to 84 months, dropping the payment to a much more attractive $623. However, checking the calculator reveals the hidden cost: on the 60-month loan, you pay $8,600 in total interest. On the 84-month loan, you pay $12,300 in total interest. That lower monthly payment costs you nearly $4,000 extra.</p>
            <p><strong>Example 2: The Power of a Trade-In Tax Break.</strong> You live in a state with a 7% auto sales tax. You buy a $35,000 car and trade in an old vehicle worth $10,000. In many states, the sales tax is only applied to the difference ($25,000). Your tax bill drops from $2,450 to $1,750, instantly saving you $700 just by utilizing the trade-in.</p>

            <h2>Tips and Best Practices</h2>
            <p><strong>Secure Independent Financing:</strong> Never rely solely on the dealership for financing. Always secure a pre-approval letter from your local bank or credit union before walking onto the lot. Dealerships often mark up interest rates (a practice called "dealer reserve") to make a profit on the loan itself. A pre-approval forces the dealer to beat your bank's rate, or you walk.</p>
            <p><strong>Follow the 20/4/10 Rule:</strong> Financial experts universally recommend the 20/4/10 rule for car buying. Put down at least 20% (to absorb instant depreciation), finance the car for no more than 4 years (48 months), and ensure your total automotive expenses (payment, insurance, gas) do not exceed 10% of your gross monthly income.</p>
            <p><strong>Beware of the "Monthly Payment" Trap:</strong> When a salesperson asks, "What monthly payment are you looking for?", they are setting a trap. Once you give them a number, they will manipulate the loan term, interest rate, and down payment to hit that number, regardless of how bad the overall financial structure is for you. Always negotiate based on the "Out-the-Door" total price of the vehicle.</p>

            <h2>Conclusion and Financial Benefits</h2>
            <p>An automobile is a depreciating asset. Unlike a house, a car loses value every single day you own it. Therefore, minimizing the amount of interest you pay to finance that depreciating asset is paramount to your long-term wealth building.</p>
            <p>By rigorously utilizing this Auto Loan Calculator, you take control of the transaction. You transition from a passive buyer reacting to dealership numbers, into an informed consumer who dictates the terms of the deal. Running multiple scenarios—adjusting the down payment by $1,000 here, shortening the loan term by 12 months there—empowers you to find the exact financing structure that minimizes your costs and maximizes your financial security.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/auto-loan-calculator" />
          <PopularCalculators exclude="/calculator/auto-loan-calculator" />
        </div>
      </div>
    </>
  );
}
