"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RefinanceBEResult {
  monthsToBreakEven: number;
  monthlySavings: number;
  totalSavings: number;
  closingCosts: number;
  lifetimeSavings: number;
  chartData: { month: number; cumulativeSavings: number; closingCosts: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRefinanceBE(currentBalance: number, currentRate: number, currentTerm: number, newRate: number, newTerm: number, closingCostPct: number): RefinanceBEResult {
  const rc = currentRate / 100 / 12;
  const rn = newRate / 100 / 12;
  const closingCosts = currentBalance * (closingCostPct / 100);

  const currentPayment = rc > 0 ? (currentBalance * rc) / (1 - Math.pow(1 + rc, -currentTerm * 12)) : currentBalance / (currentTerm * 12);
  const newPayment = rn > 0 ? (currentBalance * rn) / (1 - Math.pow(1 + rn, -newTerm * 12)) : currentBalance / (newTerm * 12);

  const monthlySavings = currentPayment - newPayment;
  const monthsToBreakEven = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : 999;

  const remainingTermMonths = currentTerm * 12;
  const totalSavings = monthlySavings * Math.min(remainingTermMonths, newTerm * 12) - closingCosts;
  const lifetimeSavings = totalSavings;

  const chartData: { month: number; cumulativeSavings: number; closingCosts: number }[] = [];
  for (let m = 0; m <= Math.min(newTerm * 12, 360); m += 12) {
    chartData.push({ month: m, cumulativeSavings: Math.round(monthlySavings * m), closingCosts: Math.round(closingCosts) });
  }

  const breakdown = [
    { label: "Current Loan Balance", value: `$${currentBalance.toLocaleString()}` },
    { label: "Current Rate / Term", value: `${currentRate}% / ${currentTerm} yrs` },
    { label: "Current Monthly Payment", value: `$${currentPayment.toFixed(2)}` },
    { label: "New Rate / Term", value: `${newRate}% / ${newTerm} yrs` },
    { label: "New Monthly Payment", value: `$${newPayment.toFixed(2)}` },
    { label: "Monthly Savings", value: `$${monthlySavings.toFixed(2)}` },
    { label: "Estimated Closing Costs", value: `$${closingCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${closingCostPct}%)` },
    { label: "Break-Even Point", value: monthsToBreakEven < 500 ? `${monthsToBreakEven} months (${(monthsToBreakEven / 12).toFixed(1)} yrs)` : "Never" },
    { label: "Lifetime Savings", value: lifetimeSavings > 0 ? `$${lifetimeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "Cost $" + Math.abs(lifetimeSavings).toLocaleString("en-US", { maximumFractionDigits: 0 }) },
  ];

  const summaryStats = [
    { label: "Monthly Savings", value: `$${monthlySavings.toFixed(2)}` },
    { label: "Break-Even", value: monthsToBreakEven < 500 ? `${monthsToBreakEven} months` : "Never" },
    { label: "Closing Costs", value: `$${closingCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Savings", value: `$${(monthlySavings * 12).toFixed(0)}` },
    { label: "Lifetime Savings", value: `$${lifetimeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Rate Reduction", value: `${(currentRate - newRate).toFixed(2)}%` },
  ];

  return { monthsToBreakEven, monthlySavings, totalSavings, closingCosts, lifetimeSavings, chartData, breakdown, summaryStats };
}

const DEFAULTS = { balance: "350000", curRate: "7.5", curTerm: "30", newRate: "6.5", newTerm: "30", closingPct: "2.5" };

export default function RefinanceBreakEvenCalculator() {
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [curRate, setCurRate] = useState(DEFAULTS.curRate);
  const [curTerm, setCurTerm] = useState(DEFAULTS.curTerm);
  const [newRate, setNewRate] = useState(DEFAULTS.newRate);
  const [newTerm, setNewTerm] = useState(DEFAULTS.newTerm);
  const [closingPct, setClosingPct] = useState(DEFAULTS.closingPct);
  const [result, setResult] = useState<RefinanceBEResult | null>(null);

  const calculate = () => setResult(calcRefinanceBE(parseFloat(balance) || 350000, parseFloat(curRate) || 7.5, parseInt(curTerm) || 30, parseFloat(newRate) || 6.5, parseInt(newTerm) || 30, parseFloat(closingPct) || 2.5));
  const reset = () => { setBalance(DEFAULTS.balance); setCurRate(DEFAULTS.curRate); setCurTerm(DEFAULTS.curTerm); setNewRate(DEFAULTS.newRate); setNewTerm(DEFAULTS.newTerm); setClosingPct(DEFAULTS.closingPct); setResult(calcRefinanceBE(350000, 7.5, 30, 6.5, 30, 2.5)); };
  useEffect(() => { setResult(calcRefinanceBE(350000, 7.5, 30, 6.5, 30, 2.5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const beColor = result ? (result.monthsToBreakEven < 24 ? "text-emerald-600" : result.monthsToBreakEven < 48 ? "text-amber-600" : "text-red-500") : "";

  const faqs = [
    { question: "What is a refinance break-even point?", answer: "The break-even point is when your cumulative monthly savings from refinancing equal your closing costs. Before break-even, you're still 'paying back' the costs. After break-even, every month is pure savings. Formula: Break-Even Months = Closing Costs ÷ Monthly Payment Savings." },
    { question: "What closing costs should I expect to refinance?", answer: "Typical refinance closing costs: 2–5% of the loan amount. Common fees: origination fee (0.5–1%), appraisal ($300–$600), title insurance (0.5–1%), recording fees ($50–$150), underwriting ($400–$900). No-closing-cost refinances shift these costs into a higher rate — you pay over time rather than upfront." },
    { question: "When is refinancing worth it?", answer: "Refinancing is generally worthwhile if: your new rate is at least 0.5–1% lower, you plan to stay in the home past the break-even point (ideally 3+ years), and your credit qualifies for competitive rates. Even a 0.5% rate reduction on a $400,000 loan saves $115+/month. The 2% rule (refinance when rate drops 2%) is outdated — calculate your specific break-even." },
    { question: "Does refinancing restart my 30-year clock?", answer: "Only if you refinance into a new 30-year loan. If you're 10 years into a 30-year and refinance into another 30-year, you extend from 20 years remaining to 30 years. This reduces monthly payments but may increase total interest paid. Consider refinancing to a 20-year or 15-year loan to maintain or accelerate your payoff timeline." },
    { question: "What credit score do I need to refinance?", answer: "Conventional refinance: 620 minimum (700+ for best rates). FHA Streamline: no minimum score. VA IRRRL: no minimum score. Cash-out refinance: 640–680 minimum. Your credit score determines your rate tier — at $400,000, the difference between 660 and 760 credit can be 0.5–1% in rate, worth $800–$1,700/year." },
    { question: "What is a no-cost refinance?", answer: "A no-cost refinance rolls closing costs into the loan balance or accepts a higher rate in exchange for lender credits to cover fees. You avoid upfront cash but pay more over time. Best for: homeowners who plan to sell or refinance again within 5 years. Worst for: long-term owners who stay in the home 10+ years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Refinance Break-Even Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Refinance Break-Even Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Current Loan Balance</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Current Rate</label><div className={inp}><input type="number" value={curRate} onChange={e => setCurRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Current Term Left</label><div className={inp}><input type="number" value={curTerm} onChange={e => setCurTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">New Rate</label><div className={inp}><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">New Term</label><div className={inp}><input type="number" value={newTerm} onChange={e => setNewTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Closing Costs</label><div className={inp}><input type="number" value={closingPct} onChange={e => setClosingPct(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Break-Even Point</div>
                <div className={`text-4xl font-extrabold tracking-tight ${beColor}`}>{result.monthsToBreakEven < 500 ? `${result.monthsToBreakEven} months` : "Not worth it"}</div>
                <div className="text-sm text-muted-foreground mt-1">Monthly savings: ${result.monthlySavings.toFixed(2)} · Closing costs: ${result.closingCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly Savings", `$${result.monthlySavings.toFixed(2)}`], ["Closing Costs", `$${result.closingCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Lifetime Savings", `$${result.lifetimeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Refinance Analysis</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Break-Even Point" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cumulative Savings vs. Costs</h3>
                <ResponsiveContainer width="100%" height={220}><LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Line type="monotone" dataKey="cumulativeSavings" name="Cumulative Savings" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="closingCosts" name="Closing Costs" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Refinance Break-Even Calculator?</h2>
            <p>A <strong>refinance break-even calculator</strong> determines the exact number of months you need to stay in your home after refinancing before your cumulative monthly savings exceed the upfront closing costs. This is the single most important calculation for deciding whether to refinance — without knowing your break-even point, you risk paying thousands in costs only to move before recouping them.</p>
            <h2 className="text-2xl font-bold mb-3">How Break-Even Is Calculated</h2>
            <p>Break-Even Months = Closing Costs ÷ Monthly Payment Savings. Monthly Savings = Current Payment − New Payment. Lifetime Savings = (Monthly Savings × Remaining Term) − Closing Costs. If your break-even is 24 months and you plan to stay 10+ years, refinancing makes strong financial sense.</p>
            <h2 className="text-2xl font-bold mb-3">When to Refinance</h2>
            <p>Strong case: rate drops 0.5%+, break-even under 36 months, staying 5+ years. Borderline: rate drops 0.25–0.5%, break-even 36–60 months. Avoid: moving within 2 years, or no-cost refinance that only resets your balance.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Rate Environments</h2>
            <p>2020–2021 saw record-low rates (2.65–3.0%). Rates rose sharply to 7–8% in 2023–2024. When rates fall, refinancing makes more sense for those who bought at peak rates. Even a 1% rate drop on a $400,000 loan saves $220+/month — a 12-month break-even on $2,600 in closing costs.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/refinance-break-even-calculator" />
          <PopularCalculators exclude="/calculator/refinance-break-even-calculator" />
        </div>
      </div>
    </>
  );
}
