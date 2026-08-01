"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, AlertTriangle, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface AntilogResult {
  result: number;
  base: number;
  logValue: number;
  naturalAntilog: number;
  commonAntilog: number;
  binaryAntilog: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { base: string; value: number; fill: string }[];
}

function calcAntilog(inputs: { logValue: string; base: string; decimalPlaces: number }): AntilogResult | null {
  const x = parseFloat(inputs.logValue);
  const b = parseFloat(inputs.base);
  if (isNaN(x) || isNaN(b)) return null;
  if (b <= 0 || b === 1) return null;

  const result = Math.pow(b, x);
  const naturalAntilog = Math.exp(x);
  const commonAntilog = Math.pow(10, x);
  const binaryAntilog = Math.pow(2, x);

  const dp = inputs.decimalPlaces;
  const r = (n: number) => parseFloat(n.toFixed(dp));

  const breakdown = [
    { label: "Antilog Result", value: `${r(result)}` },
    { label: "Log Value (x)", value: `${x}` },
    { label: "Base", value: `${b}` },
    { label: "Expression", value: `${b}^${x} = ${r(result)}` },
    { label: "Natural Antilog (eˣ)", value: `${r(naturalAntilog)}` },
    { label: "Common Antilog (10ˣ)", value: `${r(commonAntilog)}` },
    { label: "Binary Antilog (2ˣ)", value: `${r(binaryAntilog)}` },
    { label: "Decimal Places", value: `${dp}` },
  ];

  const summaryStats = [
    { label: "Result", value: `${r(result)}` },
    { label: "Base", value: `${b}` },
    { label: "Log Value", value: `${x}` },
    { label: "Natural (eˣ)", value: `${r(naturalAntilog)}` },
    { label: "Common (10ˣ)", value: `${r(commonAntilog)}` },
    { label: "Binary (2ˣ)", value: `${r(binaryAntilog)}` },
    { label: "Precision", value: `${dp} dp` },
    { label: "Expression", value: `${b}^${x}` },
  ];

  const chartData = [
    { base: `Base ${b}`, value: r(result), fill: "#3b82f6" },
    { base: "e (natural)", value: r(naturalAntilog), fill: "#10b981" },
    { base: "10 (common)", value: r(commonAntilog), fill: "#f97316" },
    { base: "2 (binary)", value: r(binaryAntilog), fill: "#8b5cf6" },
  ];

  return {
    result: r(result), base: b, logValue: x,
    naturalAntilog: r(naturalAntilog), commonAntilog: r(commonAntilog), binaryAntilog: r(binaryAntilog),
    breakdown, summaryStats, chartData,
  };
}

const DEFAULTS = {
  logValue: "2",
  base: "10",
  decimalPlaces: "6",
};

