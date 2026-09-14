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
  termYears: number;
  extraMonthly: number;
  lumpSum: number;
}

interface Result {
  monthlyPayment: number;
  standardMonths: number;
  extraMonths: number;
  yearsSaved: string;
  monthsSaved: number;
  interestStandard: number;
  interestExtra: number;
  interestSaved: number;
  chartData: { label: string; standard: number; accelerated: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const r = inp.apr / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (inp.balance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inp.balance / n;

  // Standard schedule
  let balS = inp.balance;
  let intS = 0;
  let moS = 0;
  while (balS > 0.5 && moS < n + 1) {
    moS++;
    const int = balS * r;
    intS += int;
    balS = balS + int - Math.min(monthlyPayment, balS + int);
  }

  // Accelerated: extra monthly payment plus a one-time lump sum in month 1
  let balE = inp.balance - Math.min(inp.lumpSum, inp.balance);
  let intE = 0;
  let moE = 0;
  const totalMonthly = monthlyPayment + inp.extraMonthly;
  while (balE > 0.5 && moE < n + 1) {
    moE++;
    const int = balE * r;
    intE += int;
    balE = balE + int - Math.min(totalMonthly, balE + int);
  }
  const monthsSaved = moS - moE;
  const interestSaved = Math.max(0, intS - intE);
  const yearsSaved = monthsSaved >= 12 ? Math.floor(monthsSaved / 12) + " yr " + (monthsSaved % 12) + " mo" : monthsSaved + " mo";

  const chartData: { label: string; standard: number; accelerated: number }[] = [];
  for (let y = 0; y <= inp.termYears; y++) {
    const mi = y * 12;
    chartData.push({
      label: y === 0 ? "Start" : "Yr " + y,
      standard: mi >= moS ? 0 : Math.round(balAfter(inp.balance, r, monthlyPayment, mi)),
      accelerated: mi >= moE ? 0 : Math.round(balAfter(inp.balance - Math.min(inp.lumpSum, inp.balance), r, totalMonthly, mi)),
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Mortgage Balance", value: fmt(inp.balance) },
    { label: "APR", value: inp.apr + "%" },
    { label: "Original Term", value: inp.termYears + " years" },
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Extra Monthly Payment", value: fmtD(inp.extraMonthly), highlight: true },
    { label: "Lump Sum Payment", value: fmt(inp.lumpSum), highlight: true },
    { label: "Standard Payoff", value: moS + " months" },
    { label: "Accelerated Payoff", value: moE + " months", highlight: true },
    { label: "Time Saved", value: yearsSaved },
    { label: "Interest (Standard)", value: fmt(intS) },
    { label: "Interest (Accelerated)", value: fmt(intE) },
    { label: "Interest Saved", value: fmt(interestSaved), isTotal: true },
  ];

  const summaryStats = [
    { label: "Standard Payment", value: fmtD(monthlyPayment) },
    { label: "Accelerated Payment", value: fmtD(totalMonthly) },
    { label: "Lump Sum", value: fmt(inp.lumpSum) },
    { label: "Accelerated Payoff", value: moE + " months" },
    { label: "Time Saved", value: yearsSaved },
    { label: "Interest Saved", value: fmt(interestSaved) },
    { label: "Interest (Standard)", value: fmt(intS) },
    { label: "Interest (Accelerated)", value: fmt(intE) },
  ];

  return { monthlyPayment, standardMonths: moS, extraMonths: moE, yearsSaved, monthsSaved, interestStandard: intS, interestExtra: intE, interestSaved, chartData, breakdown, summaryStats };

  function balAfter(p: number, rr: number, pay: number, months: number) {
    let b = p;
    for (let m = 0; m < months && b > 0.5; m++) {
      const int = b * rr;
      b = b + int - Math.min(pay, b + int);
    }
    return b;
  }
}

const DEFAULTS: Inputs = { balance: 300000, apr: 6.5, termYears: 30, extraMonthly: 200, lumpSum: 0 };

export default function ExtraPaymentMortgageCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [lumpSum, setLumpSum] = useState(String(DEFAULTS.lumpSum));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    termYears: parseInt(termYears) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    lumpSum: parseFloat(lumpSum) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setTermYears(String(DEFAULTS.termYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setLumpSum(String(DEFAULTS.lumpSum));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const bal = parseFloat(balance) || 0;
  const rate = parseFloat(apr) || 0;
  const term = parseInt(termYears) || 0;
  const extra = parseFloat(extraMonthly) || 0;
  const lump = parseFloat(lumpSum) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Mortgage balance must be greater than $0";
  if (!apr || rate <= 0) valErrors.apr = "APR must be greater than 0%";
  else if (rate > 25) valErrors.apr = "APR must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  if (extra < 0) valErrors.extraMonthly = "Extra payment must be $0 or more";
  if (lump < 0) valErrors.lumpSum = "Lump sum must be $0 or more";
  else if (lump >= bal) valErrors.lumpSum = "Lump sum must be less than the balance";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Extra Payment Mortgage Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Extra Payment Mortgage Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Mortgage Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={c} /></div>{valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">APR (%)</label><div className={i}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}</div>
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
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Extra Payments</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Extra Monthly Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} className={c} /></div>{valErrors.extraMonthly && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.extraMonthly}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">One-Time Lump Sum ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={lumpSum} onChange={e => setLumpSum(e.target.value)} className={c} /></div>{valErrors.lumpSum && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.lumpSum}</p>}</div>
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
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.extraMonths} <span className="text-2xl">months</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthsSaved > 0 ? result.monthsSaved + " months sooner than standard · " : "Same as standard · "}{result.interestSaved.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} interest saved</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Standard Payment", result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo", "text-primary"],
                ["Interest Saved", result.interestSaved.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-emerald-600"],
                ["Time Saved", result.yearsSaved, "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Remaining Balance: Standard vs Accelerated</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "standard" ? "Standard" : "Accelerated", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "standard" ? "Standard" : "Accelerated")} />
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
                {result.summaryStats.map((s, idx) => (
                  <div key={idx} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Every Extra Dollar Compounds Twice</h2>
          <p>An extra payment on a mortgage is one of the highest-return moves available to a homeowner, because it earns your mortgage rate for the entire remaining life of the loan. On a $300,000 mortgage at 6.5%, adding $200 a month is the same as finding a guaranteed 6.5% after-tax return — and it shortens the loan by years. The effect is even bigger than it looks: because each extra dollar skips the interest it would otherwise have carried, the savings snowball the earlier you start. A single $10,000 lump sum in the first year of that same loan saves more than $50,000 in interest and retires the mortgage three years early. Just confirm your servicer applies extra payments to principal, not to next month's bill.</p>
        </section>
        <FAQSection faqs={[
          { question: "Do extra payments always go to principal?", answer: "Not automatically. Some servicers treat extra money as a prepayment of next month's bill unless you instruct otherwise. Ask them to apply it to principal, or your payoff won't accelerate at all." },
          { question: "Is paying extra better than investing?", answer: "It depends on your rate versus your expected investment return, after tax. At a 6.5% mortgage rate, paying extra is a risk-free 6.5% return — hard to beat in bonds. If your mortgage is under 4%, investing the money historically wins over a long horizon." },
          { question: "What if I have other debts?", answer: "Pay off higher-rate debt first — credit cards and personal loans usually cost far more than a mortgage. If your emergency fund is thin, build that up first too; extra mortgage payments are hard to get back out of your home." },
        ]} pageUrl="https://racira.com/calculator/extra-payment-mortgage-calculator" />
        <PopularCalculators exclude="/calculator/extra-payment-mortgage-calculator" />
      </div>
    </div>
  </>);
}
