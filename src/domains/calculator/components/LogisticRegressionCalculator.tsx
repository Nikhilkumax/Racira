"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, ComposedChart } from "recharts";

interface LogRegResult {
  n: number;
  b0: number;
  b1: number;
  oddsRatio: number;
  predX: number;
  predP: number;
  accuracy: number;
  mcfadden: number;
  points: { x: number; y: number }[];
  curve: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

// Iteratively reweighted least squares for maximum-likelihood logistic fit
function fitLogistic(xs: number[], ys: number[]): { b0: number; b1: number; llModel: number; llNull: number } {
  let b0 = 0, b1 = 0;
  for (let iter = 0; iter < 30; iter++) {
    let s00 = 0, s01 = 0, s11 = 0, z0 = 0, z1 = 0;
    for (let i = 0; i < xs.length; i++) {
      const p = sigmoid(b0 + b1 * xs[i]);
      const w = Math.max(p * (1 - p), 1e-10);
      const z = b0 + b1 * xs[i] + (ys[i] - p) / w;
      s00 += w;
      s01 += w * xs[i];
      s11 += w * xs[i] * xs[i];
      z0 += w * z;
      z1 += w * z * xs[i];
    }
    const det = s00 * s11 - s01 * s01;
    if (Math.abs(det) < 1e-12) break;
    const nb0 = (s11 * z0 - s01 * z1) / det;
    const nb1 = (s00 * z1 - s01 * z0) / det;
    if (Math.abs(nb0 - b0) < 1e-10 && Math.abs(nb1 - b1) < 1e-10) { b0 = nb0; b1 = nb1; break; }
    b0 = nb0; b1 = nb1;
  }
  // log-likelihoods
  const llModel = ys.reduce((s, y, i) => {
    const p = Math.min(0.999999, Math.max(0.000001, sigmoid(b0 + b1 * xs[i])));
    return s + (y === 1 ? Math.log(p) : Math.log(1 - p));
  }, 0);
  const k = ys.filter((y) => y === 1).length;
  const pNull = k / ys.length;
  const llNull = ys.reduce((s, y) => s + (y === 1 ? Math.log(pNull) : Math.log(1 - pNull)), 0);
  return { b0, b1, llModel, llNull };
}

function calcLogReg(xs: number[], ys: number[], predX: number): LogRegResult {
  const fit = fitLogistic(xs, ys);
  const b0 = fit.b0, b1 = fit.b1;
  const oddsRatio = Math.exp(b1);
  const predP = sigmoid(b0 + b1 * predX);
  const preds = xs.map((x) => (sigmoid(b0 + b1 * x) >= 0.5 ? 1 : 0));
  const accuracy = xs.reduce((s, _, i) => s + (preds[i] === ys[i] ? 1 : 0), 0) / xs.length;
  const mcfadden = 1 - fit.llModel / fit.llNull;
  const points = xs.map((x, i) => ({ x, y: ys[i] }));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const curve: { x: number; y: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = minX + ((maxX - minX) * i) / 60;
    curve.push({ x: Number(x.toFixed(3)), y: Number(sigmoid(b0 + b1 * x).toFixed(4)) });
  }
  const breakdown = [
    { label: "Sample Size", value: `${xs.length}` },
    { label: "Intercept β₀", value: `${fmt(b0)}` },
    { label: "Coefficient β₁", value: `${fmt(b1)}` },
    { label: "Odds Ratio e^β₁", value: `${fmt(oddsRatio)}` },
    { label: "Model Log-Likelihood", value: `${fmt(fit.llModel)}` },
    { label: "Null Log-Likelihood", value: `${fmt(fit.llNull)}` },
    { label: "McFadden Pseudo-R²", value: `${fmt(mcfadden)}` },
    { label: "Classification Accuracy", value: `${fmt(accuracy * 100, 1)}%` },
    { label: `P(y = 1) at x = ${fmt(predX)}`, value: `${fmt(predP * 100, 1)}%` },
  ];
  const summaryStats = [
    { label: "β₀", value: fmt(b0) },
    { label: "β₁", value: fmt(b1) },
    { label: "Odds Ratio", value: fmt(oddsRatio) },
    { label: "Pseudo-R²", value: fmt(mcfadden) },
    { label: "Accuracy", value: `${fmt(accuracy * 100, 1)}%` },
    { label: "Predicted P", value: `${fmt(predP * 100, 1)}%` },
    { label: "Equation", value: `p = σ(${fmt(b0, 2)} ${b1 >= 0 ? "+" : "−"} ${fmt(Math.abs(b1), 2)}x)` },
    { label: "Samples", value: `${xs.length}` },
  ];
  return { n: xs.length, b0, b1, oddsRatio, predX, predP, accuracy, mcfadden, points, curve, breakdown, summaryStats };
}

const DEFAULTS = { x: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10", y: "0, 0, 0, 0, 1, 0, 1, 1, 1, 1", px: "5.5" };

export default function LogisticRegressionCalculator() {
  const [xText, setXText] = useState(DEFAULTS.x);
  const [yText, setYText] = useState(DEFAULTS.y);
  const [px, setPx] = useState(DEFAULTS.px);
  const [result, setResult] = useState<LogRegResult | null>(null);

  const xs = xText.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const ys = yText.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const predX = parseFloat(px);
  const errs: string[] = [];
  if (xs.length < 4 || ys.length < 4) errs.push("Enter at least four data points.");
  if (xs.length !== ys.length) errs.push("Both lists must contain the same number of values.");
  if (ys.some((y) => y !== 0 && y !== 1)) errs.push("Y values must be binary — only 0 and 1 are allowed.");
  if (isNaN(predX)) errs.push("Enter a number for the prediction x.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLogReg(xs, ys, predX)); };
  const reset = () => {
    setXText(DEFAULTS.x); setYText(DEFAULTS.y); setPx(DEFAULTS.px);
    setResult(calcLogReg([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [0, 0, 0, 0, 1, 0, 1, 1, 1, 1], 5.5));
  };
  useEffect(() => { setResult(calcLogReg([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [0, 0, 0, 0, 1, 0, 1, 1, 1, 1], 5.5)); }, []);

  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[64px]";
  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is logistic regression?", answer: "It models the probability of a binary outcome as a sigmoid function of the predictors: p = 1/(1+e^(−(β₀+β₁x))). The coefficients are fitted by maximum likelihood — the parameter values that make the observed outcomes most probable." },
    { question: "What is the odds ratio?", answer: "e^β₁ is the multiplicative change in the odds of the outcome for each one-unit increase in x. An odds ratio of 2 means each unit of x doubles the odds; below 1 means it reduces them." },
    { question: "How do I read the pseudo-R²?", answer: "McFadden's pseudo-R² compares the model's log-likelihood to a model with no predictors: 1 − lnL(model)/lnL(null). Values above 0.2 indicate a useful model; unlike linear R² it does not represent explained variance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Logistic Regression Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Logistic Regression Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>X Values (predictor)</label>
                <textarea value={xText} onChange={e => setXText(e.target.value)} className={ta} placeholder="1, 2, 3, 4 ..." />
              </div>
              <div>
                <label className={lbl}>Y Values (0 or 1)</label>
                <textarea value={yText} onChange={e => setYText(e.target.value)} className={ta} placeholder="0, 0, 1, 1 ..." />
              </div>
              <div>
                <label className={lbl}>Predict probability at x =</label>
                <div className={inp}><input type="number" value={px} onChange={e => setPx(e.target.value)} className={ci} /></div>
              </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Predicted Probability at x = {fmt(result.predX)}</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.predP * 100, 1)}%</div>
                <div className="text-sm text-muted-foreground mt-1">P(y = 1) · odds ratio {fmt(result.oddsRatio)} per unit x · accuracy {fmt(result.accuracy * 100, 1)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`β₁`, fmt(result.b1)], ["Odds Ratio", fmt(result.oddsRatio)], ["Pseudo-R²", fmt(result.mcfadden)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Model Output</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 8 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 8 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Sigmoid Fit</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="x" name="X" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} />
                    <YAxis type="number" dataKey="y" name="P" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 1]} />
                    <ZAxis range={[60, 60]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, n: string) => [fmt(v), n === "y" ? "P(y=1)" : "Outcome"]} />
                    <Line data={result.curve} dataKey="y" name="P(y=1)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Scatter data={result.points} fill="#f59e0b" />
                  </ComposedChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Orange points are observed 0/1 outcomes; the blue curve is the fitted probability</p>
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
            <h2 className="text-2xl font-bold mb-3">Modeling Binary Outcomes</h2>
            <p>This <strong>logistic regression calculator</strong> fits a sigmoid curve to paired (x, y) data where y is 0 or 1. The fitted line is p = 1/(1+e^(−(β₀+β₁x))) — the probability of the positive outcome at every x.</p>
            <h2 className="text-2xl font-bold mb-3">Maximum-Likelihood Fitting</h2>
            <p>Coefficients are found with iteratively reweighted least squares, which converges to the maximum-likelihood estimate — the parameters under which the observed outcomes are most probable. This is the same fit a statistics package produces.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Model</h2>
            <p>The odds ratio e^β₁ quantifies how strongly x shifts the odds, the pseudo-R² summarizes overall fit, and the classification accuracy counts how often the fitted probability crosses 50% in the right direction. Use these together to judge the model.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/logistic-regression-calculator" />
          <PopularCalculators exclude="/calculator/logistic-regression-calculator" />
        </div>
      </div>
    </>
  );
}
