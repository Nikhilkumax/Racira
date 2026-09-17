"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface IntegralResult {
  fnKey: string;
  a: number;
  b: number;
  value: number;
  antiderivativeStr: string;
  fa: number;
  fb: number;
  fA: number;
  fB: number;
  avgValue: number;
  curve: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number): string {
  if (!isFinite(v)) return "—";
  return v.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

// Curated library of standard functions with their exact antiderivatives.
const FUNCTIONS: Record<string, { label: string; f: (x: number) => number; F: (x: number) => number; Fstr: string }> = {
  "x^2": { label: "x²", f: (x) => x * x, F: (x) => (x * x * x) / 3, Fstr: "x³ / 3" },
  "x^3": { label: "x³", f: (x) => x * x * x, F: (x) => (x * x * x * x) / 4, Fstr: "x⁴ / 4" },
  "sqrt": { label: "√x", f: (x) => Math.sqrt(Math.max(0, x)), F: (x) => (2 / 3) * Math.pow(x, 1.5), Fstr: "(2/3)·x^(3/2)" },
  "1/x": { label: "1/x", f: (x) => 1 / x, F: (x) => Math.log(Math.abs(x)), Fstr: "ln|x|" },
  "e^x": { label: "eˣ", f: (x) => Math.exp(x), F: (x) => Math.exp(x), Fstr: "eˣ" },
  "sin": { label: "sin x", f: (x) => Math.sin(x), F: (x) => -Math.cos(x), Fstr: "−cos x" },
  "cos": { label: "cos x", f: (x) => Math.cos(x), F: (x) => Math.sin(x), Fstr: "sin x" },
  "1/(1+x^2)": { label: "1 / (1 + x²)", f: (x) => 1 / (1 + x * x), F: (x) => Math.atan(x), Fstr: "arctan x" },
};

function calcIntegral(fnKey: string, a: number, b: number): IntegralResult {
  const fn = FUNCTIONS[fnKey];
  const fA = fn.F(a);
  const fB = fn.F(b);
  const value = fB - fA;
  const avgValue = b !== a ? value / (b - a) : fn.f(a);
  const n = 100;
  const curve: { x: number; y: number }[] = [];
  const step = (b - a) / n;
  for (let i = 0; i <= n; i++) {
    const x = a + i * step;
    const y = fn.f(x);
    if (isFinite(y)) curve.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
  }
  const breakdown = [
    { label: "Function f(x)", value: fn.label },
    { label: "Antiderivative F(x)", value: fn.Fstr },
    { label: "Lower Limit a", value: fmt(a) },
    { label: "Upper Limit b", value: fmt(b) },
    { label: "F(b)", value: fmt(fB) },
    { label: "F(a)", value: fmt(fA) },
    { label: "Definite Integral ∫ f(x) dx", value: fmt(value) },
    { label: "Average Value on [a, b]", value: fmt(avgValue) },
  ];
  const summaryStats = [
    { label: "Definite Integral", value: fmt(value) },
    { label: "Antiderivative", value: fn.Fstr },
    { label: "Average Value", value: fmt(avgValue) },
    { label: "f(a)", value: fmt(fn.f(a)) },
    { label: "f(b)", value: fmt(fn.f(b)) },
    { label: "Interval Length", value: fmt(Math.abs(b - a)) },
  ];
  return { fnKey, a, b, value, antiderivativeStr: fn.Fstr, fa: fn.f(a), fb: fn.f(b), fA, fB, avgValue, curve, breakdown, summaryStats };
}

const DEFAULTS = { fn: "x^2", a: "0", b: "2" };

export default function IntegralCalculator() {
  const [fnKey, setFnKey] = useState(DEFAULTS.fn);
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [result, setResult] = useState<IntegralResult | null>(null);

  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  const errs: string[] = [];
  if (isNaN(aNum) || isNaN(bNum)) errs.push("Both limits must be valid numbers.");
  if (!isNaN(aNum) && !isNaN(bNum) && aNum === bNum) errs.push("Limits must differ — the interval has zero length.");
  if (fnKey === "1/x" && !isNaN(aNum) && !isNaN(bNum) && aNum * bNum <= 0) errs.push("1/x is undefined at x = 0 — keep both limits on the same side of zero.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcIntegral(fnKey, aNum, bNum)); };
  const reset = () => {
    setFnKey(DEFAULTS.fn); setA(DEFAULTS.a); setB(DEFAULTS.b);
    setResult(calcIntegral("x^2", 0, 2));
  };
  useEffect(() => { setResult(calcIntegral("x^2", 0, 2)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is the definite integral computed?", answer: "Each supported function is paired with its exact antiderivative F(x) — the fundamental theorem of calculus gives the definite integral as F(b) − F(a). No numerical approximation is used, so results are exact for the listed functions." },
    { question: "Which functions are supported?", answer: "Powers (x², x³, √x), 1/x, exponentials (eˣ), trigonometric functions (sin x, cos x), and the arctangent integrand 1/(1+x²). More complex integrands are outside the curated exact set." },
    { question: "What does a negative result mean?", answer: "The definite integral measures signed area: if the curve sits below the x-axis over the interval, or the upper limit is smaller than the lower limit, the result is negative." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Integral Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Integral Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Function f(x)</label>
                <select value={fnKey} onChange={e => setFnKey(e.target.value)} className={sel}>
                  {Object.entries(FUNCTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Lower Limit a</label>
                <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Upper Limit b</label>
                <div className={inp}><input type="number" value={b} onChange={e => setB(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Definite Integral ∫ₐᵇ {FUNCTIONS[result.fnKey].label} dx</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.value)}</div>
                <div className="text-sm text-muted-foreground mt-1">F(x) = {result.antiderivativeStr} evaluated from {fmt(result.a)} to {fmt(result.b)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Integral Value`, fmt(result.value)], ["Average Value", fmt(result.avgValue)], ["Interval", `[${fmt(result.a)}, ${fmt(result.b)}]`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Evaluation Steps</h3>
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
                <h3 className="text-base font-bold mb-4">Function Curve</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="integralFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, _n: string, item: { payload?: { x?: number } }) => [`y = ${fmt(v)} at x = ${fmt(Number(item?.payload?.x ?? 0))}`, ""]} />
                    <Area type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#integralFill)" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Shaded area = signed area under the curve</p>
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
            <h2 className="text-2xl font-bold mb-3">The Fundamental Theorem of Calculus</h2>
            <p>This <strong>integral calculator</strong> evaluates definite integrals exactly using the fundamental theorem of calculus: for a function with antiderivative F, the integral from a to b equals F(b) − F(a). Each supported function is paired with its exact antiderivative, so no Riemann sums or numerical quadrature are involved.</p>
            <h2 className="text-2xl font-bold mb-3">Signed Area</h2>
            <p>The definite integral measures signed area — regions below the x-axis count as negative. The shaded chart shows the curve between the two limits, and the result equals the net (signed) area under it.</p>
            <h2 className="text-2xl font-bold mb-3">Average Value</h2>
            <p>The average value of a continuous function on an interval equals the integral divided by the interval length. It answers questions like \"what constant would give the same total area?\" and is exact here because the integral itself is exact.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/integral-calculator" />
          <PopularCalculators exclude="/calculator/integral-calculator" />
        </div>
      </div>
    </>
  );
}
