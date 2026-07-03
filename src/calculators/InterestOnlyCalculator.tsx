"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Landmark } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface InterestOnlyInputs {
  loanAmount: number;
  interestRate: number;
  ioTermYears: number;
  totalLoanTermYears: number;
}

interface InterestOnlyResults {
  ioMonthlyPayment: number;
  amortizedMonthlyPayment: number;
  paymentJumpAmount: number;
  paymentJumpPercentage: number;
  
  ioPhaseTotalInterest: number;
  amortizedPhaseTotalInterest: number;
  grandTotalInterest: number;
  grandTotalCost: number;

  standardMonthlyPayment: number;
  standardTotalInterest: number;
  extraInterestPaidDueToIO: number;

  chartData: { month: number; standardPayment: number; ioPayment: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  
  yearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateInterestOnly = (inputs: InterestOnlyInputs): InterestOnlyResults => {
  const {
    loanAmount,
    interestRate,
    ioTermYears,
    totalLoanTermYears
  } = inputs;

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = totalLoanTermYears * 12;
  const ioMonths = ioTermYears * 12;
  const amortizedMonths = totalMonths - ioMonths;

  // 1. Phase 1: Interest Only
  const ioMonthlyPayment = loanAmount * monthlyRate;
  const ioPhaseTotalInterest = ioMonthlyPayment * ioMonths;

  // 2. Phase 2: Amortization (Recast over remaining term)
  let amortizedMonthlyPayment = 0;
  if (loanAmount > 0 && amortizedMonths > 0) {
    if (monthlyRate > 0) {
      amortizedMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, amortizedMonths)) / (Math.pow(1 + monthlyRate, amortizedMonths) - 1);
    } else {
      amortizedMonthlyPayment = loanAmount / amortizedMonths;
    }
  }
  
  const amortizedPhaseTotalPaid = amortizedMonthlyPayment * amortizedMonths;
  const amortizedPhaseTotalInterest = amortizedPhaseTotalPaid - loanAmount;

  const paymentJumpAmount = amortizedMonthlyPayment - ioMonthlyPayment;
  const paymentJumpPercentage = ioMonthlyPayment > 0 ? (paymentJumpAmount / ioMonthlyPayment) * 100 : 0;

  const grandTotalInterest = ioPhaseTotalInterest + amortizedPhaseTotalInterest;
  const grandTotalCost = loanAmount + grandTotalInterest;

  // 3. Comparison: Standard 30-Year Fixed (No IO phase)
  let standardMonthlyPayment = 0;
  if (loanAmount > 0 && totalMonths > 0) {
    if (monthlyRate > 0) {
      standardMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      standardMonthlyPayment = loanAmount / totalMonths;
    }
  }
  const standardTotalInterest = (standardMonthlyPayment * totalMonths) - loanAmount;
  const extraInterestPaidDueToIO = Math.max(0, grandTotalInterest - standardTotalInterest);

  // 4. Generate Amortization Table (Yearly) and Chart Data
  const yearlyRows: AmortRow[] = [];
  const chartData = [];
  
  let currentBalance = loanAmount;
  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const isIOPhase = m <= ioMonths;
    const payment = isIOPhase ? ioMonthlyPayment : amortizedMonthlyPayment;
    const interest = currentBalance * monthlyRate;
    let principal = payment - interest;
    
    if (isIOPhase) principal = 0; // Force zero principal in IO phase to prevent rounding drift
    
    if (principal > currentBalance) principal = currentBalance;
    currentBalance -= principal;

    currentYearInterest += interest;
    currentYearPrincipal += principal;
    currentYearPayment += payment;

    // Capture chart data at start of year to show the "step" jump clearly
    if (m === 1 || m % 12 === 1 || m === ioMonths + 1) {
      chartData.push({
        month: m,
        standardPayment: standardMonthlyPayment,
        ioPayment: payment
      });
    }

