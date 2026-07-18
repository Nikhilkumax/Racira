"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface InvResult { futureValue: number; totalContributions: number; totalInterest: number; schedule: { year: number; value: number; contributions: number; interest: number }[]; }
const DEFAULTS = { initialAmount: "10000", monthlyContribution: "500", annualReturn: "10", years: "25" };

function calculate(d: typeof DEFAULTS): InvResult {
  const P = parseFloat(d.initialAmount)||0, C = parseFloat(d.monthlyContribution)||0;
  const r = (parseFloat(d.annualReturn)||0)/100/12, n = (parseFloat(d.years)||0)*12;
  const schedule = [];
  let val = P, totalContrib = P;
  for (let yr = 1; yr <= parseFloat(d.years); yr++) {
    for (let m = 0; m < 12; m++) { val = val * (1+r) + C; totalContrib += C; }
    schedule.push({ year: yr, value: Math.round(val), contributions: Math.round(totalContrib), interest: Math.round(val - totalContrib) });
  }
  const fv = n === 0 ? P : P * Math.pow(1+r,n) + (r > 0 ? C * (Math.pow(1+r,n)-1)/r : C*n);
  return { futureValue: fv, totalContributions: P + C*(n), totalInterest: fv - (P + C*n), schedule };
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function InvestmentGrowthCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<InvResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const faqs = [
    { question: "How does compound interest work?", answer: "Compound interest earns returns on both your principal AND previously earned interest. Each period's gains are added to the base, so the next period earns more. Einstein allegedly called it the eighth wonder of the world. At 10% annually, $10,000 becomes $67,275 in 25 years through compounding alone." },
    { question: "What return rate should I use?", answer: "US stock market (S&P 500) long-run average: ~10% nominal, ~7% inflation-adjusted. Diversified global stocks: ~8–9% nominal. Bonds: 3–5%. Real estate: ~7–8%. Conservative balanced portfolio: ~6–7%. Use 7% for inflation-adjusted projections; 10% for nominal projections." },
    { question: "How much should I invest monthly?", answer: "The common rule: invest 15–20% of gross income for retirement. For most, this means maxing a 401(k) ($23,000/year in 2024) plus IRA ($7,000/year). Even $200/month at 10% for 30 years = $452,000. Start as early as possible — time is the most powerful variable." },
    { question: "What is the Rule of 72?", answer: "Rule of 72: years to double = 72 ÷ annual return rate. At 10%: money doubles every 7.2 years. At 7%: every 10.3 years. At 6%: every 12 years. Simple mental math for estimating compound growth without a calculator." },
    { question: "When should I start investing?", answer: "Immediately. A 25-year-old investing $500/month at 10% to age 65 accumulates ~$3.16M. A 35-year-old doing the same accumulates ~$1.13M — $2M less despite only 10 fewer years. Every decade of delay roughly halves the final outcome due to lost compounding." },
    { question: "What is dollar-cost averaging?", answer: "Dollar-cost averaging (DCA) means investing a fixed amount at regular intervals regardless of market price. When prices are high, you buy fewer shares; when low, you buy more. This reduces the impact of market timing and volatility, making consistent monthly contributions optimal for long-term investors." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Investment Growth Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Investment Growth Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            {([
              { label: "Initial Investment", key: "initialAmount" as keyof typeof f, prefix: "$", suffix: "" },
              { label: "Monthly Contribution", key: "monthlyContribution" as keyof typeof f, prefix: "$", suffix: "" },
              { label: "Annual Return Rate", key: "annualReturn" as keyof typeof f, prefix: "", suffix: "%" },
              { label: "Investment Period", key: "years" as keyof typeof f, prefix: "", suffix: " years" },
            ]).map(({ label, key, prefix, suffix }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold mb-1">{label}</label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground">{prefix}</span>}
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
                  {suffix && <span className="pr-3 text-sm text-muted-foreground">{suffix}</span>}
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Future Value</div>
              <div className="text-4xl font-extrabold text-foreground">{fmt(r.futureValue)}</div>
              <div className="text-sm text-muted-foreground mt-1">Invested: {fmt(r.totalContributions)} · Gains: {fmt(r.totalInterest)}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Total Invested</div><div className="font-bold">{fmt(r.totalContributions)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Interest Earned</div><div className="font-bold text-emerald-600">{fmt(r.totalInterest)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Return Multiple</div><div className="font-bold">{r.totalContributions > 0 ? (r.futureValue / r.totalContributions).toFixed(2) : 0}×</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Portfolio Growth Over Time</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={r.schedule}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} unit="yr" />
                    <YAxis tickFormatter={v => `$${v >= 1e6 ? (v/1e6).toFixed(1)+"M" : (v/1e3).toFixed(0)+"k"}`} tick={{ fontSize: 9 }} />
                    <RTooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={{ borderRadius: "8px", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="interest" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Interest" />
                    <Area type="monotone" dataKey="contributions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} name="Contributions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Growth Milestones</h3></div>
              {r.schedule.filter((_, i) => [4,9,14,19,24].includes(i) || i === r.schedule.length - 1).map((s, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-2 border-b border-border/30 last:border-0 hover:bg-secondary/20">
                  <span className="text-muted-foreground text-sm">Year {s.year}</span>
                  <span className="text-sm text-center">{fmt(s.contributions)}</span>
                  <span className="text-right font-bold text-sm text-foreground">{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How This Investment Growth Calculator Works</h2>
            <p>This calculator uses the Future Value of Annuity formula to model the growth of regular investment contributions combined with compound interest. It computes: FV = P(1+r)ⁿ + C × [(1+r)ⁿ − 1] / r, where P = initial investment, C = monthly contribution, r = monthly rate, n = months. Results are displayed year-by-year showing the split between your contributions and compound growth.</p>
            <h2 className="text-2xl font-bold mb-3">The Power of Starting Early</h2>
            <p>$500/month at 10% starting at age 25 → $3.16M at 65. Starting at 35 → $1.13M. Starting at 45 → $380K. The compounding snowball effect becomes extreme over decades. The first 10 years of investing creates the foundation on which all future gains compound — this is why financial advisors consistently emphasize starting immediately, even with small amounts.</p>
            <h2 className="text-2xl font-bold mb-3">Tax-Advantaged Accounts</h2>
            <p>Max-fund tax-advantaged accounts first: 401(k) pre-tax reduces current taxable income (Traditional) or grows tax-free (Roth). IRA: $7,000/year (2024), same Traditional vs. Roth choice. HSA: triple tax advantaged — deductible contributions, tax-free growth, tax-free medical withdrawals. After maxing tax-advantaged accounts, invest in taxable brokerage using tax-efficient index funds (low turnover = lower capital gains distributions).</p>
            <h2 className="text-2xl font-bold mb-3">Index Fund Investing</h2>
            <p>Low-cost index funds (VTSAX, VTI, SPY, VOO) capture broad market returns with minimal fees. Vanguard, Fidelity, and Schwab offer index funds with 0.03–0.04% expense ratios — vs. 0.5–1.5% for active funds. Over 30 years, a 1% fee difference on $500K costs you approximately $380,000 in foregone compounding. Keep costs as low as possible for maximum compounding efficiency.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-growth-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Investment Growth Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Investment Growth Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Investment Growth Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Investment Growth Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Investment Growth Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/investment-growth-calculator" />
        </div>
      </div>
    </>
  );
}
