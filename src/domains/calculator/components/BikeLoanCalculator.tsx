"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Bike } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface BikeLoanInputs {
  bikePrice: number;
  downPaymentAmt: number;
  tradeInValue: number;
  amountOwedOnTradeIn: number;
  salesTaxRate: number;
  titleAndRegistrationFees: number;
  accessoriesAndGear: number;
  interestRate: number;
  loanTermMonths: number;
  includeTaxAndFeesInLoan: boolean;
}

interface BikeLoanResults {
  totalLoanAmount: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalSalesTax: number;
  totalFeesAndGear: number;
  totalCostOfBike: number;
  payoffDate: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateBikeLoan = (inputs: BikeLoanInputs): BikeLoanResults => {
  const {
    bikePrice,
    downPaymentAmt,
    tradeInValue,
    amountOwedOnTradeIn,
    salesTaxRate,
    titleAndRegistrationFees,
    accessoriesAndGear,
    interestRate,
    loanTermMonths,
    includeTaxAndFeesInLoan
  } = inputs;

  const netTradeInEquity = tradeInValue - amountOwedOnTradeIn;

  // Taxable amount is typically bike price + accessories minus trade-in value
  const taxableAmount = Math.max(0, (bikePrice + accessoriesAndGear) - tradeInValue);
  const totalSalesTax = taxableAmount * (salesTaxRate / 100);
  
  const totalFeesAndGear = titleAndRegistrationFees + accessoriesAndGear;

  let amountToFinance = bikePrice + accessoriesAndGear - downPaymentAmt - netTradeInEquity;

  if (includeTaxAndFeesInLoan) {
    amountToFinance += totalSalesTax + titleAndRegistrationFees;
  }

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
  
  let totalCostOfBike = downPaymentAmt + totalPaid;
  if (!includeTaxAndFeesInLoan) {
    totalCostOfBike += totalSalesTax + titleAndRegistrationFees;
  }

  const currentDate = new Date();
  const payoffYear = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + loanTermMonths) / 12);
  const payoffMonthIndex = (currentDate.getMonth() + loanTermMonths) % 12;
  const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payoffDate = `${monthsStr[payoffMonthIndex]} ${payoffYear}`;

  const chartData = [
    { name: "Principal", value: totalPrincipalPaid, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterestPaid, color: "#f59e0b" },
    { name: "Taxes & Fees", value: totalSalesTax + totalFeesAndGear, color: "#10b981" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Total Loan Amount", value: `$${totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Paid", value: `$${totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Taxes & Fees", value: `$${(totalSalesTax + titleAndRegistrationFees).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Out of Pocket at Purchase", value: `$${(downPaymentAmt + (includeTaxAndFeesInLoan ? 0 : totalSalesTax + titleAndRegistrationFees)).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
    { label: "Total Cost", value: `$${totalCostOfBike.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Bike Price", amount: `$${bikePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Interest", amount: `$${totalInterestPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Sales Tax", amount: `$${totalSalesTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Title & Reg Fees", amount: `$${titleAndRegistrationFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Accessories & Gear", amount: `$${accessoriesAndGear.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-purple-500" },
    { label: "Net Trade-In Equity", amount: `-$${netTradeInEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Total Cost of Bike", amount: `$${totalCostOfBike.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    totalLoanAmount,
    monthlyPayment,
    totalInterestPaid,
    totalPrincipalPaid,
    totalSalesTax,
    totalFeesAndGear,
    totalCostOfBike,
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
  bikePrice: "12500",
  downPaymentAmt: "2500",
  tradeInValue: "0",
  amountOwedOnTradeIn: "0",
  salesTaxRate: "7.0",
  titleAndRegistrationFees: "150",
  accessoriesAndGear: "800",
  interestRate: "8.5",
  loanTermMonths: "48",
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

export default function BikeLoanCalculator() {
  // 4. Component State
  const [bikePrice, setBikePrice] = useState(DEFAULTS.bikePrice);
  const [downPaymentAmt, setDownPaymentAmt] = useState(DEFAULTS.downPaymentAmt);
  const [tradeInValue, setTradeInValue] = useState(DEFAULTS.tradeInValue);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermMonths, setLoanTermMonths] = useState(DEFAULTS.loanTermMonths);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [amountOwedOnTradeIn, setAmountOwedOnTradeIn] = useState(DEFAULTS.amountOwedOnTradeIn);
  const [salesTaxRate, setSalesTaxRate] = useState(DEFAULTS.salesTaxRate);
  const [titleAndRegistrationFees, setTitleAndRegistrationFees] = useState(DEFAULTS.titleAndRegistrationFees);
  const [accessoriesAndGear, setAccessoriesAndGear] = useState(DEFAULTS.accessoriesAndGear);
  const [includeTaxAndFeesInLoan, setIncludeTaxAndFeesInLoan] = useState(DEFAULTS.includeTaxAndFeesInLoan);

  const [results, setResults] = useState<BikeLoanResults | null>(() => calculateBikeLoan({
    bikePrice: parseFloat(DEFAULTS.bikePrice) || 0,
    downPaymentAmt: parseFloat(DEFAULTS.downPaymentAmt) || 0,
    tradeInValue: parseFloat(DEFAULTS.tradeInValue) || 0,
    amountOwedOnTradeIn: parseFloat(DEFAULTS.amountOwedOnTradeIn) || 0,
    salesTaxRate: parseFloat(DEFAULTS.salesTaxRate) || 0,
    titleAndRegistrationFees: parseFloat(DEFAULTS.titleAndRegistrationFees) || 0,
    accessoriesAndGear: parseFloat(DEFAULTS.accessoriesAndGear) || 0,
    interestRate: parseFloat(DEFAULTS.interestRate) || 0,
    loanTermMonths: parseFloat(DEFAULTS.loanTermMonths) || 0,
    includeTaxAndFeesInLoan: DEFAULTS.includeTaxAndFeesInLoan,
  }));
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: BikeLoanInputs = {
      bikePrice: parseFloat(bikePrice) || 0,
      downPaymentAmt: parseFloat(downPaymentAmt) || 0,
      tradeInValue: parseFloat(tradeInValue) || 0,
      amountOwedOnTradeIn: parseFloat(amountOwedOnTradeIn) || 0,
      salesTaxRate: parseFloat(salesTaxRate) || 0,
      titleAndRegistrationFees: parseFloat(titleAndRegistrationFees) || 0,
      accessoriesAndGear: parseFloat(accessoriesAndGear) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTermMonths: parseFloat(loanTermMonths) || 0,
      includeTaxAndFeesInLoan
    };
    setResults(calculateBikeLoan(inputs));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setBikePrice(DEFAULTS.bikePrice);
    setDownPaymentAmt(DEFAULTS.downPaymentAmt);
    setTradeInValue(DEFAULTS.tradeInValue);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermMonths(DEFAULTS.loanTermMonths);
    setAmountOwedOnTradeIn(DEFAULTS.amountOwedOnTradeIn);
    setSalesTaxRate(DEFAULTS.salesTaxRate);
    setTitleAndRegistrationFees(DEFAULTS.titleAndRegistrationFees);
    setAccessoriesAndGear(DEFAULTS.accessoriesAndGear);
    setIncludeTaxAndFeesInLoan(DEFAULTS.includeTaxAndFeesInLoan);
    setShowAdvanced(false);
    
    setResults(calculateBikeLoan({
      bikePrice: parseFloat(DEFAULTS.bikePrice),
      downPaymentAmt: parseFloat(DEFAULTS.downPaymentAmt),
      tradeInValue: parseFloat(DEFAULTS.tradeInValue),
      amountOwedOnTradeIn: parseFloat(DEFAULTS.amountOwedOnTradeIn),
      salesTaxRate: parseFloat(DEFAULTS.salesTaxRate),
      titleAndRegistrationFees: parseFloat(DEFAULTS.titleAndRegistrationFees),
      accessoriesAndGear: parseFloat(DEFAULTS.accessoriesAndGear),
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTermMonths: parseFloat(DEFAULTS.loanTermMonths),
      includeTaxAndFeesInLoan: DEFAULTS.includeTaxAndFeesInLoan
    }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Motorcycle Loan Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How does a motorcycle loan differ from a car loan?", answer: "Motorcycle loans are typically considered recreational or 'luxury' loans by lenders. Because motorcycles have a higher risk of theft, damage, and depreciation than cars, interest rates are usually 1% to 3% higher than standard auto loans, and loan terms are often shorter." },
    { question: "Can I finance my helmet and riding gear with the bike?", answer: "Yes. Many dealerships and lenders allow you to roll the cost of accessories, riding gear, and extended warranties into your loan. Our calculator includes an 'Accessories & Gear' field to help you estimate how this will impact your monthly payment." },
    { question: "What is a good interest rate for a bike loan?", answer: "Rates depend heavily on your credit score and the Federal Reserve's prime rate. Excellent credit (750+) might secure a rate between 4% and 7%. Average credit usually sees rates between 8% and 12%, while poor credit can face rates upwards of 20%." },
    { question: "Is a 72-month loan a bad idea for a motorcycle?", answer: "We generally advise against 72-month terms for motorcycles. Bikes depreciate incredibly fast, and a 72-month loan almost guarantees you will be 'underwater' (owing more than the bike is worth) for several years. We recommend sticking to 36, 48, or a maximum of 60 months." },
    { question: "What credit score do I need to buy a motorcycle?", answer: "Most lenders look for a minimum credit score of 620 to approve a motorcycle loan without exorbitant interest rates. However, the best promotional rates from manufacturers (like 0% or 1.9% APR deals) are reserved for 'super-prime' borrowers with scores over 720." },
    { question: "Does trading in a bike reduce my sales tax?", answer: "In most states, yes. When you trade in a vehicle, you only pay sales tax on the difference between the new bike's price and your trade-in's value. This can save you hundreds of dollars in taxes compared to selling the bike privately." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bike Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bike Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Bike Price" value={bikePrice} onChange={setBikePrice} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold col-span-2">Trade-In & Taxes</div>
                  <CompactInput id="trade-owed" label="Owed on Trade-In" value={amountOwedOnTradeIn} onChange={setAmountOwedOnTradeIn} prefix="$" />
                  <CompactInput id="tax" label="Sales Tax Rate" value={salesTaxRate} onChange={setSalesTaxRate} suffix="%" />
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold col-span-2">Fees & Accessories</div>
                  <CompactInput id="fees" label="Title & Reg Fees" value={titleAndRegistrationFees} onChange={setTitleAndRegistrationFees} prefix="$" />
                  <CompactInput id="gear" label="Accessories & Gear" value={accessoriesAndGear} onChange={setAccessoriesAndGear} prefix="$" />
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
                    {mounted && (<ResponsiveContainer width="100%" height={200}>
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
                    </ResponsiveContainer>)}
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Bike Loan Calculator</h2>
            <p>Buying a motorcycle is often an emotional decision driven by passion, freedom, and the open road. However, financing that motorcycle is a purely mathematical endeavor. An <strong>Motorcycle Loan Calculator</strong> is a critical financial planning tool designed specifically for riders. It helps you navigate the unique lending environment of recreational vehicles, allowing you to estimate your monthly payments, factor in riding gear, and understand the true cost of your new bike before you ever set foot inside a dealership.</p>
            <p>Dealership finance offices are notoriously adept at masking high interest rates by extending the loan term to hit your desired monthly payment. By using this calculator, you take the power back. You can clearly visualize the amortization schedule, analyze the impact of different down payments, and uncover exactly how much interest you will be paying over the life of the loan.</p>

            <h2 className="text-2xl font-bold mb-3">How Motorcycle Amortization Works</h2>
            <p>A motorcycle loan functions identically to a standard auto loan. It is a fixed-rate, amortizing installment loan. "Amortization" means that your monthly payment stays exactly the same every month, but the way that payment is divided between Principal (the actual cost of the bike) and Interest (the lender's profit) changes over time.</p>
            <p>The standard formula used to calculate your fixed payment is:</p>
            <p><strong>M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1 ]</strong></p>
            <p>In this equation, <em>M</em> is the monthly payment, <em>P</em> is the total principal loan amount, <em>r</em> is the monthly interest rate (APR divided by 12), and <em>n</em> is the loan term in months. Early in the loan, a large chunk of your payment goes to interest. As the balance drops, more of your payment goes toward paying off the motorcycle.</p>

            <h2 className="text-2xl font-bold mb-3">Analyzing Your Calculator Results</h2>
            <p>Our Bike Loan Calculator provides a comprehensive breakdown of your financial obligation. Here is how to interpret the results:</p>
            <p><strong>Estimated Monthly Payment:</strong> This is the exact amount you will owe the bank every month. It is the most important number for your day-to-day budgeting.</p>
            <p><strong>Total Cost Breakdown:</strong> This table reveals the invisible costs of financing. It separates the sticker price of the motorcycle from the interest you are paying the bank. Many riders are shocked to discover that an 8% loan stretched over 60 months can add thousands of dollars to the final cost of their bike.</p>
            <p><strong>Cost Distribution Chart:</strong> A visual pie chart that quickly illustrates how much of your total expenditure is actually going toward the motorcycle, versus how much is being lost to interest, taxes, and dealer fees.</p>

            <h2 className="text-2xl font-bold mb-3">Unique Variables in Motorcycle Financing</h2>
            <p>Financing a bike is different from financing a car. Lenders view motorcycles as recreational vehicles, which carry a higher risk of default and a higher risk of total-loss accidents. Because of this, the lending variables differ slightly.</p>
            <p><strong>Higher Interest Rates:</strong> You will almost always pay a higher interest rate on a motorcycle than a car. Even with top-tier credit, expect rates to be 1% to 3% higher than standard automotive rates. Our calculator defaults to 8.5% to reflect this reality, but you should adjust it based on current market conditions.</p>
            <p><strong>Financing Gear and Accessories:</strong> Unlike cars, riding a motorcycle requires expensive safety gear. A quality helmet, jacket, boots, and gloves can easily cost $1,000 or more. Furthermore, riders often add exhaust systems or luggage immediately upon purchase. Dealerships frequently allow you to roll the cost of these accessories directly into the loan. Our Advanced Options suite includes an "Accessories & Gear" input to model this accurately.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Long Loan Terms</h2>
            <p>The loan term is the length of time you have to pay back the loan. Standard terms for motorcycles are 36, 48, and 60 months. Recently, 72-month loans have become common for expensive touring bikes.</p>
            <p>Extending the loan term is a double-edged sword. Yes, it lowers your monthly payment. However, motorcycles depreciate rapidly—often faster than cars. If you take out a 72-month loan with a small down payment, you will almost certainly be "underwater" (owing more than the bike is worth) for the first three to four years. If you decide to sell the bike or trade it in before the loan is paid off, you will have to pay the bank out of your own pocket to cover the difference.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features: Taxes and Trade-Ins</h2>
            <p>Our calculator features advanced toggles to simulate a true dealership transaction.</p>
            <p><strong>Trade-In Equity:</strong> If you are trading in your old bike, the calculator will subtract its value from the new purchase price. Furthermore, it accounts for negative equity. If you owe $5,000 on your old bike, but the dealer only gives you $3,000 for it, that $2,000 difference is added to your new loan.</p>
            <p><strong>Sales Tax Optimization:</strong> In most US states, trading in a vehicle gives you a massive tax break. You only pay sales tax on the difference between the new bike's price and your trade-in value. The calculator automatically computes this tax advantage, showing you exactly why trading in at the dealer can sometimes be financially superior to selling the bike privately.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples of Bike Financing</h2>
            <p><strong>Example 1: The Gear Trap.</strong> You buy a $10,000 motorcycle and decide to finance $1,500 worth of gear and an extended warranty into the loan. At 9% APR for 60 months, your total loan is $11,500. Your monthly payment is $239. Over 5 years, you pay $2,820 in interest. That $1,500 gear package ultimately cost you nearly $1,900 due to the added interest. Paying cash for accessories is always the smarter move.</p>
            <p><strong>Example 2: 36 Months vs. 60 Months.</strong> You are financing a $15,000 cruiser at 7% APR. A 60-month loan gives you a comfortable $297 monthly payment, but costs $2,820 in total interest. If you aggressively choose a 36-month loan, your payment jumps to $463, but your total interest drops to just $1,675. You save over $1,100 simply by paying the bike off two years faster.</p>

            <h2 className="text-2xl font-bold mb-3">Tips and Best Practices</h2>
            <p><strong>Get Pre-Approved at a Credit Union:</strong> Credit unions frequently offer the best interest rates for recreational vehicles. Before visiting a dealership, secure a pre-approval from a local credit union. Dealerships will often mark up the interest rate to make a profit. Having a pre-approval gives you the leverage to force the dealer to beat your rate.</p>
            <p><strong>Put 20% Down:</strong> To protect yourself against rapid initial depreciation, aim for a down payment of at least 20%. This ensures you have instant equity in the motorcycle and protects you if you need to sell the bike suddenly.</p>
            <p><strong>Don't Forget Insurance:</strong> Remember that if you finance a motorcycle, the lender will require you to carry full-coverage insurance. Full coverage on a motorcycle—especially sports bikes—can be incredibly expensive. Use this calculator to find your monthly payment, but ensure you get an insurance quote before finalizing your budget.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>A motorcycle is an investment in your lifestyle and happiness, but it should never become a financial burden. By utilizing this Motorcycle Loan Calculator, you strip away the sales tactics and focus purely on the mathematics. Running different scenarios allows you to find the perfect balance between the bike you want, the monthly payment you need, and the long-term financial security you deserve.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bike-loan-calculator" />
          <PopularCalculators exclude="/calculator/bike-loan-calculator" />
        </div>
      </div>
    </>
  );
}
