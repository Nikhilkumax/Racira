"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

interface LoanPayoffInputs {
  balance: number;
  interestRate: number;
  minPayment: number;
  extraMonthly: number;
  extraOneTime: number;
  extraAnnual: number;
  startDate: string;
}

interface LoanPayoffResults {
  monthsToPayoff: number;
  payoffDate: string;
  totalPaid: number;
  totalInterest: number;
  interestSaved: number;
  monthsSaved: number;
  chartData: { month: number; balance: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const parseMonthStr = (mStr: string): number => {
  if (!mStr) return 1;
  const normalized = mStr.trim().toLowerCase();
  const monthsMap: Record<string, number> = {
    jan: 1, january: 1, "1": 1, "01": 1,
    feb: 2, february: 2, "2": 2, "02": 2,
    mar: 3, march: 3, "3": 3, "03": 3,
    apr: 4, april: 4, "4": 4, "04": 4,
    may: 5, "5": 5, "05": 5,
    jun: 6, june: 6, "6": 6, "06": 6,
    jul: 7, july: 7, "7": 7, "07": 7,
    aug: 8, august: 8, "8": 8, "08": 8,
    sep: 9, september: 9, "9": 9, "09": 9,
    oct: 10, october: 10, "10": 10,
    nov: 11, november: 11, "11": 11,
    dec: 12, december: 12, "12": 12,
  };
  return monthsMap[normalized] || parseInt(normalized) || 1;
};

const calculatePayoff = (inputs: LoanPayoffInputs): LoanPayoffResults => {
  const { balance, interestRate, minPayment, extraMonthly, extraOneTime, extraAnnual, startDate } = inputs;
  
  const r = interestRate / 100 / 12;
  const actualMinPayment = r > 0 ? Math.max(minPayment, balance * r) : minPayment;
  
  if (balance <= 0) {
    return { monthsToPayoff: 0, payoffDate: "N/A", totalPaid: 0, totalInterest: 0, interestSaved: 0, monthsSaved: 0, chartData: [], summaryStats: [], breakdown: [], monthlyRows: [], yearlyRows: [] };
  }

  // Baseline (no extra)
  let balBase = balance;
  let monthsBase = 0;
  let totalIntBase = 0;
  while (balBase > 0.01 && monthsBase < 1200) { // Max 100 years
    monthsBase++;
    const int = balBase * r;
    let prin = actualMinPayment - int;
    if (prin > balBase) prin = balBase;
    totalIntBase += int;
    balBase -= prin;
  }

  // With Extra Payments
  let bal = balance;
  let months = 0;
  let totalInt = 0;
  const chartData = [{ month: 0, balance: Math.round(balance) }];
  const monthlyRows: AmortRow[] = [];

  while (bal > 0.01 && months < 1200) {
    months++;
    const int = bal * r;
    
    let extra = extraMonthly;
    if (months === 1) extra += extraOneTime;
    if (months % 12 === 0) extra += extraAnnual;
    
    let prin = (actualMinPayment + extra) - int;
    if (prin > bal) prin = bal;
    
    totalInt += int;
    bal -= prin;
    
    monthlyRows.push({
      period: months,
      payment: int + prin,
      principal: prin,
      interest: int,
      extraPayment: extra,
      balance: Math.max(0, bal)
    });

    if (months % 12 === 0 || bal <= 0.01) {
      chartData.push({ month: months, balance: Math.max(0, Math.round(bal)) });
    }
  }

  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
    const yearSlice = monthlyRows.slice(y * 12, (y + 1) * 12);
    if (yearSlice.length === 0) break;
    yearlyRows.push({
      period: y + 1,
      payment: yearSlice.reduce((s, row) => s + row.payment, 0),
      principal: yearSlice.reduce((s, row) => s + row.principal, 0),
      interest: yearSlice.reduce((s, row) => s + row.interest, 0),
      balance: yearSlice[yearSlice.length - 1].balance,
    });
  }

  const sd = startDate.split("-");
  const startMonth = parseMonthStr(sd[1]);
  const startYear = parseInt(sd[0]) || new Date().getFullYear();
  const payoffMonth = ((startMonth - 1 + months) % 12) + 1;
  const payoffYear = startYear + Math.floor((startMonth - 1 + months) / 12);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const totalPaid = balance + totalInt;
  const interestSaved = Math.max(0, totalIntBase - totalInt);
  const monthsSaved = Math.max(0, monthsBase - months);

  const summaryStats = [
    { label: "Original Balance", value: `$${balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Rate", value: `${interestRate.toFixed(2)}%` },
    { label: "Payoff Time", value: `${Math.floor(months / 12)}y ${months % 12}m` },
    { label: "Total Interest", value: `$${totalInt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];
  if (interestSaved > 0) {
    summaryStats.push({ label: "Interest Saved", value: `$${interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}` });
  }

  const breakdown = [
    { label: "Principal Repayment", amount: `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Interest Paid", amount: `$${totalInt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Total Amount Paid", amount: `$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    monthsToPayoff: months,
    payoffDate: `${monthNames[payoffMonth - 1]} ${payoffYear}`,
    totalPaid,
    totalInterest: totalInt,
    interestSaved,
    monthsSaved,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};

const DEFAULTS = {
  balance: "25000",
  interestRate: "6.5",
  minPayment: "350",
  extraMonthly: "150",
  extraOneTime: "0",
  extraAnnual: "0"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-1">Month {label} ({Math.floor(label/12)}y {label%12}m)</p>
        <p className="text-primary font-bold">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
      </div>
    );
  }
  return null;
};

export default function LoanPayoffCalculator() {
  const d = new Date();
  const startD = `${d.getFullYear()}-${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
  
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [minPayment, setMinPayment] = useState(DEFAULTS.minPayment);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [extraMonthly, setExtraMonthly] = useState(DEFAULTS.extraMonthly);
  const [extraOneTime, setExtraOneTime] = useState(DEFAULTS.extraOneTime);
  const [extraAnnual, setExtraAnnual] = useState(DEFAULTS.extraAnnual);
  const [startDate, setStartDate] = useState(startD);

  const [results, setResults] = useState<LoanPayoffResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculatePayoff({
      balance: parseFloat(balance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      minPayment: parseFloat(minPayment) || 0,
      extraMonthly: parseFloat(extraMonthly) || 0,
      extraOneTime: parseFloat(extraOneTime) || 0,
      extraAnnual: parseFloat(extraAnnual) || 0,
      startDate
    }));
  };

  const handleReset = () => {
    setBalance(DEFAULTS.balance); setInterestRate(DEFAULTS.interestRate); setMinPayment(DEFAULTS.minPayment);
    setExtraMonthly(DEFAULTS.extraMonthly); setExtraOneTime(DEFAULTS.extraOneTime); setExtraAnnual(DEFAULTS.extraAnnual);
    setStartDate(startD); setShowAdvanced(false);
    setResults(calculatePayoff({
      balance: parseFloat(DEFAULTS.balance), interestRate: parseFloat(DEFAULTS.interestRate), minPayment: parseFloat(DEFAULTS.minPayment),
      extraMonthly: parseFloat(DEFAULTS.extraMonthly), extraOneTime: 0, extraAnnual: 0, startDate: startD
    }));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Loan Payoff Schedule</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How do extra loan payments save money?", answer: "Extra payments go directly to your principal balance. By shrinking the principal faster, you force the lender to calculate next month's interest on a smaller number. This triggers a compounding effect where every extra dollar saves you money on interest for the remainder of the loan." },
    { question: "What is the fastest way to pay off a loan?", answer: "The mathematical absolute fastest way is to pay as much as possible above the minimum payment. Apply any windfalls (like tax refunds or work bonuses) directly to the principal. You can also refinance to a lower interest rate, but continue making your old, higher monthly payment so the difference goes directly to principal." },
    { question: "Should I pay off my loan early or invest?", answer: "Compare the guaranteed interest rate on your loan against the expected return of your investments. If you have high-interest debt (like credit cards at 20%), paying it off is a guaranteed 20% return. If you have a low-interest mortgage (like 3%), investing in the stock market typically yields higher long-term returns." },
    { question: "Does making extra payments negatively affect my credit score?", answer: "No. Paying more than the minimum reduces your overall debt load, which lowers your credit utilization ratio and improves your credit score. There are typically no penalties for early repayment on most personal, auto, and student loans, but always check for prepayment penalties on mortgages." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Payoff Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Payoff Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <CompactInput id="balance" label="Remaining Balance" value={balance} onChange={setBalance} prefix="$" />
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="payment" label="Minimum Payment" value={minPayment} onChange={setMinPayment} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Extra Payments</div>
                  <CompactInput id="extra-mo" label="Extra Monthly Payment" value={extraMonthly} onChange={setExtraMonthly} prefix="$" />
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="extra-one" label="One-Time Extra" value={extraOneTime} onChange={setExtraOneTime} prefix="$" />
                    <CompactInput id="extra-ann" label="Annual Extra" value={extraAnnual} onChange={setExtraAnnual} prefix="$" />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-2">Loan Details</div>
                  <div className="grid grid-cols-2 gap-2 h-10">
                    <select
                      value={startDate.split("-")[1] || "Jan"}
                      onChange={(e) => { const y = startDate.split("-")[0] || "2026"; setStartDate(`${y}-${e.target.value}`); }}
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                    >
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input
                      type="text" value={startDate.split("-")[0] || ""}
                      onChange={(e) => { const m = startDate.split("-")[1] || "May"; setStartDate(`${e.target.value}-${m}`); }}
                      placeholder="Year"
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated Payoff Date</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-4xl font-bold text-primary tracking-tighter">{results.payoffDate}</div>
                  </div>
                  {results.interestSaved > 0 && (
                    <div className="text-sm text-emerald-600 font-bold mt-2">
                      Extra payments save ${results.interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })} and {results.monthsSaved} months!
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Time to Payoff</div>
                    <div className="text-lg font-bold">{Math.floor(results.monthsToPayoff / 12)}y {results.monthsToPayoff % 12}m</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-amber-600">${results.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Cost</div>
                    <div className="text-lg font-bold text-emerald-600">${results.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20" : ""}>
                            <td className="text-base py-2.5 px-3">{item.label}</td>
                            <td className={`text-base py-2.5 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Remaining Balance Over Time</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val/12)}y`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Payoff Summary</h3>
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
                  <LazyView minHeight={300}>
                    <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} />
                  </LazyView>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Loan Payoff Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A loan payoff calculator is a powerful financial planning tool designed to help you strategically eliminate debt. When you carry a balance on a personal loan, auto loan, or student loan, the interest compounding against you can add thousands of dollars to your overall financial burden. This calculator mathematically charts your exact path to zero debt by generating a complete amortization schedule. It reveals exactly how long it will take to pay off your balance and quantifies the massive interest savings you can achieve by making additional principal payments.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The mechanics of loan repayment are deeply rooted in standard amortization math. Lenders calculate your monthly interest charge based exclusively on your remaining principal balance at that exact moment. The formula for the required minimum payment ensures that the loan is paid off over a predetermined number of years. However, when you introduce extra payments, you bypass this formula. Extra payments attack the principal balance directly, skipping the interest calculation entirely. By artificially reducing the principal, you force the lender to calculate next month's interest on a permanently smaller number, triggering a compounding snowball effect that drastically shortens your repayment timeline.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our calculator generates several critical metrics to guide your financial strategy. The estimated payoff date provides a concrete finish line for your debt journey. The total interest paid exposes the true cost of renting the lender's money over the life of the loan. The total cost combines your principal and interest to show your total out-of-pocket expense. Most importantly, the interest saved metric quantifies the exact financial reward you earn by making extra payments, proving mathematically that accelerating debt repayment is one of the most effective investments you can make.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your remaining balance is the starting point of the calculation; the larger the balance, the heavier the initial interest burden. The annual interest rate dictates the speed at which your debt grows; high-interest debt compounds viciously and must be aggressively managed. Your minimum payment is the contractual obligation required to avoid default. If you only pay the minimum, you surrender maximum profit to the lender. 
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
              <p className="text-muted-foreground leading-relaxed">
                The advanced options section unlocks the ability to model complex debt repayment strategies. You can input extra monthly payments to simulate an aggressive payoff plan. You can also model a one-time extra payment, such as a tax refund or work bonus, to instantly slice off months of future interest. Finally, the annual extra payment feature allows you to simulate making thirteen payments a year instead of twelve, a highly effective strategy for accelerating payoff without severely impacting your monthly budget.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
              <p className="text-muted-foreground leading-relaxed">
                Consider a twenty-five thousand dollar auto loan at a six point five percent interest rate with a standard minimum payment of three hundred and fifty dollars. If you simply pay the minimum, it will take you over seven years to pay off the vehicle, and you will surrender over five thousand dollars in pure interest. However, if you commit to adding an extra one hundred and fifty dollars to your payment every single month, you will completely eliminate the debt in just under five years, saving nearly two thousand dollars in interest charges. This clearly demonstrates the massive mathematical advantage of aggressive repayment.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
              <p className="text-muted-foreground leading-relaxed">
                Always establish a foundational emergency fund before aggressively paying down debt to ensure you aren't forced to borrow again during an unexpected crisis. Prioritize your highest interest debt first, commonly known as the debt avalanche method, as this mathematically guarantees the highest amount of interest saved. Ensure that your lender applies all extra payments directly to the principal balance rather than advancing your next payment due date. Finally, whenever you receive a windfall—such as a tax return, inheritance, or performance bonus—immediately apply a significant portion of it directly to your highest interest loan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Benefits</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mastering your debt repayment strategy transforms you from a passive borrower into an active wealth builder. Visualizing the exact month your debt will be eliminated provides intense psychological motivation. By accurately projecting the interest savings of extra payments, you can treat debt repayment as a guaranteed, tax-free return on investment. This calculator empowers you to reclaim your monthly cash flow, minimize the profit you surrender to financial institutions, and aggressively accelerate your path to total financial independence.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-payoff-calculator" />
          <PopularCalculators exclude="/calculator/loan-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
