"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface StatsInput {
  data: number[];
}

interface StatsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  range: number;
  varianceSample: number;
  stdDevSample: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function percentile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function calcStats(input: StatsInput): StatsResult {
  const data = input.data.filter((n) => Number.isFinite(n));
  const count = data.length;
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = count > 0 ? sum / count : 0;
  const sorted = [...data].sort((a, b) => a - b);
  const median = count > 0 ? percentile(sorted, 0.5) : 0;
  const min = count > 0 ? sorted[0] : 0;
  const max = count > 0 ? sorted[count - 1] : 0;
  const range = max - min;
  const varianceSample = count > 1 ? data.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (count - 1) : 0;
  const stdDevSample = Math.sqrt(varianceSample);
  const q1 = count > 0 ? percentile(sorted, 0.25) : 0;
  const q3 = count > 0 ? percentile(sorted, 0.75) : 0;

  const freq = new Map<number, number>();
  data.forEach((v) => freq.set(v, (freq.get(v) ?? 0) + 1));
  const maxFreq = Math.max(0, ...freq.values());
  const modes = [...freq.entries()].filter(([, f]) => f === maxFreq && f > 1).map(([v]) => v);

  const chartData = data.map((v, i) => ({ name: `${i + 1}`, value: v }));

  const breakdown = [
    { label: "Count", value: `${count}` },
    { label: "Sum", value: `${sum.toFixed(2)}` },
    { label: "Mean (Average)", value: `${mean.toFixed(2)}` },
    { label: "Median", value: `${median.toFixed(2)}` },
    { label: "Mode(s)", value: modes.length ? modes.join(", ") : "None (all unique)" },
    { label: "Minimum / Maximum", value: `${min} / ${max}` },
    { label: "Range", value: `${range.toFixed(2)}` },
    { label: "Variance (Sample)", value: `${varianceSample.toFixed(2)}` },
    { label: "Std Deviation (Sample)", value: `${stdDevSample.toFixed(2)}` },
    { label: "Q1 / Q3", value: `${q1.toFixed(2)} / ${q3.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Mean", value: `${mean.toFixed(2)}` },
    { label: "Median", value: `${median.toFixed(2)}` },
    { label: "Mode", value: modes.length ? modes.join(", ") : "None" },
    { label: "Range", value: `${range.toFixed(2)}` },
    { label: "Std Deviation", value: `${stdDevSample.toFixed(2)}` },
    { label: "Count", value: `${count}` },
  ];

  return { count, sum, mean, median, modes, range, varianceSample, stdDevSample, min, max, q1, q3, chartData, breakdown, summaryStats };
}

const DEFAULTS: StatsInput = { data: [5, 8, 3, 9, 6, 7, 4, 8] };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";

export default function StatisticsCalculator() {
  const [raw, setRaw] = useState(DEFAULTS.data.join(", "));
  const [result, setResult] = useState<StatsResult | null>(null);

  const calculate = () => {
    const nums = raw.split(/[,\s]+/).map((s) => parseFloat(s.trim())).filter((n) => Number.isFinite(n));
    setResult(calcStats({ data: nums.length ? nums : DEFAULTS.data }));
  };
  const reset = () => {
    setRaw(DEFAULTS.data.join(", "));
    setResult(calcStats(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcStats(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the difference between mean and median?", answer: "The mean is the arithmetic average (sum ÷ count). The median is the middle value when sorted. The median resists outliers — a single huge value drags the mean up but barely moves the median — so the two together describe a distribution better than either alone." },
    { question: "What is the mode?", answer: "The mode is the value that appears most often. A dataset can have multiple modes (bimodal) or none (all values unique). It is the only measure of center useful for categorical-style data." },
    { question: "Sample vs population standard deviation?", answer: "This calculator uses the sample standard deviation (divide by n−1), which corrects for estimating the population from a sample. Use population (divide by n) only when your data is the entire population, not a sample of it." },
    { question: "What do Q1 and Q3 mean?", answer: "Quartiles split sorted data into quarters: Q1 is the 25th percentile, Q3 the 75th. The interquartile range (Q3−Q1) measures the middle 50% spread and is robust to outliers — the basis of box plots." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Statistics Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Statistics Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Data Set (comma or space separated)</label>
              <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Mean (Average)</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.mean.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Median {result.median.toFixed(2)} · Std Dev {result.stdDevSample.toFixed(2)} · {result.count} values</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Median", `${result.median.toFixed(2)}`], ["Mode", result.modes.length ? `${result.modes.join(", ")}` : "None"], ["Std Dev", `${result.stdDevSample.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Descriptive Statistics</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Data Points (mean shown as dashed line)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                      <ReferenceLine y={result.mean} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Measures of Central Tendency</h2>
            <p>The three classic summaries — mean, median, and mode — answer different questions. The mean is the arithmetic average; the median is the middle of the sorted data; the mode is the most frequent value. Comparing them reveals skew: mean above median signals a right-skewed distribution (a few large outliers).</p>
            <h2 className="text-2xl font-bold mb-3">Measures of Spread</h2>
            <p>Range (max − min), variance, and standard deviation quantify spread. The sample standard deviation (n−1 denominator) estimates population variability from a sample and is the default for real-world data analysis. Quartiles and the interquartile range offer outlier-robust alternatives.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Output</h2>
            <p>Use mean and median together for center, std deviation for spread, and the chart to spot outliers visually. With roughly bell-shaped data, about 68% of values fall within one standard deviation of the mean — a fast sanity check on your data.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/statistics-calculator" />
          <PopularCalculators exclude="/calculator/statistics-calculator" />
        </div>
      </div>
    </>
  );
}