    if (m % 12 === 0 || m === totalMonths) {
       yearlyRows.push({
         period: Math.ceil(m / 12),
         payment: currentYearPayment,
         principal: currentYearPrincipal,
         interest: currentYearInterest,
         balance: Math.max(0, currentBalance)
       });
       currentYearInterest = 0;
       currentYearPrincipal = 0;
       currentYearPayment = 0;
    }
  }

  // Ensure last point is on the chart
  chartData.push({
    month: totalMonths,
    standardPayment: standardMonthlyPayment,
    ioPayment: amortizedMonthlyPayment
  });

  const summaryStats = [
    { label: "Interest-Only Phase", value: `${ioTermYears} Years` },
    { label: "Amortization Phase", value: `${totalLoanTermYears - ioTermYears} Years` },
    { label: "Standard Monthly", value: `$${standardMonthlyPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Standard Total Interest", value: `$${standardTotalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "I.O. Total Interest", value: `$${grandTotalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Penalty for I.O.", value: `+$${extraInterestPaidDueToIO.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }
  ];

  const breakdown = [
    { label: "Phase 1: Total Interest Paid", amount: `$${ioPhaseTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Phase 2: Total Interest Paid", amount: `$${amortizedPhaseTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Grand Total Interest", amount: `$${grandTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Total Loan Financed", amount: `$${loanAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Grand Total Cost of Loan", amount: `$${grandTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true }
  ];

  return {
    ioMonthlyPayment,
    amortizedMonthlyPayment,
    paymentJumpAmount,
    paymentJumpPercentage,
    ioPhaseTotalInterest,
    amortizedPhaseTotalInterest,
    grandTotalInterest,
    grandTotalCost,
    standardMonthlyPayment,
    standardTotalInterest,
    extraInterestPaidDueToIO,
    chartData,
    summaryStats,
    breakdown,
    yearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  loanAmount: "400000",
  interestRate: "6.5",
  ioTermYears: "10",
  totalLoanTermYears: "30"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-1">Year {Math.floor(label/12)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: ${entry.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo
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

export default function InterestOnlyCalculator() {
  // 4. Component State
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [ioTermYears, setIoTermYears] = useState(DEFAULTS.ioTermYears);
  const [totalLoanTermYears, setTotalLoanTermYears] = useState(DEFAULTS.totalLoanTermYears);

  const [results, setResults] = useState<InterestOnlyResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: InterestOnlyInputs = {
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      ioTermYears: parseFloat(ioTermYears) || 0,
      totalLoanTermYears: parseFloat(totalLoanTermYears) || 0
    };
    setResults(calculateInterestOnly(inputs));
  };

  const handleReset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setIoTermYears(DEFAULTS.ioTermYears);
    setTotalLoanTermYears(DEFAULTS.totalLoanTermYears);
    
    setResults(calculateInterestOnly({
      loanAmount: parseFloat(DEFAULTS.loanAmount),
      interestRate: parseFloat(DEFAULTS.interestRate),
      ioTermYears: parseFloat(DEFAULTS.ioTermYears),
      totalLoanTermYears: parseFloat(DEFAULTS.totalLoanTermYears)
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
    w.document.write(`<html><head><title>Interest-Only Mortgage Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is an Interest-Only Mortgage?", answer: "An Interest-Only (IO) mortgage is a loan structure where the borrower is only required to pay the interest generated by the principal balance for an initial set period (usually 5 to 10 years). During this phase, the principal balance does not decrease." },
    { question: "What happens when the Interest-Only period ends?", answer: "This is known as the 'Recast'. Once the IO period ends, the loan enters the Amortization phase. You must now begin paying off the entire original principal balance, but over a much shorter timeframe (e.g., 20 years instead of 30). This causes a massive, unavoidable increase in your monthly payment." },
    { question: "Why do people get Interest-Only loans?", answer: "They are typically used by wealthy buyers with irregular, bonus-heavy income, or by real estate investors who plan to sell or flip the property before the IO period ends. They are generally not recommended for standard, long-term homeowners." },
    { question: "Can I pay down the principal during the IO phase?", answer: "Yes. While you are only required to pay interest, most IO loans allow you to make extra payments directly toward the principal. Doing so will lower your monthly interest payment the following month, as the interest is calculated on a smaller balance." },
    { question: "Is an Interest-Only loan cheaper than a standard mortgage?", answer: "No. It is significantly more expensive. Because you delay paying down the principal for a decade, the bank charges you interest on a massive balance for much longer. Our calculator shows exactly how much extra 'Penalty Interest' an IO loan generates compared to a standard 30-year fixed." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Interest-Only Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Interest-Only Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="amt" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="io-term" label="Interest-Only Period" value={ioTermYears} onChange={setIoTermYears} suffix="years" />
              <CompactInput id="term" label="Total Loan Term" value={totalLoanTermYears} onChange={setTotalLoanTermYears} suffix="years" />
            </div>

            <div className="flex gap-3 mt-4">
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
                
                {/* 1. Dual Phase Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5">
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Phase 1: Interest Only</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">${results.ioMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-base text-muted-foreground">/mo</span></div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">For the first {ioTermYears} years.</div>
                  </div>

                  <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                    <div className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">Phase 2: Recast Amortized</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">${results.amortizedMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-base text-muted-foreground">/mo</span></div>
                    <div className="text-xs text-destructive mt-1 font-bold">Payment jumps +{results.paymentJumpPercentage.toFixed(0)}%</div>
                  </div>
                </div>

                {/* 2. Standard Comparison Bar */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <div className="text-sm font-bold text-foreground">Standard 30-Year Fixed Payment</div>
                    <div className="text-xs text-muted-foreground">No IO Phase. For comparison.</div>
                  </div>
                  <div className="text-xl font-bold text-primary">
                    ${results.standardMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Monthly Payment Comparison</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIO" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val/12)}y`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <YAxis tickFormatter={(val) => `$${(val).toFixed(0)}`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area type="stepAfter" dataKey="standardPayment" name="Standard 30Y Fixed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStd)" strokeWidth={2} />
                        <Area type="stepAfter" dataKey="ioPayment" name="Interest-Only Structure" stroke="#ef4444" fillOpacity={1} fill="url(#colorIO)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {results.summaryStats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 sm:[&:nth-last-child(1)]:border-0 sm:[&:nth-last-child(2)]:border-0">
                        <span className="text-muted-foreground">{stat.label}:</span>
                        <span className={`font-semibold ${stat.label.includes('Penalty') ? 'text-destructive' : ''}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-5 border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Amortization Schedule (Yearly)</h3>
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
            <h2>Understanding the Interest-Only Mortgage Calculator</h2>
            <p>An Interest-Only (IO) mortgage is one of the most misunderstood and potentially hazardous financial products in real estate. While it offers the allure of drastically lower initial monthly payments, the mechanics behind those low payments can lead to severe financial distress if not properly managed. Our <strong>Interest-Only Mortgage Calculator</strong> is designed to mathematically reveal the two distinct phases of this loan, highlight the exact moment of "payment shock," and calculate the massive long-term interest penalty you pay for deferring your principal payments.</p>
            <p>Standard mortgage calculators assume you are paying down your debt from day one. An IO calculator correctly models the timeline, ensuring that for the first 5 to 10 years, your debt balance remains frozen. By visualizing the massive payment jump that occurs when the loan recasts, you can make an informed decision on whether this advanced lending tool fits your long-term financial strategy.</p>

            <h2>The Mechanics: Phase 1 (The Interest-Only Period)</h2>
            <p>When you take out a standard 30-year fixed mortgage, every monthly payment is split into two buckets: Interest (the bank's profit) and Principal (paying down your actual debt). </p>
            <p>In an Interest-Only mortgage, the "Principal" bucket is completely removed for a set introductory period—usually 7 or 10 years. During Phase 1, the bank only requires you to pay the interest generated by your loan balance. Because you are not paying off any debt, your monthly payment is significantly lower.</p>
            <p><strong>The Catch:</strong> While your cash flow improves, your equity stagnates. If you borrow $500,000, you will make monthly payments for 10 straight years. On day one of year 11, you will still owe the bank exactly $500,000. If the real estate market crashes during this decade, you could find yourself "underwater," owing more to the bank than your house is worth, making it nearly impossible to sell or refinance.</p>

            <h2>The Mechanics: Phase 2 (The Recast and Payment Shock)</h2>
            <p>An Interest-Only period does not last forever. Eventually, the bank wants its original $500,000 back. This triggers "Phase 2," also known as the Recast.</p>
            <p>At the end of the 10-year IO period, the loan converts into a fully amortizing mortgage. But there is a massive mathematical problem: You no longer have 30 years to pay off the $500,000. You only have 20 years left on the loan term. The bank must now force you to pay off the entire $500,000 principal in a compressed timeframe.</p>
            <p>This causes <strong>Payment Shock</strong>. Your monthly bill will instantly skyrocket—often jumping by 50% to 70% overnight. Many borrowers who were not financially prepared for this jump are forced into foreclosure because they cannot afford the newly amortized Phase 2 payment.</p>

            <h2>Analyzing Your Calculator Results</h2>
            <p>Our IO Calculator provides a side-by-side comparison of your loan's two phases, as well as a benchmark against a standard 30-year fixed mortgage. Here is how to interpret the data:</p>
            <p><strong>Phase 1 Payment vs. Phase 2 Payment:</strong> This is the most critical metric. You must look at the Phase 2 payment and ask yourself honestly: "Will I be able to afford this massive jump in 10 years?" If the answer is no, an IO mortgage is likely a dangerous gamble.</p>
            <p><strong>Interest Penalty for I.O.:</strong> This is the true cost of the loan. Because you deferred paying down the principal for a decade, the bank charged you interest on a $500,000 balance for 120 straight months. If you had taken a standard mortgage, that balance would have been dropping every month. This metric shows exactly how many tens of thousands of dollars extra you are paying over the life of the loan simply for the luxury of lower initial payments.</p>

            <h2>Who Should Actually Use an Interest-Only Loan?</h2>
            <p>Given the risks and the extra interest costs, why do these loans exist? They are specialized tools designed for specific borrower profiles, not for standard W-2 wage earners looking to buy a forever home.</p>
            <p><strong>1. Wealthy Borrowers with Irregular Income:</strong> An executive who receives a massive $300,000 corporate bonus once a year, but a relatively small monthly salary, might use an IO loan. They keep their mandatory monthly expenses low (IO phase), and when the annual bonus hits, they make a massive voluntary lump-sum payment against the principal.</p>
            <p><strong>2. Real Estate Flippers and Investors:</strong> An investor buys a distressed property, takes an IO loan to keep holding costs minimal, renovates the house, and sells it 8 months later. Because they sold the house, they never hit the Phase 2 Recast, and they maximized their cash flow during the renovation.</p>
            <p><strong>3. High-Net-Worth Individuals (Opportunity Cost):</strong> A borrower has $500,000 in cash but doesn't want to tie it up in a house. They take an IO loan at 5%, keeping their payment low. They take their $500,000 cash and invest it in the stock market, earning 9%. They are successfully executing an arbitrage strategy, leveraging cheap bank debt to generate higher market yields.</p>

            <h2>The 2008 Financial Crisis and IO Loans</h2>
            <p>Interest-Only loans (and their dangerous cousins, Option ARMs) played a massive role in the 2008 global financial crisis. Prior to 2008, banks handed IO loans to subprime borrowers who only qualified for the home based on the artificially low Phase 1 payment.</p>
            <p>These borrowers gambled that housing prices would go up forever, assuming they could just sell the house or refinance before Phase 2 hit. When housing prices crashed instead, they couldn't refinance because they had zero equity. When Phase 2 hit, the payment shock caused millions of defaults, triggering a cascade of foreclosures. Today, regulations (like the Ability-to-Repay rule) make IO loans much harder to get, heavily restricting them to qualified, high-net-worth individuals.</p>

            <h2>Tips and Best Practices</h2>
            <p><strong>Voluntary Principal Payments:</strong> Just because the bank doesn't <em>require</em> you to pay principal during Phase 1 doesn't mean you can't. If you have extra cash in month 4, send it to the bank and designate it as "Principal Only." Doing this will lower your interest payment the very next month and soften the blow of the Phase 2 recast.</p>
            <p><strong>Have an Exit Strategy:</strong> Never take an IO loan hoping you will simply figure it out in 10 years. You must have a concrete, bulletproof exit strategy before signing the paperwork. Will you sell the house in year 7? Will your business be sold in year 5? If your exit strategy fails, you must be prepared to absorb the Phase 2 payment shock.</p>
            <p><strong>Understand Adjustable-Rate IOs:</strong> Many IO loans are structured as ARMs (Adjustable Rate Mortgages). This makes them doubly dangerous. Not only will you face the Phase 2 principal recast, but if global interest rates rise, your interest rate could adjust upward at the exact same time, magnifying the payment shock.</p>

            <h2>Conclusion</h2>
            <p>An Interest-Only mortgage is a high-leverage financial tool. Like a chainsaw, it is incredibly effective for a skilled professional but highly dangerous for a novice. It offers unmatched cash flow flexibility in the short term, but extracts a massive toll in long-term interest and equity stagnation.</p>
            <p>By rigorously utilizing this Interest-Only Calculator, you can strip away the sales pitch and confront the mathematical reality of the Recast. Ensure that the opportunity cost of your capital justifies the extra interest you will pay, and never commit to an IO loan without a guaranteed strategy for handling the inevitable Phase 2 payment shock.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-only-calculator" />
          <PopularCalculators exclude="/calculator/interest-only-calculator" />
        </div>
      </div>
    </>
  );
}
