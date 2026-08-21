"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  processingFee: number;
  prepaymentAmount: number;
}

interface Result {
  emi: number;
  totalPrincipal: number;
  totalInterest: number;
  totalCost: number;
  processingFeeAmt: number;
  totalWithFee: number;
  interestToPrincipal: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; principal: number; interest: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.loanAmount;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
  const totalPrincipal = emi * n;
  const totalInterest = totalPrincipal - P;
  const processingFeeAmt = P * (inp.processingFee / 100);
  const totalCost = totalPrincipal + processingFeeAmt;
  const totalWithFee = totalCost;
  const interestToPrincipal = P > 0 ? (totalInterest / P) * 100 : 0;

  // Yearly breakdown
  let balance = P;
  const chartData: { year: string; principal: number; interest: number }[] = [];
  for (let yr = 1; yr <= inp.termYears; yr++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const intPart = balance * r;
      const prinPart = Math.min(emi - intPart, balance);
      yearPrincipal += prinPart;
      yearInterest += intPart;
      balance -= prinPart;
    }
    chartData.push({ year: "Yr " + yr, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest) });
  }

  const breakdown = [
    { label: "Loan Amount", value: fmt(P) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Loan Term", value: inp.termYears + " years (" + n + " months)" },
    { label: "Processing Fee (" + inp.processingFee + "%)", value: fmt(processingFeeAmt) },
    { label: "Monthly EMI", value: "$" + fmtD(emi), highlight: true },
    { label: "Total Principal", value: fmt(P) },
    { label: "Total Interest", value: fmt(totalInterest), highlight: true },
    { label: "Total Cost (incl. fee)", value: fmt(totalWithFee), highlight: true },
    { label: "Interest-to-Principal", value: interestToPrincipal.toFixed(1) + "%" },
  ];

  const summaryStats = [
    { label: "Monthly EMI", value: "$" + fmtD(emi) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalWithFee) },
    { label: "Processing Fee", value: fmt(processingFeeAmt) },
    { label: "Interest-to-Principal", value: interestToPrincipal.toFixed(1) + "%" },
    { label: "Cost per $1000", value: "$" + fmtD(totalWithFee / P * 1000) },
    { label: "Effective Rate (est.)", value: ((totalInterest / P / inp.termYears) * 100).toFixed(2) + "%" },
    { label: "Months", value: String(n) },
  ];

  return { emi, totalPrincipal, totalInterest, totalCost: totalPrincipal, processingFeeAmt, totalWithFee, interestToPrincipal, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 10000, interestRate: 8, termYears: 5, processingFee: 1, prepaymentAmount: 0 };

export default function PersonalLoanEmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [processingFee, setProcessingFee] = useState(String(DEFAULTS.processingFee));
  const [prepaymentAmount, setPrepaymentAmount] = useState(String(DEFAULTS.prepaymentAmount));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    processingFee: parseFloat(processingFee) || 0,
    prepaymentAmount: parseFloat(prepaymentAmount) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setProcessingFee(String(DEFAULTS.processingFee));
    setPrepaymentAmount(String(DEFAULTS.prepaymentAmount));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(loanAmount) <= 0 || v(interestRate) <= 0 || v(termYears) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Personal Loan EMI Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Personal Loan EMI Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Processing Fee (%)</label><div className={i}><input type="number" value={processingFee} onChange={e => setProcessingFee(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Prepayment</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">One-Time Prepayment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={prepaymentAmount} onChange={e => setPrepaymentAmount(e.target.value)} className={c} /></div></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly EMI</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.emi)}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Interest: ${fmt(result.totalInterest)} · Total Cost: ${fmt(result.totalWithFee)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["EMI", "$" + result.emi.toFixed(2)], ["Total Interest", fmt(result.totalInterest)], ["Total Cost", fmt(result.totalWithFee)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Yearly Principal vs Interest</h3>
              <ResponsiveContainer width="100%" height={200}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="principal" fill="hsl(var(--primary))" name="Principal" radius={[4, 4, 0, 0]} /><Bar dataKey="interest" fill="#f59e0b" name="Interest" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
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
          <h2 className="text-2xl font-bold mb-3">What is EMI?</h2>
          <p>Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are paid on a regular basis and include both principal and interest components. The formula is: EMI = [P × r × (1+r)^n] / [(1+r)^n − 1], where P is the principal, r is the monthly interest rate, and n is the number of monthly installments.</p>
        </section>
        <PopularCalculators exclude="/calculator/personal-loan-emi-calculator" />
      </div>
    </div>
  </>);
}
