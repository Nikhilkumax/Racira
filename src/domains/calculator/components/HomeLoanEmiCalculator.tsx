"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  extraMonthly: number;
}

interface MonthRow {
  int: number;
  prin: number;
}

interface YearRow {
  year: string;
  principal: number;
  interest: number;
}

interface Result {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  payoffMonths: number;
  interestSaved: number;
  years: YearRow[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function buildSchedule(principal: number, r: number, emi: number, extra: number, cap: number): MonthRow[] {
  const sched: MonthRow[] = [];
  let bal = principal;
  while (bal > 0.5 && sched.length < cap) {
    const int = bal * r;
    const owed = bal + int;
    const paid = Math.min(emi + extra, owed);
    sched.push({ int, prin: paid - int });
    bal = owed - paid;
  }
  return sched;
}

function calc(inp: Inputs): Result {
  const principal = inp.loanAmount;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const emi = r > 0 ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / n;

  const stdSched = buildSchedule(principal, r, emi, 0, n + 1); // exact term
  const actSched = buildSchedule(principal, r, emi, inp.extraMonthly, n + 1);

  const totalInterest = actSched.reduce((a, m) => a + m.int, 0);
  const totalPayment = principal + totalInterest;
  const stdInterest = stdSched.reduce((a, m) => a + m.int, 0);
  const interestSaved = Math.max(0, stdInterest - totalInterest);
  const payoffMonths = actSched.length;

  // Aggregate principal vs interest into yearly buckets for the chart.
  const years: YearRow[] = [];
  const yCount = Math.ceil(actSched.length / 12);
  for (let y = 0; y < yCount && y < 40; y++) {
    const slice = actSched.slice(y * 12, (y + 1) * 12);
    years.push({
      year: "Yr " + (y + 1),
      principal: Math.round(slice.reduce((a, m) => a + m.prin, 0)),
      interest: Math.round(slice.reduce((a, m) => a + m.int, 0)),
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const accelerated = inp.extraMonthly > 0 && payoffMonths < n;
  const payoffLabel = (Math.ceil(payoffMonths / 12) + " yr " + (payoffMonths % 12) + " mo").replace(" 0 mo", "");

  const breakdown = [
    { label: "Loan Amount (Principal)", value: fmt(principal) },
    { label: "Interest Rate", value: inp.interestRate + "% APR" },
    { label: "Loan Term", value: inp.termYears + " years (" + n + " months)" },
    { label: "Monthly EMI", value: fmtD(emi), highlight: true },
    { label: "Extra Monthly Payment", value: accelerated ? fmtD(inp.extraMonthly) : "None", highlight: accelerated },
    { label: "Payoff Time", value: payoffLabel, isTotal: true },
    { label: "Total Interest Paid", value: fmt(totalInterest), highlight: true },
    { label: "Total Payment", value: fmt(totalPayment), isTotal: true },
    { label: "Interest Saved vs Standard", value: fmt(interestSaved), highlight: accelerated },
  ];

  const summaryStats = [
    { label: "Monthly EMI", value: fmtD(emi) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Payment", value: fmt(totalPayment) },
    { label: "Payoff Time", value: payoffLabel },
    { label: "Principal", value: fmt(principal) },
    { label: "Interest Saved", value: fmt(interestSaved) },
    { label: "Term (Months)", value: String(n) },
    { label: "Payments Made", value: String(payoffMonths) },
  ];

  return { monthlyEmi: emi, totalInterest, totalPayment, payoffMonths, interestSaved, years, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 300000, interestRate: 6.5, termYears: 20, extraMonthly: 0 };

export default function HomeLoanEmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

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

  const loan = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const extra = parseFloat(extraMonthly) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || loan <= 0) valErrors.loanAmount = "Loan Amount must be greater than $0";
  if (!interestRate || rate <= 0) valErrors.interestRate = "Interest Rate must be greater than 0%";
  else if (rate > 25) valErrors.interestRate = "Interest Rate must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  if (extra < 0) valErrors.extraMonthly = "Extra payment must be 0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Loan EMI Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Loan EMI Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Prepayment</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly EMI</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyEmi.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{loan.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} for {termYears} years at {interestRate}%</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-red-500"], ["Total Payment", "$" + Math.round(result.totalPayment).toLocaleString("en-US"), "text-amber-600"], ["Payoff Time", result.payoffMonths + " mo", "text-emerald-600"]].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Yearly Principal vs Interest</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.years} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number) => ["$" + Math.round(v).toLocaleString("en-US"), ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="principal" name="Principal Paid" stackId="a"><Cell fill="#2563eb" /></Bar>
                  <Bar dataKey="interest" name="Interest Paid" stackId="a" radius={[3, 3, 0, 0]}><Cell fill="#f59e0b" /></Bar>
                </BarChart>
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
          <h2 className="text-2xl font-bold mb-3">Understanding Your Home Loan EMI</h2>
          <p>Your Equated Monthly Installment (EMI) is the fixed payment you make each month to repay your home loan. It is calculated as EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where P is the principal, r is the monthly interest rate, and n is the number of monthly payments. Early in the loan most of each payment covers interest; as the balance shrinks, more goes toward principal. Adding an extra monthly payment shortens your payoff time and can save tens of thousands in interest over a 20-year term.</p>
        </section>
        <FAQSection faqs={[
          { question: "How is home loan EMI calculated?", answer: "EMI uses the standard annuity formula: EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1), where P is the loan principal, r is the monthly interest rate (annual rate ÷ 12), and n is the number of monthly payments (years × 12)." },
          { question: "Does a longer loan term mean lower EMI?", answer: "Yes. Spreading the loan over more months lowers each payment, but you pay interest for longer, so total interest rises. This calculator lets you compare by adjusting the term." },
          { question: "How much does an extra monthly payment save?", answer: "Every extra dollar goes directly to principal, skipping future interest on that amount. Use the Advanced Options to add an extra monthly payment and see your new payoff time and total interest saved." },
        ]} pageUrl="https://racira.com/calculator/home-loan-emi-calculator" />
        <PopularCalculators exclude="/calculator/home-loan-emi-calculator" />
      </div>
    </div>
  </>);
}
