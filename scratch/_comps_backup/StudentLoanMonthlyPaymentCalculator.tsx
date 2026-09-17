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
  rate: number;
  termYears: number;
  extraMonthly: number;
  autopay: number; // 0 or 0.25
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  monthlyPayment: number;
  effectiveRate: number;
  payoffMonths: number;
  payoffLabel: string;
  totalInterest: number;
  totalPaid: number;
  interestSaved: number;
  monthsSaved: number;
  chartData: { label: string; standard: number | null; accelerated: number | null }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function pmt(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate <= 0) return months > 0 ? principal / months : 0;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function simulate(balance: number, monthlyRate: number, payment: number, maxMonths: number) {
  let bal = balance;
  let interest = 0;
  let months = 0;
  while (bal > 0.5 && months < maxMonths) {
    months++;
    const int = bal * monthlyRate;
    interest += int;
    bal = bal + int - Math.min(payment, bal + int);
  }
  return { months, interest };
}

function calc(inp: Inputs): Result {
  const effRate = Math.max(0, inp.rate - inp.autopay);
  const r = effRate / 100 / 12;
  const n = inp.termYears * 12;
  const scheduled = pmt(inp.balance, r, n);
  const actualPayment = scheduled + inp.extraMonthly;

  const std = simulate(inp.balance, r, scheduled, n);
  const act = simulate(inp.balance, r, actualPayment, n);

  const payoff = new Date(new Date().getFullYear(), new Date().getMonth() + act.months, 1);
  const payoffLabel = act.months + " months (" + MONTHS[payoff.getMonth()] + " " + payoff.getFullYear() + ")";
  const totalInterest = inp.extraMonthly > 0 ? act.interest : std.interest;
  const totalPaid = inp.balance + totalInterest;
  const interestSaved = inp.extraMonthly > 0 ? Math.max(0, std.interest - act.interest) : 0;
  const monthsSaved = inp.extraMonthly > 0 ? Math.max(0, std.months - act.months) : 0;

  const chartData: { label: string; standard: number | null; accelerated: number | null }[] = [];
  const maxM = Math.max(std.months, act.months);
  let sb = inp.balance;
  let ab = inp.balance;
  chartData.push({ label: "Now", standard: Math.round(inp.balance), accelerated: Math.round(inp.balance) });
  for (let m = 1; m <= maxM; m++) {
    if (m <= std.months) {
      const si = sb * r;
      sb = sb + si - Math.min(scheduled, sb + si);
    }
    if (m <= act.months) {
      const ai = ab * r;
      ab = ab + ai - Math.min(actualPayment, ab + ai);
    }
    if (m % 12 === 0 || m === maxM) {
      chartData.push({
        label: m % 12 === 0 ? "Yr " + m / 12 : "Yr " + (m / 12).toFixed(1),
        standard: m <= std.months ? Math.max(0, Math.round(sb)) : 0,
        accelerated: m <= act.months ? Math.max(0, Math.round(ab)) : null,
      });
    }
  }
  if (inp.extraMonthly <= 0) chartData.forEach((d) => (d.accelerated = null));

  const rateLabel =
    inp.autopay > 0
      ? inp.rate.toFixed(2) + "%"
      : inp.rate.toFixed(2) + "%";
  const effLabel = effRate.toFixed(2) + "%";

  const breakdown: Row[] = [
    { label: "Loan Balance", value: money(inp.balance), sum: true },
    { label: "Stated Interest Rate", value: rateLabel },
    { label: "Auto-Pay Discount", value: inp.autopay > 0 ? inp.autopay.toFixed(2) + "%" : "None", highlight: inp.autopay > 0 },
    { label: "Effective Interest Rate", value: effLabel, sum: true },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Monthly Payment", value: money2(scheduled), highlight: true, sum: true },
  ];
  if (inp.extraMonthly > 0) {
    breakdown.push({ label: "Extra Monthly Payment", value: money2(inp.extraMonthly), highlight: true });
  }
  breakdown.push(
    { label: "Payoff Time", value: payoffLabel, sum: true },
    { label: "Total Interest", value: money(totalInterest), isTotal: true, sum: true },
    { label: "Total Paid", value: money(totalPaid), isTotal: true, sum: true }
  );
  if (inp.extraMonthly > 0) {
    breakdown.push(
      { label: "Interest Saved (Extra Payments)", value: money(interestSaved), highlight: true, sum: true },
      { label: "Time Saved (Extra Payments)", value: monthsSaved + " months", highlight: true, sum: true }
    );
  }

  const summaryStats = breakdown.filter((r) => r.sum).map((r) => ({ label: r.label, value: r.value }));

  return {
    monthlyPayment: scheduled,
    effectiveRate: effRate,
    payoffMonths: act.months,
    payoffLabel,
    totalInterest,
    totalPaid,
    interestSaved,
    monthsSaved,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { balance: 35000, rate: 6.5, termYears: 10, extraMonthly: 0, autopay: 0.25 };

export default function StudentLoanMonthlyPaymentCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [autopay, setAutopay] = useState(DEFAULTS.autopay === 0.25 ? "0.25" : "0");
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseInt(termYears) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    autopay: parseFloat(autopay) || 0,
  });

  const run = (i: Inputs) => setResult(calc(i));
  const calcNow = () => run(g());
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setAutopay(String(DEFAULTS.autopay));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const bal = parseFloat(balance) || 0;
  const rt = parseFloat(rate) || 0;
  const yrs = parseInt(termYears) || 0;
  const extra = parseFloat(extraMonthly) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Loan balance must be greater than $0";
  if (isNaN(parseFloat(rate)) || rate === "") valErrors.rate = "Enter an interest rate";
  else if (rt < 0 || rt > 30) valErrors.rate = "Interest rate must be between 0% and 30%";
  if (isNaN(parseInt(termYears)) || yrs < 1 || yrs > 40) valErrors.termYears = "Term must be 1–40 years";
  if (extra < 0) valErrors.extraMonthly = "Extra payment must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const shownRate = Math.max(0, rt - (parseFloat(autopay) || 0));
  const shownPayment = pmt(bal, shownRate / 100 / 12, yrs * 12);
  const monthlyInterest = bal > 0 && shownRate > 0 ? (bal * (shownRate / 100)) / 12 : 0;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Student Loan Monthly Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Loan Monthly Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sl-balance" className="text-sm font-medium mb-1 block">Loan Balance ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="sl-balance" type="number" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}
              </div>
              <div>
                <label htmlFor="sl-rate" className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                <div className={inputCls}>
                  <input id="sl-rate" type="number" min="0" max="30" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sl-term" className="text-sm font-medium mb-1 block">Loan Term (Years)</label>
                <div className={inputCls}>
                  <input id="sl-term" type="number" min="1" max="40" value={termYears} onChange={(e) => setTermYears(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">yrs</span>
                </div>
                {valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}
              </div>
              <div>
                <label htmlFor="sl-autopay" className="text-sm font-medium mb-1 block">Auto-Pay Discount</label>
                <div className="relative h-10">
                  <select id="sl-autopay" value={autopay} onChange={(e) => setAutopay(e.target.value)} className="w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium">
                    <option value="0.25">0.25% (enrolled)</option>
                    <option value="0">None</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Repayment Settings</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="sl-extra" className="text-sm font-medium mb-1 block">Extra Monthly Payment ($)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="sl-extra" type="number" min="0" step="5" value={extraMonthly} onChange={(e) => setExtraMonthly(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.extraMonthly && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.extraMonthly}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">Any extra amount is applied straight to principal every month.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
            {!hasErrors && bal > 0 && yrs > 0 && shownPayment <= monthlyInterest && (
              <p className="text-xs text-amber-600 font-semibold bg-amber-500/10 border border-amber-500/20 p-2 rounded-md">Payments must exceed the monthly interest of {money2(monthlyInterest)} or the loan never gets paid off.</p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(result.monthlyPayment)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.effectiveRate.toFixed(2)}% APR over {termYears || "10"} years · {result.payoffLabel} · {money(result.totalInterest)} in interest
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Monthly Payment", money2(result.monthlyPayment), "text-primary"],
                    ["Total Interest", money(result.totalInterest), "text-amber-600"],
                    ["Payoff Time", result.payoffLabel, "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-sm font-bold leading-tight ${color}`}>{v}</div>
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
                      <Tooltip formatter={(v: number, name: string) => [name === "standard" ? "Standard plan" : "With extra payment", "$" + Math.round(v).toLocaleString("en-US")]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="standard" name="Standard plan" stroke="#2563eb" strokeWidth={2} dot={false} />
                      {result.chartData.some((d) => d.accelerated !== null) && (
                        <Line type="monotone" dataKey="accelerated" name="With extra payment" stroke="#10b981" strokeWidth={2} dot={false} />
                      )}
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
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Your Payment Is Set by Three Numbers</h2>
            <p>The monthly payment on a federal or private student loan is determined by just three numbers: the balance you owe, the interest rate on the loan, and the repayment term you pick. Most borrowers land on the standard 10-year plan, where the payment is fixed for the life of the loan and every dollar is split between accrued interest and principal. Federal loans add a useful twist: enroll in auto-pay and most servicers cut your rate by 0.25%, which shaves real money off a decade of payments. This calculator applies that discount to the rate, then runs the full amortization month by month so the interest total, payoff date, and any extra-payment savings all come from the same schedule.</p>
          </section>
          <FAQSection faqs={[
            { question: "How is my student loan monthly payment calculated?", answer: "The calculator uses the standard amortization formula: your balance is paid down at your monthly rate over the chosen term, with each payment covering that month's interest first and the rest going to principal. The auto-pay discount, when enrolled, is subtracted from your rate before the payment is computed." },
            { question: "Does the 0.25% auto-pay discount really matter?", answer: "Yes. On a $35,000 loan at 6.5% over 10 years, the 0.25% discount lowers the effective rate to 6.25% and saves roughly $40–$60 in total interest while keeping the same payoff date. Servicers require you to stay enrolled and make payments automatically from a bank account." },
            { question: "What happens if I pay extra each month?", answer: "Extra payments go directly to principal, so you pay down the balance faster, cut total interest, and finish early. The calculator shows the accelerated balance curve, the months saved, and the interest saved versus the standard 10-year schedule." },
          ]} pageUrl="https://racira.com/calculator/student-loan-monthly-payment-calculator" />
          <PopularCalculators exclude="/calculator/student-loan-monthly-payment-calculator" />
        </div>
      </div>
    </>
  );
}
