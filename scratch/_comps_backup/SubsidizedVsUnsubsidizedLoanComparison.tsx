"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  amount: number;
  rate: number;
  schoolYears: number;
  graceMonths: number;
  termYears: number;
  extraMonthly: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  subPrincipal: number;
  unsubPrincipal: number;
  subPayment: number;
  unsubPayment: number;
  paymentDiff: number;
  accruedInterest: number;
  subTotalInterest: number;
  unsubTotalInterest: number;
  subTotalCost: number;
  unsubTotalCost: number;
  totalDiff: number;
  chartData: { name: string; principal: number; interest: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

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
  const r = inp.rate / 100 / 12;
  const n = inp.termYears * 12;
  const preMonths = Math.round(inp.schoolYears * 12) + inp.graceMonths;
  // Simple daily-style interest accrues during school + grace (no compounding while in deferment).
  const accruedInterest = inp.amount * (inp.rate / 100) * (preMonths / 12);
  const subPrincipal = inp.amount;
  const unsubPrincipal = inp.amount + accruedInterest;

  const subBase = pmt(subPrincipal, r, n);
  const unsubBase = pmt(unsubPrincipal, r, n);

  const subSim = simulate(subPrincipal, r, subBase + inp.extraMonthly, n);
  const unsubSim = simulate(unsubPrincipal, r, unsubBase + inp.extraMonthly, n);

  const subTotalInterest = inp.extraMonthly > 0 ? subSim.interest : subBase * n - subPrincipal;
  const unsubTotalInterest = inp.extraMonthly > 0 ? unsubSim.interest : unsubBase * n - unsubPrincipal;
  const subTotalCost = subPrincipal + subTotalInterest;
  const unsubTotalCost = unsubPrincipal + unsubTotalInterest;
  const paymentDiff = unsubBase - subBase;
  const totalDiff = unsubTotalCost - subTotalCost;

  const chartData = [
    { name: "Subsidized", principal: Math.round(subPrincipal), interest: Math.round(subTotalInterest) },
    { name: "Unsubsidized", principal: Math.round(unsubPrincipal), interest: Math.round(unsubTotalInterest) },
  ];

  const accLabel =
    inp.schoolYears + " yr" + (inp.schoolYears === 1 ? "" : "s") +
    (inp.graceMonths > 0 ? " + " + inp.graceMonths + " mo grace" : "");

  const breakdown: Row[] = [
    { label: "Loan Amount", value: money(inp.amount), sum: true },
    { label: "Interest Rate", value: inp.rate.toFixed(2) + "%", sum: true },
    { label: "Interest Accrual Period", value: accLabel, sum: true },
    { label: "Interest Accrued (Unsubsidized)", value: money(accruedInterest), highlight: true, sum: true },
    { label: "Principal at Repayment — Subsidized", value: money(subPrincipal) },
    { label: "Principal at Repayment — Unsubsidized", value: money(unsubPrincipal) },
    { label: "Repayment Term", value: inp.termYears + " years" },
  ];
  if (inp.extraMonthly > 0) {
    breakdown.push({ label: "Extra Monthly Payment", value: money2(inp.extraMonthly), highlight: true });
  }
  breakdown.push(
    { label: "Monthly Payment — Subsidized", value: money2(subBase), sum: true },
    { label: "Monthly Payment — Unsubsidized", value: money2(unsubBase), highlight: true, sum: true },
    { label: "Total Interest — Subsidized", value: money(subTotalInterest), isTotal: true, sum: true },
    { label: "Total Interest — Unsubsidized", value: money(unsubTotalInterest), isTotal: true, sum: true },
    { label: "Total Cost — Subsidized", value: money(subTotalCost), isTotal: true, sum: true },
    { label: "Total Cost — Unsubsidized", value: money(unsubTotalCost), isTotal: true, sum: true },
    { label: "You Save with Subsidized", value: money(totalDiff) + " (" + money2(paymentDiff) + "/mo)", highlight: true, sum: true }
  );

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    subPrincipal,
    unsubPrincipal,
    subPayment: subBase,
    unsubPayment: unsubBase,
    paymentDiff,
    accruedInterest,
    subTotalInterest,
    unsubTotalInterest,
    subTotalCost,
    unsubTotalCost,
    totalDiff,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { amount: 30000, rate: 6.5, schoolYears: 4, graceMonths: 6, termYears: 10, extraMonthly: 0 };

export default function SubsidizedVsUnsubsidizedLoanComparison() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [schoolYears, setSchoolYears] = useState(String(DEFAULTS.schoolYears));
  const [graceMonths, setGraceMonths] = useState(String(DEFAULTS.graceMonths));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    amount: parseFloat(amount) || 0,
    rate: parseFloat(rate) || 0,
    schoolYears: parseFloat(schoolYears) || 0,
    graceMonths: parseInt(graceMonths) || 0,
    termYears: parseInt(termYears) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setRate(String(DEFAULTS.rate));
    setSchoolYears(String(DEFAULTS.schoolYears));
    setGraceMonths(String(DEFAULTS.graceMonths));
    setTermYears(String(DEFAULTS.termYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const amt = parseFloat(amount) || 0;
  const rt = parseFloat(rate) || 0;
  const sch = parseFloat(schoolYears) || 0;
  const grace = parseInt(graceMonths) || 0;
  const term = parseInt(termYears) || 0;
  const extra = parseFloat(extraMonthly) || 0;

  const valErrors: Record<string, string> = {};
  if (!amount || amt <= 0) valErrors.amount = "Loan amount must be greater than $0";
  if (rate === "" || isNaN(parseFloat(rate))) valErrors.rate = "Enter an interest rate";
  else if (rt < 0 || rt > 30) valErrors.rate = "Interest rate must be between 0% and 30%";
  if (!schoolYears || sch <= 0) valErrors.schoolYears = "Time in school must be greater than 0 years";
  else if (sch > 10) valErrors.schoolYears = "Time in school is capped at 10 years";
  if (isNaN(grace) || grace < 0 || grace > 24) valErrors.graceMonths = "Grace period must be 0–24 months";
  if (isNaN(term) || term < 1 || term > 40) valErrors.termYears = "Term must be 1–40 years";
  if (extra < 0) valErrors.extraMonthly = "Extra payment must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Subsidized vs Unsubsidized Loan Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Subsidized vs Unsubsidized Loan Comparison</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="su-amount" className="text-sm font-medium mb-1 block">Loan Amount ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="su-amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.amount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.amount}</p>}
              </div>
              <div>
                <label htmlFor="su-rate" className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                <div className={inputCls}>
                  <input id="su-rate" type="number" min="0" max="30" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="su-school" className="text-sm font-medium mb-1 block">Time in School (Years)</label>
                <div className={inputCls}>
                  <input id="su-school" type="number" min="0" max="10" step="0.5" value={schoolYears} onChange={(e) => setSchoolYears(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">yrs</span>
                </div>
                {valErrors.schoolYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.schoolYears}</p>}
              </div>
              <div>
                <label htmlFor="su-grace" className="text-sm font-medium mb-1 block">Grace Period (Months)</label>
                <div className={inputCls}>
                  <input id="su-grace" type="number" min="0" max="24" value={graceMonths} onChange={(e) => setGraceMonths(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">mo</span>
                </div>
                {valErrors.graceMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.graceMonths}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Repayment Settings</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="su-term" className="text-sm font-medium mb-1 block">Repayment Term (Years)</label>
                      <div className="relative h-10">
                        <select id="su-term" value={termYears} onChange={(e) => setTermYears(e.target.value)} className={selectCls}>
                          <option value="10">10 years</option>
                          <option value="15">15 years</option>
                          <option value="20">20 years</option>
                          <option value="25">25 years</option>
                        </select>
                      </div>
                      {valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}
                    </div>
                    <div>
                      <label htmlFor="su-extra" className="text-sm font-medium mb-1 block">Extra Monthly Payment ($)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="su-extra" type="number" min="0" step="5" value={extraMonthly} onChange={(e) => setExtraMonthly(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.extraMonthly && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.extraMonthly}</p>}
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Subsidized Monthly Payment</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(result.subPayment)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    vs {money2(result.unsubPayment)}/mo unsubsidized — subsidized saves {money2(result.paymentDiff)}/mo and {money(result.totalDiff)} total
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Subsidized Total Cost", money(result.subTotalCost), "text-primary"],
                    ["Unsubsidized Total Cost", money(result.unsubTotalCost), "text-amber-600"],
                    ["You Save", money(result.totalDiff), "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Total Cost by Loan Type</h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={64}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <Tooltip formatter={(v: number, name: string) => [name === "principal" ? "Principal" : "Interest", "$" + Math.round(v).toLocaleString("en-US")]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="principal" name="Principal" stackId="a" fill="#94a3b8" />
                      <Bar dataKey="interest" name="Interest" stackId="a">
                        {result.chartData.map((d, idx) => (
                          <Cell key={idx} fill={d.name === "Unsubsidized" ? "#f59e0b" : "#2563eb"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Interest bars show the difference: unsubsidized accrues while you study and during grace.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Interest Clock Starts Early for Unsubsidized Loans</h2>
            <p>Both federal subsidized and unsubsidized loans charge interest during repayment — the difference is what happens while you are in school and during the six-month grace period. Subsidized loans are need-based and the government pays the interest that accrues during those months, so the balance you begin repaying equals what you borrowed. Unsubsidized loans are available to everyone, but interest accrues from the day the money is disbursed and is added to your principal when repayment starts. On a $30,000 loan at 6.5%, four years of school plus a six-month grace period can add thousands of dollars to the balance before your first payment is ever due — which is exactly the gap this comparison quantifies.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is the difference between subsidized and unsubsidized loans?", answer: "Subsidized loans are need-based: the government pays the interest while you are enrolled at least half-time and during the grace period. Unsubsidized loans accrue interest from disbursement, and that interest is capitalized onto your principal when repayment begins." },
            { question: "When does unsubsidized interest get added to my balance?", answer: "Interest accrues monthly while you study and during grace, but it is not paid as you go. At the end of the grace period the unpaid interest is capitalized — added to your principal — so your future payments are calculated on a larger balance." },
            { question: "Should I always choose subsidized if offered?", answer: "Yes, if your aid package includes subsidized loans they are strictly cheaper for the same rate and term. This calculator shows the exact dollar difference in interest accrued and total cost, which is often larger than borrowers expect." },
          ]} pageUrl="https://racira.com/calculator/subsidized-vs-unsubsidized-loan-comparison" />
          <PopularCalculators exclude="/calculator/subsidized-vs-unsubsidized-loan-comparison" />
        </div>
      </div>
    </>
  );
}
