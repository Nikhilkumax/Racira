"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  extraMonthly: number;
}

interface YearRow { year: number; payment: number; principal: number; interest: number; balance: number; cumInterest: number; cumPrincipal: number; }

interface Result {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffMonths: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  yearlySchedule: YearRow[];
  chartData: { year: number; balance: number; cumInterest: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.loanAmount;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;

  let balance = P;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let payoffMonths = 0;
  const yearlySchedule: YearRow[] = [];
  const chartData: { year: number; balance: number; cumInterest: number }[] = [];
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let yr = 1; yr <= inp.termYears; yr++) {
    let yearPayment = 0;
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const intPart = balance * r;
      let prinPart = monthlyPayment + inp.extraMonthly - intPart;
      if (prinPart > balance) prinPart = balance;
      if (prinPart < 0) prinPart = 0;
      balance -= prinPart;
      yearInterest += intPart;
      yearPrincipal += prinPart;
      yearPayment += monthlyPayment + inp.extraMonthly;
      totalInterest += intPart;
      totalPrincipal += prinPart;
      payoffMonths++;
    }
    cumInterest += yearInterest;
    cumPrincipal += yearPrincipal;
    yearlySchedule.push({
      year: yr,
      payment: Math.round(yearPayment),
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.max(0, Math.round(balance)),
      cumInterest: Math.round(cumInterest),
      cumPrincipal: Math.round(cumPrincipal),
    });
    chartData.push({ year: yr, balance: Math.max(0, Math.round(balance)), cumInterest: Math.round(cumInterest) });
  }

  const totalCost = totalPrincipal + totalInterest;

  const breakdown = [
    { label: "Loan Amount", value: fmt(P) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Loan Term", value: inp.termYears + " years (" + inp.termYears * 12 + " months)" },
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment), highlight: true },
    { label: "Extra Monthly", value: "$" + fmtD(inp.extraMonthly) },
    { label: "Total Principal", value: fmt(totalPrincipal) },
    { label: "Total Interest", value: fmt(totalInterest), highlight: true },
    { label: "Total Cost", value: fmt(totalCost), highlight: true },
    { label: "Payoff Months", value: String(payoffMonths) },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost) },
    { label: "Payoff Time", value: (payoffMonths / 12).toFixed(1) + " years" },
    { label: "Interest-to-Principal", value: ((totalInterest / P) * 100).toFixed(1) + "%" },
    { label: "Months Saved", value: inp.extraMonthly > 0 ? Math.max(0, n - payoffMonths) + " mo" : "N/A" },
    { label: "Year 1 Interest", value: yearlySchedule.length > 0 ? fmt(yearlySchedule[0].interest) : "N/A" },
    { label: "Year 1 Principal", value: yearlySchedule.length > 0 ? fmt(yearlySchedule[0].principal) : "N/A" },
  ];

  return { monthlyPayment, totalInterest, totalCost, payoffMonths, breakdown, summaryStats, yearlySchedule, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 250000, interestRate: 6.5, termYears: 30, extraMonthly: 0 };

export default function LoanAmortizationScheduleCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(loanAmount) <= 0 || v(interestRate) <= 0 || v(termYears) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Amortization Schedule Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Amortization Schedule Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Extra Monthly ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} className={c} /></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Payment Options</div>
                <p className="text-sm text-muted-foreground">Extra monthly payments reduce your payoff time and total interest. The schedule updates automatically.</p>
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
              <div className="text-sm text-muted-foreground mt-1">Total Interest: ${fmt(result.totalInterest)} · Total Cost: ${fmt(result.totalCost)}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly", "$" + result.monthlyPayment.toFixed(2)], ["Total Interest", fmt(result.totalInterest)], ["Payoff", (result.payoffMonths / 12).toFixed(1) + " yrs"]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Balance & Interest Over Time</h3>
              <ResponsiveContainer width="100%" height={200}><LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line yAxisId="left" type="monotone" dataKey="balance" stroke="#ef4444" strokeWidth={2} dot={false} name="Remaining Balance" /><Line yAxisId="right" type="monotone" dataKey="cumInterest" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Cumulative Interest" /></LineChart></ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Year-by-Year Amortization</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase"><th className="py-2 text-left">Year</th><th className="py-2 text-right">Payment</th><th className="py-2 text-right">Principal</th><th className="py-2 text-right">Interest</th><th className="py-2 text-right">Balance</th></tr></thead>
                  <tbody>{result.yearlySchedule.map(r => (<tr key={r.year} className="border-b border-border/50 hover:bg-secondary/20"><td className="py-2 text-muted-foreground">{r.year}</td><td className="py-2 text-right font-semibold">${r.payment.toLocaleString()}</td><td className="py-2 text-right">${r.principal.toLocaleString()}</td><td className="py-2 text-right">${r.interest.toLocaleString()}</td><td className="py-2 text-right">${r.balance.toLocaleString()}</td></tr>))}</tbody>
                </table>
              </div>
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
          <h2 className="text-2xl font-bold mb-3">Understanding Loan Amortization</h2>
          <p>An amortization schedule shows how each payment is split between principal and interest over the life of a loan. Early payments are mostly interest, while later payments are mostly principal. Making extra payments accelerates payoff and reduces total interest — for a $250,000 loan at 6.5%, even $100/month extra can save over $40,000 in interest.</p>
        </section>
        <PopularCalculators exclude="/calculator/loan-amortization-schedule-calculator" />
      </div>
    </div>
  </>);
}
