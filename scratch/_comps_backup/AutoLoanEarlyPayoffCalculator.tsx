"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  balance: number;
  apr: number;
  termMonths: number;
  extraMonthly: number;
}

interface Result {
  monthlyPayment: number;
  payoffMonths: number;
  monthsSaved: number;
  interestStandard: number;
  interestAccelerated: number;
  interestSaved: number;
  totalPaidAccelerated: number;
  chartData: { label: string; standard: number; accelerated: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function buildSchedule(balance: number, r: number, payment: number, extra: number, cap: number): { payoffMonths: number; totalInterest: number; balanceByMonth: number[] } {
  const balanceByMonth: number[] = [];
  let bal = balance;
  let totalInterest = 0;
  let m = 0;
  while (bal > 0.5 && m < cap) {
    m++;
    const int = bal * r;
    const paid = Math.min(payment + extra, bal + int);
    totalInterest += int;
    bal = bal + int - paid;
    balanceByMonth.push(Math.round(bal));
  }
  return { payoffMonths: m, totalInterest, balanceByMonth };
}

function calc(inp: Inputs): Result {
  const r = inp.apr / 100 / 12;
  const n = inp.termMonths;
  const monthlyPayment = r > 0 ? (inp.balance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inp.balance / n;

  const std = buildSchedule(inp.balance, r, monthlyPayment, 0, n + 1);
  const acc = buildSchedule(inp.balance, r, monthlyPayment, inp.extraMonthly, n + 1);

  const payoffMonths = acc.payoffMonths;
  const monthsSaved = Math.max(0, std.payoffMonths - acc.payoffMonths);
  const interestStandard = std.totalInterest;
  const interestAccelerated = acc.totalInterest;
  const interestSaved = Math.max(0, interestStandard - interestAccelerated);
  const totalPaidAccelerated = inp.balance + interestAccelerated;

  // Sample remaining balances every 6 months for the chart.
  const chartData: { label: string; standard: number; accelerated: number }[] = [];
  const steps = Math.ceil(Math.max(std.payoffMonths, acc.payoffMonths) / 6);
  for (let s = 0; s <= steps; s++) {
    const m = Math.min(s * 6, Math.max(std.payoffMonths, acc.payoffMonths));
    chartData.push({
      label: m === 0 ? "Start" : m + " mo",
      standard: m === 0 ? inp.balance : std.balanceByMonth[m - 1] ?? 0,
      accelerated: m === 0 ? inp.balance : acc.balanceByMonth[m - 1] ?? 0,
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const payoffLabel = (mo: number) => (Math.floor(mo / 12) + " yr " + (mo % 12) + " mo").replace(" 0 mo", "");

  const breakdown = [
    { label: "Loan Balance", value: fmt(inp.balance) },
    { label: "APR", value: inp.apr + "%" },
    { label: "Remaining Term", value: inp.termMonths + " months" },
    { label: "Current Monthly Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Extra Monthly Payment", value: inp.extraMonthly > 0 ? fmtD(inp.extraMonthly) : "None", highlight: inp.extraMonthly > 0 },
    { label: "New Payoff Time", value: payoffLabel(payoffMonths) + " (" + payoffMonths + " mo)", highlight: true },
    { label: "Months Saved", value: monthsSaved + " months", highlight: monthsSaved > 0 },
    { label: "Total Interest (Standard)", value: fmt(interestStandard) },
    { label: "Total Interest (Accelerated)", value: fmt(interestAccelerated) },
    { label: "Interest Saved", value: fmt(interestSaved), isTotal: true },
    { label: "Total Paid (Accelerated)", value: fmt(totalPaidAccelerated), isTotal: true },
  ];

  const summaryStats = [
    { label: "Payoff Time", value: payoffLabel(payoffMonths) },
    { label: "Months Saved", value: monthsSaved + " months" },
    { label: "Interest Saved", value: fmt(interestSaved) },
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Extra Monthly", value: inp.extraMonthly > 0 ? fmtD(inp.extraMonthly) : "None" },
    { label: "Interest (Standard)", value: fmt(interestStandard) },
    { label: "Interest (Accelerated)", value: fmt(interestAccelerated) },
    { label: "Total Paid", value: fmt(totalPaidAccelerated) },
  ];

  return { monthlyPayment, payoffMonths, monthsSaved, interestStandard, interestAccelerated, interestSaved, totalPaidAccelerated, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { balance: 25000, apr: 6.5, termMonths: 48, extraMonthly: 100 };

export default function AutoLoanEarlyPayoffCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    termMonths: parseInt(termMonths) || 1,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setTermMonths(String(DEFAULTS.termMonths));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const bal = parseFloat(balance) || 0;
  const rate = parseFloat(apr) || 0;
  const term = parseInt(termMonths) || 0;
  const extra = parseFloat(extraMonthly) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Loan balance must be greater than $0";
  if (!apr || rate <= 0) valErrors.apr = "APR must be greater than 0%";
  else if (rate > 25) valErrors.apr = "APR must be 25% or less";
  if (!termMonths || term <= 0) valErrors.termMonths = "Term must be greater than 0 months";
  else if (term > 96) valErrors.termMonths = "Term must be 96 months or less";
  if (extra < 0) valErrors.extraMonthly = "Extra payment must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Auto Loan Early Payoff Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Loan Early Payoff Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={c} /></div>{valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">APR (%)</label><div className={i}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Remaining Term (Months)</label><div className={i}><input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>{valErrors.termMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termMonths}</p>}</div>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Extra Payment Strategy</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Extra Monthly Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} className={c} /></div>{valErrors.extraMonthly && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.extraMonthly}</p>}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Payoff Time with Extra Payments</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.payoffMonths} <span className="text-2xl">months</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthsSaved > 0 ? result.monthsSaved + " months sooner than your current schedule" : "Same as your current schedule"} · {"$" + Math.round(result.interestSaved).toLocaleString("en-US")} interest saved</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment", "$" + Math.round(result.monthlyPayment).toLocaleString("en-US"), "text-primary"],
                ["Interest Saved", "$" + Math.round(result.interestSaved).toLocaleString("en-US"), "text-emerald-600"],
                ["Months Saved", result.monthsSaved + " months", "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Remaining Balance Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "standard" ? "Standard Schedule" : "With Extra Payments", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "standard" ? "Standard Schedule" : "With Extra Payments")} />
                  <Line type="monotone" dataKey="standard" name="standard" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="accelerated" name="accelerated" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, idx) => (
                    <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Paying Off Your Auto Loan Early</h2>
          <p>Auto loans are simple-interest loans: interest accrues on the daily balance, so every extra dollar you pay shortens the loan and skips future interest. Extra payments are usually applied to principal (confirm with your lender), which is what makes them powerful. On a $25,000 loan at 6.5% APR with 48 months remaining, an extra $100 per month roughly cuts months off the term and saves hundreds in interest. This calculator runs your exact amortization both ways so the payoff date and savings are precise.</p>
        </section>
        <FAQSection faqs={[
          { question: "Should I make extra payments on my auto loan?", answer: "If the rate is higher than what your savings or alternative debt costs, extra payments are usually worth it. Confirm your lender applies extras to principal rather than treating them as early payments of the next installment." },
          { question: "How is interest calculated on auto loans?", answer: "Simple interest accrues daily on the outstanding principal. Because the balance falls faster when you add extra principal, the total interest over the loan drops — often by hundreds of dollars on a typical loan." },
          { question: "Is there a prepayment penalty?", answer: "Auto loans rarely carry prepayment penalties, unlike some mortgages. Check your note or call the lender to be certain before you accelerate." },
        ]} pageUrl="https://racira.com/calculator/auto-loan-early-payoff-calculator" />
        <PopularCalculators exclude="/calculator/auto-loan-early-payoff-calculator" />
      </div>
    </div>
  </>);
}
