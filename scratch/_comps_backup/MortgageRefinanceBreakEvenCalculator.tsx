"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  currentBalance: number;
  currentRate: number;
  currentTermRemaining: number;
  newRate: number;
  newTerm: number;
  closingCosts: number;
}

interface Result {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  breakEvenMonths: number;
  breakEvenYears: string;
  totalSavingsAfterBreakEven: number;
  netSavingsOverTerm: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; cumulativeSavings: number; closingCosts: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.currentBalance;
  const rOld = inp.currentRate / 100 / 12;
  const nOld = inp.currentTermRemaining * 12;
  const currentPayment = rOld > 0 ? (P * rOld * Math.pow(1 + rOld, nOld)) / (Math.pow(1 + rOld, nOld) - 1) : P / nOld;

  const rNew = inp.newRate / 100 / 12;
  const nNew = inp.newTerm * 12;
  const newPayment = rNew > 0 ? (P * rNew * Math.pow(1 + rNew, nNew)) / (Math.pow(1 + rNew, nNew) - 1) : P / nNew;

  const monthlySavings = currentPayment - newPayment;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(inp.closingCosts / monthlySavings) : Infinity;
  const breakEvenYears = breakEvenMonths === Infinity ? "Never" : (breakEvenMonths / 12).toFixed(1);

  const totalSavingsAfterBreakEven = monthlySavings > 0 ? (nNew - breakEvenMonths) * monthlySavings : 0;
  const netSavingsOverTerm = monthlySavings * nNew - inp.closingCosts;

  // Chart: cumulative savings over time
  const chartData: { year: number; cumulativeSavings: number; closingCosts: number }[] = [];
  let cumSavings = 0;
  for (let yr = 1; yr <= Math.ceil(nNew / 12); yr++) {
    cumSavings += monthlySavings * 12;
    chartData.push({
      year: yr,
      cumulativeSavings: Math.round(cumSavings - inp.closingCosts),
      closingCosts: inp.closingCosts,
    });
  }

  const breakdown = [
    { label: "Current Balance", value: fmt(P) },
    { label: "Current Rate", value: inp.currentRate + "%/yr" },
    { label: "Current Payment", value: "$" + fmtD(currentPayment) + "/mo" },
    { label: "New Rate", value: inp.newRate + "%/yr" },
    { label: "New Term", value: inp.newTerm + " years" },
    { label: "New Payment", value: "$" + fmtD(newPayment), highlight: true },
    { label: "Monthly Savings", value: monthlySavings > 0 ? "$" + fmtD(monthlySavings) : "N/A", highlight: monthlySavings > 0 },
    { label: "Closing Costs", value: fmt(inp.closingCosts) },
    { label: "Break-Even Point", value: breakEvenMonths === Infinity ? "Never" : breakEvenMonths + " months (" + breakEvenYears + " years)", highlight: true },
    { label: "Net Savings Over Term", value: netSavingsOverTerm > 0 ? fmt(netSavingsOverTerm) : "N/A", highlight: netSavingsOverTerm > 0 },
  ];

  const summaryStats = [
    { label: "Monthly Savings", value: monthlySavings > 0 ? "$" + fmtD(monthlySavings) : "N/A" },
    { label: "Break-Even", value: breakEvenMonths === Infinity ? "Never" : breakEvenMonths + " months" },
    { label: "Net Savings", value: netSavingsOverTerm > 0 ? fmt(netSavingsOverTerm) : "N/A" },
    { label: "Current Payment", value: "$" + fmtD(currentPayment) },
    { label: "New Payment", value: "$" + fmtD(newPayment) },
    { label: "Closing Costs", value: fmt(inp.closingCosts) },
    { label: "Rate Change", value: (inp.newRate - inp.currentRate > 0 ? "+" : "") + (inp.newRate - inp.currentRate).toFixed(2) + "%" },
    { label: "Term Change", value: (inp.newTerm - inp.currentTermRemaining > 0 ? "+" : "") + (inp.newTerm - inp.currentTermRemaining) + " yrs" },
  ];

