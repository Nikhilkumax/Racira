"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Calculator, Home } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface HomeLoanInputs {
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

interface HomeLoanResults {
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

// 2. Pure Calculation Function
const calculateHomeLoan = (inputs: HomeLoanInputs): HomeLoanResults => {
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

// 3. DEFAULTS Object
const DEFAULTS = {
  propertyPrice: "350000",
  downPaymentPct: "20",
  downPaymentAmt: "70000",
  dpMode: "percent" as "percent" | "amount",
  interestRate: "6.8",
  loanTerm: "30",
  annualPropertyTax: "4200",
  annualInsurance: "1400",
  monthlyHoa: "0"
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</p>
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

export default function HomeLoanCalculator() {
  // 4. Component State
  const [propertyPrice, setPropertyPrice] = useState(DEFAULTS.propertyPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(DEFAULTS.downPaymentPct);
  const [downPaymentAmt, setDownPaymentAmt] = useState(DEFAULTS.downPaymentAmt);
  const [dpMode, setDpMode] = useState<"percent" | "amount">(DEFAULTS.dpMode);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTerm, setLoanTerm] = useState(DEFAULTS.loanTerm);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [annualPropertyTax, setAnnualPropertyTax] = useState(DEFAULTS.annualPropertyTax);
  const [annualInsurance, setAnnualInsurance] = useState(DEFAULTS.annualInsurance);
  const [monthlyHoa, setMonthlyHoa] = useState(DEFAULTS.monthlyHoa);

  const [results, setResults] = useState<HomeLoanResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: HomeLoanInputs = {
      propertyPrice: parseFloat(propertyPrice) || 0,
      downPaymentPct: parseFloat(downPaymentPct) || 0,
      downPaymentAmt: parseFloat(downPaymentAmt) || 0,
      dpMode,
      interestRate: parseFloat(interestRate) || 0,
      loanTerm: parseFloat(loanTerm) || 0,
      annualPropertyTax: parseFloat(annualPropertyTax) || 0,
      annualInsurance: parseFloat(annualInsurance) || 0,
      monthlyHoa: parseFloat(monthlyHoa) || 0,
    };
    setResults(calculateHomeLoan(inputs));
  };

  const handleReset = () => {
    setPropertyPrice(DEFAULTS.propertyPrice);
    setDownPaymentPct(DEFAULTS.downPaymentPct);
    setDownPaymentAmt(DEFAULTS.downPaymentAmt);
    setDpMode(DEFAULTS.dpMode);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTerm(DEFAULTS.loanTerm);
    setAnnualPropertyTax(DEFAULTS.annualPropertyTax);
    setAnnualInsurance(DEFAULTS.annualInsurance);
    setMonthlyHoa(DEFAULTS.monthlyHoa);
    setShowAdvanced(false);
    
    setResults(calculateHomeLoan({
      propertyPrice: parseFloat(DEFAULTS.propertyPrice),
      downPaymentPct: parseFloat(DEFAULTS.downPaymentPct),
      downPaymentAmt: parseFloat(DEFAULTS.downPaymentAmt),
      dpMode: DEFAULTS.dpMode,
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTerm: parseFloat(DEFAULTS.loanTerm),
      annualPropertyTax: parseFloat(DEFAULTS.annualPropertyTax),
      annualInsurance: parseFloat(DEFAULTS.annualInsurance),
      monthlyHoa: parseFloat(DEFAULTS.monthlyHoa),
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePriceChange = (val: string) => {
    setPropertyPrice(val);
    const p = parseFloat(val) || 0;
    if (dpMode === "percent") {
      const pct = parseFloat(downPaymentPct) || 0;
      setDownPaymentAmt(p > 0 ? String(Math.round(p * pct / 100)) : "0");
    } else {
      const amt = parseFloat(downPaymentAmt) || 0;
      setDownPaymentPct(p > 0 ? String(((amt / p) * 100).toFixed(1)) : "0");
    }
  };

  const handleDpChange = (val: string) => {
    const p = parseFloat(propertyPrice) || 0;
    if (dpMode === "percent") {
      setDownPaymentPct(val);
      setDownPaymentAmt(p > 0 ? String(Math.round(p * (parseFloat(val) || 0) / 100)) : "0");
    } else {
      setDownPaymentAmt(val);
      setDownPaymentPct(p > 0 ? String((((parseFloat(val) || 0) / p) * 100).toFixed(1)) : "0");
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Home Loan Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a Home Loan?", answer: "A home loan, commonly referred to as a mortgage, is a financial agreement where a lender provides money to a borrower for the purchase of a property. The property itself serves as collateral for the loan. Borrowers repay the loan amount plus interest over a fixed period, usually 15 or 30 years." },
    { question: "How does the Down Payment impact my loan?", answer: "Your down payment is the initial upfront portion of the home price that you pay out-of-pocket. A larger down payment reduces your total loan amount, meaning lower monthly payments and less interest paid over the life of the loan. Additionally, a down payment of at least 20% typically removes the requirement for Private Mortgage Insurance (PMI)." },
    { question: "What is Principal and Interest (P&I)?", answer: "P&I refers to the two main components of your monthly mortgage payment. The Principal is the repayment of the original amount borrowed, while Interest is the cost charged by the lender for borrowing the money. Early in your loan term, the majority of your payment goes toward interest." },
    { question: "Why are Property Taxes and Insurance included?", answer: "Lenders want to ensure their collateral (your home) is protected. Property taxes must be paid to prevent a tax lien, and home insurance must be maintained to repair the home in case of disaster. Lenders often collect these funds monthly and hold them in an escrow account to pay the bills when they are due." },
    { question: "Can I pay my home loan off early?", answer: "Yes, in most cases you can make extra principal payments without any penalty. Paying extra each month or making a lump sum payment reduces the total principal balance, which in turn reduces the amount of interest you are charged in subsequent months, allowing you to pay off the loan years ahead of schedule." },
    { question: "What is the difference between a 15-year and 30-year term?", answer: "A 30-year loan offers lower monthly payments because the principal repayment is stretched over a longer period, but you will pay significantly more in total interest. A 15-year loan has higher monthly payments, but you build equity faster and pay much less interest over the life of the loan." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Loan Calculator</h1>

        {/* Desktop Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <CompactInput id="price" label="Property Price" value={propertyPrice} onChange={handlePriceChange} prefix="$" />
            
            <div className="flex flex-col">
              <label htmlFor="down-payment" className="flex items-center text-sm font-semibold text-foreground mb-1.5">Down Payment</label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                {dpMode === "amount" && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">$</span>}
                <input
                  id="down-payment" type="number"
                  value={dpMode === "percent" ? downPaymentPct : downPaymentAmt}
                  onChange={(e) => handleDpChange(e.target.value)}
                  className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                />
                <div className="flex border-l border-input h-full shrink-0">
                  <button type="button" onClick={() => setDpMode("percent")} className={`px-3 text-sm font-bold transition-colors border-r border-input ${dpMode === "percent" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>%</button>
                  <button type="button" onClick={() => setDpMode("amount")} className={`px-3 text-sm font-bold transition-colors ${dpMode === "amount" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>$</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="term" label="Loan Term" value={loanTerm} onChange={setLoanTerm} suffix="years" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax" label="Property Tax / Year" value={annualPropertyTax} onChange={setAnnualPropertyTax} prefix="$" />
                  <CompactInput id="ins" label="Home Insurance / Year" value={annualInsurance} onChange={setAnnualInsurance} prefix="$" />
                  <CompactInput id="hoa" label="HOA Fees / Month" value={monthlyHoa} onChange={setMonthlyHoa} prefix="$" />
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
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.totalMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">Includes Principal, Interest, Taxes & Insurance</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Loan Amount</div>
                    <div className="text-lg font-bold">${results.loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterestPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Payoff Year</div>
                    <div className="text-lg font-bold text-emerald-600">{results.payoffYear}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Payment Breakdown</h3>
                    <table className="w-full text-base">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                          <th className="pb-2 font-medium">Category</th>
                          <th className="pb-2 font-medium text-right">Monthly</th>
                          <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdown.map((row, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${row.isTotal ? "font-bold border-t-2 border-border" : ""}`}>
                            <td className="py-2.5">
                              <span className="flex items-center gap-2">
                                {!row.isTotal && <span className={`w-2.5 h-2.5 rounded-full bg-current ${row.colorClass}`} />}
                                {row.label}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">{row.monthly}</td>
                            <td className="py-2.5 text-right">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Monthly Distribution</h3>
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
                          {d.name} ({((d.value / results.totalMonthlyPayment) * 100).toFixed(1)}%)
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Home Loan Calculator?</h2>
            <p>A <strong>Home Loan Calculator</strong> is a powerful financial modeling tool designed to help prospective home buyers and real estate investors estimate their true monthly mortgage obligations and total long-term borrowing costs. When you purchase a home, the sticker price is just the beginning. The actual amount you will pay every month—and over the course of the loan—depends heavily on your down payment, interest rate, loan duration, and peripheral costs like property taxes and homeowner's insurance.</p>
            <p>This calculator removes the guesswork from the home-buying process. By instantly processing standard amortization mathematics alongside your specific local variables, it provides a crystal-clear picture of your housing affordability. Whether you are a first-time home buyer trying to figure out if you can afford a starter home, or an experienced investor calculating cash flow on a rental property, a home loan calculator is your first step toward responsible property ownership.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The core of any home loan calculation relies on standard loan amortization mathematics. Our calculator determines your base monthly Principal and Interest (P&I) payment using the following universal formula:</p>
            <p><strong>M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1 ]</strong></p>
            <p>Where:</p>
            <ul>
              <li><strong>M</strong> = Total monthly payment (Principal & Interest)</li>
              <li><strong>P</strong> = Principal loan amount (Property Price minus Down Payment)</li>
              <li><strong>r</strong> = Monthly interest rate (Annual interest rate divided by 12)</li>
              <li><strong>n</strong> = Number of payments (Loan term in years multiplied by 12)</li>
            </ul>
            <p>Once the base P&I is calculated, the tool adds your monthly property taxes (annual tax divided by 12), your homeowner's insurance (annual insurance divided by 12), and any Homeowner's Association (HOA) fees to provide your complete monthly outflow.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The results generated by our Home Loan Calculator are divided into several intuitive sections to give you both high-level summaries and granular details.</p>
            <p><strong>Primary Result Card:</strong> This is the headline number. It shows your total estimated monthly payment, including taxes and insurance. This is the exact number you should compare against your monthly household budget to determine true affordability.</p>
            <p><strong>Payment Breakdown:</strong> This table separates your monthly payment into its core components (Principal & Interest, Taxes, Insurance, and HOA). Lenders refer to this complete package as PITI (Principal, Interest, Taxes, and Insurance). Understanding this breakdown is crucial because while your P&I is fixed (on a fixed-rate loan), your taxes and insurance will likely increase over time.</p>
            <p><strong>Total Cost of Loan:</strong> This reveals the true cost of buying the property. It takes the total amount of money you will pay over the next 15 or 30 years and adds it to your initial down payment. Often, buyers are shocked to see that over 30 years, they might pay more in interest than the original purchase price of the home.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>Several critical variables will dictate your home loan costs. Manipulating these inputs in the calculator will help you find your financial sweet spot.</p>
            <p><strong>Property Price & Down Payment:</strong> The difference between these two numbers is your loan amount. A larger down payment reduces your loan amount, which lowers your monthly payment and saves you massive amounts of interest over decades. Additionally, a down payment of at least 20% generally eliminates the need for Private Mortgage Insurance (PMI).</p>
            <p><strong>Interest Rate:</strong> This is the cost of borrowing money. Even a 0.5% difference in your interest rate can swing your monthly payment by hundreds of dollars and alter your total lifetime cost by tens of thousands. Securing a low rate through an excellent credit score is the most impactful way to make a home more affordable.</p>
            <p><strong>Loan Term:</strong> The most common terms are 15-year and 30-year mortgages. A 30-year term stretches out the repayment, resulting in lower, more manageable monthly payments. However, a 15-year term builds equity much faster and slashes the total interest paid, though it requires a significantly higher monthly cash flow.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>Our calculator goes beyond simple P&I by offering an <strong>Advanced Options</strong> toggle. Real-world homeownership includes unavoidable carrying costs. By entering your estimated Annual Property Tax, Annual Home Insurance, and Monthly HOA fees, you transform a theoretical math equation into a realistic budget projection.</p>
            <p>Property taxes vary wildly by location. A $400,000 home in one state might have $3,000 in annual taxes, while the exact same priced home in a different state could carry a $10,000 annual tax burden. Including these numbers is non-negotiable for accurate financial planning.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The Impact of Interest Rates.</strong> Let's say you buy a $350,000 home with a 20% down payment ($70,000), leaving a $280,000 loan. At a 6.0% interest rate on a 30-year term, your monthly P&I is roughly $1,678. If rates rise to 7.5%, that same loan costs $1,957 per month. That 1.5% rate increase costs you nearly $300 more every month, highlighting why buyers must lock in rates carefully.</p>
            <p><strong>Example 2: 15-Year vs 30-Year.</strong> Using the same $280,000 loan at 6.0%: A 30-year term costs $1,678/month and yields $324,000 in total interest paid. If you switch to a 15-year term at the same rate, your payment jumps to $2,362/month, but your total interest paid drops to just $145,000. You save nearly $180,000 in interest by paying the loan off 15 years faster.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p><strong>Do Not Max Out Your Approval:</strong> Lenders will often approve you for a maximum loan amount based on your gross income. Do not blindly borrow this maximum. Use the Home Loan Calculator to verify that the monthly payment fits comfortably within your net (after-tax) monthly income, leaving room for savings, investing, and emergencies.</p>
            <p><strong>Shop for Rates:</strong> Never accept the first interest rate offered by your primary bank. Get quotes from multiple mortgage brokers, credit unions, and online lenders. Small fractional improvements in your rate yield massive long-term savings.</p>
            <p><strong>Account for Maintenance:</strong> The calculator provides your PITI, but it cannot account for a broken water heater or a leaking roof. A standard rule of thumb is to budget 1% to 2% of the home's value annually for maintenance and repairs, on top of your calculated monthly payment.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Utilizing a Home Loan Calculator empowers you with financial foresight. It protects you from the emotional trap of falling in love with a house you cannot afford. By running various scenarios—different home prices, varying down payments, fluctuating interest rates—you establish firm budgetary boundaries before you ever speak to a real estate agent.</p>
            <p>Ultimately, a home is not just a place to live; it is a complex financial instrument. Approaching it with accurate, unbiased mathematical modeling ensures that your new home remains a blessing rather than becoming a financial burden.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-loan-calculator" />
          <PopularCalculators exclude="/calculator/home-loan-calculator" />
        </div>
      </div>
    </>
  );
}
