"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HardMoneyResult {
  principal: number;
  rate: number;
  months: number;
  points: number;
  monthlyPayment: number;
  pointsCost: number;
  totalInterest: number;
  totalCost: number;
  balloon: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function calcHardMoney(principal: number, rate: number, months: number, points: number): HardMoneyResult {
  const monthlyPayment = principal * (rate / 100 / 12);
  const pointsCost = principal * (points / 100);
  const totalInterest = monthlyPayment * months;
  const totalCost = pointsCost + totalInterest;
  const balloon = principal;

  const breakdown = [
    { label: "Loan Amount", value: fmt$(principal) },
    { label: "Interest Rate", value: `${rate}% APR (interest-only)` },
    { label: "Term", value: `${months} months` },
    { label: "Origination Points", value: `${points}% → ${fmt$(pointsCost)}` },
    { label: "Monthly Payment", value: fmt$(monthlyPayment) },
    { label: "Total Interest Paid", value: fmt$(totalInterest) },
    { label: "Total Cost (points + interest)", value: fmt$(totalCost) },
    { label: "Balloon Payment at Maturity", value: fmt$(balloon) },
  ];
  const summaryStats = [
    { label: "Monthly Payment", value: fmt$(monthlyPayment) },
    { label: "Total Cost", value: fmt$(totalCost) },
    { label: "Interest Paid", value: fmt$(totalInterest) },
    { label: "Points", value: fmt$(pointsCost) },
    { label: "Balloon", value: fmt$(balloon) },
    { label: "APR", value: `${rate}%` },
    { label: "Term", value: `${months} mo` },
    { label: "Cost as % of Loan", value: `${((totalCost / principal) * 100).toFixed(1)}%` },
  ];
  const chartData = [
    { name: "Principal", value: Math.round(principal), fill: "hsl(var(--primary))" },
    { name: "Interest", value: Math.round(totalInterest), fill: "#f59e0b" },
    { name: "Points", value: Math.round(pointsCost), fill: "#ef4444" },
  ];
  return { principal, rate, months, points, monthlyPayment, pointsCost, totalInterest, totalCost, balloon, breakdown, summaryStats, chartData };
}

const DEFAULTS = { principal: "250000", rate: "10", months: "12", points: "3" };

export default function HardMoneyLoanCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [points, setPoints] = useState(DEFAULTS.points);
  const [result, setResult] = useState<HardMoneyResult | null>(null);

  const pr = parseFloat(principal) || 0;
  const rt = parseFloat(rate) || 0;
  const mo = parseInt(months) || 0;
  const pt = parseFloat(points) || 0;
  const errs: string[] = [];
  if (pr <= 0) errs.push("Loan amount must be greater than 0.");
  if (rt <= 0 || rt > 50) errs.push("Interest rate must be between 0% and 50%.");
  if (mo < 1 || mo > 60) errs.push("Term must be 1–60 months.");
  if (pt < 0 || pt > 20) errs.push("Points must be between 0% and 20%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHardMoney(pr, rt, mo, pt)); };
  const reset = () => {
    setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setMonths(DEFAULTS.months); setPoints(DEFAULTS.points);
    setResult(calcHardMoney(250000, 10, 12, 3));
  };
  useEffect(() => { setResult(calcHardMoney(250000, 10, 12, 3)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a hard money loan?", answer: "A short-term, asset-backed loan from a private lender, used mainly by house flippers and developers who can't get bank financing quickly. Rates run 8–15% with 1–5 points upfront." },
    { question: "Why are payments interest-only?", answer: "Hard money is bridging capital: the borrower expects to refinance or sell within months. Interest-only payments keep monthly carrying costs low, with the full principal due as a balloon at maturity." },
    { question: "What are points?", answer: "Points are upfront fees — 1 point is 1% of the loan amount. Three points on a $250,000 loan costs $7,500 before any interest, so points materially raise the effective cost of short-term loans." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Hard Money Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hard Money Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Loan Amount</label>
                <div className={inp}><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Interest Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Term</label>
                <div className={inp}><input type="number" value={months} onChange={e => setMonths(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">months</span></div>
              </div>
              <div>
                <label className={lbl}>Origination Points</label>
                <div className={inp}><input type="number" step="0.5" value={points} onChange={e => setPoints(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment (Interest-Only)</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.monthlyPayment)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt$(result.principal)} at {result.rate}% · {result.months} months · {fmt$(result.totalCost)} total cost</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Total Interest`, fmt$(result.totalInterest)], ["Points Cost", fmt$(result.pointsCost)], ["Balloon at Maturity", fmt$(result.balloon)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Cost Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Where the Money Goes</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Principal, interest, and points on the loan</p>
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
            <h2 className="text-2xl font-bold mb-3">How Hard Money Loans Work</h2>
            <p>This <strong>hard money loan calculator</strong> models the standard structure: an interest-only monthly payment at the stated rate, an upfront points fee, and the full principal due as a balloon at maturity. Borrowers typically refinance or sell the property before the term ends.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Cost Adds Up Fast</h2>
            <p>At 10% with 3 points, a $250,000, 12-month loan costs $32,500 — a 13% cost of capital for the year. Because the term is short, points dominate: they amortize over only 12 months rather than 30 years.</p>
            <h2 className="text-2xl font-bold mb-3">When It Makes Sense</h2>
            <p>Hard money suits flips and bridge situations where speed outweighs cost. Run the numbers before committing: the exit must cover the interest, points, and rehab budget, or the spread disappears.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hard-money-loan-calculator" />
          <PopularCalculators exclude="/calculator/hard-money-loan-calculator" />
        </div>
      </div>
    </>
  );
}
