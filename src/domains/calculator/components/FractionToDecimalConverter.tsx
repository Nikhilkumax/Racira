"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface FractionResult {
  numerator: number;
  denominator: number;
  simplifiedNum: number;
  simplifiedDen: number;
  decimalLabel: string;
  repeating: boolean;
  repeatPart: string;
  percent: number;
  terminating: boolean;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function decimalParts(num: number, den: number): { intPart: number; digits: number[]; repeatStart: number } {
  let n = Math.abs(num) % Math.abs(den);
  const intPart = Math.floor(Math.abs(num) / Math.abs(den));
  const digits: number[] = [];
  const seen = new Map<number, number>();
  let repeatStart = -1;
  while (n !== 0) {
    if (seen.has(n)) { repeatStart = seen.get(n)!; break; }
    seen.set(n, digits.length);
    n *= 10;
    digits.push(Math.floor(n / Math.abs(den)));
    n = n % Math.abs(den);
  }
  return { intPart, digits, repeatStart };
}

function bar(s: string): string {
  return s.split("").map(c => `${c}\u0305`).join("");
}

function calcFraction(num: number, den: number): FractionResult {
  const sign = num * den < 0 ? "-" : "";
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  const { intPart, digits, repeatStart } = decimalParts(num, den);
  const repeating = repeatStart !== -1;

  let decimalLabel: string;
  let repeatPart = "";
  if (repeating) {
    const nonRep = digits.slice(0, repeatStart).join("");
    const rep = digits.slice(repeatStart).join("");
    repeatPart = rep;
    decimalLabel = `${sign}${intPart}.${nonRep}${bar(rep)}`;
  } else {
    decimalLabel = digits.length === 0 ? `${sign}${intPart}.0` : `${sign}${intPart}.${digits.join("")}`;
  }

  const percent = (num / den) * 100;
  const terminating = !repeating;

  const breakdown = [
    { label: "Fraction", value: `${num}/${den}` },
    { label: "Simplified", value: sNum === sDen ? "1" : `${sNum}/${sDen}` },
    { label: "Decimal", value: decimalLabel },
    { label: "Repeating Part", value: repeating ? `${repeatPart.length}-digit repetend` : "None (terminating)" },
    { label: "Percent", value: `${parseFloat(percent.toFixed(4))}%` },
    { label: "Decimal Type", value: terminating ? "Terminating" : "Repeating (non-terminating)" },
    { label: "Numerator", value: `${num}` },
    { label: "Denominator", value: `${den}` },
  ];
  const summaryStats = [
    { label: "Decimal", value: decimalLabel },
    { label: "Percent", value: `${parseFloat(percent.toFixed(4))}%` },
    { label: "Simplified", value: sNum === sDen ? "1" : `${sNum}/${sDen}` },
    { label: "Type", value: terminating ? "Terminating" : "Repeating" },
    { label: "Repetend", value: repeatPart || "—" },
    { label: "Numerator", value: `${num}` },
    { label: "Denominator", value: `${den}` },
    { label: "GCD", value: `${g}` },
  ];
  const fracPct = (num / den) * 100;
  const chartData = [
    { name: "Value", value: Math.max(0, Math.min(100, Math.round(fracPct))), fill: "hsl(var(--primary))" },
    { name: "Remainder", value: Math.max(0, Math.round(100 - Math.min(100, fracPct))), fill: "var(--border)" },
  ];
  return { numerator: num, denominator: den, simplifiedNum: sNum, simplifiedDen: sDen, decimalLabel, repeating, repeatPart, percent, terminating, breakdown, summaryStats, chartData };
}

const DEFAULTS = { num: "3", den: "8" };

export default function FractionToDecimalConverter() {
  const [num, setNum] = useState(DEFAULTS.num);
  const [den, setDen] = useState(DEFAULTS.den);
  const [result, setResult] = useState<FractionResult | null>(null);

  const n = parseInt(num) || 0;
  const d = parseInt(den) || 0;
  const errs: string[] = [];
  if (!/^-?\d+$/.test(num.trim())) errs.push("Numerator must be a whole number.");
  if (!/^-?\d+$/.test(den.trim())) errs.push("Denominator must be a whole number.");
  else if (d === 0) errs.push("Denominator cannot be zero.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcFraction(n, d)); };
  const reset = () => {
    setNum(DEFAULTS.num); setDen(DEFAULTS.den);
    setResult(calcFraction(3, 8));
  };
  useEffect(() => { setResult(calcFraction(3, 8)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do I convert a fraction to a decimal?", answer: "Divide the numerator by the denominator. The division either terminates (like 3/8 = 0.375) or repeats forever (like 1/3 = 0.333…), which this calculator marks with an overline." },
    { question: "When does a decimal terminate?", answer: "A fraction terminates exactly when the denominator's prime factors are only 2s and 5s. Any other prime factor, like 3 or 7, forces a repeating decimal." },
    { question: "What does the overline mean?", answer: "The overline (e.g., 0.1̅42̅857̅) marks the digit block that repeats forever. For 1/7 the six digits 142857 cycle endlessly: 0.142857142857…" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Fraction to Decimal Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Fraction to Decimal Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Numerator</label>
                <div className={inp}><input value={num} onChange={e => setNum(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Denominator</label>
                <div className={inp}><input value={den} onChange={e => setDen(e.target.value)} className={ci} /></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Decimal Value</div>
                <div className="text-4xl font-extrabold tracking-tight break-all">{result.decimalLabel}</div>
                <div className="text-sm text-muted-foreground mt-1">{parseFloat(result.percent.toFixed(4))}% · {result.terminating ? "terminating" : `repeating (repetend ${result.repeatPart})`}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Percent`, `${parseFloat(result.percent.toFixed(4))}%`], ["Simplified", result.simplifiedNum === result.simplifiedDen ? "1" : `${result.simplifiedNum}/${result.simplifiedDen}`], ["Type", result.terminating ? "Terminating" : "Repeating"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Conversion Details</h3>
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
                <h3 className="text-base font-bold mb-4">Part of a Whole</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Fraction shown as a share of 100%</p>
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
            <h2 className="text-2xl font-bold mb-3">Long Division to Decimal</h2>
            <p>This <strong>fraction to decimal converter</strong> performs exact long division. Every rational number either terminates or enters a repeating pattern: the calculator detects the repeat by tracking remainders — when a remainder recurs, the digit cycle repeats forever, shown with an overline.</p>
            <h2 className="text-2xl font-bold mb-3">Why Some Decimals Repeat</h2>
            <p>The decimal terminates only when the denominator's prime factors are 2 and 5 (the factors of 10). A denominator like 7 or 3 introduces a repetend: 1/7 = 0.142857142857…, where the six-digit block cycles indefinitely.</p>
            <h2 className="text-2xl font-bold mb-3">Simplification First</h2>
            <p>Reducing the fraction with the GCD before converting doesn't change the value, but it makes the pattern easier to read — 4/6 simplifies to 2/3 = 0.6̅, and the simplified form is shown alongside the original.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fraction-to-decimal-converter" />
          <PopularCalculators exclude="/calculator/fraction-to-decimal-converter" />
        </div>
      </div>
    </>
  );
}
