"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface StudentLoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  payoffDate: string;
  amortization: { month: number; balance: number; interest: number; principal: number }[];
  chartData: { year: number; balance: number; totalPaid: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcStudentLoan(
  principal: number, annualRate: number, termYears: number, extraPayment: number
): StudentLoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const n = termYears * 12;
  const monthlyPayment = monthlyRate > 0
    ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
    : principal / n;

  const effectivePayment = monthlyPayment + extraPayment;
  let balance = principal;
  let totalPaid = 0;
  let totalInterest = 0;
  const amortization: StudentLoanResult["amortization"] = [];

  let month = 0;
  while (balance > 0 && month < 600) {
    const interestCharge = balance * monthlyRate;
    const principalPaid = Math.min(balance, effectivePayment - interestCharge);
    balance = Math.max(0, balance - principalPaid);
    totalPaid += principalPaid + interestCharge;
    totalInterest += interestCharge;
    month++;
    if (month <= 360) amortization.push({ month, balance: parseFloat(balance.toFixed(2)), interest: parseFloat(interestCharge.toFixed(2)), principal: parseFloat(principalPaid.toFixed(2)) });
  }

  // Build yearly chart data
  const chartData = [];
  let runningPaid = 0;
  for (let y = 0; y <= Math.ceil(month / 12); y++) {
    const m = y * 12;
    const entry = amortization[Math.min(m, amortization.length - 1)];
    if (entry) {
      runningPaid = (effectivePayment) * Math.min(m, month);
      chartData.push({ year: y, balance: entry.balance, totalPaid: parseFloat(runningPaid.toFixed(0)) });
    }
  }

  const payoffMonths = month;
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + payoffMonths);
  const payoffDateStr = payoffDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const breakdown = [
    { label: "Loan Principal", value: `$${principal.toLocaleString()}` },
    { label: "Interest Rate", value: `${annualRate}% APR` },
    { label: "Loan Term", value: `${termYears} years` },
    { label: "Base Monthly Payment", value: `$${monthlyPayment.toFixed(2)}` },
    { label: "Extra Monthly Payment", value: `$${extraPayment.toFixed(2)}` },
    { label: "Total Monthly Payment", value: `$${effectivePayment.toFixed(2)}` },
    { label: "Total Amount Paid", value: `$${totalPaid.toFixed(2)}` },
    { label: "Total Interest Paid", value: `$${totalInterest.toFixed(2)}` },
    { label: "Interest as % of Principal", value: `${((totalInterest / principal) * 100).toFixed(1)}%` },
    { label: "Payoff Date", value: payoffDateStr },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${monthlyPayment.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
    { label: "Total Paid", value: `$${totalPaid.toFixed(2)}` },
    { label: "Payoff In", value: `${Math.ceil(month / 12)} years` },
    { label: "Payoff Date", value: payoffDateStr },
    { label: "Extra Saves", value: extraPayment > 0 ? `${(n - month)} months` : "N/A" },
  ];

  return { monthlyPayment, totalPaid, totalInterest, payoffDate: payoffDateStr, amortization, chartData, breakdown, summaryStats };
}

