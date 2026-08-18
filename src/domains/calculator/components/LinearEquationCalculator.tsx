"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EqResult {
  mode: string;
  solution: string;
  xSol: number | null;
  ySol: number | null;
  lines: { x: number; y1: number; y2: number | null }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcEquation(mode: string, a: number, b: number, c: number, d: number, e: number, f: number): EqResult {
  let solution = "";
  let xSol: number | null = null;
  let ySol: number | null = null;
  let lines: { x: number; y1: number; y2: number | null }[] = [];
  const breakdown: { label: string; value: string }[] = [];
  if (mode === "single") {
    // ax + b = cx + d
    const lhs = a - c;
    if (lhs === 0 && b !== d) {
      solution = "No solution — the equation reduces to a false statement (b ≠ d).";
    } else if (lhs === 0) {
      solution = "Infinite solutions — both sides are identical (identity).";
    } else {
      xSol = (d - b) / lhs;
      solution = `x = (${d} − ${b}) ÷ (${a} − ${c}) = ${fmt(xSol!)}`;
    }
    const fLeft = (x: number) => a * x + b;
    const fRight = (x: number) => c * x + d;
    lines = [];
    for (let i = -20; i <= 20; i++) {
      const x = i * 0.5;
      lines.push({ x: Number(x.toFixed(2)), y1: Number(fLeft(x).toFixed(3)), y2: Number(fRight(x).toFixed(3)) });
    }
    breakdown.push(
      { label: "Equation", value: `${a}x + ${b} = ${c}x + ${d}` },
      { label: "Move x terms left", value: `(${a} − ${c})x = ${d} − ${b}` },
      { label: "Coefficient of x", value: `${lhs}` },
      { label: "Constant Difference", value: `${d - b}` },
      { label: "Solution", value: solution },
      { label: "Check (LHS)", value: xSol !== null ? fmt(a * xSol + b) : "—" },
      { label: "Check (RHS)", value: xSol !== null ? fmt(c * xSol + d) : "—" },
    );
  } else {
    // system: a x + b y = e ; c x + d y = f
    const det = a * d - b * c;
    if (det === 0) {
      const proportional = a * f === c * e && b * f === d * e;
      solution = proportional ? "Infinite solutions — the two equations describe the same line." : "No solution — the lines are parallel and never intersect.";
      xSol = null; ySol = null;
      // still draw parallel lines
      const y1 = (x: number) => a !== 0 ? (e - a * x) / b : NaN;
      const y2 = (x: number) => c !== 0 ? (f - c * x) / d : NaN;
      lines = [];
      for (let i = -20; i <= 20; i++) {
        const x = i * 0.5;
        const yy1 = y1(x);
        const yy2 = y2(x);
        lines.push({ x: Number(x.toFixed(2)), y1: isFinite(yy1) ? Number(yy1.toFixed(3)) : 0, y2: isFinite(yy2) ? Number(yy2.toFixed(3)) : 0 });
      }
    } else {
      xSol = (e * d - b * f) / det;
      ySol = (a * f - e * c) / det;
      solution = `x = ${fmt(xSol!)}, y = ${fmt(ySol!)}`;
      const y1 = (x: number) => (e - a * x) / b;
      const y2 = (x: number) => (f - c * x) / d;
      lines = [];
      for (let i = -20; i <= 20; i++) {
        const x = i * 0.5;
        lines.push({ x: Number(x.toFixed(2)), y1: Number(y1(x).toFixed(3)), y2: Number(y2(x).toFixed(3)) });
      }
    }
    breakdown.push(
      { label: "System", value: `${a}x + ${b}y = ${e} ; ${c}x + ${d}y = ${f}` },
      { label: "Determinant", value: `${fmt(det, 4)}` },
      { label: "Cramer's x", value: xSol !== null ? `${fmt(xSol)}` : "—" },
      { label: "Cramer's y", value: ySol !== null ? `${fmt(ySol)}` : "—" },
      { label: "Solution", value: solution },
    );
  }
  const summaryStats = [
    { label: "Solution", value: solution },
    { label: "x", value: xSol !== null ? fmt(xSol) : "—" },
    { label: "y", value: ySol !== null ? fmt(ySol) : "—" },
    { label: "Mode", value: mode === "single" ? "Single equation" : "2×2 system" },
  ];
  return { mode, solution, xSol, ySol, lines, breakdown, summaryStats };
}

const DEFAULTS = { mode: "system", a: "2", b: "3", c: "1", d: "-1", e: "12", f: "1" };

