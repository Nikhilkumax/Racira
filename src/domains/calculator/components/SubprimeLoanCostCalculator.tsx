"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface SubprimeInputs {
  loanAmount: number;
  subprimeRate: number;
  primeRate: number;
  loanTermYears: number;
  originationFeePct: number;
  monthlyFee: number;
}

interface SubprimeResults {
  subprimeMonthly: number;
  primeMonthly: number;
  monthlyPenalty: number;
  
  subprimeTotalInterest: number;
  primeTotalInterest: number;
  
  upfrontFees: number;
  totalMonthlyFees: number;
  
  subprimeTotalCost: number;
  primeTotalCost: number;
  totalSubprimePenalty: number; // The exact wealth lost by having subprime

  chartData: { month: number; subprimeCost: number; primeCost: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  
  subprimeYearlyRows: AmortRow[];
}

// 2. Pure Calculation Function
const calculateSubprimeCost = (inputs: SubprimeInputs): SubprimeResults => {
  const {
    loanAmount,
    subprimeRate,
    primeRate,
    loanTermYears,
    originationFeePct,
    monthlyFee
  } = inputs;

  const n = loanTermYears * 12;
  const subRateMonthly = subprimeRate / 100 / 12;
  const primeRateMonthly = primeRate / 100 / 12;

  // 1. Prime Calculation
  let primeMonthly = 0;
  if (loanAmount > 0 && n > 0) {
    primeMonthly = primeRateMonthly > 0 ? (loanAmount * primeRateMonthly * Math.pow(1 + primeRateMonthly, n)) / (Math.pow(1 + primeRateMonthly, n) - 1) : loanAmount / n;
  }
  const primeTotalInterest = Math.max(0, (primeMonthly * n) - loanAmount);
  const primeTotalCost = loanAmount + primeTotalInterest;

  // 2. Subprime Calculation
  const upfrontFees = loanAmount * (originationFeePct / 100);
  const financedAmount = loanAmount + upfrontFees; // Often fees are rolled into the loan
  
  let baseSubprimeMonthly = 0;
  if (financedAmount > 0 && n > 0) {
    baseSubprimeMonthly = subRateMonthly > 0 ? (financedAmount * subRateMonthly * Math.pow(1 + subRateMonthly, n)) / (Math.pow(1 + subRateMonthly, n) - 1) : financedAmount / n;
  }
  
  const subprimeMonthly = baseSubprimeMonthly + monthlyFee;
  const totalMonthlyFees = monthlyFee * n;
  
  const subprimeTotalInterest = Math.max(0, (baseSubprimeMonthly * n) - financedAmount);
  const subprimeTotalCost = financedAmount + subprimeTotalInterest + totalMonthlyFees;

  // 3. Penalty Metrics
  const monthlyPenalty = subprimeMonthly - primeMonthly;
  const totalSubprimePenalty = subprimeTotalCost - primeTotalCost;

  // 4. Generate Amortization & Chart Data
  let subprimeBalance = financedAmount;
  let primeBalance = loanAmount;
  
  let cumulativeSubprimeCost = 0;
  let cumulativePrimeCost = 0;

  const chartData = [];
  const subprimeYearlyRows: AmortRow[] = [];
  
  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  for (let m = 1; m <= n; m++) {
    // Subprime
    const sInterest = subprimeBalance * subRateMonthly;
    let sPrincipal = baseSubprimeMonthly - sInterest;
    if (sPrincipal > subprimeBalance) sPrincipal = subprimeBalance;
    subprimeBalance -= sPrincipal;
    cumulativeSubprimeCost += (sInterest + sPrincipal + monthlyFee);

    // Prime
    const pInterest = primeBalance * primeRateMonthly;
    let pPrincipal = primeMonthly - pInterest;
    if (pPrincipal > primeBalance) pPrincipal = primeBalance;
    primeBalance -= pPrincipal;
    cumulativePrimeCost += (pInterest + pPrincipal);

    currentYearInterest += sInterest;
    currentYearPrincipal += sPrincipal;
    currentYearPayment += (sInterest + sPrincipal + monthlyFee);

    if (m % 12 === 0 || m === n) {
       subprimeYearlyRows.push({
         period: Math.ceil(m / 12),
         payment: currentYearPayment,
         principal: currentYearPrincipal,
         interest: currentYearInterest,
         balance: Math.max(0, subprimeBalance)
       });
       currentYearInterest = 0;
       currentYearPrincipal = 0;
       currentYearPayment = 0;
    }

    // Chart
    if (m % Math.max(1, Math.floor(n / 60)) === 0 || m === n) {
      chartData.push({
        month: m,
        subprimeCost: cumulativeSubprimeCost + upfrontFees, // include upfront
        primeCost: cumulativePrimeCost
      });
    }
  }

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Prime Payment", value: `$${primeMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
    { label: "Subprime Payment", value: `$${subprimeMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
    { label: "Monthly Cash Penalty", value: `-$${monthlyPenalty.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
    { label: "Total Wealth Lost", value: `$${totalSubprimePenalty.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Original Loan Required", amount: `$${loanAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Subprime Upfront Origination Fees", amount: `$${upfrontFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Subprime Total Monthly Fees", amount: `$${totalMonthlyFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Subprime Total Interest", amount: `$${subprimeTotalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colorClass: "text-amber-500" },
    { label: "Subprime Total Lifetime Cost", amount: `$${subprimeTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-destructive" }
  ];

  return {
    subprimeMonthly,
    primeMonthly,
    monthlyPenalty,
    subprimeTotalInterest,
    primeTotalInterest,
    upfrontFees,
    totalMonthlyFees,
    subprimeTotalCost,
    primeTotalCost,
    totalSubprimePenalty,
    chartData,
    summaryStats,
    breakdown,
    subprimeYearlyRows
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  loanAmount: "25000",
  subprimeRate: "18.5",
  primeRate: "7.0",
  loanTermYears: "5",
  originationFeePct: "5.0",
  monthlyFee: "15"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const penalty = payload[0].value - payload[1].value;
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-1">Year {Math.floor(label/12)}</p>
        <p className="flex items-center gap-1.5 text-destructive">
          <span className="w-2 h-2 rounded-full bg-destructive"></span>
          Subprime Cost: ${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p className="flex items-center gap-1.5 text-blue-500">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Prime Cost: ${payload[1].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p className="mt-2 pt-2 border-t border-border font-bold text-destructive">
          Wealth Lost: ${penalty.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
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

export default function SubprimeLoanCostCalculator() {
  // 4. Component State
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [subprimeRate, setSubprimeRate] = useState(DEFAULTS.subprimeRate);
  const [primeRate, setPrimeRate] = useState(DEFAULTS.primeRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [originationFeePct, setOriginationFeePct] = useState(DEFAULTS.originationFeePct);
  const [monthlyFee, setMonthlyFee] = useState(DEFAULTS.monthlyFee);

  const [results, setResults] = useState<SubprimeResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: SubprimeInputs = {
      loanAmount: parseFloat(loanAmount) || 0,
      subprimeRate: parseFloat(subprimeRate) || 0,
      primeRate: parseFloat(primeRate) || 0,
      loanTermYears: parseFloat(loanTermYears) || 0,
      originationFeePct: parseFloat(originationFeePct) || 0,
      monthlyFee: parseFloat(monthlyFee) || 0
    };
    setResults(calculateSubprimeCost(inputs));
  };

  const handleReset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setSubprimeRate(DEFAULTS.subprimeRate);
    setPrimeRate(DEFAULTS.primeRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setOriginationFeePct(DEFAULTS.originationFeePct);
    setMonthlyFee(DEFAULTS.monthlyFee);
    setShowAdvanced(false);
    
    setResults(calculateSubprimeCost({
      loanAmount: parseFloat(DEFAULTS.loanAmount),
      subprimeRate: parseFloat(DEFAULTS.subprimeRate),
      primeRate: parseFloat(DEFAULTS.primeRate),
      loanTermYears: parseFloat(DEFAULTS.loanTermYears),
      originationFeePct: parseFloat(DEFAULTS.originationFeePct),
      monthlyFee: parseFloat(DEFAULTS.monthlyFee)
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
    w.document.write(`<html><head><title>Subprime Loan Penalty Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a Subprime Loan?", answer: "A subprime loan is a loan offered to individuals with poor credit histories (typically a FICO score below 600) or those who cannot verify their income. Because the lender takes on a significantly higher risk of default, they charge exponentially higher interest rates and origination fees." },
    { question: "What is the 'Subprime Penalty'?", answer: "The subprime penalty is the actual dollar amount of wealth you lose strictly because of a low credit score. It is calculated by taking the total lifetime cost of your subprime loan and subtracting the total cost of a standard 'prime' loan. It represents the financial tax of bad credit." },
    { question: "Why do subprime loans include so many fees?", answer: "Subprime lenders know their borrowers have very few alternatives. They often front-load the loan with massive 'Origination Fees' (sometimes 5% to 10% of the loan amount) and monthly administrative fees. These fees guarantee the lender a profit even if the borrower eventually defaults." },
    { question: "Is it better to delay borrowing and fix my credit?", answer: "Mathematically, yes. Unless it is an absolute emergency (like repairing the vehicle you need to get to work), taking 6 months to raise your credit score from 580 to 680 can save you thousands or even tens of thousands of dollars in interest and penalty fees." },
    { question: "Can I refinance a subprime loan later?", answer: "Yes, and you absolutely should. If you are forced to take a subprime auto loan at 18%, your primary goal should be to make 12 flawless, on-time payments. This builds your credit score. After a year, you should attempt to refinance the remaining balance with a local credit union at a much lower 'prime' rate." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Subprime Loan Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Subprime Loan Penalty Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-destructive font-bold mb-1">
                <AlertTriangle className="h-4 w-4" /> The Cost of Bad Credit
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">This tool calculates exactly how much extra money you are losing due to high subprime rates and hidden fees compared to a borrower with good credit.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="amt" label="Loan Amount Needed" value={loanAmount} onChange={setLoanAmount} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="subrate" label="Your Subprime Rate" value={subprimeRate} onChange={setSubprimeRate} suffix="%" />
              <CompactInput id="primerate" label="Prime Rate (Good Credit)" value={primeRate} onChange={setPrimeRate} suffix="%" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-destructive hover:underline mt-1 focus:outline-none">
                Add Subprime Fees <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="orig" label="Origination Fee" value={originationFeePct} onChange={setOriginationFeePct} suffix="%" />
                  <CompactInput id="mfee" label="Monthly Admin Fee" value={monthlyFee} onChange={setMonthlyFee} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">Total Subprime Penalty</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.totalSubprimePenalty.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  <div className="text-sm text-destructive mt-1 font-bold">This is the exact amount of cash you lose because of a low credit score.</div>
                </div>

                {/* 2. Side-by-side Monthly Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg bg-card p-4 text-center">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Prime Monthly Payment</div>
                    <div className="text-2xl font-bold text-blue-500">${results.primeMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="border border-destructive/30 rounded-lg bg-destructive/5 p-4 text-center">
                    <div className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Subprime Monthly Payment</div>
                    <div className="text-2xl font-bold text-destructive">${results.subprimeMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-xs font-semibold text-destructive mt-1">(+${results.monthlyPenalty.toLocaleString(undefined, {maximumFractionDigits:0})}/mo extra)</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Subprime Loan Composition</h3>
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

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Cumulative Cost Trajectory</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">Visualizes the widening gap between prime and subprime borrowing costs.</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorPrime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val/12)}y`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="subprimeCost" name="Subprime Cumulative Cost" stroke="#ef4444" fillOpacity={1} fill="url(#colorSub)" strokeWidth={2} />
                        <Area type="monotone" dataKey="primeCost" name="Prime Cumulative Cost" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrime)" strokeWidth={2} />
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
                        <span className={`font-semibold ${stat.label.includes('Penalty') || stat.label.includes('Lost') ? 'text-destructive' : ''}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-5 border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Subprime Amortization Schedule (Yearly)</h3>
                  </div>
                  <AmortizationTable rows={results.subprimeYearlyRows} yearly={true} />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Subprime Loan Cost Calculator</h2>
            <p>The financial services industry operates on a strict system of risk assessment. When you apply for a loan—whether it is an auto loan, a personal loan, or a mortgage—the lender evaluates your credit score to determine how likely you are to default. If your credit score is below a certain threshold (typically sub-600 FICO), you fall into the "subprime" category. To compensate for the high risk of lending to you, banks impose a massive financial penalty via exorbitant interest rates and fees.</p>
            <p>Our <strong>Subprime Loan Cost Calculator</strong> is not a standard payment calculator. It is a forensic analytical tool designed to quantify the "Subprime Penalty." By comparing the exact trajectory of your high-interest loan against what a borrower with good credit would receive, this tool reveals the precise, dollar-for-dollar amount of wealth you are losing due to a low credit score.</p>

            <h2 className="text-2xl font-bold mb-3">The Hidden Architecture of Subprime Lending</h2>
            <p>Subprime lending is highly profitable for financial institutions, but it relies on complex, front-loaded fee structures designed to trap borrowers. When using this calculator, it is critical to understand the three pillars of subprime cost:</p>
            <p><strong>1. The Inflated Interest Rate:</strong> The most obvious penalty is the interest rate. While a "prime" borrower with a 750 credit score might secure an auto loan at 6%, a subprime borrower might be offered 18%, 22%, or even 29.99%. Over a 5-year loan, this seemingly abstract percentage translates into thousands of dollars of pure profit for the lender.</p>
            <p><strong>2. Predatory Origination Fees:</strong> Prime borrowers often pay zero origination fees on personal or auto loans. Subprime lenders, however, frequently charge massive upfront fees (e.g., 5% to 10% of the loan amount) just for processing the application. Worse, these fees are usually rolled into the principal balance, meaning the lender charges you 20% interest on the fee itself for the next five years.</p>
            <p><strong>3. Monthly Administrative Fees:</strong> Many subprime loans (especially bad-credit personal installment loans) include hidden "$15/month administrative fees." While $15 sounds insignificant, over a 60-month loan, that is $900 completely removed from your principal repayment.</p>

            <h2 className="text-2xl font-bold mb-3">Analyzing the "Total Subprime Penalty"</h2>
            <p>The headline metric produced by this calculator is the <strong>Total Subprime Penalty</strong>. This is not the total cost of the loan; rather, it is the <em>difference</em> between what you are paying and what a prime borrower pays for the exact same loan amount.</p>
            <p>If you borrow $25,000 to buy a car, a prime borrower might pay a total of $29,000 over 5 years. A subprime borrower, burdened with an 18% rate and a 5% origination fee, might pay $40,000 over the same 5 years. The Subprime Penalty is $11,000. That is $11,000 of your labor, your cash flow, and your wealth legally extracted from you simply because of a three-digit credit score.</p>

            <h2 className="text-2xl font-bold mb-3">Visualizing the Cost Trajectory</h2>
            <p>The Area Chart in our calculator plots the cumulative cost of both the Prime and Subprime trajectories. Pay close attention to how the two curves diverge over time.</p>
            <p>In month one, the red subprime curve immediately jumps above the blue prime curve. This gap represents the upfront origination fees being injected into your debt. As the years progress, the gap between the curves accelerates. This exponential widening is caused by compound interest ravaging the subprime balance while the prime balance steadily amortizes toward zero. The space between those two curves is a visual representation of your lost wealth.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematical Defense: The Refinance Strategy</h2>
            <p>If you are forced into a subprime loan due to absolute necessity (e.g., your car breaks down, you need to get to work, and no prime lender will approve you), you are not permanently trapped. You must utilize the "Refinance Strategy."</p>
            <p><strong>Phase 1 (The Rebuild):</strong> Accept the subprime loan, but view it strictly as a temporary credit-repair tool. For 12 straight months, make every single payment flawlessly on time. Never be a day late. This establishes a perfect payment history, which makes up 35% of your FICO score. Your score will climb.</p>
            <p><strong>Phase 2 (The Escape):</strong> At month 13, do not stay in the loan. Approach a local credit union. Present your 12 months of flawless payment history and your newly improved credit score, and apply to refinance the remaining balance of the vehicle. By dropping your rate from 22% down to 8%, you instantly halt the aggressive red curve on our chart and switch your trajectory to the blue curve, saving yourself thousands in the final years of the loan.</p>

            <h2 className="text-2xl font-bold mb-3">Opportunity Cost and Delayed Gratification</h2>
            <p>This calculator is a powerful tool for enforcing "Delayed Gratification." Before signing a subprime contract, input the numbers. If the Total Subprime Penalty is $8,000, ask yourself a critical question: "Is buying this asset today worth a guaranteed $8,000 loss?"</p>
            <p>If the loan is for a discretionary purchase—like a jet ski, a vacation, or an expensive wedding—the mathematical answer is definitively no. By delaying the purchase for one year, actively paying down old debts, and raising your credit score by 100 points, you keep that $8,000 in your own pocket rather than handing it to a high-risk lending syndicate.</p>

            <h2 className="text-2xl font-bold mb-3">Warning: The Subprime Auto Industry Trap</h2>
            <p>The most dangerous sector for subprime borrowing is the "Buy Here, Pay Here" auto dealership. These lots target desperate buyers. They use "Spot Delivery" to get you into a car quickly, mask the massive 25% interest rate behind low weekly payments, and install GPS kill-switches to remotely disable the vehicle if you miss a payment by one day.</p>
            <p>Worse, they frequently mandate that the origination fees and expensive "extended warranties" be rolled into the loan. Because the interest rate is so astronomical, the borrower mathematically cannot pay down the principal fast enough to keep up with the depreciation of the vehicle. This traps the borrower "underwater" (owing more than the car is worth), preventing them from trading it in or selling it to escape the subprime trap. Always secure financing from a credit union before stepping onto a high-risk auto lot.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>Subprime loans are a brutal mathematical reality for millions of borrowers. However, ignorance is the lender's greatest weapon. By refusing to focus merely on the "affordable monthly payment," and instead demanding to see the Total Lifetime Cost, you strip the lender of their advantage.</p>
            <p>Use this Subprime Loan Cost Calculator to confront the mathematical reality of bad credit. Quantify your penalty, strategize a 12-month refinance escape plan, and ensure that your temporary credit missteps do not result in a permanent destruction of your long-term wealth.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/subprime-loan-cost-calculator" />
          <PopularCalculators exclude="/calculator/subprime-loan-cost-calculator" />
        </div>
      </div>
    </>
  );
}
