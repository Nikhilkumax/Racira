"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs { loanAmount: number; initialRate: number; adjustmentPeriod: number; rateCap: number; rateFloor: number; rateChangePerAdj: number; termYears: number; }
interface Result { initialPayment: number; maxPayment: number; minPayment: number; totalInterest: number; totalCost: number; breakdown: { label: string; value: string; highlight?: boolean }[]; summaryStats: { label: string; value: string }[]; chartData: { year: number; payment: number; rate: number; balance: number }[]; }
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.loanAmount; const n = inp.termYears * 12;
  let balance = P; let totalInterest = 0; let maxPayment = 0; let minPayment = Infinity;
  let currentRate = inp.initialRate;
  const r0 = inp.initialRate / 100 / 12;
  const initialPayment = r0 > 0 ? (P * r0 * Math.pow(1 + r0, n)) / (Math.pow(1 + r0, n) - 1) : P / n;
  let monthlyPayment = initialPayment;
  const chartData: { year: number; payment: number; rate: number; balance: number }[] = [];

  for (let yr = 1; yr <= inp.termYears; yr++) {
    if (yr > 1 && (yr - 1) % inp.adjustmentPeriod === 0) {
      currentRate = Math.min(Math.max(currentRate + inp.rateChangePerAdj, inp.rateFloor), inp.rateCap);
      const rm = currentRate / 100 / 12;
      const remaining = n - (yr - 1) * 12;
      monthlyPayment = rm > 0 && remaining > 0 ? (balance * rm * Math.pow(1 + rm, remaining)) / (Math.pow(1 + rm, remaining) - 1) : balance / remaining;
    }
    maxPayment = Math.max(maxPayment, monthlyPayment);
    minPayment = Math.min(minPayment, monthlyPayment);
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) { if (balance <= 0) break; const ip = balance * (currentRate / 100 / 12); const pp = Math.min(monthlyPayment - ip, balance); balance -= pp; yearInterest += ip; totalInterest += ip; }
    chartData.push({ year: yr, payment: Math.round(monthlyPayment), rate: parseFloat(currentRate.toFixed(2)), balance: Math.max(0, Math.round(balance)) });
  }
  if (minPayment === Infinity) minPayment = initialPayment;
  const totalCost = P + totalInterest;

  const breakdown = [{ label: "Loan Amount", value: fmt(P) }, { label: "Initial Rate", value: inp.initialRate + "%/yr" }, { label: "Adjustment Period", value: inp.adjustmentPeriod + " years" }, { label: "Rate Cap", value: inp.rateCap + "%" }, { label: "Rate Floor", value: inp.rateFloor + "%" }, { label: "Initial Monthly Payment", value: "$" + fmtD(initialPayment), highlight: true }, { label: "Max Monthly Payment", value: "$" + fmtD(maxPayment), highlight: true }, { label: "Min Monthly Payment", value: "$" + fmtD(minPayment) }, { label: "Total Interest", value: fmt(totalInterest), highlight: true }, { label: "Total Cost", value: fmt(totalCost), highlight: true }];
  const summaryStats = [{ label: "Initial Payment", value: "$" + fmtD(initialPayment) + "/mo" }, { label: "Max Payment", value: "$" + fmtD(maxPayment) + "/mo" }, { label: "Min Payment", value: "$" + fmtD(minPayment) + "/mo" }, { label: "Total Interest", value: fmt(totalInterest) }, { label: "Total Cost", value: fmt(totalCost) }, { label: "Payment Range", value: "$" + fmtD(minPayment) + " – $" + fmtD(maxPayment) }, { label: "Term", value: inp.termYears + " years" }, { label: "Adjustments", value: Math.floor(inp.termYears / inp.adjustmentPeriod) + " times" }];

  return { initialPayment, maxPayment, minPayment, totalInterest, totalCost, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 300000, initialRate: 4.5, adjustmentPeriod: 1, rateCap: 9.5, rateFloor: 4.5, rateChangePerAdj: 0.25, termYears: 30 };

