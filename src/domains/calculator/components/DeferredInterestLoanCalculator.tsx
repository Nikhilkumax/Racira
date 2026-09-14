"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  purchaseAmount: number;
  promoMonths: number;
  monthlyPayment: number;
  regularApr: number;
}

interface Result {
  paidInFull: boolean;
  paidOffMonth: number | null;
  promoEndBalance: number;
  deferredInterest: number;
  postPromoInterest: number;
  totalInterest: number;
  totalCost: number;
  payoffMonths: number | null;
  payoffNote: string;
  chartData: { label: string; balance: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const r12 = inp.regularApr / 100 / 12;
  const N = inp.promoMonths;
  const P = inp.monthlyPayment;

  // True promotional balance: payments reduce principal, no interest charged
  let R = inp.purchaseAmount;
  let paidOffMonth: number | null = null;
  for (let m = 1; m <= N; m++) {
    R = Math.max(0, R - P);
    if (R <= 0.005 && paidOffMonth === null) paidOffMonth = m;
  }
  const paidInFull = R <= 0.005;

  // Deferred interest: interest that would have accrued at the regular APR had
  // it applied from the purchase date. Waived if paid in full by the deadline.
  let bal = inp.purchaseAmount;
  let deferred = 0;
  if (!paidInFull) {
    for (let m = 1; m <= N; m++) {
      const int = bal * r12;
      if (P >= bal + int) { bal = 0; break; }
      deferred += int;
      bal = bal + int - P;
    }
  }

  // Post-promo: continue paying at the regular APR until paid off
  let postInterest = 0;
  let payoffMonths: number | null = null;
  let postMonths = 0;
  let carry = paidInFull ? 0 : R + deferred;
  const MAX_M = 480;
  if (carry > 0.005) {
    for (let m = 1; m <= MAX_M; m++) {
      const int = carry * r12;
      postInterest += int;
      carry = carry + int - P;
      if (carry <= 0.005) { postMonths = m; payoffMonths = N + m; break; }
    }
  } else if (paidOffMonth !== null) {
    payoffMonths = paidOffMonth;
  }

  const totalInterest = deferred + postInterest;
  const totalCost = inp.purchaseAmount + totalInterest;
  const payoffNote = payoffMonths !== null
    ? "Paid off in " + payoffMonths + " months"
    : "Balance keeps growing — payments don't cover interest";

  // Chart: balance by month; the cliff at the promo deadline shows the
  // retroactive interest charge landing at once.
  const pts: { label: string; balance: number }[] = [];
  let rBal = inp.purchaseAmount;
  pts.push({ label: "0", balance: Math.round(rBal) });
  for (let m = 1; m <= N; m++) {
    rBal = Math.max(0, rBal - P);
    pts.push({ label: String(m), balance: Math.round(rBal) });
  }
  if (!paidInFull && deferred > 0) {
    pts.push({ label: "End", balance: Math.round(rBal + deferred) });
    let cb = rBal + deferred;
    let m = N;
    while (cb > 0.005 && m < N + MAX_M && pts.length < 72) {
      m++;
      const int = cb * r12;
      cb = cb + int - P;
      pts.push({ label: String(m), balance: Math.max(0, Math.round(cb)) });
    }
  }
  const step = pts.length > 48 ? Math.ceil(pts.length / 48) : 1;
  const chartData = pts.filter((_, idx) => idx % step === 0 || idx === pts.length - 1);

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Purchase Amount", value: fmt(inp.purchaseAmount) },
    { label: "Promotional Period", value: N + " months" },
    { label: "Monthly Payment", value: fmtD(P) },
    { label: "Deferred (Regular) APR", value: inp.regularApr + "%" },
    { label: "Paid in Full by Deadline", value: paidInFull ? "Yes" : "No", highlight: true },
    { label: "Balance at Promo End", value: paidInFull ? "$0" : fmt(R), highlight: true },
    { label: "Deferred Interest Owed", value: paidInFull ? "$0" : fmt(deferred) },
    { label: "Post-Promo Interest", value: fmt(postInterest) },
    { label: "Total Interest", value: fmt(totalInterest), isTotal: true },
    { label: "Total Cost", value: fmt(totalCost), isTotal: true },
    { label: "Payoff Time", value: payoffNote },
  ];

