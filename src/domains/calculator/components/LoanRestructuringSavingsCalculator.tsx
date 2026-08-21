"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  currentBalance: number;
  currentRate: number;
  currentTermRemaining: number;
  currentPayment: number;
  newRate: number;
  newTerm: number;
}

interface Result {
  newPayment: number;
  monthlySavings: number;
  totalSavings: number;
  currentTotalCost: number;
  newTotalCost: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; current: number; restructured: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.currentBalance;
  const r = inp.currentRate / 100 / 12;
  const n = inp.currentTermRemaining * 12;
  const currentTotalCost = inp.currentPayment * n;
  const currentTotalInterest = currentTotalCost - P;

  const rNew = inp.newRate / 100 / 12;
  const nNew = inp.newTerm * 12;
  const newPayment = rNew > 0 ? (P * rNew * Math.pow(1 + rNew, nNew)) / (Math.pow(1 + rNew, nNew) - 1) : P / nNew;
  const newTotalCost = newPayment * nNew;
  const newTotalInterest = newTotalCost - P;

  const monthlySavings = inp.currentPayment - newPayment;
  const totalSavings = currentTotalCost - newTotalCost;

  const breakdown = [
    { label: "Current Balance", value: fmt(P) },
    { label: "Current Rate", value: inp.currentRate + "%/yr" },
    { label: "Current Payment", value: "$" + fmtD(inp.currentPayment) + "/mo" },
    { label: "Remaining Term", value: inp.currentTermRemaining + " years" },
    { label: "New Rate", value: inp.newRate + "%/yr" },
    { label: "New Term", value: inp.newTerm + " years" },
    { label: "New Monthly Payment", value: "$" + fmtD(newPayment), highlight: true },
    { label: "Monthly Savings", value: monthlySavings > 0 ? "$" + fmtD(monthlySavings) : "N/A", highlight: monthlySavings > 0 },
    { label: "Total Savings", value: totalSavings > 0 ? fmt(totalSavings) : "N/A", highlight: totalSavings > 0 },
    { label: "New Total Cost", value: fmt(newTotalCost) },
  ];

  const summaryStats = [
    { label: "New Payment", value: "$" + fmtD(newPayment) + "/mo" },
    { label: "Current Payment", value: "$" + fmtD(inp.currentPayment) + "/mo" },
    { label: "Monthly Savings", value: monthlySavings > 0 ? "$" + fmtD(monthlySavings) : "N/A" },
    { label: "Total Savings", value: totalSavings > 0 ? fmt(totalSavings) : "N/A" },
    { label: "Current Total Interest", value: fmt(currentTotalInterest) },
    { label: "New Total Interest", value: fmt(newTotalInterest) },
    { label: "Rate Change", value: (inp.newRate - inp.currentRate > 0 ? "+" : "") + (inp.newRate - inp.currentRate).toFixed(2) + "%" },
    { label: "Term Change", value: (inp.newTerm - inp.currentTermRemaining > 0 ? "+" : "") + (inp.newTerm - inp.currentTermRemaining) + " yrs" },
  ];

  const chartData = [
    { name: "Current", current: Math.round(inp.currentPayment), restructured: 0 },
    { name: "Restructured", current: 0, restructured: Math.round(newPayment) },
    { name: "Total Interest", current: Math.round(currentTotalInterest), restructured: Math.round(newTotalInterest) },
  ];

  return { newPayment, monthlySavings, totalSavings, currentTotalCost, newTotalCost, currentTotalInterest, newTotalInterest, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { currentBalance: 200000, currentRate: 7.0, currentTermRemaining: 25, currentPayment: 1414, newRate: 5.5, newTerm: 25 };

export default function LoanRestructuringSavingsCalculator() {
  const [currentBalance, setCurrentBalance] = useState(String(DEFAULTS.currentBalance));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [currentTermRemaining, setCurrentTermRemaining] = useState(String(DEFAULTS.currentTermRemaining));
  const [currentPayment, setCurrentPayment] = useState(String(DEFAULTS.currentPayment));
  const [newRate, setNewRate] = useState(String(DEFAULTS.newRate));
  const [newTerm, setNewTerm] = useState(String(DEFAULTS.newTerm));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    currentBalance: parseFloat(currentBalance) || 0,
    currentRate: parseFloat(currentRate) || 0,
    currentTermRemaining: parseInt(currentTermRemaining) || 1,
    currentPayment: parseFloat(currentPayment) || 0,
    newRate: parseFloat(newRate) || 0,
    newTerm: parseInt(newTerm) || 1,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setCurrentBalance(String(DEFAULTS.currentBalance));
    setCurrentRate(String(DEFAULTS.currentRate));
    setCurrentTermRemaining(String(DEFAULTS.currentTermRemaining));
    setCurrentPayment(String(DEFAULTS.currentPayment));
    setNewRate(String(DEFAULTS.newRate));
    setNewTerm(String(DEFAULTS.newTerm));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(currentBalance) <= 0 || v(currentRate) <= 0 || v(newRate) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Restructuring Savings Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Restructuring Savings Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Current Loan</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Current Rate (%)</label><div className={i}><input type="number" value={currentRate} onChange={e => setCurrentRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Remaining Term</label><div className={i}><input type="number" value={currentTermRemaining} onChange={e => setCurrentTermRemaining(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Current Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={currentPayment} onChange={e => setCurrentPayment(e.target.value)} className={c} /></div></div>
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1 mt-2">Restructured Loan</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">New Rate (%)</label><div className={i}><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">New Term</label><div className={i}><input type="number" value={newTerm} onChange={e => setNewTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.monthlySavings > 0 ? "Monthly Savings" : "New Payment"}</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlySavings > 0 ? "$" + fmtD(result.monthlySavings) + "/mo" : "$" + fmtD(result.newPayment) + "/mo"}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.totalSavings > 0 ? "Total savings: " + fmt(result.totalSavings) : "No savings with this restructuring"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Current", "$" + DEFAULTS.currentPayment.toFixed(2)], ["New", "$" + result.newPayment.toFixed(2)], ["Savings", result.monthlySavings > 0 ? "$" + result.monthlySavings.toFixed(2) : "N/A"]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Payment & Interest Comparison</h3>
              <ResponsiveContainer width="100%" height={200}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="current" fill="#ef4444" name="Current" radius={[0, 4, 4, 0]} /><Bar dataKey="restructured" fill="hsl(var(--primary))" name="Restructured" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
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
          <h2 className="text-2xl font-bold mb-3">Should You Restructure Your Loan?</h2>
          <p>Loan restructuring replaces your current loan terms with new ones — typically a lower interest rate or longer term. This can reduce monthly payments but may increase total interest if the term is extended. Enter your current loan details and proposed new terms to see the true savings.</p>
        </section>
        <PopularCalculators exclude="/calculator/loan-restructuring-savings-calculator" />
      </div>
    </div>
  </>);
}
