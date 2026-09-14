"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";

interface Inputs {
  balance: number;
  currentRate: number;
  remainingYears: number;
  newRate: number;
  newTermYears: number;
  closingCosts: number;
}

interface Result {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  breakEvenMonths: number;
  interestKeep: number;
  interestNew: number;
  interestSaved: number;
  totalNewPayments: number;
  chartData: { year: string; cumulativeSavings: number; costs: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(principal: number, r: number, n: number): number {
  if (r <= 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

function calc(inp: Inputs): Result {
  const nKeep = inp.remainingYears * 12;
  const nNew = inp.newTermYears * 12;

  const currentPayment = pmt(inp.balance, inp.currentRate / 100 / 12, nKeep);
  const newPayment = pmt(inp.balance, inp.newRate / 100 / 12, nNew);
  const monthlySavings = currentPayment - newPayment;

  const totalKeep = currentPayment * nKeep;
  const totalNew = newPayment * nNew;
  const interestKeep = Math.max(0, totalKeep - inp.balance);
  const interestNew = Math.max(0, totalNew - inp.balance);
  const interestSaved = interestKeep - interestNew;

  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(inp.closingCosts / monthlySavings) : Infinity;

  const years = Math.max(nKeep, nNew) / 12;
  const maxYears = Math.min(Math.ceil(years), 40);
  const chartData: { year: string; cumulativeSavings: number; costs: number }[] = [];
  let cumSavings = 0;
  for (let y = 1; y <= maxYears; y++) {
    cumSavings += monthlySavings * 12;
    chartData.push({
      year: "Yr " + y,
      cumulativeSavings: Math.round(Math.max(0, cumSavings)),
      costs: Math.round(inp.closingCosts),
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Balance", value: fmt(inp.balance) },
    { label: "Current Rate / Remaining Term", value: inp.currentRate + "% / " + inp.remainingYears + " yrs" },
    { label: "Current Monthly Payment", value: fmtD(currentPayment) },
    { label: "New Rate / New Term", value: inp.newRate + "% / " + inp.newTermYears + " yrs" },
    { label: "New Monthly Payment", value: fmtD(newPayment), highlight: true },
    { label: "Monthly Savings (or Cost)", value: (monthlySavings >= 0 ? "" : "−") + fmtD(Math.abs(monthlySavings)) + "/mo", highlight: true },
    { label: "Closing Costs", value: fmt(inp.closingCosts) },
    { label: "Break-Even Point", value: breakEvenMonths === Infinity ? "N/A" : breakEvenMonths + " months", highlight: breakEvenMonths !== Infinity },
    { label: "Interest if You Keep Current Loan", value: fmt(interestKeep) },
    { label: "Interest on New Loan", value: fmt(interestNew) },
    { label: "Interest Saved by Refinancing", value: fmt(Math.max(0, interestSaved)), isTotal: true },
    { label: "Total Paid on New Loan", value: fmt(totalNew), isTotal: true },
  ];

  const summaryStats = [
    { label: "New Payment", value: fmtD(newPayment) },
    { label: "Monthly Savings", value: (monthlySavings >= 0 ? "" : "−") + fmtD(Math.abs(monthlySavings)) },
    { label: "Break-Even", value: breakEvenMonths === Infinity ? "N/A" : breakEvenMonths + " months" },
    { label: "Interest Saved", value: fmt(Math.max(0, interestSaved)) },
    { label: "Current Interest Remaining", value: fmt(interestKeep) },
    { label: "New Loan Interest", value: fmt(interestNew) },
    { label: "Closing Costs", value: fmt(inp.closingCosts) },
    { label: "Total on New Loan", value: fmt(totalNew) },
  ];

  return { currentPayment, newPayment, monthlySavings, breakEvenMonths, interestKeep, interestNew, interestSaved, totalNewPayments: totalNew, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { balance: 250000, currentRate: 6.5, remainingYears: 20, newRate: 5.5, newTermYears: 20, closingCosts: 6000 };

export default function LoanRefinanceSavingsCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [remainingYears, setRemainingYears] = useState(String(DEFAULTS.remainingYears));
  const [newRate, setNewRate] = useState(String(DEFAULTS.newRate));
  const [newTermYears, setNewTermYears] = useState(String(DEFAULTS.newTermYears));
  const [closingCosts, setClosingCosts] = useState(String(DEFAULTS.closingCosts));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    currentRate: parseFloat(currentRate) || 0,
    remainingYears: parseInt(remainingYears) || 1,
    newRate: parseFloat(newRate) || 0,
    newTermYears: parseInt(newTermYears) || 1,
    closingCosts: parseFloat(closingCosts) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setCurrentRate(String(DEFAULTS.currentRate));
    setRemainingYears(String(DEFAULTS.remainingYears));
    setNewRate(String(DEFAULTS.newRate));
    setNewTermYears(String(DEFAULTS.newTermYears));
    setClosingCosts(String(DEFAULTS.closingCosts));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const bal = parseFloat(balance) || 0;
  const curR = parseFloat(currentRate) || 0;
  const remY = parseInt(remainingYears) || 0;
  const newR = parseFloat(newRate) || 0;
  const newY = parseInt(newTermYears) || 0;
  const costs = parseFloat(closingCosts) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Loan balance must be greater than $0";
  if (!currentRate || curR <= 0) valErrors.currentRate = "Current rate must be greater than 0%";
  else if (curR > 25) valErrors.currentRate = "Current rate must be 25% or less";
  if (!remainingYears || remY <= 0) valErrors.remainingYears = "Remaining term must be greater than 0 years";
  else if (remY > 40) valErrors.remainingYears = "Remaining term must be 40 years or less";
  if (!newRate || newR <= 0) valErrors.newRate = "New rate must be greater than 0%";
  else if (newR > 25) valErrors.newRate = "New rate must be 25% or less";
  if (!newTermYears || newY <= 0) valErrors.newTermYears = "New term must be greater than 0 years";
  else if (newY > 40) valErrors.newTermYears = "New term must be 40 years or less";
  if (costs < 0) valErrors.closingCosts = "Closing costs must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Refinance Savings Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Refinance Savings Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={c} /></div>{valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Current Rate (%)</label><div className={i}><input type="number" value={currentRate} onChange={e => setCurrentRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.currentRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.currentRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Remaining Term (Years)</label><div className={i}><input type="number" value={remainingYears} onChange={e => setRemainingYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.remainingYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.remainingYears}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">New Rate (%)</label><div className={i}><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.newRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.newRate}</p>}</div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Closing Costs &amp; Term</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium mb-1 block">New Loan Term (Years)</label><div className={i}><input type="number" value={newTermYears} onChange={e => setNewTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.newTermYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.newTermYears}</p>}</div>
                    <div><label className="text-sm font-medium mb-1 block">Closing Costs ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={closingCosts} onChange={e => setClosingCosts(e.target.value)} className={c} /></div>{valErrors.closingCosts && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.closingCosts}</p>}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated New Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.newPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{bal.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} at {newRate}% for {newTermYears} years — was {result.currentPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Savings", (result.monthlySavings >= 0 ? "" : "−") + "$" + Math.round(Math.abs(result.monthlySavings)).toLocaleString("en-US") + "/mo", result.monthlySavings >= 0 ? "text-emerald-600" : "text-red-500"],
                ["Break-Even Point", result.breakEvenMonths === Infinity ? "N/A" : result.breakEvenMonths + " months", result.breakEvenMonths !== Infinity && result.breakEvenMonths <= remY * 12 ? "text-foreground" : "text-red-500"],
                ["Interest Saved", "$" + Math.round(Math.max(0, result.interestSaved)).toLocaleString("en-US"), "text-primary"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cumulative Savings vs Closing Costs</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "cumulativeSavings" ? "Cumulative Savings" : "Closing Costs", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "cumulativeSavings" ? "Cumulative Savings" : "Closing Costs")} />
                  <ReferenceLine y={costs} stroke="#ef4444" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="cumulativeSavings" name="cumulativeSavings" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="costs" name="costs" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">The green line crosses the red cost line at your break-even point — after that, refinancing is ahead. If it never crosses, the savings never cover the closing costs within these terms.</p>
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
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Is Refinancing Worth It?</h2>
          <p>Refinancing makes sense when the interest saved outweighs the closing costs within the time you expect to keep the loan. Divide your closing costs by the monthly savings to find the break-even month — the point where the new loan starts paying for itself. Because extending the term lowers the payment but adds interest months, this calculator compares interest over the full new term against the interest remaining on your current loan, so a lower payment stretched over more years is exposed honestly.</p>
        </section>
        <FAQSection faqs={[
          { question: "How do I find my break-even point?", answer: "Divide total closing costs by your monthly savings. For example, $6,000 in costs with $300/mo saved means a 20-month break-even — refinancing pays off if you keep the loan past month 20." },
          { question: "Should I refinance into a longer term?", answer: "A longer term lowers the monthly payment but adds interest. This calculator compares total interest on the new term against the interest remaining on your current loan, so you can see the true trade-off rather than just the payment." },
          { question: "What closing costs count?", answer: "Include lender fees, appraisal, title insurance, recording fees, and points. Some lenders offer no-closing-cost refinances by rolling fees into a higher rate — compare the total cost, not just the payment." },
        ]} pageUrl="https://racira.com/calculator/loan-refinance-savings-calculator" />
        <PopularCalculators exclude="/calculator/loan-refinance-savings-calculator" />
      </div>
    </div>
  </>);
}
