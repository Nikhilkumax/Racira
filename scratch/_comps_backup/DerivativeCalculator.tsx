"use client";
import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Sigma } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Term {
  coeff: number;
  exp: number;
  text: string;
}

interface DerivativeResult {
  terms: Term[];
  fText: string;
  fPrimeText: string;
  x: number;
  fx: number;
  slope: number;
  intercept: number;
  tangent: string;
  chartData: { x: number; f: number; tangent: number }[];
}

function parsePolynomial(expr: string): Term[] {
  const cleaned = expr.replace(/\s+/g, "").replace(/\*/g, "");
  if (!cleaned || !/^[0-9xX^+\-.]+$/.test(cleaned)) return [];
  const parts = cleaned.replace(/\+/g, "|+").replace(/-/g, "|-").split("|").filter(p => p.length > 0);
  const terms: Term[] = [];
  for (const raw of parts) {
    const sign = raw.startsWith("-") ? -1 : 1;
    let body = raw.replace(/^[+-]/, "");
    if (!body) continue;
    let coeff: number;
    let exp: number;
    const xMatch = body.indexOf("x") >= 0 ? body.indexOf("x") : body.indexOf("X");
    if (xMatch < 0) {
      coeff = parseFloat(body);
      exp = 0;
    } else {
      const cStr = body.slice(0, xMatch);
      coeff = cStr === "" ? 1 : parseFloat(cStr);
      const after = body.slice(xMatch + 1);
      const pow = after.match(/\^([0-9]+)/);
      exp = pow ? parseInt(pow[1], 10) : 1;
    }
    if (!isNaN(coeff)) terms.push({ coeff: sign * coeff, exp, text: "" });
  }
  // merge like exponents
  const map = new Map<number, number>();
  for (const t of terms) map.set(t.exp, (map.get(t.exp) || 0) + t.coeff);
  return [...map.entries()].map(([exp, coeff]) => ({ coeff, exp, text: "" }));
}

function fmtTerm(coeff: number, exp: number): string {
  if (coeff === 0) return "";
  const sign = coeff < 0 ? "-" : "+";
  const c = Math.abs(coeff);
  const cStr = (c === 1 && exp > 0 ? "" : `${c}`);
  if (exp === 0) return `${sign}${c}`;
  if (exp === 1) return `${sign}${cStr}x`;
  return `${sign}${cStr}x^${exp}`;
}

function evalPoly(terms: Term[], x: number): number {
  return terms.reduce((sum, t) => sum + t.coeff * Math.pow(x, t.exp), 0);
}

function calcDerivative(expr: string, x: number): DerivativeResult | null {
  const terms = parsePolynomial(expr);
  if (terms.length === 0) return null;
  const fText = terms.map(t => fmtTerm(t.coeff, t.exp)).join(" ").replace(/^\+/, "").trim() || "0";
  const dTerms: Term[] = terms
    .map(t => ({ coeff: t.coeff * t.exp, exp: t.exp - 1, text: "" }))
    .filter(t => t.coeff !== 0);
  const fPrimeText = dTerms.length === 0 ? "0" : dTerms.map(t => fmtTerm(t.coeff, t.exp)).join(" ").replace(/^\+/, "").trim();
  const fx = evalPoly(terms, x);
  const slope = evalPoly(dTerms, x);
  const intercept = fx - slope * x;
  const tangent = `${slope === 0 ? "0" : `${fmtTerm(slope, 1).replace("+", "")}`}${intercept >= 0 ? " + " : " − "}${Math.abs(intercept).toFixed(2)}`;
  const chartData: { x: number; f: number; tangent: number }[] = [];
  for (let i = -10; i <= 10; i++) {
    const px = x + i * 0.4;
    chartData.push({ x: Number(px.toFixed(2)), f: Number(evalPoly(terms, px).toFixed(3)), tangent: Number((slope * px + intercept).toFixed(3)) });
  }
  return { terms, fText, fPrimeText, x, fx, slope, intercept, tangent, chartData };
}

const DEFAULTS = { expr: "3x^2 + 2x - 5", x: "2" };

