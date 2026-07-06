"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface NDResult { mean: number; stdDev: number; zScore: number; probability: number; pLeft: number; pRight: number; percentile: number; }
const DEFAULTS = { mean: "100", stdDev: "15", value: "115" };

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}

function normalCDF(z: number): number { return 0.5 * (1 + erf(z / Math.sqrt(2))); }

function calculate(d: typeof DEFAULTS): NDResult {
  const mean = parseFloat(d.mean)||0, sd = parseFloat(d.stdDev)||1, val = parseFloat(d.value)||0;
  const z = sd !== 0 ? (val - mean) / sd : 0;
  const pLeft = normalCDF(z);
  const pRight = 1 - pLeft;
  const probability = pLeft;
  return { mean, stdDev: sd, zScore: +z.toFixed(4), probability: +probability.toFixed(4), pLeft: +pLeft.toFixed(4), pRight: +pRight.toFixed(4), percentile: +(probability * 100).toFixed(2) };
}

export default function NormalDistributionCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<NDResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const mean = parseFloat(f.mean)||0, sd = parseFloat(f.stdDev)||1;
  const curveData = Array.from({ length: 61 }, (_, i) => {
    const x = mean - 3.5 * sd + i * (7 * sd / 60);
    const y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sd) ** 2);
    return { x: +x.toFixed(2), y: +y.toFixed(6) };
  });

  const faqs = [
    { question: "What is the normal distribution?", answer: "The normal (Gaussian) distribution is a symmetric bell-shaped probability distribution defined by its mean (μ) and standard deviation (σ). It is the most important distribution in statistics because many natural phenomena approximately follow it, and it is central to statistical inference." },
    { question: "What is a Z-score?", answer: "Z = (X − μ) / σ. It measures how many standard deviations a value is from the mean. Z = 0 means exactly at the mean. Z = 1 means one standard deviation above. Z = −1.5 means 1.5 SDs below. Z-scores allow comparison of values from different distributions." },
    { question: "What are the 68-95-99.7 rule percentages?", answer: "The empirical rule: 68% of data falls within ±1 SD of the mean. 95% within ±2 SD. 99.7% within ±3 SD. This rule applies to any normally distributed dataset — essential for quality control, process capability analysis, and outlier detection." },
    { question: "What does the percentile mean in this calculator?", answer: "The percentile (cumulative probability) tells you what percentage of the distribution falls below your value. A value at the 84th percentile (Z ≈ 1.0) is higher than 84% of all values in the distribution." },
    { question: "What is the normal distribution used for?", answer: "Quality control (Six Sigma), standardized testing (IQ, SAT scores, height), financial returns modeling, clinical trials, survey analysis, measurement error quantification, and as the basis for t-tests, ANOVA, and regression analysis." },
    { question: "What is the standard normal distribution?", answer: "The standard normal distribution has mean = 0 and standard deviation = 1 (N(0,1)). Any normal distribution can be converted to standard normal by calculating Z-scores, allowing use of universal standard normal tables (Z-tables)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Normal Distribution Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Normal Distribution Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            {([
              { label: "Mean (μ)", key: "mean", tip: "Center of the distribution" },
              { label: "Standard Deviation (σ)", key: "stdDev", tip: "Spread of the distribution (must be > 0)" },
              { label: "Value (X)", key: "value", tip: "The data point to evaluate" },
            ] as const).map(({ label, key, tip }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Z-Score</div>
              <div className="text-5xl font-extrabold text-foreground">{r.zScore}</div>
              <div className="text-sm text-muted-foreground mt-1">{r.percentile}th percentile · P(X ≤ {f.value}) = {r.pLeft}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">P(X ≤ value)</div><div className="font-bold text-lg">{r.pLeft}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">P(X &gt; value)</div><div className="font-bold text-lg">{r.pRight}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Percentile</div><div className="font-bold text-lg">{r.percentile}%</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Bell Curve (Normal Distribution)</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 9 }} tickCount={7} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <RTooltip formatter={(v: number) => [v.toFixed(5), "PDF"]} contentStyle={{ borderRadius: "8px", fontSize: "11px" }} />
                    <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Distribution Summary</h3></div>
              {[
                { label: "Mean (μ)", val: r.mean.toString() },
                { label: "Standard Deviation (σ)", val: r.stdDev.toString() },
                { label: "Value (X)", val: f.value },
                { label: "Z-Score", val: r.zScore.toString(), bold: true },
                { label: "P(X ≤ value) — Left Tail", val: r.pLeft.toString(), bold: true, highlight: true },
                { label: "P(X > value) — Right Tail", val: r.pRight.toString(), bold: true },
                { label: "Percentile Rank", val: `${r.percentile}%`, bold: true },
                { label: "68% Range (±1σ)", val: `${r.mean - r.stdDev} to ${r.mean + r.stdDev}` },
                { label: "95% Range (±2σ)", val: `${r.mean - 2*r.stdDev} to ${r.mean + 2*r.stdDev}` },
                { label: "99.7% Range (±3σ)", val: `${r.mean - 3*r.stdDev} to ${r.mean + 3*r.stdDev}` },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Normal Distribution Calculator — Overview</h2>
            <p>This normal distribution calculator computes the Z-score, cumulative probability (CDF), percentile rank, and left/right tail probabilities for any value from a normal distribution. It uses the error function (erf) for precise CDF calculation and renders the full bell curve for visual reference.</p>
            <h2 className="text-2xl font-bold mb-3">Key Formulas</h2>
            <p><strong>Z-Score:</strong> Z = (X − μ) / σ</p>
            <p><strong>PDF (bell curve height):</strong> f(x) = (1/σ√2π) × e^(−(x−μ)²/2σ²)</p>
            <p><strong>CDF (left tail probability):</strong> Φ(Z) = (1/2)[1 + erf(Z/√2)]</p>
            <p>The erf approximation used achieves maximum error of 1.5 × 10⁻⁷ — sufficient for all practical statistical work.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Applications</h2>
            <p><strong>IQ Testing:</strong> Mean = 100, SD = 15. A score of 130 → Z = 2.0 → 97.7th percentile — higher than 97.7% of the population. <strong>Manufacturing Quality:</strong> If a part diameter has mean = 50mm, SD = 0.1mm, a part at 50.2mm → Z = 2.0 → only 2.3% of parts are larger. <strong>Finance:</strong> If stock returns have mean = 10%, SD = 20%, probability of losing money (return &lt; 0%) = Φ(−0.5) ≈ 30.9%.</p>
            <h2 className="text-2xl font-bold mb-3">The 68-95-99.7 Empirical Rule</h2>
            <p>For any normal distribution: 68.27% of values fall within ±1σ. 95.45% within ±2σ. 99.73% within ±3σ. 99.9937% within ±4σ (Six Sigma quality: fewer than 3.4 defects per million at 4.5σ process shift). This rule is fundamental to quality control, statistical process control, and hypothesis testing.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/normal-distribution-calculator" />
          <PopularCalculators exclude="/calculator/normal-distribution-calculator" />
        </div>
      </div>
    </>
  );
}
