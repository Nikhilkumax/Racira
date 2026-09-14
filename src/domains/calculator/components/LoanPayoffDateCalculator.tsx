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
  monthlyPayment: number;
  extraMonthly: number;
}

interface Result {
  payoffMonths: number;
  payoffDate: string;
  totalInterest: number;
  totalPaid: number;
  finalPayment: number;
  chartData: { label: string; balance: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function calc(inp: Inputs): Result {
  const r = inp.apr / 100 / 12;
  const totalMonthly = inp.monthlyPayment + inp.extraMonthly;
  // Simulate month by month, tracking the final short payment
  let bal = inp.balance;
  let months = 0;
  let intAccum = 0;
  let lastPay = 0;
  while (bal > 0.5 && months < 600) {
    months++;
    const int = bal * r;
    intAccum += int;
    const pay = Math.min(totalMonthly, bal + int);
    bal = bal + int - pay;
    lastPay = pay;
  }

  const now = new Date();
  const payoff = new Date(now.getFullYear(), now.getMonth() + months, 1);
  const payoffDate = MONTHS[payoff.getMonth()] + " " + payoff.getFullYear();

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const chartData: { label: string; balance: number }[] = [];
  let cb = inp.balance;
  chartData.push({ label: "Now", balance: Math.round(cb) });
  for (let m = 1; m <= months; m++) {
    const int = cb * r;
    cb = cb + int - Math.min(totalMonthly, cb + int);
    if (m % 6 === 0 || m === months) {
      chartData.push({ label: m === months ? "Paid" : "Mo " + m, balance: Math.max(0, Math.round(cb)) });
    }
  }

  const breakdown = [
    { label: "Current Balance", value: fmt(inp.balance) },
    { label: "APR", value: inp.apr + "%" },
    { label: "Monthly Payment", value: fmtD(inp.monthlyPayment) },
    { label: "Extra Monthly Payment", value: fmtD(inp.extraMonthly), highlight: true },
    { label: "Total Monthly (With Extra)", value: fmtD(totalMonthly), highlight: true },
    { label: "Payoff Date", value: payoffDate },
    { label: "Months to Payoff", value: months + " months" },
    { label: "Final Payment", value: fmtD(lastPay) },
    { label: "Total Interest", value: fmt(intAccum), isTotal: true },
    { label: "Total Paid", value: fmt(inp.balance + intAccum), isTotal: true },
  ];

  const summaryStats = [
    { label: "Payoff Date", value: payoffDate },
    { label: "Months to Payoff", value: months + " months" },
    { label: "Monthly Payment", value: fmtD(totalMonthly) },
    { label: "Final Payment", value: fmtD(lastPay) },
    { label: "Total Interest", value: fmt(intAccum) },
    { label: "Total Paid", value: fmt(inp.balance + intAccum) },
  ];

  return { payoffMonths: months, payoffDate, totalInterest: intAccum, totalPaid: inp.balance + intAccum, finalPayment: lastPay, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { balance: 15000, apr: 7, monthlyPayment: 400, extraMonthly: 0 };

export default function LoanPayoffDateCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const bal = parseFloat(balance) || 0;
  const rate = parseFloat(apr) || 0;
  const payment = parseFloat(monthlyPayment) || 0;
  const extra = parseFloat(extraMonthly) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Balance must be greater than $0";
  if (!apr || rate <= 0) valErrors.apr = "APR must be greater than 0%";
  else if (rate > 40) valErrors.apr = "APR must be 40% or less";
  if (!monthlyPayment || payment <= 0) valErrors.monthlyPayment = "Payment must be greater than $0";
  if (extra < 0) valErrors.extraMonthly = "Extra payment must be $0 or more";
  if (payment + extra <= (bal * rate) / 100 / 12 && bal > 0 && rate > 0)
    valErrors.monthlyPayment = "Payments must exceed monthly interest of " + "$" + ((bal * rate) / 100 / 12).toFixed(2) + " or the loan never gets paid off";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Payoff Date Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Payoff Date Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Current Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={c} /></div>{valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">APR (%)</label><div className={i}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Monthly Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} className={c} /></div>{valErrors.monthlyPayment && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyPayment}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Payoff Date</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.payoffDate}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.payoffMonths} months of {(payment + extra).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo · {result.totalInterest.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} in interest</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Monthly", (payment + extra).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["Months to Payoff", result.payoffMonths + " months", "text-emerald-600"],
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
                  <Tooltip formatter={(v: number) => ["Balance", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="balance" name="Remaining Balance" stroke="#2563eb" strokeWidth={2} dot={false} />
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
          <h2 className="text-2xl font-bold mb-3">Know the Date, Not Just the Payment</h2>
          <p>Every loan statement shows your minimum payment, but almost none show the finish line: the exact month the balance hits zero at the amount you actually pay. That date is worth knowing because it converts an abstract balance into a concrete milestone — and because small changes in the payment move it dramatically. Paying an extra $50 a month on a $15,000 loan at 7% can retire the debt nearly a year early and cut the interest bill by hundreds of dollars. The math is simple monthly compounding: each payment first covers the interest that accrued, and only what remains touches principal, so any payment that merely matches the monthly interest keeps you in debt forever.</p>
        </section>
        <FAQSection faqs={[
          { question: "How is the payoff date calculated?", answer: "The calculator simulates your loan month by month: each payment is applied to accrued interest first, with the remainder reducing principal, until the balance reaches zero. The payoff date is that month added to today's date." },
          { question: "Why does my payment barely reduce the balance?", answer: "Early in a loan, most of each payment is interest. If your payment only covers the monthly interest charge — interest rate times balance divided by 12 — principal never declines and the loan never ends. Paying more than the minimum is the only way to accelerate." },
          { question: "Does paying biweekly change the payoff date?", answer: "Yes — 26 half-payments a year equals 13 full payments, so one extra payment lands each year directly on principal. That can move your payoff date years earlier on long loans; check with your lender that extra payments are applied to principal." },
        ]} pageUrl="https://racira.com/calculator/loan-payoff-date-calculator" />
        <PopularCalculators exclude="/calculator/loan-payoff-date-calculator" />
      </div>
    </div>
  </>);
}