const faqs = [
  { question: "What is a derivative?", answer: "The derivative f′(x) measures the instantaneous rate of change — the slope of the tangent line at x. For polynomials, the power rule gives it term by term: d/dx(a·xⁿ) = a·n·xⁿ⁻¹." },
  { question: "Which expressions are supported?", answer: "Polynomials in x with integer or decimal exponents, e.g. 3x^2 + 2x − 5 or 0.5x^3 − x. Terms are merged and the derivative is exact — no numerical approximation." },
  { question: "What is the tangent line?", answer: "At x₀ the tangent line is y = f′(x₀)(x − x₀) + f(x₀), the best linear approximation of the function near that point. The chart plots it against the curve." },
];

export default function DerivativeCalculator() {
  const [expr, setExpr] = useState(DEFAULTS.expr);
  const [x, setX] = useState(DEFAULTS.x);
  const [result, setResult] = useState<DerivativeResult | null>(() => calcDerivative("3x^2 + 2x - 5", 2));

  useEffect(() => {
    const xv = parseFloat(x);
    const r = !isNaN(xv) ? calcDerivative(expr, xv) : null;
    if (r) setResult(r);
  }, []);

  const reset = () => { setExpr(DEFAULTS.expr); setX(DEFAULTS.x); setResult(calcDerivative(DEFAULTS.expr, parseFloat(DEFAULTS.x))); };
  const parsed = useMemo(() => parsePolynomial(expr), [expr]);
  const invalid = parsed.length === 0 || isNaN(parseFloat(x));

  const breakdown = result ? [
    { label: "Function f(x)", value: result.fText },
    { label: "Derivative f′(x)", value: result.fPrimeText, highlight: true },
    { label: "Evaluate at x", value: `${result.x}` },
    { label: "f(x₀)", value: `${result.fx.toFixed(4)}` },
    { label: "Slope f′(x₀)", value: `${result.slope.toFixed(4)}` },
    { label: "Tangent Line", value: `y = ${result.tangent}` },
  ] : [];

  const summaryStats = result ? [
    { label: "f′(x)", value: result.fPrimeText },
    { label: "Slope at x₀", value: `${result.slope.toFixed(4)}` },
    { label: "f(x₀)", value: `${result.fx.toFixed(4)}` },
    { label: "Tangent", value: `y = ${result.tangent}` },
    { label: "Terms", value: `${result.terms.length}` },
    { label: "Evaluation Point", value: `${result.x}` },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Derivative Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Derivative Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="der-expr" className="block text-sm font-medium mb-1 text-foreground">Polynomial f(x)</label>
              <input id="der-expr" type="text" value={expr} onChange={(e) => setExpr(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">Use x and ^ for powers, e.g. 3x^2 + 2x - 5</p>
            </div>
            <div>
              <label htmlFor="der-x" className="block text-sm font-medium mb-1 text-foreground">Evaluate at x =</label>
              <input id="der-x" type="number" step="0.1" value={x} onChange={(e) => setX(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Sigma className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid polynomial (e.g. 3x^2 + 2x - 5) and a numeric x.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Derivative f′(x)</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-primary break-all">{result.fPrimeText}</div>
                  <div className="text-sm text-muted-foreground mt-1">f′( {result.x} ) = {result.slope.toFixed(4)} · tangent slope at x₀</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">f(x₀)</div>
                    <div className="text-lg font-bold text-primary">{result.fx.toFixed(3)}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Slope f′(x₀)</div>
                    <div className="text-lg font-bold text-primary">{result.slope.toFixed(3)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Tangent Line</div>
                    <div className="text-lg font-bold text-primary break-all">y = {result.tangent}</div>
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
                          <td className="p-2.5 pr-3 text-right font-semibold break-all">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">f(x) and Tangent Line Near x₀</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Legend />
                      <Line type="monotone" dataKey="f" name="f(x)" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="tangent" name="Tangent" stroke="hsl(0 72% 51%)" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {summaryStats.map((s) => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold break-all">{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">About the Derivative Calculator</h2>
            <p>Differentiation finds how fast a function changes. The power rule — d/dx(a·xⁿ) = a·n·xⁿ⁻¹ — is applied to every term exactly: 3x² becomes 6x, 2x becomes 2, and constants drop away. Because each term is handled symbolically, the derivative shown is exact, not an approximation.</p>
            <h3>The Tangent Line</h3>
            <p>At a point x₀, the derivative equals the slope of the tangent line y = f′(x₀)(x − x₀) + f(x₀). The chart draws both the curve and its tangent across a window around x₀, showing the line that best approximates the curve locally.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/derivative-calculator" />
          <PopularCalculators exclude="/calculator/derivative-calculator" />
        </div>
      </div>
    </>
  );
}
