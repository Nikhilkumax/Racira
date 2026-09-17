"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Z_SCORES: Record<number, number> = { 90: 1.645, 95: 1.96, 99: 2.576 };

interface MoeResult {
  z: number;
  se: number;
  moe: number;
  ciLow: number;
  ciHigh: number;
  fpc: number | null;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMoe(n: number, sigma: number, conf: number, mean: number, population: number | null): MoeResult {
  const z = Z_SCORES[conf] ?? 1.96;
  let se = sigma / Math.sqrt(n);
  let fpc: number | null = null;
  if (population && population > n && n / population > 0.05) {
    fpc = Math.sqrt((population - n) / (population - 1));
    se = se * fpc;
  }
  const moe = z * se;
  const ciLow = mean - moe;
  const ciHigh = mean + moe;
  const breakdown = [
    { label: "Sample Size (n)", value: `${n.toLocaleString()}` },
    { label: "Standard Deviation (σ)", value: `${fmt(sigma)}` },
    { label: "Confidence Level", value: `${conf}%` },
    { label: "Critical Value (z)", value: `${fmt(z, 3)}` },
    { label: "Standard Error", value: `${fmt(se, 4)}` },
    ...(fpc !== null ? [{ label: "Finite Population Correction", value: `${fmt(fpc, 4)}` }] : []),
    { label: "Sample Mean (x̄)", value: `${fmt(mean)}` },
    { label: "Margin of Error", value: `± ${fmt(moe)}` },
    { label: "Confidence Interval", value: `[${fmt(ciLow)}, ${fmt(ciHigh)}]` },
  ];
  const summaryStats = [
    { label: "Margin of Error", value: `± ${fmt(moe)}` },
    { label: "Confidence Interval", value: `${fmt(ciLow)} – ${fmt(ciHigh)}` },
    { label: "Critical Value (z)", value: `${fmt(z, 3)}` },
    { label: "Standard Error", value: `${fmt(se, 4)}` },
    { label: "Sample Size", value: `${n.toLocaleString()}` },
  ];
  const chartData = [
    { name: "Sample Mean", value: Number(mean.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "MOE Low", value: Number((mean - moe).toFixed(2)), fill: "#f59e0b" },
    { name: "MOE High", value: Number((mean + moe).toFixed(2)), fill: "#f59e0b" },
  ];
  return { z, se, moe, ciLow, ciHigh, fpc, breakdown, summaryStats, chartData };
}

const DEFAULTS = { n: "400", sigma: "25", mean: "150", conf: "95", population: "" };

export default function MarginOfErrorCalculator() {
  const [n, setN] = useState(DEFAULTS.n);
  const [sigma, setSigma] = useState(DEFAULTS.sigma);
  const [mean, setMean] = useState(DEFAULTS.mean);
  const [conf, setConf] = useState<string>(DEFAULTS.conf);
  const [population, setPopulation] = useState(DEFAULTS.population);
  const [result, setResult] = useState<MoeResult | null>(null);

  const nNum = parseFloat(n);
  const sigmaNum = parseFloat(sigma);
  const meanNum = parseFloat(mean);
  const popNum = population.trim() === "" ? null : parseFloat(population);
  const errs: string[] = [];
  if (!nNum || nNum < 2) errs.push("Sample size must be at least 2.");
  if (!sigmaNum || sigmaNum <= 0) errs.push("Standard deviation must be greater than 0.");
  if (isNaN(meanNum)) errs.push("Sample mean is required.");
  if (popNum !== null && (!popNum || popNum <= nNum)) errs.push("Population size must be larger than the sample size.");
  const valid = errs.length === 0;
  const confNum = parseInt(conf, 10);

  const calculate = () => { if (valid) setResult(calcMoe(nNum, sigmaNum, confNum, meanNum, popNum)); };
  const reset = () => {
    setN(DEFAULTS.n); setSigma(DEFAULTS.sigma); setMean(DEFAULTS.mean); setConf(DEFAULTS.conf); setPopulation(DEFAULTS.population);
    setResult(calcMoe(400, 25, 95, 150, null));
  };
  useEffect(() => { setResult(calcMoe(400, 25, 95, 150, null)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the margin of error?", answer: "It is the half-width of a confidence interval — how far the true population parameter could reasonably sit from your sample statistic. A margin of error of ±3% at 95% confidence means the true value likely lies within 3 percentage points of your estimate." },
    { question: "How is the margin of error calculated?", answer: "MOE = z × σ/√n, where z is the critical value for your confidence level (1.645 for 90%, 1.96 for 95%, 2.576 for 99%) and σ/√n is the standard error. When sampling without replacement from a finite population, a correction factor √((N−n)/(N−1)) shrinks the error." },
    { question: "Why does sample size matter so much?", answer: "Because the standard error falls with the square root of n — quadrupling the sample size only halves the margin of error. That is why big polls are expensive: precision scales slowly." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Margin of Error Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Margin of Error Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Sample Size (n)</label>
                <input type="number" value={n} onChange={e => setN(e.target.value)} className={inp} placeholder="400" />
              </div>
              <div>
                <label className={lbl}>Std Deviation (σ)</label>
                <input type="number" value={sigma} onChange={e => setSigma(e.target.value)} className={inp} placeholder="25" />
              </div>
              <div>
                <label className={lbl}>Sample Mean (x̄)</label>
                <input type="number" value={mean} onChange={e => setMean(e.target.value)} className={inp} placeholder="150" />
              </div>
              <div>
                <label className={lbl}>Population Size (optional)</label>
                <input type="number" value={population} onChange={e => setPopulation(e.target.value)} className={inp} placeholder="Leave blank" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Confidence Level</label>
                <select value={conf} onChange={e => setConf(e.target.value)} className={inp}>
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Margin of Error</div>
                <div className="text-4xl font-extrabold tracking-tight">± {fmt(result.moe)}</div>
                <div className="text-sm text-muted-foreground mt-1">{conf}% CI: [{fmt(result.ciLow)}, {fmt(result.ciHigh)}]{result.fpc !== null ? " · finite population corrected" : ""}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["z-Score", fmt(result.z, 3)], ["Std Error", fmt(result.se, 4)], ["CI Width", fmt(result.ciHigh - result.ciLow, 2)]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Sample Mean vs Interval Bounds</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v, 2), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The interval is symmetric around the sample mean</p>
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
            <h2 className="text-2xl font-bold mb-3">Sampling Error, Quantified</h2>
            <p>Every survey estimate carries uncertainty: ask 400 people and you will rarely hit the population value exactly. This <strong>margin of error calculator</strong> turns that uncertainty into a number — the radius around your sample statistic that should contain the true value at your chosen confidence level.</p>
            <h2 className="text-2xl font-bold mb-3">The Mechanics</h2>
            <p>Start from the standard error σ/√n, which shrinks as the sample grows. Multiply by the critical z-value for your confidence level (1.645, 1.96, or 2.576) to get the margin of error. If you sample from a known finite population and take more than 5% of it, the finite population correction tightens the result.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Interval</h2>
            <p>Report the interval alongside the estimate: "150 ± 2.45 at 95% confidence" means that if you repeated the study many times, roughly 95% of such intervals would capture the true mean. Narrower intervals need larger samples — there is no shortcut around n.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/margin-of-error-calculator" />
          <PopularCalculators exclude="/calculator/margin-of-error-calculator" />
        </div>
      </div>
    </>
  );
}
