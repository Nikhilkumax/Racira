"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const FUNCS: Record<string, { label: string; exact: (x: number) => number; term: (k: number, a: number, x: number) => number }> = {
  ex: {
    label: "f(x) = eˣ",
    exact: (x) => Math.exp(x),
    term: (k, a, x) => (Math.exp(a) / fact(k)) * Math.pow(x - a, k),
  },
  sin: {
    label: "f(x) = sin(x)",
    exact: (x) => Math.sin(x),
    term: (k, a, x) => {
      const d = [Math.sin(a), Math.cos(a), -Math.sin(a), -Math.cos(a)][k % 4];
      return (d / fact(k)) * Math.pow(x - a, k);
    },
  },
  cos: {
    label: "f(x) = cos(x)",
    exact: (x) => Math.cos(x),
    term: (k, a, x) => {
      const d = [Math.cos(a), -Math.sin(a), -Math.cos(a), Math.sin(a)][k % 4];
      return (d / fact(k)) * Math.pow(x - a, k);
    },
  },
  ln: {
    label: "f(x) = ln(1+x)",
    exact: (x) => Math.log(1 + x),
    term: (k, a, x) => {
      if (k === 0) return Math.log(1 + a);
      return (Math.pow(-1, k + 1) * Math.pow(x - a, k)) / (k * Math.pow(1 + a, k));
    },
  },
};

function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

