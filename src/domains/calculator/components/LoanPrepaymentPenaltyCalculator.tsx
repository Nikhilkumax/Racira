"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  remainingBalance: number;
  originalRate: number;
  currentRate: number;
  yearsRemaining: number;
  penaltyType: "yield" | "defeasance" | "percentage";
  penaltyPercent: number;
  reinvestmentRate: number;
}

interface Result {
  yieldMaintenance: number;
  defeasance: number;
  percentage: number;
  activePenalty: number;
  interestSaved: number;
  netBenefit: number;
  monthlyPaymentCurrent: number;
  monthlyPaymentNew: number;
  monthlySavings: number;
  breakEvenMonths: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; savedInterest: number; penaltyCost: number }[];
}

function calc(inp: Inputs): Result {
  const months = inp.yearsRemaining * 12;
  const rCurrent = inp.currentRate / 100 / 12;
  const rNew = inp.originalRate / 100 / 12;

  // Monthly payments
  const monthlyPaymentCurrent = rCurrent > 0 ? (inp.remainingBalance * rCurrent * Math.pow(1 + rCurrent, months)) / (Math.pow(1 + rCurrent, months) - 1) : inp.remainingBalance / months;
  const monthlyPaymentNew = rNew > 0 ? (inp.remainingBalance * rNew * Math.pow(1 + rNew, months)) / (Math.pow(1 + rNew, months) - 1) : inp.remainingBalance / months;

  // Yield Maintenance: PV of remaining payments × (current rate - reinvestment rate) × weighted average life
  const weightedAvgLife = inp.yearsRemaining / 2; // Simplified
  const yieldMaintenance = Math.max(0, inp.remainingBalance * ((inp.currentRate - inp.reinvestmentRate) / 100) * weightedAvgLife * 0.01);

  // Defeasance: Cost to replicate the cash flow stream
  // PV of remaining payments at reinvestment rate
  const rReinvest = inp.reinvestmentRate / 100 / 12;
  const defeasance = rReinvest > 0 ? (monthlyPaymentCurrent * (1 - Math.pow(1 + rReinvest, -months)) / rReinvest) : monthlyPaymentCurrent * months;
  // Net cost = defeasance cost - remaining balance (you invest less to get the same returns)
  const defeasanceNet = Math.max(0, defeasance - inp.remainingBalance);

  // Percentage: Remaining balance × penalty %
  const percentage = inp.remainingBalance * (inp.penaltyPercent / 100);

  // Active penalty based on type
  const activePenalty = inp.penaltyType === "yield" ? yieldMaintenance : inp.penaltyType === "defeasance" ? defeasanceNet : percentage;

  // Interest saved from refinancing at lower rate
  const totalInterestCurrent = monthlyPaymentCurrent * months - inp.remainingBalance;
  const totalInterestNew = monthlyPaymentNew * months - inp.remainingBalance;
  const interestSaved = totalInterestCurrent - totalInterestNew;
  const netBenefit = interestSaved - activePenalty;

  const monthlySavings = monthlyPaymentCurrent - monthlyPaymentNew;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(activePenalty / monthlySavings) : Infinity;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Remaining Balance", value: fmt(inp.remainingBalance) },
    { label: "Current Rate", value: inp.currentRate + "%/yr" },
    { label: "Current Monthly Payment", value: "$" + fmtD(monthlyPaymentCurrent) },
    { label: "New Rate (Refinance)", value: inp.originalRate + "%/yr" },
    { label: "New Monthly Payment", value: "$" + fmtD(monthlyPaymentNew), highlight: true },
    { label: "Monthly Savings", value: "$" + fmtD(Math.abs(monthlySavings)), highlight: true },
    { label: "Yield Maintenance Penalty", value: fmt(yieldMaintenance) },
    { label: "Defeasance Penalty (net)", value: fmt(defeasanceNet) },
    { label: "Percentage Penalty (" + inp.penaltyPercent + "%)", value: fmt(percentage) },
    { label: "Active Penalty (" + inp.penaltyType + ")", value: fmt(activePenalty), highlight: true },
    { label: "Total Interest Saved", value: fmt(interestSaved) },
    { label: "Net Benefit After Penalty", value: (netBenefit >= 0 ? "" : "-") + fmt(Math.abs(netBenefit)), highlight: true },
  ];

  const summaryStats = [
    { label: "Active Penalty", value: fmt(activePenalty) },
    { label: "Monthly Savings", value: "$" + fmtD(Math.abs(monthlySavings)) + "/mo" },
    { label: "Interest Saved", value: fmt(interestSaved) },
    { label: "Net Benefit", value: (netBenefit >= 0 ? "" : "-") + fmt(Math.abs(netBenefit)) },
    { label: "Break-Even", value: breakEvenMonths === Infinity ? "N/A" : breakEvenMonths + " months" },
    { label: "Yield Maintenance", value: fmt(yieldMaintenance) },
    { label: "Defeasance (net)", value: fmt(defeasanceNet) },
    { label: "Percentage Penalty", value: fmt(percentage) },
  ];

  // Year-by-year comparison
  const chartData: { year: string; savedInterest: number; penaltyCost: number }[] = [];
  let cumSaved = 0;
  const annualSavings2 = monthlySavings * 12;
  for (let yr = 1; yr <= Math.min(inp.yearsRemaining, 15); yr++) {
    cumSaved += annualSavings2;
    chartData.push({
      year: "Yr " + yr,
      savedInterest: Math.round(Math.max(0, cumSaved - activePenalty)),
      penaltyCost: yr === 1 ? Math.round(activePenalty) : 0,
    });
  }

  return { yieldMaintenance, defeasance: defeasanceNet, percentage, activePenalty, interestSaved, netBenefit, monthlyPaymentCurrent, monthlyPaymentNew, monthlySavings, breakEvenMonths, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { remainingBalance: 250000, originalRate: 4.5, currentRate: 6.5, yearsRemaining: 20, penaltyType: "yield", penaltyPercent: 2, reinvestmentRate: 4 };

export default function LoanPrepaymentPenaltyCalculator() {
  const [remainingBalance, setRemainingBalance] = useState(String(DEFAULTS.remainingBalance));
  const [originalRate, setOriginalRate] = useState(String(DEFAULTS.originalRate));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [yearsRemaining, setYearsRemaining] = useState(String(DEFAULTS.yearsRemaining));
  const [penaltyType, setPenaltyType] = useState<Inputs["penaltyType"]>(DEFAULTS.penaltyType);
  const [penaltyPercent, setPenaltyPercent] = useState(String(DEFAULTS.penaltyPercent));
  const [reinvestmentRate, setReinvestmentRate] = useState(String(DEFAULTS.reinvestmentRate));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    remainingBalance: parseFloat(remainingBalance) || 0,
    originalRate: parseFloat(originalRate) || 0,
    currentRate: parseFloat(currentRate) || 0,
    yearsRemaining: parseInt(yearsRemaining) || 1,
    penaltyType,
    penaltyPercent: parseFloat(penaltyPercent) || 0,
    reinvestmentRate: parseFloat(reinvestmentRate) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setRemainingBalance(String(DEFAULTS.remainingBalance));
    setOriginalRate(String(DEFAULTS.originalRate));
    setCurrentRate(String(DEFAULTS.currentRate));
    setYearsRemaining(String(DEFAULTS.yearsRemaining));
    setPenaltyType(DEFAULTS.penaltyType);
    setPenaltyPercent(String(DEFAULTS.penaltyPercent));
    setReinvestmentRate(String(DEFAULTS.reinvestmentRate));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is a loan prepayment penalty?", answer: "A prepayment penalty is a fee charged by lenders when you pay off or refinance a loan before a specified date. It compensates the lender for lost interest income. Common types include yield maintenance, defeasance, and simple percentage penalties." },
    { question: "What is yield maintenance?", answer: "Yield maintenance makes the lender whole by calculating the present value of the interest they would have earned if you hadn't prepaid. It's typically the most expensive penalty type but decreases over time as the remaining term shortens." },
    { question: "Should I refinance if there's a prepayment penalty?", answer: "Compare the net benefit: interest savings minus the penalty. If the net benefit is positive and the break-even point is within your expected time in the home, refinancing makes financial sense. Consider your plans — if you'll move within the break-even period, the penalty may not be worth it." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Prepayment Penalty Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Prepayment Penalty Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Remaining Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={remainingBalance} onChange={e => setRemainingBalance(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Current Rate (%)</label><div className={i}><input type="number" value={currentRate} onChange={e => setCurrentRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Refinance Rate (%)</label><div className={i}><input type="number" value={originalRate} onChange={e => setOriginalRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Years Remaining</label><div className={i}><input type="number" value={yearsRemaining} onChange={e => setYearsRemaining(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Penalty Type</label><div className="flex gap-1 mt-1">
              {([["yield", "Yield Maint."], ["defeasance", "Defeasance"], ["percentage", "Percentage"]] as const).map(([val, lbl]) => (<button key={val} type="button" onClick={() => setPenaltyType(val)} className={`flex-1 text-xs px-2 py-2 rounded border transition-colors ${penaltyType === val ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}>{lbl}</button>))}
            </div></div>
          </div>
          {/* Advanced Options */}
          <details className="group">
            <summary className="text-sm text-primary font-medium cursor-pointer select-none flex items-center gap-1">Advanced Options <span className="text-xs group-open:rotate-180 transition-transform">▼</span></summary>
            <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Penalty % (if percentage)</label><div className={i}><input type="number" value={penaltyPercent} onChange={e => setPenaltyPercent(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                <div><label className="text-sm font-medium mb-1 block">Reinvestment Rate</label><div className={i}><input type="number" value={reinvestmentRate} onChange={e => setReinvestmentRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              </div>
            </div>
          </details>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Prepayment Penalty ({DEFAULTS.penaltyType})</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.activePenalty.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Net benefit: {result.netBenefit >= 0 ? "$" + result.netBenefit.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " saved" : "-$" + Math.abs(result.netBenefit).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " lost"} · Break-even: {result.breakEvenMonths === Infinity ? "N/A" : result.breakEvenMonths + " months"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Penalty", "$" + Math.round(result.activePenalty).toLocaleString()], ["Interest Saved", "$" + Math.round(result.interestSaved).toLocaleString()], ["Net Benefit", (result.netBenefit >= 0 ? "$" : "-$") + Math.abs(Math.round(result.netBenefit)).toLocaleString()]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Net Savings Over Time</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="savedInterest" fill="#22c55e" name="Cumulative Net Savings" radius={[4, 4, 0, 0]} /><Bar dataKey="penaltyCost" fill="#ef4444" name="Penalty Cost" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Understanding Prepayment Penalties</h2><p>A prepayment penalty compensates the lender for lost interest when you pay off a loan early. The three main types are yield maintenance (most common in commercial loans), defeasance (common in CMBS loans), and simple percentage penalties (common in consumer loans). Understanding which type applies helps you decide whether refinancing is worthwhile.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-prepayment-penalty-calculator" /><PopularCalculators exclude="/calculator/loan-prepayment-penalty-calculator" /></div>
    </div>
  </>);
}
