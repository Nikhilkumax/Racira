"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// parse "3x^2 - 2x + 5" into coefficient array [c2, c1, c0]
function parsePoly(s: string): number[] | null {
  const clean = s.replace(/\s+/g, "").replace(/\*\*/g, "^");
  if (!clean) return null;
  const terms: { coef: number; exp: number }[] = [];
  const re = /([+-]?[^-+]+)/g;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const t = m[1];
    if (!t) continue;
    const hasX = /x/i.test(t);
    const coefPart = t.split(/x/i)[0] || "";
    const expPart = /x\^?([0-9]+)?/i.exec(t)?.[1];
    let coef: number;
    if (!hasX) coef = parseFloat(t);
    else if (coefPart === "" || coefPart === "+") coef = 1;
    else if (coefPart === "-") coef = -1;
    else coef = parseFloat(coefPart);
    const exp = hasX ? (expPart ? parseInt(expPart, 10) : 1) : 0;
    if (isNaN(coef)) return null;
    terms.push({ coef, exp });
  }
  const degree = Math.max(0, ...terms.map(t => t.exp));
  const coeffs = new Array(degree + 1).fill(0);
  for (const t of terms) coeffs[degree - t.exp] += t.coef;
  return coeffs;
}

function formatPoly(coeffs: number[]): string {
  const parts: string[] = [];
  const deg = coeffs.length - 1;
  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    if (c === 0) continue;
    const exp = deg - i;
    const sign = parts.length === 0 ? (c < 0 ? "-" : "") : (c < 0 ? " − " : " + ");
    const abs = Math.abs(c);
    const coefStr = abs === 1 && exp > 0 ? "" : `${abs < 0.001 ? abs.toExponential(2) : parseFloat(abs.toFixed(4))}`;
    const xStr = exp > 0 ? (exp === 1 ? "x" : exp === 2 ? "x²" : exp === 3 ? "x³" : `x^${exp}`) : "";
    parts.push(`${sign}${coefStr}${xStr}`);
  }
  return parts.length ? parts.join("") : "0";
}

function evalPoly(coeffs: number[], x: number): number {
  let r = 0;
  for (const c of coeffs) r = r * x + c;
  return r;
}

function addPoly(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const out = new Array(len).fill(0);
  for (let i = 0; i < len; i++) out[i] = (a[a.length - len + i] || 0) + (b[b.length - len + i] || 0);
  return out;
}

function mulPoly(a: number[], b: number[]): number[] {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] += a[i] * b[j];
  return out;
}

const DEFAULTS = { a: "x^2 - 4x + 3", b: "2x + 1", op: "add", x: "2" };

