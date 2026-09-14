"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  apr: number;
  termMonths: number;
  originationPct: number;
  flatFees: number;
}

interface Result {
  monthlyPayment: number;
  totalInterest: number;
  originationFee: number;
  totalFees: number;
  totalRepaid: number;
  totalCost: number;
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

function calc(inp: Inputs): Result {
  const r = inp.apr / 100 / 12;
  const n = inp.termMonths;
  const monthlyPayment = r > 0 ? (inp.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inp.loanAmount / n;
  const totalInterest = monthlyPayment * n - inp.loanAmount;
  const originationFee = (inp.loanAmount * inp.originationPct) / 100;
  const totalFees = originationFee + inp.flatFees;
  const totalRepaid = monthlyPayment * n;
  const totalCost = totalInterest + totalFees;

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "APR", value: inp.apr + "%" },
    { label: "Loan Term", value: n + " months" },
    { label: "Monthly Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Origination Fee (" + inp.originationPct + "%)", value: fmt(originationFee) },
    { label: "Other Fees", value: fmt(inp.flatFees) },
    { label: "Total Fees", value: fmt(totalFees) },
    { label: "Total Repayment", value: fmt(totalRepaid) },
    { label: "Total Cost to Borrow", value: fmt(totalCost), isTotal: true, highlight: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Loan Term", value: n + " months" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Origination Fee", value: fmt(originationFee) },
    { label: "Other Fees", value: fmt(inp.flatFees) },
    { label: "Total Fees", value: fmt(totalFees) },
    { label: "Total Repayment", value: fmt(totalRepaid) },
    { label: "Total Cost to Borrow", value: fmt(totalCost) },
  ];

  const chartData = [
    { name: "Interest", value: Math.round(totalInterest) },
    { name: "Origination Fee", value: Math.round(originationFee) },
    { name: "Other Fees", value: Math.round(inp.flatFees) },
  ].filter((d) => d.value > 0);

  return { monthlyPayment, totalInterest, originationFee, totalFees, totalRepaid, totalCost, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { loanAmount: 1000, apr: 36, termMonths: 12, originationPct: 4, flatFees: 25 };

const COLORS = ["#2563eb", "#f59e0b", "#94a3b8"];

export default function EmergencyLoanCostCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [originationPct, setOriginationPct] = useState(String(DEFAULTS.originationPct));
  const [flatFees, setFlatFees] = useState(String(DEFAULTS.flatFees));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    apr: parseFloat(apr) || 0,
    termMonths: parseInt(termMonths) || 0,
    originationPct: parseFloat(originationPct) || 0,
    flatFees: parseFloat(flatFees) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setApr(String(DEFAULTS.apr));
    setTermMonths(String(DEFAULTS.termMonths));
    setOriginationPct(String(DEFAULTS.originationPct));
    setFlatFees(String(DEFAULTS.flatFees));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(apr) || 0;
  const term = parseInt(termMonths) || 0;
  const origPct = parseFloat(originationPct) || 0;
  const fees = parseFloat(flatFees) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (rate <= 0 || rate > 60) valErrors.apr = "APR must be 0–60%";
  if (!termMonths || term <= 0) valErrors.termMonths = "Term must be greater than 0 months";
  else if (term > 60) valErrors.termMonths = "Term must be 60 months or less";
  if (origPct < 0 || origPct > 20) valErrors.originationPct = "Origination fee must be 0–20%";
  if (fees < 0) valErrors.flatFees = "Fees must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Emergency Loan Cost Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Emergency Loan Cost Calculator</h1>
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
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fees & Charges</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Origination Fee (%)</label><div className={i}><input type="number" value={originationPct} onChange={e => setOriginationPct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.originationPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.originationPct}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Other Fees ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={flatFees} onChange={e => setFlatFees(e.target.value)} className={c} /></div>{valErrors.flatFees && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.flatFees}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Cost to Borrow</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.totalCost.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}/mo for {term} months — {Math.round((result.totalCost / amt) * 100)}% on top of what you borrow</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment", result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["Total Fees", "$" + Math.round(result.totalFees).toLocaleString("en-US"), "text-red-600"],
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
          <h2 className="text-2xl font-bold mb-3">Read the True Cost of Emergency Credit</h2>
          <p>Emergency loans — payday advances, title loans, and fast personal loans — quote an APR, but the number that matters is the total cost to borrow: interest plus origination fees and flat charges, all expressed against the amount you actually receive. At a 36% APR with a 4% origination fee, borrowing $1,000 for a year costs roughly a quarter of the loan on top of the principal. Some lenders charge even more: a typical two-week payday loan can carry an APR above 300%, which this calculator caps out of range for a reason. Before you sign, compare the all-in cost against alternatives — a credit union personal loan, a 0% credit card offer, or an advance from your employer usually costs far less.</p>
        </section>
        <FAQSection faqs={[
          { question: "How is total cost different from APR?", answer: "APR is the annualized rate; total cost is the actual dollars you pay in interest and fees over the loan's life. Two loans with the same APR can cost very different amounts depending on origination fees and term length — always compare the dollar total." },
          { question: "What APR do emergency loans actually charge?", answer: "Credit union and bank personal loans typically run 8–18%, marketplace installment lenders 15–36%, and payday or title lenders the equivalent of 100–400% APR on short terms. Many states cap payday APR at 36% or ban the product entirely." },
          { question: "Should I use a credit card instead?", answer: "If the card has room and a lower APR, often yes — but a 0% balance-transfer or purchase offer only helps if you can clear it before the promo ends. Compare the card's total interest against this calculator's total cost before deciding." },
        ]} pageUrl="https://racira.com/calculator/emergency-loan-cost-calculator" />
        <PopularCalculators exclude="/calculator/emergency-loan-cost-calculator" />
      </div>
    </div>
  </>);
}
