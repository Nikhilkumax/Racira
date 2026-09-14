"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

type Freq = "weekly" | "biweekly" | "monthly";

interface Inputs {
  amount: number;
  apr: number;
  years: number;
  freq: Freq;
  extraPerPayment: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  payment: number;
  paymentLabel: string;
  totalPayments: number;
  totalInterest: number;
  totalPaid: number;
  interestSavedVsMonthly: number;
  monthsSavedVsMonthly: number;
  payoffMonths: number;
  chartData: { name: string; interest: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function pmt(principal: number, perRate: number, periods: number): number {
  if (perRate <= 0) return periods > 0 ? principal / periods : 0;
  const factor = Math.pow(1 + perRate, periods);
  return (principal * perRate * factor) / (factor - 1);
}

function schedule(principal: number, perRate: number, periods: number) {
  const pay = pmt(principal, perRate, periods);
  let int = pay * periods - principal;
  return { payment: pay, interest: Math.max(0, int) };
}

function calc(inp: Inputs): Result {
  const periodsPerYear: Record<Freq, number> = { weekly: 52, biweekly: 26, monthly: 12 };
  const labels: Record<Freq, string> = { weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" };
  const ppy = periodsPerYear[inp.freq];
  const n = inp.years * ppy;
  const perRate = inp.apr / 100 / ppy;
  const base = pmt(inp.amount, perRate, n);
  const actualPayment = base + inp.extraPerPayment;

  const sched = schedule(inp.amount, perRate, n);

  // accelerate with extra per payment (sim in the chosen frequency)
  let bal = inp.amount;
  let months = 0;
  let interestActual = 0;
  const maxPeriods = inp.years * 52 * 3;
  let periods = 0;
  while (bal > 0.5 && periods < maxPeriods) {
    periods++;
    const int = bal * perRate;
    interestActual += int;
    bal = bal + int - Math.min(actualPayment, bal + int);
  }
  months = Math.round((periods / ppy) * 12);

  const freqCalcs: Record<Freq, { payment: number; interest: number; total: number }> = { weekly: { payment: 0, interest: 0, total: 0 }, biweekly: { payment: 0, interest: 0, total: 0 }, monthly: { payment: 0, interest: 0, total: 0 } };
  (Object.keys(freqCalcs) as Freq[]).forEach((f) => {
    const p = pmt(inp.amount, inp.apr / 100 / periodsPerYear[f], inp.years * periodsPerYear[f]);
    const i = p * inp.years * periodsPerYear[f] - inp.amount;
    freqCalcs[f] = { payment: p, interest: Math.max(0, i), total: p * inp.years * periodsPerYear[f] };
  });

  const totalInterest = inp.extraPerPayment > 0 ? interestActual : sched.interest;
  const totalPaid = inp.amount + totalInterest;
  const interestSavedVsMonthly = Math.max(0, freqCalcs.monthly.interest - freqCalcs[inp.freq].interest);
  const monthsSavedVsMonthly = Math.max(0, inp.years * 12 - months);

  const barData = [
    { name: "Weekly", interest: Math.round(freqCalcs.weekly.interest) },
    { name: "Biweekly", interest: Math.round(freqCalcs.biweekly.interest) },
    { name: "Monthly", interest: Math.round(freqCalcs.monthly.interest) },
  ];

  const breakdown: Row[] = [
    { label: "Loan Amount", value: money(inp.amount), sum: true },
    { label: "APR", value: inp.apr.toFixed(2) + "%", sum: true },
    { label: "Loan Term", value: inp.years + " years" },
    { label: "Payment Frequency", value: labels[inp.freq], sum: true },
    { label: labels[inp.freq] + " Payment", value: money2(base), highlight: true, sum: true },
    { label: "Total Payments Scheduled", value: inp.years * ppy + " payments" },
  ];
  if (inp.extraPerPayment > 0) {
    breakdown.push({ label: "Extra per Payment", value: money2(inp.extraPerPayment), highlight: true });
  }
  breakdown.push(
    { label: "Payoff Time", value: months + " months", sum: true },
    { label: "Total Interest", value: money(totalInterest), isTotal: true, sum: true },
    { label: "Total Paid", value: money(totalPaid), isTotal: true, sum: true },
    { label: "Interest Saved vs Monthly Schedule", value: money(interestSavedVsMonthly), highlight: true, sum: true }
  );
  if (inp.extraPerPayment > 0) {
    breakdown.push({ label: "Interest Saved from Extra Payments", value: money(Math.max(0, sched.interest - interestActual)), highlight: true, sum: true });
    breakdown.push({ label: "Time Saved from Extra Payments", value: Math.max(0, inp.years * 12 - months) + " months", highlight: true, sum: true });
  }

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    payment: base,
    paymentLabel: labels[inp.freq],
    totalPayments: inp.years * ppy,
    totalInterest,
    totalPaid,
    interestSavedVsMonthly,
    monthsSavedVsMonthly,
    payoffMonths: months,
    chartData: barData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { amount: 10000, apr: 8, years: 5, freq: "weekly", extraPerPayment: 0 };

export default function WeeklyLoanPaymentCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [freq, setFreq] = useState<Freq>(DEFAULTS.freq);
  const [extraPerPayment, setExtraPerPayment] = useState(String(DEFAULTS.extraPerPayment));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    amount: parseFloat(amount) || 0,
    apr: parseFloat(apr) || 0,
    years: parseInt(years) || 0,
    freq,
    extraPerPayment: parseFloat(extraPerPayment) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setApr(String(DEFAULTS.apr));
    setYears(String(DEFAULTS.years));
    setFreq(DEFAULTS.freq);
    setExtraPerPayment(String(DEFAULTS.extraPerPayment));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const amt = parseFloat(amount) || 0;
  const rt = parseFloat(apr) || 0;
  const yrs = parseInt(years) || 0;
  const extra = parseFloat(extraPerPayment) || 0;

  const valErrors: Record<string, string> = {};
  if (!amount || amt <= 0) valErrors.amount = "Loan amount must be greater than $0";
  if (apr === "" || isNaN(parseFloat(apr))) valErrors.apr = "Enter an APR";
  else if (rt < 0 || rt > 40) valErrors.apr = "APR must be between 0% and 40%";
  if (isNaN(yrs) || yrs < 1 || yrs > 40) valErrors.years = "Term must be 1–40 years";
  if (extra < 0) valErrors.extraPerPayment = "Extra payment must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Weekly Loan Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weekly Loan Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wk-amount" className="text-sm font-medium mb-1 block">Loan Amount ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="wk-amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.amount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.amount}</p>}
              </div>
              <div>
                <label htmlFor="wk-apr" className="text-sm font-medium mb-1 block">APR (%)</label>
                <div className={inputCls}>
                  <input id="wk-apr" type="number" min="0" max="40" step="0.1" value={apr} onChange={(e) => setApr(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wk-years" className="text-sm font-medium mb-1 block">Loan Term (Years)</label>
                <div className={inputCls}>
                  <input id="wk-years" type="number" min="1" max="40" value={years} onChange={(e) => setYears(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">yrs</span>
                </div>
                {valErrors.years && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.years}</p>}
              </div>
              <div>
                <label htmlFor="wk-freq" className="text-sm font-medium mb-1 block">Payment Frequency</label>
                <div className="relative h-10">
                  <select id="wk-freq" value={freq} onChange={(e) => setFreq(e.target.value as Freq)} className={selectCls}>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Extra Payments</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="wk-extra" className="text-sm font-medium mb-1 block">Extra Payment (per payment)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="wk-extra" type="number" min="0" step="5" value={extraPerPayment} onChange={(e) => setExtraPerPayment(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.extraPerPayment && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.extraPerPayment}</p>}
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
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated {result.paymentLabel} Payment</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(result.payment)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {money2(result.payment * (freq === "weekly" ? 52 : freq === "biweekly" ? 26 : 12))}/yr · {money(result.totalInterest)} interest over {years || "5"} years
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Payment (Weekly)", money2(result.payment), "text-primary"],
                    ["Total Interest", money(result.totalInterest), "text-amber-600"],
                    ["Interest Saved vs Monthly", money(result.interestSavedVsMonthly), "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Total Interest by Payment Schedule</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={64}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v))} />
                      <Tooltip formatter={(v: number) => [money(Number(v)), "Total Interest"]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="interest" name="Total Interest">
                        {result.chartData.map((d, idx) => (
                          <Cell key={idx} fill={d.name.toLowerCase() === freq ? "#2563eb" : idx === 0 ? "#93c5fd" : idx === 1 ? "#a7f3d0" : "#fcd34d"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Paying more often reduces the average balance that accrues interest — weekly schedules cost the least.</p>
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
            <h2 className="text-2xl font-bold mb-3">Faster Payments, Lower Interest</h2>
            <p>A weekly payment schedule splits the same annual amount into 52 smaller payments instead of 12 monthly ones. Because interest is charged on the balance each period, paying more often keeps the average balance lower, which trims total interest across the life of the loan. The difference is modest on short, low-rate loans and grows on longer terms at higher rates — this calculator shows the exact comparison across weekly, biweekly, and monthly schedules, and the payment amount you would need at each frequency to retire the debt on time.</p>
          </section>
          <FAQSection faqs={[
            { question: "How do I calculate a weekly loan payment?", answer: "Divide the annual rate by 52 to get the weekly rate, multiply the loan term in years by 52 to get the number of payments, then use the standard amortization formula: P × r / (1 − (1 + r)⁻ⁿ). The calculator does this for weekly, biweekly, and monthly schedules side by side." },
            { question: "Is paying weekly really cheaper?", answer: "Yes, by a small amount. Weekly and biweekly schedules reduce the average balance that accrues interest, so total interest is lower than a monthly schedule at the same nominal rate. On a $10,000 loan at 8% for 5 years the savings is roughly $20–$30." },
            { question: "Will my lender accept weekly payments?", answer: "Most consumer loans — auto, personal, and mortgage — are structured for monthly payments, so confirm with your lender first. Some lenders restrict frequency or apply payments only once a month regardless of when they arrive, which cancels the benefit." },
          ]} pageUrl="https://racira.com/calculator/weekly-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/weekly-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
