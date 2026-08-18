"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface ArrInputs {
  currentMrr: number;
  newBusinessMrr: number;
  expansionMrr: number;
  churnedMrr: number;
  contractionMrr: number;
}

interface ChartPoint {
  month: string;
  arr: number;
}

interface ArrResults {
  currentArr: number;
  netMrrGrowth: number;
  netRetentionRate: number;
  annualChurnLoss: number;
  monthlyGrowthRate: number;
  projectedArr: number;
  chartData: ChartPoint[];
  schedule: { quarter: string; mrr: number; arr: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcArr(i: ArrInputs): ArrResults {
  const currentArr = i.currentMrr * 12;
  const netMrrGrowth = i.newBusinessMrr + i.expansionMrr - i.churnedMrr - i.contractionMrr;
  const netRetentionRate = i.currentMrr > 0 ? ((i.currentMrr + i.expansionMrr - i.churnedMrr - i.contractionMrr) / i.currentMrr) * 100 : 0;
  const monthlyGrowthRate = i.currentMrr > 0 ? netMrrGrowth / i.currentMrr : 0;
  const annualChurnLoss = (i.churnedMrr + i.contractionMrr) * 12;

  const chartData: ChartPoint[] = [{ month: "Now", arr: Math.round(i.currentMrr * 12) }];
  const schedule: { quarter: string; mrr: number; arr: number }[] = [];
  let projectedMrr = i.currentMrr;
  for (let m = 1; m <= 12; m++) {
    projectedMrr *= 1 + monthlyGrowthRate;
    chartData.push({ month: `Month ${m}`, arr: Math.round(projectedMrr * 12) });
    if (m % 3 === 0) schedule.push({ quarter: `Q${m / 3}`, mrr: Math.round(projectedMrr), arr: Math.round(projectedMrr * 12) });
  }
  const projectedArr = projectedMrr * 12;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  const breakdown = [
    { label: "Current MRR", value: fmt(i.currentMrr) },
    { label: "Current ARR (MRR × 12)", value: fmt(currentArr), highlight: true },
    { label: "New Business MRR", value: fmt(i.newBusinessMrr) },
    { label: "Expansion MRR (Upsells)", value: fmt(i.expansionMrr) },
    { label: "Churned MRR (Cancellations)", value: fmt(i.churnedMrr) },
    { label: "Contraction MRR (Downgrades)", value: fmt(i.contractionMrr) },
    { label: "Net MRR Growth", value: `${netMrrGrowth >= 0 ? "+" : ""}${fmt(netMrrGrowth)}` },
    { label: "Net Retention Rate (NRR)", value: `${netRetentionRate.toFixed(1)}%` },
    { label: "Annual Churn Loss", value: `-${fmt(annualChurnLoss)}` },
    { label: "Projected ARR (12 Months)", value: fmt(projectedArr), isTotal: true },
  ];

  const summaryStats = [
    { label: "Current ARR", value: fmt(currentArr) },
    { label: "Projected ARR (12 mo)", value: fmt(projectedArr) },
    { label: "Net MRR Growth", value: `${netMrrGrowth >= 0 ? "+" : ""}${fmt(netMrrGrowth)}` },
    { label: "Net Retention Rate", value: `${netRetentionRate.toFixed(1)}%` },
    { label: "Annual Churn Loss", value: `-${fmt(annualChurnLoss)}` },
    { label: "Implied Monthly Growth", value: `${(monthlyGrowthRate * 100).toFixed(1)}%` },
    { label: "Current MRR", value: fmt(i.currentMrr) },
    { label: "Annualized New Business", value: fmt(i.newBusinessMrr * 12) },
  ];

  return {
    currentArr,
    netMrrGrowth,
    netRetentionRate,
    annualChurnLoss,
    monthlyGrowthRate,
    projectedArr,
    chartData,
    schedule,
    breakdown,
    summaryStats,
  };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  currentMrr: "50000",
  newBusinessMrr: "5000",
  expansionMrr: "2000",
  churnedMrr: "1500",
  contractionMrr: "500",
};

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// 4. Component
export default function AnnualRecurringRevenueCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<ArrResults>(() =>
    calcArr({ currentMrr: 50000, newBusinessMrr: 5000, expansionMrr: 2000, churnedMrr: 1500, contractionMrr: 500 })
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcArr({ currentMrr: 50000, newBusinessMrr: 5000, expansionMrr: 2000, churnedMrr: 1500, contractionMrr: 500 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => {
    setResult(
      calcArr({
        currentMrr: parseFloat(inputs.currentMrr) || 0,
        newBusinessMrr: parseFloat(inputs.newBusinessMrr) || 0,
        expansionMrr: parseFloat(inputs.expansionMrr) || 0,
        churnedMrr: parseFloat(inputs.churnedMrr) || 0,
        contractionMrr: parseFloat(inputs.contractionMrr) || 0,
      })
    );
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcArr({ currentMrr: 50000, newBusinessMrr: 5000, expansionMrr: 2000, churnedMrr: 1500, contractionMrr: 500 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const vals: Record<string, number> = {};
  (Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]).forEach((k) => {
    vals[k] = parseFloat(inputs[k]) || 0;
    if (inputs[k].trim() === "") errors[k] = "Required";
    else if (vals[k] < 0) errors[k] = "Cannot be negative";
  });
  if (vals.currentMrr <= 0) errors.currentMrr = "Current MRR must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What is Annual Recurring Revenue (ARR)?", answer: "ARR is a key metric used by subscription-based businesses (like SaaS companies) that shows the annualized value of their recurring subscription revenue. It provides a predictable measure of revenue for the upcoming 12 months based on current subscribers." },
    { question: "How do you calculate ARR from MRR?", answer: "The simplest and most standard way to calculate ARR is to take your Monthly Recurring Revenue (MRR) and multiply it by 12. For example, if your current MRR is $10,000, your ARR is $120,000." },
    { question: "Should I include setup fees or consulting in ARR?", answer: "No. ARR should only include fixed, predictable, recurring revenue (like subscriptions or annual maintenance contracts). One-time fees, setup charges, hardware sales, and hourly consulting fees should be excluded because they are not guaranteed to recur." },
    { question: "What is Net Retention Rate (NRR)?", answer: "Net Retention Rate measures the percentage of recurring revenue retained from existing customers over a specific period, including expansions (upsells) and downgrades/cancellations (churn). An NRR over 100% means your existing customer base is growing even without adding any new customers." },
    { question: "What is the difference between Churn and Contraction?", answer: "Churn is when a customer completely cancels their subscription. Contraction is when a customer downgrades to a cheaper plan or reduces their number of licenses, resulting in less revenue but not a total loss of the customer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "ARR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ARR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="current-mrr" className={lbl}>Current MRR</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="current-mrr" type="number" min="0" value={inputs.currentMrr} onChange={(e) => set("currentMrr")(e.target.value)} className={ci} />
                </div>
                {errors.currentMrr && <p className="text-xs text-red-500 font-medium mt-1">{errors.currentMrr}</p>}
              </div>
              <div>
                <label htmlFor="new-business-mrr" className={lbl}>New Business MRR</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">+$</span>
                  <input id="new-business-mrr" type="number" min="0" value={inputs.newBusinessMrr} onChange={(e) => set("newBusinessMrr")(e.target.value)} className={ci} />
                </div>
                {errors.newBusinessMrr && <p className="text-xs text-red-500 font-medium mt-1">{errors.newBusinessMrr}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expansion-mrr" className={lbl}>Expansion MRR (Upsells)</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">+$</span>
                  <input id="expansion-mrr" type="number" min="0" value={inputs.expansionMrr} onChange={(e) => set("expansionMrr")(e.target.value)} className={ci} />
                </div>
                {errors.expansionMrr && <p className="text-xs text-red-500 font-medium mt-1">{errors.expansionMrr}</p>}
              </div>
              <div className="flex flex-col justify-end">
                <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 h-10 flex items-center text-xs text-muted-foreground">
                  Net Growth = New + Expansion − Churn − Contraction
                </div>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Churn & Contraction</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="churned-mrr" className={lbl}>Churned MRR (Cancellations)</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">-$</span>
                          <input id="churned-mrr" type="number" min="0" value={inputs.churnedMrr} onChange={(e) => set("churnedMrr")(e.target.value)} className={ci} />
                        </div>
                        {errors.churnedMrr && <p className="text-xs text-red-500 font-medium mt-1">{errors.churnedMrr}</p>}
                      </div>
                      <div>
                        <label htmlFor="contraction-mrr" className={lbl}>Contraction MRR (Downgrades)</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">-$</span>
                          <input id="contraction-mrr" type="number" min="0" value={inputs.contractionMrr} onChange={(e) => set("contractionMrr")(e.target.value)} className={ci} />
                        </div>
                        {errors.contractionMrr && <p className="text-xs text-red-500 font-medium mt-1">{errors.contractionMrr}</p>}
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
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
              <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline absolute top-3 right-3 focus:outline-none">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Current ARR</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{fmtMoney(result.currentArr)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                MRR {fmtMoney(parseFloat(inputs.currentMrr) || 0)} × 12 · Projected in 12 months: {fmtMoney(result.projectedArr)}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Net MRR Growth", `${result.netMrrGrowth >= 0 ? "+" : "-"}${fmtMoney(Math.abs(result.netMrrGrowth))}`, result.netMrrGrowth >= 0 ? "text-emerald-600" : "text-red-500"],
                ["Net Retention (NRR)", `${result.netRetentionRate.toFixed(1)}%`, result.netRetentionRate >= 100 ? "text-emerald-600" : "text-orange-500"],
                ["Annual Churn Loss", `-${fmtMoney(result.annualChurnLoss)}`, "text-red-500"],
              ].map(([l, v, color], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">ARR Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">ARR 12-Month Projection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
                  <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, "Projected ARR"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Area type="monotone" dataKey="arr" name="Projected ARR" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
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

            {/* QUARTERLY MILESTONES */}
            {result.schedule.length > 0 && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quarterly Milestones</h3>
                </div>
                <table className="w-full text-base">
                  <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold text-left">Timeline</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Projected MRR</th>
                      <th className="px-3 py-2.5 font-semibold text-right text-primary">Projected ARR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.schedule.map((row) => (
                      <tr key={row.quarter} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground">{row.quarter}</td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtMoney(row.mrr)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-primary">{fmtMoney(row.arr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Annual Recurring Revenue (ARR)?</h2>
            <p>Annual Recurring Revenue (ARR) is a key metric used by subscription-based businesses, particularly SaaS (Software as a Service) companies, to measure their predictable and recurring revenue over a 12-month period. It represents the annualized value of active subscriptions and is the most common metric used to value SaaS companies.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The standard formula for ARR is incredibly simple: <code>ARR = MRR * 12</code>. To find your MRR (Monthly Recurring Revenue), you sum the monthly fees paid by all active subscribers. If a customer pays an annual fee upfront, you divide that fee by 12 to find their MRR contribution. You should explicitly exclude one-time fees, setup costs, professional services, and non-recurring hardware sales from your ARR calculations.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Net MRR Growth</h2>
            <p>To project future ARR, you must understand your Net MRR Growth. This is calculated as: <strong>New Business MRR + Expansion MRR - Churned MRR - Contraction MRR</strong>. New Business comes from brand new customers. Expansion comes from existing customers upgrading their plans. Churn is when customers cancel, and Contraction is when they downgrade. If your Net MRR Growth is positive, your ARR is growing.</p>
            <h2 className="text-2xl font-bold mb-3">Net Retention Rate (NRR)</h2>
            <p>Net Retention Rate is arguably the second most important metric after ARR. It measures what percentage of revenue you retained from your existing customer base over a period, factoring in both upgrades and cancellations. An NRR of exactly 100% means that expansions perfectly offset churn. Elite SaaS companies often have an NRR above 120%, meaning their existing customer base grows significantly over time without acquiring any new logos.</p>
            <h2 className="text-2xl font-bold mb-3">Why ARR Matters</h2>
            <p>Predictability is highly valued by investors. Because ARR is recurring by nature, a company with $10M in ARR is generally much more valuable than a traditional company with $10M in one-time product sales. Investors apply "revenue multiples" (often 5x to 15x or more) to a company's ARR to determine its overall enterprise valuation. Tracking ARR helps founders gauge business health, align sales targets, and raise capital.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>If you have 100 customers paying $500 per month, your MRR is $50,000, making your ARR $600,000. Next month, you acquire 5 new customers (+$2,500 MRR), 2 existing customers upgrade (+$1,000 MRR), and 1 customer cancels (-$500 MRR). Your Net MRR Growth is $3,000. Your new MRR is $53,000, making your new ARR $636,000.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annual-recurring-revenue-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
