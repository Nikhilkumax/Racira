"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  balance: number;
  termYears: number;
  age: number;
  mortgageRate: number;
  levelRatePerK: number; // monthly $ per $1,000 of coverage
  mlMultiplier: number; // mortgage life premium = level × this
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  levelMonthly: number;
  mlMonthly: number;
  levelTotal: number;
  mlTotal: number;
  difference: number;
  coverageMid: number;
  chartData: { label: string; level: number; declining: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Typical level term life monthly premium per $1,000 of coverage (non-smoker,
// preferred rates). Rough market averages used as editable starting points.
function defaultRatePerK(age: number): number {
  if (age <= 29) return 0.08;
  if (age <= 34) return 0.1;
  if (age <= 39) return 0.14;
  if (age <= 44) return 0.2;
  if (age <= 49) return 0.31;
  if (age <= 54) return 0.49;
  if (age <= 59) return 0.79;
  return 1.1;
}

// Remaining amortized mortgage balance after `years` of a `term`-year loan.
function remainingBalance(principal: number, annualRate: number, yearsElapsed: number, termYears: number): number {
  const i = annualRate / 100 / 12;
  const n = termYears * 12;
  const t = Math.round(yearsElapsed * 12);
  if (i <= 0) return Math.max(0, principal * (1 - t / n));
  const f1 = Math.pow(1 + i, n);
  const f2 = Math.pow(1 + i, t);
  return (principal * (f1 - f2)) / (f1 - 1);
}

function calc(inp: Inputs): Result {
  const termMonths = inp.termYears * 12;
  const levelMonthly = (inp.balance / 1000) * inp.levelRatePerK;
  const mlMonthly = (inp.balance / 1000) * inp.levelRatePerK * inp.mlMultiplier;
  const levelTotal = levelMonthly * termMonths;
  const mlTotal = mlMonthly * termMonths;
  const difference = mlTotal - levelTotal;

  const coverageMid = Math.round(remainingBalance(inp.balance, inp.mortgageRate, inp.termYears / 2, inp.termYears));

  const chartData: { label: string; level: number; declining: number }[] = [];
  for (let y = 0; y <= inp.termYears; y++) {
    if (y % 2 === 0 || y === inp.termYears) {
      chartData.push({
        label: y === 0 ? "Now" : "Yr " + y,
        level: Math.round(inp.balance),
        declining: Math.max(0, Math.round(remainingBalance(inp.balance, inp.mortgageRate, y, inp.termYears))),
      });
    }
  }

  const breakdown: Row[] = [
    { label: "Mortgage Balance", value: money(inp.balance), sum: true },
    { label: "Mortgage Term", value: inp.termYears + " years" },
    { label: "Your Age", value: String(inp.age) },
    { label: "Mortgage Interest Rate (for coverage curve)", value: inp.mortgageRate.toFixed(2) + "%" },
    { label: "Level Term Premium", value: money2(levelMonthly) + "/mo", highlight: true, sum: true },
    { label: "Mortgage Life Premium", value: money2(mlMonthly) + "/mo", highlight: true, sum: true },
    { label: "Coverage — Level Term", value: "Flat " + money(inp.balance) + " for full term", sum: true },
    { label: "Coverage — Mortgage Life", value: "Declines with remaining balance", sum: true },
    { label: "Coverage at Halfway Point", value: "Level: " + money(inp.balance) + " · Mortgage life: ~" + money(coverageMid) },
    { label: "Total Cost — Level Term", value: money(levelTotal), isTotal: true, sum: true },
    { label: "Total Cost — Mortgage Life", value: money(mlTotal), isTotal: true, sum: true },
    { label: "Extra Cost of Mortgage Life", value: money(difference), highlight: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    levelMonthly,
    mlMonthly,
    levelTotal,
    mlTotal,
    difference,
    coverageMid,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { balance: 300000, termYears: 30, age: 40, mortgageRate: 6.5, levelRatePerK: 0.2, mlMultiplier: 2.2 };

export default function MortgageLifeInsuranceVsTermLifeComparison() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [mortgageRate, setMortgageRate] = useState(String(DEFAULTS.mortgageRate));
  const [levelRatePerK, setLevelRatePerK] = useState(String(DEFAULTS.levelRatePerK));
  const [mlMultiplier, setMlMultiplier] = useState(String(DEFAULTS.mlMultiplier));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    termYears: parseInt(termYears) || 0,
    age: parseInt(age) || 0,
    mortgageRate: parseFloat(mortgageRate) || 0,
    levelRatePerK: parseFloat(levelRatePerK) || 0,
    mlMultiplier: parseFloat(mlMultiplier) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setTermYears(String(DEFAULTS.termYears));
    setAge(String(DEFAULTS.age));
    setMortgageRate(String(DEFAULTS.mortgageRate));
    setLevelRatePerK(String(DEFAULTS.levelRatePerK));
    setMlMultiplier(String(DEFAULTS.mlMultiplier));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const bal = parseFloat(balance) || 0;
  const yrs = parseInt(termYears) || 0;
  const ag = parseInt(age) || 0;
  const rt = parseFloat(mortgageRate) || 0;
  const lr = parseFloat(levelRatePerK) || 0;
  const mult = parseFloat(mlMultiplier) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Mortgage balance must be greater than $0";
  if (isNaN(yrs) || yrs < 5 || yrs > 40) valErrors.termYears = "Term must be 5–40 years";
  if (isNaN(ag) || ag < 18 || ag > 75) valErrors.age = "Age must be 18–75";
  if (mortgageRate === "" || isNaN(parseFloat(mortgageRate))) valErrors.mortgageRate = "Enter an interest rate";
  else if (rt < 0 || rt > 20) valErrors.mortgageRate = "Interest rate must be between 0% and 20%";
  if (levelRatePerK === "" || isNaN(parseFloat(levelRatePerK))) valErrors.levelRatePerK = "Enter a level term rate";
  else if (lr <= 0 || lr > 10) valErrors.levelRatePerK = "Rate must be between 0 and $10 per $1,000";
  if (mlMultiplier === "" || isNaN(parseFloat(mlMultiplier))) valErrors.mlMultiplier = "Enter a multiplier";
  else if (mult < 1 || mult > 10) valErrors.mlMultiplier = "Multiplier must be between 1× and 10×";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Life Insurance vs Term Life Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Life Insurance vs Term Life Comparison</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mt-balance" className="text-sm font-medium mb-1 block">Mortgage Balance ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="mt-balance" type="number" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}
              </div>
              <div>
                <label htmlFor="mt-term" className="text-sm font-medium mb-1 block">Mortgage Term (Years)</label>
                <div className={inputCls}>
                  <input id="mt-term" type="number" min="5" max="40" value={termYears} onChange={(e) => setTermYears(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">yrs</span>
                </div>
                {valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mt-age" className="text-sm font-medium mb-1 block">Your Age</label>
                <div className={inputCls}>
                  <input id="mt-age" type="number" min="18" max="75" value={age} onChange={(e) => setAge(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">yrs</span>
                </div>
                {valErrors.age && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.age}</p>}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Level term quotes are seeded from typical non-smoker rates for your age — override them in Advanced Options with your own quotes.
                </p>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Premium Assumptions</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="mt-rate" className="text-sm font-medium mb-1 block">Mortgage Interest Rate (%)</label>
                      <div className={inputCls}>
                        <input id="mt-rate" type="number" min="0" max="20" step="0.1" value={mortgageRate} onChange={(e) => setMortgageRate(e.target.value)} className={fieldCls} />
                        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                      </div>
                      {valErrors.mortgageRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.mortgageRate}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">Only shapes the mortgage-life coverage curve (declining benefit).</p>
                    </div>
                    <div>
                      <label htmlFor="mt-levelrate" className="text-sm font-medium mb-1 block">Level Term Rate ($ / month per $1,000)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="mt-levelrate" type="number" min="0.01" max="10" step="0.01" value={levelRatePerK} onChange={(e) => setLevelRatePerK(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.levelRatePerK && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.levelRatePerK}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">Typical rate at age {ag || 40}: ${defaultRatePerK(ag || 40).toFixed(2)}/mo per $1,000. Replace with your real quote.</p>
                    </div>
                    <div>
                      <label htmlFor="mt-mult" className="text-sm font-medium mb-1 block">Mortgage Life Premium Multiplier</label>
                      <div className={inputCls}>
                        <input id="mt-mult" type="number" min="1" max="10" step="0.1" value={mlMultiplier} onChange={(e) => setMlMultiplier(e.target.value)} className={fieldCls} />
                        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">× level rate</span>
                      </div>
                      {valErrors.mlMultiplier && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.mlMultiplier}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">Lender-sold mortgage life insurance typically costs 2–3× a level term policy.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Cost — Level Term Life</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money(result.levelTotal)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    vs {money(result.mlTotal)} for mortgage life — buying term saves {money(result.difference)} over {termYears || "30"} years
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Level Term", money2(result.levelMonthly) + "/mo", "text-primary"],
                    ["Mortgage Life", money2(result.mlMonthly) + "/mo", "text-amber-600"],
                    ["You Save", money2(result.mlMonthly - result.levelMonthly) + "/mo", "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Coverage Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <Tooltip formatter={(v: number, name: string) => [name === "level" ? "Level term" : "Mortgage life", "$" + Math.round(v).toLocaleString("en-US")]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="level" name="Level term coverage" stroke="#2563eb" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="declining" name="Mortgage life coverage" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Mortgage life pays only the remaining balance, which shrinks to $0 — level term keeps the full benefit for your family for the entire term.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {result.breakdown.map((r, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                          <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
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
            <h2 className="text-2xl font-bold mb-3">Same Goal, Very Different Products</h2>
            <p>Mortgage life insurance and term life both protect your family from your mortgage if you die — but they are priced and shaped differently. Lender-sold mortgage life pays only the remaining loan balance, so the benefit shrinks toward zero as you pay down the mortgage, yet its premium is typically two to three times what a level term policy costs for the same initial coverage. A level term policy keeps a flat death benefit for the whole term, costs far less per dollar of coverage, and pays your beneficiaries directly, who can then settle the mortgage or use the money however they need. This comparison uses typical non-smoker term rates by age with a standard 2.2× mortgage-life markup — replace both with real quotes for an accurate decision.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is the difference between mortgage life and term life insurance?", answer: "Mortgage life (credit life) is sold by lenders and pays only the remaining mortgage balance to the lender if you die. Term life pays a flat death benefit to your beneficiaries. The benefit on mortgage life declines as your balance amortizes, while term coverage stays level for the full term." },
            { question: "Is mortgage life insurance more expensive than term life?", answer: "Almost always, per dollar of coverage. Lender-sold mortgage life premiums commonly run 2–3× a level term policy for the same starting coverage — and the term policy keeps paying a full benefit even after your mortgage balance has fallen." },
            { question: "Should I buy mortgage protection from my lender?", answer: "Usually not without comparing. The calculator's default assumptions show a typical spread: on a $300,000 30-year mortgage at age 40, level term costs about $60/mo for a flat $300,000 benefit, while mortgage life at 2.2× costs roughly $132/mo for a benefit that declines to zero. Qualifying for term life requires a medical exam; if health issues make that hard, guaranteed-issue mortgage life may be the practical fallback." },
          ]} pageUrl="https://racira.com/calculator/mortgage-life-insurance-vs-term-life-comparison" />
          <PopularCalculators exclude="/calculator/mortgage-life-insurance-vs-term-life-comparison" />
        </div>
      </div>
    </>
  );
}
