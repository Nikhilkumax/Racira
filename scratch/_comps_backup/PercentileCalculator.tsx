"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

// percentile rank of x within sorted data: % of values strictly below + half of those equal
function rankOf(sorted: number[], x: number): number {
  const below = sorted.filter(v => v < x).length;
  const equal = sorted.filter(v => v === x).length;
  return ((below + 0.5 * equal) / sorted.length) * 100;
}

// value at percentile p using linear interpolation (Excel-style PERCENTILE.INC)
function valueAt(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const k = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(k);
  const hi = Math.ceil(k);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (k - lo) * (sorted[hi] - sorted[lo]);
}

const DEFAULTS = { data: "55, 62, 58, 70, 64, 61, 73, 66, 59, 68", target: "64", percentile: "75" };

export default function PercentileCalculator() {
  const [dataStr, setDataStr] = useState(DEFAULTS.data);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [pctl, setPctl] = useState(DEFAULTS.percentile);
  const [calculated, setCalculated] = useState(false);

  const values = dataStr.split(/[,;\s]+/).map(s => parseFloat(s)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  const x = parseFloat(target);
  const p = Math.max(0, Math.min(100, parseFloat(pctl) || 0));
  const valid = values.length > 1 && !isNaN(x);

  const rank = valid ? rankOf(values, x) : 0;
  const valAtP = values.length > 0 ? valueAt(values, p) : 0;
  const min = values.length > 0 ? values[0] : 0;
  const max = values.length > 0 ? values[values.length - 1] : 0;
  const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const median = values.length > 0 ? valueAt(values, 50) : 0;

  const chartData = values.map((v, i) => ({
    name: `${i + 1}`,
    value: v,
    fill: valid && v === x ? "#f59e0b" : "hsl(var(--primary))",
  }));

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setDataStr(DEFAULTS.data); setTarget(DEFAULTS.target); setPctl(DEFAULTS.percentile); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a percentile?", answer: "A value's percentile is the percentage of the data set that falls at or below it — a score at the 90th percentile beats 90% of the group. The percentile rank here counts values strictly below plus half of the ties, so the median lands exactly at the 50th percentile." },
    { question: "How is the inverse calculated?", answer: "The inverse finds the value that sits at a given percentile. This calculator uses linear interpolation between the two nearest observations (the same method Excel's PERCENTILE.INC uses), which is smoother than simply picking the nearest data point." },
    { question: "Why do percentiles matter for test scores?", answer: "A raw score means little without context. The same 64-point result is a top mark in a weak cohort and a middling one in a strong cohort — the percentile rank communicates position relative to everyone else who took the test." },
    { question: "Can two values share the same percentile?", answer: "Yes. With ties the rank formula credits half a point for each equal value, so duplicates cluster around the same percentile. That is also why the percentile of the smallest value can be above zero when duplicates exist." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Percentile Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Percentile Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Data set (comma or space separated)</label>
              <textarea rows={3} value={dataStr} onChange={e => setDataStr(e.target.value)} className={`${inp} resize-y`} placeholder="55, 62, 58, 70, 64, 61, 73, 66, 59, 68" />
            </div>
            <div>
              <label className={lbl}>Value to rank (percentile of)</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} className={inp} placeholder="64" />
            </div>
            <div>
              <label className={lbl}>Percentile to look up (%)</label>
              <input type="number" min={0} max={100} value={pctl} onChange={e => setPctl(e.target.value)} className={inp} placeholder="75" />
            </div>
            {values.length < 2 && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Enter at least two numeric values.</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Percentile Rank of {fmt(x)}</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(rank)}th</div>
                <div className="text-sm text-muted-foreground mt-1">higher than {fmt(rank)}% of the {values.length} values</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Value at P₇₅", fmt(valAtP), `${fmt(p)}th percentile`], ["Median", fmt(median), "50th percentile"], ["Range", `${fmt(min)} – ${fmt(max)}`, `${values.length} values`]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Sorted Data with Target Highlighted</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(Number(v)), "Value"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Amber bar marks your target value in the sorted order</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Distribution Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Count:</span><span className="font-semibold">{values.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Mean:</span><span className="font-semibold">{fmt(mean)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Median:</span><span className="font-semibold">{fmt(median)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Target:</span><span className="font-semibold">{fmt(x)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Percentile rank:</span><span className="font-semibold">{fmt(rank)}th</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Value at P{p}:</span><span className="font-semibold">{fmt(valAtP)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Position, Not Just Numbers</h2>
            <p>A percentile tells you where a value sits inside a distribution. This <strong>percentile calculator</strong> answers both directions: the rank of any value you enter, and the value that corresponds to any percentile you ask for — all computed with the interpolation method spreadsheets use.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Results</h2>
            <p>The percentile rank counts how many values fall below your target (with a half-credit for ties), then scales it to a percentage. The inverse lookup walks the same sorted data in reverse: the 75th percentile is the value below which three quarters of the observations sit.</p>
            <h2 className="text-2xl font-bold mb-3">Median and Spread</h2>
            <p>Notice the median always lands at the 50th percentile and the minimum at the 0th — those anchor points make percentile ranks easy to sanity-check. Pair the rank with the range and mean to get a full picture of where your value stands.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percentile-calculator" />
          <PopularCalculators exclude="/calculator/percentile-calculator" />
        </div>
      </div>
    </>
  );
}
