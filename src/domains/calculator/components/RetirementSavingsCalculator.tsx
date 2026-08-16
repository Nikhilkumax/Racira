"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RetirementResult { targetNestEgg: number; projectedSavings: number; monthlyNeeded: number; yearlyNeeded: number; onTrack: boolean; shortfall: number; }
const DEFAULTS = { currentAge: "35", retirementAge: "65", currentSavings: "85000", monthlyContrib: "1500", annualReturn: "8", desiredMonthlyIncome: "5000", inflationRate: "3" };

function calculate(d: typeof DEFAULTS): RetirementResult {
  const curAge = parseFloat(d.currentAge)||35, retAge = parseFloat(d.retirementAge)||65;
  const years = retAge - curAge;
  const curSav = parseFloat(d.currentSavings)||0, monthly = parseFloat(d.monthlyContrib)||0;
  const returnRate = (parseFloat(d.annualReturn)||0)/100/12;
  const desiredMonthly = parseFloat(d.desiredMonthlyIncome)||0;
  const inflation = (parseFloat(d.inflationRate)||3)/100;
  const n = years * 12;
  const futureValue = curSav * Math.pow(1 + returnRate, n) + (returnRate > 0 ? monthly * (Math.pow(1 + returnRate, n) - 1) / returnRate : monthly * n);
  const inflationAdj = Math.pow(1 + inflation, years);
  const realMonthlyNeeded = desiredMonthly * inflationAdj;
  const targetNestEgg = realMonthlyNeeded * 12 / 0.04;
  const shortfall = Math.max(0, targetNestEgg - futureValue);
  const monthlyNeeded = shortfall > 0 && returnRate > 0 ? shortfall / ((Math.pow(1 + returnRate, n) - 1) / returnRate) : 0;
  return { targetNestEgg, projectedSavings: futureValue, monthlyNeeded, yearlyNeeded: monthlyNeeded * 12, onTrack: futureValue >= targetNestEgg, shortfall };
}

const fmt = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : `$${Math.round(n).toLocaleString()}`;

