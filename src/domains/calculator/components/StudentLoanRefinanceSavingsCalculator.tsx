"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  currentBalance: number;
  currentRate: number;
  currentTerm: number;
  newRate: number;
  newTerm: number;
  refinanceFees: number;
}

interface Result {
  currentPayment: number;
  newPayment: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  totalSavings: number;
  monthlySavings: number;
  breakEvenMonths: number;
  payoffDateDiff: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; currentBalance: number; newBalance: number }[];
}

function calc(inp: Inputs): Result {
  const r1 = inp.currentRate / 100 / 12;
  const r2 = inp.newRate / 100 / 12;
  const n1 = inp.currentTerm * 12;
  const n2 = inp.newTerm * 12;

  const currentPayment = r1 > 0 ? (inp.currentBalance * r1 * Math.pow(1 + r1, n1)) / (Math.pow(1 + r1, n1) - 1) : inp.currentBalance / n1;
  const newPayment = r2 > 0 ? (inp.currentBalance * r2 * Math.pow(1 + r2, n2)) / (Math.pow(1 + r2, n2) - 1) : inp.currentBalance / n2;

  const currentTotalInterest = currentPayment * n1 - inp.currentBalance;
  const newTotalInterest = newPayment * n2 - inp.currentBalance + inp.refinanceFees;
  const totalSavings = currentTotalInterest - newTotalInterest;
  const monthlySavings = currentPayment - newPayment;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(inp.refinanceFees / monthlySavings) : Infinity;
  const payoffDateDiff = inp.currentTerm - inp.newTerm;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Current Loan Balance", value: fmt(inp.currentBalance) },
    { label: "Current Interest Rate", value: inp.currentRate + "%/yr" },
    { label: "Current Remaining Term", value: inp.currentTerm + " years" },
    { label: "Current Monthly Payment", value: "$" + fmtD(currentPayment) },
    { label: "New Interest Rate", value: inp.newRate + "%/yr" },
    { label: "New Term", value: inp.newTerm + " years" },
    { label: "New Monthly Payment", value: "$" + fmtD(newPayment), highlight: true },
    { label: "Monthly Savings", value: "$" + fmtD(Math.abs(monthlySavings)), highlight: true },
    { label: "Refinance Fees", value: fmt(inp.refinanceFees) },
    { label: "Break-Even Point", value: breakEvenMonths === Infinity ? "Never" : breakEvenMonths + " months" },
    { label: "Total Interest (Current)", value: fmt(currentTotalInterest) },
    { label: "Total Interest (New)", value: fmt(newTotalInterest), highlight: true },
    { label: "Net Savings", value: (totalSavings >= 0 ? "" : "-") + fmt(Math.abs(totalSavings)), highlight: true },
  ];

  const summaryStats = [
    { label: "Current Payment", value: "$" + fmtD(currentPayment) + "/mo" },
    { label: "New Payment", value: "$" + fmtD(newPayment) + "/mo" },
    { label: "Monthly Savings", value: "$" + fmtD(Math.abs(monthlySavings)) + "/mo" },
    { label: "Total Interest (Current)", value: fmt(currentTotalInterest) },
    { label: "Total Interest (New)", value: fmt(newTotalInterest) },
    { label: "Net Savings", value: (totalSavings >= 0 ? "" : "-") + fmt(Math.abs(totalSavings)) },
    { label: "Break-Even", value: breakEvenMonths === Infinity ? "N/A" : breakEvenMonths + " months" },
    { label: "Refinance Fees", value: fmt(inp.refinanceFees) },
  ];

  // Build balance projection chart
  const chartData: { year: string; currentBalance: number; newBalance: number }[] = [];
  let curBal = inp.currentBalance;
  let newBal = inp.currentBalance;
  const maxYears = Math.max(inp.currentTerm, inp.newTerm);

  for (let yr = 1; yr <= Math.min(maxYears, 30); yr++) {
    // Current loan: amortize 12 months
    for (let m = 0; m < 12; m++) {
      const ci = curBal * r1;
      curBal = Math.max(0, curBal - (currentPayment - ci));
    }
    // New loan: amortize 12 months
    for (let m = 0; m < 12; m++) {
      const ni = newBal * r2;
      newBal = Math.max(0, newBal - (newPayment - ni));
    }
    chartData.push({ year: "Yr " + yr, currentBalance: Math.round(Math.max(0, curBal)), newBalance: Math.round(Math.max(0, newBal)) });
  }

  return { currentPayment, newPayment, currentTotalInterest, newTotalInterest, totalSavings, monthlySavings, breakEvenMonths, payoffDateDiff, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { currentBalance: 45000, currentRate: 6.8, currentTerm: 10, newRate: 5.2, newTerm: 7, refinanceFees: 500 };

export default function StudentLoanRefinanceSavingsCalculator() {
  const [currentBalance, setCurrentBalance] = useState(String(DEFAULTS.currentBalance));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [currentTerm, setCurrentTerm] = useState(String(DEFAULTS.currentTerm));
  const [newRate, setNewRate] = useState(String(DEFAULTS.newRate));
  const [newTerm, setNewTerm] = useState(String(DEFAULTS.newTerm));
  const [refinanceFees, setRefinanceFees] = useState(String(DEFAULTS.refinanceFees));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    currentBalance: parseFloat(currentBalance) || 0,
    currentRate: parseFloat(currentRate) || 0,
    currentTerm: parseInt(currentTerm) || 10,
    newRate: parseFloat(newRate) || 0,
    newTerm: parseInt(newTerm) || 7,
    refinanceFees: parseFloat(refinanceFees) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setCurrentBalance(String(DEFAULTS.currentBalance));
    setCurrentRate(String(DEFAULTS.currentRate));
    setCurrentTerm(String(DEFAULTS.currentTerm));
    setNewRate(String(DEFAULTS.newRate));
    setNewTerm(String(DEFAULTS.newTerm));
    setRefinanceFees(String(DEFAULTS.refinanceFees));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "Should I refinance my student loans?", answer: "Refinancing makes sense if you can get a significantly lower interest rate, have a stable income, and won't need federal loan protections (income-driven repayment, forgiveness). Use this calculator to see if the savings outweigh the fees and loss of federal benefits." },
    { question: "What are the risks of refinancing federal student loans?", answer: "When you refinance federal loans with a private lender, you permanently lose access to income-driven repayment plans, Public Service Loan Forgiveness (PSLF), and federal deferment/forbearance options. Only refinance federal loans if you're confident you won't need these protections." },
    { question: "How long does refinancing take?", answer: "The refinancing process typically takes 2–4 weeks from application to payoff. You'll need to submit income verification, employment info, and loan statements. Some lenders offer pre-qualification with a soft credit check that won't impact your credit score." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Student Loan Refinance Savings Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Loan Refinance Savings Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Current Loan Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Current Rate (%)</label><div className={i}><input type="number" value={currentRate} onChange={e => setCurrentRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Current Term</label><div className={i}><input type="number" value={currentTerm} onChange={e => setCurrentTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">New Rate (%)</label><div className={i}><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">New Term</label><div className={i}><input type="number" value={newTerm} onChange={e => setNewTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Refinance Fees ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={refinanceFees} onChange={e => setRefinanceFees(e.target.value)} className={c} /></div></div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Savings</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${Math.abs(result.monthlySavings).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{result.monthlySavings < 0 ? " more" : ""}</div>
              <div className="text-sm text-muted-foreground mt-1">New: ${result.newPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo vs Current: ${result.currentPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo · Net: {result.totalSavings >= 0 ? "$" + result.totalSavings.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " saved" : "-$" + Math.abs(result.totalSavings).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " more"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly Savings", "$" + Math.abs(result.monthlySavings).toFixed(2)], ["Total Savings", (result.totalSavings >= 0 ? "$" : "-$") + Math.abs(Math.round(result.totalSavings)).toLocaleString()], ["Break-Even", result.breakEvenMonths === Infinity ? "N/A" : result.breakEvenMonths + " mo"]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Balance Projection</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="currentBalance" fill="#ef4444" name="Current Loan Balance" radius={[4, 4, 0, 0]} /><Bar dataKey="newBalance" fill="hsl(var(--primary))" name="Refinanced Balance" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Student Loan Refinancing Guide</h2><p>Refinancing replaces your existing student loans with a new loan at a lower interest rate. The best candidates have high-interest federal or private loans, stable income, and good credit. Compare your current loan terms with potential new terms to see how much you could save.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/student-loan-refinance-savings-calculator" /><PopularCalculators exclude="/calculator/student-loan-refinance-savings-calculator" /></div>
    </div>
  </>);
}
