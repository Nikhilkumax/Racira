"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  loanBalance: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  graceMonths: number;
  extraMonthly: number;
}

interface Result {
  monthlyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalCost: number;
  payoffMonths: number;
  payoffYears: string;
  interestToPrincipal: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
  schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const P = inp.loanBalance;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;

  // Grace period interest
  const graceInterest = P * r * inp.graceMonths;
  const balanceAfterGrace = P + graceInterest;

  // Calculate payment (user-entered or auto)
  let monthlyPayment = inp.monthlyPayment;
  if (monthlyPayment <= 0) {
    monthlyPayment = r > 0 ? (balanceAfterGrace * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : balanceAfterGrace / n;
  }

  // Amortization with grace period interest capitalized
  let balance = balanceAfterGrace;
  let totalInterest = graceInterest;
  let totalPrincipal = 0;
  const schedule: Result["schedule"] = [];
  let month = 0;

  while (balance > 0.01 && month < 600) {
    month++;
    const interestPart = balance * r;
    let principalPart = monthlyPayment + inp.extraMonthly - interestPart;
    if (principalPart > balance) principalPart = balance;
    if (principalPart < 0) principalPart = 0;

    balance -= principalPart;
    totalInterest += interestPart;
    totalPrincipal += principalPart;

    schedule.push({
      month,
      payment: monthlyPayment + inp.extraMonthly,
      principal: Math.round(principalPart),
      interest: Math.round(interestPart),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  const totalCost = totalPrincipal + totalInterest;
  const payoffMonths = month;
  const payoffYears = (payoffMonths / 12).toFixed(1);
  const interestToPrincipal = totalPrincipal > 0 ? (totalInterest / totalPrincipal) * 100 : 0;

  const breakdown = [
    { label: "Original Loan Balance", value: fmt(P) },
    { label: "Grace Period Interest", value: fmt(graceInterest) },
    { label: "Balance After Grace", value: fmt(balanceAfterGrace) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment), highlight: true },
    { label: "Extra Monthly Payment", value: "$" + fmtD(inp.extraMonthly) },
    { label: "Total Principal Paid", value: fmt(totalPrincipal) },
    { label: "Total Interest Paid", value: fmt(totalInterest), highlight: true },
    { label: "Total Cost", value: fmt(totalCost), highlight: true },
    { label: "Payoff Time", value: payoffYears + " years (" + payoffMonths + " months)" },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost) },
    { label: "Payoff Time", value: payoffYears + " years" },
    { label: "Interest-to-Principal", value: interestToPrincipal.toFixed(1) + "%" },
    { label: "Months Saved (extra)", value: inp.extraMonthly > 0 ? Math.max(0, n - payoffMonths) + " mo" : "N/A" },
    { label: "Grace Period Interest", value: fmt(graceInterest) },
    { label: "Balance After Grace", value: fmt(balanceAfterGrace) },
  ];

  const PIE = ["hsl(var(--primary))", "#f59e0b"];
  const chartData = [
    { name: "Principal", value: Math.round(totalPrincipal), color: PIE[0] },
    { name: "Interest", value: Math.round(totalInterest), color: PIE[1] },
  ].filter((d) => d.value > 0);

  return { monthlyPayment, totalPrincipal, totalInterest, totalCost, payoffMonths, payoffYears, interestToPrincipal, breakdown, summaryStats, chartData, schedule };
}

const DEFAULTS: Inputs = { loanBalance: 25000, interestRate: 5.5, termYears: 10, monthlyPayment: 0, graceMonths: 6, extraMonthly: 0 };

export default function StudentLoanTotalInterestCalculator() {
  const [loanBalance, setLoanBalance] = useState(String(DEFAULTS.loanBalance));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [graceMonths, setGraceMonths] = useState(String(DEFAULTS.graceMonths));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    loanBalance: parseFloat(loanBalance) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    graceMonths: parseInt(graceMonths) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanBalance(String(DEFAULTS.loanBalance));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setGraceMonths(String(DEFAULTS.graceMonths));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(loanBalance) <= 0 || v(interestRate) <= 0 || v(termYears) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Student Loan Total Interest Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Loan Total Interest Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanBalance} onChange={e => setLoanBalance(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Monthly Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} placeholder="0 = auto" className={c} /></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Repayment Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Grace Period</label><div className={i}><input type="number" value={graceMonths} onChange={e => setGraceMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Extra Monthly ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} className={c} /></div></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Interest Paid</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmtD(result.totalInterest)}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Cost: ${fmt(result.totalCost)} · Payoff: {result.payoffYears} years</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly", "$" + result.monthlyPayment.toFixed(2)], ["Total Interest", fmt(result.totalInterest)], ["Payoff", result.payoffYears + " yrs"]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0"><div className="w-[160px] h-[160px] relative"><ResponsiveContainer width="100%" height="100%"><RPie><Pie data={result.chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">{result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /></RPie></ResponsiveContainer></div></div>
              <div className="flex-1 flex flex-col gap-2"><h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Cost Split</h4>{result.chartData.map(item => (<div key={item.name} className="flex items-center justify-between text-[13px]"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} /><span className="font-semibold text-muted-foreground">{item.name}</span></div><span className="font-bold text-foreground">${item.value.toLocaleString()}</span></div>))}</div>
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
          <h2 className="text-2xl font-bold mb-3">How Student Loan Interest Works</h2>
          <p>Student loan interest accrues daily on your outstanding balance. During the grace period (typically 6 months after graduation), interest continues to accumulate and is capitalized — added to your principal balance — when repayment begins. This means you pay interest on interest for the life of the loan.</p>
        </section>
        <PopularCalculators exclude="/calculator/student-loan-total-interest-calculator" />
      </div>
    </div>
  </>);
}
