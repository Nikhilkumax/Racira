"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  amortTermYears: number;
  balloonTermYears: number;
  extraMonthly: number;
}

interface Result {
  monthlyPayment: number;
  balloonPayment: number;
  totalInterest: number;
  totalCost: number;
  fullAmortPayment: number;
  fullAmortInterest: number;
  interestSaved: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; balance: number; fullAmortBalance: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.loanAmount;
  const r = inp.interestRate / 100 / 12;
  const amortMonths = inp.amortTermYears * 12;
  const balloonMonths = Math.min(inp.balloonTermYears * 12, amortMonths);

  // Monthly payment based on full amortization schedule
  const monthlyPayment = r > 0 ? (P * r * Math.pow(1 + r, amortMonths)) / (Math.pow(1 + r, amortMonths) - 1) : P / amortMonths;

  // Balance at balloon time
  let balance = P;
  for (let m = 0; m < balloonMonths; m++) {
    const intPart = balance * r;
    const prinPart = monthlyPayment - intPart;
    balance -= prinPart;
  }
  const balloonPayment = Math.max(0, balance);

  // Total interest during balloon period
  let totalInterest = 0;
  balance = P;
  for (let m = 0; m < balloonMonths; m++) {
    const intPart = balance * r;
    totalInterest += intPart;
    balance -= (monthlyPayment - intPart);
  }

  const totalCost = monthlyPayment * balloonMonths + balloonPayment;

  // Full amortization comparison
  const fullAmortPayment = monthlyPayment; // Same since payment is based on amort schedule
  const fullAmortInterest = fullAmortPayment * amortMonths - P;

  const chartData: { year: number; balance: number; fullAmortBalance: number }[] = [];
  let bal1 = P;
  let bal2 = P;
  for (let yr = 1; yr <= Math.max(inp.balloonTermYears, inp.amortTermYears); yr++) {
    for (let m = 0; m < 12; m++) {
      if (yr <= inp.balloonTermYears) {
        const int1 = bal1 * r;
        bal1 = Math.max(0, bal1 - (monthlyPayment - int1));
      }
      if (yr <= inp.amortTermYears) {
        const int2 = bal2 * r;
        bal2 = Math.max(0, bal2 - (fullAmortPayment - int2));
      }
    }
    chartData.push({
      year: yr,
      balance: yr <= inp.balloonTermYears ? Math.max(0, Math.round(bal1)) : chartData[chartData.length - 1]?.balance ?? 0,
      fullAmortBalance: yr <= inp.amortTermYears ? Math.max(0, Math.round(bal2)) : 0,
    });
  }

  const breakdown = [
    { label: "Loan Amount", value: fmt(P) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Amortization Period", value: inp.amortTermYears + " years" },
    { label: "Balloon Due", value: inp.balloonTermYears + " years", highlight: true },
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment), highlight: true },
    { label: "Balloon Payment", value: "$" + fmtD(balloonPayment), highlight: true },
    { label: "Total Interest (to balloon)", value: fmt(totalInterest) },
    { label: "Full Amort Interest", value: fmt(fullAmortInterest) },
    { label: "Total Cost (to balloon)", value: fmt(totalCost) },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment) + "/mo" },
    { label: "Balloon Payment", value: "$" + fmtD(balloonPayment) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost) },
    { label: "Full Amort Interest", value: fmt(fullAmortInterest) },
    { label: "Interest Saved", value: fmt(fullAmortInterest - totalInterest) },
    { label: "Balloon as % of Loan", value: ((balloonPayment / P) * 100).toFixed(1) + "%" },
    { label: "Months Until Balloon", value: String(balloonMonths) },
  ];

  return { monthlyPayment, balloonPayment, totalInterest, totalCost, fullAmortPayment, fullAmortInterest, interestSaved: fullAmortInterest - totalInterest, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 300000, interestRate: 6.5, amortTermYears: 30, balloonTermYears: 7, extraMonthly: 0 };

export default function BalloonLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [amortTermYears, setAmortTermYears] = useState(String(DEFAULTS.amortTermYears));
  const [balloonTermYears, setBalloonTermYears] = useState(String(DEFAULTS.balloonTermYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    amortTermYears: parseInt(amortTermYears) || 1,
    balloonTermYears: parseInt(balloonTermYears) || 1,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setAmortTermYears(String(DEFAULTS.amortTermYears));
    setBalloonTermYears(String(DEFAULTS.balloonTermYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(loanAmount) <= 0 || v(interestRate) <= 0 || v(amortTermYears) <= 0 || v(balloonTermYears) <= 0 || v(balloonTermYears) > v(amortTermYears);

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Balloon Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Balloon Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Amortization Period</label><div className={i}><input type="number" value={amortTermYears} onChange={e => setAmortTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Balloon Due In</label><div className={i}><input type="number" value={balloonTermYears} onChange={e => setBalloonTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Extra Payments</div>
                <div><label className="text-sm font-medium mb-1 block">Extra Monthly ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} className={c} /></div></div>
              </div>
            )}
          </div>

          {hasErrors && v(balloonTermYears) > v(amortTermYears) && <p className="text-xs text-red-500 font-medium">Balloon term must be ≤ amortization period</p>}

          <div className="flex gap-3 mt-1">
            <button onClick={calc_} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
            <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" ref={printRef}>
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3"><button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Printer className="h-3.5 w-3.5" /> Print</button></div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.monthlyPayment)}</div>
              <div className="text-sm text-muted-foreground mt-1">Balloon Due: ${fmtD(result.balloonPayment)} · Total Interest: ${fmt(result.totalInterest)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly", "$" + result.monthlyPayment.toFixed(2)], ["Balloon", fmt(result.balloonPayment)], ["Total Interest", fmt(result.totalInterest)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Balance: Balloon vs Full Amortization</h3>
              <ResponsiveContainer width="100%" height={200}><LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="balance" stroke="#ef4444" strokeWidth={2} dot={false} name="Balloon Balance" /><Line type="monotone" dataKey="fullAmortBalance" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Full Amort Balance" /></LineChart></ResponsiveContainer>
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
          <h2 className="text-2xl font-bold mb-3">How Balloon Loans Work</h2>
          <p>A balloon loan has lower monthly payments during the loan term because the payments are calculated as if the loan had a longer amortization period. However, the remaining balance (the "balloon") is due in full at the end of the shorter balloon term. This structure is common in commercial real estate and some mortgage products.</p>
        </section>
        <PopularCalculators exclude="/calculator/balloon-loan-payment-calculator" />
      </div>
    </div>
  </>);
}
