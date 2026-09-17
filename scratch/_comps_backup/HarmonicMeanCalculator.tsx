"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

interface HarmonicMeanResult {
  nums: number[];
  n: number;
  harmonicMean: number;
  arithmeticMean: number;
  geometricMean: number;
  median: number;
  reciprocals: { value: number; reciprocal: number }[];
  sumReciprocals: number;
  chartData: { name: string; value: number }[];
}

const HarmonicMeanCalculator = () => {
  const DEFAULTS = { values: "1, 2, 4, 8, 16" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [result, setResult] = useState<HarmonicMeanResult | null>(null);

  const calculate = (v = values) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n) && n !== 0);
    if (nums.length === 0) return;
    const n = nums.length;
    const harmonicMean = n / nums.reduce((s, x) => s + 1 / x, 0);
    const arithmeticMean = nums.reduce((s, x) => s + x, 0) / n;
    const geometricMean = Math.pow(nums.reduce((p, x) => p * x, 1), 1 / n);
    const sorted = [...nums].sort((a, b) => a - b);
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const reciprocals = nums.map((x) => ({ value: x, reciprocal: parseFloat((1 / x).toFixed(6)) }));
    const sumReciprocals = nums.reduce((s, x) => s + 1 / x, 0);

    const chartData = [
      { name: "Harmonic", value: parseFloat(harmonicMean.toFixed(4)) },
      { name: "Geometric", value: parseFloat(geometricMean.toFixed(4)) },
      { name: "Arithmetic", value: parseFloat(arithmeticMean.toFixed(4)) },
      { name: "Median", value: parseFloat(median.toFixed(4)) },
    ];

    setResult({ nums, n, harmonicMean, arithmeticMean, geometricMean, median, reciprocals, sumReciprocals, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); calculate(DEFAULTS.values); };

  const faqs = [
    { question: "What is the harmonic mean?", answer: "The harmonic mean is n divided by the sum of reciprocals of all values: HM = n / Σ(1/xᵢ). It is the appropriate average for rates — quantities measured as X per Y (speed, price-to-earnings, fuel efficiency). For {1, 2, 4, 8, 16}: HM = 5 / (1+0.5+0.25+0.125+0.0625) = 5 / 1.9375 ≈ 2.581." },
    { question: "When should you use the harmonic mean?", answer: "Use the harmonic mean for rates and ratios: average speed over equal distances (not equal times), average P/E ratio in a portfolio, average fuel efficiency in mpg, average price per unit when buying equal dollar amounts at different prices. The key: harmonic mean is appropriate when you are averaging rates where the denominator is the meaningful quantity." },
    { question: "How do harmonic, geometric, and arithmetic means compare?", answer: "For any set of positive numbers: Harmonic Mean ≤ Geometric Mean ≤ Arithmetic Mean. Equality holds only when all values are identical. AM-GM-HM inequality. The harmonic mean is pulled most strongly toward smaller values, making it the best choice when small values should get more weight (e.g., slow speeds reduce average speed more than fast speeds increase it)." },
    { question: "What is the speed averaging trap?", answer: "Classic example: drive 60 km at 30 mph, return 60 km at 60 mph. Average speed = ? Naive: (30+60)/2 = 45 mph (WRONG). Correct: total distance / total time = 120 / (60/30 + 60/60) = 120/3 = 40 mph = harmonic mean of 30 and 60. The harmonic mean correctly handles equal-distance averaging. For equal-time averaging, use the arithmetic mean." },
    { question: "What is the P/E ratio averaging trap?", answer: "A portfolio with stock A (P/E=10) and stock B (P/E=30) — what is the portfolio P/E? If equal number of shares: arithmetic mean P/E = 20. If equal dollar investment: harmonic mean P/E = 2/(1/10 + 1/30) = 2/(4/30) = 15. The harmonic mean is correct for equal-weighted dollar investment, because P/E = price/earnings, and you are buying equal dollars of each." },
    { question: "How is the harmonic mean used in finance?", answer: "Harmonic mean P/E: correct way to aggregate P/E ratios when comparing portfolios with equal dollar weights. Index construction: some indices use harmonic mean of constituent multiples. F-score (precision and recall): F₁ = 2 × (precision × recall) / (precision + recall) = harmonic mean of precision and recall. Network analysis: effective resistance uses harmonic mean relationships." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Harmonic Mean Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Harmonic Mean Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Data Set</label>
              <textarea value={values} onChange={(e) => setValues(e.target.value)} className="w-full px-3 py-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" rows={4} placeholder="Enter positive numbers separated by commas, spaces, or newlines" />
              <div className="text-xs text-muted-foreground mt-1">Values must be non-zero • Separate with commas, spaces, or newlines</div>
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
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Harmonic Mean</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.harmonicMean)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  HM = {result.n} / {fmt(result.sumReciprocals, 6)} = {fmt(result.harmonicMean)} • {result.n} values
                </div>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <div className="grid grid-cols-3 divide-x divide-border text-center">
                  <div className="px-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Geometric</div>
                    <div className="text-lg font-bold text-foreground">{fmt(result.geometricMean, 2)}</div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Arithmetic</div>
                    <div className="text-lg font-bold text-foreground">{fmt(result.arithmeticMean, 2)}</div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">AM ÷ HM</div>
                    <div className={`text-lg font-bold ${result.arithmeticMean / result.harmonicMean < 1.2 ? "text-green-600" : result.arithmeticMean / result.harmonicMean < 2 ? "text-orange-500" : "text-red-600"}`}>
                      {fmt(result.arithmeticMean / result.harmonicMean, 2)}×
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Mean Comparison</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Harmonic Mean (HM)", value: fmt(result.harmonicMean) },
                    { label: "Geometric Mean (GM)", value: fmt(result.geometricMean) },
                    { label: "Arithmetic Mean (AM)", value: fmt(result.arithmeticMean) },
                    { label: "Median", value: fmt(result.median) },
                    { label: "Count (n)", value: String(result.n) },
                    { label: "Sum of Reciprocals", value: fmt(result.sumReciprocals, 6) },
                    { label: "HM ≤ GM ≤ AM?", value: result.harmonicMean <= result.geometricMean && result.geometricMean <= result.arithmeticMean ? "Yes ✓" : "Check values" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Reciprocals Table</h3>
                <table className="w-full text-sm"><tbody>
                  <tr className="border-b font-semibold"><td className="py-1.5 text-muted-foreground">Value (x)</td><td className="text-right text-muted-foreground">Reciprocal (1/x)</td></tr>
                  {result.reciprocals.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5">{fmt(r.value)}</td>
                      <td className="text-right font-mono">{r.reciprocal}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold">
                    <td className="py-2">Sum</td>
                    <td className="text-right font-mono">{fmt(result.sumReciprocals, 6)}</td>
                  </tr>
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Mean Comparison Chart</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: number | string) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 4 })} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-semibold mb-3">Summary Statistics</h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">Count (n)</dt>
                    <dd className="font-medium">{result.n}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">Harmonic Mean</dt>
                    <dd className="font-medium">{fmt(result.harmonicMean)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">Geometric Mean</dt>
                    <dd className="font-medium">{fmt(result.geometricMean)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">Arithmetic Mean</dt>
                    <dd className="font-medium">{fmt(result.arithmeticMean)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">Median</dt>
                    <dd className="font-medium">{fmt(result.median)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">Sum of Reciprocals</dt>
                    <dd className="font-medium">{fmt(result.sumReciprocals, 6)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">AM − HM Gap</dt>
                    <dd className="font-medium">{fmt(result.arithmeticMean - result.harmonicMean)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">AM ÷ HM Ratio</dt>
                    <dd className="font-medium">{fmt(result.arithmeticMean / result.harmonicMean, 3)}×</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">AM ≥ GM ≥ HM</dt>
                    <dd className="font-medium">
                      {result.harmonicMean <= result.geometricMean && result.geometricMean <= result.arithmeticMean ? "Holds ✓" : "Check values"}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">Value Spread</dt>
                    <dd className="font-medium">
                      {result.arithmeticMean / result.harmonicMean < 1.2 ? "Tight" : result.arithmeticMean / result.harmonicMean < 2 ? "Moderate" : "Wide"}
                    </dd>
                  </div>
                </dl>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Harmonic Mean Calculator?</h2>
            <p>A harmonic mean calculator computes HM = n / Σ(1/xᵢ) and compares it against the geometric mean (GM) and arithmetic mean (AM). Pre-filled with the geometric sequence {"{1, 2, 4, 8, 16}"}: HM ≈ 2.581, GM = 4.0, AM = 6.2 — demonstrating the AM≥GM≥HM inequality. The reciprocals table shows exactly how each value contributes to the calculation.</p>
            <h2 className="text-2xl font-bold mb-3">The Harmonic Mean Formula</h2>
            <p><strong>HM = n / (1/x₁ + 1/x₂ + ... + 1/xₙ)</strong>. Equivalently: HM = n / Σ(1/xᵢ). For two values a and b: HM = 2ab/(a+b). The harmonic mean is the reciprocal of the arithmetic mean of the reciprocals. This gives smaller values more weight — essential when averaging rates where the denominator matters.</p>
            <h2 className="text-2xl font-bold mb-3">The AM-GM-HM Inequality</h2>
            <p>For any set of positive numbers: Arithmetic Mean ≥ Geometric Mean ≥ Harmonic Mean. Equality holds only when all values are equal. This inequality has deep mathematical significance — it appears in optimization, information theory, and geometry. The geometric mean sits exactly between AM and HM on a multiplicative scale.</p>
            <h2 className="text-2xl font-bold mb-3">Speed Averaging: The Classic Example</h2>
            <p>You drive 100 km at 60 km/h and return 100 km at 100 km/h. Average speed = HM(60, 100) = 2×60×100/(60+100) = 75 km/h. Verify: time out = 100/60 = 1.667h, time back = 100/100 = 1h, total 200 km in 2.667h = 75 km/h ✓. Always use harmonic mean for equal-distance averaging. Use arithmetic mean for equal-time averaging.</p>
            <h2 className="text-2xl font-bold mb-3">The F₁ Score in Machine Learning</h2>
            <p>F₁ = 2 × (Precision × Recall) / (Precision + Recall) = harmonic mean of precision and recall. Using the harmonic mean instead of arithmetic mean ensures that a high F₁ score requires both precision AND recall to be high. A model with precision=1.0 and recall=0.01 would get AM=0.505 (misleadingly high) but F₁=0.0198 (correctly low). This makes F₁ the standard binary classification metric.</p>
            <h2 className="text-2xl font-bold mb-3">P/E Ratio Aggregation</h2>
            <p>For an equal-dollar-weighted portfolio, the correct aggregate P/E is the harmonic mean: HM P/E = n / Σ(1/P/Eᵢ). If you invest $10,000 each in 3 stocks with P/E of 10, 20, 30: each dollar buys different amounts of earnings. HM P/E = 3/(0.1+0.05+0.033) = 3/0.183 = 16.4, not the arithmetic mean of 20. Many financial databases incorrectly report arithmetic P/E averages, understating value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/harmonic-mean-calculator" />
          <PopularCalculators exclude="/calculator/harmonic-mean-calculator" />
        </div>
      </div>
    </>
  );
};

export default HarmonicMeanCalculator;
