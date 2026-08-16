"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BinomialResult {
  pExact: number;
  pAtMost: number;
  pAtLeast: number;
  mean: number;
  variance: number;
  stdDev: number;
  chartData: { k: number; prob: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

function calcBinomial(n: number, p: number, k: number): BinomialResult {
  const trials = Math.max(1, Math.min(500, Math.round(n) || 1));
  const prob = Math.max(0, Math.min(1, p));
  const successes = Math.max(0, Math.min(trials, Math.round(k) || 0));

  const pmf = (x: number) => combination(trials, x) * Math.pow(prob, x) * Math.pow(1 - prob, trials - x);

  const pExact = pmf(successes);
  let pAtMost = 0;
  for (let x = 0; x <= successes; x++) pAtMost += pmf(x);
  const pAtLeast = 1 - pAtMost + pExact;

  const mean = trials * prob;
  const variance = trials * prob * (1 - prob);
  const stdDev = Math.sqrt(variance);

  const chartData: { k: number; prob: number }[] = [];
  const start = Math.max(0, Math.floor(mean - 4 * stdDev));
  const end = Math.min(trials, Math.ceil(mean + 4 * stdDev));
  for (let x = start; x <= end; x++) chartData.push({ k: x, prob: +(pmf(x) * 100).toFixed(3) });

  return {
    pExact,
    pAtMost,
    pAtLeast,
    mean,
    variance,
    stdDev,
    chartData,
    breakdown: [
      { label: "Number of Trials (n)", value: `${trials}` },
      { label: "Success Probability (p)", value: `${(prob * 100).toFixed(1)}%` },
      { label: "Number of Successes (k)", value: `${successes}` },
      { label: "P(X = k)", value: pExact.toFixed(6) },
      { label: "P(X ≤ k)", value: pAtMost.toFixed(6) },
      { label: "P(X ≥ k)", value: pAtLeast.toFixed(6) },
      { label: "Expected Value (np)", value: mean.toFixed(2) },
      { label: "Variance (np(1−p))", value: variance.toFixed(2) },
      { label: "Standard Deviation", value: stdDev.toFixed(2) },
    ],
    summaryStats: [
      { label: "P(X = k)", value: `${(pExact * 100).toFixed(2)}%` },
      { label: "P(X ≤ k)", value: `${(pAtMost * 100).toFixed(2)}%` },
      { label: "P(X ≥ k)", value: `${(pAtLeast * 100).toFixed(2)}%` },
      { label: "Expected Value", value: mean.toFixed(2) },
      { label: "Variance", value: variance.toFixed(2) },
      { label: "Std Dev", value: stdDev.toFixed(2) },
    ],
  };
}

const DEFAULTS = { n: "10", p: "0.5", k: "4" };

export default function BinomialDistributionCalculator() {
  const [n, setN] = useState(DEFAULTS.n);
  const [p, setP] = useState(DEFAULTS.p);
  const [k, setK] = useState(DEFAULTS.k);
  const [result, setResult] = useState<BinomialResult>(() => calcBinomial(10, 0.5, 4));

  const calculate = () => setResult(calcBinomial(parseFloat(n) || 1, parseFloat(p) || 0, parseFloat(k) || 0));
  const reset = () => { setN(DEFAULTS.n); setP(DEFAULTS.p); setK(DEFAULTS.k); setResult(calcBinomial(10, 0.5, 4)); };
  useEffect(() => { setResult(calcBinomial(10, 0.5, 4)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a binomial distribution?", answer: "A binomial distribution models the number of successes in a fixed number of independent trials, where each trial has the same probability of success. Classic examples: coin flips (p = 0.5), free throws, or defect rates in a batch." },
    { question: "What is the binomial probability formula?", answer: "P(X = k) = C(n, k) × p^k × (1−p)^(n−k), where C(n, k) = n! / (k! × (n−k)!) is the number of ways to choose k successes from n trials, p is the success probability per trial, and n is the number of trials." },
    { question: "What does P(X ≤ k) mean?", answer: "It is the cumulative probability of getting at most k successes. This is the value you sum when asking questions like 'what's the chance of 4 or fewer defective items in a batch?'" },
    { question: "When can I use the binomial distribution?", answer: "Only when trials are independent, there are exactly two outcomes per trial (success/failure), the number of trials is fixed, and the success probability stays constant. If trials affect each other, a hypergeometric or other model fits better." },
    { question: "What are the mean and variance?", answer: "The expected number of successes is np, and the variance is np(1−p). The standard deviation is the square root of the variance. These summarize the center and spread of the distribution." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Binomial Distribution Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Binomial Distribution Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Number of Trials (n)</label>
                <div className={inp}><input type="number" value={n} onChange={e => setN(e.target.value)} className={ci} min={1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Success Probability (p)</label>
                <div className={inp}><input type="number" value={p} onChange={e => setP(e.target.value)} className={ci} min={0} max={1} step={0.05} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Number of Successes (k)</label>
              <div className={inp}><input type="number" value={k} onChange={e => setK(e.target.value)} className={ci} min={0} /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">P(X = k)</div>
              <div className="text-4xl font-extrabold text-primary">{(result.pExact * 100).toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground mt-1">Exactly {Math.round(parseFloat(k) || 0)} successes in {Math.round(parseFloat(n) || 1)} trials</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["P(X ≤ k)", `${(result.pAtMost * 100).toFixed(2)}%`], ["P(X ≥ k)", `${(result.pAtLeast * 100).toFixed(2)}%`], ["Expected", result.mean.toFixed(2)]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Probability Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Probability Mass Function</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="k" tick={{ fontSize: 10 }} label={{ value: "Number of Successes (k)", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Probability"]} labelFormatter={(label) => `k = ${label}`} />
                  <Bar dataKey="prob" radius={[3, 3, 0, 0]}>
                    {result.chartData.map((d, i) => <Cell key={i} fill={d.k === Math.round(parseFloat(k) || 0) ? "hsl(var(--primary))" : "hsl(var(--primary)/0.35)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Binomial Distribution?</h2>
            <p>A <strong>binomial distribution calculator</strong> computes the probability of getting exactly k successes in n independent trials, each with a fixed success probability p. This is one of the most widely used discrete distributions in statistics — it powers quality control, A/B testing, and any analysis of yes/no outcomes repeated a fixed number of times.</p>
            <h2 className="text-2xl font-bold mb-3">The Binomial Formula</h2>
            <p>P(X = k) = C(n, k) × p^k × (1−p)^(n−k). The combination term C(n, k) counts how many ways k successes can be arranged among n trials, and the two powers weight the arrangement by the probability of that exact sequence of successes and failures.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Results</h2>
            <p>P(X = k) is the exact probability of your target count. P(X ≤ k) is the cumulative chance of at most k successes — the natural value for 'how likely is a defect rate this low or lower?' The expected value np tells you the average number of successes you would see over many repetitions, and the standard deviation measures how much the count typically varies around that average.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/binomial-distribution-calculator" />
          <PopularCalculators exclude="/calculator/binomial-distribution-calculator" />
        </div>
      </div>
    </>
  );
}
