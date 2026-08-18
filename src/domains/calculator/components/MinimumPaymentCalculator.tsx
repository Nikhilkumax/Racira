"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MinPayResult {
  months: number;
  yearsLabel: string;
  totalInterest: number;
  totalPaid: number;
  firstPayment: number;
  lastPayment: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { month: number; balance: number }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function calcMinPay(balance: number, apr: number, minPct: number, minFixed: number, extra: number): MinPayResult {
  const monthly = apr / 100 / 12;
  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let firstPayment = 0;
  let lastPayment = 0;
  const chartData: { month: number; balance: number }[] = [];
  const MAX_MONTHS = 1200;
  while (bal > 0 && months < MAX_MONTHS) {
    const interest = bal * monthly;
    let payment = Math.max(bal * (minPct / 100), minFixed) + extra;
    if (months === 0) firstPayment = payment;
    if (payment >= bal + interest) {
      payment = bal + interest;
      lastPayment = payment;
      bal = 0;
    } else {
      bal = bal + interest - payment;
    }
    totalInterest += interest;
    totalPaid += payment;
    months++;
    if (months % 6 === 0 || bal <= 0) chartData.push({ month: months, balance: Math.max(0, bal) });
  }
  if (months >= MAX_MONTHS) {
    const yearsLabel = "100+ years";
    const breakdown = [
      { label: "Starting Balance", value: money(balance) },
      { label: "APR", value: `${fmt(apr)}%` },
      { label: "Minimum Payment", value: `${minPct}% of balance or ${money(minFixed)} (whichever is greater)${extra > 0 ? ` + ${money(extra)} extra` : ""}` },
      { label: "First Payment", value: money(firstPayment) },
      { label: "Time to Pay Off", value: "More than 100 years" },
      { label: "Total Interest Paid (100 yr window)", value: money(totalInterest) },
      { label: "Total Amount Paid (100 yr window)", value: money(totalPaid) },
    ];
    const summaryStats = [
      { label: "Payoff Time", value: "100+ years" },
      { label: "Total Interest (window)", value: money(totalInterest) },
      { label: "Total Paid (window)", value: money(totalPaid) },
      { label: "Interest Share", value: `${fmt((totalInterest / Math.max(1, totalPaid)) * 100)}%` },
      { label: "First Payment", value: money(firstPayment) },
    ];
    return { months: MAX_MONTHS, yearsLabel, totalInterest, totalPaid, firstPayment, lastPayment, breakdown, summaryStats, chartData };
  }
  const years = months / 12;
  const yearsLabel = years >= 2 ? `${Math.floor(years)} yr ${Math.round((years % 1) * 12)} mo` : `${months} months`;
  const breakdown = [
    { label: "Starting Balance", value: money(balance) },
    { label: "APR", value: `${fmt(apr)}%` },
    { label: "Minimum Payment", value: `${minPct}% of balance or ${money(minFixed)} (whichever is greater)${extra > 0 ? ` + ${money(extra)} extra` : ""}` },
    { label: "First Payment", value: money(firstPayment) },
    { label: "Time to Pay Off", value: `${months} months (${yearsLabel})` },
    { label: "Total Interest Paid", value: money(totalInterest) },
    { label: "Total Amount Paid", value: money(totalPaid) },
    { label: "Last Payment", value: money(lastPayment) },
  ];
  const summaryStats = [
    { label: "Payoff Time", value: yearsLabel },
    { label: "Total Interest", value: money(totalInterest) },
    { label: "Total Paid", value: money(totalPaid) },
    { label: "Interest Share", value: `${fmt((totalInterest / Math.max(1, totalPaid)) * 100)}%` },
    { label: "First Payment", value: money(firstPayment) },
  ];
  return { months, yearsLabel, totalInterest, totalPaid, firstPayment, lastPayment, breakdown, summaryStats, chartData };
}

const DEFAULTS = { bal: "5000", apr: "22.9", pct: "2", fixed: "25", extra: "0" };

