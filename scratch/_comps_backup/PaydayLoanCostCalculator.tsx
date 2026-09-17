"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs { loanAmount: number; feePerHundred: number; rollovers: number; termWeeks: number; }
interface Result { totalFees: number; totalCost: number; effectiveApr: number; perRolloverFee: number; breakdown: { label: string; value: string; highlight?: boolean }[]; summaryStats: { label: string; value: string }[]; chartData: { name: string; principal: number; fees: number }[]; }
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const perRolloverFee = (inp.loanAmount / 100) * inp.feePerHundred;
  const totalFees = perRolloverFee * (1 + inp.rollovers);
  const totalCost = inp.loanAmount + totalFees;
  const totalWeeks = inp.termWeeks * (1 + inp.rollovers);
  const effectiveApr = inp.loanAmount > 0 ? ((totalFees / inp.loanAmount) / (totalWeeks / 52)) * 100 : 0;

  const breakdown = [{ label: "Loan Amount", value: fmt(inp.loanAmount) }, { label: "Fee per $100", value: "$" + fmtD(inp.feePerHundred) }, { label: "Initial Fee", value: fmt(perRolloverFee) }, { label: "Rollovers", value: String(inp.rollovers) }, { label: "Total Fees", value: fmt(totalFees), highlight: true }, { label: "Total Cost", value: fmt(totalCost), highlight: true }, { label: "Effective APR", value: effectiveApr.toFixed(0) + "%", highlight: true }, { label: "Total Weeks", value: String(totalWeeks) }];
  const summaryStats = [{ label: "Total Fees", value: fmt(totalFees) }, { label: "Total Cost", value: fmt(totalCost) }, { label: "Effective APR", value: effectiveApr.toFixed(0) + "%" }, { label: "Fee per Rollover", value: fmt(perRolloverFee) }, { label: "Rollovers", value: String(inp.rollovers) }, { label: "Total Weeks", value: String(totalWeeks) }, { label: "Fee as % of Loan", value: ((totalFees / inp.loanAmount) * 100).toFixed(1) + "%" }, { label: "Cost per $100 Borrowed", value: "$" + fmtD(totalCost / inp.loanAmount * 100) }];

  const chartData: { name: string; principal: number; fees: number }[] = [];
  let cumFees = perRolloverFee;
  for (let r = 0; r <= Math.min(inp.rollovers, 10); r++) {
    chartData.push({ name: r === 0 ? "Initial" : "Roll " + r, principal: inp.loanAmount, fees: Math.round(cumFees) });
    cumFees += perRolloverFee;
  }

  return { totalFees, totalCost, effectiveApr, perRolloverFee, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 500, feePerHundred: 15, rollovers: 3, termWeeks: 2 };

export default function PaydayLoanCostCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [feePerHundred, setFeePerHundred] = useState(String(DEFAULTS.feePerHundred));
  const [rollovers, setRollovers] = useState(String(DEFAULTS.rollovers));
  const [termWeeks, setTermWeeks] = useState(String(DEFAULTS.termWeeks));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const g = (): Inputs => ({ loanAmount: parseFloat(loanAmount) || 0, feePerHundred: parseFloat(feePerHundred) || 0, rollovers: parseInt(rollovers) || 0, termWeeks: parseInt(termWeeks) || 2 });
  const calc_ = () => setResult(calc(g()));
  const reset = () => { setLoanAmount(String(DEFAULTS.loanAmount)); setFeePerHundred(String(DEFAULTS.feePerHundred)); setRollovers(String(DEFAULTS.rollovers)); setTermWeeks(String(DEFAULTS.termWeeks)); setResult(calc(DEFAULTS)); };
  useEffect(() => { setResult(calc(DEFAULTS)); }, []);
  const hasErrors = (parseFloat(loanAmount) || 0) <= 0;
  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Payday Loan Cost Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Payday Loan Cost Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Fee per $100 ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={feePerHundred} onChange={e => setFeePerHundred(e.target.value)} step="0.5" className={c} /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Rollovers</label><div className={i}><input type="number" value={rollovers} onChange={e => setRollovers(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">times</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termWeeks} onChange={e => setTermWeeks(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">weeks</span></div></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Fees Paid</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmt(result.totalFees)}</div>
              <div className="text-sm text-muted-foreground mt-1">Effective APR: {result.effectiveApr.toFixed(0)}% · Total Cost: ${fmt(result.totalCost)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Fees", fmt(result.totalFees)], ["APR", result.effectiveApr.toFixed(0) + "%"], ["Total Cost", fmt(result.totalCost)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cumulative Fees by Rollover</h3>
              <ResponsiveContainer width="100%" height={200}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + v} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="principal" fill="hsl(var(--primary))" name="Principal" radius={[4, 4, 0, 0]} /><Bar dataKey="fees" fill="#ef4444" name="Fees" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Loan Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">The True Cost of Payday Loans</h2><p>Payday loans carry extremely high effective APRs — often 300-500% — because fees are charged per $100 borrowed over short periods. Rolling over a loan multiplies these costs dramatically. A $500 loan with 3 rollovers at $15 per $100 costs $275 in fees alone, making the total repayment $775.</p></section>
        <PopularCalculators exclude="/calculator/payday-loan-cost-calculator" />
      </div>
    </div>
  </>);
}