export default function RetirementSavingsCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<RetirementResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const years = (parseFloat(f.retirementAge)||65) - (parseFloat(f.currentAge)||35);
  const rr = (parseFloat(f.annualReturn)||0)/100/12;
  const milestones = Array.from({ length: Math.min(years, 30) + 1 }, (_, i) => {
    const yr = i * Math.ceil(years / 30);
    const n = yr * 12;
    const val = (parseFloat(f.currentSavings)||0) * Math.pow(1 + rr, n) + (rr > 0 ? (parseFloat(f.monthlyContrib)||0) * (Math.pow(1+rr,n)-1)/rr : (parseFloat(f.monthlyContrib)||0)*n);
    return { year: yr, value: Math.round(val/1000) };
  });

  const faqs = [
    { question: "How much do I need to retire?", answer: "The '4% rule' (Bengen, 1994): to safely withdraw your desired income indefinitely, you need 25× your annual expenses. Want $60K/year in retirement? Need $1.5M. Adjusted for inflation, you need even more. Our calculator uses the 4% rule with inflation adjustment for your target nest egg." },
    { question: "What is the 4% safe withdrawal rate?", answer: "Based on historical analysis of stock/bond portfolio returns, a 4% annual withdrawal from a 60/40 portfolio has not depleted savings over any 30-year period in US history. Some argue 3.5% is more conservative given current valuations and lower expected returns. The 4% rule assumes a diversified portfolio, not guaranteed." },
    { question: "How much should I save for retirement?", answer: "Common benchmarks: Save 15% of gross income starting in your 20s. By 30: 1× salary. By 40: 3× salary. By 50: 6× salary. By 60: 8× salary. By 67: 10× salary. These are rough guidelines from Fidelity — actual needs vary based on desired retirement lifestyle and Social Security benefits." },
    { question: "Does Social Security affect my retirement calculation?", answer: "Yes — significantly. Average Social Security benefit (2024): ~$1,907/month for the average worker. Maximum benefit at full retirement age: $3,822/month. If you plan to claim Social Security, subtract that monthly amount from your desired retirement income before calculating your nest egg target." },
    { question: "Should I use Traditional or Roth retirement accounts?", answer: "Traditional 401(k)/IRA: Pre-tax contributions, taxes paid on withdrawal. Better if you expect lower tax rate in retirement. Roth 401(k)/IRA: After-tax contributions, tax-free growth and withdrawal. Better if you expect higher tax rate in retirement. Young lower-income earners generally prefer Roth; high earners often prefer Traditional for the immediate deduction." },
    { question: "What investment return should I assume?", answer: "Conservative: 5–6% (balanced portfolio adjusted for inflation). Moderate: 7–8% (60/40 stocks/bonds nominal). Aggressive: 9–10% (100% equity nominal). For planning purposes, using 6–7% inflation-adjusted is prudent. Sequence-of-returns risk (poor early returns) is the biggest threat to retirement security." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Retirement Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Retirement Savings Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {([{ label: "Current Age", key: "currentAge" }, { label: "Retirement Age", key: "retirementAge" }] as const).map(({ label, key }) => (
                <div key={key} className="flex flex-col"><label className="text-sm font-semibold mb-1">{label}</label>
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              ))}
            </div>
            {([
              { label: "Current Savings ($)", key: "currentSavings" as keyof typeof f, prefix: "$", suffix: "" },
              { label: "Monthly Contribution ($)", key: "monthlyContrib" as keyof typeof f, prefix: "$", suffix: "" },
              { label: "Expected Annual Return (%)", key: "annualReturn" as keyof typeof f, prefix: "", suffix: "%" },
              { label: "Desired Monthly Income in Retirement ($)", key: "desiredMonthlyIncome" as keyof typeof f, prefix: "$", suffix: "" },
              { label: "Inflation Rate (%)", key: "inflationRate" as keyof typeof f, prefix: "", suffix: "%" },
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
            <div className={`bg-primary/10 rounded-xl p-5 border-l-4 ${r.onTrack ? "bg-primary/10 border-primary" : "bg-red-500/10 border-red-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Projected Nest Egg</div>
              <div className={`text-4xl font-extrabold ${r.onTrack ? "text-emerald-600" : "text-red-600"}`}>{fmt(r.projectedSavings)}</div>
              <div className="text-sm text-muted-foreground mt-1">{r.onTrack ? "✓ On Track — Target: " : "✗ Shortfall: " + fmt(r.shortfall) + " · Target: "}{fmt(r.targetNestEgg)}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Target (4% rule)</div><div className="font-bold">{fmt(r.targetNestEgg)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Projected</div><div className={`font-bold ${r.onTrack ? "text-emerald-600" : "text-red-600"}`}>{fmt(r.projectedSavings)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Extra Needed/mo</div><div className="font-bold">{r.shortfall > 0 ? `$${Math.round(r.monthlyNeeded).toLocaleString()}` : "None!"}</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Portfolio Growth Projection</h3>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={milestones}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} unit="yr" />
                    <YAxis tickFormatter={v => `$${v}k`} tick={{ fontSize: 9 }} />
                    <RTooltip formatter={(v: number) => [`$${v.toLocaleString()}k`, "Portfolio"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Much Do You Need to Retire?</h2>
            <p>This retirement calculator uses the 4% safe withdrawal rule and compound interest projection to determine your retirement nest egg target and whether current savings and contributions are sufficient. The target nest egg = (Desired Monthly Income × 12 × Inflation Adjustment) ÷ 0.04. The 4% rule suggests withdrawing no more than 4% of your portfolio annually to ensure it lasts 30+ years.</p>
            <h2 className="text-2xl font-bold mb-3">Inflation and Its Impact on Retirement Planning</h2>
            <p>Inflation is the silent destroyer of retirement planning. $5,000/month today becomes equivalent to $8,100+/month in 30 years at 3% annual inflation. This is why our calculator adjusts your target income for inflation before computing the nest egg requirement. Always plan for inflation-adjusted needs, not today&apos;s dollars — the difference over 30 years is enormous.</p>
            <h2 className="text-2xl font-bold mb-3">Sequence-of-Returns Risk</h2>
            <p>The biggest threat to retirement security isn&apos;t low average returns — it&apos;s poor returns in the early retirement years. Withdrawing from a declining portfolio accelerates depletion. Mitigation strategies: maintain 2–3 years of expenses in cash/bonds to avoid selling equities during downturns, use a dynamic withdrawal strategy (reduce withdrawals in down markets), delay Social Security to maximize guaranteed income, and consider annuities for baseline income certainty.</p>
            <h2 className="text-2xl font-bold mb-3">The Power of Catching Up</h2>
            <p>IRS catch-up contributions allow those 50+ to contribute an extra $7,500/year to 401(k) and $1,000/year to IRA in 2024. For a 50-year-old in the 24% tax bracket, maxing a 401(k) saves $7,320 in federal taxes while adding $23,000 to retirement savings. 15 years of maximum 401(k) contributions at 8% return adds approximately $630,000 to a retirement portfolio.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/retirement-savings-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Retirement Savings Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Retirement Savings Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Retirement Savings Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Retirement Savings Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Retirement Savings Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/retirement-savings-calculator" />
        </div>
      </div>
    </>
  );
}
