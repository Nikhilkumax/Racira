"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, ComposedChart } from "recharts";

interface RegResult {
  n: number;
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  stdErr: number;
  predictX: number;
  predictY: number;
  points: { x: number; y: number }[];
  fitted: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcRegression(xs: number[], ys: number[], predX: number): RegResult {
  const n = xs.length;
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
    sxx += (xs[i] - meanX) * (xs[i] - meanX);
    syy += (ys[i] - meanY) * (ys[i] - meanY);
  }
  const slope = sxx > 0 ? sxy / sxx : 0;
  const intercept = meanY - slope * meanX;
  const r = sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
  const r2 = r * r;
  // standard error of the estimate
  let sse = 0;
  for (let i = 0; i < n; i++) {
    const pred = slope * xs[i] + intercept;
    sse += (ys[i] - pred) * (ys[i] - pred);
  }
  const stdErr = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;
  const predictY = slope * predX + intercept;
  const points = xs.map((x, i) => ({ x, y: ys[i] }));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const fitted = [minX, maxX].map((x) => ({ x, y: Number((slope * x + intercept).toFixed(4)) }));
  const breakdown = [
    { label: "Sample Size", value: `${n}` },
    { label: "Σx / Σy", value: `${fmt(xs.reduce((s, v) => s + v, 0))} / ${fmt(ys.reduce((s, v) => s + v, 0))}` },
    { label: "Σ(x−x̄)(y−ȳ)", value: `${fmt(sxy)}` },
    { label: "Σ(x−x̄)²", value: `${fmt(sxx)}` },
    { label: "Slope m = Sxy/Sxx", value: `${fmt(slope)}` },
    { label: "Intercept b = ȳ − m·x̄", value: `${fmt(intercept)}` },
    { label: "Regression Equation", value: `y = ${fmt(slope)}x ${intercept >= 0 ? "+" : "−"} ${fmt(Math.abs(intercept))}` },
    { label: "Pearson r / R²", value: `${fmt(r)} / ${fmt(r2)}` },
    { label: "Standard Error", value: `${fmt(stdErr)}` },
    { label: `Prediction at x = ${fmt(predX)}`, value: `${fmt(predictY)}` },
  ];
  const summaryStats = [
    { label: "Slope", value: fmt(slope) },
    { label: "Intercept", value: fmt(intercept) },
    { label: "R²", value: fmt(r2) },
    { label: "Pearson r", value: fmt(r) },
    { label: "Standard Error", value: fmt(stdErr) },
    { label: "Prediction", value: fmt(predictY) },
    { label: "Equation", value: `y = ${fmt(slope, 2)}x ${intercept >= 0 ? "+" : "−"} ${fmt(Math.abs(intercept), 2)}` },
    { label: "Samples", value: `${n}` },
  ];
  return { n, slope, intercept, r, r2, stdErr, predictX: predX, predictY, points, fitted, breakdown, summaryStats };
}

const DEFAULTS = { x: "1, 2, 3, 4, 5, 6, 7, 8", y: "2, 4, 5, 7, 8, 10, 11, 14", px: "10" };

export default function LinearRegressionCalculator() {
  const [xText, setXText] = useState(DEFAULTS.x);
  const [yText, setYText] = useState(DEFAULTS.y);
  const [px, setPx] = useState(DEFAULTS.px);
  const [result, setResult] = useState<RegResult | null>(null);

  const xs = xText.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const ys = yText.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const predX = parseFloat(px);
  const errs: string[] = [];
  if (xs.length < 3 || ys.length < 3) errs.push("Enter at least three data points.");
  if (xs.length !== ys.length) errs.push("Both lists must contain the same number of values.");
  if (isNaN(predX)) errs.push("Enter a number for the prediction x.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcRegression(xs, ys, predX)); };
  const reset = () => {
    setXText(DEFAULTS.x); setYText(DEFAULTS.y); setPx(DEFAULTS.px);
    setResult(calcRegression([1, 2, 3, 4, 5, 6, 7, 8], [2, 4, 5, 7, 8, 10, 11, 14], 10));
  };
  useEffect(() => { setResult(calcRegression([1, 2, 3, 4, 5, 6, 7, 8], [2, 4, 5, 7, 8, 10, 11, 14], 10)); }, []);

  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[64px]";
  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is linear regression?", answer: "It fits the line y = mx + b that minimizes the sum of squared vertical distances to the data — the ordinary least squares line. The slope and intercept come from closed-form sums of the x and y values." },
    { question: "What does R² mean?", answer: "R² is the fraction of the variance in y explained by x. It equals the square of Pearson's r and ranges from 0 (no linear relationship) to 1 (perfect fit). Values above 0.7 usually indicate a strong linear association." },
    { question: "Can I trust the prediction?", answer: "Predictions are interpolations when x falls inside the data range and extrapolations outside it. Extrapolation assumes the trend continues — often false — so treat far-out predictions with caution." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Linear Regression Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Linear Regression Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>X Values</label>
                <textarea value={xText} onChange={e => setXText(e.target.value)} className={ta} placeholder="1, 2, 3, 4 ..." />
              </div>
              <div>
                <label className={lbl}>Y Values</label>
                <textarea value={yText} onChange={e => setYText(e.target.value)} className={ta} placeholder="2, 4, 5, 7 ..." />
              </div>
              <div>
                <label className={lbl}>Predict y at x =</label>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Regression Equation</div>
                <div className="text-3xl font-extrabold tracking-tight">y = {fmt(result.slope)}x {result.intercept >= 0 ? "+" : "−"} {fmt(Math.abs(result.intercept))}</div>
                <div className="text-sm text-muted-foreground mt-1">R² = {fmt(result.r2)} · prediction at x = {fmt(result.predictX)}: y = {fmt(result.predictY)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Slope`, fmt(result.slope)], ["Intercept", fmt(result.intercept)], ["R²", fmt(result.r2)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Least Squares Computation</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Data Points and Best-Fit Line</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="x" name="X" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} />
                    <YAxis type="number" dataKey="y" name="Y" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <ZAxis range={[60, 60]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, n: string) => [fmt(v), n]} />
                    <Line data={result.fitted} dataKey="y" name="Best fit" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Scatter data={result.points} fill="#f59e0b" />
                  </ComposedChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Orange points are the data; the blue line is the least-squares fit</p>
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
            <h2 className="text-2xl font-bold mb-3">Ordinary Least Squares</h2>
            <p>This <strong>linear regression calculator</strong> fits y = mx + b to paired data by minimizing the sum of squared residuals. The slope is the covariance of x and y divided by the variance of x; the intercept centers the line through the means.</p>
            <h2 className="text-2xl font-bold mb-3">Goodness of Fit</h2>
            <p>Pearson's r measures the strength and direction of the linear association, and R² = r² reports the share of variance explained. The standard error of the estimate quantifies typical prediction error around the fitted line.</p>
            <h2 className="text-2xl font-bold mb-3">Forecasting</h2>
            <p>Enter an x value to get the model's prediction. Inside the observed range this is a reliable interpolation; beyond it, the line extrapolates under the assumption the trend persists — useful for trendlines, but verify the assumption before acting on far-out forecasts.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/linear-regression-calculator" />
          <PopularCalculators exclude="/calculator/linear-regression-calculator" />
        </div>
      </div>
    </>
  );
}
