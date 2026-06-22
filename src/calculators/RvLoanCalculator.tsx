"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Truck } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface RvLoanInputs {
  rvPrice: number;
  downPaymentAmt: number;
  tradeInValue: number;
  amountOwedOnTradeIn: number;
  salesTaxRate: number;
  titleAndRegistrationFees: number;
  dealerFees: number;
  interestRate: number;
  loanTermYears: number;
  includeTaxAndFeesInLoan: boolean;
}

interface RvLoanResults {
  totalLoanAmount: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalSalesTax: number;
  totalFees: number;
  totalCostOfRv: number;
  payoffDate: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateRvLoan = (inputs: RvLoanInputs): RvLoanResults => {
  const {
    rvPrice,
    downPaymentAmt,
    tradeInValue,
    amountOwedOnTradeIn,
    salesTaxRate,
    titleAndRegistrationFees,
    dealerFees,
    interestRate,
    loanTermYears,
    includeTaxAndFeesInLoan
  } = inputs;

  const netTradeInEquity = tradeInValue - amountOwedOnTradeIn;

  // Taxable amount is typically RV price minus trade-in value
  const taxableAmount = Math.max(0, rvPrice - tradeInValue);
  const totalSalesTax = taxableAmount * (salesTaxRate / 100);
  
  const totalFees = titleAndRegistrationFees + dealerFees;

  let amountToFinance = rvPrice - downPaymentAmt - netTradeInEquity;

  if (includeTaxAndFeesInLoan) {
    amountToFinance += totalSalesTax + totalFees;
  }

  const totalLoanAmount = Math.max(0, amountToFinance);

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPayment = 0;
  if (totalLoanAmount > 0) {
    if (monthlyRate > 0) {
      monthlyPayment = (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = totalLoanAmount / numberOfPayments;
    }
  }

  let balance = totalLoanAmount;
  const monthlyRows: AmortRow[] = [];
  let totalPaid = 0;

  for (let m = 1; m <= numberOfPayments && balance > 0.01; m++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
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
  
  let totalCostOfRv = downPaymentAmt + totalPaid;
  if (!includeTaxAndFeesInLoan) {
    totalCostOfRv += totalSalesTax + totalFees;
  }

  const currentDate = new Date();
  const payoffYear = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + numberOfPayments) / 12);
  const payoffMonthIndex = (currentDate.getMonth() + numberOfPayments) % 12;
  const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payoffDate = `${monthsStr[payoffMonthIndex]} ${payoffYear}`;

  const chartData = [
    { name: "Principal", value: totalPrincipalPaid, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterestPaid, color: "#f59e0b" },
    { name: "Taxes & Fees", value: totalSalesTax + totalFees, color: "#10b981" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Total Loan Amount", value: `$${totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Paid", value: `$${totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Taxes & Fees", value: `$${(totalSalesTax + totalFees).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Out of Pocket at Purchase", value: `$${(downPaymentAmt + (includeTaxAndFeesInLoan ? 0 : totalSalesTax + totalFees)).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
    { label: "Total Cost", value: `$${totalCostOfRv.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "RV Price", amount: `$${rvPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Interest", amount: `$${totalInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Sales Tax", amount: `$${totalSalesTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Title & Dealer Fees", amount: `$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Net Trade-In Equity", amount: `-$${netTradeInEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Total Cost of RV", amount: `$${totalCostOfRv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    totalLoanAmount,
    monthlyPayment,
    totalInterestPaid,
    totalPrincipalPaid,
    totalSalesTax,
    totalFees,
    totalCostOfRv,
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
  rvPrice: "85000",
  downPaymentAmt: "17000",
  tradeInValue: "0",
  amountOwedOnTradeIn: "0",
  salesTaxRate: "7.0",
  titleAndRegistrationFees: "450",
  dealerFees: "800",
  interestRate: "7.99",
  loanTermYears: "15",
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

export default function RvLoanCalculator() {
  // 4. Component State
  const [rvPrice, setRvPrice] = useState(DEFAULTS.rvPrice);
  const [downPaymentAmt, setDownPaymentAmt] = useState(DEFAULTS.downPaymentAmt);
  const [tradeInValue, setTradeInValue] = useState(DEFAULTS.tradeInValue);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [amountOwedOnTradeIn, setAmountOwedOnTradeIn] = useState(DEFAULTS.amountOwedOnTradeIn);
  const [salesTaxRate, setSalesTaxRate] = useState(DEFAULTS.salesTaxRate);
  const [titleAndRegistrationFees, setTitleAndRegistrationFees] = useState(DEFAULTS.titleAndRegistrationFees);
  const [dealerFees, setDealerFees] = useState(DEFAULTS.dealerFees);
  const [includeTaxAndFeesInLoan, setIncludeTaxAndFeesInLoan] = useState(DEFAULTS.includeTaxAndFeesInLoan);

  const [results, setResults] = useState<RvLoanResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: RvLoanInputs = {
      rvPrice: parseFloat(rvPrice) || 0,
      downPaymentAmt: parseFloat(downPaymentAmt) || 0,
      tradeInValue: parseFloat(tradeInValue) || 0,
      amountOwedOnTradeIn: parseFloat(amountOwedOnTradeIn) || 0,
      salesTaxRate: parseFloat(salesTaxRate) || 0,
      titleAndRegistrationFees: parseFloat(titleAndRegistrationFees) || 0,
      dealerFees: parseFloat(dealerFees) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseFloat(loanTermYears) || 0,
      includeTaxAndFeesInLoan
    };
    setResults(calculateRvLoan(inputs));
  };

  const handleReset = () => {
    setRvPrice(DEFAULTS.rvPrice);
    setDownPaymentAmt(DEFAULTS.downPaymentAmt);
    setTradeInValue(DEFAULTS.tradeInValue);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setAmountOwedOnTradeIn(DEFAULTS.amountOwedOnTradeIn);
    setSalesTaxRate(DEFAULTS.salesTaxRate);
    setTitleAndRegistrationFees(DEFAULTS.titleAndRegistrationFees);
    setDealerFees(DEFAULTS.dealerFees);
    setIncludeTaxAndFeesInLoan(DEFAULTS.includeTaxAndFeesInLoan);
    setShowAdvanced(false);
    
    setResults(calculateRvLoan({
      rvPrice: parseFloat(DEFAULTS.rvPrice),
      downPaymentAmt: parseFloat(DEFAULTS.downPaymentAmt),
      tradeInValue: parseFloat(DEFAULTS.tradeInValue),
      amountOwedOnTradeIn: parseFloat(DEFAULTS.amountOwedOnTradeIn),
      salesTaxRate: parseFloat(DEFAULTS.salesTaxRate),
      titleAndRegistrationFees: parseFloat(DEFAULTS.titleAndRegistrationFees),
      dealerFees: parseFloat(DEFAULTS.dealerFees),
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTermYears: parseFloat(DEFAULTS.loanTermYears),
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
    w.document.write(`<html><head><title>RV Loan Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How long can you finance an RV?", answer: "Unlike standard cars which max out around 72 or 84 months, RV loans are often structured more like mortgages. For larger, expensive RVs (over $50,000), it is common to see loan terms of 10, 15, or even 20 years. This keeps the monthly payment affordable, though it drastically increases the total interest paid." },
    { question: "Is RV loan interest tax-deductible?", answer: "In many cases, yes. The IRS considers an RV to be a 'second home' if it contains basic sleeping, cooking, and toilet facilities. If your RV meets these criteria and the loan is secured by the RV, the interest you pay may be tax-deductible on your federal returns." },
    { question: "What is a good down payment for an RV?", answer: "Most lenders require a minimum down payment of 10% to 20%. Because RVs depreciate incredibly fast in the first few years (often 20% in the first year alone), putting at least 20% down is highly recommended to prevent becoming 'underwater' on the loan." },
    { question: "Are RV loan interest rates higher than auto loans?", answer: "Yes, RV loans are considered recreational loans. Since an RV is a luxury item and not a necessity for commuting to work, lenders view them as higher risk. Expect RV interest rates to be 1% to 4% higher than standard auto loan rates for borrowers with the same credit profile." },
    { question: "Can I roll sales tax and fees into the RV loan?", answer: "Yes, most lenders allow you to finance the sales tax, title fees, and dealer prep fees into the loan, provided the total loan-to-value (LTV) ratio remains acceptable. However, doing so means you will be paying interest on those taxes and fees for the next 10 to 15 years." },
    { question: "What credit score is needed for an RV loan?", answer: "While you might get approved for a car loan with a 600 credit score, RV lenders are typically stricter. You generally need a minimum score of 650-670 to get approved, and the best rates and longer terms (15+ years) are reserved for borrowers with excellent credit (740+)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "RV Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">RV Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="RV Price" value={rvPrice} onChange={setRvPrice} prefix="$" />
              <CompactInput id="down" label="Down Payment" value={downPaymentAmt} onChange={setDownPaymentAmt} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
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
                  <CompactInput id="fees" label="Title & Reg Fees" value={titleAndRegistrationFees} onChange={setTitleAndRegistrationFees} prefix="$" />
                  <CompactInput id="dealer-fees" label="Dealer Prep Fees" value={dealerFees} onChange={setDealerFees} prefix="$" />
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
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Truck className="h-4 w-4" /> Calculate Loan
              </button>
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
                  <div className="text-sm text-muted-foreground mt-1 font-medium">For {loanTermYears} years at {interestRate}% APR</div>
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
            <h2>Understanding the RV Loan Calculator</h2>
            <p>Purchasing a Recreational Vehicle (RV), whether it is a luxurious Class A motorhome, a versatile fifth wheel, or a compact travel trailer, is a massive financial commitment. For many people, buying an RV is financially equivalent to buying a second home. Because of the sheer size of the loan, understanding exactly what you are getting into before walking onto the dealership lot is crucial. An <strong>RV Loan Calculator</strong> is a specialized financial tool designed to help you model these massive loans, estimate your exact monthly payment, and visualize the total amount of interest you will pay over a 10 to 20-year term.</p>
            <p>RV dealerships are famous for focusing entirely on the "monthly payment." Because RV loans can be stretched out to 15 or 20 years, a dealer can make a $150,000 motorhome look highly affordable on a monthly basis. What they don't explicitly highlight is that spreading that loan over 20 years means you might end up paying $100,000 in pure interest. By using this calculator, you take control of the mathematics, ensuring that the dream of the open road does not become a financial nightmare.</p>

            <h2>How RV Amortization Differs from Cars</h2>
            <p>At its core, an RV loan uses the exact same mathematical formula as an auto loan or a home mortgage. It is a fixed-rate, amortizing installment loan. The fundamental formula is:</p>
            <p><strong>M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1 ]</strong></p>
            <p>Where <em>M</em> is the monthly payment, <em>P</em> is the principal loan amount, <em>r</em> is the monthly interest rate, and <em>n</em> is the total number of payments in months.</p>
            <p>The massive difference lies in the <em>term length (n)</em>. While a car loan typically caps at 60 or 72 months, an RV loan regularly spans 120, 180, or 240 months (10, 15, or 20 years). Because the term is so long, the amortization schedule mimics a house. During the first few years of a 15-year RV loan, the vast majority of your monthly payment goes directly into the lender's pocket as interest. Only a tiny fraction pays down the actual principal balance of the RV.</p>

            <h2>Analyzing Your Calculator Results</h2>
            <p>Our RV Loan Calculator generates a comprehensive financial breakdown of your purchase. Understanding these numbers is vital for responsible borrowing.</p>
            <p><strong>Estimated Monthly Payment:</strong> This is your required monthly cash outflow. It is essential to ensure this number fits comfortably within your budget, keeping in mind that you still have to pay for RV insurance, storage fees, fuel, and campsite rentals.</p>
            <p><strong>Total Interest Paid:</strong> This is the most crucial number on the screen. It is the true cost of financing. Because RV loans are so large and the terms are so long, this number is often shockingly high. Seeing this number in red should encourage you to either increase your down payment or shorten the loan term.</p>
            <p><strong>Cost Distribution Chart:</strong> A visual pie chart that quickly illustrates the ratio of the principal to the interest and taxes. If the interest slice looks nearly as large as the principal slice, it indicates an inefficient loan structure.</p>

            <h2>Critical RV Financing Variables</h2>
            <p>RVs are considered "recreational luxury items" by lenders, which changes the lending landscape significantly compared to buying a standard commuter car.</p>
            <p><strong>Higher Interest Rates:</strong> Because an RV is not a necessity, lenders view RV loans as inherently higher risk. If you lose your job, you will default on the RV loan long before you default on your primary home mortgage. To compensate for this risk, RV loan interest rates are typically 1% to 3% higher than standard auto rates, even for borrowers with pristine credit.</p>
            <p><strong>The Depreciation Problem:</strong> RVs are notorious for terrible depreciation. A brand new motorhome can lose 20% to 30% of its value the second you drive it off the dealership lot. If you finance the RV for 15 years with a very small down payment, you will immediately be "underwater" (owing more than the RV is worth). You could remain underwater for 5 to 7 years, meaning if you wanted to sell the RV, you would have to pay the bank cash out of your own pocket to clear the title.</p>
            <p><strong>Tax Deductibility:</strong> There is a unique silver lining to RV financing. The IRS states that if your RV has basic living accommodations—specifically sleeping facilities, cooking facilities, and a toilet—it can qualify as a "second home." This means the interest you pay on your RV loan might be tax-deductible on your federal tax returns, just like a mortgage. (Always consult a CPA regarding your specific situation).</p>

            <h2>Advanced Features: Dealer Fees and Taxes</h2>
            <p>Our calculator features advanced toggles to simulate a true dealership transaction, which is critical because RV dealer fees can be exorbitant.</p>
            <p><strong>Dealer Prep Fees:</strong> Dealerships often charge "Prep Fees" or "Freight Fees" that can run from $500 to over $2,000 to cover the cost of getting the RV ready for sale. You can input these directly into our calculator to see how they impact your loan.</p>
            <p><strong>Sales Tax Strategies:</strong> An $80,000 RV subjected to a 7% state sales tax generates a massive $5,600 tax bill. The calculator allows you to roll this tax into the loan. However, rolling $5,600 into a 15-year loan at 8% APR means you will end up paying nearly $10,000 for that tax bill over the life of the loan. Paying taxes upfront in cash is highly advised.</p>

            <h2>Practical Examples of RV Financing</h2>
            <p><strong>Example 1: The Trap of the 20-Year Loan.</strong> You want to buy a $100,000 Fifth Wheel with $20,000 down, financing $80,000 at 7.5% APR. The dealer offers a 10-year term at $949 per month, or a 20-year term at just $644 per month. The 20-year term seems much more affordable. However, the calculator reveals the truth. The 10-year loan costs you $33,000 in total interest. The 20-year loan costs a staggering $74,000 in total interest. You are paying $41,000 extra just for the illusion of a lower monthly payment.</p>
            <p><strong>Example 2: The Power of a Trade-In.</strong> You live in a state with an 8% sales tax. You buy a $60,000 travel trailer and trade in your old pop-up camper for $10,000. Because the state only taxes the difference ($50,000), your tax bill drops from $4,800 to $4,000. You instantly save $800 in taxes, plus you lowered your principal loan amount by $10,000.</p>

            <h2>Tips and Best Practices</h2>
            <p><strong>Put at least 20% Down:</strong> To combat the brutal depreciation curve of a new RV, you must put down a minimum of 20%. This ensures you have immediate equity in the vehicle, protecting you if you need to sell the RV due to an emergency or lifestyle change.</p>
            <p><strong>Use a Specialized RV Lender:</strong> Standard banks often don't understand RV valuations and may offer poor terms or refuse to finance older RVs. Work with specialized RV lenders, credit unions, or brokers who understand the industry. They often offer longer terms and lower rates than standard auto lenders.</p>
            <p><strong>Budget for the Hidden Costs:</strong> Your loan payment is just the beginning. When budgeting for an RV, you must also calculate the cost of specialized RV insurance, off-season storage fees, routine maintenance (which is significantly more expensive than a car), and drastically lower fuel economy.</p>

            <h2>Conclusion</h2>
            <p>An RV is an incredible way to travel, offering unparalleled freedom and family memories. But because it requires taking on a mortgage-sized loan for a rapidly depreciating asset, it must be approached with mathematical caution.</p>
            <p>By rigorously utilizing this RV Loan Calculator, you transition from an emotional buyer to a calculated investor. Running multiple scenarios—adjusting the loan term from 15 years to 10 years, increasing your down payment, or rolling taxes in vs. paying them in cash—empowers you to find the exact financing structure that minimizes your interest costs and secures your financial future on the road.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rv-loan-calculator" />
          <PopularCalculators exclude="/calculator/rv-loan-calculator" />
        </div>
      </div>
    </>
  );
}
