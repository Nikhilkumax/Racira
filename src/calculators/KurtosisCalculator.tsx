"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const KurtosisCalculator = () => {
  const DEFAULTS = { values: "1, 2, 3, 4, 5, 5, 5, 5, 6, 7, 8, 9, 10" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [result, setResult] = useState<any>(null);

  const calculate = (v = values) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n));
    if (nums.length < 4) return;
    const n = nums.length;
    const mean = nums.reduce((s, x) => s + x, 0) / n;
    const m2 = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    const m4 = nums.reduce((s, x) => s + (x - mean) ** 4, 0) / n;
    const stddev = Math.sqrt(m2);
    const kurtosisPop = m2 > 0 ? m4 / (m2 * m2) : 0;
    const excessKurtPop = kurtosisPop - 3;
    const kurtosisSample = n >= 4 && stddev > 0
      ? ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) *
        nums.reduce((s, x) => s + ((x - mean) / stddev) ** 4, 0) -
        (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3))
      : 0;

    let type = "";
    let interpretation = "";
    if (excessKurtPop > 0.5) {
      type = "Leptokurtic"; interpretation = "Heavy tails, sharp peak — more extreme outliers than normal";
    } else if (excessKurtPop < -0.5) {
      type = "Platykurtic"; interpretation = "Light tails, flat peak — fewer extreme outliers than normal";
    } else {
      type = "Mesokurtic"; interpretation = "Approximately normal tails — similar to Gaussian distribution";
    }

    const sorted = [...nums].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

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

    const m3 = nums.reduce((s, x) => s + (x - mean) ** 3, 0) / n;
    const skewness = stddev > 0 ? m3 / (stddev ** 3) : 0;

    setResult({ nums, n, mean, median, stddev, kurtosisPop, excessKurtPop, kurtosisSample, type, interpretation, chartData, skewness, sorted });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); calculate(DEFAULTS.values); };

  const faqs = [
    { question: "What is kurtosis?", answer: "Kurtosis measures the 'tailedness' of a distribution — how much probability is in the tails vs the center. High kurtosis (leptokurtic): heavy tails, more extreme outliers. Low kurtosis (platykurtic): light tails, fewer outliers. Normal kurtosis (mesokurtic): kurtosis = 3 (excess kurtosis = 0). Kurtosis is the 4th moment of the distribution." },
    { question: "What is excess kurtosis?", answer: "Excess kurtosis = kurtosis − 3, subtracting the normal distribution's kurtosis value. A normal distribution has excess kurtosis = 0. Most software reports excess kurtosis. Positive excess: heavier tails than normal (t-distributions, financial returns). Negative excess: lighter tails than normal (uniform distribution: excess = −1.2)." },
    { question: "What is the difference between leptokurtic, mesokurtic, and platykurtic?", answer: "Leptokurtic (excess > 0): sharp peak, heavy tails — more extreme values than expected. Examples: financial returns, income. Mesokurtic (excess ≈ 0): normal-like tails. Example: measurement errors. Platykurtic (excess < 0): flat peak, thin tails — bounded data with few extremes. Example: uniform distribution, exam scores near ceiling." },
    { question: "Is kurtosis about peakedness?", answer: "Common misconception: kurtosis is NOT primarily about peakedness. It is about tailedness — how much weight is in the tails. A distribution can be flat-topped yet still leptokurtic if it has heavy tails. The 'peakedness' interpretation was corrected by modern statisticians. Think of kurtosis as measuring the propensity for extreme outliers." },
    { question: "Why does kurtosis matter in finance?", answer: "Financial returns are typically leptokurtic (fat tails): extreme events occur far more often than a normal distribution predicts. 2008 crash, Black Monday (1987) — these would be impossibly rare under normal assumptions. Risk models ignoring kurtosis (like basic VaR) severely underestimate tail risk. Fat-tailed models (t-distribution, EVT) are essential for accurate risk assessment." },
    { question: "How are skewness and kurtosis related?", answer: "Both measure departure from normality but different aspects. Skewness (3rd moment): asymmetry — left vs right tail. Kurtosis (4th moment): tailedness — outlier propensity. A distribution can be symmetric (skew=0) but still leptokurtic (heavy tails on both sides). The Jarque-Bera test combines both to test for normality: JB = n/6 × [S² + K²/4]." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Kurtosis Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Kurtosis Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Data Set</label>
              <textarea value={values} onChange={(e) => setValues(e.target.value)} className="w-full px-3 py-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" rows={4} placeholder="Enter at least 4 numbers" />
              <div className="text-xs text-muted-foreground mt-1">Minimum 4 values required</div>
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
              <div className={`border-l-4 rounded-lg p-4 ${result.excessKurtPop > 0.5 ? "bg-red-500/10 border-red-500" : result.excessKurtPop < -0.5 ? "bg-blue-500/10 border-blue-500" : "bg-green-500/10 border-green-500"}`}>
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Excess Kurtosis</div>
                <div className="text-4xl font-bold" style={{ color: result.excessKurtPop > 0.5 ? "#ef4444" : result.excessKurtPop < -0.5 ? "#3b82f6" : "#10b981" }}>{fmt(result.excessKurtPop)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.type} — {result.interpretation}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Kurtosis Measures</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Kurtosis (population)", value: fmt(result.kurtosisPop) },
                    { label: "Excess Kurtosis (population)", value: fmt(result.excessKurtPop) },
                    { label: "Excess Kurtosis (sample)", value: fmt(result.kurtosisSample) },
                    { label: "Type", value: result.type },
                    { label: "Skewness", value: fmt(result.skewness) },
                    { label: "Mean", value: fmt(result.mean) },
                    { label: "Median", value: fmt(result.median) },
                    { label: "Std. Deviation", value: fmt(result.stddev) },
                    { label: "Normal Kurtosis (ref)", value: "3.0 (excess = 0)" },
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
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Normality Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Skewness", value: fmt(result.skewness), normal: "≈ 0" },
                    { label: "Excess Kurtosis", value: fmt(result.excessKurtPop), normal: "≈ 0" },
                    { label: "Assessment", value: result.type, normal: "Mesokurtic" },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between text-base">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{s.value} <span className="text-xs text-muted-foreground">(normal: {s.normal})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Kurtosis Calculator?</h2>
            <p>A kurtosis calculator measures the tailedness of a distribution — how prone the data is to producing extreme outliers. Pre-filled with 13 values that cluster around the center, the calculator computes population and sample kurtosis, excess kurtosis, classifies the distribution (leptokurtic/mesokurtic/platykurtic), and shows a distribution histogram.</p>
            <h2>Kurtosis vs Excess Kurtosis</h2>
            <p><strong>Kurtosis</strong> (raw, 4th standardized moment): κ = E[(X−μ)⁴]/σ⁴. A normal distribution has κ = 3. <strong>Excess kurtosis</strong> = κ − 3, zeroed at the normal distribution. Most software (R, Python, Excel KURT) reports excess kurtosis. Positive excess means heavier tails than normal; negative means lighter tails.</p>
            <h2>Leptokurtic, Mesokurtic, Platykurtic</h2>
            <p><strong>Leptokurtic</strong> (excess &gt; 0): heavy tails, sharp peak. More probability in the tails than normal — extreme events are more likely. Examples: stock returns, income, insurance claims. <strong>Mesokurtic</strong> (excess ≈ 0): similar to normal. <strong>Platykurtic</strong> (excess &lt; 0): light tails, flat top. Bounded data with few extremes. Example: uniform distribution (excess = −1.2).</p>
            <h2>Kurtosis in Risk Management</h2>
            <p>Financial returns are leptokurtic: the S&amp;P 500 has excess kurtosis around 2–4 on daily returns. This means market crashes and extreme gains are far more frequent than a normal model predicts. Standard VaR calculations using normal assumptions underestimate risk. Fat-tailed models (Student{"'"}s t-distribution, extreme value theory) provide more accurate tail risk estimates.</p>
            <h2>The Jarque-Bera Normality Test</h2>
            <p>JB = (n/6) × [S² + (K²/4)], where S = skewness, K = excess kurtosis. Under H₀ (normality): JB ~ χ²(2). Large JB → reject normality. This test efficiently combines both shape measures. A dataset with skewness = 0.5 and excess kurtosis = 1.5 with n=100 gives JB = 100/6 × (0.25 + 0.5625) ≈ 13.5, rejecting normality at the 1% level (critical value ≈ 9.21).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/kurtosis-calculator" />
          <PopularCalculators exclude="/calculator/kurtosis-calculator" />
        </div>
      </div>
    </>
  );
};

export default KurtosisCalculator;
