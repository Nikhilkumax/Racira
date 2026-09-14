"use client";
import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DEFAULTS_VALUES = "12, 15, 18, 22, 24, 28, 31, 35, 39, 44, 48, 52, 57, 61, 68";
const DECILES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface DecileResult {
  values: number[];
  count: number;
  decile: number;
  selected: number;
  boundaries: { decile: number; value: number }[];
  min: number;
  max: number;
  mean: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0];
  const pos = p * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, sorted.length - 1);
  const frac = pos - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}

function calcDeciles(raw: string, decile: number): DecileResult | null {
  const values = raw.split(/[,;\s]+/).map(s => parseFloat(s.trim())).filter(v => !isNaN(v));
  if (values.length < 2) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const boundaries = DECILES.map(d => ({ decile: d, value: percentile(sorted, d / 10) }));
  const selected = boundaries.find(b => b.decile === decile)!.value;
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  return { values: sorted, count: sorted.length, decile, selected, boundaries, min: sorted[0], max: sorted[sorted.length - 1], mean };
}

const DEFAULTS = { values: DEFAULTS_VALUES, decile: "5" };

const faqs = [
  { question: "What is a decile?", answer: "Deciles divide a sorted dataset into ten equal parts: D1 is the 10th percentile, D5 the 50th (the median), and D9 the 90th. Each decile boundary has 10% of the data below it." },
  { question: "How are the boundaries calculated?", answer: "This calculator uses the Excel PERCENTILE.INC method with linear interpolation: for percentile p the position is p × (n − 1), and values between positions are interpolated. This works for any sample size." },
  { question: "How do I enter data?", answer: "Enter numbers separated by commas, spaces, or semicolons. At least two values are required; each is parsed as a number." },
];

export default function DecileCalculator() {
  const [values, setValues] = useState(DEFAULTS.values);
  const [decile, setDecile] = useState(DEFAULTS.decile);
  const [result, setResult] = useState<DecileResult | null>(() => calcDeciles(DEFAULTS_VALUES, 5));

  useEffect(() => {
    const r = calcDeciles(values, parseInt(decile) || 5);
    if (r) setResult(r);
  }, []);

  const reset = () => { setValues(DEFAULTS.values); setDecile(DEFAULTS.decile); setResult(calcDeciles(DEFAULTS.values, parseInt(DEFAULTS.decile) || 5)); };
  const parsed = useMemo(() => values.split(/[,;\s]+/).map(s => parseFloat(s.trim())).filter(v => !isNaN(v)), [values]);
  const invalid = parsed.length < 2;

  const breakdown = result ? [
    { label: "Data Points", value: `${result.count}` },
    { label: "Minimum", value: `${result.min.toFixed(2)}` },
    { label: "Maximum", value: `${result.max.toFixed(2)}` },
    { label: "Mean", value: `${result.mean.toFixed(2)}` },
    { label: `Selected Decile (D${result.decile})`, value: `${result.selected.toFixed(2)}`, highlight: true },
    { label: "Percentile", value: `${result.decile * 10}th` },
    { label: "Values Below", value: `${result.decile * 10}% of data` },
    { label: "Values Above", value: `${100 - result.decile * 10}% of data` },
  ] : [];

  const summaryStats = result ? [
    { label: `D${result.decile} Value`, value: `${result.selected.toFixed(2)}` },
    { label: "Min", value: `${result.min.toFixed(2)}` },
    { label: "Max", value: `${result.max.toFixed(2)}` },
    { label: "Mean", value: `${result.mean.toFixed(2)}` },
    { label: "Data Points", value: `${result.count}` },
    { label: "Percentile", value: `${result.decile * 10}th` },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Decile Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Decile Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="dc-values" className="block text-sm font-medium mb-1 text-foreground">Data Values</label>
              <textarea id="dc-values" rows={4} value={values} onChange={(e) => setValues(e.target.value)} className="input-calc w-full px-3 py-2 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Comma-separated numbers" />
              <p className="text-xs text-muted-foreground mt-1">Separate values with commas, spaces, or semicolons</p>
            </div>
            <div>
              <label htmlFor="dc-decile" className="block text-sm font-medium mb-1 text-foreground">Decile to Highlight</label>
              <select id="dc-decile" value={decile} onChange={(e) => setDecile(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                {DECILES.map(d => <option key={d} value={d}>D{d} ({d * 10}th percentile)</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <BarChart3 className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter at least two numeric values.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Decile D{result.decile} ({result.decile * 10}th Percentile)</div>
                  <div className="text-4xl font-extrabold text-primary">{result.selected.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.decile * 10}% of values are below · {100 - result.decile * 10}% above · {result.count} data points</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Minimum</div>
                    <div className="text-lg font-bold text-primary">{result.min.toFixed(2)}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Median (D5)</div>
                    <div className="text-lg font-bold text-primary">{result.boundaries.find(b => b.decile === 5)!.value.toFixed(2)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Maximum</div>
                    <div className="text-lg font-bold text-primary">{result.max.toFixed(2)}</div>
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
                  <h3 className="text-base font-bold mb-3">All Decile Boundaries</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.boundaries.map(b => ({ name: `D${b.decile}`, value: Number(b.value.toFixed(2)) }))} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), "Value"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Decile Calculator</h2>
            <p>Deciles split a dataset into ten equal-frequency groups. D1 (the 10th percentile) is the value below which 10% of observations fall; D9 (90th percentile) has 90% below it. The middle decile D5 is the median — the value splitting the data in half.</p>
            <h3>Interpolation Method</h3>
            <p>For datasets whose size is not a multiple of ten, the boundary falls between two observations. This calculator uses linear interpolation (Excel's PERCENTILE.INC): the position p × (n − 1) is split into integer and fractional parts, and the boundary is interpolated between the two surrounding values — standard for statistical software.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/decile-calculator" />
          <PopularCalculators exclude="/calculator/decile-calculator" />
        </div>
      </div>
    </>
  );
}
