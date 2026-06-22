"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const StandardDeviationCalculator = () => {
  const DEFAULTS = { nums: "4, 7, 13, 2, 1, 8, 6, 11, 5, 9" };
  const [nums, setNums] = useState(DEFAULTS.nums);
  const [popMode, setPopMode] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculate = (input = nums, pop = popMode) => {
    const values = input.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    if (values.length < 2) return;
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (pop ? n : n - 1);
    const stdDev = Math.sqrt(variance);
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const chartData = values.map((v, i) => ({ name: `#${i + 1}`, value: v, mean: parseFloat(mean.toFixed(4)) }));
    setResult({
      primary: stdDev.toFixed(6),
      subtitle: `${pop ? "Population" : "Sample"} Std Dev of ${n} values (mean = ${mean.toFixed(4)})`,
      rows: [
        { label: "Count (n)", value: n },
        { label: "Sum", value: values.reduce((a, b) => a + b, 0).toFixed(4) },
        { label: "Mean (μ / x̄)", value: mean.toFixed(6) },
        { label: "Median", value: median.toFixed(4) },
        { label: "Variance", value: variance.toFixed(6) },
        { label: "Std Dev", value: stdDev.toFixed(6) },
        { label: "Min", value: sorted[0] },
        { label: "Max", value: sorted[n - 1] },
        { label: "Range", value: (sorted[n - 1] - sorted[0]).toFixed(4) },
        { label: "Coeff. of Variation", value: `${((stdDev / mean) * 100).toFixed(2)}%` },
      ],
      chartData, mean,
      summary: [
        { label: "Count", value: n },
        { label: "Mean", value: mean.toFixed(4) },
        { label: "Variance", value: variance.toFixed(6) },
        { label: "Standard Deviation", value: stdDev.toFixed(6), border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setNums(DEFAULTS.nums); setPopMode(false); calculate(DEFAULTS.nums, false); };

  const faqs = [
    { question: "What is standard deviation?", answer: "Standard deviation measures how spread out values are around the mean. A low SD means values cluster near the mean; a high SD means they are widely scattered." },
    { question: "When to use population vs sample SD?", answer: "Use population SD (divides by n) when you have data for the entire population. Use sample SD (divides by n−1, Bessel's correction) when your data is a sample from a larger population — which is most common in practice." },
    { question: "What is the standard deviation formula?", answer: "Sample SD = √[Σ(xᵢ − x̄)² / (n−1)]. Population SD = √[Σ(xᵢ − μ)² / n]. The difference is n−1 (sample) vs n (population) in the denominator." },
    { question: "What does a standard deviation of 0 mean?", answer: "All values are identical — there is no variation in the dataset." },
    { question: "What is the empirical rule (68-95-99.7)?", answer: "For a normal distribution: 68% of values fall within ±1 SD, 95% within ±2 SD, and 99.7% within ±3 SD of the mean. Values beyond ±3 SD are considered outliers." },
    { question: "What is the coefficient of variation?", answer: "CV = (SD / mean) × 100%. It expresses standard deviation as a percentage of the mean, enabling comparison of variability across datasets with different scales." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Standard Deviation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Standard Deviation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Numbers (comma or space separated)</label>
              <textarea value={nums} onChange={e => setNums(e.target.value)}
                className="w-full px-3 py-2 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all" rows={3} />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Type</label>
              <div className="flex gap-2">
                <button onClick={() => { setPopMode(false); calculate(nums, false); }}
                  className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${!popMode ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                  Sample (n−1)
                </button>
                <button onClick={() => { setPopMode(true); calculate(nums, true); }}
                  className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${popMode ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                  Population (n)
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Standard Deviation</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Statistical Breakdown</h3>
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
                  <h3 className="text-base font-semibold mb-3">Values vs Mean</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <ReferenceLine y={result.mean} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Mean", fill: "#ef4444", fontSize: 11 }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Standard Deviation Calculator?</h2>
            <p>A standard deviation calculator measures how spread out a dataset is around its mean. It computes all key descriptive statistics: mean, median, variance, standard deviation, range, and coefficient of variation — giving you a complete picture of your data's distribution in one step. This calculator supports both sample SD (divides by n−1, for data sampled from a larger population) and population SD (divides by n, for complete dataset analysis).</p>
            <p>Standard deviation is the most widely used measure of statistical dispersion. It appears in finance (portfolio risk, volatility), quality control (Six Sigma), scientific research (margin of error), education (grading on a curve), weather forecasting, and sports analytics.</p>
            <h2>The Standard Deviation Formula</h2>
            <p><strong>Sample SD:</strong> s = √[Σ(xᵢ − x̄)² / (n − 1)]</p>
            <p><strong>Population SD:</strong> σ = √[Σ(xᵢ − μ)² / n]</p>
            <p>Steps: (1) Find the mean x̄ = Σxᵢ / n. (2) Compute each deviation xᵢ − x̄. (3) Square each deviation. (4) Sum the squared deviations. (5) Divide by n−1 (sample) or n (population). (6) Take the square root. For the default dataset [4,7,13,2,1,8,6,11,5,9]: mean = 6.6, sample variance ≈ 13.6, sample SD ≈ 3.69.</p>
            <h2>Sample vs Population Standard Deviation</h2>
            <p>Bessel's correction (dividing by n−1 instead of n) corrects for the bias that arises when estimating population variance from a sample. Because sample means tend to be closer to sample data than the true population mean, dividing by n underestimates the population variance. Dividing by n−1 corrects this, producing an unbiased estimator. Use sample SD in virtually all research and data analysis contexts.</p>
            <h2>The Empirical Rule (68-95-99.7 Rule)</h2>
            <p>For normally distributed data: approximately 68% of values fall within one SD of the mean (μ ± σ), 95% within two SDs (μ ± 2σ), and 99.7% within three SDs (μ ± 3σ). Values more than 3 SDs from the mean are statistical outliers. This rule is the foundation of z-scores, hypothesis testing, and quality control limits.</p>
            <h2>Applications of Standard Deviation</h2>
            <p><strong>Finance:</strong> Stock volatility is measured by SD of daily returns. A high-SD stock (e.g., 3% daily SD) is riskier than a low-SD stock (0.5% daily SD). Portfolio theory uses SD to quantify and minimize risk. <strong>Quality control:</strong> Six Sigma aims for processes where the defect rate is beyond 6 standard deviations from the target — fewer than 3.4 defects per million. <strong>Research:</strong> Standard error = SD/√n; confidence intervals = mean ± 1.96 × SE (for 95% CI). <strong>Education:</strong> Standardized test scores (SAT, IQ) are scaled using mean and SD of the reference population.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Enter numbers separated by commas or spaces. Toggle between Sample and Population mode — the results update immediately. The bar chart shows each value with a red dashed line at the mean — values far from the line contribute most to the standard deviation. For z-score analysis, use the <a href="/calculator/z-score-calculator">z-score calculator</a>. For probability distributions, see the <a href="/calculator/normal-distribution-calculator">normal distribution calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/standard-deviation-calculator" />
          <PopularCalculators exclude="/calculator/standard-deviation-calculator" />
        </div>
      </div>
    </>
  );
};
export default StandardDeviationCalculator;
