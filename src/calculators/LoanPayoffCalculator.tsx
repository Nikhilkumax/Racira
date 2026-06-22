"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface LoanPayoffResult {
  monthsToPayoff: number;
  yearsToPayoff: number;
  totalPaid: number;
  totalInterest: number;
  interestSaved: number;
  timeSavedMonths: number;
  chartData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcLoanPayoff(balance: number, rate: number, payment: number, extraPayment: number): LoanPayoffResult {
  const r = rate / 100 / 12;
  const minPayment = r > 0 ? balance * r / (1 - Math.pow(1 + r, -360)) : balance / 360;
  const actualPayment = Math.max(payment, minPayment);
  const totalMonthly = actualPayment + extraPayment;

  // Standard payoff (no extra)
  let balBase = balance, monthsBase = 0, totalIntBase = 0;
  while (balBase > 0.01 && monthsBase < 600) {
    const int = balBase * r;
    totalIntBase += int;
    balBase -= (actualPayment - int);
    monthsBase++;
  }

  // With extra payment
  let bal = balance, months = 0, totalInt = 0;
  const chartData: { month: number; balance: number }[] = [{ month: 0, balance: Math.round(balance) }];
  while (bal > 0.01 && months < 600) {
    const int = bal * r;
    totalInt += int;
    bal -= (totalMonthly - int);
    months++;
    if (months % 12 === 0 || bal <= 0) chartData.push({ month: months, balance: Math.max(0, Math.round(bal)) });
  }

  const totalPaid = totalMonthly * months;
  const interestSaved = Math.max(0, totalIntBase - totalInt);
  const timeSaved = Math.max(0, monthsBase - months);

  const breakdown = [
    { label: "Current Balance", value: `$${balance.toLocaleString()}` },
    { label: "Interest Rate (APR)", value: `${rate}%` },
    { label: "Monthly Payment", value: `$${actualPayment.toFixed(2)}` },
    { label: "Extra Monthly Payment", value: `$${extraPayment.toFixed(2)}` },
    { label: "Total Monthly Payment", value: `$${totalMonthly.toFixed(2)}` },
    { label: "Months to Pay Off", value: `${months} months` },
    { label: "Years to Pay Off", value: `${(months / 12).toFixed(1)} years` },
    { label: "Total Interest Paid", value: `$${totalInt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Saved vs. Min", value: `$${interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Time Saved", value: timeSaved > 0 ? `${timeSaved} months (${(timeSaved / 12).toFixed(1)} yrs)` : "No extra payment" },
  ];

  const summaryStats = [
    { label: "Payoff Date", value: `${months} months` },
    { label: "Total Payment", value: `$${totalMonthly.toFixed(2)}/mo` },
    { label: "Total Interest", value: `$${totalInt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Saved", value: `$${interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Time Saved", value: timeSaved > 0 ? `${timeSaved} months` : "—" },
  ];

  return { monthsToPayoff: months, yearsToPayoff: months / 12, totalPaid, totalInterest: totalInt, interestSaved, timeSavedMonths: timeSaved, chartData, breakdown, summaryStats };
}

const DEFAULTS = { balance: "25000", rate: "6.5", payment: "300", extra: "100" };

export default function LoanPayoffCalculator() {
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [payment, setPayment] = useState(DEFAULTS.payment);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [result, setResult] = useState<LoanPayoffResult | null>(null);

  const calculate = () => setResult(calcLoanPayoff(parseFloat(balance) || 25000, parseFloat(rate) || 6.5, parseFloat(payment) || 300, parseFloat(extra) || 100));
  const reset = () => { setBalance(DEFAULTS.balance); setRate(DEFAULTS.rate); setPayment(DEFAULTS.payment); setExtra(DEFAULTS.extra); setResult(calcLoanPayoff(25000, 6.5, 300, 100)); };
  useEffect(() => { setResult(calcLoanPayoff(25000, 6.5, 300, 100)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How do extra loan payments save money?", answer: "Extra payments go directly to principal, reducing the balance faster. This cuts the interest charged in every subsequent month (since interest = balance × rate). A $100 extra payment on a $25,000 loan at 6.5% can save $1,000+ in interest and cut 1–2 years off the payoff timeline." },
    { question: "What is the fastest way to pay off a loan?", answer: "Pay as much as possible above the minimum. Even small amounts add up: $50 extra/month can shave years off a 10-year loan. Round up payments to the nearest $50. Apply windfalls (tax refunds, bonuses) directly to principal. Refinance to a lower rate and keep paying the same amount — all savings go to principal." },
    { question: "Should I pay off loans early or invest?", answer: "Compare your loan interest rate to expected investment returns. If loan rate > expected return (typically), pay off the loan first. If loan rate < expected return (e.g., 3% mortgage vs. 8% stock market), invest instead. High-interest debt (8%+) should almost always be paid off before investing beyond employer 401(k) matches." },
    { question: "What is the avalanche vs. snowball method?", answer: "Avalanche: Pay minimums on all loans, put extra toward highest interest rate first. Mathematically optimal — saves the most money. Snowball: Pay minimums on all, put extra toward smallest balance first. Psychologically satisfying — builds momentum. Avalanche wins mathematically; snowball wins behaviorally for many people." },
    { question: "Does making extra payments affect credit score?", answer: "Not negatively. Paying more than the minimum and reducing your balance improves your credit score over time by lowering your overall debt and improving your payment history. Paying off a loan in full positively affects your credit profile. There are no penalties for early repayment on most personal and student loans (check for prepayment penalties on some mortgages)." },
    { question: "How do I calculate how long to pay off a loan?", answer: "Months to payoff: n = -log(1 - (r × P / PMT)) / log(1 + r). Where P = balance, r = monthly rate, PMT = payment. If monthly payment is exactly the minimum, the loan term equals the original term. Every dollar extra reduces n non-linearly — early extra payments save more than later ones." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Payoff Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Loan Payoff Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Remaining Balance</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Interest Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Monthly Payment</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={ci} /></div></div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Extra Monthly Payment</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extra} onChange={e => setExtra(e.target.value)} className={ci} /></div></div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Time to Pay Off</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.monthsToPayoff} months</div>
                <div className="text-sm text-muted-foreground mt-1">{result.yearsToPayoff.toFixed(1)} years · Interest: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Saved: ${result.interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Paid", `$${result.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Interest Saved", `$${result.interestSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Payoff Analysis</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Paid" ? "font-bold border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Remaining Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} /><Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Loan Payoff Calculator?</h2>
            <p>A <strong>loan payoff calculator</strong> tells you exactly how long it will take to pay off a loan based on your current balance, interest rate, monthly payment, and any extra payments. It quantifies the interest and time savings from paying more than the minimum — making a compelling case for accelerated debt repayment.</p>
            <h2>How Loan Payoff Is Calculated</h2>
            <p>Months to Payoff = −log(1 − (r × P ÷ PMT)) ÷ log(1 + r). Where P = current balance, r = monthly rate (APR ÷ 12), PMT = total monthly payment. Interest per period = balance × monthly rate. Principal payment = payment − interest. Extra payments reduce the balance directly.</p>
            <h2>The Power of Extra Payments</h2>
            <p>Extra payments are most effective early in the loan when the balance is highest — each dollar removes from the principal that was generating the most interest. $100 extra on a $25,000 loan at 6.5% saves roughly $1,200 in interest and cuts 14 months off the payoff timeline. This compounds — as balance falls faster, less interest accrues each period.</p>
            <h2>Strategies to Pay Off Loans Faster</h2>
            <p>Make bi-weekly payments instead of monthly — results in 13 full payments per year instead of 12. Apply windfalls directly to principal. Refinance to a lower rate and maintain the same payment — all rate savings go to principal. Use the debt avalanche or snowball method for multiple loans.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-payoff-calculator" />
          <PopularCalculators exclude="/calculator/loan-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