  const summaryStats = [
    { label: "Paid in Full by Deadline", value: paidInFull ? "Yes" : "No" },
    { label: "Balance at Promo End", value: paidInFull ? "$0" : fmt(R) },
    { label: "Deferred Interest Owed", value: paidInFull ? "$0" : fmt(deferred) },
    { label: "Post-Promo Interest", value: fmt(postInterest) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost) },
    { label: "Payoff Time", value: payoffNote },
  ];

  return { paidInFull, paidOffMonth, promoEndBalance: R, deferredInterest: deferred, postPromoInterest: postInterest, totalInterest, totalCost, payoffMonths, payoffNote, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { purchaseAmount: 2000, promoMonths: 12, monthlyPayment: 150, regularApr: 27 };

export default function DeferredInterestLoanCalculator() {
  const [purchaseAmount, setPurchaseAmount] = useState(String(DEFAULTS.purchaseAmount));
  const [promoMonths, setPromoMonths] = useState(String(DEFAULTS.promoMonths));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [regularApr, setRegularApr] = useState(String(DEFAULTS.regularApr));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    purchaseAmount: parseFloat(purchaseAmount) || 0,
    promoMonths: parseInt(promoMonths) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    regularApr: parseFloat(regularApr) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setPurchaseAmount(String(DEFAULTS.purchaseAmount));
    setPromoMonths(String(DEFAULTS.promoMonths));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setRegularApr(String(DEFAULTS.regularApr));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const purchase = parseFloat(purchaseAmount) || 0;
  const months = parseInt(promoMonths) || 0;
  const payment = parseFloat(monthlyPayment) || 0;
  const apr = parseFloat(regularApr) || 0;

  const valErrors: Record<string, string> = {};
  if (!purchaseAmount || purchase <= 0) valErrors.purchaseAmount = "Purchase amount must be greater than $0";
  if (!promoMonths || months <= 0) valErrors.promoMonths = "Promo period must be greater than 0 months";
  else if (months > 60) valErrors.promoMonths = "Promo period must be 60 months or less";
  if (payment < 0) valErrors.monthlyPayment = "Monthly payment must be $0 or more";
  if (apr < 0 || apr > 40) valErrors.regularApr = "Deferred APR must be 0–40%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Deferred Interest Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Deferred Interest Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Purchase Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} className={c} /></div>{valErrors.purchaseAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.purchaseAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Promo Period (Months)</label><div className={i}><input type="number" value={promoMonths} onChange={e => setPromoMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>{valErrors.promoMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.promoMonths}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Monthly Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} className={c} /></div>{valErrors.monthlyPayment && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyPayment}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Deferred APR (%)</label><div className={i}><input type="number" value={regularApr} onChange={e => setRegularApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.regularApr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.regularApr}</p>}</div>
          </div>
          {payment === 0 && !hasErrors && <p className="text-[11px] text-amber-600 font-medium">With a $0 payment the balance grows — try the minimum the lender requires.</p>}
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.paidInFull ? "Paid in Full by Deadline — $0 Interest" : "Deferred Interest Owed at Promo End"}</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.paidInFull ? "$0" : result.deferredInterest.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.paidInFull ? "Clear the balance before the promo ends and no retroactive interest applies" : "Retroactive interest from the purchase date if " + (result.promoEndBalance.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })) + " isn't paid by month " + months}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Balance at Promo End", result.paidInFull ? "$0" : "$" + Math.round(result.promoEndBalance).toLocaleString("en-US"), result.paidInFull ? "text-emerald-600" : "text-primary"],
                ["Deferred Interest", result.paidInFull ? "$0" : "$" + Math.round(result.deferredInterest).toLocaleString("en-US"), result.paidInFull ? "text-emerald-600" : "text-amber-600"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), result.paidInFull ? "text-emerald-600" : "text-red-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Balance Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v))} width={60} />
                  <Tooltip formatter={(v: number) => ["Balance", "$" + Math.round(v).toLocaleString("en-US")]} labelFormatter={(l) => "Month " + l} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="balance" name="Outstanding Balance" stroke="#2563eb" strokeWidth={2} dot={false} />
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
          <h2 className="text-2xl font-bold mb-3">The Deferred Interest Trap</h2>
          <p>"No interest if paid in full" sounds like a free loan — and it is, exactly until it isn't. With deferred interest, the clock is always running: the lender silently accrues interest at the regular APR from the day you buy, and waives it only if you clear the entire promotional balance by the deadline. Miss it by even one dollar, and every month of that accrued interest lands on your bill at once — retroactive from the purchase date, not from the deadline. A $2,000 purchase with a $150 monthly payment still leaves $200 at month 12, and the retroactive interest can add several hundred dollars in a single charge. Always pay more than the minimum, and set the payoff date as your deadline, not the statement date.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is deferred interest?", answer: "Interest that accrues from the purchase date but is waived if you pay the full promotional balance by the deadline. If even a small balance remains, all of the accrued interest is charged retroactively at the regular APR." },
          { question: "How is the retroactive interest calculated?", answer: "Lenders compute it as if the regular APR applied from the day of purchase, then credit your payments against the balance. Anything left at the deadline triggers the full accrued amount — this calculator models that as-if accrual on a monthly basis." },
          { question: "What monthly payment guarantees no interest?", answer: "Divide the purchase amount by the number of promo months — $2,000 over 12 months needs at least $167 a month (plus any minimum-payment rules your lender sets). Paying the minimum store-card payment almost always leaves a balance and triggers the retroactive charge." },
        ]} pageUrl="https://racira.com/calculator/deferred-interest-loan-calculator" />
        <PopularCalculators exclude="/calculator/deferred-interest-loan-calculator" />
      </div>
    </div>
  </>);
}
