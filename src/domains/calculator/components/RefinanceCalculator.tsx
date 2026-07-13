"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RefinanceResult {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  breakEvenMonths: number;
  breakEvenYears: number;
  totalCurrentInterest: number;
  totalNewInterest: number;
  lifetimeSavings: number;
  isWorthIt: boolean;
  breakdown: { label: string; value: string }[];
  chartData: { label: string; current: number; newLoan: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function calcRefinance(
  currentBalance: number, currentRate: number, currentMonthsLeft: number,
  newRate: number, newTermYears: number, closingCosts: number
): RefinanceResult {
  const currentPayment = calcMonthlyPayment(currentBalance, currentRate, currentMonthsLeft);
  const newPayment = calcMonthlyPayment(currentBalance, newRate, newTermYears * 12);
  const monthlySavings = currentPayment - newPayment;

  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;
  const breakEvenYears = breakEvenMonths / 12;

  const totalCurrentInterest = currentPayment * currentMonthsLeft - currentBalance;
  const totalNewInterest = newPayment * newTermYears * 12 - currentBalance;
  const lifetimeSavings = totalCurrentInterest - totalNewInterest - closingCosts;
  const isWorthIt = monthlySavings > 0 && breakEvenMonths < newTermYears * 12;

  const breakdown = [
    { label: "Current Loan Balance", value: `$${currentBalance.toLocaleString()}` },
    { label: "Current Rate / Term Left", value: `${currentRate}% / ${currentMonthsLeft} months` },
    { label: "Current Monthly Payment", value: `$${currentPayment.toFixed(2)}` },
    { label: "New Rate / Term", value: `${newRate}% / ${newTermYears} years` },
    { label: "New Monthly Payment", value: `$${newPayment.toFixed(2)}` },
    { label: "Monthly Savings", value: `${monthlySavings >= 0 ? "+" : ""}$${monthlySavings.toFixed(2)}` },
    { label: "Closing Costs", value: `$${closingCosts.toLocaleString()}` },
    { label: "Break-Even Period", value: breakEvenMonths === Infinity ? "N/A (higher payment)" : `${breakEvenMonths} months (${breakEvenYears.toFixed(1)} yrs)` },
    { label: "Current Total Interest", value: `$${totalCurrentInterest.toFixed(0)}` },
    { label: "New Total Interest", value: `$${totalNewInterest.toFixed(0)}` },
    { label: "Lifetime Savings (after costs)", value: `${lifetimeSavings >= 0 ? "+" : ""}$${lifetimeSavings.toFixed(0)}` },
    { label: "Worth Refinancing?", value: isWorthIt ? "✓ Yes" : "✗ No" },
  ];

  const chartData = [
    { label: "Monthly Payment", current: parseFloat(currentPayment.toFixed(2)), newLoan: parseFloat(newPayment.toFixed(2)) },
    { label: "Total Interest", current: parseFloat(totalCurrentInterest.toFixed(0)), newLoan: parseFloat(totalNewInterest.toFixed(0)) },
  ];

  const summaryStats = [
    { label: "Current Payment", value: `$${currentPayment.toFixed(2)}` },
    { label: "New Payment", value: `$${newPayment.toFixed(2)}` },
    { label: "Monthly Savings", value: `$${monthlySavings.toFixed(2)}` },
    { label: "Break-Even", value: breakEvenMonths === Infinity ? "N/A" : `${breakEvenMonths} months` },
    { label: "Lifetime Savings", value: `$${lifetimeSavings.toFixed(0)}` },
    { label: "Recommendation", value: isWorthIt ? "Refinance ✓" : "Keep Current" },
  ];

  return { currentPayment, newPayment, monthlySavings, breakEvenMonths, breakEvenYears, totalCurrentInterest, totalNewInterest, lifetimeSavings, isWorthIt, breakdown, chartData, summaryStats };
}

export default function RefinanceCalculator() {
  const [balance, setBalance] = useState("280000");
  const [currentRate, setCurrentRate] = useState("7.5");
  const [monthsLeft, setMonthsLeft] = useState("300");
  const [newRate, setNewRate] = useState("6.5");
  const [newTerm, setNewTerm] = useState("30");
  const [closingCosts, setClosingCosts] = useState("5000");
  const [result, setResult] = useState<RefinanceResult | null>(null);

  const calculate = () => {
    setResult(calcRefinance(
      parseFloat(balance) || 280000, parseFloat(currentRate) || 7.5,
      parseInt(monthsLeft) || 300, parseFloat(newRate) || 6.5,
      parseInt(newTerm) || 30, parseFloat(closingCosts) || 5000
    ));
  };

  useEffect(() => { setResult(calcRefinance(280000, 7.5, 300, 6.5, 30, 5000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "When should I refinance my mortgage?", answer: "Refinancing makes financial sense when: (1) You can lower your rate by at least 0.5–1% and plan to stay in the home past the break-even point. (2) You need to reduce monthly payments due to financial hardship. (3) You want to shorten your loan term to build equity faster. (4) You want to switch from an ARM to a fixed-rate mortgage. Rule of thumb: if you can lower your rate by 1% on a $300,000 mortgage, you save ~$200/month — recouping $6,000 closing costs in 30 months." },
    { question: "What are typical refinance closing costs?", answer: "Refinance closing costs average 2–5% of the loan amount. Breakdown: Loan origination fee: 0.5–1% of loan. Appraisal: $300–$600. Title insurance: $500–$1,500. Title search: $100–$250. Recording fees: $50–$200. Attorney fees (if required): $500–$1,000. Credit report: $30–$50. Some lenders offer 'no-closing-cost' refinances that roll costs into the loan balance or rate — check the total cost vs. a standard refinance." },
    { question: "How do I calculate my refinance break-even point?", answer: "Break-even months = Total Closing Costs ÷ Monthly Payment Savings. Example: $5,000 closing costs ÷ $200 monthly savings = 25 months (about 2 years). If you plan to stay in the home longer than 25 months, refinancing saves money. If you might move sooner, keep the current loan. For cash-out refinances, the break-even is more complex — you need to factor in the opportunity cost of the equity you're withdrawing." },
    { question: "Should I refinance to a 15-year or 30-year mortgage?", answer: "15-year mortgage: Significantly lower interest rate (typically 0.5–0.75% less than 30-year). Builds equity twice as fast. Much higher monthly payment. 30-year mortgage: Lower monthly payment = more cash flow. Longer to pay off. More interest paid overall. Strategy: If you can comfortably afford the 15-year payment and value being debt-free sooner, the 15-year saves tens of thousands. If cash flow is tight or you'd invest the difference, the 30-year provides flexibility. Many financial planners recommend the 30-year with intentional extra payments." },
    { question: "What credit score do I need to refinance?", answer: "Minimum credit scores for refinancing: Conventional (Fannie/Freddie): 620 minimum, best rates at 740+. FHA refinance: 580 minimum. VA refinance (IRRRL): No minimum (but lenders typically want 620+). USDA refinance: 640 minimum. Rate impact: A 720 vs. 760 score can mean 0.25–0.5% difference in rate — on a $300,000 loan over 30 years, that's $15,000–$30,000 in interest. Check your credit score 6 months before refinancing and take steps to improve it." },
    { question: "What is a cash-out refinance?", answer: "A cash-out refinance replaces your current mortgage with a larger loan and gives you the difference in cash. Example: $300,000 home with $200,000 mortgage balance. Cash-out refinance to $240,000 → you receive $40,000 cash. This cash can be used for home improvements, debt consolidation, investments, or other expenses. Cons: You reset your loan term, pay closing costs, and lose built equity. You must have sufficient equity (typically 20% remaining after the cash-out). Rates are usually 0.25–0.5% higher than rate-and-term refinances." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Refinance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Mortgage Refinance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Loan</p>
            <div>
              <label className="text-base font-medium mb-1.5 block">Current Loan Balance</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Current Rate</label>
                <div className={inp}><input type="number" value={currentRate} onChange={e => setCurrentRate(e.target.value)} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Months Remaining</label>
                <div className={inp}><input type="number" value={monthsLeft} onChange={e => setMonthsLeft(e.target.value)} className={ci} /><span className={suf}>mo</span></div>
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">New Loan</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">New Rate</label>
                <div className={inp}><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">New Term</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["15", "15yr"], ["30", "30yr"]].map(([v, l]) => (
                    <button key={v} onClick={() => setNewTerm(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${newTerm === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Closing Costs</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={closingCosts} onChange={e => setClosingCosts(e.target.value)} className={ci} /></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setBalance("280000"); setCurrentRate("7.5"); setMonthsLeft("300"); setNewRate("6.5"); setNewTerm("30"); setClosingCosts("5000"); setResult(calcRefinance(280000, 7.5, 300, 6.5, 30, 5000)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.isWorthIt ? "bg-green-500/10 border-green-500" : "bg-amber-500/10 border-amber-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.isWorthIt ? "text-green-600" : "text-amber-600"}`}>{result.isWorthIt ? "✓ Refinancing Recommended" : "⚠ Consider Carefully"}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlySavings.toFixed(2)}<span className="text-lg text-muted-foreground font-normal">/mo saved</span></div>
                <div className="text-base text-muted-foreground mt-1">Break-even: {result.breakEvenMonths === Infinity ? "N/A" : `${result.breakEvenMonths} months`} · Lifetime savings: ${result.lifetimeSavings.toFixed(0)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly Savings", `$${result.monthlySavings.toFixed(2)}`], ["Break-Even", result.breakEvenMonths === Infinity ? "N/A" : `${result.breakEvenMonths} mo`], ["Lifetime Saves", `$${result.lifetimeSavings.toFixed(0)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Refinance Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Worth Refinancing?" ? "font-bold border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${r.label === "Worth Refinancing?" ? (result.isWorthIt ? "text-green-600" : "text-amber-600") : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Current vs. New Loan Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v > 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Bar dataKey="current" name="Current Loan" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="newLoan" name="New Loan" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Should You Refinance Your Mortgage?</h2>
            <p>This <strong>refinance calculator</strong> computes your monthly savings, break-even period, and lifetime interest savings from refinancing. The decision hinges on three factors: how much you lower your rate, how much the closing costs are, and how long you plan to stay in the home. Break-even formula: Months = Closing Costs ÷ Monthly Payment Savings. If you plan to stay longer than the break-even, refinancing makes financial sense.</p>
            <h2 className="text-2xl font-bold mb-3">The 1% Rule and Rate-Drop Thresholds</h2>
            <p>The classic "1% rule" says refinancing is worth it if you can lower your rate by at least 1%. While this is a reasonable starting point, the correct approach is break-even analysis. A 0.5% rate reduction on a $500,000 loan saves ~$165/month — recouping $6,000 in closing costs in just 36 months. On a $150,000 loan, the same 0.5% saves only ~$50/month, making a break-even of 120 months. The loan size dramatically affects the math.</p>
            <h2 className="text-2xl font-bold mb-3">Rate-and-Term vs. Cash-Out Refinance</h2>
            <p>Rate-and-term refinance replaces your loan at a lower rate or different term — purely to save on interest or payment. Cash-out refinance accesses home equity by taking a larger loan than your current balance. Cash-out rates are typically 0.125–0.5% higher than rate-and-term. Cash-out is useful for home improvements (which build equity), high-interest debt consolidation, or education funding — but adds to your mortgage balance and resets your equity. Related tools: <a href="/calculator/mortgage-calculator">Mortgage Calculator</a>, <a href="/calculator/home-equity-calculator">Home Equity Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/refinance-calculator" />
          <PopularCalculators exclude="/calculator/refinance-calculator" />
        </div>
      </div>
    </>
  );
}
