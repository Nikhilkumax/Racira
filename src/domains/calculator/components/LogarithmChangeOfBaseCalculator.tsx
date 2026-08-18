"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ChangeOfBaseResult {
  result: number;
  originalLog: number;
  naturalLog: number;
  commonLog: number;
  binaryLog: number;
  inverseCheck: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { base: string; value: number; fill: string }[];
}

function calcChangeOfBase(x: number, b: number, c: number, dp: number): ChangeOfBaseResult | null {
  if (!isFinite(x) || x <= 0 || !isFinite(b) || b <= 0 || b === 1 || !isFinite(c) || c <= 0 || c === 1) return null;
  const ln = (v: number) => Math.log(v);
  const result = ln(x) / ln(c);
  const originalLog = ln(x) / ln(b);
  const naturalLog = ln(x);
  const commonLog = ln(x) / ln(10);
  const binaryLog = ln(x) / ln(2);
  const inverseCheck = Math.pow(c, result);
  const r = (n: number) => parseFloat(n.toFixed(dp));

  const breakdown = [
    { label: `Result: log₍${c}₎(${x})`, value: `${r(result)}` },
    { label: "Expression", value: `ln(${x}) ÷ ln(${c})` },
    { label: `Original: log₍${b}₎(${x})`, value: `${r(originalLog)}` },
    { label: "Natural: ln(x)", value: `${r(naturalLog)}` },
    { label: "Common: log₁₀(x)", value: `${r(commonLog)}` },
    { label: "Binary: log₂(x)", value: `${r(binaryLog)}` },
    { label: "Inverse Check (c^result)", value: `${r(inverseCheck)}` },
    { label: "Decimal Places", value: `${dp}` },
  ];
  const summaryStats = [
    { label: `log₍${c}₎(${x})`, value: `${r(result)}` },
    { label: `log₍${b}₎(${x})`, value: `${r(originalLog)}` },
    { label: "ln(x)", value: `${r(naturalLog)}` },
    { label: "log₁₀(x)", value: `${r(commonLog)}` },
    { label: "log₂(x)", value: `${r(binaryLog)}` },
    { label: "Inverse: c^result", value: `${r(inverseCheck)}` },
    { label: "Precision", value: `${dp} dp` },
    { label: "Domain", value: "x > 0, base > 0 ≠ 1" },
  ];
  const chartData = [
    { base: `Base ${c}`, value: r(result), fill: "hsl(var(--primary))" },
    { base: "Base 2", value: r(binaryLog), fill: "#8b5cf6" },
    { base: "Base e", value: r(naturalLog), fill: "#10b981" },
    { base: "Base 10", value: r(commonLog), fill: "#f59e0b" },
  ];
  return { result: r(result), originalLog: r(originalLog), naturalLog: r(naturalLog), commonLog: r(commonLog), binaryLog: r(binaryLog), inverseCheck: r(inverseCheck), breakdown, summaryStats, chartData };
}

const DEFAULTS = { value: "1000", base: "10", targetBase: "2", decimals: "4" };

export default function LogarithmChangeOfBaseCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [base, setBase] = useState(DEFAULTS.base);
  const [targetBase, setTargetBase] = useState(DEFAULTS.targetBase);
  const [decimals, setDecimals] = useState(DEFAULTS.decimals);
  const [result, setResult] = useState<ChangeOfBaseResult | null>(null);

  const x = parseFloat(value);
  const b = parseFloat(base);
  const c = parseFloat(targetBase);
  const dp = Math.max(0, Math.min(10, parseInt(decimals) || 4));
  const errs: string[] = [];
  if (!isFinite(x) || x <= 0) errs.push("Value (x) must be greater than 0.");
  if (!isFinite(b) || b <= 0 || b === 1) errs.push("Base must be greater than 0 and not equal to 1.");
  if (!isFinite(c) || c <= 0 || c === 1) errs.push("Target base must be greater than 0 and not equal to 1.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcChangeOfBase(x, b, c, dp)); };
  const reset = () => {
    setValue(DEFAULTS.value); setBase(DEFAULTS.base); setTargetBase(DEFAULTS.targetBase); setDecimals(DEFAULTS.decimals);
    setResult(calcChangeOfBase(1000, 10, 2, 4));
  };
  useEffect(() => { setResult(calcChangeOfBase(1000, 10, 2, 4)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the change of base formula?", answer: "The change of base formula lets you convert a logarithm from one base to another: log_b(x) = log_c(x) / log_c(b). Any base c works, but calculators typically use base 10 or e because those keys exist on a standard calculator." },
    { question: "Why can't a logarithm have a base of 1?", answer: "Because 1 raised to any power always equals 1, log_1(x) has no unique answer — every exponent would produce 1. Likewise the base must be positive: a negative base only produces real values for select exponents, so it is excluded from the real logarithm domain." },
    { question: "What is the natural logarithm?", answer: "The natural logarithm uses Euler's number e ≈ 2.71828 as its base. It is written ln(x) and is the inverse of the exponential function e^x. Natural logs appear throughout calculus, physics, finance, and probability." },
    { question: "How do I use this calculator?", answer: "Enter a positive value x, the base b you are converting from, and the target base c. The calculator computes log_c(x) using ln(x) / ln(c), then shows the same value expressed in bases 2, e, and 10 for comparison, plus an inverse check that raises c to the result to recover x." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Change of Base Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Change of Base Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Value (x)</label>
                <div className={inp}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Original Base (b)</label>
                <div className={inp}><input type="number" value={base} onChange={e => setBase(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Target Base (c)</label>
                <div className={inp}><input type="number" value={targetBase} onChange={e => setTargetBase(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Decimal Places</label>
                <div className={inp}><input type="number" min="0" max="10" value={decimals} onChange={e => setDecimals(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">log₍{c}₎({x})</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.result}</div>
                <div className="text-sm text-muted-foreground mt-1">= ln({x}) ÷ ln({c}) · Inverse check: {c}^{result.result} = {result.inverseCheck}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Result", `${result.result}`], ["Natural ln(x)", `${result.naturalLog}`], ["Common log₁₀(x)", `${result.commonLog}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Logarithm Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 0 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 0 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Comparison Across Bases</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="base" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [v.toFixed(dp), "Log value"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Change of Base Formula</h2>
            <p>Most calculators only have log₁₀ and ln keys, but logarithms exist for any positive base. The change of base formula bridges the gap: log_b(x) = log_c(x) / log_c(b). This <strong>change of base calculator</strong> applies the identity with natural logarithms — log_b(x) = ln(x) / ln(b) — which is exact for any base.</p>
            <h2 className="text-2xl font-bold mb-3">Common Bases</h2>
            <p>Base 10 (common logarithm) is used in scientific notation and decibels. Base e (natural logarithm) is fundamental to calculus and continuous growth models. Base 2 (binary logarithm) dominates computer science — information theory, algorithm analysis, and binary search all use log₂.</p>
            <h2 className="text-2xl font-bold mb-3">Domain Rules</h2>
            <p>A logarithm log_b(x) is only defined for x &gt; 0, b &gt; 0, and b ≠ 1. The value can be any real number: negative for 0 &lt; x &lt; 1, zero at x = 1, and positive for x &gt; 1. The inverse relationship b^(log_b(x)) = x always holds and is shown as the inverse check in the results.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/logarithm-change-of-base-calculator" />
          <PopularCalculators exclude="/calculator/logarithm-change-of-base-calculator" />
        </div>
      </div>
    </>
  );
}
