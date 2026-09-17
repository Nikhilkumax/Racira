"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  homePrice: number;
  downPayment: number;
  initialRate: number;
  term: number;
  stressRate: number;
  income: number;
  monthlyDebt: number;
}

interface Result {
  initialPayment: number;
  stressedPayment: number;
  paymentIncrease: number;
  maxAffordable: number;
  dtiInitial: number;
  dtiStressed: number;
  totalInterestInitial: number;
  totalInterestStressed: number;
  canAffordStress: boolean;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: string; initialPayment: number; stressedPayment: number }[];
}

function calcPMT(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return r > 0 ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / n;
}

function calc(inp: Inputs): Result {
  const loanAmount = inp.homePrice - inp.downPayment;
  const initialPayment = calcPMT(loanAmount, inp.initialRate, inp.term);
  const stressedPayment = calcPMT(loanAmount, inp.stressRate, inp.term);
  const paymentIncrease = stressedPayment - initialPayment;

  // Max affordable at stress rate (front-end 28% + back-end 36%)
  const monthlyIncome = inp.income / 12;
  const maxPITI = monthlyIncome * 0.36 - inp.monthlyDebt;
  const maxAffordable = maxPITI > 0 ? maxPITI : 0;

  const dtiInitial = monthlyIncome > 0 ? ((initialPayment + inp.monthlyDebt) / monthlyIncome) * 100 : 0;
  const dtiStressed = monthlyIncome > 0 ? ((stressedPayment + inp.monthlyDebt) / monthlyIncome) * 100 : 0;

  const n = inp.term * 12;
  const totalInterestInitial = initialPayment * n - loanAmount;
  const totalInterestStressed = stressedPayment * n - loanAmount;
  const canAffordStress = dtiStressed <= 36;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Home Price", value: fmt(inp.homePrice) },
    { label: "Down Payment", value: fmt(inp.downPayment) + " (" + (inp.homePrice > 0 ? ((inp.downPayment / inp.homePrice) * 100).toFixed(1) : 0) + "%)" },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "Initial Interest Rate", value: inp.initialRate + "%/yr" },
    { label: "Stress Test Rate", value: inp.stressRate + "%/yr" },
    { label: "Loan Term", value: inp.term + " years" },
    { label: "Initial Monthly Payment", value: "$" + fmtD(initialPayment), highlight: true },
    { label: "Stressed Monthly Payment", value: "$" + fmtD(stressedPayment), highlight: true },
    { label: "Payment Increase", value: "$" + fmtD(paymentIncrease) + "/mo", highlight: true },
    { label: "Initial DTI Ratio", value: dtiInitial.toFixed(1) + "%" },
    { label: "Stressed DTI Ratio", value: dtiStressed.toFixed(1) + "%", highlight: true },
    { label: "Can Afford Stress Test?", value: canAffordStress ? "Yes ✓" : "No ✗", highlight: true },
    { label: "Total Interest (Initial)", value: fmt(totalInterestInitial) },
    { label: "Total Interest (Stressed)", value: fmt(totalInterestStressed) },
  ];

  const summaryStats = [
    { label: "Initial Payment", value: "$" + fmtD(initialPayment) + "/mo" },
    { label: "Stressed Payment", value: "$" + fmtD(stressedPayment) + "/mo" },
    { label: "Increase", value: "$" + fmtD(paymentIncrease) + "/mo" },
    { label: "Initial DTI", value: dtiInitial.toFixed(1) + "%" },
    { label: "Stressed DTI", value: dtiStressed.toFixed(1) + "%" },
    { label: "Max Affordable", value: "$" + fmtD(maxAffordable) + "/mo" },
    { label: "Total Interest (Initial)", value: fmt(totalInterestInitial) },
    { label: "Total Interest (Stressed)", value: fmt(totalInterestStressed) },
  ];

  // Chart: payment at various rates
  const chartData: { year: string; initialPayment: number; stressedPayment: number }[] = [];
  const steps = [inp.initialRate, inp.initialRate + 1, inp.initialRate + 2, inp.stressRate, inp.stressRate + 1];
  for (const rate of steps) {
    const pmt = calcPMT(loanAmount, rate, inp.term);
    chartData.push({ year: rate.toFixed(1) + "%", initialPayment: Math.round(initialPayment), stressedPayment: Math.round(pmt) });
  }

  return { initialPayment, stressedPayment, paymentIncrease, maxAffordable, dtiInitial, dtiStressed, totalInterestInitial, totalInterestStressed, canAffordStress, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { homePrice: 400000, downPayment: 80000, initialRate: 5.5, term: 30, stressRate: 8.5, income: 120000, monthlyDebt: 500 };

export default function MortgageStressTestCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [initialRate, setInitialRate] = useState(String(DEFAULTS.initialRate));
  const [term, setTerm] = useState(String(DEFAULTS.term));
  const [stressRate, setStressRate] = useState(String(DEFAULTS.stressRate));
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [monthlyDebt, setMonthlyDebt] = useState(String(DEFAULTS.monthlyDebt));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPayment: parseFloat(downPayment) || 0,
    initialRate: parseFloat(initialRate) || 0,
    term: parseInt(term) || 30,
    stressRate: parseFloat(stressRate) || 0,
    income: parseFloat(income) || 0,
    monthlyDebt: parseFloat(monthlyDebt) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPayment(String(DEFAULTS.downPayment));
    setInitialRate(String(DEFAULTS.initialRate));
    setTerm(String(DEFAULTS.term));
    setStressRate(String(DEFAULTS.stressRate));
    setIncome(String(DEFAULTS.income));
    setMonthlyDebt(String(DEFAULTS.monthlyDebt));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is a mortgage stress test?", answer: "A mortgage stress test evaluates whether you can still afford your mortgage if interest rates rise. Canadian regulators require lenders to qualify borrowers at the higher of their contracted rate or the qualifying rate (typically 5.25% or 2% above their rate). This protects borrowers from defaulting if rates increase." },
    { question: "What DTI ratio is safe?", answer: "Most lenders prefer a total debt-to-income (DTI) ratio below 36%, with housing costs not exceeding 28% of gross income (the 28/36 rule). In stress test scenarios, staying below 42% provides a comfortable buffer. Above 43% is considered high risk by most lenders." },
    { question: "Should I stress test before buying a home?", answer: "Yes. Always test at least 2–3% above your current rate. If you can't comfortably afford the stressed payment, consider a less expensive home, larger down payment, or a shorter loan term. This is especially important in volatile rate environments." },
  ];

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Stress Test Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Stress Test Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Home Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Initial Rate (%)</label><div className={i}><input type="number" value={initialRate} onChange={e => setInitialRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Stress Test Rate (%)</label><div className={i}><input type="number" value={stressRate} onChange={e => setStressRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          {/* Advanced Options */}
          <details className="group">
            <summary className="text-sm text-primary font-medium cursor-pointer select-none flex items-center gap-1">Advanced Options <span className="text-xs group-open:rotate-180 transition-transform">▼</span></summary>
            <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Income & Debt</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Annual Income ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={c} /></div></div>
                <div><label className="text-sm font-medium mb-1 block">Other Monthly Debt ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyDebt} onChange={e => setMonthlyDebt(e.target.value)} className={c} /></div></div>
              </div>
            </div>
          </details>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.canAffordStress ? "text-primary" : "text-red-600"}`}>Stress Test {result.canAffordStress ? "PASSED ✓" : "FAILED ✗"}</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.stressedPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-base font-normal text-muted-foreground">/mo at {DEFAULTS.stressRate}%</span></div>
              <div className="text-sm text-muted-foreground mt-1">Initial: ${result.initialPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo · Increase: +${result.paymentIncrease.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Initial", "$" + result.initialPayment.toFixed(2)], ["Stressed", "$" + result.stressedPayment.toFixed(2)], ["DTI", result.dtiStressed.toFixed(1) + "%"]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Payment at Different Rates</h3><ResponsiveContainer width="100%" height={220}><BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => "$" + (v / 1000).toFixed(1) + "K"} /><Tooltip formatter={(v: number) => ["$" + v.toLocaleString() + "/mo", ""]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="stressedPayment" fill="hsl(var(--primary))" name="Monthly Payment" radius={[4, 4, 0, 0]} /><Bar dataKey="initialPayment" fill="#22c55e" name="Initial Baseline" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Full Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10" /><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Mortgage Stress Testing</h2><p>A mortgage stress test ensures you can still make payments if interest rates rise. Canada's OSFI requires qualification at the higher of 5.25% or 2% above your contracted rate. In the US, the CFPB recommends testing 3% above your rate. This calculator shows exactly how rate increases affect your payment and debt-to-income ratio.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-stress-test-calculator" /><PopularCalculators exclude="/calculator/mortgage-stress-test-calculator" /></div>
    </div>
  </>);
}
