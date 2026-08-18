"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PointsAprResult {
  loan: number;
  ratePct: number;
  termMonths: number;
  points: number;
  fees: number;
  pointsCost: number;
  netReceived: number;
  monthlyPayment: number;
  apr: number;
  rateDiff: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function fmtPct(v: number, d = 3): string {
  return `${v.toFixed(d)}%`;
}

function pmt(principal: number, rMonthly: number, n: number): number {
  const g = Math.pow(1 + rMonthly, n);
  return (principal * rMonthly * g) / (g - 1);
}

function solveApr(netReceived: number, payment: number, n: number): number {
  // find monthly rate such that PV of payments = net received
  let lo = 1e-9, hi = 0.5;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const pv = payment * ((1 - Math.pow(1 + mid, -n)) / mid);
    if (pv > netReceived) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

function calcApr(loan: number, ratePct: number, termYears: number, points: number, fees: number): PointsAprResult {
  const termMonths = Math.round(termYears * 12);
  const rMonthly = ratePct / 100 / 12;
  const monthlyPayment = pmt(loan, rMonthly, termMonths);
  const pointsCost = (points / 100) * loan;
  const netReceived = loan - pointsCost - fees;
  const apr = solveApr(netReceived, monthlyPayment, termMonths);
  const rateDiff = apr - ratePct;
  const breakdown = [
    { label: "Loan Amount", value: fmt$(loan) },
    { label: "Nominal Interest Rate", value: fmtPct(ratePct) },
    { label: "Loan Term", value: `${termMonths} months` },
    { label: "Origination Points", value: `${fmtPct(points, 1)} of loan` },
    { label: "Points Cost", value: fmt$(pointsCost) },
    { label: "Upfront Fees", value: fmt$(fees) },
    { label: "Net Amount Received", value: fmt$(netReceived) },
    { label: "Monthly Payment", value: fmt$(monthlyPayment) },
    { label: "True APR (incl. points)", value: fmtPct(apr) },
    { label: "Rate Increase from Points", value: `+${fmtPct(rateDiff)}` },
  ];
  const summaryStats = [
    { label: "True APR", value: fmtPct(apr) },
    { label: "Nominal Rate", value: fmtPct(ratePct) },
    { label: "Rate Difference", value: `+${fmtPct(rateDiff)}` },
    { label: "Points Cost", value: fmt$(pointsCost) },
    { label: "Net Received", value: fmt$(netReceived) },
    { label: "Monthly Payment", value: fmt$(monthlyPayment) },
    { label: "Term", value: `${termMonths} months` },
    { label: "Total Interest", value: fmt$(monthlyPayment * termMonths - loan) },
  ];
  const chartData = [
    { name: "Nominal Rate", value: Number(ratePct.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "True APR", value: Number(apr.toFixed(2)), fill: "#f59e0b" },
  ];
  return { loan, ratePct, termMonths, points, fees, pointsCost, netReceived, monthlyPayment, apr, rateDiff, breakdown, summaryStats, chartData };
}

const DEFAULTS = { loan: "300000", rate: "6.5", term: "30", points: "1", fees: "1500" };

export default function LoanOriginationPointsToAprCalculator() {
  const [loan, setLoan] = useState(DEFAULTS.loan);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [points, setPoints] = useState(DEFAULTS.points);
  const [fees, setFees] = useState(DEFAULTS.fees);
  const [result, setResult] = useState<PointsAprResult | null>(null);

  const l = parseFloat(loan) || 0;
  const r = parseFloat(rate) || 0;
  const t = parseFloat(term) || 0;
  const p = parseFloat(points) || 0;
  const f = parseFloat(fees) || 0;
  const errs: string[] = [];
  if (l <= 0 || r <= 0 || t <= 0) errs.push("Loan amount, rate, and term must all be greater than 0.");
  if (p < 0 || f < 0) errs.push("Points and fees cannot be negative.");
  if (p + f >= l) errs.push("Points plus fees cannot exceed the loan amount.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcApr(l, r, t, p, f)); };
  const reset = () => {
    setLoan(DEFAULTS.loan); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); setPoints(DEFAULTS.points); setFees(DEFAULTS.fees);
    setResult(calcApr(300000, 6.5, 30, 1, 1500));
  };
  useEffect(() => { setResult(calcApr(300000, 6.5, 30, 1, 1500)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What are origination points?", answer: "One point equals 1% of the loan amount, paid upfront — effectively prepaid interest. Because you receive less than the face amount but still repay the full loan, points raise the true cost of borrowing above the nominal rate." },
    { question: "How is the true APR computed?", answer: "The APR is the rate that makes the present value of all monthly payments equal to the net amount received (loan minus points minus fees). The calculator solves this equation exactly by bisection." },
    { question: "Are points worth paying?", answer: "Points buy a lower nominal rate, so they pay off when you keep the loan long enough to recoup the upfront cost. The APR comparison shows the true breakeven — compare it against the no-points quote." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Origination Points to APR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Loan Origination Points to APR Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Loan Amount</label>
                <div className={inp}><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Nominal Rate (%)</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Loan Term (Years)</label>
                <div className={inp}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Origination Points (1 = 1%)</label>
                <div className={inp}><input type="number" value={points} onChange={e => setPoints(e.target.value)} className={ci} /></div>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Other Upfront Fees</label>
                <div className={inp}><input type="number" value={fees} onChange={e => setFees(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">True Annual Percentage Rate</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtPct(result.apr)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtPct(result.ratePct)} nominal + {fmtPct(result.rateDiff)} from {fmtPct(result.points, 1)} points and {fmt$(result.fees)} fees</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Nominal Rate`, fmtPct(result.ratePct)], ["Points Cost", fmt$(result.pointsCost)], ["Monthly Payment", fmt$(result.monthlyPayment)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cost Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 8 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 8 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Nominal vs True APR</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(3)}%`, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Points and fees push the true APR above the quoted rate</p>
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
            <h2 className="text-2xl font-bold mb-3">Why Points Raise the APR</h2>
            <p>This <strong>loan origination points to APR calculator</strong> shows the real cost of upfront charges. Paying one point on a $300,000 loan hands $3,000 to the lender immediately, yet you still repay the full $300,000 — so the effective annual rate exceeds the quoted nominal rate.</p>
            <h2 className="text-2xl font-bold mb-3">The APR Equation</h2>
            <p>The true APR is the discount rate that equates the present value of all monthly payments with the net amount you actually receive (loan minus points minus fees). The calculator solves this nonlinear equation numerically to a tight tolerance.</p>
            <h2 className="text-2xl font-bold mb-3">Comparing Loan Offers</h2>
            <p>Lenders quote different combinations of rate, points, and fees. Converting every offer to a single true APR — as this calculator does — is the honest way to compare them, because it folds all upfront costs into one number.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-origination-points-to-apr-calculator" />
          <PopularCalculators exclude="/calculator/loan-origination-points-to-apr-calculator" />
        </div>
      </div>
    </>
  );
}
