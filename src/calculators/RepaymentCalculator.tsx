"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface RepaymentInputs {
  loanBalance: number;
  interestRate: number;
  remainingTermYears: number;
  extraMonthlyPayment: number;
  extraYearlyPayment: number;
  oneTimeLumpSum: number;
  lumpSumMonthStart: number;
}

interface RepaymentResults {
  standardMonthlyPayment: number;
  newAverageMonthlyPayment: number;
  
  standardTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;

  standardMonthsToPayoff: number;
  newMonthsToPayoff: number;
  monthsSaved: number;

  chartData: { month: number; standardBalance: number; newBalance: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  
  yearlyRows: AmortRow[]; // Showing the new accelerated schedule
}

// 2. Pure Calculation Function
const calculateRepayment = (inputs: RepaymentInputs): RepaymentResults => {
  const {
    loanBalance,
    interestRate,
    remainingTermYears,
    extraMonthlyPayment,
    extraYearlyPayment,
    oneTimeLumpSum,
    lumpSumMonthStart
  } = inputs;

  const monthlyRate = interestRate / 100 / 12;
  const standardMonthsToPayoff = remainingTermYears * 12;

  // Calculate Standard Monthly Payment
  let standardMonthlyPayment = 0;
  if (loanBalance > 0) {
    if (monthlyRate > 0) {
      standardMonthlyPayment = (loanBalance * monthlyRate * Math.pow(1 + monthlyRate, standardMonthsToPayoff)) / (Math.pow(1 + monthlyRate, standardMonthsToPayoff) - 1);
    } else {
      standardMonthlyPayment = loanBalance / standardMonthsToPayoff;
    }
  }

  // Simulate Standard Amortization (Baseline)
  let stdBalance = loanBalance;
  let stdTotalInterest = 0;
  const standardBalances: number[] = [loanBalance];

  for (let m = 1; m <= standardMonthsToPayoff && stdBalance > 0.01; m++) {
    const interest = stdBalance * monthlyRate;
    stdTotalInterest += interest;
    let principal = standardMonthlyPayment - interest;
    if (principal > stdBalance) principal = stdBalance;
    stdBalance -= principal;
    standardBalances.push(Math.max(0, stdBalance));
  }

  // Simulate Accelerated Amortization
  let newBalance = loanBalance;
  let newTotalInterest = 0;
  let newMonthsToPayoff = 0;
  const newBalances: number[] = [loanBalance];
  const yearlyRows: AmortRow[] = [];
  
  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let m = 1; m <= standardMonthsToPayoff && newBalance > 0.01; m++) {
    const interest = newBalance * monthlyRate;
    newTotalInterest += interest;
    currentYearInterest += interest;

    let totalPaymentThisMonth = standardMonthlyPayment + extraMonthlyPayment;
    
    if (m % 12 === 0) {
      totalPaymentThisMonth += extraYearlyPayment;
    }
    if (m === lumpSumMonthStart) {
      totalPaymentThisMonth += oneTimeLumpSum;
    }

    let principal = totalPaymentThisMonth - interest;
    
    // Final payment adjustment
    if (principal > newBalance) {
      principal = newBalance;
      totalPaymentThisMonth = principal + interest;
    }
    
    newBalance -= principal;
    currentYearPrincipal += principal;
    currentYearPayment += totalPaymentThisMonth;
    
    newBalances.push(Math.max(0, newBalance));
    newMonthsToPayoff = m;

    if (m % 12 === 0 || newBalance <= 0.01) {
       yearlyRows.push({
         period: Math.ceil(m / 12),
         payment: currentYearPayment,
         principal: currentYearPrincipal,
         interest: currentYearInterest,
         balance: Math.max(0, newBalance)
       });
       currentYearInterest = 0;
       currentYearPrincipal = 0;
       currentYearPayment = 0;
    }
  }

  const interestSaved = Math.max(0, stdTotalInterest - newTotalInterest);
  const monthsSaved = Math.max(0, standardMonthsToPayoff - newMonthsToPayoff);

