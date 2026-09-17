"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface LoanResult { monthlyPayment: number; totalPayment: number; totalInterest: number; schedule: { month: number; principal: number; interest: number; balance: number }[]; }
const DEFAULTS = { principal: "25000", annualRate: "7.5", termYears: "5" };

function calculate(d: typeof DEFAULTS): LoanResult {
  const P = parseFloat(d.principal)||0, r = (parseFloat(d.annualRate)||0)/100/12, n = (parseFloat(d.termYears)||0)*12;
  if (P === 0 || n === 0) return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
  const M = r === 0 ? P/n : P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
  const schedule: LoanResult["schedule"] = [];
  let balance = P;
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principal = M - interest;
    balance = Math.max(0, balance - principal);
    schedule.push({ month: i, principal: +principal.toFixed(2), interest: +interest.toFixed(2), balance: +balance.toFixed(2) });
  }
  return { monthlyPayment: M, totalPayment: M * n, totalInterest: M * n - P, schedule };
}

export default function PersonalLoanPayoffCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<LoanResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const chartData = r.schedule.filter((_, i) => i % Math.ceil(r.schedule.length / 24) === 0 || i === r.schedule.length - 1)
    .map(s => ({ month: s.month, Balance: +s.balance.toFixed(0), Principal: +s.principal.toFixed(0), Interest: +s.interest.toFixed(0) }));

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const faqs = [
    { question: "How is a personal loan payment calculated?", answer: "Monthly Payment = P × [r(1+r)ⁿ] / [(1+r)ⁿ − 1]. Where P = loan principal, r = monthly interest rate (annual rate ÷ 12), n = total number of payments. This is the standard amortization formula for fixed-rate loans." },
    { question: "What is loan amortization?", answer: "Amortization is the process of paying down a loan through regular payments that cover both interest and principal. Early payments are mostly interest; later payments are mostly principal. The total interest paid decreases as the loan term shortens or the interest rate drops." },
    { question: "What personal loan rate is good?", answer: "Excellent credit (750+): 6–10% APR. Good credit (700–749): 10–15%. Fair credit (650–699): 15–22%. Poor credit (<650): 22–36%. Compare to credit cards (20–30%) — personal loans are almost always cheaper than carrying a credit card balance." },
    { question: "Should I choose a shorter or longer loan term?", answer: "Shorter term: higher monthly payment but much less total interest. Longer term: lower monthly payment but significantly more total interest paid. Example: $25K at 7.5% — 3 years total interest = $2,958; 7 years = $7,003. Always choose the shortest term your budget comfortably supports." },
    { question: "Can I pay off a personal loan early?", answer: "Most personal loans allow early payoff. Some lenders charge a prepayment penalty (typically 1–5% of remaining balance or 1–2 months interest). Always check your loan agreement. Even with a prepayment penalty, early payoff often saves significant interest." },
    { question: "What is the difference between APR and interest rate?", answer: "The interest rate is the cost of borrowing the principal only. APR (Annual Percentage Rate) includes all fees (origination fees, closing costs) converted to an annualized percentage. Always compare APRs when shopping loans — APR represents true borrowing cost." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Personal Loan Payoff Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Personal Loan Payoff Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            {([
              { label: "Loan Amount", key: "principal" as keyof typeof f, prefix: "$", suffix: "", tip: "Total amount borrowed" },
              { label: "Annual Interest Rate", key: "annualRate" as keyof typeof f, prefix: "", suffix: "%", tip: "APR from your lender" },
              { label: "Loan Term", key: "termYears" as keyof typeof f, prefix: "", suffix: " years", tip: "Repayment period in years" },
            ]).map(({ label, key, prefix, suffix, tip }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground">{prefix}</span>}
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
                  {suffix && <span className="pr-3 text-sm text-muted-foreground">{suffix}</span>}
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Monthly Payment</div>
              <div className="text-5xl font-extrabold text-foreground">{fmt(r.monthlyPayment)}</div>
              <div className="text-sm text-muted-foreground mt-1">Total paid: {fmt(r.totalPayment)} · Interest: {fmt(r.totalInterest)}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Principal</div><div className="font-bold">{fmt(parseFloat(f.principal)||0)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Total Interest</div><div className="font-bold text-red-600">{fmt(r.totalInterest)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Total Cost</div><div className="font-bold">{fmt(r.totalPayment)}</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Balance Over Time</h3>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" label={{ value: "Month", position: "insideRight", fontSize: 10 }} tick={{ fontSize: 9 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                    <RTooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line dataKey="Balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line dataKey="Interest" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-sm">Amortization Schedule (first 12 months)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border bg-secondary/30">
                    <th className="px-3 py-2 text-left text-muted-foreground">Month</th>
                    <th className="px-3 py-2 text-right text-muted-foreground">Principal</th>
                    <th className="px-3 py-2 text-right text-muted-foreground">Interest</th>
                    <th className="px-3 py-2 text-right text-muted-foreground">Balance</th>
                  </tr></thead>
                  <tbody>
                    {r.schedule.slice(0, 12).map((row, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                        <td className="px-3 py-1.5">{row.month}</td>
                        <td className="px-3 py-1.5 text-right text-emerald-600">{fmt(row.principal)}</td>
                        <td className="px-3 py-1.5 text-right text-red-600">{fmt(row.interest)}</td>
                        <td className="px-3 py-1.5 text-right font-semibold">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Personal Loan Payoff Calculator Guide</h2>
            <p>This calculator computes your monthly payment, total repayment cost, total interest paid, and generates a full amortization schedule showing how each payment is split between principal and interest reduction over the life of the loan.</p>
            <h2 className="text-2xl font-bold mb-3">How Loan Amortization Works</h2>
            <p>Each monthly payment is divided into two parts: interest (calculated as remaining balance × monthly rate) and principal reduction. In the early months, most of the payment is interest. As the balance decreases, interest shrinks and principal repayment accelerates. By the final payment, nearly the entire amount goes to principal. This is why making extra early payments has such a large impact — it eliminates future interest that would have been charged on that principal.</p>
            <h2 className="text-2xl font-bold mb-3">Impact of Extra Payments</h2>
            <p>Paying just $50 extra per month on a $25K, 7.5%, 5-year loan saves approximately $300 in interest and pays off the loan 3 months early. A $200 extra payment saves ~$1,100 and eliminates 12+ months. Always apply extra payments to principal, not future payments. Check your lender&apos;s policy for principal-directed extra payment procedures.</p>
            <h2 className="text-2xl font-bold mb-3">Loan Shopping Tips</h2>
            <p>Get pre-qualified from multiple lenders — pre-qualification uses a soft credit pull (no credit score impact). Compare APRs, not just interest rates — APR includes origination fees. Check for prepayment penalties before signing. Consider credit unions — they typically offer lower rates than banks. Fintech lenders (SoFi, LightStream, Marcus) often have competitive rates for excellent credit borrowers.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/personal-loan-payoff-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Personal Loan Payoff Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Personal Loan Payoff Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Personal Loan Payoff Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Personal Loan Payoff Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Personal Loan Payoff Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/personal-loan-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
