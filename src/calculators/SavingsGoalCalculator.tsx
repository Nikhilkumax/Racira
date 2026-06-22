"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SavingsGoalResult {
  monthlyRequired: number;
  totalSaved: number;
  totalInterest: number;
  percentFromInterest: number;
  yearsToGoal: number;
  chartData: { year: number; balance: number; target: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSavingsGoal(goal: number, currentBalance: number, rate: number, years: number): SavingsGoalResult {
  const r = rate / 100 / 12;
  const n = years * 12;
  const fvCurrent = currentBalance * Math.pow(1 + r, n);
  const remaining = Math.max(0, goal - fvCurrent);

  const monthlyRequired = r > 0 && remaining > 0
    ? remaining * r / (Math.pow(1 + r, n) - 1)
    : remaining / n;

  const totalSaved = monthlyRequired * n + currentBalance;
  const totalInterest = goal - totalSaved;

  const chartData: { year: number; balance: number; target: number }[] = [];
  let balance = currentBalance;
  for (let y = 0; y <= years; y++) {
    chartData.push({ year: y, balance: Math.round(balance), target: goal });
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + monthlyRequired;
    }
  }

  const breakdown = [
    { label: "Savings Goal", value: `$${goal.toLocaleString()}` },
    { label: "Current Savings", value: `$${currentBalance.toLocaleString()}` },
    { label: "Annual Return Rate", value: `${rate}%` },
    { label: "Time Horizon", value: `${years} years` },
    { label: "Monthly Savings Required", value: `$${monthlyRequired.toFixed(2)}` },
    { label: "Annual Savings Required", value: `$${(monthlyRequired * 12).toFixed(0)}` },
    { label: "Total Contributions", value: `$${totalSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Earned", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Required", value: `$${monthlyRequired.toFixed(2)}` },
    { label: "Goal Amount", value: `$${goal.toLocaleString()}` },
    { label: "Contributions", value: `$${totalSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Earned", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest % of Goal", value: `${goal > 0 ? ((totalInterest / goal) * 100).toFixed(1) : 0}%` },
    { label: "Annual Target", value: `$${(monthlyRequired * 12).toFixed(0)}` },
  ];

  return { monthlyRequired, totalSaved, totalInterest, percentFromInterest: goal > 0 ? (totalInterest / goal) * 100 : 0, yearsToGoal: years, chartData, breakdown, summaryStats };
}

const DEFAULTS = { goal: "100000", current: "10000", rate: "6", years: "10" };

export default function SavingsGoalCalculator() {
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<SavingsGoalResult | null>(null);

  const calculate = () => setResult(calcSavingsGoal(parseFloat(goal) || 100000, parseFloat(current) || 10000, parseFloat(rate) || 6, parseInt(years) || 10));
  const reset = () => { setGoal(DEFAULTS.goal); setCurrent(DEFAULTS.current); setRate(DEFAULTS.rate); setYears(DEFAULTS.years); setResult(calcSavingsGoal(100000, 10000, 6, 10)); };
  useEffect(() => { setResult(calcSavingsGoal(100000, 10000, 6, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How much should I save each month?", answer: "The 50/30/20 rule suggests saving 20% of net income. For specific goals, calculate backwards: use this savings goal calculator with your target amount, timeline, and expected return to determine the exact monthly contribution needed. Common benchmarks: 6-month emergency fund, 15% of income for retirement, dedicated sinking funds for large purchases." },
    { question: "What return rate should I use for savings goals?", answer: "High-yield savings account / CDs: 4–5% (2024). Conservative investment (60/40): 6–7%. Moderate growth portfolio: 7–8%. Aggressive growth (stock-heavy): 8–10%. For short-term goals (under 3 years), use savings account rates. For long-term goals (5+ years), investment returns are appropriate." },
    { question: "How does compound interest help savings goals?", answer: "Compound interest means you earn returns on your returns. The longer you save, the more interest accelerates your growth. At 7%, money roughly doubles every 10 years. For a 20-year savings horizon, about 60–70% of your final balance may come from investment returns rather than contributions — dramatically reducing how much you need to save each month." },
    { question: "What order should I prioritize savings goals?", answer: "1. Emergency fund (3–6 months expenses) — highest priority, high-yield savings. 2. Employer 401(k) match — free money, always take it. 3. High-interest debt payoff. 4. Max IRA/Roth IRA. 5. Max 401(k). 6. Specific goals (house down payment, education, vacation). Each goal should have a dedicated account or sinking fund." },
    { question: "How do I stay on track with savings goals?", answer: "Automate transfers to savings on payday — pay yourself first. Use separate accounts for each goal. Name accounts ('Hawaii 2026', 'Emergency Fund'). Track monthly. Celebrate milestones. Review and adjust quarterly. Many banks allow sub-accounts or savings buckets for free." },
    { question: "What is a sinking fund?", answer: "A sinking fund is a savings account dedicated to a specific future expense — car replacement, vacation, home repairs, holiday gifts. Divide the total needed by the months until you need it: $3,600 for a vacation in 12 months = $300/month. Sinking funds prevent budget disruption by spreading large costs over time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Savings Goal Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Savings Goal Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Savings Goal</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={goal} onChange={e => setGoal(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Current Savings</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Return</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Time Horizon</label><div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Savings Required</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyRequired.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Goal: ${parseFloat(goal).toLocaleString()} · Interest helps: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({result.percentFromInterest.toFixed(1)}%)</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly Required", `$${result.monthlyRequired.toFixed(2)}`], ["Interest Earned", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Interest %", `${result.percentFromInterest.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Savings Plan Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Interest Earned" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Savings Projection</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="target" name="Goal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="5 5" /><Area type="monotone" dataKey="balance" name="Savings" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Savings Goal Calculator?</h2>
            <p>A <strong>savings goal calculator</strong> tells you exactly how much you need to save each month to reach a financial goal by a specific date. Whether you&apos;re saving for a house down payment, emergency fund, vacation, education, or retirement milestone, knowing your required monthly contribution removes guesswork and keeps your plan concrete and actionable.</p>
            <h2>How the Calculation Works</h2>
            <p>Monthly Savings = (Goal − FV of Current Balance) × r ÷ [(1+r)^n − 1]. Where Goal = target amount, FV of Current Balance = existing savings grown at rate r for n months, r = monthly rate (annual ÷ 12), n = total months. Your existing savings grow alongside new contributions, reducing the monthly amount needed.</p>
            <h2>Understanding Your Results</h2>
            <p>The monthly required amount shows exactly what you need to save starting today. The interest earned portion shows how much your investment returns contribute — dramatically less if you save in a checking account vs. an investment account. A higher return rate or longer horizon significantly reduces monthly requirements.</p>
            <h2>Common Savings Goals and Timelines</h2>
            <p>Emergency fund (3–6 months expenses): typically 6–18 months savings horizon. House down payment (20% of purchase price): 3–7 year horizon. College education ($150K–$300K): 15–18 year horizon from birth. Retirement (25x annual expenses): 20–35 year horizon. Each goal benefits from dedicated accounts and automated transfers.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/savings-goal-calculator" />
          <PopularCalculators exclude="/calculator/savings-goal-calculator" />
        </div>
      </div>
    </>
  );
}