  return { currentPayment, newPayment, monthlySavings, breakEvenMonths, breakEvenYears, totalSavingsAfterBreakEven, netSavingsOverTerm, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { currentBalance: 300000, currentRate: 7.0, currentTermRemaining: 28, newRate: 5.5, newTerm: 30, closingCosts: 6000 };

export default function MortgageRefinanceBreakEvenCalculator() {
  const [currentBalance, setCurrentBalance] = useState(String(DEFAULTS.currentBalance));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [currentTermRemaining, setCurrentTermRemaining] = useState(String(DEFAULTS.currentTermRemaining));
  const [newRate, setNewRate] = useState(String(DEFAULTS.newRate));
  const [newTerm, setNewTerm] = useState(String(DEFAULTS.newTerm));
  const [closingCosts, setClosingCosts] = useState(String(DEFAULTS.closingCosts));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    currentBalance: parseFloat(currentBalance) || 0,
    currentRate: parseFloat(currentRate) || 0,
    currentTermRemaining: parseInt(currentTermRemaining) || 1,
    newRate: parseFloat(newRate) || 0,
    newTerm: parseInt(newTerm) || 1,
    closingCosts: parseFloat(closingCosts) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setCurrentBalance(String(DEFAULTS.currentBalance));
    setCurrentRate(String(DEFAULTS.currentRate));
    setCurrentTermRemaining(String(DEFAULTS.currentTermRemaining));
    setNewRate(String(DEFAULTS.newRate));
    setNewTerm(String(DEFAULTS.newTerm));
    setClosingCosts(String(DEFAULTS.closingCosts));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(currentBalance) <= 0 || v(currentRate) <= 0 || v(newRate) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Refinance Break-Even Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Refinance Break-Even Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Current Loan</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Current Rate (%)</label><div className={i}><input type="number" value={currentRate} onChange={e => setCurrentRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Remaining Term</label><div className={i}><input type="number" value={currentTermRemaining} onChange={e => setCurrentTermRemaining(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1 mt-2">New Loan</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">New Rate (%)</label><div className={i}><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">New Term</label><div className={i}><input type="number" value={newTerm} onChange={e => setNewTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Closing Costs ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={closingCosts} onChange={e => setClosingCosts(e.target.value)} className={c} /></div></div>
          </div>

          <div className="flex gap-3 mt-1">
            <button onClick={calc_} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
            <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" ref={printRef}>
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3"><button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Printer className="h-3.5 w-3.5" /> Print</button></div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Break-Even Point</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.breakEvenMonths === Infinity ? "Never" : result.breakEvenYears + " Years"}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthlySavings > 0 ? "Save $" + fmtD(result.monthlySavings) + "/mo after break-even" : "No monthly savings with this refinance"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Savings", result.monthlySavings > 0 ? "$" + result.monthlySavings.toFixed(2) + "/mo" : "N/A"], ["Break-Even", result.breakEvenMonths === Infinity ? "Never" : result.breakEvenMonths + " mo"], ["Net Savings", result.netSavingsOverTerm > 0 ? fmt(result.netSavingsOverTerm) : "N/A"]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cumulative Savings vs Closing Costs</h3>
              <ResponsiveContainer width="100%" height={200}><LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Years", position: "bottom", fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="cumulativeSavings" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Net Savings" /><Line type="monotone" dataKey="closingCosts" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Closing Costs" /></LineChart></ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
              <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">When Does Refinancing Make Sense?</h2>
          <p>Refinancing replaces your current mortgage with a new one, ideally at a lower interest rate. The break-even point is when your cumulative monthly savings equal the closing costs. If you plan to stay in the home beyond the break-even point, refinancing can save you thousands. A common guideline is to refinance when you can reduce your rate by at least 0.75-1%.</p>
        </section>
        <PopularCalculators exclude="/calculator/mortgage-refinance-break-even-calculator" />
      </div>
    </div>
  </>);
}
