"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface CardInputs {
  balance: number;
  apr: number;
  currentPayment: number;
  extraPayment: number;
  extraStartMonths: number;
}

interface CardResult {
  baselineMonths: number;
  baselineInterest: number;
  newMonths: number;
  newInterest: number;
  interestSaved: number;
  monthsSaved: number;
  totalPaidBaseline: number;
  totalPaidNew: number;
  extraPerMonthEffective: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function simulatePayoff(balance: number, monthlyRate: number, payment: number, startDelayMonths: number, extra: number): { months: number; interest: number } {
  // Months 0..startDelay-1: baseline payment only; from startDelay: + extra
  let b = balance;
  let months = 0;
  let interest = 0;
  let guard = 0;
  const basePay = payment;
  const maxMonths = 1200;
  while (b > 0 && months < maxMonths && guard < maxMonths + 10) {
    const pay = months >= startDelayMonths ? basePay + extra : basePay;
    const i = b * monthlyRate;
    interest += i;
    b = b + i - pay;
    months += 1;
    if (pay <= i && months > startDelayMonths) { guard += 1; } else { guard = 0; }
    if (guard > 6) return { months: Infinity, interest: Infinity };
  }
  return { months, interest };
}

function calcCardExtra(inp: CardInputs): CardResult {
  const r = inp.apr / 100 / 12;
  const baseline = simulatePayoff(inp.balance, r, inp.currentPayment, 0, 0);
  const withExtra = simulatePayoff(inp.balance, r, inp.currentPayment, inp.extraStartMonths, inp.extraPayment);

  const interestSaved = baseline.interest - withExtra.interest;
  const monthsSaved = baseline.months - withExtra.months;
  const totalPaidBaseline = inp.balance + baseline.interest;
  const totalPaidNew = inp.balance + withExtra.interest;

  const fmtCur = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
  const fmtMonths = (m: number) => (Number.isFinite(m) ? `${Math.round(m)} mo (${Math.floor(m / 12)} yr ${Math.round(m % 12)} mo)` : "Never — payment covers interest only");

  const breakdown = [
    { label: "Current Balance", value: fmtCur(inp.balance) },
    { label: "APR", value: `${inp.apr.toFixed(2)}%` },
    { label: "Current Monthly Payment", value: fmtCur(inp.currentPayment) },
    { label: "Extra Payment per Month", value: fmtCur(inp.extraPayment) },
    { label: "Extra Payments Begin", value: inp.extraStartMonths === 0 ? "Now" : `In ${inp.extraStartMonths} months` },
    { label: "Payoff Time — Current Plan", value: fmtMonths(baseline.months) },
    { label: "Payoff Time — With Extra Payments", value: fmtMonths(withExtra.months), highlight: true },
    { label: "Total Interest — Current Plan", value: fmtCur(baseline.interest) },
    { label: "Total Interest — With Extra Payments", value: fmtCur(withExtra.interest) },
    { label: "Total Interest Saved", value: fmtCur(interestSaved), highlight: true },
    { label: "Time Saved", value: Number.isFinite(monthsSaved) ? `${Math.round(monthsSaved)} months` : "—", highlight: true },
    { label: "Total Paid — With Extra Payments", value: fmtCur(totalPaidNew) },
  ];

  const summaryStats = [
    { label: "Current Payoff Time", value: Number.isFinite(baseline.months) ? `${Math.round(baseline.months)} months` : "Never" },
    { label: "New Payoff Time", value: Number.isFinite(withExtra.months) ? `${Math.round(withExtra.months)} months` : "Never" },
    { label: "Interest Saved", value: fmtCur(interestSaved) },
    { label: "Months Saved", value: Number.isFinite(monthsSaved) ? `${Math.round(monthsSaved)} months` : "—" },
    { label: "Current-Plan Interest", value: fmtCur(baseline.interest) },
    { label: "New-Plan Interest", value: fmtCur(withExtra.interest) },
    { label: "Total Paid — Current Plan", value: fmtCur(totalPaidBaseline) },
    { label: "Total Paid — New Plan", value: fmtCur(totalPaidNew) },
  ];

  return {
    baselineMonths: baseline.months,
    baselineInterest: baseline.interest,
    newMonths: withExtra.months,
    newInterest: withExtra.interest,
    interestSaved,
    monthsSaved,
    totalPaidBaseline,
    totalPaidNew,
    extraPerMonthEffective: inp.extraPayment,
    breakdown,
    summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: CardInputs = {
  balance: 8500,
  apr: 22,
  currentPayment: 250,
  extraPayment: 100,
  extraStartMonths: 0,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CreditCardInterestSavingsFromExtraPaymentCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [currentPayment, setCurrentPayment] = useState(String(DEFAULTS.currentPayment));
  const [extraPayment, setExtraPayment] = useState(String(DEFAULTS.extraPayment));
  const [extraStartMonths, setExtraStartMonths] = useState(String(DEFAULTS.extraStartMonths));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<CardResult>(() => calcCardExtra(DEFAULTS));

  useEffect(() => { setResult(calcCardExtra(DEFAULTS)); }, []);

  const getInputs = (): CardInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    currentPayment: parseFloat(currentPayment) || 0,
    extraPayment: parseFloat(extraPayment) || 0,
    extraStartMonths: parseInt(extraStartMonths) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const bal = parseFloat(balance) || 0;
  const rate = parseFloat(apr) || 0;
  const pay = parseFloat(currentPayment) || 0;
  const extra = parseFloat(extraPayment) || 0;
  const startDelay = parseInt(extraStartMonths) || 0;
  if (bal <= 0) errors.balance = "Balance must be greater than 0.";
  if (rate < 1 || rate > 40) errors.apr = "APR must be between 1% and 40%.";
  if (pay <= 0) errors.payment = "Monthly payment must be greater than 0.";
  if (extra < 0) errors.extra = "Extra payment cannot be negative.";
  if (pay > 0 && rate > 0 && bal > 0 && pay <= (bal * rate / 100 / 12)) errors.payment = "Payment must exceed the monthly interest to ever pay off the card.";
  if (startDelay < 0 || startDelay > 60) errors.start = "Start delay must be 0–60 months.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcCardExtra(getInputs())); };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setCurrentPayment(String(DEFAULTS.currentPayment));
    setExtraPayment(String(DEFAULTS.extraPayment));
    setExtraStartMonths(String(DEFAULTS.extraStartMonths));
    setResult(calcCardExtra(DEFAULTS));
  };

  const faqs = [
    { question: "How much faster will extra payments pay off my credit card?", answer: "Because credit card interest compounds monthly on the remaining balance, every extra dollar you send shortens the payoff timeline at the end of the schedule, where balances are smallest. Sending $100 extra per month on an $8,500 balance at 22% APR with a $250 regular payment cuts the payoff from roughly 54 months to about 33 months — nearly two years sooner." },
    { question: "Should I pay extra on my card or invest the money instead?", answer: "A credit card APR of 18–28% is a guaranteed after-tax return you would have to beat with investing. Paying down high-interest card debt is usually the better financial move unless your employer matches retirement contributions — those matches should come first. Once the card is gone, the freed-up cash flow can be redirected to investing." },
    { question: "Why does the calculator use a fixed monthly payment?", answer: "Card issuers recalculate a minimum payment each month, often as a percentage of the balance, so minimum payments shrink as you pay down the card and stretch the payoff. This calculator assumes a fixed dollar payment each month — the approach most payoff plans and balance-transfer offers use — which gives a predictable timeline. If you only make minimum payments, actual payoff will take longer." },
    { question: "Is it better to make one big payment or several extra payments?", answer: "Interest accrues daily or monthly on the average balance, so the earlier money reaches the card the more interest it avoids. A lump sum sent today saves more than the same total spread over several months. The Advanced Options let you model a delayed start to see exactly how much postponing extra payments costs you." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Credit Card Interest Savings from Extra Payment" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Interest Savings from Extra Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ccx-balance" className="text-sm font-medium mb-1 block">Current Balance ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="ccx-balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className={ci} /></div>
                  {errors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.balance}</p>}
                </div>
                <div>
                  <label htmlFor="ccx-apr" className="text-sm font-medium mb-1 block">APR (%)</label>
                  <div className={inp}><input id="ccx-apr" type="number" value={apr} onChange={(e) => setApr(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.apr}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ccx-pay" className="text-sm font-medium mb-1 block">Current Monthly Payment ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="ccx-pay" type="number" value={currentPayment} onChange={(e) => setCurrentPayment(e.target.value)} className={ci} /></div>
                  {errors.payment && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.payment}</p>}
                </div>
                <div>
                  <label htmlFor="ccx-extra" className="text-sm font-medium mb-1 block">Extra Payment per Month ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="ccx-extra" type="number" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} className={ci} /></div>
                  {errors.extra && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.extra}</p>}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                  Advanced Options
                  <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Payment Schedule</div>
                      <div>
                        <label htmlFor="ccx-start" className="text-sm font-medium mb-1 block">Extra Payments Begin</label>
                        <select id="ccx-start" value={extraStartMonths} onChange={(e) => setExtraStartMonths(e.target.value)} className={sel}>
                          <option value="0">Now</option>
                          <option value="3">In 3 months</option>
                          <option value="6">In 6 months</option>
                          <option value="12">In 12 months</option>
                        </select>
                        {errors.start && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.start}</p>}
                        <p className="text-[11px] text-muted-foreground mt-1">If you need a few months to free up cash, model the delay here — postponing extra payments reduces total interest saved.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {hasErrors && (
                <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                  ⚠️ Please fix the errors above before calculating.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-1">
                <button type="submit" disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
                <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </form>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Interest Saved</div>
              <div className="text-4xl font-extrabold tracking-tight text-emerald-600">${Number.isFinite(result.interestSaved) ? Math.round(result.interestSaved).toLocaleString("en-US") : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">{Number.isFinite(result.monthsSaved) ? `Pay off ${Math.round(result.monthsSaved)} months sooner with $${Math.round(result.extraPerMonthEffective).toLocaleString("en-US")}/mo extra` : "Payment never exceeds monthly interest"}</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["New Payoff Time", Number.isFinite(result.newMonths) ? `${Math.round(result.newMonths)} mo` : "Never"],
                ["Months Saved", Number.isFinite(result.monthsSaved) ? `${Math.round(result.monthsSaved)} mo` : "—"],
                ["New-Plan Interest", `$${Number.isFinite(result.newInterest) ? Math.round(result.newInterest).toLocaleString("en-US") : "—"}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Payoff Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                    <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                    <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Credit Card Interest Savings Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A credit card interest savings calculator shows exactly what happens when you send more than the minimum each month: it compares your current payoff plan against the same plan with an extra payment added, and reports the interest you avoid and the months you shave off the timeline. Credit card debt is uniquely expensive because interest compounds monthly on the entire remaining balance, so the difference between paying the minimum and paying a fixed amount can be tens of thousands of dollars on a large balance. This tool makes that cost concrete by running both scenarios month by month: the baseline plan where you keep sending your current payment, and the accelerated plan where you add a fixed extra amount. The result is a pair of payoff dates, two lifetime interest totals, and — the number people actually want — the total interest saved by the extra payments. It is a planning tool for anyone deciding how aggressively to attack a balance, whether the debt is on one card being paid down directly or money is being redirected from a budget category toward the card.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Interest Savings Are Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation mirrors how credit cards actually accrue interest. The annual percentage rate is divided by twelve to get a monthly rate, and each month the interest charge is added to the outstanding balance before your payment is applied. Under the baseline scenario, the current monthly payment is applied every month until the balance reaches zero; the number of months that takes and the cumulative interest charged along the way define the current plan. Under the accelerated scenario, the extra payment is added to the regular payment each month from the start date you choose — modeled in Advanced Options if you need a few months to free up cash — and the same monthly simulation runs until the balance is gone. The interest saved is simply the baseline lifetime interest minus the accelerated lifetime interest, and the time saved is the difference in payoff months. Because interest is charged on the outstanding balance, savings are not linear: the dollars you send early avoid interest for many years, while the same dollars sent near the end of the schedule avoid almost none. The simulation also guards against a plan that never pays off the card — if your payment does not exceed the monthly interest charge, the balance grows forever and the calculator flags it rather than returning a misleading payoff date. Minimum payments are typically a percentage of the balance and shrink over time, so the fixed-payment assumption here matches how deliberate payoff plans and balance-transfer offers work; if you only ever make minimum payments, your real timeline will be longer than the baseline shown.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline number is the total interest saved, with the new payoff time and months saved shown alongside. The defaults describe a common situation: an $8,500 balance at 22 percent APR with a $250 monthly payment, accelerated by an extra $100 per month. That plan cuts the payoff from about 54 months to roughly 33 months and saves more than two thousand dollars in interest. The breakdown table walks through both scenarios line by line so you can see the current-plan interest, the new-plan interest, and where the savings come from, and the summary statistics condense everything into a single comparison. Two details are worth paying attention to. First, the earlier the extra payments begin, the more they save — use the Advanced Options delay to quantify what postponing your start date costs. Second, compare the extra payment against what the money would earn elsewhere: paying down a 22 percent card is a guaranteed tax-free return that most investments cannot match, so for most households the card should win until the balance is gone.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-card-interest-savings-from-extra-payment" />
          <PopularCalculators exclude="/calculator/credit-card-interest-savings-from-extra-payment" />
        </div>
      </div>
    </>
  );
}
