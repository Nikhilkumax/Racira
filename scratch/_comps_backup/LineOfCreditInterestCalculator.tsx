"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type PayMode = "fixed" | "pct" | "interestOnly";

interface Inputs {
  balance: number;
  apr: number;
  mode: PayMode;
  fixedAmount: number;
  pctOfBalance: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  monthlyInterest: number;
  annualInterest: number;
  firstPayment: number;
  firstPrincipal: number;
  payoffMonths: number;
  payoffLabel: string;
  totalInterest: number;
  totalPaid: number;
  chartData: { label: string; balance: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const r = inp.apr / 100 / 12;
  const monthlyInterest = inp.balance * r;
  const annualInterest = monthlyInterest * 12;

  const firstPayment =
    inp.mode === "fixed" ? inp.fixedAmount : inp.mode === "pct" ? inp.balance * (inp.pctOfBalance / 100) : monthlyInterest;
  const firstPrincipal = Math.max(0, firstPayment - monthlyInterest);

  // Simulate monthly until paid (interest-only never amortizes).
  const maxMonths = 1200;
  let bal = inp.balance;
  let months = 0;
  let interestTotal = 0;
  let neverPayoff = false;
  while (bal > 0.5 && months < maxMonths) {
    months++;
    const int = bal * r;
    interestTotal += int;
    const pay =
      inp.mode === "fixed"
        ? Math.min(inp.fixedAmount, bal + int)
        : inp.mode === "pct"
          ? Math.max(bal * (inp.pctOfBalance / 100), int + 1)
          : int; // interest-only
    if (inp.mode === "interestOnly" || pay <= int) {
      neverPayoff = true;
      break;
    }
    bal = bal + int - Math.min(pay, bal + int);
  }
  const payoffDate = new Date(new Date().getFullYear(), new Date().getMonth() + months, 1);
  const payoffLabel = neverPayoff
    ? "Never (interest-only)"
    : months >= maxMonths
      ? "More than 100 years"
      : months + " months (" + MONTHS[payoffDate.getMonth()] + " " + payoffDate.getFullYear() + ")";

  const modeLabel = inp.mode === "fixed" ? "Fixed Amount" : inp.mode === "pct" ? "Percentage of Balance" : "Interest-Only";
  const payLabel =
    inp.mode === "fixed" ? money2(inp.fixedAmount) + "/mo" : inp.mode === "pct" ? inp.pctOfBalance.toFixed(1) + "% of balance" : "Interest only";

  const chartData: { label: string; balance: number }[] = [];
  chartData.push({ label: "Now", balance: Math.round(inp.balance) });
  if (!neverPayoff) {
    let cb = inp.balance;
    for (let m = 1; m <= Math.min(months, maxMonths); m++) {
      const int = cb * r;
      const pay =
        inp.mode === "fixed"
          ? Math.min(inp.fixedAmount, cb + int)
          : Math.max(cb * (inp.pctOfBalance / 100), int + 1);
      cb = cb + int - Math.min(pay, cb + int);
      if (m % 12 === 0 || m === months) {
        chartData.push({ label: m % 12 === 0 ? "Yr " + m / 12 : "Paid", balance: Math.max(0, Math.round(cb)) });
      }
    }
  } else {
    chartData.push({ label: "Yr 1", balance: Math.round(inp.balance) });
  }

  const totalInterest = neverPayoff ? 0 : interestTotal;
  const totalPaid = neverPayoff ? 0 : inp.balance + interestTotal;

  const breakdown: Row[] = [
    { label: "Current Balance", value: money(inp.balance), sum: true },
    { label: "APR", value: inp.apr.toFixed(2) + "%", sum: true },
    { label: "Payment Mode", value: modeLabel, sum: true },
    { label: "Payment Amount", value: payLabel, highlight: true, sum: true },
    { label: "Interest-Only Minimum", value: money2(monthlyInterest), sum: true },
    { label: "Monthly Interest Charge", value: money2(monthlyInterest), highlight: true, sum: true },
    { label: "First Payment — Principal Portion", value: money2(firstPrincipal) },
  ];
  if (neverPayoff) {
    breakdown.push({ label: "Result", value: "Balance never paid off — payments only cover interest", highlight: true, sum: true });
  } else {
    breakdown.push(
      { label: "Payoff Time", value: payoffLabel, sum: true },
      { label: "Total Interest", value: money(totalInterest), isTotal: true, sum: true },
      { label: "Total Paid", value: money(totalPaid), isTotal: true, sum: true }
    );
  }

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    monthlyInterest,
    annualInterest,
    firstPayment,
    firstPrincipal,
    payoffMonths: neverPayoff ? 0 : months,
    payoffLabel,
    totalInterest,
    totalPaid,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { balance: 15000, apr: 12, mode: "fixed", fixedAmount: 500, pctOfBalance: 2 };

export default function LineOfCreditInterestCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [mode, setMode] = useState<PayMode>(DEFAULTS.mode);
  const [fixedAmount, setFixedAmount] = useState(String(DEFAULTS.fixedAmount));
  const [pctOfBalance, setPctOfBalance] = useState(String(DEFAULTS.pctOfBalance));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    mode,
    fixedAmount: parseFloat(fixedAmount) || 0,
    pctOfBalance: parseFloat(pctOfBalance) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setMode(DEFAULTS.mode);
    setFixedAmount(String(DEFAULTS.fixedAmount));
    setPctOfBalance(String(DEFAULTS.pctOfBalance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const bal = parseFloat(balance) || 0;
  const rt = parseFloat(apr) || 0;
  const fixed = parseFloat(fixedAmount) || 0;
  const pct = parseFloat(pctOfBalance) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Balance must be greater than $0";
  if (apr === "" || isNaN(parseFloat(apr))) valErrors.apr = "Enter an APR";
  else if (rt < 0 || rt > 60) valErrors.apr = "APR must be between 0% and 60%";
  if (mode === "fixed" && fixed <= 0) valErrors.fixedAmount = "Monthly payment must be greater than $0";
  if (mode === "pct" && (pct <= 0 || pct > 100)) valErrors.pctOfBalance = "Percentage must be between 0% and 100%";
  const monthlyInterest = bal > 0 && rt > 0 ? (bal * rt) / 100 / 12 : 0;
  if (mode === "fixed" && fixed > 0 && bal > 0 && rt > 0 && fixed <= monthlyInterest) {
    valErrors.fixedAmount = "Payment must exceed the interest-only minimum of " + money2(monthlyInterest);
  }
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Line of Credit Interest Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Line of Credit Interest Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="loc-balance" className="text-sm font-medium mb-1 block">Current Balance ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="loc-balance" type="number" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}
              </div>
              <div>
                <label htmlFor="loc-apr" className="text-sm font-medium mb-1 block">APR (%)</label>
                <div className={inputCls}>
                  <input id="loc-apr" type="number" min="0" max="60" step="0.1" value={apr} onChange={(e) => setApr(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="loc-mode" className="text-sm font-medium mb-1 block">Payment Method</label>
                <div className="relative h-10">
                  <select id="loc-mode" value={mode} onChange={(e) => setMode(e.target.value as PayMode)} className={selectCls}>
                    <option value="fixed">Fixed Amount</option>
                    <option value="pct">Percentage of Balance</option>
                    <option value="interestOnly">Interest-Only</option>
                  </select>
                </div>
              </div>
              <div>
                {mode === "fixed" && (
                  <div>
                    <label htmlFor="loc-fixed" className="text-sm font-medium mb-1 block">Monthly Payment ($)</label>
                    <div className={inputCls}>
                      <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                      <input id="loc-fixed" type="number" min="0" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} className={fieldCls} />
                    </div>
                    {valErrors.fixedAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.fixedAmount}</p>}
                  </div>
                )}
                {mode === "pct" && (
                  <div>
                    <label htmlFor="loc-pct" className="text-sm font-medium mb-1 block">% of Balance per Month</label>
                    <div className={inputCls}>
                      <input id="loc-pct" type="number" min="0" max="100" step="0.5" value={pctOfBalance} onChange={(e) => setPctOfBalance(e.target.value)} className={fieldCls} />
                      <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                    </div>
                    {valErrors.pctOfBalance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.pctOfBalance}</p>}
                  </div>
                )}
                {mode === "interestOnly" && (
                  <div className="flex flex-col justify-end h-10 rounded-md border border-dashed border-border bg-secondary/20 px-3 text-sm text-muted-foreground">
                    Interest-only minimum
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Interest accrues on the outstanding balance each month — paying only the interest keeps the balance level forever. Any amount above the interest charge reduces principal; 2% of the balance is a common lender minimum.
            </p>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Interest Charge</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(result.monthlyInterest)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {(parseFloat(apr) || 0).toFixed(2)}% APR on {money(bal)} · {money2(result.annualInterest)}/yr if the balance stays level
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Monthly Interest", money2(result.monthlyInterest), "text-primary"],
                    ["Annual Interest", money2(result.annualInterest), "text-amber-600"],
                    ["Payoff Time", result.payoffLabel, "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-sm font-bold leading-tight ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Balance Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <Tooltip formatter={(v: number) => ["Balance", "$" + Math.round(v).toLocaleString("en-US")]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="balance" name="Balance" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  {result.payoffLabel === "Never (interest-only)" && (
                    <p className="text-[11px] text-amber-600 font-medium mt-2">Interest-only payments never reduce the balance — the line stays at {money(bal)} forever.</p>
                  )}
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
            <h2 className="text-2xl font-bold mb-3">Interest Accrues on Every Dollar You Owe</h2>
            <p>A line of credit works like a revolving loan: you borrow up to a limit, and interest accrues each month on whatever balance is outstanding. The monthly interest charge is simply the balance times the monthly rate — at 12% APR, a $15,000 balance costs $150 a month, or $1,800 a year, before any principal is repaid. The only lever that shrinks the balance is paying more than the interest: a fixed payment of $500 a month retires that debt in a few years, while paying the interest-only minimum keeps it alive indefinitely. This calculator shows the monthly and annual interest cost, then projects payoff under the payment method you choose.</p>
          </section>
          <FAQSection faqs={[
            { question: "How is line of credit interest calculated?", answer: "Interest equals the outstanding balance times the periodic rate. If your APR is 12%, the monthly rate is 1%, so a $15,000 balance accrues $150 in interest that month. Many lenders compute interest daily from the average daily balance, which the monthly approximation tracks closely." },
            { question: "What happens if I only pay the interest?", answer: "The balance never decreases — every dollar of your payment covers interest, and the line stays at its current level indefinitely. This is the minimum most lenders require, which is why balances can linger for decades when borrowers pay only the minimum." },
            { question: "How long will it take to pay off my line of credit?", answer: "It depends on how much you pay above the interest charge. The calculator projects a month-by-month payoff: paying a fixed amount applies everything above that month's interest to principal, while paying a percentage of the balance keeps payments (and payoff) slower because the payment shrinks as the balance does." },
          ]} pageUrl="https://racira.com/calculator/line-of-credit-interest-calculator" />
          <PopularCalculators exclude="/calculator/line-of-credit-interest-calculator" />
        </div>
      </div>
    </>
  );
}
