"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  interestOnlyYears: number;
  amortizingYears: number;
  extraMonthly: number;
}

interface Result {
  ioPayment: number;
  amortPayment: number;
  ioTotalInterest: number;
  amortTotalInterest: number;
  totalInterestIO: number;
  totalInterestAmort: number;
  totalCostIO: number;
  totalCostAmort: number;
  savings: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; ioInterest: number; amortInterest: number }[];
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const ioPayment = inp.loanAmount * r;
  const amortMonths = inp.amortizingYears * 12;
  const amortPayment = r > 0 ? (inp.loanAmount * r * Math.pow(1 + r, amortMonths)) / (Math.pow(1 + r, amortMonths) - 1) : inp.loanAmount / amortMonths;

  // Interest-only phase
  const ioTotalInterest = ioPayment * inp.interestOnlyYears * 12;

  // Amortizing phase (starts after IO period, balance still = loanAmount)
  const amortTotalInterest = amortPayment * amortMonths - inp.loanAmount;

  // Full amortization comparison (no IO period)
  const fullMonths = inp.amortizingYears * 12;
  const fullPayment = r > 0 ? (inp.loanAmount * r * Math.pow(1 + r, fullMonths)) / (Math.pow(1 + r, fullMonths) - 1) : inp.loanAmount / fullMonths;

  const totalInterestIO = ioTotalInterest + amortTotalInterest;
  const totalInterestAmort = fullPayment * fullMonths - inp.loanAmount;
  const totalCostIO = ioPayment * inp.interestOnlyYears * 12 + amortPayment * amortMonths;
  const totalCostAmort = fullPayment * fullMonths;
  const savings = totalInterestAmort - totalInterestIO;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Interest-Only Period", value: inp.interestOnlyYears + " years" },
    { label: "Amortizing Period", value: inp.amortizingYears + " years" },
    { label: "IO Monthly Payment", value: "$" + fmtD(ioPayment), highlight: true },
    { label: "Amortizing Monthly Payment", value: "$" + fmtD(amortPayment), highlight: true },
    { label: "IO Total Interest", value: fmt(totalInterestIO) },
    { label: "Full Amort. Total Interest", value: fmt(totalInterestAmort) },
    { label: "Interest Difference", value: fmt(Math.abs(totalInterestIO - totalInterestAmort)), highlight: true },
    { label: "Total Cost (IO → Amort)", value: fmt(totalCostIO), highlight: true },
  ];

  const summaryStats = [
    { label: "IO Payment", value: "$" + fmtD(ioPayment) + "/mo" },
    { label: "Amort Payment", value: "$" + fmtD(amortPayment) + "/mo" },
    { label: "Total Interest (IO)", value: fmt(totalInterestIO) },
    { label: "Total Interest (Full Amort)", value: fmt(totalInterestAmort) },
    { label: "Difference", value: fmt(Math.abs(totalInterestIO - totalInterestAmort)) },
    { label: "Total Cost (IO)", value: fmt(totalCostIO) },
    { label: "Total Cost (Full Amort)", value: fmt(totalCostAmort) },
    { label: "Total Term", value: (inp.interestOnlyYears + inp.amortizingYears) + " years" },
  ];

  // Chart: year-by-year interest comparison
  const chartData: { year: string; ioInterest: number; amortInterest: number }[] = [];
  const ioMonths = inp.interestOnlyYears * 12;
  const totalMonths2 = ioMonths + amortMonths;

  // Build amortization schedules
  let ioBal = inp.loanAmount;
  let amortBal = inp.loanAmount;
  let ioYearInt = 0;
  let amortYearInt = 0;

  for (let m = 1; m <= Math.max(totalMonths2, fullMonths); m++) {
    const ioInt = ioBal * r;
    const amortInt = amortBal * r;

    if (m <= ioMonths) {
      ioYearInt += ioInt;
      // IO: no principal paid
    } else {
      const amortPmt = amortPayment;
      const princPay = amortPmt - ioBal * r;
      ioYearInt += ioBal * r;
      ioBal = Math.max(0, ioBal - princPay);
    }

    amortYearInt += amortInt;
    const amortPrincPay = fullPayment - amortBal * r;
    amortBal = Math.max(0, amortBal - amortPrincPay);

    if (m % 12 === 0) {
      const yr = m / 12;
      chartData.push({ year: "Yr " + yr, ioInterest: Math.round(ioYearInt), amortInterest: Math.round(amortYearInt) });
      ioYearInt = 0;
      amortYearInt = 0;
    }
  }

  return { ioPayment, amortPayment, ioTotalInterest, amortTotalInterest, totalInterestIO, totalInterestAmort, totalCostIO, totalCostAmort, savings, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 500000, interestRate: 6.5, interestOnlyYears: 5, amortizingYears: 25, extraMonthly: 0 };

export default function InterestOnlyLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [interestOnlyYears, setInterestOnlyYears] = useState(String(DEFAULTS.interestOnlyYears));
  const [amortizingYears, setAmortizingYears] = useState(String(DEFAULTS.amortizingYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    interestOnlyYears: parseInt(interestOnlyYears) || 1,
    amortizingYears: parseInt(amortizingYears) || 25,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setInterestOnlyYears(String(DEFAULTS.interestOnlyYears));
    setAmortizingYears(String(DEFAULTS.amortizingYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "How does an interest-only loan work?", answer: "During the interest-only period, you pay only the interest accrued each month — no principal reduction. After the IO period ends, payments increase significantly as you begin paying both principal and interest over the remaining amortizing term." },
    { question: "What happens when the interest-only period ends?", answer: "Your payment jumps to include both principal and interest. For a $500,000 loan at 6.5%, the IO payment is ~$2,708/mo but jumps to ~$3,482/mo when amortization begins over 25 years. Plan for this payment increase." },
    { question: "Are interest-only loans risky?", answer: "They can be. If home values decline during the IO period, you may owe more than the home is worth. They also typically have higher total interest costs than standard amortizing loans. Best for buyers with variable income or those planning to sell/refinance before the IO period ends." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Interest-Only Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Interest-Only Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest-Only Period</label><div className={i}><input type="number" value={interestOnlyYears} onChange={e => setInterestOnlyYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Amortizing Period</label><div className={i}><input type="number" value={amortizingYears} onChange={e => setAmortizingYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Extra Monthly ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} className={c} /></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Interest-Only Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.ioPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Then ${result.amortPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo when amortization begins · Total Interest: ${result.totalInterestIO.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["IO Payment", "$" + result.ioPayment.toFixed(2)], ["Amort Payment", "$" + result.amortPayment.toFixed(2)], ["Total Interest", "$" + Math.round(result.totalInterestIO).toLocaleString()]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Year-by-Year Interest Comparison</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="ioInterest" fill="#f59e0b" name="IO → Amort Interest" radius={[4, 4, 0, 0]} /><Bar dataKey="amortInterest" fill="hsl(var(--primary))" name="Full Amort Interest" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Understanding Interest-Only Loans</h2><p>An interest-only loan lets you pay only the interest for a set period (typically 5–10 years), resulting in lower initial payments. After the IO period, payments increase as you begin repaying the principal over the remaining term. These loans are popular with investors and high-income borrowers who expect their income to grow.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-only-loan-payment-calculator" /><PopularCalculators exclude="/calculator/interest-only-loan-payment-calculator" /></div>
    </div>
  </>);
}
