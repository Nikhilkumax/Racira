"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface LimitResult {
  fnKey: string;
  a: number;
  value: number | null;
  left: number | null;
  right: number | null;
  status: string;
  curve: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const FUNCTIONS: Record<string, { label: string; f: (x: number) => number }> = {
  "x^2": { label: "x²", f: (x) => x * x },
  "sin(x)/x": { label: "sin x / x", f: (x) => (x === 0 ? 1 : Math.sin(x) / x) },
  "(e^x-1)/x": { label: "(eˣ − 1) / x", f: (x) => (x === 0 ? 1 : (Math.exp(x) - 1) / x) },
  "sin(x)": { label: "sin x", f: (x) => Math.sin(x) },
  "cos(x)": { label: "cos x", f: (x) => Math.cos(x) },
  "e^x": { label: "eˣ", f: (x) => Math.exp(x) },
  "1/x": { label: "1/x", f: (x) => 1 / x },
  "ln(x)": { label: "ln x", f: (x) => Math.log(x) },
  "sqrt(x)": { label: "√x", f: (x) => Math.sqrt(Math.max(0, x)) },
};

function fmt(v: number | null, d = 6): string {
  if (v === null || v === undefined) return "—";
  if (!isFinite(v)) return v > 0 ? "+∞" : "−∞";
  return Number(v.toFixed(d)).toString();
}

function calcLimit(fnKey: string, a: number): LimitResult {
  const fn = FUNCTIONS[fnKey].f;
  const direct = fn(a);
  const h = 1e-8;
  const left = fn(a - h);
  const right = fn(a + h);
  // numeric stabilization for known special limits
  let leftV = left;
  let rightV = right;
  if (fnKey === "sin(x)/x" && a === 0) { leftV = 1; rightV = 1; }
  if (fnKey === "(e^x-1)/x" && a === 0) { leftV = 1; rightV = 1; }
  const both = Math.abs(leftV - rightV) < 1e-6 ? (isFinite(leftV) ? leftV : leftV > 0 ? Infinity : -Infinity) : null;
  let status = "";
  if (both !== null && isFinite(both)) {
    status = `Continuous at x = ${fmt(a)} — the limit equals f(${fmt(a)}) = ${fmt(direct)}`;
  } else if (both === null && isFinite(leftV) && isFinite(rightV)) {
    status = "Jump discontinuity — the one-sided limits differ";
  } else if (both === Infinity || both === -Infinity || (!isFinite(leftV) && !isFinite(rightV))) {
    status = "Infinite limit — the function grows without bound";
  } else if (both === null) {
    status = "The limit does not exist — the function behaves differently on each side";
  } else {
    status = "Limit exists and is finite";
  }
  // curve near a
  const curve: { x: number; y: number }[] = [];
  for (let i = -50; i <= 50; i++) {
    const x = a + (i / 50) * Math.max(1, Math.abs(a) * 0.5);
    if (x === a) continue;
    const y = fn(x);
    if (isFinite(y) && Math.abs(y) < 1e6) curve.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
  }
  const breakdown = [
    { label: "Function", value: FUNCTIONS[fnKey].label },
    { label: "Point Approached", value: `x = ${fmt(a)}` },
    { label: "Direct Substitution f(a)", value: fmt(direct) },
    { label: "Left-Hand Limit (x → a⁻)", value: fmt(leftV) },
    { label: "Right-Hand Limit (x → a⁺)", value: fmt(rightV) },
    { label: "Limit", value: both === null ? "Does not exist" : fmt(both) },
    { label: "Behavior", value: status },
  ];
  const summaryStats = [
    { label: "Limit", value: both === null ? "DNE" : fmt(both) },
    { label: "Left-Hand", value: fmt(leftV) },
    { label: "Right-Hand", value: fmt(rightV) },
    { label: "f(a)", value: fmt(direct) },
    { label: "Function", value: FUNCTIONS[fnKey].label },
    { label: "Approach", value: `x → ${fmt(a)}` },
  ];
  return { fnKey, a, value: both, left: leftV, right: rightV, status, curve, breakdown, summaryStats };
}

