"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const ModeCalculator = () => {
  const DEFAULTS = { values: "3, 7, 5, 13, 20, 23, 39, 23, 40, 23, 14, 12, 56, 23, 29" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [result, setResult] = useState<any>(null);

  const calculate = (v = values) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n));
    if (nums.length === 0) return;
    const freq: Record<number, number> = {};
    nums.forEach((x) => { freq[x] = (freq[x] || 0) + 1; });
    const sorted = [...nums].sort((a, b) => a - b);
    const n = nums.length;
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq)
      .filter(([, f]) => f === maxFreq)
      .map(([k]) => Number(k))
      .sort((a, b) => a - b);
    const isMultimodal = modes.length > 1;
    const isNoMode = maxFreq === 1;
    const mean = nums.reduce((s, x) => s + x, 0) / n;
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const chartData = Object.entries(freq)
      .map(([k, f]) => ({ value: Number(k), freq: f, isMode: f === maxFreq }))
      .sort((a, b) => a.value - b.value);
    setResult({ nums, freq, n, modes, maxFreq, isMultimodal, isNoMode, mean, median, sorted, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); calculate(DEFAULTS.values); };

  const faqs = [
    { question: "What is the mode?", answer: "The mode is the value that appears most frequently in a dataset. A dataset can have no mode (all values unique), one mode (unimodal), two modes (bimodal), or more (multimodal). Unlike mean and median, mode can be used with non-numeric data (most popular color, most common name, most frequent shoe size)." },
    { question: "How do you find the mode?", answer: "1. List all values. 2. Count how many times each value appears. 3. The value(s) with the highest count are the mode. If all values appear the same number of times, there is no mode. Example: {3, 7, 5, 23, 23, 23} — 23 appears 3 times (most frequent), so mode = 23." },
    { question: "What is a bimodal distribution?", answer: "A bimodal distribution has two modes — two peaks in the frequency distribution. Example: exam scores where half the class scores around 60% and half around 90% (two distinct groups). Bimodal data often indicates the presence of two subpopulations and may warrant separate analysis of each group." },
    { question: "When is there no mode?", answer: "When every value appears exactly once, there is no mode. Example: {1, 2, 3, 4, 5} — each appears once. Some statisticians say the entire dataset is the mode in this case, but the conventional definition is that no mode exists. This calculator reports 'No mode' when all values are unique." },
    { question: "Can mode be used with categorical data?", answer: "Yes — mode is the only measure of central tendency applicable to nominal (categorical) data. Example: survey responses {Red, Blue, Blue, Green, Red, Red} → mode = Red. Mean and median require numeric ordering, but mode only needs to count occurrences. This makes it essential for market research, voting analysis, and classification problems." },
    { question: "How does mode compare to mean and median?", answer: "Mode: most frequent value — best for categorical data and finding common values. Mean: arithmetic average — best for symmetric, continuous data without outliers. Median: middle value — best for skewed distributions and ordinal data. In a perfectly symmetric unimodal distribution: mean = median = mode. As skewness increases, they diverge." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Mode Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mode Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                  {result.isNoMode ? "No Mode" : result.isMultimodal ? "Multimodal" : "Mode"}
                </div>
                <div className="text-4xl font-bold text-primary">
                  {result.isNoMode ? "—" : result.modes.map(fmt).join(", ")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.isNoMode
                    ? "All values appear equally — no mode exists"
                    : `Appears ${result.maxFreq} times • ${result.n} total values`}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Summary Statistics</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Count (n)", value: String(result.n) },
                    { label: "Mode(s)", value: result.isNoMode ? "No mode" : result.modes.map(fmt).join(", ") },
                    { label: "Mode Frequency", value: result.isNoMode ? "1 (all equal)" : String(result.maxFreq) },
                    { label: "Distribution Type", value: result.isNoMode ? "No mode" : result.isMultimodal ? `Multimodal (${result.modes.length} modes)` : "Unimodal" },
                    { label: "Mean", value: fmt(result.mean) },
                    { label: "Median", value: fmt(result.median) },
                    { label: "Min", value: fmt(result.sorted[0]) },
                    { label: "Max", value: fmt(result.sorted[result.n - 1]) },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Frequency Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="value" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} label={{ value: "Freq", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => [`${v} times`, "Frequency"]} />
                    <Bar dataKey="freq" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.isMode ? "#f59e0b" : "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Mode</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Other values</span>
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Mode Calculator?</h2>
            <p>A mode calculator finds the most frequently occurring value(s) in a dataset and builds a complete frequency distribution. Pre-filled with 15 numbers, the mode is 23 (appearing 4 times) — a clear unimodal distribution. The frequency chart highlights modes in amber for immediate visual identification, while also computing mean and median for comparison.</p>
            <h2>Types of Mode Distributions</h2>
            <p><strong>Unimodal:</strong> one clear peak — one mode. <strong>Bimodal:</strong> two peaks — two values tied for highest frequency. Often signals two subpopulations. <strong>Multimodal:</strong> three or more modes. <strong>No mode:</strong> all values appear equally often — applies when every value is unique. Real datasets with bimodal distributions often warrant splitting into separate sub-analyses.</p>
            <h2>Mode in Grouped Data</h2>
            <p>For continuous data grouped into class intervals, the modal class is the class with the highest frequency. The exact mode is estimated as: Mode = L + [(f₁−f₀)/(2f₁−f₀−f₂)] × h, where L = lower boundary of modal class, f₁ = modal class frequency, f₀ = frequency before modal class, f₂ = frequency after, h = class width. This is used in histograms and grouped frequency tables.</p>
            <h2>Mode in Machine Learning</h2>
            <p>Mode imputation: replacing missing categorical values with the most common value — a standard preprocessing technique. Modal class: the predicted class with highest probability in classification problems. K-modes clustering: an extension of K-means for categorical data that uses mode instead of mean as the cluster centroid. Mode is essential for any pipeline involving categorical features.</p>
            <h2>Mode in Probability Theory</h2>
            <p>For a probability distribution, the mode is the value at which the probability density function reaches its maximum. Normal distribution: mode = mean = median (symmetric). Exponential distribution: mode = 0 (always). Beta distribution: mode varies with shape parameters. Bimodal distributions — like the mixture of two Gaussians — have two probability peaks and arise naturally in many real-world phenomena.</p>
            <h2>Practical Applications</h2>
            <p>Retail: most popular shoe size, best-selling product (inventory planning). Education: most common grade, most frequently missed question. Quality control: most common defect type. Medicine: most frequent diagnosis, most common side effect. Meteorology: most common wind direction. Political science: plurality winner in elections (the candidate with the most votes, i.e., the mode).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mode-calculator" />
          <PopularCalculators exclude="/calculator/mode-calculator" />
        </div>
      </div>
    </>
  );
};

export default ModeCalculator;
