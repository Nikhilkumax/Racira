"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  reductionPct: number;
}

interface Result {
  firstYearPayment: number;
  finalYearPayment: number;
  totalPayments: number;
  totalInterest: number;
  balloonBalance: number;
  flatPayment: number;
  flatInterest: number;
  chartData: { label: string; payment: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(p: number, r: number, n: number): number {
  if (r <= 0) return p / n;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const flatPayment = pmt(inp.loanAmount, r, n);
  const reduction = inp.reductionPct / 100;

  // Month-by-month with yearly step-downs; payments that can't cover interest
  // leave a balloon at the end of the term.
  let bal = inp.loanAmount;
  let totalPayments = 0;
  let totalInterest = 0;
  let firstYearPayment = flatPayment;
  let finalYearPayment = flatPayment;
  const yearly: number[] = [];
  for (let m = 1; m <= n; m++) {
    const yr = Math.floor((m - 1) / 12);
    const pay = flatPayment * Math.pow(1 - reduction, yr);
    if (yr === 0 && m === 1) firstYearPayment = pay;
    if (yr === inp.termYears - 1 && m === (inp.termYears - 1) * 12 + 1) finalYearPayment = pay;
    const int = bal * r;
    totalInterest += int;
    const applied = Math.min(pay, bal + int);
    totalPayments += applied;
    bal = bal + int - applied;
    if (yearly[yr] === undefined) yearly[yr] = 0;
    yearly[yr] += applied;
  }
  const balloonBalance = Math.max(0, bal);
  const flatInterest = flatPayment * n - inp.loanAmount;

  const chartData = yearly.map((v, yr) => ({ label: "Yr " + (yr + 1), payment: Math.round(v) }));

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Interest Rate", value: inp.interestRate + "%" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Annual Payment Reduction", value: inp.reductionPct + "%" },
    { label: "First-Year Payment", value: fmtD(firstYearPayment), highlight: true },
    { label: "Final-Year Payment", value: fmtD(finalYearPayment), highlight: true },
    { label: "Total Payments", value: fmt(totalPayments) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Balloon at Term End", value: fmt(balloonBalance), highlight: true },
    { label: "Flat-Loan Comparison Payment", value: fmtD(flatPayment) },
    { label: "Flat-Loan Total Interest", value: fmt(flatInterest) },
    { label: "Interest Saved vs Flat Loan", value: fmt(Math.max(0, flatInterest - totalInterest)), isTotal: true },
  ];

  const summaryStats = [
    { label: "First-Year Payment", value: fmtD(firstYearPayment) },
    { label: "Final-Year Payment", value: fmtD(finalYearPayment) },
    { label: "Total Payments", value: fmt(totalPayments) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Balloon at Term End", value: fmt(balloonBalance) },
    { label: "Flat-Loan Payment", value: fmtD(flatPayment) },
    { label: "Flat-Loan Interest", value: fmt(flatInterest) },
    { label: "Interest Saved", value: fmt(Math.max(0, flatInterest - totalInterest)) },
  ];

  return { firstYearPayment, finalYearPayment, totalPayments, totalInterest, balloonBalance, flatPayment, flatInterest, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 20000, interestRate: 8, termYears: 5, reductionPct: 10 };

export default function StepDownLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [reductionPct, setReductionPct] = useState(String(DEFAULTS.reductionPct));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 0,
    reductionPct: parseFloat(reductionPct) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setReductionPct(String(DEFAULTS.reductionPct));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const reduction = parseFloat(reductionPct) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (rate <= 0 || rate > 25) valErrors.interestRate = "Interest rate must be 0–25%";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 10) valErrors.termYears = "Step-down loans rarely exceed 10 years";
  if (reduction < 0 || reduction > 25) valErrors.reductionPct = "Annual reduction must be 0–25%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Step-Down Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Step-Down Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Annual Payment Reduction (%)</label><div className={i}><input type="number" value={reductionPct} onChange={e => setReductionPct(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.reductionPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.reductionPct}</p>}</div>
          </div>
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">First-Year Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.firstYearPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Drops {reduction}% each year to {result.finalYearPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo in year {term}{result.balloonBalance > 0 ? " · " + result.balloonBalance.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + " balloon remains" : " · fully paid by term end"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Final-Year Payment", result.finalYearPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["Balloon at Term End", result.balloonBalance > 0 ? "$" + Math.round(result.balloonBalance).toLocaleString("en-US") : "$0", result.balloonBalance > 0 ? "text-red-600" : "text-emerald-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Payment by Year</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 100) + "00"} />
                  <Tooltip formatter={(v: number) => ["Payment", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="payment" name="Monthly Payment (annual avg)" fill="#2563eb" radius={[4, 4, 0, 0]} />
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
          <h2 className="text-2xl font-bold mb-3">Payments That Shrink Every Year</h2>
          <p>A step-down loan starts with a higher payment and reduces it by a set percentage each year — designed for borrowers whose income is expected to fall, or who want to front-load debt while earning more. The trade-off is exactly the reverse of a graduated payment: you pay more early, so the balance shrinks faster, and total interest usually beats a flat loan at the same rate. But watch the tail. If the annual reduction is steep and your balance is still large, the later payments can fall below the monthly interest — and the loan stops shrinking, leaving a balloon at term end. This calculator shows that balloon explicitly. As a rule, keep the reduction modest enough that every year's payment still exceeds the interest on the remaining balance.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a step-down loan?", answer: "A loan whose payment declines by a fixed percentage each year instead of staying level. It suits borrowers who expect lower future income, or who want to pay down debt aggressively early when they can afford more." },
          { question: "How does it compare to a flat payment?", answer: "Because early payments are larger, the balance falls faster and total interest is usually lower than a level-payment loan at the same rate. The higher early payments are the price of that saving." },
          { question: "What happens if the payment drops below the interest?", answer: "The balance stops decreasing — or starts growing. That leaves a balloon payment at the end of the term. Keep the yearly reduction small enough that every payment still exceeds monthly interest on the remaining balance." },
        ]} pageUrl="https://racira.com/calculator/step-down-loan-payment-calculator" />
        <PopularCalculators exclude="/calculator/step-down-loan-payment-calculator" />
      </div>
    </div>
  </>);
}