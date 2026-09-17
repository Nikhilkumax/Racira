"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface InvInputs {
  initial: number;
  monthly: number;
  annualReturn: number;
  years: number;
  inflationRate: number;
  annualContributionIncrease: number;
}

interface InvResult {
  futureValue: number;
  totalContributions: number;
  totalGrowth: number;
  realValue: number;
  effectiveReturn: number;
  chartData: { year: number; contributions: number; growth: number; total: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcInvestment(inp: InvInputs): InvResult {
  const monthlyRate = inp.annualReturn / 100 / 12;
  const totalMonths = inp.years * 12;
  const inflationMonthly = inp.inflationRate / 100 / 12;
  const contribGrowth = inp.annualContributionIncrease / 100 / 12;

  let balance = inp.initial;
  let totalContrib = inp.initial;
  let monthlyContrib = inp.monthly;
  const chartData: { year: number; contributions: number; growth: number; total: number }[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContrib;
    totalContrib += monthlyContrib;
    if (inp.annualContributionIncrease > 0 && m % 12 === 0) {
      monthlyContrib *= (1 + inp.annualContributionIncrease / 100);
    }
    if (m % 12 === 0) {
      const yr = m / 12;
      chartData.push({ year: yr, contributions: Math.round(totalContrib), growth: Math.round(balance - totalContrib), total: Math.round(balance) });
    }
  }

  const futureValue = balance;
  const totalGrowth = futureValue - totalContrib;
  const realValue = inp.inflationRate > 0 ? futureValue / Math.pow(1 + inp.inflationRate / 100, inp.years) : futureValue;
  const effectiveReturn = totalContrib > 0 ? ((futureValue / totalContrib - 1) * 100) : 0;

  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
  const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Initial Investment", value: `$${fmt(inp.initial)}` },
    { label: "Monthly Contribution", value: `$${fmt(inp.monthly)}/mo` },
    { label: "Investment Period", value: `${inp.years} years` },
    { label: "Annual Return", value: `${inp.annualReturn}%` },
    { label: "Total Contributions", value: `$${fmt(totalContrib)}` },
    { label: "Investment Growth", value: `$${fmt(totalGrowth)}`, highlight: true },
    { label: "Future Value", value: `$${fmt(futureValue)}`, highlight: true },
    { label: "Real Value (Inflation-Adjusted)", value: `$${fmt(realValue)}` },
  ];

  const summaryStats = [
    { label: "Future Value", value: `$${fmt(futureValue)}` },
    { label: "Total Contributions", value: `$${fmt(totalContrib)}` },
    { label: "Investment Growth", value: `$${fmt(totalGrowth)}` },
    { label: "Real Value", value: `$${fmt(realValue)}` },
    { label: "Effective Return", value: `${effectiveReturn.toFixed(1)}%` },
    { label: "Growth Multiple", value: `${totalContrib > 0 ? (futureValue / totalContrib).toFixed(2) : "0"}x` },
  ];

  return { futureValue, totalContributions: totalContrib, totalGrowth, realValue, effectiveReturn, chartData, breakdown, summaryStats };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: InvInputs = { initial: 10000, monthly: 500, annualReturn: 7, years: 20, inflationRate: 3, annualContributionIncrease: 2 };

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function InvestmentCalculator() {
  const [initial, setInitial] = useState(String(DEFAULTS.initial));
  const [monthly, setMonthly] = useState(String(DEFAULTS.monthly));
  const [annualReturn, setAnnualReturn] = useState(String(DEFAULTS.annualReturn));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [inflationRate, setInflationRate] = useState(String(DEFAULTS.inflationRate));
  const [annualIncrease, setAnnualIncrease] = useState(String(DEFAULTS.annualContributionIncrease));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<InvResult | null>(null);

  const getInputs = (): InvInputs => ({
    initial: parseFloat(initial) || 0, monthly: parseFloat(monthly) || 0,
    annualReturn: parseFloat(annualReturn) || 0, years: parseInt(years) || 1,
    inflationRate: parseFloat(inflationRate) || 0,
    annualContributionIncrease: parseFloat(annualIncrease) || 0,
  });

  const calculate = () => setResult(calcInvestment(getInputs()));
  const reset = () => {
    setInitial(String(DEFAULTS.initial)); setMonthly(String(DEFAULTS.monthly));
    setAnnualReturn(String(DEFAULTS.annualReturn)); setYears(String(DEFAULTS.years));
    setInflationRate(String(DEFAULTS.inflationRate)); setAnnualIncrease(String(DEFAULTS.annualContributionIncrease));
    setResult(calcInvestment(DEFAULTS));
  };

  useEffect(() => { setResult(calcInvestment(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is compound interest?", answer: "Compound interest is interest earned on both the initial principal and previously accumulated interest. Unlike simple interest, compounding accelerates growth over time — the longer you invest, the faster your money grows. This is why starting early is one of the most powerful wealth-building strategies." },
    { question: "How does monthly contribution affect growth?", answer: "Regular monthly contributions dramatically increase your final balance. A $500/month contribution over 20 years at 7% adds $120,000 in contributions but generates over $160,000 in additional growth due to compounding. The earlier you start contributing, the greater the compounding effect." },
    { question: "What return rate should I use?", answer: "Historically, a diversified stock portfolio has returned about 7–10% annually before inflation. After inflation (typically 2–3%), the real return is about 4–7%. For conservative portfolios with more bonds, use 4–6%. For aggressive growth portfolios, 8–10% is reasonable over long periods." },
    { question: "Why does inflation matter?", answer: "Inflation erodes purchasing power over time. $1 million today buys significantly more than $1 million in 20 years. Our calculator shows both nominal and inflation-adjusted (real) values so you understand what your investment will actually be worth in today's dollars." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Investment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Investment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Investment ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={initial} onChange={e => setInitial(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Monthly Contribution ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Annual Return (%)</label>
                <div className={inp}><input type="number" value={annualReturn} onChange={e => setAnnualReturn(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Investment Period (years)</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options
                <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Inflation & Growth</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Inflation Rate (%)</label>
                      <div className={inp}><input type="number" value={inflationRate} onChange={e => setInflationRate(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Annual Contribution Increase (%)</label>
                      <div className={inp}><input type="number" value={annualIncrease} onChange={e => setAnnualIncrease(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%/yr</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Future Value</div>
                <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Growth: ${result.totalGrowth.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Real Value: ${result.realValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Contributions", `$${result.totalContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Growth", `$${result.totalGrowth.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Multiple", `${result.totalContributions > 0 ? (result.futureValue / result.totalContributions).toFixed(2) : "0"}x`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Investment Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Growth Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="contributions" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Contributions" />
                    <Area type="monotone" dataKey="growth" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Growth" />
                  </AreaChart>
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
            <h2 className="text-2xl font-bold mb-3">How the Investment Calculator Works</h2>
            <p>This calculator projects the future value of your investments using compound interest with regular contributions. The core formula for each monthly period is: <strong>Balance = Balance × (1 + monthly rate) + Monthly Contribution</strong>. Over time, this creates exponential growth as your returns generate their own returns.</p>
            <h2 className="text-2xl font-bold mb-3">Why Regular Contributions Matter</h2>
            <p>Monthly contributions are the single most controllable factor in investment growth. While you can&apos;t control market returns, you can control how much you invest each month. Even small increases — like adding $50/month more — can compound into tens of thousands of dollars over 20+ years.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-calculator" />
          <PopularCalculators exclude="/calculator/investment-calculator" />
        </div>
      </div>
    </>
  );
}
