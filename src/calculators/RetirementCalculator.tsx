"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RetirementResult {
  monthlyIncomeNeeded: number;
  retirementPortfolio: number;
  socialSecurity: number;
  pensionIncome: number;
  investmentIncome: number;
  incomeGap: number;
  isOnTrack: boolean;
  barData: { source: string; amount: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRetirement(currentAge: number, retireAge: number, currentSavings: number, monthlySavings: number, retireExpenses: number, socialSecurity: number, pension: number, returnRate: number): RetirementResult {
  const yearsToRetire = Math.max(0, retireAge - currentAge);
  const r = returnRate / 100;
  const portfolioAtRetirement = currentSavings * Math.pow(1 + r, yearsToRetire) + (monthlySavings * 12) * ((Math.pow(1 + r, yearsToRetire) - 1) / r);

  const annualExpenses = retireExpenses * 12;
  const annualSS = socialSecurity * 12;
  const annualPension = pension * 12;
  const investmentIncome = portfolioAtRetirement * 0.04; // 4% SWR
  const totalIncome = annualSS + annualPension + investmentIncome;
  const incomeGap = totalIncome - annualExpenses;
  const isOnTrack = incomeGap >= 0;

  const barData = [
    { source: "Investment (4%)", amount: Math.round(investmentIncome / 12), fill: "hsl(var(--primary))" },
    { source: "Social Security", amount: Math.round(socialSecurity), fill: "#10b981" },
    { source: "Pension", amount: Math.round(pension), fill: "#6366f1" },
    { source: "Total Need", amount: Math.round(retireExpenses), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Current Age / Retire Age", value: `${currentAge} → ${retireAge} (${yearsToRetire} years)` },
    { label: "Current Savings", value: `$${currentSavings.toLocaleString()}` },
    { label: "Monthly Contributions", value: `$${monthlySavings.toLocaleString()}` },
    { label: "Expected Return", value: `${returnRate}%` },
    { label: "Portfolio at Retirement", value: `$${portfolioAtRetirement.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Investment Income (4% SWR)", value: `$${(investmentIncome / 12).toFixed(0)}/mo` },
    { label: "Social Security", value: `$${socialSecurity.toLocaleString()}/mo` },
    { label: "Pension", value: `$${pension.toLocaleString()}/mo` },
    { label: "Total Monthly Income", value: `$${(totalIncome / 12).toFixed(0)}/mo` },
    { label: "Monthly Expenses", value: `$${retireExpenses.toLocaleString()}/mo` },
    { label: "Monthly Surplus/Deficit", value: (incomeGap >= 0 ? "+" : "") + `$${(incomeGap / 12).toFixed(0)}/mo` },
  ];

  const summaryStats = [
    { label: "Retirement Portfolio", value: `$${portfolioAtRetirement.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Monthly Income", value: `$${(totalIncome / 12).toFixed(0)}` },
    { label: "Monthly Gap", value: (incomeGap / 12 >= 0 ? "+" : "") + `$${(incomeGap / 12).toFixed(0)}` },
    { label: "Investment Income/mo", value: `$${(investmentIncome / 12).toFixed(0)}` },
    { label: "Status", value: isOnTrack ? "✅ On Track" : "⚠️ Gap Exists" },
    { label: "Years to Retire", value: `${yearsToRetire} years` },
  ];

  return { monthlyIncomeNeeded: retireExpenses, retirementPortfolio: portfolioAtRetirement, socialSecurity, pensionIncome: pension, investmentIncome, incomeGap, isOnTrack, barData, breakdown, summaryStats };
}

const DEFAULTS = { curAge: "40", retAge: "65", savings: "150000", monthly: "1500", expenses: "5000", ss: "2000", pension: "500", returnRate: "7" };

export default function RetirementCalculator() {
  const [curAge, setCurAge] = useState(DEFAULTS.curAge);
  const [retAge, setRetAge] = useState(DEFAULTS.retAge);
  const [savings, setSavings] = useState(DEFAULTS.savings);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [ss, setSs] = useState(DEFAULTS.ss);
  const [pension, setPension] = useState(DEFAULTS.pension);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [result, setResult] = useState<RetirementResult | null>(null);

  const calculate = () => setResult(calcRetirement(parseInt(curAge) || 40, parseInt(retAge) || 65, parseFloat(savings) || 150000, parseFloat(monthly) || 1500, parseFloat(expenses) || 5000, parseFloat(ss) || 2000, parseFloat(pension) || 500, parseFloat(returnRate) || 7));
  const reset = () => { setCurAge(DEFAULTS.curAge); setRetAge(DEFAULTS.retAge); setSavings(DEFAULTS.savings); setMonthly(DEFAULTS.monthly); setExpenses(DEFAULTS.expenses); setSs(DEFAULTS.ss); setPension(DEFAULTS.pension); setReturnRate(DEFAULTS.returnRate); setResult(calcRetirement(40, 65, 150000, 1500, 5000, 2000, 500, 7)); };
  useEffect(() => { setResult(calcRetirement(40, 65, 150000, 1500, 5000, 2000, 500, 7)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How much do I need to retire?", answer: "The 4% rule: retire on 25x your annual expenses. For $60,000/year spending: $1,500,000. For $80,000/year: $2,000,000. For $100,000/year: $2,500,000. Subtract expected annual Social Security and pension income before calculating the portfolio needed. Example: $80K expenses − $24K SS − $6K pension = $50K from portfolio → need $1.25M." },
    { question: "What is a good monthly retirement savings rate?", answer: "Financial advisors recommend saving 15% of gross income for retirement (including employer match). For specific targets: Max 401(k): $23,000/year (2024). Max IRA: $7,000/year. Employer match: contribute at least enough to capture the full match (typically 3–6% of salary). If you're starting late (40s–50s), aim for 20–25% of income." },
    { question: "When should I claim Social Security?", answer: "Earliest: age 62 (reduced by 25–30%). Full retirement age: 66–67 (based on birth year). Maximum: age 70 (increases ~8%/year after FRA). Claiming at 70 vs. 62 can result in 76% higher monthly benefit. Break-even is typically around age 82. If you're healthy and have other income, delay to 70 for maximum lifetime income." },
    { question: "How should my retirement portfolio be allocated?", answer: "General rule: subtract your age from 110 to get your stock allocation. Age 60: 50% stocks, 50% bonds. Aggressive target-date funds: 60–70% stocks at retirement. The sequence of returns risk means a market crash in early retirement can devastate a portfolio — have 1–2 years of expenses in cash to avoid selling equities at a loss." },
    { question: "What expenses will I have in retirement?", answer: "Most expenses stay similar or increase: healthcare rises significantly. Housing costs may fall if mortgage is paid off. Travel and leisure often increase in early retirement. Income taxes may change based on withdrawal strategy. Rule of thumb: plan for 70–80% of pre-retirement income for the first 10 years, then adjust based on health and lifestyle." },
    { question: "What is catch-up contribution?", answer: "Workers age 50+ can contribute extra to retirement accounts: 401(k): extra $7,500/year ($30,500 total in 2024). IRA: extra $1,000/year ($8,000 total). These catch-up provisions allow late starters to accelerate savings in peak earning years. Use them if you're behind on retirement savings." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Retirement Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Retirement Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Current Age</label><div className={inp}><input type="number" value={curAge} onChange={e => setCurAge(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Retire Age</label><div className={inp}><input type="number" value={retAge} onChange={e => setRetAge(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Return Rate</label><div className={inp}><input type="number" value={returnRate} onChange={e => setReturnRate(e.target.value)} step={0.5} className={ci} /><span className="pr-2 text-muted-foreground text-sm">%</span></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Current Savings</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={savings} onChange={e => setSavings(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Monthly Savings</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Monthly Expenses</label><div className={inp}><span className="pl-2 text-muted-foreground text-sm">$</span><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Social Security</label><div className={inp}><span className="pl-2 text-muted-foreground text-sm">$</span><input type="number" value={ss} onChange={e => setSs(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Pension/mo</label><div className={inp}><span className="pl-2 text-muted-foreground text-sm">$</span><input type="number" value={pension} onChange={e => setPension(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.isOnTrack ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500" : "bg-amber-50 dark:bg-amber-950/20 border-amber-500"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.isOnTrack ? "text-emerald-600" : "text-amber-600"}`}>{result.isOnTrack ? "✅ Retirement Status: On Track" : "⚠️ Retirement Status: Gap Exists"}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.retirementPortfolio.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Portfolio at retirement · Gap: {result.incomeGap >= 0 ? "+" : ""}${(result.incomeGap / 12).toFixed(0)}/mo</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Portfolio", `$${result.retirementPortfolio.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Invest Income", `$${(result.investmentIncome / 12).toFixed(0)}/mo`], ["Monthly Gap", (result.incomeGap / 12 >= 0 ? "+" : "") + `$${(result.incomeGap / 12).toFixed(0)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Retirement Analysis</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Monthly Surplus/Deficit" ? "font-bold border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className={`py-2.5 text-right font-semibold ${r.label === "Monthly Surplus/Deficit" && result.isOnTrack ? "text-emerald-600" : r.label === "Monthly Surplus/Deficit" ? "text-amber-600" : ""}`}>{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Monthly Income Sources</h3>
                <ResponsiveContainer width="100%" height={220}><BarChart data={result.barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="source" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v.toLocaleString()}`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}/mo`, ""]} /><Bar dataKey="amount" radius={[4, 4, 0, 0]}>{result.barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}</Bar></BarChart></ResponsiveContainer>
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
            <h2>What Is a Retirement Calculator?</h2>
            <p>A <strong>retirement calculator</strong> projects your portfolio at retirement, estimates monthly income from all sources (investments, Social Security, pension), compares it against your planned expenses, and tells you whether you&apos;re on track or need to save more. This comprehensive planner integrates the 4% safe withdrawal rate framework with multi-source income analysis.</p>
            <h2>How Retirement Income Is Calculated</h2>
            <p>Portfolio at Retirement = Current Savings × (1+r)^n + Annual Savings × [(1+r)^n − 1] / r. Investment Income (4% SWR) = Portfolio × 4% ÷ 12 (monthly). Total Income = Investment Income + Social Security + Pension. Surplus/Deficit = Total Income − Monthly Expenses. A positive surplus means you&apos;re on track; negative means you need to save more or plan to spend less.</p>
            <h2>The Three Pillars of Retirement Income</h2>
            <p>Social Security: replaces ~40% of pre-retirement income at FRA. Delay to 70 for maximum benefit. Personal savings (401k, IRA, Roth): your largest controllable pillar. Aim for 25x annual expenses. Pension: increasingly rare in private sector. If you have one, it significantly reduces required portfolio size.</p>
            <h2>Sequence of Returns Risk</h2>
            <p>The biggest risk in retirement isn&apos;t low average returns — it&apos;s a market crash in the first 5–10 years. A 30% drop in Year 1 of retirement that forces selling assets at lows can permanently impair a portfolio. Mitigation: maintain 1–2 years of cash reserves, bucket strategy (short/mid/long-term buckets), flexible spending (spend less in down markets).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/retirement-calculator" />
          <PopularCalculators exclude="/calculator/retirement-calculator" />
        </div>
      </div>
    </>
  );
}
