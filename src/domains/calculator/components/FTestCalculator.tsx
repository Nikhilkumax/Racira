"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, SigmaSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FTestResult {
  var1: number;
  var2: number;
  n1: number;
  n2: number;
  df1: number;
  df2: number;
  f: number;
  pValue: number;
  significant05: boolean;
  significant01: boolean;
  chartData: { name: string; value: number }[];
}

// Regularized incomplete beta function via continued fraction (Numerical Recipes)
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function gammln(xx: number): number {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = xx;
  let y = xx;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betai(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

function calcFTest(var1: number, var2: number, n1: number, n2: number): FTestResult {
  const df1 = n1 - 1;
  const df2 = n2 - 1;
  const f = var2 > 0 ? var1 / var2 : 0;
  // two-tailed p-value: p = 2 * I_{df2/(df2+df1*F)}(df2/2, df1/2), capped at 1
  const x = df2 / (df2 + df1 * f);
  let pValue = 2 * betai(df2 / 2, df1 / 2, x);
  if (f < 1) pValue = 2 * (1 - betai(df2 / 2, df1 / 2, x));
  pValue = Math.min(1, Math.max(0, pValue));
  const chartData = [
    { name: "Variance 1 (s₁²)", value: Number(var1.toFixed(2)) },
    { name: "Variance 2 (s₂²)", value: Number(var2.toFixed(2)) },
  ];
  return { var1, var2, n1, n2, df1, df2, f, pValue, significant05: pValue < 0.05, significant01: pValue < 0.01, chartData };
}

const DEFAULTS = { v1: "25", v2: "12", n1: "15", n2: "15" };

const faqs = [
  { question: "What is an F-test?", answer: "The F-test compares two variances: F = s₁² ÷ s₂², with degrees of freedom n₁−1 and n₂−1. It is used for ANOVA, regression significance, and comparing the spread of two samples." },
  { question: "How is the p-value computed?", answer: "Under the null hypothesis (equal variances) the ratio follows the F distribution. The p-value is computed from the regularized incomplete beta function — the same numerical method as statistical software." },
  { question: "What does the result mean?", answer: "A p-value below 0.05 means the variances differ significantly. The F-test is sensitive to non-normality, so for very skewed data the Levene or Brown–Forsythe test is more robust." },
];

export default function FTestCalculator() {
  const [v1, setV1] = useState(DEFAULTS.v1);
  const [v2, setV2] = useState(DEFAULTS.v2);
  const [n1, setN1] = useState(DEFAULTS.n1);
  const [n2, setN2] = useState(DEFAULTS.n2);
  const [result, setResult] = useState<FTestResult>(() => calcFTest(25, 12, 15, 15));

  useEffect(() => {
    const a = parseFloat(v1);
    const b = parseFloat(v2);
    const c = parseFloat(n1);
    const d = parseFloat(n2);
    if (!isNaN(a) && !isNaN(b) && !isNaN(c) && !isNaN(d) && a >= 0 && b > 0 && c >= 2 && d >= 2) setResult(calcFTest(a, b, c, d));
  }, [v1, v2, n1, n2]);

  const reset = () => { setV1(DEFAULTS.v1); setV2(DEFAULTS.v2); setN1(DEFAULTS.n1); setN2(DEFAULTS.n2); };
  const invalid = isNaN(parseFloat(v1)) || isNaN(parseFloat(v2)) || isNaN(parseFloat(n1)) || isNaN(parseFloat(n2)) || parseFloat(v1) < 0 || parseFloat(v2) <= 0 || parseFloat(n1) < 2 || parseFloat(n2) < 2;

  const breakdown = [
    { label: "Sample 1 Variance (s₁²)", value: `${result.var1.toFixed(2)}` },
    { label: "Sample 2 Variance (s₂²)", value: `${result.var2.toFixed(2)}` },
    { label: "Sample 1 Size (n₁)", value: `${result.n1}` },
    { label: "Sample 2 Size (n₂)", value: `${result.n2}` },
    { label: "df₁ = n₁ − 1", value: `${result.df1}` },
    { label: "df₂ = n₂ − 1", value: `${result.df2}` },
    { label: "F-Statistic (s₁² ÷ s₂²)", value: `${result.f.toFixed(4)}`, highlight: true },
    { label: "p-Value (two-tailed)", value: `${result.pValue.toFixed(4)}` },
    { label: "Conclusion (α = 0.05)", value: result.significant05 ? "Significant — variances differ" : "Not significant — variances similar" },
  ];

  const summaryStats = [
    { label: "F-Statistic", value: `${result.f.toFixed(4)}` },
    { label: "p-Value", value: `${result.pValue.toFixed(4)}` },
    { label: "df₁", value: `${result.df1}` },
    { label: "df₂", value: `${result.df2}` },
    { label: "s₁²", value: `${result.var1.toFixed(2)}` },
    { label: "s₂²", value: `${result.var2.toFixed(2)}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "F-Test Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">F-Test Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ft-v1" className="block text-sm font-medium mb-1 text-foreground">Sample 1 Variance (s₁²)</label>
                <input id="ft-v1" type="number" min="0" step="0.1" value={v1} onChange={(e) => setV1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ft-v2" className="block text-sm font-medium mb-1 text-foreground">Sample 2 Variance (s₂²)</label>
                <input id="ft-v2" type="number" min="0.01" step="0.1" value={v2} onChange={(e) => setV2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ft-n1" className="block text-sm font-medium mb-1 text-foreground">Sample 1 Size (n₁)</label>
                <input id="ft-n1" type="number" min="2" step="1" value={n1} onChange={(e) => setN1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ft-n2" className="block text-sm font-medium mb-1 text-foreground">Sample 2 Size (n₂)</label>
                <input id="ft-n2" type="number" min="2" step="1" value={n2} onChange={(e) => setN2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <SigmaSquare className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter non-negative variances (s₂² &gt; 0) and sample sizes ≥ 2.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">F-Statistic</div>
              <div className="text-4xl font-extrabold text-primary">{result.f.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground mt-1">df₁ = {result.df1}, df₂ = {result.df2} · p = {result.pValue.toFixed(4)}{result.significant05 ? " · significant" : ""}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">p-Value</div>
                <div className="text-lg font-bold text-primary">{result.pValue.toFixed(4)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">df₁</div>
                <div className="text-lg font-bold text-primary">{result.df1}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Verdict (α=0.05)</div>
                <div className="text-lg font-bold text-primary">{result.significant05 ? "Significant" : "Not significant"}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">The Two Variances</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the F-Test Calculator</h2>
            <p>The F-test compares two variances under the null hypothesis that they are equal. The statistic F = s₁² ÷ s₂² follows the F distribution with (n₁−1, n₂−1) degrees of freedom; the p-value here is computed directly from the regularized incomplete beta function, matching statistical software to several decimal places.</p>
            <h3>When to Use It</h3>
            <p>The two-sample F-test underpins ANOVA (comparing group means assumes comparable variances) and regression F-tests. Because it assumes normality, pair it with the Levene test for skewed data, and remember the test is two-tailed here — a very small F (s₁² ≪ s₂²) is just as informative as a large one.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/f-test-calculator" />
          <PopularCalculators exclude="/calculator/f-test-calculator" />
        </div>
      </div>
    </>
  );
}
