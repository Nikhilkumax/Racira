"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const RangeCalculator = () => {
  const DEFAULTS = { values: "14, 18, 11, 13, 6, 8, 2, 19, 4" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [result, setResult] = useState<any>(null);

  const calculate = (v = values) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n));
    if (nums.length < 2) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    const mean = nums.reduce((s, x) => s + x, 0) / n;
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    const stddev = Math.sqrt(variance);
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const midrange = (min + max) / 2;
    const coefficientOfVariation = (stddev / mean) * 100;
    const chartData = sorted.map((x, i) => ({ rank: i + 1, value: x }));
    setResult({ nums, sorted, n, min, max, range, mean, median, stddev, variance, q1, q3, iqr, midrange, coefficientOfVariation, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); calculate(DEFAULTS.values); };

  const faqs = [
    { question: "What is the range in statistics?", answer: "The range is the simplest measure of spread (dispersion) in a dataset. It equals the maximum value minus the minimum value: Range = max − min. For {2, 4, 6, 8, 11, 13, 14, 18, 19}: Range = 19 − 2 = 17. The range tells you the total span of your data but is highly sensitive to outliers — one extreme value can make the range misleadingly large." },
    { question: "How do you calculate the range?", answer: "1. Identify the maximum value in the dataset. 2. Identify the minimum value. 3. Subtract: Range = Max − Min. That's it. The range is the simplest dispersion measure — no sorting or averaging required. Example: test scores {55, 67, 72, 81, 93} → Range = 93 − 55 = 38." },
    { question: "What is the interquartile range (IQR)?", answer: "The IQR = Q3 − Q1 (75th percentile minus 25th percentile). It measures spread in the middle 50% of data, making it resistant to outliers. While range spans the entire dataset including extremes, IQR ignores the top and bottom 25%. IQR is used in box plots and outlier detection: values more than 1.5×IQR below Q1 or above Q3 are considered outliers." },
    { question: "What is the midrange?", answer: "Midrange = (Max + Min) / 2 — the arithmetic mean of the two extremes. It represents the center of the range but is even more sensitive to outliers than the mean. For {2, 4, 6, 8, 19}: midrange = (2+19)/2 = 10.5, mean = 7.8 — the single outlier (19) skews the midrange more than the mean." },
    { question: "When is range a poor measure of spread?", answer: "Range is unreliable when outliers are present. A dataset {1, 5, 5, 5, 5, 100} has range 99, implying huge spread, but 5 out of 6 values are identical. Better alternatives: standard deviation (uses all values), IQR (ignores extremes), mean absolute deviation. Range is useful for quick estimates when you know no extreme outliers exist." },
    { question: "What is the coefficient of variation?", answer: "CV = (standard deviation / mean) × 100%. It expresses spread as a percentage of the mean — useful for comparing variability across datasets with different units or scales. CV < 15%: low variability. CV 15-30%: moderate. CV > 30%: high variability. Example: Stock A has stddev 5, mean 100 (CV=5%). Stock B has stddev 5, mean 20 (CV=25%) — B is much more volatile relative to its price." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Range Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Range Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Data Set</label>
              <textarea
                value={values}
                onChange={(e) => setValues(e.target.value)}
                className="w-full px-3 py-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                rows={4}
                placeholder="Enter numbers separated by commas, spaces, or newlines"
              />
              <div className="text-xs text-muted-foreground mt-1">Separate values with commas, spaces, or newlines</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Range</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.range)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Max ({fmt(result.max)}) − Min ({fmt(result.min)}) = {fmt(result.range)} • {result.n} values
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Dispersion Measures</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Count (n)", value: String(result.n) },
                    { label: "Minimum", value: fmt(result.min) },
                    { label: "Maximum", value: fmt(result.max) },
                    { label: "Range (max − min)", value: fmt(result.range) },
                    { label: "Midrange", value: fmt(result.midrange) },
                    { label: "Q1 (25th pct)", value: fmt(result.q1) },
                    { label: "Median (Q2)", value: fmt(result.median) },
                    { label: "Q3 (75th pct)", value: fmt(result.q3) },
                    { label: "IQR (Q3 − Q1)", value: fmt(result.iqr) },
                    { label: "Mean", value: fmt(result.mean) },
                    { label: "Std. Deviation", value: fmt(result.stddev) },
                    { label: "Coeff. of Variation", value: `${fmt(result.coefficientOfVariation, 1)}%` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Data Points (Sorted)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="rank" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => Number(v).toLocaleString()} labelFormatter={(l) => `Rank ${l}`} />
                    <ReferenceLine y={result.mean} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Mean", fontSize: 9, fill: "#f59e0b" }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Range Calculator?</h2>
            <p>A range calculator computes the spread of a dataset from its minimum to maximum value (Range = Max − Min), along with a full suite of dispersion metrics: IQR, standard deviation, coefficient of variation, quartiles, and midrange. Pre-filled with 9 values from a sample dataset, the range is 17 (max 19 − min 2). The sorted distribution chart includes a reference line at the mean.</p>
            <h2 className="text-2xl font-bold mb-3">Range Formula</h2>
            <p><strong>Range = Maximum − Minimum</strong>. Simple to compute, but sensitive to outliers. For {"{2, 4, 6, 8, 11, 13, 14, 18, 19}"}: Range = 19 − 2 = 17. Adding one outlier — say 200 — inflates range to 198, misleadingly suggesting enormous spread despite 9 of 10 values being under 20.</p>
            <h2 className="text-2xl font-bold mb-3">Interquartile Range (IQR)</h2>
            <p>IQR = Q3 − Q1. Covers the middle 50% of data. Outlier rule: values below Q1 − 1.5×IQR or above Q3 + 1.5×IQR are potential outliers (Tukey fences). IQR is used in box-and-whisker plots to define whisker lengths. It is the preferred spread measure for skewed distributions and datasets with outliers.</p>
            <h2 className="text-2xl font-bold mb-3">Standard Deviation vs Range</h2>
            <p>Standard deviation uses every value in the dataset — it measures average distance from the mean. Range only uses two values (min and max) and ignores everything in between. For quality control with known distribution shapes (normal), standard deviation is more informative. For quick initial data exploration, range provides an instant bounds check. Both are reported here for complete analysis.</p>
            <h2 className="text-2xl font-bold mb-3">Coefficient of Variation</h2>
            <p>CV = (σ/μ) × 100% allows comparing variability between datasets with different scales. Comparing investment volatility: Portfolio A (mean return 10%, σ = 2%) has CV = 20%. Portfolio B (mean return 3%, σ = 1%) has CV = 33% — despite smaller absolute standard deviation, B is proportionally more volatile. CV is dimensionless, making it ideal for cross-dataset comparisons.</p>
            <h2 className="text-2xl font-bold mb-3">Range in Quality Control</h2>
            <p>Control charts (R-charts) track the range across subgroups of production samples to monitor process variability. If range exceeds control limits (D₄R̄ or falls below D₃R̄), the process shows unusual variation requiring investigation. Process capability (Cpk) uses both range and specification limits to measure how well a process meets requirements. Manufacturing tolerances are essentially acceptable ranges.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/range-calculator" />
          <PopularCalculators exclude="/calculator/range-calculator" />
        </div>
      </div>
    </>
  );
};

export default RangeCalculator;
