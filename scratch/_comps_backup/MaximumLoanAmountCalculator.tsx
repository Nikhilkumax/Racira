"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  monthlyBudget: number;
  interestRate: number;
  termYears: number;
  downPct: number;
  monthlyTax: number;
  monthlyInsurance: number;
}

interface MonthRow {
  int: number;
  prin: number;
}

interface YearRow {
  year: string;
  principal: number;
  interest: number;
}

interface Result {
  monthlyEscrow: number;
  pmiBudget: number;
  maxLoanAmount: number;
  downPayment: number;
  maxHomePrice: number;
  totalInterest: number;
  totalPayment: number;
  years: YearRow[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyEscrow = inp.monthlyTax + inp.monthlyInsurance;
  const pmiBudget = Math.max(0, inp.monthlyBudget - monthlyEscrow);

  // Max principal from a fixed payment: P = pmt × (1 − (1+r)^−n) / r
  const maxLoanAmount = r > 0 && pmiBudget > 0 ? pmiBudget * ((1 - Math.pow(1 + r, -n)) / r) : pmiBudget > 0 ? pmiBudget * n : 0;
  const maxHomePrice = inp.downPct >= 100 ? 0 : maxLoanAmount / (1 - inp.downPct / 100);
  const downPayment = maxHomePrice * (inp.downPct / 100);
  // The loan is sized so its payment exactly equals the P&I budget.
  const totalPayment = maxLoanAmount > 0 ? pmiBudget * n : 0;
  const totalInterest = Math.max(0, totalPayment - maxLoanAmount);

  // Yearly principal/interest buckets on the max loan.
  const sched: MonthRow[] = [];
  let bal = maxLoanAmount;
  const emi = maxLoanAmount > 0 ? pmiBudget : 0;
  while (bal > 0.5 && sched.length < n) {
    const int = bal * r;
    const prin = Math.min(emi - int, bal);
    sched.push({ int, prin });
    bal -= prin;
  }
  const years: YearRow[] = [];
  const yCount = Math.ceil(sched.length / 12);
  for (let y = 0; y < yCount && y < 40; y++) {
    const slice = sched.slice(y * 12, (y + 1) * 12);
    years.push({
      year: "Yr " + (y + 1),
      principal: Math.round(slice.reduce((a, m) => a + m.prin, 0)),
      interest: Math.round(slice.reduce((a, m) => a + m.int, 0)),
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Total Monthly Budget", value: fmtD(inp.monthlyBudget) },
    { label: "Escrow (Tax + Insurance)", value: fmtD(monthlyEscrow) + "/mo" },
    { label: "P&I Budget", value: fmtD(pmiBudget) + "/mo", highlight: true },
    { label: "Interest Rate", value: inp.interestRate + "%" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Maximum Loan Amount", value: fmt(maxLoanAmount), highlight: true },
    { label: "Down Payment (" + inp.downPct + "%)", value: fmt(downPayment) },
    { label: "Estimated Maximum Home Price", value: fmt(maxHomePrice), highlight: true },
    { label: "Total Interest Over Term", value: fmt(totalInterest) },
    { label: "Total Paid Over Term", value: fmt(totalPayment), isTotal: true },
  ];

  const summaryStats = [
    { label: "Max Loan Amount", value: fmt(maxLoanAmount) },
    { label: "Max Home Price", value: fmt(maxHomePrice) },
    { label: "P&I Budget", value: fmtD(pmiBudget) + "/mo" },
    { label: "Down Payment Needed", value: fmt(downPayment) },
    { label: "Escrow", value: fmtD(monthlyEscrow) + "/mo" },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Paid", value: fmt(totalPayment) },
    { label: "Term (Years)", value: String(inp.termYears) },
  ];

  return { monthlyEscrow, pmiBudget, maxLoanAmount, downPayment, maxHomePrice, totalInterest, totalPayment, years, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { monthlyBudget: 2000, interestRate: 6.5, termYears: 30, downPct: 20, monthlyTax: 300, monthlyInsurance: 150 };

export default function MaximumLoanAmountCalculator() {
  const [monthlyBudget, setMonthlyBudget] = useState(String(DEFAULTS.monthlyBudget));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [monthlyTax, setMonthlyTax] = useState(String(DEFAULTS.monthlyTax));
  const [monthlyInsurance, setMonthlyInsurance] = useState(String(DEFAULTS.monthlyInsurance));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    monthlyBudget: parseFloat(monthlyBudget) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    downPct: parseFloat(downPct) || 0,
    monthlyTax: parseFloat(monthlyTax) || 0,
    monthlyInsurance: parseFloat(monthlyInsurance) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setMonthlyBudget(String(DEFAULTS.monthlyBudget));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setDownPct(String(DEFAULTS.downPct));
    setMonthlyTax(String(DEFAULTS.monthlyTax));
    setMonthlyInsurance(String(DEFAULTS.monthlyInsurance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const budget = parseFloat(monthlyBudget) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const dp = parseFloat(downPct) || 0;
  const tax = parseFloat(monthlyTax) || 0;
  const ins = parseFloat(monthlyInsurance) || 0;

  const valErrors: Record<string, string> = {};
  if (!monthlyBudget || budget <= 0) valErrors.monthlyBudget = "Monthly budget must be greater than $0";
  if (!interestRate || rate <= 0) valErrors.interestRate = "Interest Rate must be greater than 0%";
  else if (rate > 25) valErrors.interestRate = "Interest Rate must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  if (dp < 0 || dp >= 100) valErrors.downPct = "Down payment must be 0%–99%";
  if (tax < 0) valErrors.monthlyTax = "Property tax must be $0 or more";
  if (ins < 0) valErrors.monthlyInsurance = "Insurance must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Maximum Loan Amount Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Maximum Loan Amount Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Monthly Payment Budget ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)} className={c} /></div>{valErrors.monthlyBudget && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyBudget}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Down Payment &amp; Escrow</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPct} onChange={e => setDownPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Property Tax ($/mo)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyTax} onChange={e => setMonthlyTax(e.target.value)} className={c} /></div>{valErrors.monthlyTax && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyTax}</p>}</div>
                  <div className="col-span-2"><label className="text-sm font-medium mb-1 block">Home Insurance ($/mo)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyInsurance} onChange={e => setMonthlyInsurance(e.target.value)} className={c} /></div>{valErrors.monthlyInsurance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyInsurance}</p>}</div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Maximum Loan Amount</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.maxLoanAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.pmiBudget.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}/mo P&I at {interestRate}% for {termYears} years</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Max Home Price (" + dp + "% down)", "$" + Math.round(result.maxHomePrice).toLocaleString("en-US"), "text-primary"],
                ["P&I Budget", "$" + Math.round(result.pmiBudget).toLocaleString("en-US") + "/mo", "text-foreground"],
                ["Down Payment Needed", "$" + Math.round(result.downPayment).toLocaleString("en-US"), "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Yearly Principal vs Interest (Max Loan)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.years} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number) => ["$" + Math.round(v).toLocaleString("en-US"), ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="principal" name="Principal Paid" stackId="a"><Cell fill="#2563eb" /></Bar>
                  <Bar dataKey="interest" name="Interest Paid" stackId="a" radius={[3, 3, 0, 0]}><Cell fill="#f59e0b" /></Bar>
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
          <h2 className="text-2xl font-bold mb-3">How Much Can You Borrow?</h2>
          <p>The largest loan your monthly budget supports is the present value of that payment stream: P = PMT × (1 − (1 + r)⁻ⁿ) ÷ r, where PMT is the principal-and-interest portion of your budget (after property tax and insurance), r is the monthly rate, and n is the number of payments. Divide the loan by (1 − down payment %) to estimate the maximum home price, and remember lenders also cap borrowers with debt-to-income and loan-to-value limits — this calculator shows the payment-side ceiling.</p>
        </section>
        <FAQSection faqs={[
          { question: "How is the maximum loan amount calculated?", answer: "After subtracting estimated property tax and insurance from your monthly budget, the remaining P&I budget is converted into a loan size using the present-value annuity formula P = PMT × (1 − (1 + r)⁻ⁿ) ÷ r." },
          { question: "Does the down payment change the loan I can get?", answer: "No — the loan amount is set by your payment budget. A larger down payment lowers the home price that requires that loan, which is why the calculator shows both the maximum loan and the maximum home price at your chosen down-payment percentage." },
          { question: "What else do lenders consider?", answer: "Payment capacity is one limit. Lenders also apply debt-to-income ratios, loan-to-value caps, and credit requirements, and property taxes vary by area — treat the escrow estimates here as planning figures, not a quote." },
        ]} pageUrl="https://racira.com/calculator/maximum-loan-amount-calculator" />
        <PopularCalculators exclude="/calculator/maximum-loan-amount-calculator" />
      </div>
    </div>
  </>);
}
