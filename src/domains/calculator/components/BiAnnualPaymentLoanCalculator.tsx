"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  loanAmount: number;
  annualRate: number;
  termYears: number;
}

interface PeriodRow {
  period: string;
  principal: number;
  interest: number;
}

interface Result {
  payment: number;
  periods: number;
  totalPayment: number;
  totalInterest: number;
  periodRatePct: number;
  annualPaymentEquivalent: number;
  rows: PeriodRow[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const periods = inp.termYears * 2;
  const periodRatePct = inp.annualRate / 2;
  const r = periodRatePct / 100;
  const payment = r > 0 ? (inp.loanAmount * r * Math.pow(1 + r, periods)) / (Math.pow(1 + r, periods) - 1) : inp.loanAmount / periods;
  const totalPayment = payment * periods;
  const totalInterest = Math.max(0, totalPayment - inp.loanAmount);
  const annualPaymentEquivalent = payment * 2;

  // Principal vs interest per period.
  const rows: PeriodRow[] = [];
  let bal = inp.loanAmount;
  for (let p = 1; p <= periods && bal > 0.5; p++) {
    const int = bal * r;
    const prin = Math.min(payment - int, bal);
    rows.push({ period: p % 2 === 1 ? "Yr " + (Math.ceil(p / 2)) + " H1" : "Yr " + (p / 2) + " H2", principal: Math.round(prin), interest: Math.round(int) });
    bal -= prin;
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Annual Interest Rate", value: inp.annualRate + "%" },
    { label: "Rate per Payment Period (Semi-Annual)", value: periodRatePct.toFixed(2) + "%" },
    { label: "Loan Term", value: inp.termYears + " years (" + periods + " payments)" },
    { label: "Semi-Annual Payment", value: fmtD(payment), highlight: true },
    { label: "Equivalent Annual Payment", value: fmtD(annualPaymentEquivalent) },
    { label: "Total Interest Paid", value: fmt(totalInterest), highlight: true },
    { label: "Total Paid Over Term", value: fmt(totalPayment), isTotal: true },
  ];

  const summaryStats = [
    { label: "Semi-Annual Payment", value: fmtD(payment) },
    { label: "Payments", value: periods + " (2 / year)" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Paid", value: fmt(totalPayment) },
    { label: "Period Rate", value: periodRatePct.toFixed(2) + "%" },
    { label: "Annual Rate", value: inp.annualRate + "%" },
    { label: "Equivalent Monthly", value: fmtD(payment / 6) + "/mo (approx)" },
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
  ];

  return { payment, periods, totalPayment, totalInterest, periodRatePct, annualPaymentEquivalent, rows, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 50000, annualRate: 7.5, termYears: 5 };

export default function BiAnnualPaymentLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [annualRate, setAnnualRate] = useState(String(DEFAULTS.annualRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    annualRate: parseFloat(annualRate) || 0,
    termYears: parseInt(termYears) || 1,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setAnnualRate(String(DEFAULTS.annualRate));
    setTermYears(String(DEFAULTS.termYears));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(annualRate) || 0;
  const term = parseInt(termYears) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan Amount must be greater than $0";
  if (!annualRate || rate <= 0) valErrors.annualRate = "Annual rate must be greater than 0%";
  else if (rate > 25) valErrors.annualRate = "Annual rate must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bi-Annual Payment Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bi-Annual Payment Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Annual Interest Rate (%)</label><div className={i}><input type="number" value={annualRate} onChange={e => setAnnualRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.annualRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Semi-Annual Payment (Every 6 Months)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.payment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{amt.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} at {annualRate}% over {termYears} years — {result.periods} payments</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-red-500"],
                ["Total Paid", "$" + Math.round(result.totalPayment).toLocaleString("en-US"), "text-amber-600"],
                ["Period Rate", result.periodRatePct.toFixed(2) + "%", "text-primary"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Principal vs Interest per Payment</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.rows} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number) => ["$" + Math.round(v).toLocaleString("en-US"), ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="principal" name="Principal" stackId="a"><Cell fill="#2563eb" /></Bar>
                  <Bar dataKey="interest" name="Interest" stackId="a" radius={[3, 3, 0, 0]}><Cell fill="#f59e0b" /></Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">Two payments per year at half the annual rate. Semi-annual schedules suit borrowers with lumpy income (bonuses, harvests, seasonal businesses).</p>
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
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Loans Paid Twice a Year</h2>
          <p>A bi-annual (semi-annual) payment loan requires two payments per year instead of twelve. Each payment covers half a year of interest plus principal, and the per-period rate is the annual rate divided by two. The trade-off versus a monthly loan is simple: fewer, larger payments. Semi-annual schedules suit borrowers whose income arrives in large installments, and lenders use them for some agriculture, equipment, and business loans. Because interest is paid down less frequently within the year, a semi-annual loan costs slightly more interest than an otherwise identical monthly loan — this calculator shows the exact totals.</p>
        </section>
        <FAQSection faqs={[
          { question: "What does bi-annual payment mean on a loan?", answer: "It means two payments per year — one every six months. Each payment covers the interest that accrued over the half-year plus a principal reduction." },
          { question: "How is the semi-annual payment calculated?", answer: "Using the same annuity formula as a monthly loan, but with n = years × 2 payments and a per-period rate of annual rate ÷ 2: payment = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)." },
          { question: "Is semi-annual more or less expensive than monthly?", answer: "Slightly more expensive in total interest, because the lender carries a larger average balance between your two payments each year. Fewer payments also mean each one is much larger, so budget accordingly." },
        ]} pageUrl="https://racira.com/calculator/bi-annual-payment-loan-calculator" />
        <PopularCalculators exclude="/calculator/bi-annual-payment-loan-calculator" />
      </div>
    </div>
  </>);
}
