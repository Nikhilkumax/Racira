"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ArrowRight, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ColResult {
  salary: number;
  currentIndex: number;
  targetIndex: number;
  equivalentSalary: number;
  difference: number;
  percentage: number;
  isMoreExpensive: boolean;
  purchasingCurrent: number;
  purchasingTarget: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCol(salary: number, currentIndex: number, targetIndex: number): ColResult {
  const cIndex = Math.max(1, currentIndex);
  const tIndex = Math.max(1, targetIndex);
  const equivalentSalary = (salary / cIndex) * tIndex;
  const difference = equivalentSalary - salary;
  const percentage = ((tIndex - cIndex) / cIndex) * 100;
  const isMoreExpensive = tIndex > cIndex;
  const purchasingCurrent = salary / cIndex;
  const purchasingTarget = salary / tIndex;

  const chartData = [
    { name: "Current Salary", value: salary },
    { name: "Equivalent Needed", value: equivalentSalary },
  ];

  const breakdown = [
    { label: "Current Annual Salary", value: `$${salary.toLocaleString()}` },
    { label: "Current City Index", value: `${cIndex}` },
    { label: "Target City Index", value: `${tIndex}` },
    { label: "Equivalent Salary Needed", value: `$${Math.round(equivalentSalary).toLocaleString()}` },
    { label: "Salary Adjustment", value: `${isMoreExpensive ? "+" : "−"}$${Math.abs(Math.round(difference)).toLocaleString()} (${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%)` },
    { label: "Cost of Living Change", value: `${Math.abs(percentage).toFixed(1)}% ${isMoreExpensive ? "more" : "less"} expensive` },
    { label: "Purchasing Power (current city)", value: `$${purchasingCurrent.toFixed(1)} / index pt` },
    { label: "Purchasing Power (target city)", value: `$${purchasingTarget.toFixed(1)} / index pt` },
  ];

  const summaryStats = [
    { label: "Equivalent Salary", value: `$${Math.round(equivalentSalary).toLocaleString()}` },
    { label: "Adjustment", value: `${isMoreExpensive ? "+" : "−"}$${Math.abs(Math.round(difference)).toLocaleString()}` },
    { label: "Change", value: `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%` },
    { label: "Target Index", value: `${tIndex}` },
    { label: "Current Index", value: `${cIndex}` },
    { label: "Verdict", value: isMoreExpensive ? "Need raise" : "Lifestyle gain" },
  ];

  return { salary, currentIndex: cIndex, targetIndex: tIndex, equivalentSalary, difference, percentage, isMoreExpensive, purchasingCurrent, purchasingTarget, chartData, breakdown, summaryStats };
}

const DEFAULTS = { salary: "80000", current: "100", target: "125" };

export default function CostOfLivingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<ColResult>(() => calcCol(80000, 100, 125));

  useEffect(() => {
    const s = parseFloat(inputs.salary);
    const c = parseFloat(inputs.current);
    const t = parseFloat(inputs.target);
    if (!isNaN(s) && !isNaN(c) && c > 0 && !isNaN(t) && t > 0) setResult(calcCol(s, c, t));
  }, []);

  const set = (k: keyof typeof DEFAULTS) => (v: string) => setInputs((p) => ({ ...p, [k]: v }));
  const handleCalculate = () => {
    const s = parseFloat(inputs.salary);
    const c = parseFloat(inputs.current);
    const t = parseFloat(inputs.target);
    if (!isNaN(s) && !isNaN(c) && c > 0 && !isNaN(t) && t > 0) setResult(calcCol(s, c, t));
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calcCol(parseFloat(DEFAULTS.salary), parseFloat(DEFAULTS.current), parseFloat(DEFAULTS.target))); };
  const invalid = isNaN(parseFloat(inputs.salary)) || isNaN(parseFloat(inputs.current)) || parseFloat(inputs.current) <= 0 || isNaN(parseFloat(inputs.target)) || parseFloat(inputs.target) <= 0;

  const faqs = [
    { question: "What is a cost of living index?", answer: "A cost of living index compares the relative price of consumer goods and services between locations. A score of 100 is the national average — New York City is roughly 180, while Dallas is around 105." },
    { question: "What factors are included in cost of living?", answer: "Most indices include housing, groceries, utilities, transportation, healthcare, and taxes. Housing is typically the most significant variable, often accounting for 30–40% of the index weight." },
    { question: "Should I move for a higher salary in a more expensive city?", answer: "Not necessarily. If your salary rises 10% but the cost of living rises 20%, your standard of living drops. Use the equivalent salary to compare job offers apples-to-apples." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cost of Living Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost of Living Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="salary" className="block text-sm font-medium mb-1 text-foreground">Current Annual Salary ($)</label>
              <input id="salary" type="number" min="0" value={inputs.salary} onChange={(e) => set("salary")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ci" className="block text-sm font-medium mb-1 text-foreground">Current City Index</label>
                <input id="ci" type="number" min="1" value={inputs.current} onChange={(e) => set("current")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ti" className="block text-sm font-medium mb-1 text-foreground">Target City Index</label>
                <input id="ti" type="number" min="1" value={inputs.target} onChange={(e) => set("target")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">National average index = 100. NYC ≈ 180, Dallas ≈ 105, rural Midwest ≈ 85.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Building2 className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid salary and city indexes greater than zero.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Equivalent Salary Needed</div>
              <div className="text-4xl font-extrabold text-primary">${Math.round(result.equivalentSalary).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">Target city is {Math.abs(result.percentage).toFixed(1)}% {result.isMoreExpensive ? "more" : "less"} expensive · {result.isMoreExpensive ? "need a raise" : "lifestyle gain"} of ${Math.abs(Math.round(result.difference)).toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Salary Adjustment</div>
                <div className="text-lg font-bold text-primary">{result.isMoreExpensive ? "+" : "−"}${Math.abs(Math.round(result.difference)).toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Change</div>
                <div className="text-lg font-bold text-primary">{result.percentage >= 0 ? "+" : ""}{result.percentage.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Purchasing Power</div>
                <div className="text-lg font-bold text-primary">${result.purchasingTarget.toFixed(1)}/pt</div>
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
              <h3 className="text-base font-bold mb-3">Salary vs Equivalent Needed</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "Salary"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
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
            <h2 className="text-2xl font-bold mb-3">Calculating Your Real Income</h2>
            <p>Salary is a relative number. A $100,000 salary in San Francisco may buy less than a $60,000 salary in a small Midwest town. The equivalent salary formula — current salary × (target index ÷ current index) — converts any offer into a like-for-like comparison.</p>
            <h3>Why Housing Dominates</h3>
            <p>Housing accounts for 30–40% of most cost-of-living indices. Groceries and utilities rarely vary more than 10–15% between cities, while housing can vary by 300% or more — making it the primary driver of regional wealth differences.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cost-of-living-calculator" />
          <PopularCalculators exclude="/calculator/cost-of-living-calculator" />
        </div>
      </div>
    </>
  );
}
