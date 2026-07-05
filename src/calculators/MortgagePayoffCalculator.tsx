"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Home } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface MortgagePayoffInputs {
  currentBalance: number;
  interestRate: number;
  currentMonthlyPayment: number;
  targetPayoffYears: number;
}

interface MortgagePayoffResults {
  requiredMonthlyPayment: number;
  extraMonthlyNeeded: number;
  
  currentTotalInterest: number;
  targetTotalInterest: number;
  interestSaved: number;

  currentMonthsToPayoff: number;
  targetMonthsToPayoff: number;
  monthsSaved: number;
  
  targetDateStr: string;

  chartData: { month: number; currentPath: number; targetPath: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  
  targetYearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateMortgagePayoff = (inputs: MortgagePayoffInputs): MortgagePayoffResults => {
  const {
    currentBalance,
    interestRate,
    currentMonthlyPayment,
    targetPayoffYears
  } = inputs;

  const monthlyRate = interestRate / 100 / 12;
  const targetMonthsToPayoff = targetPayoffYears * 12;

  // 1. Calculate Required Payment to Hit Target
  let requiredMonthlyPayment = 0;
  if (currentBalance > 0 && targetMonthsToPayoff > 0) {
    if (monthlyRate > 0) {
      requiredMonthlyPayment = (currentBalance * monthlyRate * Math.pow(1 + monthlyRate, targetMonthsToPayoff)) / (Math.pow(1 + monthlyRate, targetMonthsToPayoff) - 1);
    } else {
      requiredMonthlyPayment = currentBalance / targetMonthsToPayoff;
    }
  }

  // Ensure the required payment is physically possible. If they want to pay it off in 1 year, the required payment will be massive.
  const extraMonthlyNeeded = Math.max(0, requiredMonthlyPayment - currentMonthlyPayment);

  // 2. Simulate Current Path (Status Quo)
  let currentPathBalance = currentBalance;
  let currentTotalInterest = 0;
  let currentMonthsToPayoff = 0;
  const currentPathBalances: number[] = [currentBalance];

  // Prevent infinite loops if current payment is less than interest generated
  const interestOnCurrentBalance = currentBalance * monthlyRate;
  const isNegativeAmortization = currentMonthlyPayment <= interestOnCurrentBalance;

  if (isNegativeAmortization) {
    // If negative amortization, we max out at 600 months (50 years) as a warning
    currentMonthsToPayoff = 600;
    currentTotalInterest = 0; // Invalid
    for(let i=0; i<600; i++) currentPathBalances.push(currentBalance);
  } else {
    while (currentPathBalance > 0.01 && currentMonthsToPayoff < 600) {
      const interest = currentPathBalance * monthlyRate;
      currentTotalInterest += interest;
      let principal = currentMonthlyPayment - interest;
      if (principal > currentPathBalance) principal = currentPathBalance;
      currentPathBalance -= principal;
      currentMonthsToPayoff++;
      currentPathBalances.push(Math.max(0, currentPathBalance));
    }
  }

  // 3. Simulate Target Path
  let targetPathBalance = currentBalance;
  let targetTotalInterest = 0;
  const targetPathBalances: number[] = [currentBalance];
  const targetYearlyRows: AmortRow[] = [];
  
  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let m = 1; m <= targetMonthsToPayoff && targetPathBalance > 0.01; m++) {
    const interest = targetPathBalance * monthlyRate;
    targetTotalInterest += interest;
    let principal = requiredMonthlyPayment - interest;
    
    if (principal > targetPathBalance) principal = targetPathBalance;
    targetPathBalance -= principal;
    targetPathBalances.push(Math.max(0, targetPathBalance));

    currentYearInterest += interest;
    currentYearPrincipal += principal;
    currentYearPayment += (interest + principal);

    if (m % 12 === 0 || targetPathBalance <= 0.01) {
       targetYearlyRows.push({
         period: Math.ceil(m / 12),
         payment: currentYearPayment,
         principal: currentYearPrincipal,
         interest: currentYearInterest,
         balance: Math.max(0, targetPathBalance)
       });
       currentYearInterest = 0;
       currentYearPrincipal = 0;
       currentYearPayment = 0;
    }
  }

  const interestSaved = isNegativeAmortization ? 0 : Math.max(0, currentTotalInterest - targetTotalInterest);
  const monthsSaved = isNegativeAmortization ? 0 : Math.max(0, currentMonthsToPayoff - targetMonthsToPayoff);

  // 4. Generate Chart Data
  const chartData = [];
  const chartMaxMonths = isNegativeAmortization ? targetMonthsToPayoff + 120 : currentMonthsToPayoff;
  const step = Math.max(1, Math.floor(chartMaxMonths / 60));
  
  for (let i = 0; i <= chartMaxMonths; i += step) {
    chartData.push({
      month: i,
      currentPath: currentPathBalances[i] || 0,
      targetPath: targetPathBalances[i] || 0
    });
  }
  // Ensure last point
  if (chartData[chartData.length - 1].month !== chartMaxMonths) {
    chartData.push({
      month: chartMaxMonths,
      currentPath: 0,
      targetPath: 0
    });
  }

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + targetMonthsToPayoff);
  const targetDateStr = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const summaryStats = [
    { label: "Target Payoff Date", value: targetDateStr },
    { label: "Current Required Time", value: isNegativeAmortization ? "Never" : `${Math.floor(currentMonthsToPayoff / 12)}y ${currentMonthsToPayoff % 12}m` },
    { label: "Time Saved", value: isNegativeAmortization ? "N/A" : `${Math.floor(monthsSaved / 12)}y ${monthsSaved % 12}m` },
    { label: "Current Total Interest", value: isNegativeAmortization ? "Infinite" : `$${currentTotalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Target Total Interest", value: `$${targetTotalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Current Status Quo Interest", amount: isNegativeAmortization ? "Infinite" : `$${currentTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Target Strategy Interest", amount: `$${targetTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Total Wealth Saved", amount: isNegativeAmortization ? "N/A" : `$${interestSaved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500" }
  ];

  return {
    requiredMonthlyPayment,
    extraMonthlyNeeded,
    currentTotalInterest,
    targetTotalInterest,
    interestSaved,
    currentMonthsToPayoff,
    targetMonthsToPayoff,
    monthsSaved,
    targetDateStr,
    chartData,
    summaryStats,
    breakdown,
    targetYearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  currentBalance: "300000",
  interestRate: "6.5",
  currentMonthlyPayment: "1896",
  targetPayoffYears: "15"
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

export default function MortgagePayoffCalculator() {
  // 4. Component State
  const [currentBalance, setCurrentBalance] = useState(DEFAULTS.currentBalance);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState(DEFAULTS.currentMonthlyPayment);
  const [targetPayoffYears, setTargetPayoffYears] = useState(DEFAULTS.targetPayoffYears);

  const [results, setResults] = useState<MortgagePayoffResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: MortgagePayoffInputs = {
      currentBalance: parseFloat(currentBalance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      currentMonthlyPayment: parseFloat(currentMonthlyPayment) || 0,
      targetPayoffYears: parseFloat(targetPayoffYears) || 0
    };
    setResults(calculateMortgagePayoff(inputs));
  };

  const handleReset = () => {
    setCurrentBalance(DEFAULTS.currentBalance);
    setInterestRate(DEFAULTS.interestRate);
    setCurrentMonthlyPayment(DEFAULTS.currentMonthlyPayment);
    setTargetPayoffYears(DEFAULTS.targetPayoffYears);
    
    setResults(calculateMortgagePayoff({
      currentBalance: parseFloat(DEFAULTS.currentBalance),
      interestRate: parseFloat(DEFAULTS.interestRate),
      currentMonthlyPayment: parseFloat(DEFAULTS.currentMonthlyPayment),
      targetPayoffYears: parseFloat(DEFAULTS.targetPayoffYears)
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
    w.document.write(`<html><head><title>Mortgage Payoff Strategy</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How does reverse-engineering a payoff work?", answer: "Instead of guessing how much extra to pay and seeing when the loan ends, this calculator asks for your target date first. It then uses the amortization formula in reverse to calculate the exact, mandatory monthly cash flow required to zero out the balance by that precise month." },
    { question: "Why should I target a specific payoff date?", answer: "Financial planning requires concrete milestones. Most borrowers use this tool to synchronize their mortgage payoff with a major life event, such as retirement at age 65, or the month their oldest child begins college. Freeing up cash flow at these precise moments is critical." },
    { question: "Is paying extra better than refinancing to a 15-year term?", answer: "It depends. Refinancing to a 15-year mortgage mathematically locks you into a higher required monthly payment, but usually offers a lower interest rate. Simply paying extra on your current 30-year mortgage keeps your official required payment low (safer if you lose your job), but you don't get the benefit of the lower 15-year interest rate." },
    { question: "What happens if I stop making the extra payments?", answer: "Because the extra payments were voluntary, you can stop them at any time and revert to your original, lower monthly payment. However, the extra payments you already made permanently lowered your principal, meaning your loan will still end months or years earlier than originally planned." },
    { question: "Are there penalties for aggressive payoff?", answer: "In the United States, almost all modern residential mortgages (Conventional, FHA, VA) are legally barred from charging Prepayment Penalties. However, if you are calculating a commercial loan or a private hard-money loan, you must check your contract for penalty clauses before making massive extra payments." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Payoff Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Target Payoff Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="bal" label="Current Loan Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cur" label="Current Principal & Int." value={currentMonthlyPayment} onChange={setCurrentMonthlyPayment} prefix="$" />
              <CompactInput id="tar" label="Target Payoff In" value={targetPayoffYears} onChange={setTargetPayoffYears} suffix="years" />
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
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">New Target Payment</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.requiredMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-base text-muted-foreground">/mo</span></div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">To be completely debt-free by {results.targetDateStr}.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Extra Monthly</div>
                    <div className="text-lg font-bold text-destructive">+${results.extraMonthlyNeeded.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Wealth Saved</div>
                    <div className="text-lg font-bold text-emerald-600">${results.interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Time Saved</div>
                    <div className="text-lg font-bold text-primary">{Math.floor(results.monthsSaved / 12)}y {results.monthsSaved % 12}m</div>
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Trajectory Comparison</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCur" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorTar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val/12)}y`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="currentPath" name="Status Quo Balance" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCur)" strokeWidth={2} />
                        <Area type="monotone" dataKey="targetPath" name="Target Strategy Balance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTar)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
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
                    <h3 className="text-base font-bold">Target Amortization Schedule (Yearly)</h3>
                  </div>
                  <AmortizationTable rows={results.targetYearlyRows} yearly={true} />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Target Payoff Calculator</h2>
            <p>For most homeowners, the mortgage is a 30-year financial anchor. Standard amortization calculators are passive tools—they tell you what the bank requires you to do. Our <strong>Mortgage Payoff Calculator</strong> flips the script. It is an active, goal-oriented tool that allows you to dictate the timeline. Instead of asking "When will my loan end?", this calculator allows you to state "I want my loan to end in 10 years," and mathematically reverse-engineers the exact monthly payment required to make that goal a reality.</p>
            <p>By comparing your "Status Quo" trajectory against your "Target Strategy," you can visualize the massive disparity in wealth accumulation. While it requires financial discipline to funnel extra cash into your mortgage every month, seeing the tens of thousands of dollars in "Wealth Saved" provides the psychological motivation necessary to execute the plan and achieve ultimate financial freedom.</p>

            <h2 className="text-2xl font-bold mb-3">Why Target a Specific Payoff Date?</h2>
            <p>Aggressive debt reduction is rarely successful without a concrete, milestone-driven goal. The most successful financial plans sync the mortgage payoff with major life events where cash flow flexibility becomes critical.</p>
            <p><strong>Retirement Synchronization:</strong> The number one reason borrowers use this calculator is to ensure their mortgage hits zero the exact month they retire. Entering retirement (when you transition from W-2 income to fixed income/portfolio drawdowns) is exponentially less stressful if your largest monthly expense—housing—has been completely eliminated.</p>
            <p><strong>College Tuition Planning:</strong> If you have a child starting college in 8 years, you can set your "Target Payoff" to 8 years. By aggressively paying off the house before they enroll, the massive $2,000+ monthly cash flow previously dedicated to the mortgage can immediately be redirected to tuition payments, potentially allowing your child to graduate debt-free.</p>

            <h2 className="text-2xl font-bold mb-3">The Mechanics of Reverse Amortization</h2>
            <p>How does the calculator determine your required payment? It uses the standard amortization formula, but instead of solving for the 30-year term, it substitutes your "Target Payoff Years" into the equation.</p>
            <p>If you owe $300,000 at 6.5%, the bank's formula stretches that over 30 years to give you a $1,896 payment. If you tell our calculator you want to pay it off in 15 years, it forces the formula to compress the principal reduction into 180 months. The result is a required payment of $2,613. The calculator then subtracts your current payment from this new required payment to isolate the "Extra Monthly Needed" (+$717). This isolates exactly how much you need to cut from your current discretionary budget to achieve the goal.</p>

            <h2 className="text-2xl font-bold mb-3">Analyzing the Trajectory Comparison Chart</h2>
            <p>The Area Chart in this tool is designed to show the compounding effect of your target strategy. It plots your "Status Quo Balance" (the orange curve) against your "Target Strategy Balance" (the blue curve).</p>
            <p>Notice that in the first few years, the two curves are relatively close. However, as the years progress, the blue curve plummets toward zero at an accelerating rate. This is because every extra dollar you pay reduces the principal, which in turn reduces the interest charge the following month, freeing up even more of your payment to hit the principal. The widening gap between the orange and blue curves represents pure wealth that you are recapturing from the bank's profit margins.</p>

            <h2 className="text-2xl font-bold mb-3">The Opportunity Cost Debate: Pay Off vs. Invest</h2>
            <p>While seeing a massive "Wealth Saved" number is highly motivating, mathematically optimizing your finances requires understanding "Opportunity Cost." Should you aggressively pay down your mortgage, or should you invest that extra cash in the stock market?</p>
            <p><strong>The Mathematical Argument:</strong> If your mortgage interest rate is 3% (secured during the historic lows of 2020-2021), the mathematical argument strongly favors investing. Historically, broad market index funds (like the S&P 500) return an average of 7% to 10% annually. If you put your extra $700 a month into the market, you are earning ~8% while the bank is only charging you 3%. You are capturing a 5% "spread," which will make you significantly wealthier over 30 years.</p>
            <p><strong>The Risk-Free Return Argument:</strong> If your mortgage rate is 7% or 8% (standard for current markets), the decision flips. Paying extra on an 8% mortgage is effectively a guaranteed, risk-free, tax-free 8% return on your money. There is no safe investment in the world that guarantees an 8% yield. In high-rate environments, aggressively paying down debt is usually the mathematically superior choice.</p>

            <h2 className="text-2xl font-bold mb-3">The Dangers of Refinancing to a 15-Year Mortgage</h2>
            <p>A common mistake borrowers make when trying to accelerate their payoff is officially refinancing from a 30-year term to a 15-year term. While a 15-year mortgage usually offers a slightly lower interest rate, it comes with a massive hidden risk.</p>
            <p>When you formally refinance to a 15-year mortgage, the bank legally obligates you to make the higher monthly payment. If you lose your job, suffer a medical emergency, or your business revenue drops, the bank still demands that massive payment. If you cannot make it, they will foreclose.</p>
            <p>By using this calculator and simply <em>making voluntary extra payments</em> on your 30-year mortgage, you achieve the exact same accelerated payoff timeline. But you retain the ultimate safety net: If financial disaster strikes, you can instantly stop making the extra payments and fall back to your original, lower 30-year required payment.</p>

            <h2 className="text-2xl font-bold mb-3">How to Ensure Extra Payments Work</h2>
            <p>Banks do not want you to pay off your loan early. Therefore, you must be meticulous when executing this strategy.</p>
            <p><strong>Specify "Principal Only":</strong> When you send your extra $717 to the mortgage servicer, you must explicitly check the box or write instructions that the funds are to be applied as "Principal Only." If you do not, predatory servicers will simply apply it as an early payment for next month's bill, meaning they still charge you the interest. Your money will sit in an escrow account rather than destroying the principal balance.</p>
            <p><strong>Recasting:</strong> Note that making extra payments shortens your timeline, but it does <em>not</em> lower your required monthly bill. If your goal is to drastically lower your monthly payment rather than shorten the term, you must execute a "Mortgage Recast," where the bank recalculates your amortization schedule based on your newly lowered principal balance.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>A mortgage is designed to generate decades of passive income for the lender. By shifting from a passive borrower to an active debt-destroyer, you reclaim that wealth for your own family.</p>
            <p>By leveraging this Target Payoff Calculator, you establish a concrete, mathematical roadmap to absolute ownership. By identifying your target date, isolating the required cash flow, and understanding the compounding mechanics of principal reduction, you ensure that the roof over your head eventually belongs entirely to you, not the bank.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-payoff-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