export default function VariableRateLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [initialRate, setInitialRate] = useState(String(DEFAULTS.initialRate));
  const [adjustmentPeriod, setAdjustmentPeriod] = useState(String(DEFAULTS.adjustmentPeriod));
  const [rateCap, setRateCap] = useState(String(DEFAULTS.rateCap));
  const [rateFloor, setRateFloor] = useState(String(DEFAULTS.rateFloor));
  const [rateChangePerAdj, setRateChangePerAdj] = useState(String(DEFAULTS.rateChangePerAdj));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const g = (): Inputs => ({ loanAmount: parseFloat(loanAmount) || 0, initialRate: parseFloat(initialRate) || 0, adjustmentPeriod: parseInt(adjustmentPeriod) || 1, rateCap: parseFloat(rateCap) || 0, rateFloor: parseFloat(rateFloor) || 0, rateChangePerAdj: parseFloat(rateChangePerAdj) || 0, termYears: parseInt(termYears) || 30 });
  const calc_ = () => setResult(calc(g()));
  const reset = () => { setLoanAmount(String(DEFAULTS.loanAmount)); setInitialRate(String(DEFAULTS.initialRate)); setAdjustmentPeriod(String(DEFAULTS.adjustmentPeriod)); setRateCap(String(DEFAULTS.rateCap)); setRateFloor(String(DEFAULTS.rateFloor)); setRateChangePerAdj(String(DEFAULTS.rateChangePerAdj)); setTermYears(String(DEFAULTS.termYears)); setResult(calc(DEFAULTS)); };
  useEffect(() => { setResult(calc(DEFAULTS)); }, []);
  const hasErrors = (parseFloat(loanAmount) || 0) <= 0 || (parseFloat(initialRate) || 0) <= 0;
  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Variable Rate Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Variable Rate Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Initial Rate (%)</label><div className={i}><input type="number" value={initialRate} onChange={e => setInitialRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Adj. Period</label><div className={i}><input type="number" value={adjustmentPeriod} onChange={e => setAdjustmentPeriod(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Rate Caps & Changes</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Rate Cap (%)</label><div className={i}><input type="number" value={rateCap} onChange={e => setRateCap(e.target.value)} step="0.25" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Rate Floor (%)</label><div className={i}><input type="number" value={rateFloor} onChange={e => setRateFloor(e.target.value)} step="0.25" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Rate Change/Adj (%)</label><div className={i}><input type="number" value={rateChangePerAdj} onChange={e => setRateChangePerAdj(e.target.value)} step="0.05" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                </div>
              </div>
            )}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Initial Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.initialPayment)}</div>
              <div className="text-sm text-muted-foreground mt-1">Range: ${fmtD(result.minPayment)} – ${fmtD(result.maxPayment)}/mo · Total: ${fmt(result.totalCost)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Initial", "$" + result.initialPayment.toFixed(2)], ["Max", "$" + result.maxPayment.toFixed(2)], ["Min", "$" + result.minPayment.toFixed(2)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Payment & Rate Over Time</h3>
              <ResponsiveContainer width="100%" height={200}><LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => v + "%"} /><Tooltip formatter={(v: number, name: string) => name === "rate" ? [v + "%", "Rate"] : ["$" + v.toLocaleString(), "Payment"]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line yAxisId="left" type="monotone" dataKey="payment" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Monthly Payment" /><Line yAxisId="right" type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Rate" /></LineChart></ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Loan Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Understanding Variable Rate Loans</h2><p>Variable rate (adjustable rate) loans start with a lower initial rate that adjusts periodically based on market indices. Rate caps protect borrowers from extreme increases. This calculator shows how your payment changes over the life of the loan under different rate scenarios.</p></section>
        <PopularCalculators exclude="/calculator/variable-rate-loan-payment-calculator" />
      </div>
    </div>
  </>);
}
