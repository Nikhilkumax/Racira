"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface RateInputs {
  hourlyRate: number;
  hours: number;
  expensePct: number;
  level: string;
  taxPct: number;
  targetIncome: number;
}

interface RateResults {
  levelLabel: string;
  levelMultiplier: number;
  baseRevenue: number;
  adjustedRevenue: number;
  expenses: number;
  netProfit: number;
  afterTax: number;
  effectiveRate: number;
  profitMargin: number;
  hoursToTarget: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const EXPERIENCE_LEVELS: Record<string, { label: string; multiplier: number }> = {
  entry: { label: "Entry (0–2 yrs)", multiplier: 1.0 },
  mid: { label: "Mid (3–6 yrs)", multiplier: 1.35 },
  senior: { label: "Senior (7+ yrs)", multiplier: 1.8 },
  expert: { label: "Expert / Specialist", multiplier: 2.3 },
};

function calcRate(i: RateInputs): RateResults {
  const lvl = EXPERIENCE_LEVELS[i.level] ?? EXPERIENCE_LEVELS.mid;
  const baseRevenue = i.hourlyRate * i.hours;
  const adjustedRevenue = baseRevenue * lvl.multiplier;
  const expenses = adjustedRevenue * (i.expensePct / 100);
  const netProfit = adjustedRevenue - expenses;
  const afterTax = netProfit * (1 - i.taxPct / 100);
  const effectiveRate = i.hours > 0 ? netProfit / i.hours : 0;
  const profitMargin = adjustedRevenue > 0 ? (netProfit / adjustedRevenue) * 100 : 0;
  const hoursToTarget = effectiveRate > 0 ? i.targetIncome / effectiveRate : 0;

  const chartData = [
    { name: "Base Revenue", value: Math.round(baseRevenue) },
    { name: "Adjusted (level)", value: Math.round(adjustedRevenue) },
    { name: "After Expenses", value: Math.round(netProfit) },
  ];

  const breakdown = [
    { label: `Base Revenue (${i.hours} hr × $${i.hourlyRate})`, value: `$${baseRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: `Level Multiplier (${lvl.label})`, value: `${lvl.multiplier.toFixed(2)}×` },
    { label: "Adjusted Revenue", value: `$${adjustedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: `Expenses (${i.expensePct}%)`, value: `-$${expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Net Profit", value: `$${netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, highlight: true, isTotal: true },
    { label: `After Tax (${i.taxPct}%)`, value: `$${afterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Effective Hourly Rate", value: `$${effectiveRate.toFixed(2)}/hr` },
    { label: "Profit Margin", value: `${profitMargin.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Net Profit", value: `$${netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "After Tax", value: `$${afterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Gross Revenue", value: `$${adjustedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Profit Margin", value: `${profitMargin.toFixed(1)}%` },
    { label: "Effective Rate", value: `$${effectiveRate.toFixed(2)}/hr` },
    { label: "Expenses", value: `$${expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Hours to $${i.targetIncome.toLocaleString()}/mo", value: `${hoursToTarget.toFixed(1)} hr/mo` },
    { label: "Experience Level", value: lvl.label },
  ];

  return { levelLabel: lvl.label, levelMultiplier: lvl.multiplier, baseRevenue, adjustedRevenue, expenses, netProfit, afterTax, effectiveRate, profitMargin, hoursToTarget, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  hourlyRate: "75",
  hours: "100",
  expensePct: "30",
  level: "mid",
  taxPct: "25",
  targetIncome: "6000",
};

// 4. Component
export default function FreelanceDesignRateCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<RateResults>(() => calcRate({ hourlyRate: 75, hours: 100, expensePct: 30, level: "mid", taxPct: 25, targetIncome: 6000 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcRate({ hourlyRate: 75, hours: 100, expensePct: 30, level: "mid", taxPct: 25, targetIncome: 6000 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcRate({
        hourlyRate: parseFloat(inputs.hourlyRate) || 0,
        hours: parseFloat(inputs.hours) || 0,
        expensePct: parseFloat(inputs.expensePct) || 0,
        level: inputs.level,
        taxPct: parseFloat(inputs.taxPct) || 0,
        targetIncome: parseFloat(inputs.targetIncome) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRate({ hourlyRate: 75, hours: 100, expensePct: 30, level: "mid", taxPct: 25, targetIncome: 6000 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const hourlyRate = parseFloat(inputs.hourlyRate) || 0;
  const hours = parseFloat(inputs.hours) || 0;
  const expensePct = parseFloat(inputs.expensePct) || 0;
  if (hourlyRate <= 0) errors.hourlyRate = "Must be greater than 0";
  if (hours <= 0) errors.hours = "Must be greater than 0";
  if (expensePct < 0 || expensePct > 80) errors.expensePct = "Must be 0–80%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What should a freelance designer charge per hour?", answer: "Typical US freelance design rates run $50–100/hr for mid-career work and $100–150+ for senior or specialist work. A common rule: multiply your desired annual salary by 2–3 to cover taxes, insurance, software, and downtime, then divide by billable hours (about 1,200–1,500 per year) to get the hourly rate." },
    { question: "Why multiply for experience level?", answer: "An entry-level designer produces at roughly half the speed and quality of a senior one, so the market prices experience at a premium. The multipliers here (1.0× entry, 1.35× mid, 1.8× senior, 2.3× expert) are industry-typical rate bands — they scale the same base rate into what each level actually commands." },
    { question: "What counts as freelancer expenses?", answer: "Software subscriptions, hardware, insurance, marketing, accounting, and self-employment tax can eat 25–40% of gross revenue. The 30% default is a realistic mid-point. Deducting them from adjusted revenue is what turns a headline hourly rate into the net profit you can actually live on." },
    { question: "How do I hit a target monthly income?", answer: "Divide your monthly target by your effective hourly rate (net of expenses). At $75/hr with 30% expenses and a mid-level multiplier, the effective rate is about $70.88/hr — so a $6,000/month target needs roughly 85 billable hours a month, about 21 hours a week. The calculator reports this directly." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Freelance Design Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Freelance Design Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hourlyRate" className={lbl}>Hourly Rate</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="hourlyRate" type="number" min="10" max="500" step="5" value={inputs.hourlyRate} onChange={(e) => set("hourlyRate")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/hr</span>
                </div>
                {errors.hourlyRate && <p className="text-xs text-red-500 font-medium mt-1">{errors.hourlyRate}</p>}
              </div>
              <div>
                <label htmlFor="hours" className={lbl}>Project Hours</label>
                <div className={inp}>
                  <input id="hours" type="number" min="1" max="2000" step="5" value={inputs.hours} onChange={(e) => set("hours")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">hr</span>
                </div>
                {errors.hours && <p className="text-xs text-red-500 font-medium mt-1">{errors.hours}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expensePct" className={lbl}>Expense Rate</label>
                <div className={inp}>
                  <input id="expensePct" type="number" min="0" max="80" step="1" value={inputs.expensePct} onChange={(e) => set("expensePct")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">%</span>
                </div>
                {errors.expensePct && <p className="text-xs text-red-500 font-medium mt-1">{errors.expensePct}</p>}
              </div>
              <div>
                <label htmlFor="level" className={lbl}>Experience Level</label>
                <select id="level" value={inputs.level} onChange={(e) => set("level")(e.target.value)} className={sel}>
                  {Object.entries(EXPERIENCE_LEVELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Taxes & Target</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="taxPct" className={lbl}>Tax Rate</label>
                        <div className={inp}>
                          <input id="taxPct" type="number" min="0" max="50" step="1" value={inputs.taxPct} onChange={(e) => set("taxPct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="targetIncome" className={lbl}>Target Monthly Income</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="targetIncome" type="number" min="0" step="500" value={inputs.targetIncome} onChange={(e) => set("targetIncome")(e.target.value)} className={ci} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Net Profit</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.afterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })} after tax · ${result.effectiveRate.toFixed(2)}/hr effective · {result.profitMargin.toFixed(1)}% margin
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Gross Revenue", `$${result.adjustedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ["Expenses", `$${result.expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ["Profit Margin", `${result.profitMargin.toFixed(1)}%`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${i === 2 ? "text-green-600" : "text-foreground"}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Revenue Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Revenue Progression</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The level multiplier lifts revenue; expenses and taxes take their cut before it reaches your pocket.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">From Hourly Rate to Take-Home</h2>
            <p>Freelance rates have a long chain before they reach your pocket: base rate × hours gives revenue, an experience multiplier adjusts for market position, expenses (software, insurance, marketing, self-employment tax) take 25–40%, and income tax takes its share. The headline rate is marketing; the effective rate is reality. This calculator walks the whole chain.</p>
            <h2 className="text-2xl font-bold mb-3">The Effective Rate Is the Number to Trust</h2>
            <p>Net profit divided by hours worked — the effective hourly rate — is what survives contact with the real world. At $75/hr with 30% expenses, you effectively earn $52.50/hr before taxes. That's the figure to compare against a salaried offer, and the one that tells you whether a "premium" rate actually is one after expenses.</p>
            <h2 className="text-2xl font-bold mb-3">Work Backward From Your Target</h2>
            <p>Instead of asking "what can I charge?", ask "what do I need to make?" Divide a target monthly income by the effective rate to get required billable hours — and compare that to your realistic capacity of 20–25 billable hours a week. If the required hours exceed capacity, the rate (or the level) has to rise, not the workweek.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freelance-design-rate-calculator" />
          <PopularCalculators exclude="/calculator/freelance-design-rate-calculator" />
        </div>
      </div>
    </>
  );
}
