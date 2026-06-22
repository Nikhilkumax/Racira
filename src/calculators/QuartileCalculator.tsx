"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const QuartileCalculator = () => {
  const DEFAULTS = { values: "1, 3, 5, 7, 9, 11, 13, 15, 17, 19" };
  const [values, setValues] = useState(DEFAULTS.values);
  const [method, setMethod] = useState<"inclusive" | "exclusive">("inclusive");
  const [result, setResult] = useState<any>(null);

  const calcInclusive = (sorted: number[], p: number) => {
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  const calcExclusive = (sorted: number[], p: number) => {
    const idx = (p / 100) * (sorted.length + 1) - 1;
    const lo = Math.max(0, Math.floor(idx));
    const hi = Math.min(sorted.length - 1, Math.ceil(idx));
    if (idx <= 0) return sorted[0];
    if (idx >= sorted.length - 1) return sorted[sorted.length - 1];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  const calculate = (v = values, m = method) => {
    const nums = v.split(/[\s,;]+/).map(Number).filter((n) => !isNaN(n));
    if (nums.length < 4) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;
    const fn = m === "inclusive" ? calcInclusive : calcExclusive;
    const q0 = sorted[0];
    const q1 = fn(sorted, 25);
    const q2 = fn(sorted, 50);
    const q3 = fn(sorted, 75);
    const q4 = sorted[n - 1];
    const iqr = q3 - q1;
    const mean = nums.reduce((s, x) => s + x, 0) / n;

    const percentileData = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90].map((p) => ({
      p,
      value: parseFloat(fn(sorted, p).toFixed(2)),
    }));

    const chartData = [
      { label: "Min (Q0)", value: parseFloat(q0.toFixed(2)), color: "#94a3b8" },
      { label: "Q1 (25%)", value: parseFloat(q1.toFixed(2)), color: "#3b82f6" },
      { label: "Q2 (50%)", value: parseFloat(q2.toFixed(2)), color: "#10b981" },
      { label: "Q3 (75%)", value: parseFloat(q3.toFixed(2)), color: "#f59e0b" },
      { label: "Max (Q4)", value: parseFloat(q4.toFixed(2)), color: "#ef4444" },
    ];

    setResult({ nums, sorted, n, q0, q1, q2, q3, q4, iqr, mean, percentileData, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setValues(DEFAULTS.values); setMethod("inclusive"); calculate(DEFAULTS.values, "inclusive"); };

  const faqs = [
    { question: "What are quartiles?", answer: "Quartiles divide a sorted dataset into four equal parts. Q1 (25th percentile): 25% of values are below this. Q2 (50th percentile / median): 50% below. Q3 (75th percentile): 75% below. Along with min and max, quartiles form the five-number summary used in box plots." },
    { question: "What is the difference between inclusive and exclusive quartile methods?", answer: "Inclusive (Q.INC in Excel): index = p/100 × (n−1). Uses linear interpolation between sorted values. Result is always within the dataset range. Exclusive (Q.EXC in Excel): index = p/100 × (n+1) − 1. Can extrapolate slightly beyond the data range for extreme percentiles. Different methods give slightly different results for small datasets." },
    { question: "How do quartiles relate to percentiles?", answer: "Quartiles are special cases of percentiles: Q1 = P25, Q2 = P50, Q3 = P75. Percentiles divide the distribution into 100 equal parts. Deciles divide into 10 parts (D1=P10, D5=P50, D9=P90). Quartiles divide into 4 parts. This calculator shows percentiles from P10 through P90 alongside the quartile values." },
    { question: "What are the quartiles of a normal distribution?", answer: "For a standard normal distribution (mean=0, SD=1): Q1 ≈ −0.674, Q2 = 0, Q3 ≈ 0.674, IQR ≈ 1.349. For any normal distribution: Q1 = μ − 0.674σ, Q3 = μ + 0.674σ. The IQR of a normal distribution ≈ 1.349σ, so σ ≈ IQR/1.349. This relationship converts between IQR and standard deviation for normal data." },
    { question: "What is the quartile coefficient of dispersion?", answer: "QCD = (Q3 − Q1) / (Q3 + Q1). It is a dimensionless measure of relative dispersion, analogous to the coefficient of variation but using quartiles. QCD = 0 means all values are identical. QCD approaching 1 means extreme spread relative to the central tendency. It is especially useful for comparing spread across datasets with very different scales." },
    { question: "How are quartiles used in finance?", answer: "Performance quartiles rank investments: Q1 funds are in the top 25% of performers, Q4 in the bottom 25%. Salary quartile analysis identifies pay equity issues. Economic quartile analyses divide households by income. In risk management, the 5th percentile is often used as the Value at Risk (VaR) threshold." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Quartile Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Quartile Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Method</label>
              <div className="flex gap-2">
                {(["inclusive", "exclusive"] as const).map((m) => (
                  <button key={m} onClick={() => { setMethod(m); calculate(values, m); }} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${method === m ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {m === "inclusive" ? "Inclusive (Q.INC)" : "Exclusive (Q.EXC)"}
                  </button>
                ))}
              </div>
            </div>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">IQR (Q3 − Q1)</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.iqr)}</div>
                <div className="text-sm text-muted-foreground mt-1">Q1={fmt(result.q1)} • Q2={fmt(result.q2)} • Q3={fmt(result.q3)} • n={result.n}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Five-Number Summary</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Min (Q0)", value: fmt(result.q0) },
                    { label: "Q1 — 25th Percentile", value: fmt(result.q1) },
                    { label: "Q2 — Median (50th)", value: fmt(result.q2) },
                    { label: "Q3 — 75th Percentile", value: fmt(result.q3) },
                    { label: "Max (Q4)", value: fmt(result.q4) },
                    { label: "IQR (Q3 − Q1)", value: fmt(result.iqr) },
                    { label: "QCD (Q3−Q1)/(Q3+Q1)", value: fmt((result.q3 - result.q1) / (result.q3 + result.q1), 4) },
                    { label: "Mean", value: fmt(result.mean) },
                    { label: "Count (n)", value: String(result.n) },
                    { label: "Method", value: method === "inclusive" ? "Inclusive (Excel QUARTILE.INC)" : "Exclusive (Excel QUARTILE.EXC)" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Percentile Table (P10–P90)</h3>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <div className="font-semibold text-muted-foreground">Percentile</div>
                  <div className="font-semibold text-muted-foreground col-span-2">Value</div>
                  {result.percentileData.map((p: any) => (
                    <><div key={`p-${p.p}`} className="py-1 text-muted-foreground">P{p.p}</div><div key={`v-${p.p}`} className="py-1 col-span-2 font-medium">{fmt(p.value)}</div></>
                  ))}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Quartile Summary Chart</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} />
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Quartile Calculator?</h2>
            <p>A quartile calculator divides a dataset into four equal parts using Q1 (25th percentile), Q2 (50th percentile/median), and Q3 (75th percentile). Pre-filled with 10 evenly spaced values (1–19), Q1=5, Q2=10, Q3=15, IQR=10. Choose between inclusive (Excel QUARTILE.INC) and exclusive (QUARTILE.EXC) interpolation methods. The calculator also shows a full percentile table from P10 to P90.</p>
            <h2>How Quartiles Are Computed</h2>
            <p><strong>Inclusive method:</strong> index = p/100 × (n−1). Interpolate linearly between sorted[floor(index)] and sorted[ceil(index)]. Always returns a value within the data range. <strong>Exclusive method:</strong> index = p/100 × (n+1) − 1. May extrapolate slightly beyond the range. Different statistical software uses different methods, explaining occasional discrepancies between tools.</p>
            <h2>Five-Number Summary</h2>
            <p>The five-number summary (Min, Q1, Q2, Q3, Max) captures the essential shape of any distribution. Together with the IQR, it gives you: central tendency (Q2), spread (IQR), symmetry (compare Q2−Q1 to Q3−Q2), and extremes. It requires no distributional assumptions and is the basis of the box-and-whisker plot — arguably the most information-dense statistical graphic per unit area.</p>
            <h2>Quartile Coefficient of Dispersion</h2>
            <p>QCD = (Q3 − Q1) / (Q3 + Q1) — a dimensionless relative measure of spread. Unlike CV (σ/μ), QCD uses quartiles and is resistant to outliers. Values near 0 indicate little spread relative to the central quartiles. Values near 1 indicate very high relative spread. Useful for comparing variability across datasets with different units or very different scales.</p>
            <h2>Quartiles in Everyday Life</h2>
            <p>Income distribution: "bottom quartile" earns less than Q1, "top quartile" more than Q3. Investment performance: funds ranked in Q1 outperformed 75% of peers. Academic grading: "quartile rank" in class. Health percentiles: child growth charts show weight/height by percentile. Employee compensation: salary band analysis often uses Q1, midpoint (Q2), and Q3 to define pay ranges.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/quartile-calculator" />
          <PopularCalculators exclude="/calculator/quartile-calculator" />
        </div>
      </div>
    </>
  );
};

export default QuartileCalculator;
