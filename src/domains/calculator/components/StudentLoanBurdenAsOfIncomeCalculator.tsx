"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Inputs {
  loanBalance: number;
  interestRate: number;
  termYears: number;
  annualIncome: number;
  otherDebts: number;
}

interface Result {
  monthlyPayment: number;
  monthlyIncome: number;
  burdenPct: number;
  verdict: string;
  verdictColor: string;
  incomeFor10: number;
  totalDti: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (inp.loanBalance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inp.loanBalance / n;
  const monthlyIncome = inp.annualIncome / 12;
  const burdenPct = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;
  const incomeFor10 = monthlyPayment > 0 ? monthlyPayment * 12 * 10 : 0;
  const totalDti = monthlyIncome > 0 ? ((monthlyPayment + inp.otherDebts) / monthlyIncome) * 100 : 0;

  let verdict = "Heavy";
  let verdictColor = "text-red-600";
  if (burdenPct < 10) { verdict = "Manageable"; verdictColor = "text-emerald-600"; }
  else if (burdenPct < 15) { verdict = "Tight"; verdictColor = "text-amber-600"; }

  const chartData = [
    { name: "Student Loan", value: Math.round(monthlyPayment) },
    { name: "Other Debts", value: Math.round(inp.otherDebts) },
    { name: "Remaining Income", value: Math.max(0, Math.round(monthlyIncome - monthlyPayment - inp.otherDebts)) },
  ].filter((d) => d.value > 0);

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Total Loan Balance", value: fmt(inp.loanBalance) },
    { label: "Average Interest Rate", value: inp.interestRate + "%" },
    { label: "Repayment Term", value: inp.termYears + " years" },
    { label: "Annual Income", value: fmt(inp.annualIncome) },
    { label: "Monthly Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Burden (% of Monthly Income)", value: burdenPct.toFixed(1) + "%", highlight: true },
    { label: "Verdict", value: verdict },
    { label: "Income Needed for 10% Burden", value: fmt(incomeFor10) },
    { label: "Other Monthly Debts", value: fmtD(inp.otherDebts) },
    { label: "Total Debt-to-Income", value: totalDti.toFixed(1) + "%", isTotal: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Burden of Income", value: burdenPct.toFixed(1) + "%" },
    { label: "Verdict", value: verdict },
    { label: "Income for 10% Burden", value: fmt(incomeFor10) },
    { label: "Other Debts", value: fmtD(inp.otherDebts) },
    { label: "Total Debt-to-Income", value: totalDti.toFixed(1) + "%" },
  ];

  return { monthlyPayment, monthlyIncome, burdenPct, verdict, verdictColor, incomeFor10, totalDti, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanBalance: 35000, interestRate: 6.5, termYears: 10, annualIncome: 60000, otherDebts: 300 };

const COLORS = ["#2563eb", "#f59e0b", "#22c55e"];

export default function StudentLoanBurdenAsOfIncomeCalculator() {
  const [loanBalance, setLoanBalance] = useState(String(DEFAULTS.loanBalance));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [annualIncome, setAnnualIncome] = useState(String(DEFAULTS.annualIncome));
  const [otherDebts, setOtherDebts] = useState(String(DEFAULTS.otherDebts));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanBalance: parseFloat(loanBalance) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 0,
    annualIncome: parseFloat(annualIncome) || 0,
    otherDebts: parseFloat(otherDebts) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanBalance(String(DEFAULTS.loanBalance));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setAnnualIncome(String(DEFAULTS.annualIncome));
    setOtherDebts(String(DEFAULTS.otherDebts));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const balance = parseFloat(loanBalance) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const income = parseFloat(annualIncome) || 0;
  const other = parseFloat(otherDebts) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanBalance || balance <= 0) valErrors.loanBalance = "Loan balance must be greater than $0";
  if (rate <= 0 || rate > 20) valErrors.interestRate = "Interest rate must be 0–20%";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 30) valErrors.termYears = "Term must be 30 years or less";
  if (!annualIncome || income <= 0) valErrors.annualIncome = "Income must be greater than $0";
  if (other < 0) valErrors.otherDebts = "Other debts must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Student Loan Burden as % of Income Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Loan Burden as % of Income Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Total Loan Balance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanBalance} onChange={e => setLoanBalance(e.target.value)} className={c} /></div>{valErrors.loanBalance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanBalance}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Average Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Repayment Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Annual Income ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} className={c} /></div>{valErrors.annualIncome && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualIncome}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Budget</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Other Monthly Debts ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={otherDebts} onChange={e => setOtherDebts(e.target.value)} className={c} /></div>{valErrors.otherDebts && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.otherDebts}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Student Loan Burden</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.burdenPct.toFixed(1)}<span className="text-2xl">% of monthly income</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo on {result.monthlyIncome.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} monthly income — <span className={`font-bold ${result.verdictColor}`}>{result.verdict}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment", result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), "text-primary"],
                ["Income for 10% Burden", "$" + Math.round(result.incomeFor10 / 1000) + "K", "text-emerald-600"],
                ["Total Debt-to-Income", result.totalDti.toFixed(1) + "%", "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Where Your Monthly Income Goes</h3>
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
          <h2 className="text-2xl font-bold mb-3">The Rule of Thumb Lenders Actually Use</h2>
          <p>Financial planners and mortgage underwriters both measure student debt the same way: the monthly payment as a share of monthly income. Under roughly 10%, debt is generally manageable — you can save and handle surprises. Between 10% and 15%, the payment is a real constraint, and above 15% it starts to crowd out housing, retirement, and emergencies. The verdict matters twice: once for your own budget, and again when you apply for a mortgage, where lenders add your student payment to your other debts and typically cap the total debt-to-income ratio near 43%. If your burden lands in the heavy zone, the levers are income-driven repayment to cut the payment, refinancing to cut the rate, or a longer term — each with its own trade-offs this calculator can show you.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a healthy student loan burden?", answer: "Most guidance puts under 10% of gross monthly income as manageable, 10–15% as tight, and above 15% as heavy. Mortgage lenders separately include your student payment in your total debt-to-income ratio, usually capped around 43%." },
          { question: "How does income-driven repayment affect the burden?", answer: "IDR caps payments at a slice of discretionary income — often 10–20% — which can cut a heavy burden dramatically. The trade-off is a longer term and more total interest, and the payment can rise as your income grows." },
          { question: "What counts as income for this calculation?", answer: "Gross income before taxes — your salary or self-employment income before deductions. Using take-home pay would overstate the burden, since lenders and standard guidance measure against gross income." },
        ]} pageUrl="https://racira.com/calculator/student-loan-burden-as-of-income-calculator" />
        <PopularCalculators exclude="/calculator/student-loan-burden-as-of-income-calculator" />
      </div>
    </div>
  </>);
}