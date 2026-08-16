"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DecayResult {
  initial: number;
  halfLife: number;
  elapsed: number;
  remaining: number;
  fraction: number;
  decayedPct: number;
  halfLives: number;
  decayConstant: number;
  chartData: { t: number; amount: number }[];
}

function calcDecay(initial: number, halfLife: number, elapsed: number): DecayResult {
  const halfLives = elapsed / halfLife;
  const fraction = Math.pow(0.5, halfLives);
  const remaining = initial * fraction;
  const decayedPct = (1 - fraction) * 100;
  const decayConstant = Math.LN2 / halfLife;
  const chartData: { t: number; amount: number }[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = (elapsed * i) / steps;
    chartData.push({ t: Number(t.toFixed(3)), amount: Number((initial * Math.pow(0.5, t / halfLife)).toFixed(3)) });
  }
  return { initial, halfLife, elapsed, remaining, fraction, decayedPct, halfLives, decayConstant, chartData };
}

const DEFAULTS = { initial: "100", halfLife: "10", elapsed: "25" };

const faqs = [
  { question: "What is exponential decay?", answer: "Exponential decay halves a quantity over each fixed half-life: N(t) = N₀ × (1/2)^(t/T½). Radioactive isotopes, drug elimination, capacitor discharge, and cooling all follow it." },
  { question: "What is a half-life?", answer: "The half-life is the time for half the material to decay. It is constant — after one half-life 50% remains, after two 25%, after three 12.5% — the defining property of exponential decay." },
  { question: "How does this relate to carbon dating?", answer: "Carbon-14 has a half-life of 5,730 years. Measuring the remaining fraction tells you how many half-lives have passed, hence the age: 25% remaining means two half-lives ≈ 11,460 years." },
];

export default function ExponentialDecayCalculator() {
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [halfLife, setHalfLife] = useState(DEFAULTS.halfLife);
  const [elapsed, setElapsed] = useState(DEFAULTS.elapsed);
  const [result, setResult] = useState<DecayResult>(() => calcDecay(100, 10, 25));

  useEffect(() => {
    const i = parseFloat(initial);
    const h = parseFloat(halfLife);
    const e = parseFloat(elapsed);
    if (!isNaN(i) && !isNaN(h) && !isNaN(e) && i >= 0 && h > 0 && e >= 0) setResult(calcDecay(i, h, e));
  }, [initial, halfLife, elapsed]);

  const reset = () => { setInitial(DEFAULTS.initial); setHalfLife(DEFAULTS.halfLife); setElapsed(DEFAULTS.elapsed); };
  const invalid = isNaN(parseFloat(initial)) || isNaN(parseFloat(halfLife)) || isNaN(parseFloat(elapsed)) || parseFloat(initial) < 0 || parseFloat(halfLife) <= 0 || parseFloat(elapsed) < 0;

  const breakdown = [
    { label: "Initial Amount", value: `${result.initial.toLocaleString()}` },
    { label: "Half-Life", value: `${result.halfLife.toLocaleString()} units` },
    { label: "Elapsed Time", value: `${result.elapsed.toLocaleString()} units` },
    { label: "Half-Lives Elapsed", value: `${result.halfLives.toFixed(2)}` },
    { label: "Remaining Amount", value: `${result.remaining.toLocaleString("en-US", { maximumFractionDigits: 4 })}`, highlight: true },
    { label: "Fraction Remaining", value: `${(result.fraction * 100).toFixed(2)}%` },
    { label: "Decayed", value: `${result.decayedPct.toFixed(2)}%` },
    { label: "Decay Constant (λ)", value: `${result.decayConstant.toFixed(4)}` },
  ];

  const summaryStats = [
    { label: "Remaining", value: `${result.remaining.toLocaleString("en-US", { maximumFractionDigits: 4 })}` },
    { label: "Fraction Left", value: `${(result.fraction * 100).toFixed(2)}%` },
    { label: "Half-Lives", value: `${result.halfLives.toFixed(2)}` },
    { label: "Decayed", value: `${result.decayedPct.toFixed(2)}%` },
    { label: "λ", value: `${result.decayConstant.toFixed(4)}` },
    { label: "Elapsed", value: `${result.elapsed.toLocaleString()}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Exponential Decay Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Exponential Decay Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="xd-initial" className="block text-sm font-medium mb-1 text-foreground">Initial Amount</label>
              <input id="xd-initial" type="number" min="0" step="1" value={initial} onChange={(e) => setInitial(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="xd-half" className="block text-sm font-medium mb-1 text-foreground">Half-Life</label>
                <input id="xd-half" type="number" min="0.01" step="0.5" value={halfLife} onChange={(e) => setHalfLife(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="xd-elapsed" className="block text-sm font-medium mb-1 text-foreground">Elapsed Time</label>
                <input id="xd-elapsed" type="number" min="0" step="0.5" value={elapsed} onChange={(e) => setElapsed(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <TrendingDown className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative initial amount/elapsed time and a positive half-life.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Amount Remaining</div>
              <div className="text-4xl font-extrabold text-primary">{result.remaining.toLocaleString("en-US", { maximumFractionDigits: 4 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.halfLives.toFixed(2)} half-lives · {(result.fraction * 100).toFixed(1)}% of {result.initial.toLocaleString()} remains</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Fraction Left</div>
                <div className="text-lg font-bold text-primary">{(result.fraction * 100).toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Decayed</div>
                <div className="text-lg font-bold text-primary">{result.decayedPct.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Decay Constant</div>
                <div className="text-lg font-bold text-primary">{result.decayConstant.toFixed(4)}</div>
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
              <h3 className="text-base font-bold mb-3">Decay Curve</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} label={{ value: "time", position: "insideBottom", fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US", { maximumFractionDigits: 2 }), "Amount"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Halves every {result.halfLife.toLocaleString()} time units</p>
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
            <h2 className="text-2xl font-bold mb-3">About the Exponential Decay Calculator</h2>
            <p>The half-life model N(t) = N₀ × (1/2)^(t/T½) is the exponential decay law in its most intuitive form. With a half-life of 10 and 25 elapsed, the quantity has gone through 2.5 half-lives, leaving 100 × 0.5^2.5 ≈ 17.68 — under a fifth of the start.</p>
            <h3>Why "Half-Life" Is Constant</h3>
            <p>Decay probability per nucleus per unit time is fixed, so the fraction remaining after one half-life is always exactly 50%, regardless of how much is left. That constant ratio is what makes the curve an exponential — and why dating, dosing, and cooling all use the same mathematics.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/exponential-decay-calculator" />
          <PopularCalculators exclude="/calculator/exponential-decay-calculator" />
        </div>
      </div>
    </>
  );
}