export default function PolynomialCalculator() {
  const [aStr, setAStr] = useState(DEFAULTS.a);
  const [bStr, setBStr] = useState(DEFAULTS.b);
  const [op, setOp] = useState(DEFAULTS.op);
  const [xStr, setXStr] = useState(DEFAULTS.x);
  const [calculated, setCalculated] = useState(false);

  const A = parsePoly(aStr);
  const B = parsePoly(bStr);
  const x = parseFloat(xStr);
  const valid = A !== null && B !== null;

  const result = valid ? (op === "add" ? addPoly(A, B) : op === "sub" ? addPoly(A, B.map(c => -c)) : mulPoly(A, B)) : [0];
  const resultStr = formatPoly(result);
  const evaluated = valid && !isNaN(x) ? (op === "eval" ? evalPoly(result, x) : null) : null;

  const chartData = valid
    ? Array.from({ length: 61 }, (_, i) => {
        const t = (i - 30) / 5;
        return { x: t, y: Number(evalPoly(result, t).toFixed(4)) };
      })
    : [];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setAStr(DEFAULTS.a); setBStr(DEFAULTS.b); setOp(DEFAULTS.op); setXStr(DEFAULTS.x); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";
  const seg = "flex-1 py-2 rounded-md text-sm font-semibold transition-all";

  const faqs = [
    { question: "What notation is accepted?", answer: "Standard algebraic form: 3x^2 - 2x + 5, with ^ or ** for powers, implicit multiplication for coefficients, and optional terms like x or constants. The parser normalizes everything into coefficient arrays before operating." },
    { question: "How are the operations performed?", answer: "Addition and subtraction line up coefficients by degree; multiplication uses the convolution of coefficient arrays. The result is displayed in standard form with descending powers." },
    { question: "What does evaluating mean?", answer: "Substituting a number for x and computing the polynomial's value — the y-coordinate of the curve at that point. The chart plots the result curve across the range, so you can see the shape and the evaluation point together." },
    { question: "Can it find roots?", answer: "This calculator focuses on the four arithmetic operations and evaluation. Roots are where the curve crosses the x-axis — the chart makes them visible, and pairing this with a dedicated equation or factoring tool completes the picture." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Polynomial Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Polynomial Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Polynomial A</label>
              <input value={aStr} onChange={e => setAStr(e.target.value)} className={inp} placeholder="x^2 - 4x + 3" />
            </div>
            <div>
              <label className={lbl}>Polynomial B</label>
              <input value={bStr} onChange={e => setBStr(e.target.value)} className={inp} placeholder="2x + 1" />
            </div>
            <div className="flex gap-1 p-1 rounded-md bg-muted/60">
              {[["add", "A + B"], ["sub", "A − B"], ["mul", "A × B"], ["eval", "Evaluate at x"]].map(([k, lab]) => (
                <button key={k} onClick={() => setOp(k)} className={`${seg} ${op === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{lab}</button>
              ))}
            </div>
            {op === "eval" && (
              <div>
                <label className={lbl}>Value of x</label>
                <input type="number" step="any" value={xStr} onChange={e => setXStr(e.target.value)} className={inp} placeholder="2" />
              </div>
            )}
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Could not parse one of the polynomials — check the notation.</p>}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Result · Degree {result.length - 1}</div>
                <div className="text-2xl font-extrabold tracking-tight break-words">{resultStr}</div>
                {evaluated !== null && <div className="text-sm text-muted-foreground mt-1">At x = {fmtNum(x)} → {fmtNum(evaluated)}</div>}
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Polynomial A", formatPoly(A), `degree ${A.length - 1}`], ["Polynomial B", formatPoly(B), `degree ${B.length - 1}`], ["Operation", op === "add" ? "A + B" : op === "sub" ? "A − B" : op === "mul" ? "A × B" : "Evaluate", `${result.length} terms`]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm font-bold break-all">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Result Curve</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={["dataMin", "dataMax"]} />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmtNum(Number(v)), "f(x)"]} labelFormatter={(l: number) => `x = ${fmtNum(Number(l))}`} />
                    <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">f(x) plotted from x = −6 to 6 — crossings of the axis are real roots</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Calculation Detail</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">A(x):</span><span className="font-semibold break-all">{formatPoly(A)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">B(x):</span><span className="font-semibold break-all">{formatPoly(B)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Result:</span><span className="font-semibold break-all">{resultStr}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Degree:</span><span className="font-semibold">{result.length - 1}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Leading coefficient:</span><span className="font-semibold">{fmtNum(result[0])}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Constant term:</span><span className="font-semibold">{fmtNum(result[result.length - 1])}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Polynomial Arithmetic, Automated</h2>
            <p>Adding, subtracting, and multiplying polynomials is mechanical but error-prone by hand — especially when degrees climb. This <strong>polynomial calculator</strong> parses standard algebraic notation and performs the operations on coefficient arrays, so the result is always exact and normalized.</p>
            <h2 className="text-2xl font-bold mb-3">Coefficients Do the Work</h2>
            <p>Every polynomial is stored as its coefficient list, from leading term down. Addition aligns degrees, multiplication convolves the arrays, and formatting rebuilds the human-readable expression — the same pipeline computer algebra systems use.</p>
            <h2 className="text-2xl font-bold mb-3">See the Shape</h2>
            <p>The result curve plots f(x) across the range, turning algebra into geometry. Where the curve crosses the x-axis, real roots live; the degree tells you how many there are in total, counting complex ones.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/polynomial-calculator" />
          <PopularCalculators exclude="/calculator/polynomial-calculator" />
        </div>
      </div>
    </>
  );
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
}
