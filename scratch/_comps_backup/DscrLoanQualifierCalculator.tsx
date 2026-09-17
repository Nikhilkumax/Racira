"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  noi: number;
  minDscr: number;
  interestRate: number;
  termYears: number;
  proposedLoan: number;
}

interface Result {
  maxLoanAmount: number;
  maxMonthlyPayment: number;
  maxAnnualDebtService: number;
  proposedPayment: number;
  proposedDscr: number;
  qualifies: boolean;
  monthlyRate: number;
  chartData: { scenario: string; noi: number; debtService: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(principal: number, r: number, n: number): number {
  if (r <= 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;

  const maxAnnualDebtService = inp.noi / inp.minDscr;
  const maxMonthlyPayment = maxAnnualDebtService / 12;
  const maxLoanAmount = r > 0 ? maxMonthlyPayment * ((1 - Math.pow(1 + r, -n)) / r) : maxMonthlyPayment * n;

  const proposedPayment = inp.proposedLoan > 0 ? pmt(inp.proposedLoan, r, n) : 0;
  const proposedAnnual = proposedPayment * 12;
  const proposedDscr = proposedAnnual > 0 ? inp.noi / proposedAnnual : 0;
  const qualifies = inp.proposedLoan > 0 ? proposedDscr >= inp.minDscr : true;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const chartData = [
    { scenario: "Your Scenario", noi: Math.round(inp.noi), debtService: Math.round(proposedAnnual) },
    { scenario: "Maximum Allowed", noi: Math.round(inp.noi), debtService: Math.round(maxAnnualDebtService) },
  ];

  const breakdown = [
    { label: "Annual Net Operating Income (NOI)", value: fmt(inp.noi) },
    { label: "Lender Minimum DSCR", value: inp.minDscr.toFixed(2) + "×" },
    { label: "Maximum Annual Debt Service", value: fmt(maxAnnualDebtService) },
    { label: "Maximum Monthly Debt Service", value: fmtD(maxMonthlyPayment) },
    { label: "Estimated Maximum Loan Amount", value: fmt(maxLoanAmount), highlight: true },
    { label: "Proposed Loan Amount", value: inp.proposedLoan > 0 ? fmt(inp.proposedLoan) : "—" },
    { label: "Proposed Monthly Payment (P&I)", value: inp.proposedLoan > 0 ? fmtD(proposedPayment) : "—" },
    { label: "Proposed DSCR", value: inp.proposedLoan > 0 ? proposedDscr.toFixed(2) + "×" : "—", highlight: inp.proposedLoan > 0 },
    { label: "Qualification Verdict", value: inp.proposedLoan > 0 ? (qualifies ? "Qualifies ✓" : "Does Not Qualify ✗") : "—", isTotal: inp.proposedLoan > 0 },
  ];

  const summaryStats = [
    { label: "Max Loan Amount", value: fmt(maxLoanAmount) },
    { label: "Max Monthly Payment", value: fmtD(maxMonthlyPayment) },
    { label: "Max Annual Debt Service", value: fmt(maxAnnualDebtService) },
    { label: "Required DSCR", value: inp.minDscr.toFixed(2) + "×" },
    { label: "Proposed DSCR", value: inp.proposedLoan > 0 ? proposedDscr.toFixed(2) + "×" : "—" },
    { label: "Qualifies", value: inp.proposedLoan > 0 ? (qualifies ? "Yes ✓" : "No ✗") : "N/A" },
    { label: "Interest Rate", value: inp.interestRate + "%" },
    { label: "Loan Term", value: inp.termYears + " years" },
  ];

  return { maxLoanAmount, maxMonthlyPayment, maxAnnualDebtService, proposedPayment, proposedDscr, qualifies, monthlyRate: r, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { noi: 120000, minDscr: 1.25, interestRate: 7.5, termYears: 30, proposedLoan: 500000 };

export default function DscrLoanQualifierCalculator() {
  const [noi, setNoi] = useState(String(DEFAULTS.noi));
  const [minDscr, setMinDscr] = useState(String(DEFAULTS.minDscr));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [proposedLoan, setProposedLoan] = useState(String(DEFAULTS.proposedLoan));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    noi: parseFloat(noi) || 0,
    minDscr: parseFloat(minDscr) || 1.25,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    proposedLoan: parseFloat(proposedLoan) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setNoi(String(DEFAULTS.noi));
    setMinDscr(String(DEFAULTS.minDscr));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setProposedLoan(String(DEFAULTS.proposedLoan));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const noiNum = parseFloat(noi) || 0;
  const dscrNum = parseFloat(minDscr) || 0;
  const rateNum = parseFloat(interestRate) || 0;
  const termNum = parseInt(termYears) || 0;
  const proposed = parseFloat(proposedLoan) || 0;

  const valErrors: Record<string, string> = {};
  if (!noi || noiNum <= 0) valErrors.noi = "Annual NOI must be greater than $0";
  if (!minDscr || dscrNum < 1) valErrors.minDscr = "Minimum DSCR must be at least 1.00";
  else if (dscrNum > 3) valErrors.minDscr = "Minimum DSCR must be 3.00 or less";
  if (!interestRate || rateNum <= 0) valErrors.interestRate = "Interest Rate must be greater than 0%";
  else if (rateNum > 25) valErrors.interestRate = "Interest Rate must be 25% or less";
  if (!termYears || termNum <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (termNum > 40) valErrors.termYears = "Term must be 40 years or less";
  if (proposed < 0) valErrors.proposedLoan = "Proposed Loan must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "DSCR Loan Qualifier Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">DSCR Loan Qualifier Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Annual NOI ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={noi} onChange={e => setNoi(e.target.value)} className={c} /></div>{valErrors.noi && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.noi}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Lender Min DSCR (×)</label><div className={i}><input type="number" value={minDscr} onChange={e => setMinDscr(e.target.value)} step="0.05" className={c} /></div>{valErrors.minDscr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.minDscr}</p>}</div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Lender Scenario</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-sm font-medium mb-1 block">Proposed Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={proposedLoan} onChange={e => setProposedLoan(e.target.value)} className={c} /></div>{valErrors.proposedLoan && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.proposedLoan}</p>}<p className="text-[11px] text-muted-foreground mt-1">Test a specific loan amount to see whether it clears the lender's DSCR.</p></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Maximum Loan Amount</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.maxLoanAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Capped by {minDscr}× DSCR · {interestRate}% for {termYears} years · ${noiNum.toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr NOI</div>
            </div>
            <div className="grid grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Proposed DSCR", proposed > 0 ? result.proposedDscr.toFixed(2) + "×" : "—", result.qualifies && proposed > 0 ? "text-emerald-600" : proposed > 0 ? "text-red-500" : "text-muted-foreground"],
                ["Max Monthly Payment", "$" + Math.round(result.maxMonthlyPayment).toLocaleString("en-US"), "text-foreground"],
                ["Max Annual Debt Service", "$" + Math.round(result.maxAnnualDebtService / 1000) + "K", "text-foreground"],
                ["Est. Max Loan", "$" + Math.round(result.maxLoanAmount / 1000) + "K", "text-primary"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            {proposed > 0 && (
              <div className={`rounded-lg p-4 text-center border ${result.qualifies ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" : "bg-red-500/10 border-red-500/20 text-red-600"}`}>
                <p className="text-xl font-black mb-1">{result.qualifies ? "✓ Qualifies" : "✗ Does Not Qualify"}</p>
                <p className="text-sm font-medium">{result.qualifies ? "Proposed DSCR of " + result.proposedDscr.toFixed(2) + "× clears the " + minDscr + "× minimum." : "Proposed DSCR of " + result.proposedDscr.toFixed(2) + "× is below the " + minDscr + "× minimum. Reduce the loan or raise NOI."}</p>
              </div>
            )}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">NOI vs Debt Service (Annual)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="scenario" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number, name: string) => [name === "noi" ? "Annual NOI" : "Annual Debt Service", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => (value === "noi" ? "Annual NOI" : "Annual Debt Service")} />
                  <Bar dataKey="noi" name="noi" radius={[3, 3, 0, 0]}><Cell fill="#2563eb" /></Bar>
                  <Bar dataKey="debtService" name="debtService" radius={[3, 3, 0, 0]}><Cell fill="#f59e0b" /></Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">The gap between each bar is the cash-flow cushion the lender requires. Debt service must stay at or below NOI ÷ minimum DSCR.</p>
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
          <h2 className="text-2xl font-bold mb-3">How DSCR Loan Qualifying Works</h2>
          <p>Debt Service Coverage Ratio (DSCR) measures a rental property's net operating income against its annual loan payments: DSCR = NOI ÷ Annual Debt Service. Lenders typically require 1.20×–1.30× for investment properties. The maximum annual debt service you can carry is NOI ÷ minimum DSCR; converting that monthly payment back through the interest rate and term gives the largest loan the property's income supports. Properties that qualify on income alone — without personal tax-return income — are the core of DSCR (no-doc) lending.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a good DSCR?", answer: "Most DSCR lenders require at least 1.20×–1.25×, meaning the property's net operating income is 20–25% higher than its annual loan payments. Stronger ratios (1.30×+) often unlock better rates and terms." },
          { question: "How is the maximum loan amount derived?", answer: "Divide NOI by the lender's minimum DSCR to get the maximum annual debt service, divide by 12 for the monthly payment, then solve the present-value annuity formula for the principal that payment supports at your rate and term." },
          { question: "What counts as net operating income?", answer: "NOI is gross rental income minus operating expenses: vacancy allowance, property management, repairs, insurance, property taxes, and utilities — before mortgage payments and before income tax." },
        ]} pageUrl="https://racira.com/calculator/dscr-loan-qualifier-calculator" />
        <PopularCalculators exclude="/calculator/dscr-loan-qualifier-calculator" />
      </div>
    </div>
  </>);
}
