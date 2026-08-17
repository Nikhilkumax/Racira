"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, Sigma } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
type SdMode = "sample" | "population";

interface CvInputs {
  data: string;
  mode: SdMode;
}

interface CvResult {
  count: number;
  sum: number;
  mean: number;
  variance: number;
  sd: number;
  cv: number;
  min: number;
  max: number;
  values: number[];
  chartData: { name: string; value: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation: CV = (σ / μ) × 100 ───────────────────────────────
function calculateCv(inputs: CvInputs): CvResult {
  const empty: CvResult = {
    count: 0, sum: 0, mean: 0, variance: 0, sd: 0, cv: 0, min: 0, max: 0,
    values: [], chartData: [], isError: true,
  };

  const parts = inputs.data.split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { ...empty, errorMsg: "Please enter at least one value." };
  }
  const values = parts.map((p) => parseFloat(p));
  if (values.some((v) => isNaN(v))) {
    return { ...empty, errorMsg: "All entries must be valid numbers — check for typos or stray commas." };
  }
  if (inputs.mode === "sample" && values.length < 2) {
    return { ...empty, errorMsg: "Sample standard deviation needs at least 2 values." };
  }

  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const deviations = values.map((v) => (v - mean) * (v - mean));
  const variance = deviations.reduce((a, b) => a + b, 0) / (inputs.mode === "sample" ? n - 1 : n);
  const sd = Math.sqrt(variance);
  const cv = mean !== 0 ? (sd / Math.abs(mean)) * 100 : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    count: n,
    sum,
    mean,
    variance,
    sd,
    cv,
    min,
    max,
    values,
    chartData: values.map((v, i) => ({ name: `#${i + 1}`, value: v })),
    isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: CvInputs = { data: "10, 12, 23, 23, 16, 23, 21, 16", mode: "sample" };

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

function cvLabel(cv: number): { text: string; color: string } {
  if (cv < 15) return { text: "Low variability", color: "text-emerald-600" };
  if (cv <= 30) return { text: "Moderate variability", color: "text-amber-600" };
  return { text: "High variability", color: "text-red-500" };
}

// ── 4. Component ──────────────────────────────────────────────────────────
const CoefficientOfVariationCalculator = () => {
  const [inputs, setInputs] = useState<CvInputs>(DEFAULTS);
  const [result, setResult] = useState<CvResult>(() => calculateCv(DEFAULTS));

  useEffect(() => {
    setResult(calculateCv(DEFAULTS));
  }, []);

  const handleCalculate = () => setResult(calculateCv(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCv(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "What is the coefficient of variation?", answer: "The coefficient of variation (CV) is the ratio of the standard deviation to the mean, expressed as a percentage: CV = (σ / μ) × 100. It measures relative variability — how spread out a data set is compared to its average — making it useful for comparing variation between data sets with different units or very different means." },
    { question: "Why use CV instead of standard deviation?", answer: "Standard deviation is an absolute measure, so a standard deviation of 5 means something very different for a mean of 10 than for a mean of 10,000. The CV normalizes spread by the mean, giving a unit-free percentage that can be compared across scales, units, and experiments." },
    { question: "What is the difference between sample and population?", answer: "A population includes every member of the group you are studying; its variance divides by n. A sample is a subset, and dividing by n − 1 (Bessel's correction) gives an unbiased estimate of the population variance. Use 'sample' when your data is a sample of a larger group, which is the usual case in research." },
    { question: "What is considered a good CV?", answer: "A CV below 15% indicates low relative variability (consistent measurements), 15–30% is moderate, and above 30% signals high variability relative to the mean. In quality control, a low CV shows a process is stable; in finance, a low CV for an investment means more consistent returns per unit of risk." },
    { question: "When does the CV fail?", answer: "The CV is meaningless when the mean is at or near zero, because the ratio blows up or becomes undefined — this calculator reports 0% in that case. It also hides important context when values can be negative, since the mean may not represent a meaningful center." },
  ];

  const label = cvLabel(result.cv);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Coefficient of Variation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Coefficient of Variation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="flex flex-col">
              <label htmlFor="data-values" className="text-sm font-medium mb-1">Data Values</label>
              <div className="w-full rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <textarea
                  id="data-values"
                  value={inputs.data}
                  onChange={(e) => setInputs((p) => ({ ...p, data: e.target.value }))}
                  rows={4}
                  className="w-full p-3 text-base bg-transparent outline-none border-none text-foreground resize-y"
                  placeholder="10, 12, 23, 23, 16, 23, 21, 16"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Separate values with commas, spaces, or new lines.</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1">Standard Deviation</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                {(["sample", "population"] as SdMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInputs((p) => ({ ...p, mode: m }))}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      inputs.mode === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {m === "sample" ? "Sample (n−1)" : "Population (n)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 print-section">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Coefficient of Variation</div>
                  <div className="text-4xl font-bold text-primary">
                    {fmt(result.cv)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {inputs.mode === "sample" ? "Sample" : "Population"} — <span className={`font-semibold ${label.color}`}>{label.text}</span>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Mean (μ)", value: fmt(result.mean), color: "text-foreground" },
                    { label: "Std Dev (σ)", value: fmt(result.sd), color: "text-foreground" },
                    { label: "CV", value: `${fmt(result.cv)}%`, color: "text-primary" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Statistics Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Number of Values (n)", value: String(result.count) },
                        { label: "Sum (Σx)", value: fmt(result.sum) },
                        { label: "Mean (μ)", value: fmt(result.mean) },
                        { label: "Variance", value: fmt(result.variance, 4) },
                        { label: "Standard Deviation (σ)", value: fmt(result.sd, 4) },
                        { label: "Coefficient of Variation", value: `${fmt(result.cv)}%`, highlight: true },
                        { label: "Minimum", value: fmt(result.min) },
                        { label: "Maximum", value: fmt(result.max) },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b last:border-0 ${r.highlight ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 text-right font-semibold">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Data Points vs Mean</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number) => [String(value), "Value"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <ReferenceLine y={result.mean} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ value: "Mean", position: "top", fill: "hsl(var(--primary))", fontSize: 11, fontWeight: "bold" }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={Math.abs(entry.value - result.mean) > result.sd ? "#ef4444" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#10b981" }} /> Within 1 SD of mean</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#ef4444" }} /> Outside 1 SD</span>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Count (n)", value: String(result.count) },
                      { label: "Sum (Σx)", value: fmt(result.sum) },
                      { label: "Mean (μ)", value: fmt(result.mean) },
                      { label: "Variance", value: fmt(result.variance, 4) },
                      { label: "Std Dev (σ)", value: fmt(result.sd, 4) },
                      { label: "Coefficient of Variation", value: `${fmt(result.cv)}%` },
                      { label: "Minimum", value: fmt(result.min) },
                      { label: "Maximum", value: fmt(result.max) },
                      { label: "SD Basis", value: inputs.mode === "sample" ? "Sample (n−1)" : "Population (n)" },
                      { label: "Interpretation", value: label.text },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Coefficient of Variation?</h2>
            <p>The coefficient of variation (CV) measures how spread out a data set is relative to its own mean. It is the standard deviation divided by the mean, expressed as a percentage: <strong>CV = (σ / μ) × 100</strong>. Because it is unit-free, the CV lets you compare variability between data sets that use completely different scales — a lab measurement in milligrams versus a stock return in dollars, for example.</p>

            <h2 className="text-2xl font-bold mb-3">How This Calculator Works</h2>
            <p>Paste or type your data values separated by commas, spaces, or new lines, choose between sample and population standard deviation, and click Calculate. The calculator computes the mean, variance, standard deviation, and coefficient of variation, then visualizes each data point against the mean so you can see which values fall within one standard deviation of the center.</p>
            <p>With the default data set (10, 12, 23, 23, 16, 23, 21, 16), the mean is 18 and the sample standard deviation is about 5.24, giving a CV of roughly 29.1% — moderate variability. Switching to population mode changes the standard deviation to about 4.90 and the CV to 27.2%, since the variance then divides by n instead of n − 1.</p>

            <h2 className="text-2xl font-bold mb-3">Sample vs Population Standard Deviation</h2>
            <p>Use <strong>population</strong> when your data covers every member of the group (all students in a class, every batch a factory produced). Use <strong>sample</strong> when your data is a subset drawn from a larger group — the typical case in research. The sample formula divides by n − 1, a correction that prevents the variance from being systematically underestimated on average.</p>

            <h2 className="text-2xl font-bold mb-3">Interpreting Your Result</h2>
            <p>A CV below 15% indicates low relative variability, meaning values cluster tightly around the mean — desirable in quality control and measurement. A CV of 15–30% is moderate. Above 30%, the data is highly variable relative to its center. In investing, the CV is used as a risk-adjusted return measure: a lower CV means more consistent returns per unit of average return.</p>

            <h2 className="text-2xl font-bold mb-3">When the CV Should Be Avoided</h2>
            <p>The CV is only meaningful when the mean is a sensible reference point. If the mean is at or near zero, the ratio becomes extreme or undefined. If values can be negative (like temperature in Celsius or profit margins), the mean may not represent a meaningful center, and the CV can mislead. In those cases, report the standard deviation directly instead.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/coefficient-of-variation-calculator" />
          <PopularCalculators exclude="/calculator/coefficient-of-variation-calculator" />
        </div>
      </div>
    </>
  );
};

export default CoefficientOfVariationCalculator;
