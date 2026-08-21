"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  monthlyBudget: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  tradeInValue: number;
  salesTax: number;
  registrationFees: number;
}

interface Result {
  maxLoan: number;
  maxCarPrice: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  // Max loan from monthly budget: P = PMT * [(1+r)^n - 1] / [r * (1+r)^n]
  const maxLoan = r > 0 ? inp.monthlyBudget * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)) : inp.monthlyBudget * n;
  // Car price = loan + down payment + trade-in - taxes on car price
  // Simplified: car price = (loan + down + tradeIn) / (1 + taxRate) ... no, tax is on car price
  // Car price = loan + down - tradeIn + tax*carPrice + fees
  // carPrice * (1 - taxRate) = loan + down - tradeIn + fees
  // Actually: buyer pays carPrice + tax*carPrice + fees, financed by (loan + down + tradeIn)
  // So: carPrice * (1 + taxRate) + fees = maxLoan + inp.downPayment + inp.tradeInValue
  const taxRate = inp.salesTax / 100;
  const maxCarPrice = (maxLoan + inp.downPayment + inp.tradeInValue - inp.registrationFees) / (1 + taxRate);

  const totalInterest = inp.monthlyBudget * n - maxLoan;
  const totalCost = inp.monthlyBudget * n + inp.downPayment - inp.tradeInValue + inp.registrationFees + maxCarPrice * taxRate;

  const breakdown = [
    { label: "Monthly Budget", value: "$" + fmtD(inp.monthlyBudget), highlight: true },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Trade-In Value", value: fmt(inp.tradeInValue) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Max Loan Amount", value: fmt(maxLoan) },
    { label: "Max Car Price", value: fmt(maxCarPrice), highlight: true },
    { label: "Sales Tax (" + inp.salesTax + "%)", value: fmt(maxCarPrice * taxRate) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Out of Pocket", value: fmt(inp.downPayment + inp.monthlyBudget * n - inp.tradeInValue), highlight: true },
  ];

  const summaryStats = [
    { label: "Max Car Price", value: fmt(maxCarPrice) },
    { label: "Monthly Payment", value: "$" + fmtD(inp.monthlyBudget) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Max Loan", value: fmt(maxLoan) },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Trade-In", value: fmt(inp.tradeInValue) },
    { label: "Sales Tax + Fees", value: fmt(maxCarPrice * taxRate + inp.registrationFees) },
    { label: "Total Cost", value: fmt(totalCost) },
  ];

  const chartData = [
    { name: "Car Price", value: Math.round(maxCarPrice) },
    { name: "Sales Tax", value: Math.round(maxCarPrice * taxRate) },
    { name: "Interest", value: Math.round(totalInterest) },
    { name: "Fees", value: inp.registrationFees },
  ];

  return { maxLoan, maxCarPrice, monthlyPayment: inp.monthlyBudget, totalInterest, totalCost, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { monthlyBudget: 450, downPayment: 5000, interestRate: 6.5, termYears: 5, tradeInValue: 0, salesTax: 6, registrationFees: 300 };

export default function AutoLoanAffordabilityCalculator() {
  const [monthlyBudget, setMonthlyBudget] = useState(String(DEFAULTS.monthlyBudget));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [tradeInValue, setTradeInValue] = useState(String(DEFAULTS.tradeInValue));
  const [salesTax, setSalesTax] = useState(String(DEFAULTS.salesTax));
  const [registrationFees, setRegistrationFees] = useState(String(DEFAULTS.registrationFees));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    monthlyBudget: parseFloat(monthlyBudget) || 0,
    downPayment: parseFloat(downPayment) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    tradeInValue: parseFloat(tradeInValue) || 0,
    salesTax: parseFloat(salesTax) || 0,
    registrationFees: parseFloat(registrationFees) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setMonthlyBudget(String(DEFAULTS.monthlyBudget));
    setDownPayment(String(DEFAULTS.downPayment));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setTradeInValue(String(DEFAULTS.tradeInValue));
    setSalesTax(String(DEFAULTS.salesTax));
    setRegistrationFees(String(DEFAULTS.registrationFees));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(monthlyBudget) <= 0 || v(interestRate) <= 0 || v(termYears) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Auto Loan Affordability Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Loan Affordability Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Monthly Budget ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={c} /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Trade-In & Fees</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Trade-In Value ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={tradeInValue} onChange={e => setTradeInValue(e.target.value)} className={c} /></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Sales Tax (%)</label><div className={i}><input type="number" value={salesTax} onChange={e => setSalesTax(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Registration Fees ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={registrationFees} onChange={e => setRegistrationFees(e.target.value)} className={c} /></div></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Maximum Car Price</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmt(result.maxCarPrice)}</div>
              <div className="text-sm text-muted-foreground mt-1">Monthly: ${fmtD(result.monthlyPayment)} · Loan: ${fmt(result.maxLoan)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Car Price", fmt(result.maxCarPrice)], ["Monthly", "$" + result.monthlyPayment.toFixed(2)], ["Interest", fmt(result.totalInterest)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
              <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">How Much Car Can You Afford?</h2>
          <p>A common rule of thumb is to keep your total car payment under 10-15% of your monthly take-home pay. This calculator works backward from your budget to determine the maximum car price you can afford, including sales tax, registration fees, and the impact of a trade-in.</p>
        </section>
        <PopularCalculators exclude="/calculator/auto-loan-affordability-calculator" />
      </div>
    </div>
  </>);
}