export default function AntilogCalculator() {
  const [logValue, setLogValue] = useState(DEFAULTS.logValue);
  const [base, setBase] = useState(DEFAULTS.base);
  const [decimalPlaces, setDecimalPlaces] = useState(DEFAULTS.decimalPlaces);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<AntilogResult | null>(null);

  const calculate = () => {
    setErrorMsg("");
    const x = parseFloat(logValue);
    const b = parseFloat(base);
    if (isNaN(x)) { setErrorMsg("Please enter a valid log value."); return; }
    if (isNaN(b)) { setErrorMsg("Please enter a valid base."); return; }
    if (b <= 0) { setErrorMsg("Base must be greater than 0."); return; }
    if (b === 1) { setErrorMsg("Base cannot be 1 (logarithm base 1 is undefined)."); return; }
    const dp = parseInt(decimalPlaces, 10);
    const dpVal = isNaN(dp) || dp < 0 || dp > 15 ? 6 : dp;
    const res = calcAntilog({ logValue, base, decimalPlaces: dpVal });
    if (!res) setErrorMsg("Unable to calculate. Please check your inputs.");
    else setResult(res);
  };

  const reset = () => {
    setLogValue(DEFAULTS.logValue); setBase(DEFAULTS.base); setDecimalPlaces(DEFAULTS.decimalPlaces);
    setErrorMsg(""); setShowAdvanced(false);
    setResult(calcAntilog({ logValue: DEFAULTS.logValue, base: DEFAULTS.base, decimalPlaces: 6 }));
  };

  useEffect(() => { setResult(calcAntilog({ logValue: DEFAULTS.logValue, base: DEFAULTS.base, decimalPlaces: 6 })); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is an antilog?", answer: "An antilog (antilogarithm) is the inverse operation of a logarithm. If log_b(y) = x, then the antilog is y = b^x. It finds the original number from its logarithmic value." },
    { question: "How do I calculate antilog?", answer: "To calculate the antilog, raise the base to the power of the log value. For common antilog (base 10), compute 10^x. For natural antilog (base e), compute e^x. For any other base b, compute b^x." },
    { question: "What is the difference between natural and common antilog?", answer: "Natural antilog uses Euler's number e (≈2.71828) as the base, written as eˣ or exp(x). Common antilog uses 10 as the base, written as 10ˣ. Natural antilog is common in calculus and continuous growth, while common antilog is used in engineering and scientific notation." },
    { question: "Why can't the base be 1 or negative?", answer: "A logarithm with base 1 is undefined because 1 raised to any power always equals 1, making it impossible to recover different values. Negative bases create inconsistent results because logarithms are only defined for positive bases in real number mathematics." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Antilog Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Antilog Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Log Value (x)</label>
                 <div className={inp}><input type="number" step="any" value={logValue} onChange={e => setLogValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} placeholder="e.g., 2" /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Base (b)</label>
                 <div className={inp}><input type="number" step="any" value={base} onChange={e => setBase(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} placeholder="e.g., 10" /></div>
              </div>
            </div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-primary font-medium flex items-center gap-1 self-start">
              Advanced Options <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Precision</div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Decimal Places</label>
                   <div className={inp}><input type="number" min="0" max="15" value={decimalPlaces} onChange={e => setDecimalPlaces(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />{errorMsg}
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Antilog Result</div>
                <div className="text-4xl font-extrabold tracking-tight text-primary">{result.result}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.base}^{result.logValue} = {result.result}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Natural (eˣ)", result.naturalAntilog], ["Common (10ˣ)", result.commonAntilog], ["Binary (2ˣ)", result.binaryAntilog]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Antilog Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-primary/5" : ""}`}>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Antilog Across Bases</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="base" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [v, "Value"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Antilog Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An antilog calculator is a mathematical tool that computes the antilogarithm — the inverse operation of taking a logarithm. If you have a logarithmic value x such that log_b(y) = x, the antilog recovers the original number y by computing b raised to the power of x. This operation is fundamental in fields that work with logarithmic scales, such as acoustics (decibels), seismology (Richter scale), chemistry (pH), and finance (compound interest). The calculator supports any positive base, with common bases being 10 (common logarithm), e ≈ 2.71828 (natural logarithm), and 2 (binary logarithm).</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The antilog is calculated using the formula: antilog = b^x, where b is the base and x is the logarithmic value. For the common antilog (base 10), this becomes 10^x. For the natural antilog, it is e^x, which equals exp(x) in most programming contexts. For a binary antilog, it is 2^x. The calculator also displays results across all three standard bases simultaneously so you can compare values. The base must be a positive number and cannot equal 1, because log base 1 is undefined — 1 raised to any power always yields 1, making it impossible to recover distinct original values. The precision setting controls how many decimal places are shown in the results.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result card shows the antilog value for your chosen base, along with the full expression (b^x = result). The 3-stat bar displays the natural, common, and binary antilogs of the same log value, allowing quick comparison across standard bases. The breakdown table lists all computed values including the expression form and precision setting. The bar chart visualizes how the same log value translates to different results depending on the base used. The summary statistics mirror the breakdown for quick reference. This tool is particularly useful when working with logarithmic transformations and needing to convert results back to the original scale.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/antilog-calculator" />
          <PopularCalculators exclude="/calculator/antilog-calculator" />
        </div>
      </div>
    </>
  );
}