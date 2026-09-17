"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  originationFeePct: number;
  otherFees: number;
}

interface Result {
  monthlyPayment: number;
  totalInterest: number;
  originationFee: number;
  totalUpfront: number;
  totalCost: number;
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const monthlyPayment = inp.loanAmount * r;
  const totalInterest = monthlyPayment * inp.termMonths;
  const originationFee = (inp.loanAmount * inp.originationFeePct) / 100;
  const totalUpfront = originationFee + inp.otherFees;
  const totalCost = totalInterest + totalUpfront;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Bridge Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Interest Rate", value: inp.interestRate + "%" },
    { label: "Bridge Term", value: inp.termMonths + " months" },
    { label: "Origination Fee", value: inp.originationFeePct + "%" },
    { label: "Monthly Payment (Interest-Only)", value: fmtD(monthlyPayment), highlight: true },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Origination Fee", value: fmt(originationFee) },
    { label: "Other Upfront Fees", value: fmt(inp.otherFees) },
    { label: "Total Upfront Costs", value: fmt(totalUpfront) },
    { label: "Total Bridge Cost", value: fmt(totalCost), isTotal: true, highlight: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Bridge Term", value: inp.termMonths + " months" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Origination Fee", value: fmt(originationFee) },
    { label: "Other Upfront Fees", value: fmt(inp.otherFees) },
    { label: "Total Upfront Costs", value: fmt(totalUpfront) },
    { label: "Total Bridge Cost", value: fmt(totalCost) },
  ];

  const chartData = [
    { name: "Interest", value: Math.round(totalInterest) },
    { name: "Origination Fee", value: Math.round(originationFee) },
    { name: "Other Fees", value: Math.round(inp.otherFees) },
  ].filter((d) => d.value > 0);

  return { monthlyPayment, totalInterest, originationFee, totalUpfront, totalCost, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 150000, interestRate: 8.5, termMonths: 6, originationFeePct: 1.0, otherFees: 250 };

const COLORS = ["#2563eb", "#f59e0b", "#94a3b8"];

export default function BridgeLoanCostCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [originationFeePct, setOriginationFeePct] = useState(String(DEFAULTS.originationFeePct));
  const [otherFees, setOtherFees] = useState(String(DEFAULTS.otherFees));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termMonths: parseInt(termMonths) || 0,
    originationFeePct: parseFloat(originationFeePct) || 0,
    otherFees: parseFloat(otherFees) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermMonths(String(DEFAULTS.termMonths));
    setOriginationFeePct(String(DEFAULTS.originationFeePct));
    setOtherFees(String(DEFAULTS.otherFees));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termMonths) || 0;
  const feePct = parseFloat(originationFeePct) || 0;
  const fees = parseFloat(otherFees) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (!interestRate || rate <= 0) valErrors.interestRate = "Interest rate must be greater than 0%";
  else if (rate > 25) valErrors.interestRate = "Interest rate must be 25% or less";
  if (!termMonths || term <= 0) valErrors.termMonths = "Term must be greater than 0 months";
  else if (term > 24) valErrors.termMonths = "Bridge terms rarely exceed 24 months";
  if (feePct < 0 || feePct > 10) valErrors.originationFeePct = "Origination fee must be 0–10%";
  if (fees < 0) valErrors.otherFees = "Other fees must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bridge Loan Cost Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bridge Loan Cost Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Bridge Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Bridge Term (Months)</label><div className={i}><input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>{valErrors.termMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termMonths}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Origination Fee (%)</label><div className={i}><input type="number" value={originationFeePct} onChange={e => setOriginationFeePct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.originationFeePct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.originationFeePct}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Additional Fees</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Other Upfront Fees ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={otherFees} onChange={e => setOtherFees(e.target.value)} className={c} /></div>{valErrors.otherFees && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.otherFees}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Bridge Loan Cost</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.totalCost.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}/mo interest-only over {term} months plus {result.totalUpfront.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} in upfront costs</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment", result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["Upfront Costs", "$" + Math.round(result.totalUpfront).toLocaleString("en-US"), "text-red-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Where the Cost Goes</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {result.chartData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [name, "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
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
          <h2 className="text-2xl font-bold mb-3">What a Bridge Loan Really Costs</h2>
          <p>Bridge loans are short-term financing that covers the gap between buying your next home and selling your current one. Most charge interest only — you make small monthly payments while you own both properties, then repay the full principal when your old home sells. That makes the monthly carry low, but the real cost is the combination of interest over the bridge term plus origination fees that typically run 1–2% of the loan. Because rates on bridge financing run well above primary mortgage rates, the loan is meant to be held for months, not years. If your current home sells more slowly than planned, the interest keeps compounding against you — which is why most lenders expect a concrete sale timeline before approving one.</p>
        </section>
        <FAQSection faqs={[
          { question: "Are bridge loan payments interest-only?", answer: "Typically yes. Most bridge loans require only monthly interest payments while you own both homes; the full principal is repaid in one lump when your current home sells. A few lenders amortize the loan instead, which raises the monthly payment but pays down principal." },
          { question: "What fees come with a bridge loan?", answer: "Expect an origination fee of roughly 1–2% of the loan amount plus appraisal, title, and closing costs. This calculator's upfront cost line combines those charges so you can see the true cost beyond the monthly interest." },
          { question: "How long should I hold a bridge loan?", answer: "Bridge terms run 6 to 12 months on average, occasionally up to 24. Because the rate is higher than a standard mortgage, the cheapest path is almost always to sell your old home as quickly as possible and pay the bridge off in full." },
        ]} pageUrl="https://racira.com/calculator/bridge-loan-cost-calculator" />
        <PopularCalculators exclude="/calculator/bridge-loan-cost-calculator" />
      </div>
    </div>
  </>);
}
