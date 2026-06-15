"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";

interface BetaResult {
  beta: number; capmReturn: number; riskPremium: number; interpretation: string; color: string;
}
const DEFAULTS = { riskFreeRate: "4.3", marketReturn: "10.5", beta: "1.25", stockReturn: "12.8" };

function calculate(d: typeof DEFAULTS): BetaResult {
  const rf = parseFloat(d.riskFreeRate) || 0;
  const rm = parseFloat(d.marketReturn) || 0;
  const beta = parseFloat(d.beta) || 0;
  const capmReturn = rf + beta * (rm - rf);
  const riskPremium = beta * (rm - rf);
  let interpretation = "", color = "";
  if (beta < 0) { interpretation = "Inverse market correlation (hedge)"; color = "text-purple-600"; }
  else if (beta < 0.5) { interpretation = "Low volatility — defensive stock"; color = "text-emerald-600"; }
  else if (beta < 1) { interpretation = "Below-market volatility"; color = "text-primary"; }
  else if (Math.abs(beta - 1) < 0.05) { interpretation = "Tracks the market closely"; color = "text-foreground"; }
  else if (beta < 1.5) { interpretation = "Moderately aggressive — above-market volatility"; color = "text-amber-600"; }
  else if (beta < 2) { interpretation = "High volatility — growth/cyclical stock"; color = "text-orange-600"; }
  else { interpretation = "Very high volatility — speculative stock"; color = "text-red-600"; }
  return { beta, capmReturn, riskPremium, interpretation, color };
}

const pct = (n: number) => `${n.toFixed(2)}%`;

