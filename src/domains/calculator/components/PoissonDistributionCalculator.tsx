"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 4): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}
function fmtPct(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n * 100);
}

function poissonPmf(lambda: number, k: number): number {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}
function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

const DEFAULTS = { lambda: "4", k: "6" };

export default function PoissonDistributionCalculator() {
  const [lambdaStr, setLambdaStr] = useState(DEFAULTS.lambda);
  const [kStr, setKStr] = useState(DEFAULTS.k);
  const [calculated, setCalculated] = useState(false);

  const lambda = Math.max(0, parseFloat(lambdaStr) || 0);
  const k = Math.max(0, Math.round(parseFloat(kStr) || 0));
  const valid = lambda > 0 && !isNaN(k);

  const pmf = valid ? poissonPmf(lambda, k) : 0;
  let cumulative = 0;
  if (valid) for (let i = 0; i <= k; i++) cumulative += poissonPmf(lambda, i);
  const atLeast = valid ? 1 - cumulative + pmf : 0;
  const mean = lambda;
  const variance = lambda;
  const sd = Math.sqrt(lambda);

  const maxK = Math.max(k + 5, Math.ceil(lambda * 2) + 8);
  const chartData = Array.from({ length: maxK }, (_, i) => ({
    name: `${i}`,
    value: Number(poissonPmf(lambda, i).toFixed(5)),
    fill: i === k ? "#f59e0b" : "hsl(var(--primary))",
  }));

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setLambdaStr(DEFAULTS.lambda); setKStr(DEFAULTS.k); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the Poisson distribution?", answer: "It models the count of rare events in a fixed interval — phone calls per hour, radioactive decays per minute, defects per batch. It needs just one parameter, the mean rate λ, and assumes events occur independently at a constant average rate." },
    { question: "How do I read the probability?", answer: "P(X = k) = e⁻λ λᵏ / k! gives the exact probability of seeing exactly k events. The calculator also reports the cumulative probability of k or fewer events, and the complement — k or more — which is often what managers actually want to plan around." },
    { question: "Why is the mean equal to the variance?", answer: "The Poisson distribution's defining quirk: its mean and variance are both λ. Real-world counts with variance much larger than the mean are overdispersed — a sign the underlying rate isn't constant, and a negative binomial model may fit better." },
    { question: "When is the Poisson approximation valid?", answer: "When n is large and p is small — classic cases: rare diseases in a population, typos per page, car accidents per intersection per year. The approximation also needs independent events; clustered phenomena like contagious disease spread violate the assumptions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Poisson Distribution Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Poisson Distribution Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Mean rate λ (events per interval)</label>
              <input type="number" min={0} step={0.1} value={lambdaStr} onChange={e => setLambdaStr(e.target.value)} className={inp} placeholder="4" />
            </div>
            <div>
              <label className={lbl}>Exact count k (events to evaluate)</label>
              <input type="number" min={0} value={kStr} onChange={e => setKStr(e.target.value)} className={inp} placeholder="6" />
            </div>
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Enter a positive mean rate and a non-negative count.</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">P(X = {k}) with λ = {fmt(lambda)}</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(pmf)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtPct(pmf)}% chance of exactly {k} events</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["P(X ≤ k)", `${fmt(cumulative)}`, `${fmtPct(cumulative)}%`], ["P(X ≥ k)", `${fmt(atLeast)}`, `${fmtPct(atLeast)}%`], ["Std dev", `${fmt(sd, 3)}`, `√λ = √${fmt(lambda)}`]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Probability Mass Function (k = 0…{maxK - 1})</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(Number(v)), "P(X = k)"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Amber bar marks your k — the distribution peaks near the mean λ</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Distribution Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Mean:</span><span className="font-semibold">{fmt(mean, 2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Variance:</span><span className="font-semibold">{fmt(variance, 2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Std deviation:</span><span className="font-semibold">{fmt(sd, 3)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">P(X = k):</span><span className="font-semibold">{fmt(pmf)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">P(X ≤ k):</span><span className="font-semibold">{fmt(cumulative)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">P(X ≥ k):</span><span className="font-semibold">{fmt(atLeast)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Counting Rare Events</h2>
            <p>How likely are exactly 6 support tickets in an hour when the average is 4? The <strong>Poisson distribution</strong> answers questions like this with one parameter and one formula — the workhorse model for counts of independent, rare events over time or space.</p>
            <h2 className="text-2xl font-bold mb-3">Exact, Cumulative, and Beyond</h2>
            <p>P(X = k) gives the exact probability; P(X ≤ k) sums everything up to k; P(X ≥ k) covers the tail that matters for planning — "what's the chance we see at least 6 failures?" The chart shows the whole mass function so you can see where the distribution sits and how it spreads.</p>
            <h2 className="text-2xl font-bold mb-3">Know Its Limits</h2>
            <p>The Poisson assumes a constant rate and independent events. Customer arrivals at a lunch rush, network packets, and radioactive decay fit beautifully; clustered or trending phenomena do not — if your variance looks far larger than the mean, reach for a different model.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/poisson-distribution-calculator" />
          <PopularCalculators exclude="/calculator/poisson-distribution-calculator" />
        </div>
      </div>
    </>
  );
}
