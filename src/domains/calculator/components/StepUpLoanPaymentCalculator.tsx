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
  initialRate: number;
  term: number;
  annualIncrease: number;
  stepYears: number;
}

interface Result {
  initialPayment: number;
  finalPayment: number;
  totalInterest: number;
  totalCost: number;
  payments: { year: number; payment: number; principal: number; interest: number; balance: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; payment: number; principal: number }[];
}

function calc(inp: Inputs): Result {
  const r = inp.initialRate / 100 / 12;
  const n = inp.term * 12;
  
  // Calculate initial payment assuming standard amortization
  const standardPayment = r > 0 ? (inp.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inp.loanAmount / n;
  
  // Step-up: payments increase by annualIncrease% every stepYears
  const stepMonths = inp.stepYears * 12;
  const increaseRate = 1 + inp.annualIncrease / 100;
  
  let balance = inp.loanAmount;
  let currentPayment = standardPayment * 0.75; // Start lower for step-up
  let totalInterest = 0;
  const payments: Result["payments"] = [];
  const chartData: { year: string; payment: number; principal: number }[] = [];
  
  // Find initial payment that pays off loan with step-ups
  // Binary search for correct initial payment
  let low = 0;
  let high = inp.loanAmount * r * 2; // Max possible monthly payment
  
  for (let iter = 0; iter < 50; iter++) {
    const mid = (low + high) / 2;
    let testBalance = inp.loanAmount;
    let testPayment = mid;
    let testInterest = 0;
    let testPaid = true;
    
    for (let m = 0; m < n; m++) {
      if (testBalance <= 0) break;
      const intPay = testBalance * r;
      const princPay = Math.min(testPayment - intPay, testBalance);
      if (princPay < 0) { testPaid = false; break; }
      testBalance = Math.max(0, testBalance - princPay);
      testInterest += intPay;
      
      // Increase payment at step intervals
      if ((m + 1) % stepMonths === 0 && m + 1 < n) {
        testPayment *= increaseRate;
      }
    }
    
    if (testBalance <= 0.01 && testPaid) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  currentPayment = (low + high) / 2;
  balance = inp.loanAmount;
  totalInterest = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  
  for (let m = 0; m < n; m++) {
    const intPay = balance * r;
    const princPay = Math.min(currentPayment - intPay, balance);
    balance = Math.max(0, balance - princPay);
    totalInterest += intPay;
    yearPrincipal += princPay;
    yearInterest += intPay;
    
    if ((m + 1) % 12 === 0) {
      const yr = Math.floor(m / 12) + 1;
      payments.push({
        year: yr,
        payment: currentPayment,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.round(balance),
      });
      chartData.push({ year: "Yr " + yr, payment: Math.round(currentPayment), principal: Math.round(yearPrincipal) });
      yearPrincipal = 0;
      yearInterest = 0;
    }
    
    if ((m + 1) % stepMonths === 0 && m + 1 < n) {
      currentPayment *= increaseRate;
    }
  }
  
  const finalPayment = payments.length > 0 ? payments[payments.length - 1].payment : currentPayment;
  const totalCost = inp.loanAmount + totalInterest;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Interest Rate", value: inp.initialRate + "%/yr" },
    { label: "Loan Term", value: inp.term + " years" },
    { label: "Annual Increase", value: inp.annualIncrease + "%" },
    { label: "Step Interval", value: "Every " + inp.stepYears + " years" },
    { label: "Initial Monthly Payment", value: "$" + fmtD(payments[0]?.payment || 0), highlight: true },
    { label: "Final Monthly Payment", value: "$" + fmtD(finalPayment), highlight: true },
    { label: "Payment Increase (total)", value: "$" + fmtD(finalPayment - (payments[0]?.payment || 0)) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost), highlight: true },
  ];

  const summaryStats = [
    { label: "Initial Payment", value: "$" + fmtD(payments[0]?.payment || 0) + "/mo" },
    { label: "Final Payment", value: "$" + fmtD(finalPayment) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost", value: fmt(totalCost) },
    { label: "Step Increase", value: inp.annualIncrease + "% every " + inp.stepYears + "yr" },
    { label: "Payment Growth", value: ((finalPayment / (payments[0]?.payment || 1) - 1) * 100).toFixed(1) + "%" },
    { label: "Loan Term", value: inp.term + " years" },
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
  ];

  return { initialPayment: payments[0]?.payment || 0, finalPayment, totalInterest, totalCost, payments, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 300000, initialRate: 6, term: 30, annualIncrease: 5, stepYears: 2 };

export default function StepUpLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [initialRate, setInitialRate] = useState(String(DEFAULTS.initialRate));
  const [term, setTerm] = useState(String(DEFAULTS.term));
  const [annualIncrease, setAnnualIncrease] = useState(String(DEFAULTS.annualIncrease));
  const [stepYears, setStepYears] = useState(String(DEFAULTS.stepYears));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    initialRate: parseFloat(initialRate) || 0,
    term: parseInt(term) || 30,
    annualIncrease: parseFloat(annualIncrease) || 5,
    stepYears: parseInt(stepYears) || 2,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInitialRate(String(DEFAULTS.initialRate));
    setTerm(String(DEFAULTS.term));
    setAnnualIncrease(String(DEFAULTS.annualIncrease));
    setStepYears(String(DEFAULTS.stepYears));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is a step-up loan?", answer: "A step-up (or graduated payment) loan starts with lower monthly payments that increase at regular intervals. This is designed for borrowers who expect their income to grow over time, like medical residents, young professionals, or startup founders. The lower initial payments make qualification easier." },
    { question: "How do step-up payments work?", answer: "Payments start at a lower level and increase by a set percentage every few years. For example, a $300,000 loan at 6% might start at ~$1,400/month and increase 5% every 2 years, reaching ~$2,400/month by year 30. The total interest paid is higher than standard amortization due to the lower early payments." },
    { question: "Are step-up loans available today?", answer: "Step-up loans are less common than they once were but are still offered by some lenders, particularly for physician loans, FHA Section 245 graduated payment mortgages, and some credit unions. They're worth exploring if you have strong income growth expectations." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Step-Up Loan Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Step-Up Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={initialRate} onChange={e => setInitialRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Annual Increase (%)</label><div className={i}><input type="number" value={annualIncrease} onChange={e => setAnnualIncrease(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Step Interval</label><div className={i}><input type="number" value={stepYears} onChange={e => setStepYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Initial Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.initialPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Final: ${result.finalPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo · Total Interest: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Initial", "$" + result.initialPayment.toFixed(2)], ["Final", "$" + result.finalPayment.toFixed(2)], ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString()]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Payment & Principal by Year</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(1) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="payment" fill="hsl(var(--primary))" name="Annual Payment" radius={[4, 4, 0, 0]} /><Bar dataKey="principal" fill="#22c55e" name="Principal Paid" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">How Step-Up Loans Work</h2><p>A step-up loan (graduated payment mortgage) starts with below-market payments that increase annually or biennially. This structure benefits borrowers with rising income trajectories — doctors completing residencies, professionals expecting promotions, or entrepreneurs with growing revenue. The tradeoff: you pay more total interest than a standard fixed-rate mortgage.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/step-up-loan-payment-calculator" /><PopularCalculators exclude="/calculator/step-up-loan-payment-calculator" /></div>
    </div>
  </>);
}
