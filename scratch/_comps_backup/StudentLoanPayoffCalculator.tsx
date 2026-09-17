"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface LoanInput {
  balance: number;
  rate: number;
  monthlyPayment: number;
  extraPayment: number;
}

interface LoanResult {
  baseMonths: number;
  baseInterest: number;
  extraMonths: number;
  extraInterest: number;
  interestSaved: number;
  monthsSaved: number;
  payoffDateBase: string;
  payoffDateExtra: string;
  chartData: { month: number; standard: number; accelerated: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPayoff(input: LoanInput): LoanResult {
  const r = input.rate / 12 / 100;
  const chartData: { month: number; standard: number; accelerated: number }[] = [];
  const maxMonths = 600;

  const simulate = (payment: number) => {
    let bal = input.balance;
    let months = 0;
    let interest = 0;
    for (let m = 1; m <= maxMonths; m++) {
      const intChunk = bal * r;
      interest += intChunk;
      let principal = payment - intChunk;
      if (principal >= bal) {
        interest += bal * r > intChunk ? 0 : 0;
        bal = 0;
        months = m;
        break;
      }
      bal -= principal;
      months = m;
      if (bal <= 0) break;
    }
    return { months, interest, finalBalance: bal };
  };

  const base = simulate(input.monthlyPayment);
  const extra = simulate(input.monthlyPayment + input.extraPayment);

  // Build chart with monthly snapshots
  const buildSeries = (payment: number) => {
    let bal = input.balance;
    const series: number[] = [];
    for (let m = 0; m <= maxMonths; m++) {
      if (m > 0) {
        bal = bal * (1 + r) - payment;
        if (bal <= 0) { series.push(0); break; }
      }
      series.push(Math.round(bal));
    }
    return series;
  };
  const baseSeries = buildSeries(input.monthlyPayment);
  const extraSeries = buildSeries(input.monthlyPayment + input.extraPayment);
  const chartMonths = Math.max(baseSeries.length, extraSeries.length);
  for (let m = 0; m < chartMonths; m++) {
    chartData.push({ month: m, standard: baseSeries[m] ?? 0, accelerated: extraSeries[m] ?? 0 });
  }

  const interestSaved = Math.max(0, base.interest - extra.interest);
  const monthsSaved = Math.max(0, base.months - extra.months);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const addMonths = (n: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + n);
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };
  const payoffDateBase = base.months >= maxMonths ? "60+ years" : addMonths(base.months);
  const payoffDateExtra = extra.months >= maxMonths ? "60+ years" : addMonths(extra.months);

  const breakdown = [
    { label: "Loan Balance", value: `$${input.balance.toLocaleString()}` },
    { label: "Interest Rate", value: `${input.rate.toFixed(1)}%` },
    { label: "Monthly Payment", value: `$${input.monthlyPayment.toFixed(0)}` },
    { label: "Extra Payment / Month", value: `$${input.extraPayment.toFixed(0)}` },
    { label: "Payoff Time (current)", value: `${base.months} months (${(base.months / 12).toFixed(1)} yrs)` },
    { label: "Payoff Time (with extra)", value: `${extra.months} months (${(extra.months / 12).toFixed(1)} yrs)` },
    { label: "Total Interest (current)", value: `$${base.interest.toLocaleString()}` },
    { label: "Total Interest (with extra)", value: `$${extra.interest.toLocaleString()}` },
    { label: "Interest Saved", value: `$${interestSaved.toLocaleString()}` },
  ];

  const summaryStats = [
    { label: "Payoff Date (current)", value: payoffDateBase },
    { label: "Payoff Date (extra)", value: payoffDateExtra },
    { label: "Months Saved", value: `${monthsSaved}` },
    { label: "Interest Saved", value: `$${interestSaved.toLocaleString()}` },
    { label: "Total Interest", value: `$${base.interest.toLocaleString()}` },
    { label: "Total Paid", value: `$${(input.balance + base.interest).toLocaleString()}` },
  ];

  return { baseMonths: base.months, baseInterest: base.interest, extraMonths: extra.months, extraInterest: extra.interest, interestSaved, monthsSaved, payoffDateBase, payoffDateExtra, chartData, breakdown, summaryStats };
}

const DEFAULTS: LoanInput = { balance: 30000, rate: 6.5, monthlyPayment: 350, extraPayment: 100 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function StudentLoanPayoffCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [payment, setPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [extra, setExtra] = useState(String(DEFAULTS.extraPayment));
  const [result, setResult] = useState<LoanResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcPayoff({ balance: parse(balance, DEFAULTS.balance), rate: parse(rate, DEFAULTS.rate), monthlyPayment: parse(payment, DEFAULTS.monthlyPayment), extraPayment: parse(extra, DEFAULTS.extraPayment) }));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setRate(String(DEFAULTS.rate));
    setPayment(String(DEFAULTS.monthlyPayment));
    setExtra(String(DEFAULTS.extraPayment));
    setResult(calcPayoff(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcPayoff(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How long will it take to pay off my student loans?", answer: "A $30,000 loan at 6.5% with a $350 monthly payment takes about 10 years and costs roughly $12,000 in interest. Adding just $100 per month cuts the payoff to about 7.3 years and saves roughly $4,000 in interest. Small extra payments compound into large savings." },
    { question: "Should I pay extra on my loans or invest?", answer: "Compare your loan rate to your expected investment return after taxes. If the loan rate is higher than a conservative investment return (as it usually is at 6%+), paying the loan is the guaranteed better deal. If the loan is at 3–4%, investing may beat it — but the peace of mind of being debt-free has value too." },
    { question: "What is the avalanche vs snowball method?", answer: "The avalanche method pays extra toward the highest-interest loan first — mathematically optimal, minimizing total interest. The snowball method pays off the smallest balance first for psychological wins. Both beat the minimum payment; choose the one you'll actually stick with." },
    { question: "How does interest accrue on student loans?", answer: "Federal student loans accrue simple interest daily on the principal. Unpaid interest can capitalize — get added to principal — after grace periods, deferment, or forbearance, after which you pay interest on interest. Making payments during grace and forbearance prevents capitalization." },
    { question: "Is income-driven repayment right for me?", answer: "Income-driven repayment caps monthly payments at 10–20% of discretionary income and forgives the balance after 20–25 years. It lowers payments but extends the term and increases total interest. Best for borrowers with modest incomes relative to debt; less attractive for high earners." },
    { question: "Should I refinance my student loans?", answer: "Refinancing can cut your rate if your credit is strong — potentially saving thousands. But refinancing federal loans into private loans forfeits income-driven repayment, deferment, forbearance, and Public Service Loan Forgiveness. Only refinance the federal portion you're certain you won't need those protections for." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Student Loan Payoff Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Student Loan Payoff Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Current Balance</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Interest Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Monthly Payment</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={payment} onChange={(e) => setPayment(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Extra Payment / Month</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extra} onChange={(e) => setExtra(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Interest Saved with Extra Payment</div>
                  <div className="text-4xl font-extrabold tracking-tight text-emerald-600">${result.interestSaved.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">Pay off {result.monthsSaved} months sooner — by {result.payoffDateExtra} instead of {result.payoffDateBase}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Current Payoff", result.payoffDateBase], ["With Extra", result.payoffDateExtra], ["Months Saved", `${result.monthsSaved}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Payoff Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Balance Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "standard" ? "Current Plan" : "With Extra"]} />
                      <Legend />
                      <Area type="monotone" dataKey="standard" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} name="Current Plan" />
                      <Area type="monotone" dataKey="accelerated" stroke="#10b981" fill="#10b98122" strokeWidth={2} name="With Extra" />
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Power of Extra Payments</h2>
            <p>Every extra dollar you send to a student loan shortens the term and reduces interest — because interest is charged on the outstanding balance, paying principal early permanently removes that interest forever. An extra $100 per month on a $30,000 loan at 6.5% saves roughly $4,000 and ends the debt more than 2 years sooner.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Amortization</h2>
            <p>Early payments are mostly interest — on a 10-year $30,000 loan at 6.5%, the first payment is about 54% interest. Each month the interest share shrinks as the principal falls. This is why acceleration matters most in the early years: paying down principal early skips the highest-interest portion of the schedule.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing Your Strategy</h2>
            <p>Attack the highest-rate loan first (avalanche) for maximum savings, or the smallest balance (snowball) for momentum. Either way, apply extra payments to a specific loan — not spread across all of them — and target the principal, confirming your servicer applies overpayments to principal rather than advancing the due date.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/student-loan-payoff-calculator" />
          <PopularCalculators exclude="/calculator/student-loan-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
