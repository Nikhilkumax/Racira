"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const SkewnessCalculator = () => {
  const DEFAULTS = { values: "2, 7, 15, 36, 39, 40, 41, 42, 43" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [result, setResult] = useState<any>(null);

  const calculate = (v = values) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n));
    if (nums.length < 3) return;
    const n = nums.length;
    const mean = nums.reduce((s, x) => s + x, 0) / n;
    const m2 = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    const m3 = nums.reduce((s, x) => s + (x - mean) ** 3, 0) / n;
    const stddev = Math.sqrt(m2);
    const skewPop = stddev > 0 ? m3 / (stddev ** 3) : 0;
    const skewSample = n >= 3 && stddev > 0
      ? (n / ((n - 1) * (n - 2))) * nums.reduce((s, x) => s + ((x - mean) / stddev) ** 3, 0)
      : 0;
    const sorted = [...nums].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const pearsonSkew = stddev > 0 ? 3 * (mean - median) / stddev : 0;

    let interpretation = "";
    if (Math.abs(skewSample) < 0.5) interpretation = "Approximately symmetric";
    else if (skewSample >= 0.5 && skewSample < 1) interpretation = "Moderately right-skewed";
    else if (skewSample >= 1) interpretation = "Highly right-skewed";
    else if (skewSample <= -0.5 && skewSample > -1) interpretation = "Moderately left-skewed";
    else interpretation = "Highly left-skewed";

    const freq: Record<string, number> = {};
    const binWidth = (sorted[n - 1] - sorted[0]) / Math.min(8, Math.ceil(Math.sqrt(n)));
    if (binWidth > 0) {
      nums.forEach((x) => {
        const bin = Math.floor((x - sorted[0]) / binWidth);
        const label = `${fmt(sorted[0] + bin * binWidth, 1)}`;
        freq[label] = (freq[label] || 0) + 1;
      });
    }
    const chartData = Object.entries(freq).map(([label, count]) => ({ bin: label, count }));

    setResult({ nums, n, mean, median, stddev, skewPop, skewSample, pearsonSkew, interpretation, chartData, sorted });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); calculate(DEFAULTS.values); };

  const faqs = [
    { question: "What is skewness?", answer: "Skewness measures the asymmetry of a distribution. Positive skew (right-skewed): tail extends to the right, most values cluster left. Negative skew (left-skewed): tail extends left, most values cluster right. Zero skew: symmetric (like a normal distribution). Skewness helps determine if mean or median better represents 'typical' values." },
    { question: "How is skewness calculated?", answer: "Population skewness: γ₁ = m₃/σ³, where m₃ = Σ(xᵢ−μ)³/n. Sample skewness (Fisher's): G₁ = [n/((n−1)(n−2))] × Σ((xᵢ−x̄)/s)³. Pearson's second skewness coefficient: 3(mean−median)/σ. Each measures asymmetry differently — Fisher's is the most commonly used in software." },
    { question: "What do skewness values mean?", answer: "|skew| < 0.5: approximately symmetric. 0.5 ≤ |skew| < 1: moderately skewed. |skew| ≥ 1: highly skewed. Positive values indicate right skew (long right tail): income, wealth, home prices. Negative values indicate left skew (long left tail): exam scores (easy test), age at retirement." },
    { question: "Why does skewness matter?", answer: "Skewness determines: which central tendency measure to use (mean for symmetric, median for skewed). Whether parametric tests are appropriate (many assume normality). How to transform data for analysis (log transform for right skew). Risk assessment in finance (negative skew = left-tail risk). Model selection (some models assume symmetric residuals)." },
    { question: "What is the relationship between mean, median, and mode in skewed distributions?", answer: "Right-skewed: mode < median < mean. Left-skewed: mean < median < mode. Symmetric: mean ≈ median ≈ mode. The mean is pulled toward the tail because extreme values have more leverage. Pearson's rule of thumb: mean − mode ≈ 3 × (mean − median). This relationship helps quickly identify skewness direction." },
    { question: "How do you correct for skewness?", answer: "Right skew: log transform (log(x)), square root (√x), or Box-Cox transform. Left skew: reflect and log (log(max−x+1)), or square (x²). After transformation, data should be more symmetric, making parametric methods valid. Always verify the transformation worked by re-checking skewness of the transformed data." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Skewness Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Skewness Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Data Set</label>
              <textarea value={values} onChange={(e) => setValues(e.target.value)} className="w-full px-3 py-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" rows={4} placeholder="Enter at least 3 numbers" />
              <div className="text-xs text-muted-foreground mt-1">Minimum 3 values required</div>
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
              <div className={`bg-primary/10 border-l-4 rounded-lg p-4 ${result.skewSample > 0.1 ? "bg-blue-500/10 border-blue-500" : result.skewSample < -0.1 ? "bg-amber-500/10 border-amber-500" : "bg-green-500/10 border-green-500"}`}>
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Skewness (Fisher{"'"}s)</div>
                <div className="text-4xl font-bold" style={{ color: result.skewSample > 0.1 ? "#3b82f6" : result.skewSample < -0.1 ? "#f59e0b" : "#10b981" }}>{fmt(result.skewSample)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.interpretation} • n={result.n}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Skewness Measures</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Population Skewness (γ₁)", value: fmt(result.skewPop) },
                    { label: "Sample Skewness (G₁, Fisher)", value: fmt(result.skewSample) },
                    { label: "Pearson 2nd Skewness", value: fmt(result.pearsonSkew) },
                    { label: "Interpretation", value: result.interpretation },
                    { label: "Mean", value: fmt(result.mean) },
                    { label: "Median", value: fmt(result.median) },
                    { label: "Mean − Median", value: fmt(result.mean - result.median) },
                    { label: "Std. Deviation", value: fmt(result.stddev) },
                    { label: "Count (n)", value: String(result.n) },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData.length > 0 && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Distribution Histogram</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                      <XAxis dataKey="bin" tick={{ fontSize: 9 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`${v}`, "Count"]} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Skewness Calculator?</h2>
            <p>A skewness calculator measures the asymmetry of a probability distribution using three methods: population skewness (γ₁), Fisher{"'"}s sample skewness (G₁), and Pearson{"'"}s second skewness coefficient. Pre-filled with a left-skewed dataset, the calculator shows numerical skewness values, an interpretation, and a histogram visualizing the distribution shape.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Skewness Values</h2>
            <p>Skewness = 0: perfectly symmetric. Positive skewness: the right tail is longer — most values cluster at the left (e.g., income distributions). Negative skewness: the left tail is longer — most values cluster at the right (e.g., exam scores on an easy test). Magnitude matters: |skew| &lt; 0.5 is approximately symmetric, 0.5–1.0 is moderate, and &gt;1.0 is highly skewed.</p>
            <h2 className="text-2xl font-bold mb-3">Population vs Sample Skewness</h2>
            <p>Population skewness assumes you have the entire population: γ₁ = m₃/σ³. Sample skewness (Fisher{"'"}s G₁) adjusts for bias using: G₁ = [n/((n−1)(n−2))] × Σ((xᵢ−x̄)/s)³. For large samples, both converge. For small samples, Fisher{"'"}s adjustment is important — population skewness underestimates the true skewness of small samples.</p>
            <h2 className="text-2xl font-bold mb-3">Skewness in Finance</h2>
            <p>Financial returns often exhibit negative skewness — occasional large losses (crashes) with more frequent small gains. Investors dislike negative skewness because it implies tail risk. The 2008 crash was a negative skew event. Options pricing models that assume zero skewness (like Black-Scholes) misprice tail risk. Skewness is the third moment of the distribution — after mean (1st) and variance (2nd).</p>
            <h2 className="text-2xl font-bold mb-3">Correcting Skewness</h2>
            <p>Many statistical tests assume normality (symmetric, zero skewness). If data is skewed: log transform (right skew), square root (moderate right skew), reciprocal (strong right skew), or Box-Cox (automatic power selection). After transformation, verify that skewness is closer to zero. Some modern methods (bootstrap, permutation tests) work without normality assumptions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/skewness-calculator" />
          <PopularCalculators exclude="/calculator/skewness-calculator" />
        </div>
      </div>
    </>
  );
};

export default SkewnessCalculator;
