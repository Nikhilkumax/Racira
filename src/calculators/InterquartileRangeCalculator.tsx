"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const InterquartileRangeCalculator = () => {
  const DEFAULTS = { values: "7, 15, 36, 39, 40, 41" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [result, setResult] = useState<any>(null);

  const percentile = (sorted: number[], p: number) => {
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  const calculate = (v = values) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n));
    if (nums.length < 4) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;
    const q1 = percentile(sorted, 25);
    const q2 = percentile(sorted, 50);
    const q3 = percentile(sorted, 75);
    const iqr = q3 - q1;
    const min = sorted[0];
    const max = sorted[n - 1];
    const mean = nums.reduce((s, x) => s + x, 0) / n;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const lowerOutlierFence = q1 - 3 * iqr;
    const upperOutlierFence = q3 + 3 * iqr;
    const mildOutliers = sorted.filter((x) => (x < lowerFence || x > upperFence) && x >= lowerOutlierFence && x <= upperOutlierFence);
    const extremeOutliers = sorted.filter((x) => x < lowerOutlierFence || x > upperOutlierFence);
    const whiskerLow = sorted.find((x) => x >= lowerFence) ?? min;
    const whiskerHigh = [...sorted].reverse().find((x) => x <= upperFence) ?? max;

    const chartData = [
      { label: "Min", value: parseFloat(min.toFixed(2)), color: "#94a3b8" },
      { label: "Q1", value: parseFloat(q1.toFixed(2)), color: "#3b82f6" },
      { label: "Q2 (Median)", value: parseFloat(q2.toFixed(2)), color: "#10b981" },
      { label: "Q3", value: parseFloat(q3.toFixed(2)), color: "#f59e0b" },
      { label: "Max", value: parseFloat(max.toFixed(2)), color: "#ef4444" },
    ];
    setResult({ nums, sorted, n, q1, q2, q3, iqr, min, max, mean, lowerFence, upperFence, lowerOutlierFence, upperOutlierFence, mildOutliers, extremeOutliers, whiskerLow, whiskerHigh, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); calculate(DEFAULTS.values); };

  const faqs = [
    { question: "What is the IQR?", answer: "The Interquartile Range (IQR) is the range of the middle 50% of a dataset: IQR = Q3 − Q1. Q1 is the 25th percentile (lower quartile) and Q3 is the 75th percentile (upper quartile). For {7, 15, 36, 39, 40, 41}: Q1 = 15, Q3 = 40, IQR = 25. The IQR is resistant to outliers because it ignores the top and bottom 25% of values." },
    { question: "How do you identify outliers using IQR?", answer: "Tukey's fence method: mild outliers lie below Q1 − 1.5×IQR or above Q3 + 1.5×IQR. Extreme outliers lie below Q1 − 3×IQR or above Q3 + 3×IQR. These thresholds define the whiskers of a box plot. Any data point beyond the whiskers is plotted individually as a suspected outlier." },
    { question: "What is a box plot?", answer: "A box-and-whisker plot displays five key statistics: minimum, Q1, median (Q2), Q3, maximum. The box spans Q1 to Q3 (width = IQR). The line inside the box = median. Whiskers extend to the most extreme non-outlier values (within 1.5×IQR of Q1/Q3). Individual dots beyond whiskers = outliers. Box plots are excellent for comparing distributions across groups." },
    { question: "How are quartiles calculated?", answer: "Several methods exist. This calculator uses linear interpolation (similar to Excel's QUARTILE.INC): find the index i = p/100 × (n−1), interpolate between the sorted values at positions floor(i) and ceil(i). For n=6 values and Q1: i = 0.25×5 = 1.25 → Q1 = sorted[1] + 0.25×(sorted[2]−sorted[1])." },
    { question: "When is IQR better than standard deviation?", answer: "IQR is preferred when: data is skewed (income, home prices, medical data). Outliers are present and you want to ignore them. Data is ordinal (rankings). Standard deviation uses all values and is more informative for symmetric, normally distributed data. For robust statistics and non-parametric tests, IQR is the standard measure of spread." },
    { question: "What is the semi-interquartile range?", answer: "SIQR = IQR / 2 = (Q3 − Q1) / 2. Also called the quartile deviation, it measures the average distance from the median to the quartiles. It is used as a robust alternative to standard deviation. Roughly 50% of data falls within SIQR of the median for symmetric distributions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "IQR Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">IQR Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Data Set</label>
              <textarea value={values} onChange={(e) => setValues(e.target.value)} className="w-full px-3 py-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" rows={4} placeholder="Enter numbers separated by commas, spaces, or newlines" />
              <div className="text-xs text-muted-foreground mt-1">Minimum 4 values required</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Interquartile Range (IQR)</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.iqr)}</div>
                <div className="text-sm text-muted-foreground mt-1">Q3 ({fmt(result.q3)}) − Q1 ({fmt(result.q1)}) = {fmt(result.iqr)} • {result.n} values</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Five-Number Summary</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Minimum", value: fmt(result.min) },
                    { label: "Q1 (25th pct)", value: fmt(result.q1) },
                    { label: "Median / Q2 (50th pct)", value: fmt(result.q2) },
                    { label: "Q3 (75th pct)", value: fmt(result.q3) },
                    { label: "Maximum", value: fmt(result.max) },
                    { label: "IQR (Q3 − Q1)", value: fmt(result.iqr) },
                    { label: "Semi-IQR (IQR / 2)", value: fmt(result.iqr / 2) },
                    { label: "Lower Fence (Q1 − 1.5×IQR)", value: fmt(result.lowerFence) },
                    { label: "Upper Fence (Q3 + 1.5×IQR)", value: fmt(result.upperFence) },
                    { label: "Mild Outliers", value: result.mildOutliers.length > 0 ? result.mildOutliers.map(fmt).join(", ") : "None" },
                    { label: "Extreme Outliers", value: result.extremeOutliers.length > 0 ? result.extremeOutliers.map(fmt).join(", ") : "None" },
                    { label: "Mean", value: fmt(result.mean) },
                    { label: "Count (n)", value: String(result.n) },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Five-Number Summary Chart</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is an IQR Calculator?</h2>
            <p>An IQR calculator computes the Interquartile Range — the spread of the middle 50% of a dataset — along with the full five-number summary, Tukey outlier fences, and identified outliers. Pre-filled with {"{7, 15, 36, 39, 40, 41}"}, the IQR is 25 (Q3=40 − Q1=15). The five-number summary chart visualizes Min, Q1, Median, Q3, and Max.</p>
            <h2>IQR Formula</h2>
            <p><strong>IQR = Q3 − Q1</strong>. Q1 = 25th percentile (lower quartile), Q3 = 75th percentile (upper quartile). This calculator uses linear interpolation to compute quartiles, consistent with Excel{"'"}s QUARTILE.INC function. The IQR measures variability in the central half of the data, making it robust against outliers that inflate the standard deviation.</p>
            <h2>Outlier Detection with Tukey Fences</h2>
            <p>Mild outliers: below Q1 − 1.5×IQR, or above Q3 + 1.5×IQR. Extreme outliers: below Q1 − 3×IQR, or above Q3 + 3×IQR. In a normal distribution, Tukey fences capture 99.3% of data within 1.5×IQR of Q1/Q3. Only 0.7% of data in a normal distribution would be flagged as mild outliers. Extreme outlier fences capture 99.9999% — anything beyond is almost certainly a measurement error or legitimate anomaly.</p>
            <h2>Box Plots and the IQR</h2>
            <p>A box plot visually encodes the five-number summary. The box spans Q1 to Q3 (width = IQR). The line inside = median. Whiskers extend to the most extreme values within 1.5×IQR of Q1/Q3. Points beyond whiskers are individual outlier markers. Side-by-side box plots are the most efficient way to compare distributions across multiple groups simultaneously.</p>
            <h2>IQR in Robust Statistics</h2>
            <p>Robust statistics resist the influence of outliers. The IQR has a breakdown point of 25% — up to 25% of data can be extreme outliers without affecting the IQR. Standard deviation has a 0% breakdown point — even one outlier can distort it drastically. For real-world data with measurement errors, contamination, or heavy-tailed distributions, IQR-based methods (median, MAD, IQR) are preferred over mean-based methods.</p>
            <h2>Applications</h2>
            <p>Finance: VaR calculations often exclude outlier days using IQR methods. Healthcare: clinical reference ranges typically exclude the top and bottom 2.5% (similar spirit to IQR). Quality control: IQR-based control charts for non-normal processes. Machine learning: feature scaling using IQR (RobustScaler in scikit-learn). Data cleaning: automatically flag potential data entry errors using outlier fences.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interquartile-range-calculator" />
          <PopularCalculators exclude="/calculator/interquartile-range-calculator" />
        </div>
      </div>
    </>
  );
};

export default InterquartileRangeCalculator;
