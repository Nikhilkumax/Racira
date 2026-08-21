"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  loanAmount: number;
  annualRate: number;
  termMonths: number;
  processingFee: number;
  calcMethod: "reducing" | "flat";
}

interface Result {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  processingFeeAmt: number;
  totalWithFee: number;
  flatRatePayment: number;
  flatRateInterest: number;
  reducingRatePayment: number;
  reducingRateInterest: number;
  interestSaved: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; flat: number; reducing: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.loanAmount;
  const annualRate = inp.annualRate;
  const n = inp.termMonths;
  const monthlyRate = annualRate / 100 / 12;
  const processingFeeAmt = P * (inp.processingFee / 100);

  // Flat rate: total interest = P * annualRate/100 * (termMonths/12)
  const flatRateInterest = P * (annualRate / 100) * (n / 12);
  const flatRatePayment = (P + flatRateInterest) / n;

  // Reducing balance: standard EMI formula
  const reducingRatePayment = monthlyRate > 0 ? (P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) : P / n;
  const reducingRateInterest = reducingRatePayment * n - P;

  // Use selected method for primary results
  const isReducing = inp.calcMethod === "reducing";
  const monthlyPayment = isReducing ? reducingRatePayment : flatRatePayment;
  const totalInterest = isReducing ? reducingRateInterest : flatRateInterest;
  const totalCost = P + totalInterest;
  const totalWithFee = totalCost + processingFeeAmt;
  const interestSaved = Math.abs(flatRateInterest - reducingRateInterest);

  const breakdown = [
    { label: "Loan Amount", value: fmt(P) },
    { label: "Interest Rate", value: annualRate + "%/yr (" + inp.calcMethod + " balance)" },
    { label: "Loan Term", value: n + " months (" + (n / 12).toFixed(1) + " years)" },
    { label: "Processing Fee (" + inp.processingFee + "%)", value: fmt(processingFeeAmt) },
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment), highlight: true },
    { label: "Total Interest", value: fmt(totalInterest), highlight: true },
    { label: "Total Cost (incl. fee)", value: fmt(totalWithFee), highlight: true },
    { label: "Effective Rate (flat)", value: ((flatRateInterest / P / (n / 12)) * 100).toFixed(1) + "%" },
    { label: "Effective Rate (reducing)", value: ((reducingRateInterest / P / (n / 12)) * 100).toFixed(1) + "%" },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalWithFee) },
    { label: "Processing Fee", value: fmt(processingFeeAmt) },
    { label: "Flat Rate Interest", value: fmt(flatRateInterest) },
    { label: "Reducing Balance Interest", value: fmt(reducingRateInterest) },
    { label: "Interest Saved (reducing)", value: fmt(interestSaved) },
    { label: "Cost per $1000", value: "$" + fmtD(totalWithFee / P * 1000) },
  ];

  // Chart: compare flat vs reducing for each 3-month period
  const chartData: { name: string; flat: number; reducing: number }[] = [];
  let reducingBal = P;
  let flatCumInt = 0;
  let reducingCumInt = 0;
  for (let m = 3; m <= n; m += 3) {
    // Flat: linear accumulation
    flatCumInt = P * (annualRate / 100) * (m / 12);
    // Reducing: simulate
    reducingCumInt = 0;
    let bal = P;
    for (let i = 0; i < m; i++) {
      const intPart = bal * monthlyRate;
      const prinPart = reducingRatePayment - intPart;
      reducingCumInt += intPart;
      bal -= prinPart;
    }
    chartData.push({ name: "Mo " + m, flat: Math.round(flatCumInt), reducing: Math.round(reducingCumInt) });
  }

  return { monthlyPayment, totalInterest, totalCost, processingFeeAmt, totalWithFee, flatRatePayment, flatRateInterest, reducingRatePayment, reducingRateInterest, interestSaved, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 1000, annualRate: 12, termMonths: 12, processingFee: 2, calcMethod: "reducing" };

export default function MicrofinanceLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [annualRate, setAnnualRate] = useState(String(DEFAULTS.annualRate));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [processingFee, setProcessingFee] = useState(String(DEFAULTS.processingFee));
  const [calcMethod, setCalcMethod] = useState<"reducing" | "flat">(DEFAULTS.calcMethod);
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    annualRate: parseFloat(annualRate) || 0,
    termMonths: parseInt(termMonths) || 1,
    processingFee: parseFloat(processingFee) || 0,
    calcMethod,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setAnnualRate(String(DEFAULTS.annualRate));
    setTermMonths(String(DEFAULTS.termMonths));
    setProcessingFee(String(DEFAULTS.processingFee));
    setCalcMethod(DEFAULTS.calcMethod);
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(loanAmount) <= 0 || v(annualRate) <= 0 || v(termMonths) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Microfinance Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Microfinance Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={annualRate} onChange={e => setAnnualRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">months</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Processing Fee (%)</label><div className={i}><input type="number" value={processingFee} onChange={e => setProcessingFee(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Calculation Method</div>
                <div className="flex rounded-md border border-input overflow-hidden h-9">
                  <button type="button" onClick={() => setCalcMethod("reducing")} className={`flex-1 text-xs font-semibold transition-colors ${calcMethod === "reducing" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Reducing Balance</button>
                  <button type="button" onClick={() => setCalcMethod("flat")} className={`flex-1 text-xs font-semibold transition-colors border-l border-input ${calcMethod === "flat" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Flat Rate</button>
                </div>
                <p className="text-xs text-muted-foreground">Reducing balance is standard for most microfinance institutions. Flat rate is common in some markets and results in higher effective cost.</p>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.monthlyPayment)}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Interest: ${fmt(result.totalInterest)} · Total Cost: ${fmt(result.totalWithFee)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly", "$" + result.monthlyPayment.toFixed(2)], ["Total Interest", fmt(result.totalInterest)], ["Saved", fmt(result.interestSaved)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Flat vs Reducing Balance Comparison</h3>
              <ResponsiveContainer width="100%" height={200}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + v} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="flat" fill="#ef4444" name="Flat Rate" radius={[4, 4, 0, 0]} /><Bar dataKey="reducing" fill="hsl(var(--primary))" name="Reducing Balance" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
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
          <h2 className="text-2xl font-bold mb-3">Understanding Microfinance Loans</h2>
          <p>Microfinance loans serve individuals and small businesses who lack access to traditional banking. The two main interest calculation methods are flat rate (interest charged on the original principal for the entire term) and reducing balance (interest charged only on the outstanding balance). Reducing balance is generally more favorable to borrowers, as you pay less total interest over the life of the loan.</p>
        </section>
        <PopularCalculators exclude="/calculator/microfinance-loan-calculator" />
      </div>
    </div>
  </>);
}
