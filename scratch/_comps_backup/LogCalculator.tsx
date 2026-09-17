"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

interface LogResult {
  x: number;
  base: number;
  log: number;
  ln: number;
  log10: number;
  log2: number;
  check: number;
  curve: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 6): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcLog(x: number, base: number): LogResult {
  const ln = Math.log(x);
  const log = Math.log(x) / Math.log(base);
  const log10 = Math.log10(x);
  const log2 = Math.log2(x);
  const check = Math.pow(base, log);
  const curve: { x: number; y: number }[] = [];
  for (let i = 1; i <= 100; i++) {
    const xx = Math.pow(10, (i - 40) / 15);
    const y = Math.log(xx) / Math.log(base);
    if (isFinite(y) && Math.abs(y) < 50) curve.push({ x: Number(xx.toFixed(4)), y: Number(y.toFixed(4)) });
  }
  const breakdown = [
    { label: "Number x", value: fmt(x) },
    { label: "Base b", value: fmt(base) },
    { label: "log_b(x) = ln(x) / ln(b)", value: fmt(log) },
    { label: "Natural Log ln(x)", value: fmt(ln) },
    { label: "Common Log log₁₀(x)", value: fmt(log10) },
    { label: "Binary Log log₂(x)", value: fmt(log2) },
    { label: "Inverse Check b^log_b(x)", value: fmt(check) },
    { label: "x > 0 Requirement", value: x > 0 ? "Satisfied" : "Violated — undefined" },
  ];
  const summaryStats = [
    { label: "log_b(x)", value: fmt(log) },
    { label: "ln(x)", value: fmt(ln) },
    { label: "log₁₀(x)", value: fmt(log10) },
    { label: "log₂(x)", value: fmt(log2) },
    { label: "Base", value: fmt(base) },
    { label: "Number", value: fmt(x) },
    { label: "Inverse Check", value: fmt(check) },
    { label: "Exponent Form", value: `${fmt(base)}^${fmt(log)} = ${fmt(x)}` },
  ];
  return { x, base, log, ln, log10, log2, check, curve, breakdown, summaryStats };
}

const DEFAULTS = { x: "1000", base: "10" };

export default function LogCalculator() {
  const [x, setX] = useState(DEFAULTS.x);
  const [base, setBase] = useState(DEFAULTS.base);
  const [result, setResult] = useState<LogResult | null>(null);

  const xNum = parseFloat(x);
  const bNum = parseFloat(base);
  const errs: string[] = [];
  if (isNaN(xNum) || xNum <= 0) errs.push("The number x must be greater than 0 — logarithms of non-positive values are undefined.");
  if (isNaN(bNum) || bNum <= 0 || bNum === 1) errs.push("The base must be positive and not equal to 1.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLog(xNum, bNum)); };
  const reset = () => {
    setX(DEFAULTS.x); setBase(DEFAULTS.base);
    setResult(calcLog(1000, 10));
  };
  useEffect(() => { setResult(calcLog(1000, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a logarithm?", answer: "log_b(x) answers the question \"b to what power equals x?\" — it is the inverse of exponentiation. For example, log₁₀(1000) = 3 because 10³ = 1000." },
    { question: "How is a custom base computed?", answer: "Through the change-of-base identity log_b(x) = ln(x) / ln(b). Natural logs are the fundamental primitive; dividing by ln(b) rescales to any base." },
    { question: "Why must x be positive?", answer: "Exponentiation never produces a negative or zero result for a positive base, so a logarithm has no real value at x ≤ 0. Bases must also be positive and different from 1 to keep the mapping one-to-one." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Log Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Log Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Number x</label>
                <div className={inp}><input type="number" value={x} onChange={e => setX(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Base b</label>
                <div className={inp}><input type="number" value={base} onChange={e => setBase(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">log_{fmt(result.base)}({fmt(result.x)})</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.log)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.base)}^({fmt(result.log)}) = {fmt(result.check)} — verified by the inverse</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Natural ln`, fmt(result.ln)], ["Common log₁₀", fmt(result.log10)], ["Binary log₂", fmt(result.log2)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Logarithm Values</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Logarithm Curve</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" scale="log" domain={["auto", "auto"]} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, _n: string, p: { payload?: { x?: number } }) => [`log = ${fmt(v)} at x = ${fmt(Number(p?.payload?.x ?? 0))}`, ""]} />
                    <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <ReferenceDot x={result.x} y={result.log} r={6} fill="#f59e0b" stroke="none" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The highlighted point marks your input on the log curve</p>
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
            <h2 className="text-2xl font-bold mb-3">Logarithms Explained</h2>
            <p>This <strong>log calculator</strong> evaluates log_b(x) for any positive base. A logarithm is the inverse of exponentiation: log_b(x) is the exponent to which b must be raised to produce x. Change of base converts everything through natural logs.</p>
            <h2 className="text-2xl font-bold mb-3">Common, Natural, and Binary</h2>
            <p>Base 10 (common log) measures orders of magnitude, base e (natural log) arises in growth and decay, and base 2 (binary log) counts doublings — central to computing and information theory. All three are shown alongside your custom base.</p>
            <h2 className="text-2xl font-bold mb-3">Verification</h2>
            <p>Every result is checked by re-exponentiating: b^log_b(x) must reproduce x. If the displayed value and the inverse check disagree, you would know immediately — with double precision they agree to six decimals.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/log-calculator" />
          <PopularCalculators exclude="/calculator/log-calculator" />
        </div>
      </div>
    </>
  );
}