  // Generate Chart Data (Sampling every few months to keep chart performant)
  const chartData = [];
  const step = Math.max(1, Math.floor(standardMonthsToPayoff / 50));
  for (let i = 0; i <= standardMonthsToPayoff; i += step) {
    chartData.push({
      month: i,
      standardBalance: standardBalances[i] || 0,
      newBalance: newBalances[i] || 0
    });
  }
  // Ensure last point is captured
  if (chartData[chartData.length - 1].month !== standardMonthsToPayoff) {
    chartData.push({
      month: standardMonthsToPayoff,
      standardBalance: 0,
      newBalance: 0
    });
  }

  const summaryStats = [
    { label: "Standard Monthly Payment", value: `$${standardMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Original Loan Term", value: `${Math.floor(standardMonthsToPayoff / 12)}y ${standardMonthsToPayoff % 12}m` },
    { label: "Accelerated Payoff Time", value: `${Math.floor(newMonthsToPayoff / 12)}y ${newMonthsToPayoff % 12}m` },
    { label: "Standard Total Interest", value: `$${stdTotalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "New Total Interest", value: `$${newTotalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Current Loan Balance", amount: `$${loanBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Standard Total Interest", amount: `$${stdTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Accelerated Total Interest", amount: `$${newTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Total Cash Saved", amount: `$${interestSaved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500" }
  ];

  return {
    standardMonthlyPayment,
    newAverageMonthlyPayment: standardMonthlyPayment + extraMonthlyPayment,
    standardTotalInterest: stdTotalInterest,
    newTotalInterest,
    interestSaved,
    standardMonthsToPayoff,
    newMonthsToPayoff,
    monthsSaved,
    chartData,
    summaryStats,
    breakdown,
    yearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  loanBalance: "250000",
  interestRate: "6.5",
  remainingTermYears: "30",
  extraMonthlyPayment: "200",
  extraYearlyPayment: "0",
  oneTimeLumpSum: "0",
  lumpSumMonthStart: "1"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-1">Month {label} ({Math.floor(label/12)}y {label%12}m)</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: ${entry.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        ))}
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

export default function RepaymentCalculator() {
  // 4. Component State
  const [loanBalance, setLoanBalance] = useState(DEFAULTS.loanBalance);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [remainingTermYears, setRemainingTermYears] = useState(DEFAULTS.remainingTermYears);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(DEFAULTS.extraMonthlyPayment);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [extraYearlyPayment, setExtraYearlyPayment] = useState(DEFAULTS.extraYearlyPayment);
  const [oneTimeLumpSum, setOneTimeLumpSum] = useState(DEFAULTS.oneTimeLumpSum);
  const [lumpSumMonthStart, setLumpSumMonthStart] = useState(DEFAULTS.lumpSumMonthStart);

  const [results, setResults] = useState<RepaymentResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: RepaymentInputs = {
      loanBalance: parseFloat(loanBalance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      remainingTermYears: parseFloat(remainingTermYears) || 0,
      extraMonthlyPayment: parseFloat(extraMonthlyPayment) || 0,
      extraYearlyPayment: parseFloat(extraYearlyPayment) || 0,
      oneTimeLumpSum: parseFloat(oneTimeLumpSum) || 0,
      lumpSumMonthStart: parseFloat(lumpSumMonthStart) || 1
    };
    setResults(calculateRepayment(inputs));
  };

  const handleReset = () => {
    setLoanBalance(DEFAULTS.loanBalance);
    setInterestRate(DEFAULTS.interestRate);
    setRemainingTermYears(DEFAULTS.remainingTermYears);
    setExtraMonthlyPayment(DEFAULTS.extraMonthlyPayment);
    setExtraYearlyPayment(DEFAULTS.extraYearlyPayment);
    setOneTimeLumpSum(DEFAULTS.oneTimeLumpSum);
    setLumpSumMonthStart(DEFAULTS.lumpSumMonthStart);
    setShowAdvanced(false);
    
    setResults(calculateRepayment({
      loanBalance: parseFloat(DEFAULTS.loanBalance),
      interestRate: parseFloat(DEFAULTS.interestRate),
      remainingTermYears: parseFloat(DEFAULTS.remainingTermYears),
      extraMonthlyPayment: parseFloat(DEFAULTS.extraMonthlyPayment),
      extraYearlyPayment: parseFloat(DEFAULTS.extraYearlyPayment),
      oneTimeLumpSum: parseFloat(DEFAULTS.oneTimeLumpSum),
      lumpSumMonthStart: parseFloat(DEFAULTS.lumpSumMonthStart)
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
    w.document.write(`<html><head><title>Accelerated Repayment Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How does making extra payments save me money?", answer: "When you make a standard payment, a large portion goes toward interest, and only a fraction reduces your actual debt (the principal). Any extra payment you make goes 100% toward the principal balance. By shrinking the principal faster, the bank has a smaller number to calculate your interest on the following month, saving you money exponentially." },
    { question: "Should I pay extra monthly or a yearly lump sum?", answer: "Mathematically, paying a little extra every month is slightly more efficient than paying one large lump sum at the end of the year. This is because reducing the balance earlier prevents months of interest from compounding. However, any extra payment strategy is vastly better than no strategy." },
    { question: "Are there penalties for paying off a loan early?", answer: "Many standard mortgages and student loans do not have prepayment penalties. However, some auto loans, personal loans, and commercial mortgages do charge a 'Prepayment Penalty' (often 2-4% of the balance) to recoup the interest the bank loses if you pay off early. Always read your loan contract." },
    { question: "Does paying extra lower my required monthly payment?", answer: "Usually, no. Making extra payments shortens the term of your loan (how many years you pay), but the bank still expects your required minimum monthly payment next month. The only way to lower the actual required monthly payment is to 'Recast' or 'Refinance' the loan." },
    { question: "Should I pay off my mortgage or invest the extra cash?", answer: "This is a classic 'Return on Investment' (ROI) question. If your mortgage rate is 7%, paying it down early is essentially a guaranteed, risk-free 7% return on your money. If your mortgage rate is 3%, and you believe you can earn 8% in an index fund, investing the cash will technically make you wealthier in the long run. However, the emotional security of a paid-off house is also valuable." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Repayment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Repayment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="bal" label="Current Loan Balance" value={loanBalance} onChange={setLoanBalance} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Remaining Term" value={remainingTermYears} onChange={setRemainingTermYears} suffix="years" />
              <CompactInput id="extra" label="Extra Monthly Pmt" value={extraMonthlyPayment} onChange={setExtraMonthlyPayment} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Lump Sums & Yearly Extras <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="yearly" label="Extra Yearly Pmt" value={extraYearlyPayment} onChange={setExtraYearlyPayment} prefix="$" />
                  <div className="col-span-2 grid grid-cols-2 gap-3 mt-2 border-t border-border pt-4">
                    <CompactInput id="lump" label="One-Time Lump Sum" value={oneTimeLumpSum} onChange={setOneTimeLumpSum} prefix="$" />
                    <CompactInput id="lump-month" label="Paid in Month #" value={lumpSumMonthStart} onChange={setLumpSumMonthStart} />
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
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-emerald-600 transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Interest Saved</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.interestSaved.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">By aggressively paying down the principal.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Time Saved</div>
                    <div className="text-lg font-bold text-primary">{Math.floor(results.monthsSaved / 12)}y {results.monthsSaved % 12}m</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">New Payoff Time</div>
                    <div className="text-lg font-bold text-emerald-600">{Math.floor(results.newMonthsToPayoff / 12)}y {results.newMonthsToPayoff % 12}m</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">New Total Interest</div>
                    <div className="text-lg font-bold">${results.newTotalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Financial Impact</h3>
                    <table className="w-full text-base">
                      <tbody>
                        {results.breakdown.map((row, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${row.isTotal ? "font-bold border-t-2 border-border" : ""}`}>
                            <td className="py-2.5">
                              <span className="flex items-center gap-2">
                                {!row.isTotal && <span className={`w-2.5 h-2.5 rounded-full bg-current ${row.colorClass}`} />}
                                <span className={row.isTotal ? row.colorClass : ""}>{row.label}</span>
                              </span>
                            </td>
                            <td className={`py-2.5 text-right ${row.isTotal ? row.colorClass : ""}`}>{row.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Area Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Balance Over Time</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val/12)}y`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="standardBalance" name="Standard Schedule" stroke="#f59e0b" fillOpacity={1} fill="url(#colorStandard)" strokeWidth={2} />
                        <Area type="monotone" dataKey="newBalance" name="Accelerated Schedule" stroke="#10b981" fillOpacity={1} fill="url(#colorNew)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Repayment Summary</h3>
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
                    <h3 className="text-base font-bold">Accelerated Amortization (Yearly)</h3>
                  </div>
                  <AmortizationTable rows={results.yearlyRows} yearly={true} />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Loan Repayment Calculator</h2>
            <p>Amortized debt—such as mortgages, auto loans, and student loans—is mathematically structured to extract the maximum amount of interest from you during the early years of the loan. This front-loaded interest model ensures that bank profits are secured early, while the borrower sees agonizingly slow progress in reducing their actual debt balance. Our <strong>Loan Repayment Calculator</strong> (often called an Early Payoff Calculator) is the ultimate tool for breaking this cycle. By simulating extra monthly, yearly, or lump-sum payments, you can instantly visualize how applying small amounts of excess cash directly against your principal can shave years off your loan term and save you tens of thousands of dollars.</p>
            <p>If you blindly make the minimum required payment every month, you are opting into the most expensive version of your loan. This calculator empowers you to take control of your amortization schedule, allowing you to model aggressive payoff strategies and achieve financial freedom years ahead of schedule.</p>

            <h2 className="text-2xl font-bold mb-3">The Mechanics of Amortization and Extra Payments</h2>
            <p>To understand why extra payments are so powerful, you must understand how your monthly required payment is processed by the bank. When you send your $2,000 monthly mortgage payment, the bank first calculates the interest generated by your massive principal balance over the last 30 days. Let's say that interest is $1,500. The bank takes $1,500 as their profit. The remaining $500 is applied to your principal. It feels like you are making no progress because you aren't.</p>
            <p><strong>The Magic of the Principal Reduction:</strong> If you add just $200 extra to that monthly payment, the bank has already taken their $1,500 interest cut from the mandatory payment. Therefore, by law, that extra $200 must go 100% toward the principal balance. The next month, the bank calculates interest on a smaller principal number. Your interest charge drops to $1,498. The snowball effect has begun. Every subsequent extra payment accelerates this process exponentially.</p>

            <h2 className="text-2xl font-bold mb-3">Analyzing Your Calculator Results</h2>
            <p>Our Repayment Calculator generates a dual-scenario analysis comparing the bank's standard timeline with your new, accelerated timeline. Here is how to interpret the most important metrics:</p>
            <p><strong>Total Interest Saved:</strong> This is the headline number and represents the exact amount of cash you kept out of the bank's pockets and in your own. By looking at this number, you can determine if the sacrifice of paying extra every month is yielding a high enough return.</p>
            <p><strong>Time Saved (Years/Months):</strong> This metric shows exactly how much faster you will own your asset outright. Shaving 7 years off a 30-year mortgage means 7 years where you have no mortgage payment at all—creating massive cash flow for retirement or investing.</p>
            <p><strong>Balance Over Time (Area Chart):</strong> This visual representation is crucial for understanding the compounding effect. The orange curve represents the slow, agonizing standard amortization. The green curve represents your accelerated strategy. Notice how the green curve steepens over time as the compounding principal reduction takes over.</p>

            <h2 className="text-2xl font-bold mb-3">Strategic Options for Accelerated Payoff</h2>
            <p>Borrowers have different cash flows, so our calculator supports three distinct strategies for early payoff:</p>
            <p><strong>1. Extra Monthly Payments:</strong> This is the most consistent and mathematically efficient strategy. By automating an extra $100 or $500 every single month, you constantly attack the principal balance, preventing interest from compounding over 30 days.</p>
            <p><strong>2. Extra Yearly Payments:</strong> If you receive an annual corporate bonus or a large tax refund, applying it as a single yearly extra payment is a highly effective strategy. Many financial advisors recommend making "13 payments a year" (one extra full payment annually) as a painless way to shave roughly 4 to 5 years off a 30-year mortgage.</p>
            <p><strong>3. One-Time Lump Sums:</strong> If you receive an inheritance, sell a vehicle, or liquidate an investment, applying a massive lump sum immediately cripples the loan's ability to generate interest. Our calculator allows you to specify exactly which month this lump sum occurs to accurately model the downstream interest savings.</p>

            <h2 className="text-2xl font-bold mb-3">When NOT to Pay Off Your Loan Early</h2>
            <p>While seeing a massive "Interest Saved" number is emotionally satisfying, aggressively paying down debt is not always the optimal financial decision. You must consider the "Opportunity Cost" of your cash.</p>
            <p>If you secured a 30-year mortgage during a period of historically low rates (e.g., 2.75%), rushing to pay it off is generally a poor mathematical choice. Why? Because you could take that extra $500 a month and invest it in a broad market index fund that historically returns 7% to 10% annually. Your money grows faster in the market (8%) than the interest accumulates on the house (2.75%). You are capturing the "spread."</p>
            <p>Conversely, if you have a car loan at 9% or a personal loan at 14%, paying those off aggressively is an absolute necessity. There is no safe investment that will guarantee a 14% return, making early payoff the clear winner.</p>

            <h2 className="text-2xl font-bold mb-3">Beware of Prepayment Penalties</h2>
            <p>Banks do not like it when you pay off your loan early because it disrupts their profit projections. To combat this, some lenders include a "Prepayment Penalty" clause in the loan contract.</p>
            <p>If you have a prepayment penalty, the bank will charge you a fee (often 2% to 4% of the remaining balance or a set number of months' interest) if you pay off the loan before the term ends. Standard conventional mortgages and federal student loans rarely have these penalties, but private student loans, auto loans, and commercial mortgages frequently do. You must read your loan contract to ensure your interest savings are not wiped out by a massive penalty fee.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples of Debt Acceleration</h2>
            <p><strong>Example 1: The Auto Loan Trap.</strong> You finance a $40,000 car at 8% for 72 months (6 years). Your required payment is $701. If you pay the minimum, you will pay over $10,000 in interest. However, you decide to treat it like a 48-month loan and pay an extra $250 every month. You pay off the car two years early and save $3,800 in interest, preventing you from being "upside down" (owing more than the car is worth) during those final years.</p>
            <p><strong>Example 2: The Mortgage Freedom Plan.</strong> You have a $300,000 mortgage at 6.5% for 30 years. The standard monthly payment is $1,896. The total interest over 30 years is a staggering $382,000. You automate an extra $300 a month toward principal. The loan is paid off in just over 20 years, saving you 10 years of payments and eliminating $146,000 in interest charges.</p>

            <h2 className="text-2xl font-bold mb-3">Tips and Best Practices for Repayment</h2>
            <p><strong>Specify "Principal Only":</strong> This is a critical administrative step. When you send an extra payment to your mortgage servicer or auto lender, you must explicitly instruct them to apply it as "Principal Only." If you do not, many predatory lenders will simply apply it as an "early payment" for the next month, meaning it still pays interest and does not accelerate your payoff timeline.</p>
            <p><strong>Build an Emergency Fund First:</strong> Never aggressively pay down low-interest debt if you do not have 3 to 6 months of living expenses saved in cash. If you pour all your cash into paying down your mortgage, and then lose your job, you cannot easily access that equity to buy groceries. Cash liquidity must be secured before debt acceleration begins.</p>
            <p><strong>Understand Recasting vs. Refinancing:</strong> Making extra payments shortens your loan term, but it <em>does not lower your required monthly payment</em>. If you make a massive lump sum payment and want your required monthly bill to drop, you must ask the lender to "Recast" the loan (recalculate the payment based on the new, lower balance) or you must Refinance the loan entirely.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>Amortized debt is designed to test your patience and extract your wealth. But it is governed by strict mathematics, and mathematics can be manipulated to your advantage.</p>
            <p>By rigorously utilizing this Loan Repayment Calculator, you take control of your financial timeline. Visualizing the massive impact of extra payments turns an abstract 30-year commitment into a tangible, beatable game. Whether your goal is to save thousands in interest, free up cash flow, or achieve the peace of mind of being completely debt-free, a strategic, accelerated repayment plan is the fastest path to realizing that goal.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/repayment-calculator" />
          <PopularCalculators exclude="/calculator/repayment-calculator" />
        </div>
      </div>
    </>
  );
}
