"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RatioResult {
  ratioPct: number;
  affordable: boolean;
  verdict: string;
  color: string;
  recommendedMax: number;
  remainingIncome: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRatio(housing: number, income: number, includeUtilities: boolean, utilities: number): RatioResult {
  const totalCost = includeUtilities ? housing + utilities : housing;
  const ratioPct = income > 0 ? (totalCost / income) * 100 : 0;
  const affordable = ratioPct <= 28;
  const recommendedMax = income * 0.28;
  const remainingIncome = income - totalCost;

  const chartData = [
    { name: "Housing Cost", value: totalCost },
    { name: "Recommended Max", value: recommendedMax },
    { name: "Remaining Income", value: Math.max(0, remainingIncome) },
  ];

  const breakdown = [
    { label: "Gross Monthly Income", value: `$${income.toLocaleString()}` },
    { label: "Housing Cost", value: `$${housing.toLocaleString()}` },
    { label: includeUtilities ? "Utilities" : "Utilities (excluded)", value: includeUtilities ? `$${utilities.toLocaleString()}` : "—" },
    { label: "Total Housing Cost", value: `$${totalCost.toLocaleString()}` },
    { label: "Housing Ratio", value: `${ratioPct.toFixed(1)}%` },
    { label: "Recommended Max (28%)", value: `$${recommendedMax.toLocaleString()}` },
    { label: "Remaining After Housing", value: `$${remainingIncome.toLocaleString()}` },
    { label: "Affordability", value: affordable ? "Affordable ✓" : "Over budget ✗" },
  ];

  const summaryStats = [
    { label: "Housing Ratio", value: `${ratioPct.toFixed(1)}%` },
    { label: "28% Guideline", value: "max" },
    { label: "Headroom", value: `${(28 - Math.min(ratioPct, 28)).toFixed(1)} pts` },
    { label: "Remaining", value: `$${remainingIncome.toLocaleString()}` },
    { label: "Recommended Max", value: `$${recommendedMax.toLocaleString()}` },
    { label: "Verdict", value: affordable ? "Affordable" : "Stretch" },
  ];

  return { ratioPct, affordable, verdict: affordable ? "Affordable" : "Over budget", color: affordable ? "#10b981" : "#ef4444", recommendedMax, remainingIncome, chartData, breakdown, summaryStats };
}

const DEFAULTS = { housing: "1800", income: "6500", utilities: "250", includeUtilities: true };

export default function CostToIncomeRatioCalculator() {
  const [housing, setHousing] = useState(DEFAULTS.housing);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [utilities, setUtilities] = useState(DEFAULTS.utilities);
  const [includeUtilities, setIncludeUtilities] = useState(DEFAULTS.includeUtilities);
  const [result, setResult] = useState<RatioResult>(() => calcRatio(1800, 6500, true, 250));

  useEffect(() => {
    const h = parseFloat(housing);
    const i = parseFloat(income);
    const u = parseFloat(utilities);
    if (!isNaN(h) && !isNaN(i) && i > 0 && !isNaN(u)) setResult(calcRatio(h, i, includeUtilities, u));
  }, [housing, income, utilities, includeUtilities]);

  const reset = () => { setHousing(DEFAULTS.housing); setIncome(DEFAULTS.income); setUtilities(DEFAULTS.utilities); setIncludeUtilities(DEFAULTS.includeUtilities); };
  const invalid = isNaN(parseFloat(housing)) || isNaN(parseFloat(income)) || parseFloat(income) <= 0;

  const faqs = [
    { question: "What is a good housing cost-to-income ratio?", answer: "Lenders and financial planners commonly use the 28% rule: housing costs (rent or mortgage plus taxes and insurance) should not exceed 28% of your gross monthly income. The total debt ratio, including all debts, should stay under 36%." },
    { question: "Should utilities count toward the ratio?", answer: "Some budgets include utilities and some do not. The 28% guideline traditionally covers rent/mortgage plus insurance and property taxes. Including utilities gives a more conservative — and often more realistic — picture." },
    { question: "What if my ratio is over 28%?", answer: "You may still manage, but you will have less room for savings, emergencies, and discretionary spending. Consider a lower-cost home, a roommate, or increasing income to bring the ratio down." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cost-to-Income Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost-to-Income Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cih" className="block text-sm font-medium mb-1 text-foreground">Housing Cost ($/mo)</label>
                <input id="cih" type="number" min="0" value={housing} onChange={(e) => setHousing(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cii" className="block text-sm font-medium mb-1 text-foreground">Gross Income ($/mo)</label>
                <input id="cii" type="number" min="1" value={income} onChange={(e) => setIncome(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ciu" className="block text-sm font-medium mb-1 text-foreground">Utilities ($/mo)</label>
                <input id="ciu" type="number" min="0" value={utilities} onChange={(e) => setUtilities(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={includeUtilities} onChange={(e) => setIncludeUtilities(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  Include utilities
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Percent className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid housing and income values.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Housing Cost-to-Income Ratio</div>
              <div className="text-4xl font-extrabold text-primary">{result.ratioPct.toFixed(1)}%</div>
              <div className="text-sm mt-1 font-semibold" style={{ color: result.color }}>{result.verdict} · 28% guideline {result.affordable ? "(under)" : "(exceeded)"}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly Cost</div>
                <div className="text-lg font-bold text-primary">${(parseFloat(housing) + (includeUtilities ? parseFloat(utilities) || 0 : 0)).toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Recommended Max</div>
                <div className="text-lg font-bold text-primary">${Math.round(result.recommendedMax).toLocaleString()}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Remaining</div>
                <div className="text-lg font-bold text-primary">${Math.round(result.remainingIncome).toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Cost vs Guideline vs Remaining</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "Amount"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {result.chartData.map((e, i) => <Cell key={i} fill={e.name === "Housing Cost" ? "hsl(var(--primary))" : "hsl(var(--primary)/0.45)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Cost-to-Income Ratio Calculator</h2>
            <p>The housing cost-to-income ratio is the share of your gross monthly income consumed by housing. The 28% rule — a benchmark used by lenders and financial planners — says housing should stay at or below 28% of gross income to leave room for other debts, savings, and lifestyle.</p>
            <h3>Beyond the 28% Rule</h3>
            <p>Lenders also apply the 36% total debt ratio, which includes car loans, student loans, and credit cards on top of housing. Keeping both ratios in check is the foundation of mortgage qualification and long-term financial health.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cost-to-income-ratio-calculator" />
          <PopularCalculators exclude="/calculator/cost-to-income-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
