"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Activity } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CorrResult {
  r: number;
  r2: number;
  n: number;
  strength: string;
  direction: string;
  slope: number | null;
  intercept: number | null;
  chartData: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function parseSeries(text: string): number[] {
  return text.split(/[,\s;]+/).map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
}

function calcCorr(xText: string, yText: string): CorrResult | null {
  const xs = parseSeries(xText);
  const ys = parseSeries(yText);
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;

  let sumX = 0, sumY = 0;
  for (let i = 0; i < n; i++) { sumX += xs[i]; sumY += ys[i]; }
  const meanX = sumX / n, meanY = sumY / n;

  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
    sxx += (xs[i] - meanX) ** 2;
    syy += (ys[i] - meanY) ** 2;
  }
  const denom = Math.sqrt(sxx * syy);
  const r = denom === 0 ? 0 : sxy / denom;
  const r2 = r * r;
  const slope = sxx !== 0 ? sxy / sxx : null;
  const intercept = slope !== null ? meanY - slope * meanX : null;

  const abs = Math.abs(r);
  const strength = abs >= 0.8 ? "Very strong" : abs >= 0.6 ? "Strong" : abs >= 0.4 ? "Moderate" : abs >= 0.2 ? "Weak" : "Very weak / none";
  const direction = r >= 0 ? "Positive" : "Negative";

  const chartData = xs.slice(0, n).map((x, i) => ({ x, y: ys[i] }));

  const breakdown = [
    { label: "Pairs (n)", value: `${n}` },
    { label: "Pearson r", value: `${r.toFixed(4)}` },
    { label: "r² (coefficient of determination)", value: `${r2.toFixed(4)}` },
    { label: "Direction", value: direction },
    { label: "Strength", value: strength },
    { label: "Mean X", value: `${meanX.toFixed(3)}` },
    { label: "Mean Y", value: `${meanY.toFixed(3)}` },
    { label: "Regression Slope", value: slope === null ? "—" : `${slope.toFixed(4)}` },
  ];

  const summaryStats = [
    { label: "Pearson r", value: `${r.toFixed(4)}` },
    { label: "r²", value: `${r2.toFixed(4)}` },
    { label: "Pairs (n)", value: `${n}` },
    { label: "Direction", value: direction },
    { label: "Strength", value: strength },
    { label: "Slope (b₁)", value: slope === null ? "—" : `${slope.toFixed(4)}` },
  ];

  return { r, r2, n, strength, direction, slope, intercept, chartData, breakdown, summaryStats };
}

const DEFAULTS = { x: "1, 2, 3, 4, 5, 6, 7, 8", y: "2, 4, 5, 4, 6, 8, 7, 9" };

export default function CorrelationCoefficientCalculator() {
  const [x, setX] = useState(DEFAULTS.x);
  const [y, setY] = useState(DEFAULTS.y);
  const [result, setResult] = useState<CorrResult | null>(() => calcCorr(DEFAULTS.x, DEFAULTS.y));

  useEffect(() => {
    setResult(calcCorr(x, y));
  }, []);

  const reset = () => { setX(DEFAULTS.x); setY(DEFAULTS.y); setResult(calcCorr(DEFAULTS.x, DEFAULTS.y)); };

  const faqs = [
    { question: "What does a correlation of 1 or −1 mean?", answer: "r = 1 means a perfect positive linear relationship, r = −1 a perfect negative one, and r = 0 no linear relationship. Values between reflect partial strength." },
    { question: "Does correlation imply causation?", answer: "No. Two variables can be strongly correlated without one causing the other — a third factor, coincidence, or reverse causation may be at work. Correlation only measures the strength of a linear association." },
    { question: "What is r²?", answer: "The coefficient of determination (r²) tells you what fraction of the variation in one variable is explained by its linear relationship with the other. An r² of 0.64 means 64% of the variation is explained." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Correlation Coefficient Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Correlation Coefficient Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="xseries" className="block text-sm font-medium mb-1 text-foreground">X Values</label>
              <textarea id="xseries" value={x} onChange={(e) => setX(e.target.value)} rows={3} className="input-calc w-full px-3 py-2 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="yseries" className="block text-sm font-medium mb-1 text-foreground">Y Values</label>
              <textarea id="yseries" value={y} onChange={(e) => setY(e.target.value)} rows={3} className="input-calc w-full px-3 py-2 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <p className="text-xs text-muted-foreground">Comma-, space-, or newline-separated numbers. Pairs are matched positionally.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 flex items-center justify-center gap-2">
                <Activity className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Pearson Correlation (r)</div>
                  <div className="text-4xl font-extrabold text-primary">{result.r.toFixed(4)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.direction} · {result.strength} · r² = {result.r2.toFixed(4)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Pairs (n)</div>
                    <div className="text-lg font-bold text-primary">{result.n}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">r²</div>
                    <div className="text-lg font-bold text-primary">{result.r2.toFixed(4)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Slope</div>
                    <div className="text-lg font-bold text-primary">{result.slope === null ? "—" : result.slope.toFixed(4)}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Statistic</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.breakdown.map((row) => (
                        <tr key={row.label}>
                          <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Scatter Plot of Data Pairs</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="x" tick={{ fontSize: 11 }} name="X" />
                      <YAxis type="number" dataKey="y" tick={{ fontSize: 11 }} name="Y" />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, n: string) => [`${v}`, n === "x" ? "X value" : "Y value"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Scatter data={result.chartData} fill="hsl(var(--primary))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {result.summaryStats.map((s) => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm text-muted-foreground">Enter at least two paired values in each series to compute the correlation.</div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Correlation Coefficient Calculator</h2>
            <p>The Pearson correlation coefficient (r) measures the strength and direction of a linear relationship between two variables, ranging from −1 to +1. It is computed by normalizing the covariance of the two series by the product of their standard deviations.</p>
            <h3>Interpreting the Result</h3>
            <p>|r| ≥ 0.8 is a very strong relationship, 0.6–0.8 strong, 0.4–0.6 moderate, 0.2–0.4 weak, and below 0.2 very weak. The sign shows direction — positive means both move together, negative means they move in opposite directions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/correlation-coefficient-calculator" />
          <PopularCalculators exclude="/calculator/correlation-coefficient-calculator" />
        </div>
      </div>
    </>
  );
}
