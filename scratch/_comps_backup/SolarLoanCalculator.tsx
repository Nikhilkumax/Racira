"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  systemCost: number;
  downPct: number;
  interestRate: number;
  termYears: number;
  taxCreditPct: number;
  annualSavings: number;
}

interface Result {
  financedAmount: number;
  downPayment: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  taxCredit: number;
  netCostAfterCredit: number;
  monthlyNetCashFlow: number;
  paybackYears: number;
  chartData: { year: string; loanCost: number; savings: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const downPayment = inp.systemCost * (inp.downPct / 100);
  const financedAmount = Math.max(0, inp.systemCost - downPayment);
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 && financedAmount > 0 ? (financedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : financedAmount > 0 ? financedAmount / n : 0;
  const totalPayment = monthlyPayment * n;
  const totalInterest = Math.max(0, totalPayment - financedAmount);
  const taxCredit = inp.systemCost * (inp.taxCreditPct / 100);
  const netCostAfterCredit = Math.max(0, financedAmount - taxCredit);
  const monthlySavings = inp.annualSavings / 12;
  const monthlyNetCashFlow = monthlySavings - monthlyPayment;

  // Simple payback on the net financed cost after the credit, against utility savings.
  const paybackYears = inp.annualSavings > 0 ? Math.max(0, netCostAfterCredit) / inp.annualSavings : Infinity;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const years = Math.min(inp.termYears, 25);
  const chartData = Array.from({ length: years }, (_, y) => ({
    year: "Yr " + (y + 1),
    loanCost: Math.round(monthlyPayment * 12),
    savings: Math.round(inp.annualSavings),
  }));

  const breakdown = [
    { label: "System Cost", value: fmt(inp.systemCost) },
    { label: "Down Payment (" + inp.downPct + "%)", value: fmt(downPayment) },
    { label: "Amount Financed", value: fmt(financedAmount), highlight: true },
    { label: "Interest Rate", value: inp.interestRate + "% APR" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Monthly Loan Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Federal Tax Credit (" + inp.taxCreditPct + "%)", value: fmt(taxCredit) },
    { label: "Net Cost After Credit", value: fmt(netCostAfterCredit), highlight: true },
    { label: "Total Interest Paid", value: fmt(totalInterest) },
    { label: "Total Paid Over Term", value: fmt(totalPayment), isTotal: true },
    { label: "Est. Utility Savings / Year", value: fmt(inp.annualSavings) },
    { label: "Monthly Cash Flow (Savings − Payment)", value: (monthlyNetCashFlow >= 0 ? "+" : "−") + fmtD(Math.abs(monthlyNetCashFlow)) + "/mo", isTotal: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Paid", value: fmt(totalPayment) },
    { label: "Tax Credit", value: fmt(taxCredit) },
    { label: "Net Cost After Credit", value: fmt(netCostAfterCredit) },
    { label: "Monthly Net Cash Flow", value: (monthlyNetCashFlow >= 0 ? "+" : "−") + fmtD(Math.abs(monthlyNetCashFlow)) },
    { label: "Simple Payback", value: paybackYears === Infinity ? "N/A" : paybackYears.toFixed(1) + " years" },
    { label: "Amount Financed", value: fmt(financedAmount) },
  ];

  return { financedAmount, downPayment, monthlyPayment, totalPayment, totalInterest, taxCredit, netCostAfterCredit, monthlyNetCashFlow, paybackYears, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { systemCost: 28000, downPct: 10, interestRate: 6.5, termYears: 20, taxCreditPct: 30, annualSavings: 1800 };

export default function SolarLoanCalculator() {
  const [systemCost, setSystemCost] = useState(String(DEFAULTS.systemCost));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [taxCreditPct, setTaxCreditPct] = useState(String(DEFAULTS.taxCreditPct));
  const [annualSavings, setAnnualSavings] = useState(String(DEFAULTS.annualSavings));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    systemCost: parseFloat(systemCost) || 0,
    downPct: parseFloat(downPct) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    taxCreditPct: parseFloat(taxCreditPct) || 0,
    annualSavings: parseFloat(annualSavings) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setSystemCost(String(DEFAULTS.systemCost));
    setDownPct(String(DEFAULTS.downPct));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setTaxCreditPct(String(DEFAULTS.taxCreditPct));
    setAnnualSavings(String(DEFAULTS.annualSavings));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const cost = parseFloat(systemCost) || 0;
  const dp = parseFloat(downPct) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const credit = parseFloat(taxCreditPct) || 0;
  const savings = parseFloat(annualSavings) || 0;

  const valErrors: Record<string, string> = {};
  if (!systemCost || cost <= 0) valErrors.systemCost = "System Cost must be greater than $0";
  if (dp < 0 || dp > 100) valErrors.downPct = "Down payment must be between 0% and 100%";
  if (!interestRate || rate <= 0) valErrors.interestRate = "Interest Rate must be greater than 0%";
  else if (rate > 25) valErrors.interestRate = "Interest Rate must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  if (credit < 0 || credit > 100) valErrors.taxCreditPct = "Tax credit must be between 0% and 100%";
  if (savings < 0) valErrors.annualSavings = "Annual savings must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Solar Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Solar Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">System Cost ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={systemCost} onChange={e => setSystemCost(e.target.value)} className={c} /></div>{valErrors.systemCost && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.systemCost}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPct} onChange={e => setDownPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Energy &amp; Incentives</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium mb-1 block">Federal Tax Credit (%)</label><div className={i}><input type="number" value={taxCreditPct} onChange={e => setTaxCreditPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.taxCreditPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.taxCreditPct}</p>}</div>
                    <div><label className="text-sm font-medium mb-1 block">Annual Utility Savings ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualSavings} onChange={e => setAnnualSavings(e.target.value)} className={c} /></div>{valErrors.annualSavings && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualSavings}</p>}</div>
                  </div>
                </div>
              </div>
            )}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Loan Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Financing {result.financedAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} for {termYears} years at {interestRate}%</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Cash Flow", (result.monthlyNetCashFlow >= 0 ? "+" : "−") + "$" + Math.round(Math.abs(result.monthlyNetCashFlow)).toLocaleString("en-US") + "/mo", result.monthlyNetCashFlow >= 0 ? "text-emerald-600" : "text-red-500"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["Federal Tax Credit", "$" + Math.round(result.taxCredit).toLocaleString("en-US"), "text-foreground"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Annual Loan Cost vs Utility Savings</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "loanCost" ? "Annual Loan Cost" : "Annual Utility Savings", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "loanCost" ? "Annual Loan Cost" : "Annual Utility Savings")} />
                  <Bar dataKey="loanCost" name="loanCost" radius={[3, 3, 0, 0]}><Cell fill="#2563eb" /></Bar>
                  <Bar dataKey="savings" name="savings" radius={[3, 3, 0, 0]}><Cell fill="#10b981" /></Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">When the green bars (savings) reach the blue bars (loan cost), your panels are paying for themselves month to month. Simple payback: {result.paybackYears === Infinity ? "N/A" : result.paybackYears.toFixed(1) + " years"} on the net cost after the federal credit.</p>
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
          <h2 className="text-2xl font-bold mb-3">Financing a Solar Installation</h2>
          <p>Most homeowners finance solar rather than paying cash. A solar loan works like any amortized installment loan: your monthly payment is set by the financed amount, rate, and term. Two numbers matter most: the federal residential clean energy credit (currently 30% of system cost, subject to tax liability rules) and your avoided utility bill. When monthly utility savings meet or exceed the loan payment, the system is cash-flow positive from day one. The simple payback period shown here divides the net cost after the credit by annual utility savings.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is the federal solar tax credit?", answer: "The Residential Clean Energy Credit is 30% of qualifying system costs (equipment and installation). It reduces the income tax you owe, not your taxable income, and any unused portion carries forward to future years." },
          { question: "How much solar can I afford?", answer: "A common target is a monthly loan payment at or below your current average electric bill. Enter your utility savings in Advanced Options — if monthly cash flow is positive, the system pays for itself as it runs." },
          { question: "Does a down payment reduce my payment?", answer: "Yes. Every dollar of down payment shrinks the financed balance, lowering both the monthly payment and total interest. Many lenders also offer zero-down solar loans with slightly higher rates." },
        ]} pageUrl="https://racira.com/calculator/solar-loan-calculator" />
        <PopularCalculators exclude="/calculator/solar-loan-calculator" />
      </div>
    </div>
  </>);
}