const DEFAULTS = { fn: "sin(x)/x", a: "0" };

export default function LimitCalculator() {
  const [fnKey, setFnKey] = useState(DEFAULTS.fn);
  const [a, setA] = useState(DEFAULTS.a);
  const [result, setResult] = useState<LimitResult | null>(null);

  const aNum = parseFloat(a);
  const errs: string[] = [];
  if (isNaN(aNum)) errs.push("Enter a number for the point x approaches.");
  if (fnKey === "ln(x)" && aNum <= 0) errs.push("ln x is only defined for x > 0 — choose a positive approach point.");
  if (fnKey === "sqrt(x)" && aNum < 0) errs.push("√x is only defined for x ≥ 0 — choose a non-negative approach point.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLimit(fnKey, aNum)); };
  const reset = () => {
    setFnKey(DEFAULTS.fn); setA(DEFAULTS.a);
    setResult(calcLimit("sin(x)/x", 0));
  };
  useEffect(() => { setResult(calcLimit("sin(x)/x", 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a limit?", answer: "The limit of f(x) as x approaches a is the value the function trends toward as x gets arbitrarily close to a — whether or not f(a) itself exists. Limits underpin derivatives, integrals, and continuity." },
    { question: "What are one-sided limits?", answer: "The left-hand limit (x → a⁻) samples values below a; the right-hand limit (x → a⁺) samples values above. A two-sided limit exists only when both one-sided limits exist and agree." },
    { question: "How are special limits like sin x / x handled?", answer: "For the classic indeterminate forms, exact known results are used — sin x / x → 1 and (eˣ − 1) / x → 1 as x → 0. Numeric sampling near the point confirms the result visually on the curve." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Limit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Limit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Function f(x)</label>
                <select value={fnKey} onChange={e => setFnKey(e.target.value)} className={sel}>
                  {Object.entries(FUNCTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={lbl}>x approaches</label>
                <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Limit as x → {fmt(result.a)}</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.value === null ? "Does Not Exist" : fmt(result.value)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.status}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Left-Hand`, fmt(result.left)], ["Right-Hand", fmt(result.right)], ["f(a)", fmt(FUNCTIONS[result.fnKey].f(result.a))]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Limit Evaluation</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Function Near the Point</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, _n: string, p: { payload?: { x?: number } }) => [`f(x) = ${fmt(v)} at x = ${fmt(Number(p?.payload?.x ?? 0))}`, ""]} />
                    <ReferenceLine x={result.a} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "a", position: "top", fontSize: 11, fill: "#f59e0b" }} />
                    <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Curve behavior on both sides of x = {fmt(result.a)}</p>
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
            <h2 className="text-2xl font-bold mb-3">The Idea of a Limit</h2>
            <p>This <strong>limit calculator</strong> evaluates the behavior of a function as its input approaches a target point from both sides. The left-hand limit samples values just below the point, the right-hand limit just above, and the two-sided limit exists only when they agree.</p>
            <h2 className="text-2xl font-bold mb-3">Continuity and Discontinuities</h2>
            <p>When the limit equals f(a), the function is continuous there. A jump (one-sided limits differ), a hole (removable discontinuity), or an infinite blow-up all produce characteristic limit patterns the calculator identifies and labels.</p>
            <h2 className="text-2xl font-bold mb-3">Special Indeterminate Forms</h2>
            <p>At 0/0, direct substitution fails. The curated library resolves the classic cases exactly — sin x / x → 1 and (eˣ − 1) / x → 1 at zero — while the curve plot makes the approach visible.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/limit-calculator" />
          <PopularCalculators exclude="/calculator/limit-calculator" />
        </div>
      </div>
    </>
  );
}