export default function LinearEquationCalculator() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [d, setD] = useState(DEFAULTS.d);
  const [e, setE] = useState(DEFAULTS.e);
  const [f, setF] = useState(DEFAULTS.f);
  const [result, setResult] = useState<EqResult | null>(null);

  const n = (s: string) => parseFloat(s) || 0;
  const aN = n(a), bN = n(b), cN = n(c), dN = n(d), eN = n(e), fN = n(f);
  const errs: string[] = [];
  if (mode === "single" && aN === cN && bN === dN) errs.push("Both sides are identical — infinite solutions.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcEquation(mode, aN, bN, cN, dN, eN, fN)); };
  const reset = () => {
    setMode(DEFAULTS.mode); setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c); setD(DEFAULTS.d); setE(DEFAULTS.e); setF(DEFAULTS.f);
    setResult(calcEquation("system", 2, 3, 1, -1, 12, 1));
  };
  useEffect(() => { setResult(calcEquation("system", 2, 3, 1, -1, 12, 1)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is a single linear equation solved?", answer: "Collect x terms on one side and constants on the other: (a − c)x = d − b, then divide. If the coefficient vanishes, the equation is either an identity (infinite solutions) or a contradiction (no solution)." },
    { question: "How does Cramer's rule solve a system?", answer: "For a₁x + b₁y = e₁ and a₂x + b₂y = e₂, the determinant D = a₁b₂ − a₂b₁ decides everything. If D ≠ 0, x = (e₁b₂ − e₂b₁)/D and y = (a₁e₂ − a₂e₁)/D. If D = 0 the lines are parallel (no solution) or identical (infinite)." },
    { question: "What does the graph show?", answer: "Each equation is a straight line. The solution is the intersection point of the two lines — visible as the crossing on the chart, where the x and y values satisfy both equations at once." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Linear Equation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Linear Equation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Equation Type</label>
                <select value={mode} onChange={e => setMode(e.target.value)} className={sel}>
                  <option value="system">System of 2 (ax + by = e, cx + dy = f)</option>
                  <option value="single">Single (ax + b = cx + d)</option>
                </select>
              </div>
              {mode === "single" ? (<>
                <div>
                  <label className={lbl}>a</label>
                  <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">x +</span></div>
                </div>
                <div>
                  <label className={lbl}>b</label>
                  <div className={inp}><input type="number" value={b} onChange={e => setB(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">=</span></div>
                </div>
                <div>
                  <label className={lbl}>c</label>
                  <div className={inp}><input type="number" value={c} onChange={e => setC(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">x +</span></div>
                </div>
                <div>
                  <label className={lbl}>d</label>
                  <div className={inp}><input type="number" value={d} onChange={e => setD(e.target.value)} className={ci} /></div>
                </div>
              </>) : (<>
                <div>
                  <label className={lbl}>a₁</label>
                  <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">x +</span></div>
                </div>
                <div>
                  <label className={lbl}>b₁</label>
                  <div className={inp}><input type="number" value={b} onChange={e => setB(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">y =</span></div>
                </div>
                <div>
                  <label className={lbl}>e₁</label>
                  <div className={inp}><input type="number" value={e} onChange={ev => setE(ev.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className={lbl}>a₂</label>
                  <div className={inp}><input type="number" value={c} onChange={ev => setC(ev.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">x +</span></div>
                </div>
                <div>
                  <label className={lbl}>b₂</label>
                  <div className={inp}><input type="number" value={d} onChange={ev => setD(ev.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">y =</span></div>
                </div>
                <div>
                  <label className={lbl}>e₂</label>
                  <div className={inp}><input type="number" value={f} onChange={ev => setF(ev.target.value)} className={ci} /></div>
                </div>
              </>)}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Solution</div>
                <div className="text-4xl font-extrabold tracking-tight break-all">{result.xSol !== null ? (result.ySol !== null ? `(${fmt(result.xSol)}, ${fmt(result.ySol)})` : `x = ${fmt(result.xSol)}`) : "No Unique Solution"}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.solution}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {result.mode === "single"
                  ? [["x", result.xSol !== null ? fmt(result.xSol) : "—"], ["LHS at x", result.xSol !== null ? fmt(parseFloat(a) * result.xSol + parseFloat(b)) : "—"], ["RHS at x", result.xSol !== null ? fmt(parseFloat(c) * result.xSol + parseFloat(d)) : "—"]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))
                  : [["x", result.xSol !== null ? fmt(result.xSol) : "—"], ["y", result.ySol !== null ? fmt(result.ySol) : "—"], ["Determinant", fmt(parseFloat(a) * parseFloat(d) - parseFloat(b) * parseFloat(c), 4)]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Step-by-Step</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">{result.mode === "single" ? "Left vs Right Side" : "The Two Lines"}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.lines} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v, 3), ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="y1" name={result.mode === "single" ? "LHS" : "Line 1"} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="y2" name={result.mode === "single" ? "RHS" : "Line 2"} stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">{result.mode === "single" ? "The x where the two lines cross is the solution" : "The intersection of the two lines is the solution point"}</p>
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
            <h2 className="text-2xl font-bold mb-3">Solving One Equation</h2>
            <p>This <strong>linear equation calculator</strong> solves ax + b = cx + d by collecting terms: (a − c)x = d − b, then dividing. The chart shows both sides as lines — the crossing point is the answer — and degenerate cases (0 = 0 identity, 0 = k contradiction) are detected and labeled.</p>
            <h2 className="text-2xl font-bold mb-3">Systems of Two Equations</h2>
            <p>For a₁x + b₁y = e₁ and a₂x + b₂y = e₂, Cramer's rule uses the determinant D = a₁b₂ − a₂b₁. When D ≠ 0 there is exactly one intersection; when D = 0 the lines are parallel (no solution) or coincident (infinite solutions).</p>
            <h2 className="text-2xl font-bold mb-3">Why It Matters</h2>
            <p>Linear equations model budgets, mixtures, motion, and supply-and-demand. Systems capture interactions — two constraints met simultaneously — and the geometric view on this page makes the algebra concrete.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/linear-equation-calculator" />
          <PopularCalculators exclude="/calculator/linear-equation-calculator" />
        </div>
      </div>
    </>
  );
}
