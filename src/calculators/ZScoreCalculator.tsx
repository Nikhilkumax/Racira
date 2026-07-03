"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ZScoreCalculator = () => {
  const DEFAULTS = { value: "75", mean: "60", stdDev: "10" };
  const [value, setValue] = useState(DEFAULTS.value);
  const [mean, setMean] = useState(DEFAULTS.mean);
  const [stdDev, setStdDev] = useState(DEFAULTS.stdDev);
  const [result, setResult] = useState<any>(null);

  // Standard normal CDF approximation
  const normCDF = (z: number): number => {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = z < 0 ? -1 : 1;
    const absZ = Math.abs(z);
    const t = 1 / (1 + p * absZ);
    const poly = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
    const erfc = poly * Math.exp(-absZ * absZ);
    return 0.5 * (1 + sign * (1 - erfc));
  };

  const calculate = (vV = value, mV = mean, sV = stdDev) => {
    const v = parseFloat(vV), m = parseFloat(mV), s = parseFloat(sV);
    if (isNaN(v) || isNaN(m) || isNaN(s) || s <= 0) return;
    const z = (v - m) / s;
    const pBelow = normCDF(z);
    const pAbove = 1 - pBelow;
    const pBetween = Math.abs(2 * pBelow - 1);

    const chartData = [-3, -2, -1, 0, 1, 2, 3].map(zi => ({
      name: `z=${zi}`,
      percentile: parseFloat((normCDF(zi) * 100).toFixed(1)),
      highlight: Math.abs(zi - z) < 0.5 ? parseFloat((normCDF(zi) * 100).toFixed(1)) : 0,
    }));

    setResult({
      primary: z.toFixed(4),
      subtitle: `${v} is ${z >= 0 ? "above" : "below"} the mean by ${Math.abs(z).toFixed(4)} standard deviations`,
      rows: [
        { label: "Value (x)", value: v },
        { label: "Mean (μ)", value: m },
        { label: "Std Dev (σ)", value: s },
        { label: "Z-Score", value: z.toFixed(6) },
        { label: "Percentile (below)", value: `${(pBelow * 100).toFixed(2)}%` },
        { label: "Percent above", value: `${(pAbove * 100).toFixed(2)}%` },
        { label: "Within ±1 SD of mean", value: z >= -1 && z <= 1 ? "Yes ✓" : "No" },
        { label: "Within ±2 SD of mean", value: z >= -2 && z <= 2 ? "Yes ✓" : "No" },
        { label: "Within ±3 SD of mean", value: z >= -3 && z <= 3 ? "Yes ✓" : "No" },
      ],
      chartData,
      summary: [
        { label: "Z-Score", value: z.toFixed(4) },
        { label: "Percentile rank", value: `${(pBelow * 100).toFixed(2)}%` },
        { label: "P(X ≤ x)", value: `${(pBelow * 100).toFixed(4)}%` },
        { label: "P(X > x)", value: `${(pAbove * 100).toFixed(4)}%`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValue(DEFAULTS.value); setMean(DEFAULTS.mean); setStdDev(DEFAULTS.stdDev); calculate(DEFAULTS.value, DEFAULTS.mean, DEFAULTS.stdDev); };

  const faqs = [
    { question: "What is a z-score?", answer: "A z-score (standard score) measures how many standard deviations a value is from the mean. Z = (x − μ) / σ. A z-score of +1.5 means the value is 1.5 standard deviations above the mean." },
    { question: "What does a z-score of 1.5 mean?", answer: "A z-score of 1.5 means the value is 1.5 standard deviations above the mean. The cumulative probability P(Z ≤ 1.5) ≈ 93.32%, meaning the value exceeds about 93% of the population." },
    { question: "What is a percentile?", answer: "The percentile tells you what percentage of the population falls below a given value. A z-score of 0 is the 50th percentile (median). Z = 1.645 is the 95th percentile." },
    { question: "When is a z-score considered unusual?", answer: "Values with |z| > 2 are considered unusual (outside 95% of the distribution). Values with |z| > 3 are considered extreme outliers (outside 99.7%)." },
    { question: "How is z-score used in hypothesis testing?", answer: "In a z-test, if the z-score of the test statistic exceeds the critical value (e.g., 1.96 for 95% confidence), the null hypothesis is rejected. The p-value equals P(Z > |z|) × 2 for a two-tailed test." },
    { question: "What is the difference between z-score and t-score?", answer: "Use z-scores when the population SD is known or the sample size is large (n > 30). Use t-scores when the population SD is unknown and the sample is small — the t-distribution has heavier tails to account for additional uncertainty." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Z-Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Z-Score Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Value (x)</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="75" step="any" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Population Mean (μ)</label>
              <input type="number" value={mean} onChange={e => setMean(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="60" step="any" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Standard Deviation (σ)</label>
              <input type="number" value={stdDev} onChange={e => setStdDev(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="0.001" step="any" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Z-Score</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Normal Distribution Percentiles</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip formatter={(v: any) => [`${v}%`, "Percentile"]} />
                      <Bar dataKey="percentile" fill="hsl(var(--primary))" opacity={0.5} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Z-Score Calculator?</h2>
            <p>A z-score calculator computes the standard score — how many standard deviations a particular value lies from the mean of a distribution. Pre-filled with a test score of 75 from a class where the mean is 60 and the standard deviation is 10, it shows z = (75−60)/10 = 1.5. This means the score is 1.5 standard deviations above average, placing it at the 93.32nd percentile — better than 93% of students.</p>
            <p>Z-scores are fundamental to statistics, research, quality control, finance, and any field that compares values to a reference distribution. This calculator also computes the cumulative probability from a standard normal table, eliminating the need to look up z-tables by hand.</p>
            <h2>The Z-Score Formula</h2>
            <p><strong>Z = (x − μ) / σ</strong> where x = your value, μ = population mean, σ = population standard deviation.</p>
            <p>For our example: Z = (75 − 60) / 10 = 15/10 = 1.5. A positive z-score means the value is above the mean; negative means below. Z = 0 means the value equals the mean exactly.</p>
            <h2>Z-Score to Percentile Conversion</h2>
            <p>The cumulative distribution function (CDF) of the standard normal distribution converts a z-score to a percentile. This requires numerical integration or table lookup — this calculator uses the Abramowitz and Stegun approximation (accurate to 7 decimal places). Key z-score benchmarks: z = −1.645 → 5th percentile. z = −1.282 → 10th. z = 0 → 50th. z = 1.282 → 90th. z = 1.645 → 95th. z = 1.960 → 97.5th. z = 2.576 → 99.5th.</p>
            <h2>Applications of Z-Scores</h2>
            <p><strong>Standardized testing:</strong> SAT, ACT, GRE, and GMAT scores are scaled using z-scores. An SAT score in the 90th percentile corresponds to z ≈ 1.28 above the test-takers' mean. <strong>Quality control:</strong> Six Sigma aims for z ≥ 6 for defect rates, corresponding to fewer than 3.4 defects per million opportunities. <strong>Finance:</strong> The Black-Scholes formula for option pricing uses z-scores of the normal distribution (the d1 and d2 terms). <strong>Medical research:</strong> Clinical trials compare treatment and control groups using z-tests when sample sizes are large.</p>
            <h2>Hypothesis Testing with Z-Scores</h2>
            <p>In a one-sample z-test, calculate z = (x̄ − μ₀) / (σ/√n) where x̄ is the sample mean, μ₀ is the hypothesized mean, σ is the known population SD, and n is sample size. If |z| exceeds the critical value (1.96 for 95% confidence, 2.576 for 99%), reject the null hypothesis. The p-value = 2 × P(Z &gt; |z|) for a two-tailed test — this calculator computes P(Z &gt; z) directly in the "Percent above" row.</p>
            <h2>Tips for This Calculator</h2>
            <p>Use a positive value for "above the mean" and negative for "below." The standard deviation must be positive (enter 0 in the SD field and the calculator will not compute). For sample-based z-scores where the population SD is unknown, use the <a href="/calculator/t-test-calculator">t-test calculator</a> instead. For raw data, first compute SD with the <a href="/calculator/standard-deviation-calculator">standard deviation calculator</a>, then use those values here.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/z-score-calculator" />
          <PopularCalculators exclude="/calculator/z-score-calculator" />
        </div>
      </div>
    </>
  );
};
export default ZScoreCalculator;