export default function BetaCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<BetaResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const handleCalc = () => setR(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const betaVal = parseFloat(f.beta) || 1;
  const rf = parseFloat(f.riskFreeRate) || 0;
  const rm = parseFloat(f.marketReturn) || 0;
  const smlData = [-0.5, 0, 0.5, 1, 1.5, 2, 2.5].map(b => ({
    beta: b, expectedReturn: +(rf + b * (rm - rf)).toFixed(2),
  }));
  const stockPoint = { beta: betaVal, expectedReturn: +r.capmReturn.toFixed(2) };
  const actualReturn = parseFloat(f.stockReturn) || 0;
  const alpha = actualReturn - r.capmReturn;

  const faqs = [
    { question: "What is stock beta?", answer: "Beta measures a stock's volatility relative to the overall market. Beta of 1.0 means the stock moves in line with the market. Beta > 1 means more volatile; Beta < 1 means less volatile. Beta < 0 means the stock moves inversely to the market." },
    { question: "How is beta calculated?", answer: "Beta = Covariance(Stock Returns, Market Returns) ÷ Variance(Market Returns). In practice it is estimated by regressing historical stock returns against market index returns over a 2–5 year period using monthly data. Beta providers (Bloomberg, Refinitiv) use rolling 5-year monthly regression as the standard." },
    { question: "What is the Capital Asset Pricing Model (CAPM)?", answer: "CAPM calculates the expected return of an asset: E(R) = Risk-Free Rate + Beta × (Market Return − Risk-Free Rate). The term (Market Return − Risk-Free Rate) is the Equity Risk Premium (ERP). CAPM says investors should be compensated proportionally to systematic (undiversifiable) risk measured by beta." },
    { question: "What is Jensen's Alpha?", answer: "Alpha = Actual Return − CAPM Expected Return. Positive alpha means the stock outperformed its risk-adjusted expectation; negative alpha means underperformance. Alpha measures manager skill or firm-specific value creation beyond what market risk alone would predict." },
    { question: "What does a negative beta mean?", answer: "Negative beta stocks (e.g., gold, inverse ETFs) tend to rise when the market falls. They act as portfolio hedges, reducing overall portfolio volatility. However, they also underperform in rising markets." },
    { question: "Is high beta good or bad?", answer: "It depends on your investment strategy. High-beta stocks offer higher potential returns in bull markets but larger losses in bear markets. Low-beta defensive stocks provide stability. Most long-term investors benefit from a blend that matches their risk tolerance." },
    { question: "What is the Security Market Line (SML)?", answer: "The SML is the graphical representation of CAPM. It plots expected return (y-axis) against beta (x-axis). Stocks plotting above the SML are undervalued (positive alpha); stocks below are overvalued (negative alpha). In efficient markets, all stocks should theoretically lie on the SML." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Stock Beta Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stock Beta Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              { label: "Risk-Free Rate (%)", key: "riskFreeRate", tip: "10-year Treasury yield (e.g., 4.3%)" },
              { label: "Expected Market Return (%)", key: "marketReturn", tip: "Historical S&P 500 avg ~10–10.5%" },
              { label: "Stock Beta", key: "beta", tip: "From broker/data provider (e.g., 1.25)" },
              { label: "Actual Stock Return (%) — for Alpha", key: "stockReturn", tip: "The stock's realized or expected return" },
            ] as const).map(({ label, key, tip }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">CAPM Expected Return</div>
              <div className="text-5xl font-extrabold text-foreground">{pct(r.capmReturn)}</div>
              <div className={`text-sm font-semibold mt-1 ${r.color}`}>{r.interpretation}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Beta</div><div className="font-bold text-lg">{r.beta.toFixed(2)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Risk Premium</div><div className="font-bold text-lg">{pct(r.riskPremium)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Jensen&apos;s Alpha</div><div className={`font-bold text-lg ${alpha >= 0 ? "text-emerald-600" : "text-red-600"}`}>{alpha >= 0 ? "+" : ""}{pct(alpha)}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">Security Market Line (SML)</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={smlData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="beta" label={{ value: "Beta", position: "insideRight", offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
                    <RTooltip formatter={(v: number) => [`${v}%`, "Expected Return"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <ReferenceLine x={1} stroke="#64748b" strokeDasharray="3 3" />
                    <ReferenceLine x={stockPoint.beta} y={stockPoint.expectedReturn} stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="expectedReturn" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">CAPM Breakdown</h3></div>
              {[
                { label: "Risk-Free Rate", val: pct(parseFloat(f.riskFreeRate) || 0) },
                { label: "Market Return", val: pct(parseFloat(f.marketReturn) || 0) },
                { label: "Equity Risk Premium (ERP)", val: pct((parseFloat(f.marketReturn) || 0) - (parseFloat(f.riskFreeRate) || 0)) },
                { label: "Beta", val: r.beta.toFixed(3) },
                { label: "Beta-Adjusted Risk Premium", val: pct(r.riskPremium), bold: true },
                { label: "CAPM Expected Return", val: pct(r.capmReturn), bold: true, highlight: true },
                { label: "Actual / Forecast Return", val: pct(actualReturn) },
                { label: "Jensen's Alpha", val: `${alpha >= 0 ? "+" : ""}${pct(alpha)}`, bold: true },
                { label: "Assessment", val: r.interpretation },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is the Stock Beta Calculator?</h2>
            <p>This stock beta calculator uses the Capital Asset Pricing Model (CAPM) to compute the risk-adjusted expected return of any stock given its beta, the current risk-free rate, and the expected market return. It also calculates Jensen&apos;s Alpha — the excess return above what CAPM predicts — and plots the Security Market Line for visual context.</p>
            <h2>Beta and CAPM Formula</h2>
            <p><strong>CAPM: E(R) = Rf + β × (Rm − Rf)</strong></p>
            <p>Where Rf = risk-free rate (10-year Treasury yield), β = stock beta, Rm = expected market return (typically 10–10.5% for S&amp;P 500 long-run average), and (Rm − Rf) = Equity Risk Premium. The ERP compensates investors for taking on market risk above the risk-free alternative.</p>
            <h2>How Beta Is Measured</h2>
            <p>Beta is estimated by running an Ordinary Least Squares (OLS) regression of stock returns (y-axis) against market index returns (x-axis) over a historical period. The slope of the regression line is beta. Bloomberg uses 5-year monthly data (60 observations) against the relevant local index. MSCI uses 3-year monthly data. The intercept of the regression is Jensen&apos;s Alpha — the stock&apos;s average excess return unexplained by market movements.</p>
            <h2>Beta by Asset Class and Sector</h2>
            <p>Gold: ~0 to -0.1 (non-correlated). Utilities: 0.3–0.6 (defensive). Consumer Staples: 0.5–0.8. Healthcare: 0.7–1.0. Financials: 1.0–1.4. Technology (large-cap): 1.0–1.3. Technology (small-cap): 1.3–2.0. Energy: 0.8–1.4. Biotech: 1.5–2.5+. Inverse ETFs: -1 to -3.</p>
            <h2>Jensen&apos;s Alpha — Measuring Manager Skill</h2>
            <p>If a stock returned 15% when CAPM predicted 12% given its beta, it generated +3% alpha — outperformance above its risk-adjusted expectation. In efficient market theory, alpha should be zero on average. Persistent positive alpha over multiple periods suggests either genuine competitive advantage (moat, management quality) or that the CAPM model is incomplete (which behavioral finance and factor models have demonstrated). Negative alpha means the stock underperformed for its risk level.</p>
            <h2>Limitations of Beta</h2>
            <p>Beta is backward-looking — historical beta is not a reliable predictor of future beta, especially after major business model changes. Beta measures only systematic (market) risk, ignoring company-specific risks. It assumes a stable linear relationship between stock and market returns, which breaks down during market crises (correlation spikes). Illiquid stocks have artificially low betas due to infrequent price updates. Always combine beta with fundamental analysis rather than relying on it in isolation.</p>
            <h2>Portfolio Beta and Risk Management</h2>
            <p>A portfolio&apos;s beta = weighted average of individual stock betas. A portfolio with beta 1.2 is expected to rise 12% when the market rises 10%, and fall 12% when it falls 10%. Investors approaching retirement typically lower portfolio beta by shifting to bonds (beta ≈ 0) and low-beta dividend stocks. Hedging with options or inverse ETFs can temporarily reduce portfolio beta during high-risk market environments.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/beta-calculator" />
          <PopularCalculators exclude="/calculator/beta-calculator" />
        </div>
      </div>
    </>
  );
}
