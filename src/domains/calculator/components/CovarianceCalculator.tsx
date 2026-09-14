"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Sigma } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CovResult {
  n: number;
  covPopulation: number;
  covSample: number;
  varX: number;
  varY: number;
  corr: number;
  sign: string;
  chartData: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function parseSeries(text: string): number[] {
  return text.split(/[,\s;]+/).map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
}

function calcCov(xText: string, yText: string): CovResult | null {
  const xs = parseSeries(xText);
  const ys = parseSeries(yText);
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;

  const meanX = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
    sxx += (xs[i] - meanX) ** 2;
    syy += (ys[i] - meanY) ** 2;
  }
  const covPopulation = sxy / n;
  const covSample = sxy / (n - 1);
  const varX = sxx / n;
  const varY = syy / n;
  const corr = Math.sqrt(sxx * syy) === 0 ? 0 : sxy / Math.sqrt(sxx * syy);

  const chartData = xs.slice(0, n).map((x, i) => ({ x, y: ys[i] }));

  const breakdown = [
    { label: "Pairs (n)", value: `${n}` },
    { label: "Mean X", value: `${meanX.toFixed(4)}` },
    { label: "Mean Y", value: `${meanY.toFixed(4)}` },
    { label: "Population Covariance", value: `${covPopulation.toFixed(4)}` },
    { label: "Sample Covariance", value: `${covSample.toFixed(4)}` },
    { label: "Variance of X (σ²ₓ)", value: `${varX.toFixed(4)}` },
    { label: "Variance of Y (σ²ᵧ)", value: `${varY.toFixed(4)}` },
    { label: "Pearson Correlation (r)", value: `${corr.toFixed(4)}` },
  ];

  const summaryStats = [
    { label: "Population Cov", value: `${covPopulation.toFixed(4)}` },
    { label: "Sample Cov", value: `${covSample.toFixed(4)}` },
    { label: "Correlation r", value: `${corr.toFixed(4)}` },
    { label: "Var(X)", value: `${varX.toFixed(4)}` },
    { label: "Var(Y)", value: `${varY.toFixed(4)}` },
    { label: "Direction", value: covPopulation >= 0 ? "Positive" : "Negative" },
  ];

  return { n, covPopulation, covSample, varX, varY, corr, sign: covPopulation >= 0 ? "positive" : "negative", chartData, breakdown, summaryStats };
}

const DEFAULTS = { x: "1, 2, 3, 4, 5", y: "2, 4, 5, 4, 6" };

export default function CovarianceCalculator() {
  const [x, setX] = useState(DEFAULTS.x);
  const [y, setY] = useState(DEFAULTS.y);
  const [result, setResult] = useState<CovResult | null>(() => calcCov(DEFAULTS.x, DEFAULTS.y));

  useEffect(() => {
    setResult(calcCov(x, y));
  }, []);

  const reset = () => { setX(DEFAULTS.x); setY(DEFAULTS.y); setResult(calcCov(DEFAULTS.x, DEFAULTS.y)); };

  const faqs = [
    { question: "What is covariance?", answer: "Covariance measures how two variables move together: positive when they tend to rise together, negative when they move in opposite directions. Its magnitude depends on the units of the variables, so correlation (a normalized version) is easier to interpret." },
    { question: "Population vs sample covariance?", answer: "Population covariance divides by n (all data available); sample covariance divides by n−1 to correct for the bias introduced when estimating from a sample of a larger population." },
    { question: "How is covariance related to correlation?", answer: "Pearson correlation is covariance divided by the product of the standard deviations — it rescales covariance to a fixed −1 to +1 range, removing the effect of measurement units." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Covariance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Covariance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="cxs" className="block text-sm font-medium mb-1 text-foreground">X Values</label>
              <textarea id="cxs" value={x} onChange={(e) => setX(e.target.value)} rows={3} className="input-calc w-full px-3 py-2 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="cys" className="block text-sm font-medium mb-1 text-foreground">Y Values</label>
              <textarea id="cys" value={y} onChange={(e) => setY(e.target.value)} rows={3} className="input-calc w-full px-3 py-2 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <p className="text-xs text-muted-foreground">Comma-, space-, or newline-separated numbers. Pairs are matched positionally.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 flex items-center justify-center gap-2">
                <Sigma className="h-4 w-4" /> Calculate
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Population Covariance</div>
                  <div className="text-4xl font-extrabold text-primary">{result.covPopulation.toFixed(4)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Sample: {result.covSample.toFixed(4)} · {result.sign} relationship · r = {result.corr.toFixed(4)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Sample Cov</div>
                    <div className="text-lg font-bold text-primary">{result.covSample.toFixed(4)}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Correlation r</div>
                    <div className="text-lg font-bold text-primary">{result.corr.toFixed(4)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Pairs (n)</div>
                    <div className="text-lg font-bold text-primary">{result.n}</div>
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
                <div className="text-sm text-muted-foreground">Enter at least two paired values in each series to compute the covariance.</div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Covariance Calculator</h2>
            <p>Covariance measures the joint variability of two variables. For paired data, it is the average of the products of the deviations from each variable&apos;s mean — positive when they move together, negative when they move apart.</p>
            <h3>Why Normalize?</h3>
            <p>Covariance is unit-dependent, so a large value does not necessarily mean a strong relationship. Dividing by the product of the standard deviations yields the Pearson correlation coefficient, which always falls between −1 and +1.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/covariance-calculator" />
          <PopularCalculators exclude="/calculator/covariance-calculator" />
        </div>
      </div>
    </>
  );
}
