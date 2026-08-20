"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  vacationCost: number;
  interestRate: number;
  term: number;
  downPayment: number;
  originationFee: number;
  monthlyIfSaved: number;
  investmentReturn: number;
}

interface Result {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalLoanCost: number;
  trueVacationCost: number;
  saveFirstMonths: number;
  saveFirstTotalCost: number;
  investDifference: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { month: string; loanBalance: number; savedAmount: number }[];
}

function calc(inp: Inputs): Result {
  const origFee = inp.vacationCost * (inp.originationFee / 100);
  const loanAmount = inp.vacationCost - inp.downPayment + origFee;
  const r = inp.interestRate / 100 / 12;
  const n = inp.term * 12;
  const monthlyPayment = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
  const totalInterest = monthlyPayment * n - loanAmount;
  const totalLoanCost = monthlyPayment * n + inp.downPayment;
  const trueVacationCost = totalLoanCost + origFee;

  // Save-first analysis
  const saveFirstMonths = inp.monthlyIfSaved > 0 ? Math.ceil((inp.vacationCost - inp.downPayment) / inp.monthlyIfSaved) : Infinity;
  const saveFirstTotalCost = inp.vacationCost; // No interest if saving first

  // What if you invested the monthly payment instead for the loan term
  const investBalance = monthlyPayment * n; // Simple: what you'd have if you just saved the payments
  const investDifference = trueVacationCost - inp.vacationCost;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Vacation Cost", value: fmt(inp.vacationCost) },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Origination Fee (" + inp.originationFee + "%)", value: fmt(origFee) },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "Interest Rate", value: inp.interestRate + "%/yr" },
    { label: "Loan Term", value: inp.term + " years" },
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment), highlight: true },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Loan Cost", value: fmt(totalLoanCost) },
    { label: "True Vacation Cost (with loan)", value: fmt(trueVacationCost), highlight: true },
    { label: "Cost If You Saved First", value: fmt(saveFirstTotalCost) },
    { label: "Extra Cost of Loan", value: fmt(trueVacationCost - saveFirstTotalCost), highlight: true },
    { label: "Months to Save (" + fmt(inp.monthlyIfSaved) + "/mo)", value: saveFirstMonths === Infinity ? "N/A" : saveFirstMonths + " months" },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: "$" + fmtD(monthlyPayment) + "/mo" },
    { label: "Total Loan Cost", value: fmt(totalLoanCost) },
    { label: "True Vacation Cost", value: fmt(trueVacationCost) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Origination Fee", value: fmt(origFee) },
    { label: "Save-First Cost", value: fmt(saveFirstTotalCost) },
    { label: "Extra Cost of Loan", value: fmt(trueVacationCost - saveFirstTotalCost) },
    { label: "Months to Save", value: saveFirstMonths === Infinity ? "N/A" : saveFirstMonths + " mo" },
  ];

  // Chart: Loan balance vs savings over time
  const chartData: { month: string; loanBalance: number; savedAmount: number }[] = [];
  let loanBal = loanAmount;
  let savedAmount = 0;
  const maxMonths = Math.max(n, saveFirstMonths === Infinity ? n : saveFirstMonths);
  for (let m = 1; m <= Math.min(maxMonths, 60); m++) {
    if (m <= n) {
      const intPay = loanBal * r;
      loanBal = Math.max(0, loanBal - (monthlyPayment - intPay));
    }
    savedAmount += inp.monthlyIfSaved;
    if (m % 3 === 0) {
      chartData.push({
        month: "Mo " + m,
        loanBalance: Math.round(Math.max(0, loanBal)),
        savedAmount: Math.round(Math.min(savedAmount, inp.vacationCost)),
      });
    }
  }

  return { loanAmount, monthlyPayment, totalInterest, totalLoanCost, trueVacationCost, saveFirstMonths, saveFirstTotalCost, investDifference, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { vacationCost: 5000, interestRate: 12, term: 2, downPayment: 500, originationFee: 3, monthlyIfSaved: 250, investmentReturn: 7 };

export default function VacationLoanCalculator() {
  const [vacationCost, setVacationCost] = useState(String(DEFAULTS.vacationCost));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [term, setTerm] = useState(String(DEFAULTS.term));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [originationFee, setOriginationFee] = useState(String(DEFAULTS.originationFee));
  const [monthlyIfSaved, setMonthlyIfSaved] = useState(String(DEFAULTS.monthlyIfSaved));
  const [investmentReturn, setInvestmentReturn] = useState(String(DEFAULTS.investmentReturn));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    vacationCost: parseFloat(vacationCost) || 0,
    interestRate: parseFloat(interestRate) || 0,
    term: parseInt(term) || 2,
    downPayment: parseFloat(downPayment) || 0,
    originationFee: parseFloat(originationFee) || 0,
    monthlyIfSaved: parseFloat(monthlyIfSaved) || 0,
    investmentReturn: parseFloat(investmentReturn) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setVacationCost(String(DEFAULTS.vacationCost));
    setInterestRate(String(DEFAULTS.interestRate));
    setTerm(String(DEFAULTS.term));
    setDownPayment(String(DEFAULTS.downPayment));
    setOriginationFee(String(DEFAULTS.originationFee));
    setMonthlyIfSaved(String(DEFAULTS.monthlyIfSaved));
    setInvestmentReturn(String(DEFAULTS.investmentReturn));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "Should I take out a loan for a vacation?", answer: "Generally, financing a vacation is not recommended. You'll pay significantly more than the vacation's sticker price due to interest and fees. A $5,000 vacation financed at 12% for 2 years costs about $5,625 — that's $625 extra. Saving $250/month for 18 months lets you pay cash with zero extra cost." },
    { question: "What's the true cost of a vacation loan?", answer: "The true cost includes the vacation price PLUS interest, origination fees, and any other loan costs. For a $5,000 vacation at 12% with a 3% origination fee over 2 years, you'd pay approximately $5,625 — $625 more than paying cash." },
    { question: "Better alternative: save first or invest instead?", answer: "Saving first is almost always better than borrowing for a vacation. Set up automatic transfers to a dedicated savings account. If you invest the would-be monthly payments at 7% for the loan term, you'd build a small investment balance too — turning a financial loss into a gain." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Vacation Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vacation Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Vacation Cost ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={vacationCost} onChange={e => setVacationCost(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Origination Fee (%)</label><div className={i}><input type="number" value={originationFee} onChange={e => setOriginationFee(e.target.value)} step="0.5" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          {/* Advanced Options */}
          <details className="group">
            <summary className="text-sm text-primary font-medium cursor-pointer select-none flex items-center gap-1">Advanced Options <span className="text-xs group-open:rotate-180 transition-transform">▼</span></summary>
            <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Save-First Comparison</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Monthly Savings Target ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyIfSaved} onChange={e => setMonthlyIfSaved(e.target.value)} className={c} /></div></div>
                <div><label className="text-sm font-medium mb-1 block">If Invested Instead (%)</label><div className={i}><input type="number" value={investmentReturn} onChange={e => setInvestmentReturn(e.target.value)} step="0.5" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              </div>
            </div>
          </details>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">True Vacation Cost (with loan)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.trueVacationCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Monthly: ${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo · Extra cost of loan: ${result.investDifference.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["True Cost", "$" + Math.round(result.trueVacationCost).toLocaleString()], ["Save-First", "$" + Math.round(result.saveFirstTotalCost).toLocaleString()], ["Extra Cost", "$" + Math.round(result.investDifference).toLocaleString()]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Loan Balance vs Savings Progress</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(1) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="loanBalance" fill="#ef4444" name="Loan Balance Remaining" radius={[4, 4, 0, 0]} /><Bar dataKey="savedAmount" fill="#22c55e" name="Amount Saved" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">The True Cost of Financing a Vacation</h2><p>Personal loans for vacations typically carry 8–18% APR, and many charge origination fees of 1–8%. This means you'll pay more than the vacation itself. A $5,000 trip financed at 12% over 2 years costs roughly $5,625 — that's a $625 premium. Setting aside $250/month for 18 months lets you pay cash and save the interest entirely.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vacation-loan-calculator" /><PopularCalculators exclude="/calculator/vacation-loan-calculator" /></div>
    </div>
  </>);
}
