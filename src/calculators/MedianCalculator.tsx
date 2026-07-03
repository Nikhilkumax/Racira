"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const MedianCalculator = () => {
  const DEFAULTS = { values: "4, 8, 15, 16, 23, 42" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [result, setResult] = useState<any>(null);

  const calculate = (v = values) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n));
    if (nums.length === 0) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;
    const isEven = n % 2 === 0;
    const median = isEven
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const mean = nums.reduce((s, x) => s + x, 0) / n;
    const mode: number[] = [];
    const freq: Record<number, number> = {};
    nums.forEach((x) => { freq[x] = (freq[x] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    Object.entries(freq).forEach(([k, f]) => { if (f === maxFreq) mode.push(Number(k)); });
    const range = sorted[n - 1] - sorted[0];
    const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    const stddev = Math.sqrt(variance);
    const chartData = sorted.map((x, i) => ({ rank: i + 1, value: x }));
    setResult({ nums, sorted, n, median, mean, mode, range, variance, stddev, isEven, chartData, min: sorted[0], max: sorted[n - 1] });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); calculate(DEFAULTS.values); };

  const faqs = [
    { question: "What is the median?", answer: "The median is the middle value of a sorted dataset. For an odd number of values: median = middle element. For an even number: median = average of the two middle elements. The median is resistant to outliers — unlike the mean, extreme values don't skew it. For example: {1, 2, 100} → median = 2, mean = 34.3." },
    { question: "How do you calculate the median step by step?", answer: "1. List all values. 2. Sort them in ascending order. 3. If odd count (n): median = value at position (n+1)/2. If even count (n): median = average of values at positions n/2 and n/2+1. Example: {4, 8, 15, 16, 23, 42} → sorted: same. n=6 (even). Median = (15+16)/2 = 15.5." },
    { question: "When should you use median instead of mean?", answer: "Use median when data contains outliers or is skewed: income distributions (a billionaire skews the mean), house prices, response times, test scores. The median represents the 'typical' value better than the mean in skewed distributions. When data is symmetric and normally distributed, mean and median are approximately equal." },
    { question: "What is the difference between median and mode?", answer: "Median: the middle value when sorted — good for ordinal and skewed data. Mode: the most frequently occurring value — useful for categorical data (most popular color, shoe size). A dataset can be unimodal (one mode), bimodal (two modes), or multimodal. Unlike median and mean, mode can be used with non-numeric data." },
    { question: "What is the median in a normal distribution?", answer: "In a perfectly symmetric normal distribution, mean = median = mode. As distributions become skewed, these three measures of central tendency diverge. In a right-skewed distribution: mode < median < mean. In a left-skewed distribution: mean < median < mode. The median always falls between the mode and mean in skewed distributions." },
    { question: "Can there be multiple medians?", answer: "No — the median is always a unique value. However, with an even number of values, it may not be an actual data point (it's the average of the two middle values). If you want a value that actually appears in the dataset and represents the center, the median or quartile interpolation methods give the closest result." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Median Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Median Calculator</h1>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Median</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.median)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.n} values • {result.isEven ? `average of ${fmt(result.sorted[result.n/2-1])} and ${fmt(result.sorted[result.n/2])}` : `middle value at position ${Math.floor(result.n/2)+1}`}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Descriptive Statistics</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Count (n)", value: String(result.n) },
                    { label: "Median", value: fmt(result.median) },
                    { label: "Mean", value: fmt(result.mean) },
                    { label: "Mode", value: result.mode.map(fmt).join(", ") },
                    { label: "Range", value: fmt(result.range) },
                    { label: "Min", value: fmt(result.min) },
                    { label: "Max", value: fmt(result.max) },
                    { label: "Std. Deviation", value: fmt(result.stddev) },
                    { label: "Variance", value: fmt(result.variance) },
                    { label: "Sorted Data", value: result.sorted.map(fmt).join(", ") },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium break-all">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Data Distribution (Sorted)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="rank" tick={{ fontSize: 10 }} label={{ value: "Rank", position: "insideBottom", offset: -2, fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => Number(v).toLocaleString()} labelFormatter={(l) => `Rank ${l}`} />
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
            <h2>What Is a Median Calculator?</h2>
            <p>A median calculator finds the middle value of a dataset after sorting it in ascending order. Pre-filled with the sequence {"{4, 8, 15, 16, 23, 42}"} (the famous Lost numbers), the median is 15.5 — the average of the two middle values in this even-count dataset. The calculator also computes mean, mode, range, standard deviation, and variance for complete descriptive statistics.</p>
            <h2>How to Calculate the Median</h2>
            <p><strong>Step 1:</strong> Collect all values. <strong>Step 2:</strong> Sort in ascending order. <strong>Step 3:</strong> If n is odd — median = value at position (n+1)/2. If n is even — median = (value at n/2 + value at n/2+1) / 2. For {"{4, 8, 15, 16, 23, 42}"}: n=6 (even), median = (15+16)/2 = 15.5.</p>
            <h2>Median vs Mean vs Mode</h2>
            <p>The three measures of central tendency: <strong>Mean:</strong> arithmetic average — sensitive to outliers. <strong>Median:</strong> middle value — robust to outliers. <strong>Mode:</strong> most frequent — useful for categorical data. For income data: the mean ($59,000) is pulled up by high earners, while the median ($35,000) better represents the typical worker. This is why income statistics typically report median household income.</p>
            <h2>When Does Median Beat Mean?</h2>
            <p>Skewed distributions: right-skewed (housing prices, wealth) — median better. Left-skewed (age at retirement) — median better. Outliers present: a single extreme value shifts the mean drastically but barely affects the median. Ordinal data: rankings, Likert scales — median is more appropriate. Real estate: "median home price" is standard because a few luxury homes would inflate the mean.</p>
            <h2>Weighted Median</h2>
            <p>A weighted median assigns importance to values. Each value has a weight, and the weighted median is the value where accumulated weight reaches 50%. Used in: portfolio analysis (weighted by asset value), spatial median calculations, image processing (noise reduction). The standard median is a special case where all weights are equal.</p>
            <h2>Median Absolute Deviation (MAD)</h2>
            <p>MAD = median(|xᵢ − median|) — a robust measure of spread analogous to standard deviation but using medians instead of means. MAD is highly resistant to outliers: one extreme value can completely distort the standard deviation but barely affects MAD. Used in: outlier detection, robust statistics, financial risk analysis. MAD × 1.4826 estimates the standard deviation for normal distributions.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/median-calculator" />
          <PopularCalculators exclude="/calculator/median-calculator" />
        </div>
      </div>
    </>
  );
};

export default MedianCalculator;