interface TaylorResult {
  approx: number;
  exact: number;
  error: number;
  errorPct: number;
  chartData: { term: number; partial: number; exact: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcTaylor(funcKey: string, a: number, x: number, terms: number): TaylorResult {
  const { exact, term } = FUNCS[funcKey] ?? FUNCS.sin;
  const exactVal = exact(x);
  let partial = 0;
  const chartData: { term: number; partial: number; exact: number }[] = [];
  const rows: { k: number; termVal: number; partial: number }[] = [];
  for (let k = 0; k < terms; k++) {
    const t = term(k, a, x);
    partial += t;
    rows.push({ k, termVal: t, partial });
    chartData.push({ term: k + 1, partial, exact: exactVal });
  }
  const error = partial - exactVal;
  const errorPct = exactVal !== 0 ? (Math.abs(error) / Math.abs(exactVal)) * 100 : 0;

  const breakdown = [
    ...rows.map((r) => ({ label: `Term k=${r.k}`, value: `${r.termVal >= 0 ? "+" : ""}${r.termVal.toFixed(6)}` })),
    { label: "Partial Sum (Taylor value)", value: partial.toFixed(6) },
    { label: "Exact Value", value: exactVal.toFixed(6) },
    { label: "Absolute Error", value: error.toFixed(6) },
    { label: "Relative Error", value: `${errorPct.toFixed(4)}%` },
  ];

  const summaryStats = [
    { label: "Taylor Approximation", value: partial.toFixed(6) },
    { label: "Exact Value", value: exactVal.toFixed(6) },
    { label: "Absolute Error", value: error.toFixed(6) },
    { label: "Relative Error", value: `${errorPct.toFixed(4)}%` },
    { label: "Terms Used", value: `${terms}` },
    { label: "Center (a)", value: a.toFixed(2) },
  ];

  return { approx: partial, exact: exactVal, error, errorPct, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TaylorSeriesCalculator() {
  const [funcKey, setFuncKey] = useState("sin");
  const [a, setA] = useState("1");
  const [x, setX] = useState("2");
  const [terms, setTerms] = useState("10");
  const [result, setResult] = useState<TaylorResult | null>(null);

  const calculate = () => {
    const center = parseFloat(a);
    const at = parseFloat(x);
    const t = Math.max(1, Math.min(30, Math.round(parseFloat(terms) || 10)));
    setResult(calcTaylor(funcKey, Number.isFinite(center) ? center : 0, Number.isFinite(at) ? at : 1, t));
  };
  const reset = () => {
    setFuncKey("sin");
    setA("1");
    setX("2");
    setTerms("10");
    setResult(calcTaylor("sin", 1, 2, 10));
  };
  useEffect(() => {
    setResult(calcTaylor("sin", 1, 2, 10));
  }, []);

  const faqs = [
    { question: "What is a Taylor series?", answer: "A Taylor series rewrites a function as an infinite sum of polynomial terms built from its derivatives at a single point a: f(x) = Σ f⁽ᵏ⁾(a)·(x−a)ᵏ / k!. Near the center it matches the function to arbitrary precision, which is how calculators and computers evaluate sin, cos, eˣ, and ln without lookup tables." },
    { question: "Why is the center (a) important?", answer: "The approximation is exact at x = a and degrades as you move away. Choosing the center near your target x gives the fastest convergence. For example, ln(1+x) expanded at a = 0 only converges for |x| < 1 — outside that, more terms make things worse, not better." },
    { question: "How many terms do I need?", answer: "It depends on the function and how far x is from the center. eˣ and sin(x) converge extremely fast — a handful of terms reach machine precision. ln(1+x) near x = 1 converges slowly and needs many terms. The chart shows the partial sums approaching the exact value so you can judge visually." },
    { question: "What does the error tell me?", answer: "The error is the difference between the truncated series and the exact function value. For alternating series like sin and cos, the error is bounded by the first omitted term. The relative error percentage lets you compare accuracy across different functions and centers." },
    { question: "Can I expand around a non-zero center?", answer: "Yes — that is the general case handled here. Expanding eˣ around a = 1 or sin(x) around a = π/2 works the same way: each term uses the derivative evaluated at the center, multiplied by (x − a)ᵏ/k!." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Taylor Series Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Taylor Series Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Function</label>
              <div className={inp}>
                <select value={funcKey} onChange={(e) => setFuncKey(e.target.value)} className={ci}>
                  <option value="ex">f(x) = eˣ</option>
                  <option value="sin">f(x) = sin(x)</option>
                  <option value="cos">f(x) = cos(x)</option>
                  <option value="ln">f(x) = ln(1+x)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Center (a)</label>
                <div className={inp}><input type="number" value={a} onChange={(e) => setA(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Evaluate at (x)</label>
                <div className={inp}><input type="number" value={x} onChange={(e) => setX(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Number of Terms</label>
              <div className={inp}><input type="number" value={terms} onChange={(e) => setTerms(e.target.value)} className={ci} min={1} max={30} step={1} /></div>
              <p className="text-xs text-muted-foreground mt-1">Capped at 30 terms. Higher counts converge closer to the exact value.</p>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Taylor Approximation</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.approx.toFixed(6)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Exact: {result.exact.toFixed(6)} · relative error: {result.errorPct.toFixed(4)}%</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Approximation", result.approx.toFixed(4)], ["Exact Value", result.exact.toFixed(4)], ["Error %", `${result.errorPct.toFixed(2)}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Convergence of Partial Sums</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="term" tick={{ fontSize: 11 }} label={{ value: "Terms included", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => v.toFixed(5)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="partial" name="Partial sum" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="exact" name="Exact value" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Watch the partial sum (solid) approach the exact value (dashed) as more terms are added.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Term-by-Term Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.chartData.length ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Taylor Series?</h2>
            <p>A Taylor series represents a smooth function as an infinite polynomial centered at a point a. The k-th coefficient is the k-th derivative evaluated at a, divided by k!. Truncating the series gives a polynomial that matches the function's value and all its derivatives at the center — and approximates it nearby.</p>
            <h2 className="text-2xl font-bold mb-3">The Series Used Here</h2>
            <p><strong>eˣ</strong> = Σ xᵏ/k!, <strong>sin(x)</strong> = Σ (−1)ᵏ x^(2k+1)/(2k+1)!, <strong>cos(x)</strong> = Σ (−1)ᵏ x^(2k)/(2k)!, and <strong>ln(1+x)</strong> = Σ (−1)^(k+1) xᵏ/k. The first three converge for every real x; the logarithm series converges only for |x| &lt; 1 around a = 0, a classic illustration of a radius of convergence.</p>
            <h2 className="text-2xl font-bold mb-3">Why Taylor Series Matter</h2>
            <p>Every scientific calculator evaluates sin, cos, and eˣ using exactly this method — polynomial terms that require only multiplication and division. Taylor series also drive physics approximations (the pendulum equation), financial models (the Taylor rule, option Greeks), and numerical analysis, making them one of the most consequential ideas in applied mathematics.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/taylor-series-calculator" />
          <PopularCalculators exclude="/calculator/taylor-series-calculator" />
        </div>
      </div>
    </>
  );
}