export default function MinimumPaymentCalculator() {
  const [bal, setBal] = useState(DEFAULTS.bal);
  const [apr, setApr] = useState(DEFAULTS.apr);
  const [pct, setPct] = useState(DEFAULTS.pct);
  const [fixed, setFixed] = useState(DEFAULTS.fixed);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [result, setResult] = useState<MinPayResult | null>(null);

  const balance = parseFloat(bal);
  const rate = parseFloat(apr);
  const p = parseFloat(pct);
  const f = parseFloat(fixed);
  const e = parseFloat(extra);
  const errs: string[] = [];
  if (!balance || balance <= 0) errs.push("Balance must be greater than 0.");
  if (isNaN(rate) || rate < 0) errs.push("APR must be 0 or greater.");
  if (p < 0 || f < 0) errs.push("Minimum payment amounts cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMinPay(balance, rate, p, f, e || 0)); };
  const reset = () => {
    setBal(DEFAULTS.bal); setApr(DEFAULTS.apr); setPct(DEFAULTS.pct); setFixed(DEFAULTS.fixed); setExtra(DEFAULTS.extra);
    setResult(calcMinPay(5000, 22.9, 2, 25, 0));
  };
  useEffect(() => { setResult(calcMinPay(5000, 22.9, 2, 25, 0)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How does minimum payment work?", answer: "Each month you pay the greater of a percentage of the balance (commonly 1–3%) or a fixed dollar floor. Because interest accrues on the remaining balance, minimum payments shrink the debt very slowly — most of the payment goes to interest early on." },
    { question: "Why does it take so long to pay off?", answer: "With a 2% minimum and 22.9% APR, the interest each month is roughly equal to the payment's interest share, so the principal barely moves. The simulation here compounds monthly to show the real timeline — often decades for large balances." },
    { question: "How much does paying extra help?", answer: "Every extra dollar above the minimum goes straight to principal, avoiding future interest. A small fixed extra payment can cut the payoff time by years and the total interest by a large fraction — try adding $25 or $50 in the extra field." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Minimum Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Minimum Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Credit Card Balance ($)</label>
                <input type="number" value={bal} onChange={e => setBal(e.target.value)} className={inp} placeholder="5000" />
              </div>
              <div>
                <label className={lbl}>APR (%)</label>
                <input type="number" value={apr} onChange={e => setApr(e.target.value)} className={inp} placeholder="22.9" />
              </div>
              <div>
                <label className={lbl}>Min Payment (% of balance)</label>
                <input type="number" value={pct} onChange={e => setPct(e.target.value)} className={inp} placeholder="2" />
              </div>
              <div>
                <label className={lbl}>Min Payment Floor ($)</label>
                <input type="number" value={fixed} onChange={e => setFixed(e.target.value)} className={inp} placeholder="25" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Extra Payment / Month ($) — optional</label>
                <input type="number" value={extra} onChange={e => setExtra(e.target.value)} className={inp} placeholder="0" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Time to Pay Off</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.yearsLabel}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.totalInterest, 0)} total interest on {money(result.totalPaid)} total paid</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", money(result.totalInterest)], ["Total Paid", money(result.totalPaid)], ["First Payment", money(result.firstPayment)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [money(v), "Balance"]} labelFormatter={(l) => `Month ${l}`} />
                    <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#balGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The long flat early section is interest outpacing the minimum — extra payments steepen the drop</p>
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
            <h2 className="text-2xl font-bold mb-3">The Minimum Payment Trap</h2>
            <p>Credit card issuers set minimums low — usually 1–3% of the balance or a flat floor — so the debt stays profitable. This <strong>minimum payment calculator</strong> simulates month by month what that really costs: the payoff timeline, the interest, and the total you hand the bank.</p>
            <h2 className="text-2xl font-bold mb-3">How the Simulation Works</h2>
            <p>Each month, interest accrues on the current balance at APR/12, the payment is the greater of the percentage minimum and the floor, and the remainder carries forward. Paying only the minimum on a $5,000 balance at 22.9% APR means decades of payments and thousands in interest.</p>
            <h2 className="text-2xl font-bold mb-3">Escaping Faster</h2>
            <p>Add a fixed extra payment and watch the chart bend: extra dollars attack principal directly, skipping future interest. The difference between minimum-only and minimum-plus-$50 is usually measured in years — and the interest saved can rival the balance itself.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/minimum-payment-calculator" />
          <PopularCalculators exclude="/calculator/minimum-payment-calculator" />
        </div>
      </div>
    </>
  );
}
