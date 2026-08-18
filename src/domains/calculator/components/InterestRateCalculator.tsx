"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface RateResult {
  principal: number;
  payment: number;
  termMonths: number;
  apr: number;
  ear: number;
  totalPayments: number;
  totalInterest: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function fmtPct(v: number, d = 2): string {
  return `${v.toFixed(d)}%`;
}

// Monthly payment for a given monthly rate r (annuity formula).
function pmt(principal: number, rMonthly: number, n: number): number {
  if (rMonthly === 0) return principal / n;
  const g = Math.pow(1 + rMonthly, n);
  return (principal * rMonthly * g) / (g - 1);
}

// Solve for the monthly rate that reproduces the given payment (bisection).
function solveRate(principal: number, payment: number, n: number): number | null {
  if (payment <= principal / n) return null; // payment too low for any positive rate
  let lo = 1e-9;
  let hi = 0.5; // up to ~600% APR
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (pmt(principal, mid, n) > payment) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function calcRate(principal: number, payment: number, termYears: number, termMonths: number): RateResult {
  const term = Math.max(1, Math.round(termYears * 12 + termMonths));
  const rMonthly = solveRate(principal, payment, term);
  const apr = rMonthly === null ? 0 : rMonthly * 12 * 100;
  const ear = rMonthly === null ? 0 : (Math.pow(1 + rMonthly, 12) - 1) * 100;
  const totalPayments = payment * term;
  const totalInterest = totalPayments - principal;
  const breakdown = [
    { label: "Loan Amount", value: fmt$(principal) },
    { label: "Monthly Payment", value: fmt$(payment) },
    { label: "Loan Term", value: `${term} months` },
    { label: "Implied Monthly Rate", value: rMonthly === null ? "—" : fmtPct(rMonthly * 100, 4) },
    { label: "Implied APR", value: fmtPct(apr) },
    { label: "Effective Annual Rate (EAR)", value: fmtPct(ear) },
    { label: "Total Payments", value: fmt$(totalPayments) },
    { label: "Total Interest Paid", value: fmt$(totalInterest) },
  ];
  const summaryStats = [
    { label: "Implied APR", value: fmtPct(apr) },
    { label: "Effective Annual Rate", value: fmtPct(ear) },
    { label: "Monthly Rate", value: rMonthly === null ? "—" : fmtPct(rMonthly * 100, 4) },
    { label: "Total Payments", value: fmt$(totalPayments) },
    { label: "Total Interest", value: fmt$(totalInterest) },
    { label: "Principal", value: fmt$(principal) },
    { label: "Term", value: `${term} months` },
    { label: "Interest Share", value: `${((totalInterest / totalPayments) * 100).toFixed(1)}%` },
  ];
  const chartData = [
    { name: "Principal", value: Math.round(principal), fill: "hsl(var(--primary))" },
    { name: "Interest", value: Math.max(0, Math.round(totalInterest)), fill: "#f59e0b" },
  ];
  return { principal, payment, termMonths: term, apr, ear, totalPayments, totalInterest, chartData, breakdown, summaryStats };
}

const DEFAULTS = { principal: "20000", payment: "377.42", years: "5", months: "0" };

export default function InterestRateCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [payment, setPayment] = useState(DEFAULTS.payment);
  const [years, setYears] = useState(DEFAULTS.years);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [result, setResult] = useState<RateResult | null>(null);

  const p = parseFloat(principal) || 0;
  const pay = parseFloat(payment) || 0;
  const y = parseFloat(years) || 0;
  const m = parseFloat(months) || 0;
  const term = Math.max(1, Math.round(y * 12 + m));
  const errs: string[] = [];
  if (p <= 0) errs.push("Loan amount must be greater than 0.");
  if (pay <= 0) errs.push("Monthly payment must be greater than 0.");
  if (y < 0 || m < 0 || (y === 0 && m === 0)) errs.push("Loan term must be positive.");
  if (pay > 0 && p > 0 && term > 0 && pay <= p / term) errs.push("Monthly payment is too low — the payment must exceed the principal divided by the term to imply a positive interest rate.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcRate(p, pay, y, m)); };
  const reset = () => {
    setPrincipal(DEFAULTS.principal); setPayment(DEFAULTS.payment); setYears(DEFAULTS.years); setMonths(DEFAULTS.months);
    setResult(calcRate(20000, 377.42, 5, 0));
  };
  useEffect(() => { setResult(calcRate(20000, 377.42, 5, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is the interest rate found?", answer: "The calculator applies the annuity payment formula and uses bisection to find the monthly rate that reproduces your exact payment. Because the formula is monotonic in the rate, the solution is unique for a given principal, payment, and term." },
    { question: "What is the difference between APR and EAR?", answer: "APR is the simple annual rate (monthly rate × 12). EAR compounds monthly and reflects the true annual cost — with monthly compounding EAR is always slightly higher than APR." },
    { question: "Why is my payment 'too low'?", answer: "Even at 0% interest the monthly payment must cover principal divided by the term. If your payment is below that floor, no positive interest rate can produce it — the loan would be interest-free or the term longer than entered." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Interest Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Interest Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Loan Amount</label>
                <div className={inp}><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Monthly Payment</label>
                <div className={inp}><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Term (Years)</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Extra Months</label>
                <div className={inp}><input type="number" value={months} onChange={e => setMonths(e.target.value)} className={ci} /></div>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Implied Annual Interest Rate</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtPct(result.apr)}</div>
                <div className="text-sm text-muted-foreground mt-1">APR on {fmt$(result.principal)} repaid at {fmt$(result.payment)}/month over {result.termMonths} months</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`APR`, fmtPct(result.apr)], ["Effective Rate (EAR)", fmtPct(result.ear)], ["Total Interest", fmt$(result.totalInterest)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Principal vs Interest</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Composition of total payments over the loan term</p>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Finding the Rate Hidden in a Payment</h2>
            <p>This <strong>interest rate calculator</strong> reverses the annuity formula. Instead of computing a payment from an interest rate, it solves for the monthly rate that produces the payment you actually pay on a loan of a known amount and term. The solution is unique because the payment function increases monotonically with the rate.</p>
            <h2 className="text-2xl font-bold mb-3">APR vs Effective Annual Rate</h2>
            <p>APR is the quoted simple annual rate — the monthly rate multiplied by twelve. The effective annual rate (EAR) compounds the monthly rate over a year, so it is the more honest measure of true annual cost whenever interest compounds monthly.</p>
            <h2 className="text-2xl font-bold mb-3">Verifying a Lender's Quote</h2>
            <p>Enter the amount, payment, and term from any loan offer to see whether the implied APR matches what was advertised. A higher implied rate than quoted means fees are embedded in the payment — a useful check before signing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-rate-calculator" />
          <PopularCalculators exclude="/calculator/interest-rate-calculator" />
        </div>
      </div>
    </>
  );
}
