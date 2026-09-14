"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  feePct: number;
}

interface Result {
  monthlyPayment: number;
  totalInterest: number;
  feeAmount: number;
  totalCost: number;
  effectiveApr: number;
  chartData: { label: string; principal: number; interest: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(p: number, r: number, n: number): number {
  if (r <= 0) return p / n;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Effective APR: the monthly rate where the fee-reduced proceeds equal the
// present value of the fixed payments (bisection on the annuity factor).
function effectiveApr(amount: number, fee: number, payment: number, n: number): number {
  if (payment <= 0 || n <= 0) return 0;
  const target = Math.max(0.01, amount - fee);
  let lo = 0;
  let hi = 0.5;
  for (let iter = 0; iter < 80; iter++) {
    const mid = (lo + hi) / 2;
    const pv = mid === 0 ? payment * n : (payment * (1 - Math.pow(1 + mid, -n))) / mid;
    if (pv > target) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.termMonths;
  const monthlyPayment = pmt(inp.loanAmount, r, n);
  const totalInterest = monthlyPayment * n - inp.loanAmount;
  const feeAmount = (inp.loanAmount * inp.feePct) / 100;
  const totalCost = totalInterest + feeAmount;
  const effApr = effectiveApr(inp.loanAmount, feeAmount, monthlyPayment, n);

  const chartMap = new Map<number, { principal: number; interest: number }>();
  let bal = inp.loanAmount;
  for (let m = 1; m <= n; m++) {
    const int = bal * r;
    const prin = monthlyPayment - int;
    bal = Math.max(0, bal - prin);
    const yr = Math.floor((m - 1) / 12);
    const cur = chartMap.get(yr) || { principal: 0, interest: 0 };
    cur.principal += prin;
    cur.interest += int;
    chartMap.set(yr, cur);
  }
  const chartData = [...chartMap.entries()].map(([yr, v]) => ({
    label: "Yr " + (yr + 1),
    principal: Math.round(v.principal),
    interest: Math.round(v.interest),
  }));

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Interest Rate (Nominal)", value: inp.interestRate + "%" },
    { label: "Loan Term", value: n + " months" },
    { label: "Monthly Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Admin / Origination Fee (" + inp.feePct + "%)", value: fmt(feeAmount) },
    { label: "Effective APR (Incl. Fee)", value: effApr.toFixed(2) + "%", highlight: true },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost to Borrow", value: fmt(totalCost), isTotal: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Loan Term", value: n + " months" },
    { label: "Admin / Origination Fee", value: fmt(feeAmount) },
    { label: "Effective APR", value: effApr.toFixed(2) + "%" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost to Borrow", value: fmt(totalCost) },
  ];

  return { monthlyPayment, totalInterest, feeAmount, totalCost, effectiveApr: effApr, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 10000, interestRate: 9, termMonths: 36, feePct: 1.5 };

export default function MicroloanRepaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [feePct, setFeePct] = useState(String(DEFAULTS.feePct));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termMonths: parseInt(termMonths) || 0,
    feePct: parseFloat(feePct) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermMonths(String(DEFAULTS.termMonths));
    setFeePct(String(DEFAULTS.feePct));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termMonths) || 0;
  const fee = parseFloat(feePct) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (rate <= 0 || rate > 25) valErrors.interestRate = "Interest rate must be 0–25%";
  if (!termMonths || term <= 0) valErrors.termMonths = "Term must be greater than 0 months";
  else if (term > 120) valErrors.termMonths = "Microloan terms rarely exceed 120 months";
  if (fee < 0 || fee > 10) valErrors.feePct = "Fee must be 0–10%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Microloan Repayment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Microloan Repayment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Months)</label><div className={i}><input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>{valErrors.termMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termMonths}</p>}</div>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fees</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Admin / Origination Fee (%)</label><div className={i}><input type="number" value={feePct} onChange={e => setFeePct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.feePct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.feePct}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Over {term} months · effective APR of {result.effectiveApr.toFixed(2)}% once the {fee}% fee is included</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment", result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["Total Cost (Incl. Fee)", "$" + Math.round(result.totalCost).toLocaleString("en-US"), "text-red-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Principal vs Interest by Year</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "principal" ? "Principal" : "Interest", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "principal" ? "Principal" : "Interest")} />
                  <Bar dataKey="principal" stackId="a" fill="#2563eb" />
                  <Bar dataKey="interest" stackId="a" fill="#f59e0b" />
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
          <h2 className="text-2xl font-bold mb-3">Small Loans, Real Math</h2>
          <p>Microloans — typically $500 to $50,000 — are the entry point to business credit for startups, home-based businesses, and first-time borrowers. The SBA Microloan program lends through nonprofit intermediaries at rates around 8–13%, and mission lenders like Kiva and Accion fill the gap below that. Because the amounts are small, the monthly payment math is forgiving, but two details deserve attention. First, many intermediaries charge an origination or administration fee of 1–3%, which this calculator converts into the effective APR you're really paying. Second, microlenders underwrite character and plan, not just credit score — a solid repayment schedule is often what lands the loan, and showing a lender your real monthly number builds the trust that wins the yes.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a microloan?", answer: "A small business loan, typically $500 to $50,000, offered by nonprofit lenders, community development organizations, and the SBA Microloan program. They serve startups and small businesses that don't qualify for conventional bank credit." },
          { question: "What does the effective APR include?", answer: "The nominal rate plus the impact of any upfront origination or administration fee. A 9% loan with a 1.5% fee is really costing closer to 10%, because the fee reduces the money you actually receive while the payments stay fixed." },
          { question: "Do I need good credit for a microloan?", answer: "Microlenders weigh your business plan, cash flow, and character heavily, so scores below traditional thresholds can still qualify. Expect a personal guarantee, and often required business counseling or training as part of the program." },
        ]} pageUrl="https://racira.com/calculator/microloan-repayment-calculator" />
        <PopularCalculators exclude="/calculator/microloan-repayment-calculator" />
      </div>
    </div>
  </>);
}