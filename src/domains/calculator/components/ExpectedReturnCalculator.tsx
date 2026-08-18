"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ExpectedReturnResult {
  optReturn: number;
  optProb: number;
  baseReturn: number;
  baseProb: number;
  pessReturn: number;
  pessProb: number;
  expected: number;
  stdDev: number;
  bestCase: number;
  worstCase: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function calcExpected(optReturn: number, optProb: number, baseReturn: number, baseProb: number, pessReturn: number, pessProb: number): ExpectedReturnResult {
  const expected = (optProb / 100) * optReturn + (baseProb / 100) * baseReturn + (pessProb / 100) * pessReturn;
  const variance = (optProb / 100) * Math.pow(optReturn - expected, 2) + (baseProb / 100) * Math.pow(baseReturn - expected, 2) + (pessProb / 100) * Math.pow(pessReturn - expected, 2);
  const stdDev = Math.sqrt(variance);

  const breakdown = [
    { label: "Optimistic Scenario", value: `${fmtPct(optReturn)} at ${optProb}% probability` },
    { label: "Base Scenario", value: `${fmtPct(baseReturn)} at ${baseProb}% probability` },
    { label: "Pessimistic Scenario", value: `${fmtPct(pessReturn)} at ${pessProb}% probability` },
    { label: "Expected Return E(R)", value: fmtPct(expected) },
    { label: "Standard Deviation (risk)", value: `${stdDev.toFixed(2)}%` },
    { label: "Best Case Outcome", value: fmtPct(optReturn) },
    { label: "Worst Case Outcome", value: fmtPct(pessReturn) },
    { label: "Probability Range", value: `${pessProb}% – ${optProb}%` },
  ];
  const summaryStats = [
    { label: "Expected Return", value: fmtPct(expected) },
    { label: "Std Deviation", value: `${stdDev.toFixed(2)}%` },
    { label: "Variance", value: `${variance.toFixed(2)}%²` },
    { label: "Best Case", value: fmtPct(optReturn) },
    { label: "Worst Case", value: fmtPct(pessReturn) },
    { label: "Optimistic Odds", value: `${optProb}%` },
    { label: "Base Odds", value: `${baseProb}%` },
    { label: "Pessimistic Odds", value: `${pessProb}%` },
  ];
  const chartData = [
    { name: "Optimistic", value: Math.round(optProb), fill: "hsl(var(--primary))" },
    { name: "Base", value: Math.round(baseProb), fill: "#8b5cf6" },
    { name: "Pessimistic", value: Math.round(pessProb), fill: "#f59e0b" },
  ];
  return { optReturn, optProb, baseReturn, baseProb, pessReturn, pessProb, expected, stdDev, bestCase: optReturn, worstCase: pessReturn, breakdown, summaryStats, chartData };
}

const DEFAULTS = { optR: "20", optP: "25", baseR: "8", baseP: "50", pessR: "-10", pessP: "25" };

export default function ExpectedReturnCalculator() {
  const [optR, setOptR] = useState(DEFAULTS.optR);
  const [optP, setOptP] = useState(DEFAULTS.optP);
  const [baseR, setBaseR] = useState(DEFAULTS.baseR);
  const [baseP, setBaseP] = useState(DEFAULTS.baseP);
  const [pessR, setPessR] = useState(DEFAULTS.pessR);
  const [pessP, setPessP] = useState(DEFAULTS.pessP);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<ExpectedReturnResult | null>(null);

  const or = parseFloat(optR) || 0;
  const op = parseFloat(optP) || 0;
  const br = parseFloat(baseR) || 0;
  const bp = parseFloat(baseP) || 0;
  const pr = parseFloat(pessR) || 0;
  const pp = parseFloat(pessP) || 0;
  const totalP = op + bp + pp;
  const errs: string[] = [];
  if (op < 0 || bp < 0 || pp < 0) errs.push("Probabilities cannot be negative.");
  if (Math.abs(totalP - 100) > 0.01) errs.push("Probabilities must sum to 100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcExpected(or, op, br, bp, pr, pp)); };
  const reset = () => {
    setOptR(DEFAULTS.optR); setOptP(DEFAULTS.optP); setBaseR(DEFAULTS.baseR); setBaseP(DEFAULTS.baseP); setPessR(DEFAULTS.pessR); setPessP(DEFAULTS.pessP);
    setResult(calcExpected(20, 25, 8, 50, -10, 25));
  };
  useEffect(() => { setResult(calcExpected(20, 25, 8, 50, -10, 25)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is expected return?", answer: "Expected return is the probability-weighted average of all possible outcomes: E(R) = Σ pᵢ × rᵢ. It is the long-run average you would earn if the scenarios repeated many times." },
    { question: "What does standard deviation tell me?", answer: "Standard deviation measures how far individual outcomes spread around the expected return — the larger it is, the riskier the investment." },
    { question: "Can I add more scenarios?", answer: "This calculator models three scenarios, which is enough for most planning. More scenarios follow the same formula — weight each return by its probability and sum." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Expected Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Expected Return Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Base Scenario Return</label>
                <div className={inp}><input type="number" value={baseR} onChange={e => setBaseR(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Base Probability</label>
                <div className={inp}><input type="number" value={baseP} onChange={e => setBaseP(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Optimistic Return</label>
                <div className={inp}><input type="number" value={optR} onChange={e => setOptR(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Optimistic Probability</label>
                <div className={inp}><input type="number" value={optP} onChange={e => setOptP(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Additional Scenario</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Pessimistic Return</label>
                      <div className={inp}><input type="number" value={pessR} onChange={e => setPessR(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Pessimistic Probability</label>
                      <div className={inp}><input type="number" value={pessP} onChange={e => setPessP(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Expected Return</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtPct(result.expected)}</div>
                <div className="text-sm text-muted-foreground mt-1">Weighted across {result.baseProb}% base · {result.optProb}% optimistic · {result.pessProb}% pessimistic</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Standard Deviation`, `${result.stdDev.toFixed(2)}%`], ["Best Case", fmtPct(result.bestCase)], ["Worst Case", fmtPct(result.worstCase)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Scenario Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Probability Weights</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => [`${v}%`, "Probability"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Weights sum to 100%</p>
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
            <h2 className="text-2xl font-bold mb-3">Weighted-Average Expected Return</h2>
            <p>This <strong>expected return calculator</strong> applies the standard portfolio-theory formula: E(R) = Σ pᵢ × rᵢ. Each scenario's return is weighted by its probability and summed. Probabilities must total 100% — the calculator enforces this before computing.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring Risk</h2>
            <p>Expected return alone ignores dispersion. The standard deviation of outcomes — the square root of the probability-weighted squared deviations from the mean — quantifies how far actual results may land from the expectation. A higher standard deviation means a wider range of possible outcomes.</p>
            <h2 className="text-2xl font-bold mb-3">Using the Result</h2>
            <p>Compare expected returns across investments only after adjusting for risk: two investments with the same expected return but different standard deviations have different utility. Pair this with your risk tolerance and time horizon.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/expected-return-calculator" />
          <PopularCalculators exclude="/calculator/expected-return-calculator" />
        </div>
      </div>
    </>
  );
}
