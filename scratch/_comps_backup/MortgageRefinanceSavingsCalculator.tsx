"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  currentBalance: number;
  currentRate: number;
  currentTerm: number;
  newRate: number;
  newTerm: number;
  closingCosts: number;
  cashOut: number;
}

interface Result {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  totalInterestCurrent: number;
  totalInterestNew: number;
  totalSavings: number;
  breakEvenMonths: number;
  netSavings5yr: number;
  netSavings10yr: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; cumSavings: number; cumCosts: number }[];
}

function calc(inp: Inputs): Result {
  const r1 = inp.currentRate / 100 / 12;
  const r2 = inp.newRate / 100 / 12;
  const n1 = inp.currentTerm * 12;
  const n2 = inp.newTerm * 12;
  const newLoanAmount = inp.currentBalance + inp.cashOut;

  const currentPayment = r1 > 0 ? (inp.currentBalance * r1 * Math.pow(1 + r1, n1)) / (Math.pow(1 + r1, n1) - 1) : inp.currentBalance / n1;
  const newPayment = r2 > 0 ? (newLoanAmount * r2 * Math.pow(1 + r2, n2)) / (Math.pow(1 + r2, n2) - 1) : newLoanAmount / n2;

  const monthlySavings = currentPayment - newPayment;
  const totalInterestCurrent = currentPayment * n1 - inp.currentBalance;
  const totalInterestNew = newPayment * n2 - newLoanAmount;
  const totalSavings = totalInterestCurrent - totalInterestNew - inp.closingCosts;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(inp.closingCosts / monthlySavings) : Infinity;

  const netSavings5yr = monthlySavings * 60 - inp.closingCosts;
  const netSavings10yr = monthlySavings * 120 - inp.closingCosts;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Current Balance", value: fmt(inp.currentBalance) },
    { label: "Current Rate", value: inp.currentRate + "%/yr" },
    { label: "Current Term Remaining", value: inp.currentTerm + " years" },
    { label: "Current Monthly Payment", value: "$" + fmtD(currentPayment) },
    { label: "New Rate", value: inp.newRate + "%/yr" },
    { label: "New Term", value: inp.newTerm + " years" },
    { label: "New Loan Amount", value: fmt(newLoanAmount) },
    { label: "New Monthly Payment", value: "$" + fmtD(newPayment), highlight: true },
    { label: "Monthly Savings", value: "$" + fmtD(Math.abs(monthlySavings)), highlight: true },
    { label: "Closing Costs", value: fmt(inp.closingCosts) },
    { label: "Cash-Out Amount", value: fmt(inp.cashOut) },
    { label: "Break-Even Point", value: breakEvenMonths === Infinity ? "Never" : breakEvenMonths + " months", highlight: true },
    { label: "Net Savings", value: (totalSavings >= 0 ? "" : "-") + fmt(Math.abs(totalSavings)), highlight: true },
  ];

  const summaryStats = [
    { label: "Current Payment", value: "$" + fmtD(currentPayment) + "/mo" },
    { label: "New Payment", value: "$" + fmtD(newPayment) + "/mo" },
    { label: "Monthly Savings", value: "$" + fmtD(Math.abs(monthlySavings)) + "/mo" },
    { label: "Closing Costs", value: fmt(inp.closingCosts) },
    { label: "Break-Even", value: breakEvenMonths === Infinity ? "N/A" : breakEvenMonths + " months" },
    { label: "Net Savings (Total)", value: (totalSavings >= 0 ? "" : "-") + fmt(Math.abs(totalSavings)) },
    { label: "Net Savings (5yr)", value: (netSavings5yr >= 0 ? "" : "-") + fmt(Math.abs(netSavings5yr)) },
    { label: "Net Savings (10yr)", value: (netSavings10yr >= 0 ? "" : "-") + fmt(Math.abs(netSavings10yr)) },
  ];

  // Year-by-year cumulative savings
  const chartData: { year: string; cumSavings: number; cumCosts: number }[] = [];
  const maxYears = Math.max(inp.currentTerm, inp.newTerm);
  let cumSavings = -inp.closingCosts;
  for (let yr = 1; yr <= Math.min(maxYears, 30); yr++) {
    cumSavings += monthlySavings * 12;
    chartData.push({ year: "Yr " + yr, cumSavings: Math.round(cumSavings), cumCosts: Math.round(inp.closingCosts) });
  }

  return { currentPayment, newPayment, monthlySavings, totalInterestCurrent, totalInterestNew, totalSavings, breakEvenMonths, netSavings5yr, netSavings10yr, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { currentBalance: 320000, currentRate: 6.8, currentTerm: 26, newRate: 5.5, newTerm: 30, closingCosts: 4500, cashOut: 0 };

export default function MortgageRefinanceSavingsCalculator() {
  const [currentBalance, setCurrentBalance] = useState(String(DEFAULTS.currentBalance));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [currentTerm, setCurrentTerm] = useState(String(DEFAULTS.currentTerm));
  const [newRate, setNewRate] = useState(String(DEFAULTS.newRate));
  const [newTerm, setNewTerm] = useState(String(DEFAULTS.newTerm));
  const [closingCosts, setClosingCosts] = useState(String(DEFAULTS.closingCosts));
  const [cashOut, setCashOut] = useState(String(DEFAULTS.cashOut));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    currentBalance: parseFloat(currentBalance) || 0,
    currentRate: parseFloat(currentRate) || 0,
    currentTerm: parseInt(currentTerm) || 30,
    newRate: parseFloat(newRate) || 0,
    newTerm: parseInt(newTerm) || 30,
    closingCosts: parseFloat(closingCosts) || 0,
    cashOut: parseFloat(cashOut) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setCurrentBalance(String(DEFAULTS.currentBalance));
    setCurrentRate(String(DEFAULTS.currentRate));
    setCurrentTerm(String(DEFAULTS.currentTerm));
    setNewRate(String(DEFAULTS.newRate));
    setNewTerm(String(DEFAULTS.newTerm));
    setClosingCosts(String(DEFAULTS.closingCosts));
    setCashOut(String(DEFAULTS.cashOut));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "When does refinancing make sense?", answer: "Refinancing typically makes sense when you can reduce your interest rate by at least 0.75–1%, plan to stay in the home past the break-even point, and have good credit. The general rule: if monthly savings × months you'll stay > closing costs, refinance." },
    { question: "What are typical refinancing costs?", answer: "Closing costs for a refinance range from 2–5% of the loan amount. On a $300,000 loan, expect $6,000–$15,000 in costs including origination fees, appraisal, title insurance, and recording fees. Some lenders offer no-closing-cost refinances with slightly higher rates." },
    { question: "How long until refinancing pays for itself?", answer: "The break-even point = closing costs ÷ monthly savings. If closing costs are $4,500 and you save $200/month, break-even is 22.5 months. If you plan to stay in the home longer than that, refinancing makes financial sense." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Refinance Savings Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Refinance Savings Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Current Loan Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Current Rate (%)</label><div className={i}><input type="number" value={currentRate} onChange={e => setCurrentRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Current Term Left</label><div className={i}><input type="number" value={currentTerm} onChange={e => setCurrentTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">New Rate (%)</label><div className={i}><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">New Term</label><div className={i}><input type="number" value={newTerm} onChange={e => setNewTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          {/* Advanced Options */}
          <details className="group">
            <summary className="text-sm text-primary font-medium cursor-pointer select-none flex items-center gap-1">Advanced Options <span className="text-xs group-open:rotate-180 transition-transform">▼</span></summary>
            <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Costs</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Closing Costs ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={closingCosts} onChange={e => setClosingCosts(e.target.value)} className={c} /></div></div>
                <div><label className="text-sm font-medium mb-1 block">Cash-Out ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={cashOut} onChange={e => setCashOut(e.target.value)} className={c} /></div></div>
              </div>
            </div>
          </details>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Savings</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${Math.abs(result.monthlySavings).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{result.monthlySavings < 0 ? " more" : ""}</div>
              <div className="text-sm text-muted-foreground mt-1">New: ${result.newPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo vs Current: ${result.currentPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo · Break-even: {result.breakEvenMonths === Infinity ? "N/A" : result.breakEvenMonths + " months"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly", "$" + Math.abs(result.monthlySavings).toFixed(2)], ["Break-Even", result.breakEvenMonths === Infinity ? "N/A" : result.breakEvenMonths + " mo"], ["Net Total", (result.totalSavings >= 0 ? "$" : "-$") + Math.abs(Math.round(result.totalSavings)).toLocaleString()]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Cumulative Savings vs Closing Costs</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="cumSavings" fill={result.chartData[0]?.cumSavings >= 0 ? "#22c55e" : "#f59e0b"} name="Net Cumulative Savings" radius={[4, 4, 0, 0]} /><Bar dataKey="cumCosts" fill="#ef4444" name="Closing Costs" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Should You Refinance Your Mortgage?</h2><p>Refinancing replaces your existing mortgage with a new one, ideally at a lower interest rate. The key metric is break-even: how many months until the monthly savings offset the closing costs. If you plan to stay in the home past the break-even point and can secure at least a 0.75% rate reduction, refinancing likely makes financial sense.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-refinance-savings-calculator" /><PopularCalculators exclude="/calculator/mortgage-refinance-savings-calculator" /></div>
    </div>
  </>);
}
