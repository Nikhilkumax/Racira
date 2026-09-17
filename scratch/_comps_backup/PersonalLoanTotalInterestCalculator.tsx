"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  apr: number;
  termMonths: number;
  originationPct: number;
}

interface Result {
  monthlyPayment: number;
  totalInterest: number;
  totalRepaid: number;
  originationFee: number;
  totalCost: number;
  interestSharePct: number;
  chartData: { label: string; principal: number; interest: number }[];
  yearlyInterest: { label: string; interest: number; principal: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const r = inp.apr / 100 / 12;
  const n = inp.termMonths;
  const monthlyPayment = r > 0 ? (inp.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inp.loanAmount / n;
  const totalInterest = monthlyPayment * n - inp.loanAmount;
  const totalRepaid = monthlyPayment * n;
  const originationFee = (inp.loanAmount * inp.originationPct) / 100;
  const totalCost = totalInterest + originationFee;
  const interestSharePct = (totalInterest / totalRepaid) * 100;

  const chartMap = new Map<number, { principal: number; interest: number }>();
  let bal = inp.loanAmount;
  for (let m = 1; m <= n; m++) {
    const int = bal * r;
    const prin = monthlyPayment - int;
    bal = Math.max(0, bal - prin);
    const yr = Math.floor((m - 1) / 12);
    const cur = chartMap.get(yr) || { principal: 0, interest: 0 };
    cur.principal += prin;
    cur.interest += int;
    chartMap.set(yr, cur);
  }
  const chartData = [...chartMap.entries()].map(([yr, v]) => ({
    label: "Yr " + (yr + 1),
    principal: Math.round(v.principal),
    interest: Math.round(v.interest),
  }));
  const yearlyInterest = [...chartMap.entries()].map(([yr, v]) => ({
    label: "Year " + (yr + 1),
    interest: Math.round(v.interest),
    principal: Math.round(v.principal),
  }));

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "APR", value: inp.apr + "%" },
    { label: "Loan Term", value: n + " months" },
    { label: "Monthly Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Total Repayment", value: fmt(totalRepaid) },
    { label: "Total Interest", value: fmt(totalInterest), highlight: true },
    { label: "Interest as % of Repayment", value: interestSharePct.toFixed(1) + "%" },
    { label: "Origination Fee (" + inp.originationPct + "%)", value: fmt(originationFee) },
    { label: "Total Cost to Borrow", value: fmt(totalCost), isTotal: true },
    ...yearlyInterest.map((y) => ({ label: y.label + " Interest", value: fmt(y.interest) })),
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Total Repayment", value: fmt(totalRepaid) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Interest Share", value: interestSharePct.toFixed(1) + "%" },
    { label: "Origination Fee", value: fmt(originationFee) },
    { label: "Total Cost to Borrow", value: fmt(totalCost) },
  ];

  return { monthlyPayment, totalInterest, totalRepaid, originationFee, totalCost, interestSharePct, chartData, yearlyInterest, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 15000, apr: 11, termMonths: 48, originationPct: 3 };

export default function PersonalLoanTotalInterestCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [originationPct, setOriginationPct] = useState(String(DEFAULTS.originationPct));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    apr: parseFloat(apr) || 0,
    termMonths: parseInt(termMonths) || 0,
    originationPct: parseFloat(originationPct) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setApr(String(DEFAULTS.apr));
    setTermMonths(String(DEFAULTS.termMonths));
    setOriginationPct(String(DEFAULTS.originationPct));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(apr) || 0;
  const term = parseInt(termMonths) || 0;
  const orig = parseFloat(originationPct) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (rate <= 0 || rate > 36) valErrors.apr = "APR must be 0–36%";
  if (!termMonths || term <= 0) valErrors.termMonths = "Term must be greater than 0 months";
  else if (term > 120) valErrors.termMonths = "Term must be 120 months or less";
  if (orig < 0 || orig > 10) valErrors.originationPct = "Origination fee must be 0–10%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Personal Loan Total Interest Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Personal Loan Total Interest Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">APR (%)</label><div className={i}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Months)</label><div className={i}><input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>{valErrors.termMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termMonths}</p>}</div>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fees</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Origination Fee (%)</label><div className={i}><input type="number" value={originationPct} onChange={e => setOriginationPct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.originationPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.originationPct}</p>}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Interest</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.totalInterest.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.interestSharePct.toFixed(1)}% of every dollar you repay goes to interest · {result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo over {term} months</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment", result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Total Repayment", "$" + Math.round(result.totalRepaid).toLocaleString("en-US"), "text-emerald-600"],
                ["Total Cost (Incl. Fee)", "$" + Math.round(result.totalCost).toLocaleString("en-US"), "text-red-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Principal vs Interest by Year</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "principal" ? "Principal" : "Interest", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "principal" ? "Principal" : "Interest")} />
                  <Bar dataKey="principal" stackId="a" fill="#2563eb" />
                  <Bar dataKey="interest" stackId="a" fill="#f59e0b" />
                </BarChart>
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
          <h2 className="text-2xl font-bold mb-3">What a Personal Loan Really Costs</h2>
          <p>Personal loans quote a rate and a payment, but the number to shop with is the total interest over the life of the loan. Because unsecured installment loans carry higher rates than mortgages, the interest share is large: on a $15,000 loan at 11% over 48 months, roughly a fifth of everything you repay is interest, before any origination fee. The term is the hidden lever — stretching the same loan from 36 to 60 months can double the total interest even though the monthly payment drops by a third. Compare loans on total interest and total cost, not monthly comfort, and remember the fastest way to shrink either number is a shorter term you can actually afford.</p>
        </section>
        <FAQSection faqs={[
          { question: "How is total interest different from the APR?", answer: "APR is the annualized cost of borrowing, including fees, expressed as a rate. Total interest is the actual dollar amount you pay above principal over the loan's life — the number that belongs in your budget and your loan comparison." },
          { question: "Why does a longer term cost so much more?", answer: "Interest accrues on whatever principal remains. A longer term keeps principal outstanding longer and adds months of interest, so total interest can rise steeply even when the rate is unchanged. Shorter terms are almost always cheaper overall." },
          { question: "Does the origination fee count toward interest?", answer: "No — it's a separate upfront charge deducted from your proceeds. This calculator adds it to your total cost so you see the complete picture, and lenders who charge higher fees sometimes offset them with lower rates." },
        ]} pageUrl="https://racira.com/calculator/personal-loan-total-interest-calculator" />
        <PopularCalculators exclude="/calculator/personal-loan-total-interest-calculator" />
      </div>
    </div>
  </>);
}