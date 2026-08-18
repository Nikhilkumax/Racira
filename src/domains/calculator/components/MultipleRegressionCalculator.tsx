"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

interface MrResult {
  b0: number;
  b1: number;
  b2: number;
  r2: number;
  n: number;
  equation: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { predicted: number; actual: number }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

// Solve 3x3 linear system via Gaussian elimination
function solve3(m: number[][], rhs: number[]): number[] | null {
  const a = m.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let r = col + 1; r < 3; r++) {
      const f = a[r][col] / a[col][col];
      for (let c = col; c < 4; c++) a[r][c] -= f * a[col][c];
    }
  }
  const x = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    let s = a[r][3];
    for (let c = r + 1; c < 3; c++) s -= a[r][c] * x[c];
    x[r] = s / a[r][r];
  }
  return x;
}

function calcMr(rows: number[][]): MrResult | null {
  const n = rows.length;
  if (n < 3) return null;
  let s1 = 0, s2 = 0, sy = 0;
  let s11 = 0, s22 = 0, s12 = 0, s1y = 0, s2y = 0;
  for (const [y, x1, x2] of rows) {
    s1 += x1; s2 += x2; sy += y;
    s11 += x1 * x1; s22 += x2 * x2; s12 += x1 * x2;
    s1y += x1 * y; s2y += x2 * y;
  }
  const mat = [
    [n, s1, s2],
    [s1, s11, s12],
    [s2, s12, s22],
  ];
  const rhs = [sy, s1y, s2y];
  const sol = solve3(mat, rhs);
  if (!sol) return null;
  const [b0, b1, b2] = sol;
  const meanY = sy / n;
  let ssTot = 0, ssRes = 0;
  const chartData: { predicted: number; actual: number }[] = [];
  for (const [y, x1, x2] of rows) {
    const pred = b0 + b1 * x1 + b2 * x2;
    ssTot += (y - meanY) ** 2;
    ssRes += (y - pred) ** 2;
    chartData.push({ predicted: Number(pred.toFixed(3)), actual: Number(y.toFixed(3)) });
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const breakdown = [
    { label: "Observations (n)", value: `${n}` },
    { label: "Intercept (b₀)", value: `${fmt(b0)}` },
    { label: "Coefficient X₁ (b₁)", value: `${fmt(b1)}` },
    { label: "Coefficient X₂ (b₂)", value: `${fmt(b2)}` },
    { label: "Regression Equation", value: `ŷ = ${fmt(b0)} + ${fmt(b1)}·X₁ + ${fmt(b2)}·X₂` },
    { label: "R² (coefficient of determination)", value: `${fmt(r2)}` },
  ];
  const summaryStats = [
    { label: "Intercept", value: `${fmt(b0)}` },
    { label: "b₁ (X₁)", value: `${fmt(b1)}` },
    { label: "b₂ (X₂)", value: `${fmt(b2)}` },
    { label: "R²", value: `${fmt(r2)}` },
    { label: "n", value: `${n}` },
  ];
  return { b0, b1, b2, r2, n, equation: `ŷ = ${fmt(b0)} + ${fmt(b1)}·X₁ + ${fmt(b2)}·X₂`, breakdown, summaryStats, chartData };
}

const DEFAULTS = { data: "12, 1, 2\n11, 2, 1\n19, 3, 3\n18, 4, 2\n26, 5, 4\n25, 6, 3\n33, 7, 5\n38, 8, 6" };
const DEFAULT_ROWS: number[][] = [[12, 1, 2], [11, 2, 1], [19, 3, 3], [18, 4, 2], [26, 5, 4], [25, 6, 3], [33, 7, 5], [38, 8, 6]];

export default function MultipleRegressionCalculator() {
  const [data, setData] = useState(DEFAULTS.data);
  const [result, setResult] = useState<MrResult | null>(null);

  const rows: number[][] = data
    .split("\n")
    .map((line) => line.trim().split(/[\s,;]+/).map(parseFloat).filter((v) => !isNaN(v)))
    .filter((r) => r.length === 3);
  const errs: string[] = [];
  if (rows.length < 3) errs.push("Enter at least three rows of y, x1, x2 (one per line).");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMr(rows)); };
  const reset = () => {
    setData(DEFAULTS.data);
    setResult(calcMr(DEFAULT_ROWS));
  };
  useEffect(() => { setResult(calcMr(DEFAULT_ROWS)); }, []);

  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[96px] font-mono text-sm";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is multiple regression?", answer: "A model fitting one outcome y as a linear combination of two or more predictors: ŷ = b₀ + b₁X₁ + b₂X₂. Each coefficient is the expected change in y per one-unit change in that predictor, holding the others fixed." },
    { question: "How are the coefficients found?", answer: "The calculator solves the normal equations — a 3×3 system built from sums of squares and cross-products — via Gaussian elimination. This is the least-squares solution: it minimizes the sum of squared residuals." },
    { question: "What is R²?", answer: "The proportion of variance in y explained by the model: 1 minus the ratio of residual to total sum of squares. R² = 1 is a perfect fit; R² = 0 means the predictors explain nothing. Compare models on adjusted R² when adding predictors." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Multiple Regression Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Multiple Regression Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Data — one row per line: y, x₁, x₂</label>
              <textarea value={data} onChange={e => setData(e.target.value)} rows={8} className={ta} placeholder="10, 1, 2&#10;12, 2, 3&#10;14, 3, 4" />
              <p className="text-xs text-muted-foreground mt-1">Three numbers per line: outcome, predictor 1, predictor 2. Use spaces or commas.</p>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Regression Equation</div>
                <div className="text-2xl font-extrabold tracking-tight font-mono break-words">{result.equation}</div>
                <div className="text-sm text-muted-foreground mt-1">R² = {fmt(result.r2)} · {result.n} observations</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Intercept b₀", fmt(result.b0)], ["b₁", fmt(result.b1)], ["b₂", fmt(result.b2)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""} font-mono text-sm`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Predicted vs Actual</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="predicted" name="Predicted" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="actual" name="Actual" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <ZAxis range={[60, 60]} />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Scatter data={result.chartData} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Points near the 45° line are well-predicted — scatter shrinks as R² → 1</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Two Predictors, One Outcome</h2>
            <p>Simple regression fits a line to one predictor. <strong>Multiple regression</strong> extends it to two or more: ŷ = b₀ + b₁X₁ + b₂X₂, where each coefficient measures that predictor's effect with the others held constant. This <strong>multiple regression calculator</strong> fits the two-predictor model by least squares.</p>
            <h2 className="text-2xl font-bold mb-3">The Normal Equations</h2>
            <p>Least squares leads to a small linear system — the normal equations — built from sums, sums of squares, and cross-products of the data. The calculator assembles the 3×3 system and solves it with Gaussian elimination, giving the exact coefficients in one pass.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Fit</h2>
            <p>R² reports how much of the outcome's variance the model explains; the predicted-vs-actual scatter makes the fit visual — points hugging the diagonal mean good predictions. Use the equation to forecast y for new combinations of X₁ and X₂.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/multiple-regression-calculator" />
          <PopularCalculators exclude="/calculator/multiple-regression-calculator" />
        </div>
      </div>
    </>
  );
}
