"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface ConformingJumboInputs {
  loanAmount: number;
  conformingLimit: number;
  conformingRate: number;
  jumboRate: number;
  termYears: number;
}

interface LoanCompareResult {
  conformingPayment: number;
  jumboPayment: number;
  conformingTotalInterest: number;
  jumboTotalInterest: number;
  monthlySavings: number;
  annualSavings: number;
  totalInterestSavings: number;
  loanClass: "Conforming" | "Jumbo" | "Below Conforming Limit";
  chartData: { name: string; payment: number; interest: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function pmt(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / (years * 12);
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calculateLoanCompare(inputs: ConformingJumboInputs): LoanCompareResult {
  const { loanAmount, conformingLimit, conformingRate, jumboRate, termYears } = inputs;
  const conformingPayment = pmt(loanAmount, conformingRate, termYears);
  const jumboPayment = pmt(loanAmount, jumboRate, termYears);
  const conformingTotalInterest = conformingPayment * termYears * 12 - loanAmount;
  const jumboTotalInterest = jumboPayment * termYears * 12 - loanAmount;
  const monthlySavings = Math.max(0, jumboPayment - conformingPayment);
  const annualSavings = monthlySavings * 12;
  const totalInterestSavings = Math.max(0, jumboTotalInterest - conformingTotalInterest);

  const loanClass: LoanCompareResult["loanClass"] =
    loanAmount > conformingLimit ? "Jumbo" : loanAmount === conformingLimit ? "Conforming" : "Below Conforming Limit";

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const chartData = [
    { name: "Conforming Loan", payment: conformingPayment, interest: conformingTotalInterest },
    { name: "Jumbo Loan", payment: jumboPayment, interest: jumboTotalInterest },
  ];

  const breakdown = [
    { label: "Loan Amount", value: `$${fmt(loanAmount)}` },
    { label: "Conforming Limit", value: `$${fmt(conformingLimit)}`, highlight: true },
    { label: "Loan Class", value: loanClass, highlight: true },
    { label: "Conforming Rate", value: `${conformingRate.toFixed(2)}%` },
    { label: "Jumbo Rate", value: `${jumboRate.toFixed(2)}%` },
    { label: "Conforming Payment", value: `$${conformingPayment.toFixed(2)}/mo`, highlight: true },
    { label: "Jumbo Payment", value: `$${jumboPayment.toFixed(2)}/mo` },
    { label: "Monthly Savings", value: `$${monthlySavings.toFixed(2)}` },
    { label: "Interest Savings (30yr)", value: `$${fmt(totalInterestSavings)}`, isTotal: true },
  ];

  const summary = [
    { label: "Conforming Payment", value: `$${conformingPayment.toFixed(2)}` },
    { label: "Jumbo Payment", value: `$${jumboPayment.toFixed(2)}` },
    { label: "Monthly Savings", value: `$${monthlySavings.toFixed(2)}` },
    { label: "Annual Savings", value: `$${fmt(annualSavings)}` },
    { label: "Conforming Interest", value: `$${fmt(conformingTotalInterest)}` },
    { label: "Jumbo Interest", value: `$${fmt(jumboTotalInterest)}` },
  ];

  return { conformingPayment, jumboPayment, conformingTotalInterest, jumboTotalInterest, monthlySavings, annualSavings, totalInterestSavings, loanClass, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: ConformingJumboInputs = { loanAmount: 400000, conformingLimit: 766550, conformingRate: 6.5, jumboRate: 7.0, termYears: 30 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string | number; value?: number | string }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">{String(p.name)}</p>
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `$${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function ConformingVsJumboLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [limit, setLimit] = useState(String(DEFAULTS.conformingLimit));
  const [conformingRate, setConformingRate] = useState(String(DEFAULTS.conformingRate));
  const [jumboRate, setJumboRate] = useState(String(DEFAULTS.jumboRate));
  const [term, setTerm] = useState(String(DEFAULTS.termYears));
  const [results, setResults] = useState<LoanCompareResult>(() => calculateLoanCompare(DEFAULTS));

  const getInputs = (): ConformingJumboInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    conformingLimit: parseFloat(limit) || 0,
    conformingRate: parseFloat(conformingRate) || 0,
    jumboRate: parseFloat(jumboRate) || 0,
    termYears: parseFloat(term) || 0,
  });

  useEffect(() => {
    setResults(calculateLoanCompare(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(loanAmount) || 0) <= 0) valErrors.loanAmount = "Loan amount must be greater than 0";
  if ((parseFloat(limit) || 0) <= 0) valErrors.limit = "Limit must be greater than 0";
  if ((parseFloat(conformingRate) || 0) < 0 || (parseFloat(conformingRate) || 0) > 20) valErrors.conformingRate = "Rate must be 0–20%";
  if ((parseFloat(jumboRate) || 0) < 0 || (parseFloat(jumboRate) || 0) > 20) valErrors.jumboRate = "Rate must be 0–20%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateLoanCompare(getInputs()));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setLimit(String(DEFAULTS.conformingLimit));
    setConformingRate(String(DEFAULTS.conformingRate));
    setJumboRate(String(DEFAULTS.jumboRate));
    setTerm(String(DEFAULTS.termYears));
    setResults(calculateLoanCompare(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const faqs = [
    {
      question: "What is the difference between conforming and jumbo loans?",
      answer: "A conforming loan is at or below the FHFA conforming limit — $766,550 for most of the U.S. in 2024 — and can be sold to Fannie Mae or Freddie Mac. A jumbo loan exceeds that limit, so it can't be government-sponsored, which makes lenders charge a higher interest rate and often require a larger down payment. On a $400,000 loan, the rate gap alone can cost several hundred dollars per month.",
    },
    {
      question: "Why does the jumbo rate cost more even on the same loan amount?",
      answer: "Because the loan can't be securitized through Fannie or Freddie, the lender holds more risk and capital on its books. That risk premium typically adds 0.25–0.75 percentage points to the rate. This calculator applies both rates to the same loan amount so you can see exactly what the jumbo premium costs — in monthly payment, annual cash flow, and total interest over 30 years.",
    },
    {
      question: "Can I split a jumbo loan into conforming pieces?",
      answer: "Sometimes. A common strategy is a first mortgage at the conforming limit plus a smaller second lien or home equity loan for the remainder — a 'piggyback' structure. It can dodge the jumbo rate entirely, though the second mortgage usually carries a higher rate and a shorter term, so compare total blended cost before committing.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Conforming vs Jumbo Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Conforming vs Jumbo Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" error={valErrors.loanAmount} />
              <CompactInput id="limit" label="Conforming Limit" value={limit} onChange={setLimit} prefix="$" error={valErrors.limit} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="conf-rate" label="Conforming Rate" value={conformingRate} onChange={setConformingRate} suffix="%" error={valErrors.conformingRate} />
              <CompactInput id="jumbo-rate" label="Jumbo Rate" value={jumboRate} onChange={setJumboRate} suffix="%" error={valErrors.jumboRate} />
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Term</div>
              <div className="grid grid-cols-1 gap-2">
                <CompactInput id="term" label="Loan Term" value={term} onChange={setTerm} suffix="years" />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calc}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"}`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {hasErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Conforming Monthly Payment</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${results.conformingPayment.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.loanClass} loan — jumbo payment ${results.jumboPayment.toFixed(2)}/mo, saving ${results.monthlySavings.toFixed(2)}/mo.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Jumbo Payment</span>
                <span className="font-extrabold text-foreground">${results.jumboPayment.toFixed(2)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Savings</span>
                <span className="font-extrabold text-emerald-600">${results.monthlySavings.toFixed(2)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Savings</span>
                <span className="font-extrabold text-emerald-600">${results.totalInterestSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[220px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : row.highlight ? "bg-amber-500/10" : "hover:bg-secondary/20"}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-2 w-full text-left">Monthly Payment Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} barSize={56}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `$${v.toLocaleString()}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="payment" radius={[6, 6, 0, 0]}>
                    {results.chartData.map((d, i) => (
                      <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: i === 0 ? "hsl(var(--primary))" : "#f59e0b" }} />
                    {d.name} — ${d.payment.toFixed(0)}/mo
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-3 text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {results.summary.map((row, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Conforming vs Jumbo Loan Calculator?</h2>
            <p>This tool prices the same loan amount at both a conforming rate and a jumbo rate, so you can see exactly what crossing the conforming limit costs. The conforming limit — $766,550 in most of the U.S. in 2024 — marks the ceiling for loans that Fannie Mae and Freddie Mac will purchase, and rates below that line are typically lower.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Both scenarios use the standard mortgage payment formula: P × r(1+r)ⁿ ÷ ((1+r)ⁿ − 1), where r is the monthly rate and n the number of monthly payments. The calculator applies your conforming and jumbo rates to the same principal and term, then derives monthly, annual, and 30-year interest savings from the gap.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The headline number is the conforming monthly payment; the stat bar and chart show the jumbo alternative and the savings. If your loan amount exceeds the limit, the result labels the loan as jumbo — meaning the conforming scenario is the one you could only reach by restructuring or finding a lender with a different limit. The breakdown table and summary always reconcile to the same total-interest figure.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/conforming-vs-jumbo-loan-calculator" />
          <PopularCalculators exclude="/calculator/conforming-vs-jumbo-loan-calculator" />
        </div>
      </div>
    </>
  );
}
