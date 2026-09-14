"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RetentionResult {
  start: number;
  end: number;
  acquired: number;
  retained: number;
  churned: number;
  crr: number;
  churnRate: number;
  chartData: { name: string; value: number }[];
}

function calcRetention(start: number, end: number, acquired: number): RetentionResult {
  const retained = Math.max(0, end - acquired);
  const churned = Math.max(0, start - retained);
  const crr = start > 0 ? (retained / start) * 100 : 0;
  const churnRate = start > 0 ? (churned / start) * 100 : 0;
  const chartData = [
    { name: "Retained", value: retained },
    { name: "Churned", value: churned },
  ];
  return { start, end, acquired, retained, churned, crr, churnRate, chartData };
}

const DEFAULTS = { start: "1000", end: "950", acquired: "100" };

const COLORS = ["hsl(var(--primary))", "hsl(0 72% 51%)"];

const faqs = [
  { question: "What is customer retention rate?", answer: "Customer retention rate is the share of customers you kept over a period: ((end − new) ÷ start) × 100. It excludes customers acquired during the period so it isolates how well you retain the existing base." },
  { question: "What is a good retention rate?", answer: "Benchmarks vary by industry: SaaS typically targets 85–95% annual retention, retail and e-commerce 30–60%, and subscription media 75–85%. Compare against your own history first." },
  { question: "How is churn rate related?", answer: "Churn rate is the complement: 100% − retention rate. A 90% retention rate means 10% of the starting base churned during the period." },
];

export default function CustomerRetentionRateCalculator() {
  const [start, setStart] = useState(DEFAULTS.start);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [acquired, setAcquired] = useState(DEFAULTS.acquired);
  const [result, setResult] = useState<RetentionResult>(() => calcRetention(1000, 950, 100));

  useEffect(() => {
    const s = parseFloat(start);
    const e = parseFloat(end);
    const n = parseFloat(acquired);
    if (!isNaN(s) && !isNaN(e) && !isNaN(n) && s > 0 && e >= 0 && n >= 0) setResult(calcRetention(s, e, n));
  }, []);

  const reset = () => { setStart(DEFAULTS.start); setEnd(DEFAULTS.end); setAcquired(DEFAULTS.acquired); setResult(calcRetention(parseFloat(DEFAULTS.start), parseFloat(DEFAULTS.end), parseFloat(DEFAULTS.acquired))); };
  const invalid = isNaN(parseFloat(start)) || isNaN(parseFloat(end)) || isNaN(parseFloat(acquired)) || parseFloat(start) <= 0 || parseFloat(end) < 0 || parseFloat(acquired) < 0;

  const breakdown = [
    { label: "Customers at Start (S)", value: `${Math.round(result.start).toLocaleString()}` },
    { label: "Customers at End (E)", value: `${Math.round(result.end).toLocaleString()}` },
    { label: "New Customers Acquired (N)", value: `${Math.round(result.acquired).toLocaleString()}` },
    { label: "Retained Customers (E − N)", value: `${Math.round(result.retained).toLocaleString()}`, highlight: true },
    { label: "Churned Customers (S − Retained)", value: `${Math.round(result.churned).toLocaleString()}` },
    { label: "Retention Rate", value: `${result.crr.toFixed(1)}%` },
    { label: "Churn Rate", value: `${result.churnRate.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Retention Rate", value: `${result.crr.toFixed(1)}%` },
    { label: "Churn Rate", value: `${result.churnRate.toFixed(1)}%` },
    { label: "Retained", value: `${Math.round(result.retained).toLocaleString()}` },
    { label: "Churned", value: `${Math.round(result.churned).toLocaleString()}` },
    { label: "Acquired (Period)", value: `${Math.round(result.acquired).toLocaleString()}` },
    { label: "Net Change", value: `${(result.end - result.start >= 0 ? "+" : "")}${Math.round(result.end - result.start).toLocaleString()}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Customer Retention Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Customer Retention Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="crr-start" className="block text-sm font-medium mb-1 text-foreground">Customers at Start of Period</label>
              <input id="crr-start" type="number" min="1" value={start} onChange={(e) => setStart(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="crr-end" className="block text-sm font-medium mb-1 text-foreground">Customers at End</label>
                <input id="crr-end" type="number" min="0" value={end} onChange={(e) => setEnd(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="crr-new" className="block text-sm font-medium mb-1 text-foreground">New Customers Acquired</label>
                <input id="crr-new" type="number" min="0" value={acquired} onChange={(e) => setAcquired(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Users className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive starting count and non-negative end/acquisition counts.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Customer Retention Rate</div>
              <div className="text-4xl font-extrabold text-primary">{result.crr.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">{Math.round(result.retained).toLocaleString()} of {Math.round(result.start).toLocaleString()} customers retained · {Math.round(result.churned).toLocaleString()} churned</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Churn Rate</div>
                <div className="text-lg font-bold text-primary">{result.churnRate.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Retained</div>
                <div className="text-lg font-bold text-primary">{Math.round(result.retained).toLocaleString()}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Net Change</div>
                <div className="text-lg font-bold text-primary">{(result.end - result.start >= 0 ? "+" : "")}{Math.round(result.end - result.start).toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Customer Base Split</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [Math.round(v).toLocaleString(), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Retained + churned = starting base</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Customer Retention Rate Calculator</h2>
            <p>Retention rate measures how well you keep the customers you already have: ((E − N) ÷ S) × 100, where S is the starting base, E the ending base, and N the new customers acquired during the period. Subtracting new customers prevents acquisition from masking churn.</p>
            <h3>Retention vs. Growth</h3>
            <p>A business can grow while churning heavily if acquisition outpaces losses — but that growth is expensive. Retention compounds: small improvements in retention multiply lifetime value, so most subscription businesses track it as their leading health metric.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/customer-retention-rate-calculator" />
          <PopularCalculators exclude="/calculator/customer-retention-rate-calculator" />
        </div>
      </div>
    </>
  );
}