export default function StudentLoanCalculator() {
  const [principal, setPrincipal] = useState("35000");
  const [rate, setRate] = useState("6.54");
  const [term, setTerm] = useState("10");
  const [extra, setExtra] = useState("0");
  const [result, setResult] = useState<StudentLoanResult | null>(null);

  const calculate = () => {
    const p = parseFloat(principal) || 0, r = parseFloat(rate) || 0;
    const t = parseInt(term) || 10, e = parseFloat(extra) || 0;
    if (p > 0) setResult(calcStudentLoan(p, r, t, e));
  };

  useEffect(() => { setResult(calcStudentLoan(35000, 6.54, 10, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is the average student loan interest rate in 2024?", answer: "Federal student loan interest rates for 2024–2025 academic year: Undergrad Direct Loans: 6.53%. Graduate Direct Loans: 8.08%. Grad PLUS and Parent PLUS Loans: 9.08%. Private student loans: variable, typically 4–15% depending on credit score. Federal loans have fixed rates set annually; private loan rates are credit-dependent and may be variable. Always exhaust federal loan options before taking private loans, as federal loans offer income-driven repayment, forgiveness programs, and deferment options." },
    { question: "What are the federal student loan repayment plans?", answer: "Standard: 10-year fixed payments (highest monthly payment, lowest total interest). Extended: up to 25 years (lower payments, much more interest). Graduated: starts low, increases every 2 years — good if income will grow. Income-Driven Repayment (IDR): pays 5–20% of discretionary income for 20–25 years, then forgives remaining balance. SAVE Plan (new 2024): most generous IDR — 5% of discretionary income for undergrad loans, 10% for grad, forgiveness after 10–25 years. For those pursuing Public Service Loan Forgiveness (PSLF), IDR + 10 years of qualifying payments leads to full forgiveness." },
    { question: "How much extra monthly payment saves interest?", answer: "Extra payments dramatically reduce total interest. Example: $35,000 at 6.54% over 10 years. Standard: $390.85/month, total interest $11,902. Adding $100 extra/month → payoff in 8.5 years, saves ~$1,900 in interest. Adding $200 extra/month → payoff in 7.5 years, saves ~$3,200. Rule of thumb: every $50 of extra monthly payment on a 10-year loan at 6.5% saves roughly $700–1,500 in interest and cuts payoff by 4–8 months." },
    { question: "Should I refinance my student loans?", answer: "Refinancing replaces your loans with a new private loan (usually at a lower rate). When to consider: your credit score is 700+ and income is stable, current rate is above 5%, and you have private loans or don't need federal protections. When NOT to refinance: you're pursuing PSLF (refinancing eliminates forgiveness eligibility), you're on income-driven repayment, you might need deferment/forbearance, or you have federal loans in a forgiveness-eligible program. Always model total cost comparison: lower rate may mean less savings than you expect if extending the term." },
    { question: "What is Public Service Loan Forgiveness (PSLF)?", answer: "PSLF forgives remaining federal student loan balances after 120 qualifying monthly payments (10 years) while working full-time for a qualifying employer: government agencies, 501(c)(3) nonprofits, public schools, public hospitals. Key requirements: must have Direct Loans (or consolidate to Direct), must be on an income-driven repayment plan, must certify employment annually. The forgiveness is tax-free (unlike standard IDR forgiveness). For high-debt borrowers at qualifying employers, PSLF can save tens or hundreds of thousands of dollars." },
    { question: "What is the student loan interest deduction?", answer: "You can deduct up to $2,500 of student loan interest paid annually on federal taxes. Phase-out begins at $75,000 MAGI (single) and $155,000 (married filing jointly). The deduction is an 'above-the-line' adjustment — you can take it even without itemizing deductions. At the 22% tax bracket, the full $2,500 deduction saves $550 in federal taxes annually. This effectively reduces your net interest rate by 22% (tax bracket × interest rate)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Student Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Student Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Loan Balance</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Interest Rate (APR)</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.01} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Repayment Term</label>
                <div className={inp}><input type="number" value={term} onChange={e => setTerm(e.target.value)} min={1} max={30} className={ci} /><span className={suf}>yrs</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Extra Monthly Payment</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extra} onChange={e => setExtra(e.target.value)} min={0} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Extra payments reduce total interest and payoff time.</p>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Quick Terms</label>
              <div className="grid grid-cols-4 gap-2">
                {[["10", "10yr"], ["15", "15yr"], ["20", "20yr"], ["25", "25yr"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTerm(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${term === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setPrincipal("35000"); setRate("6.54"); setTerm("10"); setExtra("0"); setResult(calcStudentLoan(35000, 6.54, 10, 0)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPayment.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">Total interest: ${result.totalInterest.toFixed(2)} · Total paid: ${result.totalPaid.toFixed(2)} · Payoff: {result.payoffDate}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${result.totalInterest.toFixed(0)}`], ["Total Paid", `$${result.totalPaid.toFixed(0)}`], ["Payoff Date", result.payoffDate.split(" ")[1]]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Summary</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Area type="monotone" dataKey="balance" name="Remaining Balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="totalPaid" name="Total Paid" stroke="#22c55e" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>How to Calculate Student Loan Payments</h2>
            <p>This <strong>student loan calculator</strong> uses the standard amortization formula: Monthly Payment = P × [r(1+r)^n] ÷ [(1+r)^n − 1], where P = loan principal, r = monthly interest rate (APR ÷ 12), and n = number of monthly payments. The key insight: interest charges are heaviest in the early years when the balance is highest. Extra payments in the first 2–3 years have the highest impact on total interest savings.</p>
            <h2>2024–2025 Federal Loan Rates</h2>
            <p>Undergraduate Direct Loans: 6.53%. Graduate Direct Loans: 8.08%. PLUS Loans (grad/parent): 9.08%. These are fixed for the life of each loan. Private student loan rates range from 4–15% based on creditworthiness. The average American student loan borrower owes $37,338 (as of 2024), with typical monthly payments under Standard Repayment of $350–450/month.</p>
            <h2>Repayment Strategies</h2>
            <p>Avalanche method: pay minimums on all loans, target extra payments to highest interest rate first — minimizes total interest. Snowball method: target lowest balance first — provides psychological momentum. Hybrid: target high-interest loans above a threshold first. For federal loans, consider income-driven repayment if monthly payments strain your budget — SAVE Plan caps undergrad loan payments at 5% of discretionary income and forgives balances after 20–25 years. Related tools: <a href="/calculator/debt-payoff-calculator">Debt Payoff Calculator</a>, <a href="/calculator/refinance-calculator">Refinance Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/student-loan-calculator" />
          <PopularCalculators exclude="/calculator/student-loan-calculator" />
        </div>
      </div>
    </>
  );
}
