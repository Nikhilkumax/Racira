"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface ScoreRateInputs {
  loanAmount: number;
  termYears: number;
  currentScore: number;
  improvedScore: number;
}

interface ScoreRateResult {
  currentRate: number;
  improvedRate: number;
  currentPayment: number;
  improvedPayment: number;
  monthlySavings: number;
  totalInterestSavings: number;
  chartData: { name: string; rate: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// FICO-style mortgage rate tiers (typical market spread, adjust as needed)
function rateForScore(score: number): number {
  if (score >= 760) return 6.0;
  if (score >= 740) return 6.15;
  if (score >= 720) return 6.4;
  if (score >= 700) return 6.7;
  if (score >= 680) return 7.1;
  if (score >= 660) return 7.6;
  if (score >= 640) return 8.2;
  return 9.2;
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function pmt(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / (years * 12);
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calculateScoreRate(inputs: ScoreRateInputs): ScoreRateResult {
  const { loanAmount, termYears, currentScore, improvedScore } = inputs;
  const currentRate = rateForScore(currentScore);
  const improvedRate = rateForScore(improvedScore);
  const currentPayment = pmt(loanAmount, currentRate, termYears);
  const improvedPayment = pmt(loanAmount, improvedRate, termYears);
  const monthlySavings = Math.max(0, currentPayment - improvedPayment);
  const totalInterestSavings = Math.max(0, (currentPayment - improvedPayment) * termYears * 12);

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const chartData = [
    { name: "Current Score", rate: currentRate },
    { name: "Improved Score", rate: improvedRate },
  ];

  const breakdown = [
    { label: "Loan Amount", value: `$${fmt(loanAmount)}` },
    { label: "Loan Term", value: `${termYears} years` },
    { label: "Current Score", value: `${currentScore}`, highlight: true },
    { label: "Current Rate", value: `${currentRate.toFixed(2)}%`, highlight: true },
    { label: "Improved Score", value: `${improvedScore}`, highlight: true },
    { label: "Improved Rate", value: `${improvedRate.toFixed(2)}%`, highlight: true },
    { label: "Current Payment", value: `$${currentPayment.toFixed(2)}/mo` },
    { label: "Improved Payment", value: `$${improvedPayment.toFixed(2)}/mo` },
    { label: "Total Interest Savings", value: `$${fmt(totalInterestSavings)}`, isTotal: true },
  ];

  const summary = [
    { label: "Current Rate", value: `${currentRate.toFixed(2)}%` },
    { label: "Improved Rate", value: `${improvedRate.toFixed(2)}%` },
    { label: "Rate Gap", value: `${(currentRate - improvedRate).toFixed(2)}%` },
    { label: "Monthly Savings", value: `$${monthlySavings.toFixed(2)}` },
    { label: "Current Payment", value: `$${currentPayment.toFixed(2)}` },
    { label: "Improved Payment", value: `$${improvedPayment.toFixed(2)}` },
  ];

  return { currentRate, improvedRate, currentPayment, improvedPayment, monthlySavings, totalInterestSavings, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: ScoreRateInputs = { loanAmount: 300000, termYears: 30, currentScore: 700, improvedScore: 760 };

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
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `${p.value.toFixed(2)}%` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function CreditScoreToInterestRateImpactCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [term, setTerm] = useState(String(DEFAULTS.termYears));
  const [currentScore, setCurrentScore] = useState(String(DEFAULTS.currentScore));
  const [improvedScore, setImprovedScore] = useState(String(DEFAULTS.improvedScore));
  const [results, setResults] = useState<ScoreRateResult>(() => calculateScoreRate(DEFAULTS));

  const getInputs = (): ScoreRateInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    termYears: parseFloat(term) || 0,
    currentScore: parseFloat(currentScore) || 0,
    improvedScore: parseFloat(improvedScore) || 0,
  });

  useEffect(() => {
    setResults(calculateScoreRate(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(loanAmount) || 0) <= 0) valErrors.loanAmount = "Loan amount must be greater than 0";
  const termNum = parseFloat(term) || 0;
  if (termNum < 1 || termNum > 40) valErrors.term = "Term must be 1–40 years";
  const curScore = parseFloat(currentScore) || 0;
  const impScore = parseFloat(improvedScore) || 0;
  if (curScore < 300 || curScore > 850) valErrors.currentScore = "Score must be 300–850";
  if (impScore < 300 || impScore > 850) valErrors.improvedScore = "Score must be 300–850";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateScoreRate(getInputs()));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setTerm(String(DEFAULTS.termYears));
    setCurrentScore(String(DEFAULTS.currentScore));
    setImprovedScore(String(DEFAULTS.improvedScore));
    setResults(calculateScoreRate(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const faqs = [
    {
      question: "How much can a better credit score lower my mortgage rate?",
      answer: "Lenders price risk in tiers. Using a typical mortgage rate table, a 700 score might qualify for 6.7% while a 760 score gets 6.0% — a 0.7-point spread. On a $300,000, 30-year loan that gap cuts the monthly payment by roughly $135 and saves over $48,000 in interest over the life of the loan.",
    },
    {
      question: "What credit score do I need for the best mortgage rate?",
      answer: "The top tier usually starts at 760 — scores above that often receive the same best rate. The biggest pricing jumps happen between tiers, so crossing a boundary (for example from 699 to 700, or 719 to 720) can be worth tens of thousands of dollars over 30 years. Check where you fall on the table and target the next boundary.",
    },
    {
      question: "Are these rate tiers guaranteed?",
      answer: "No — rates move with the market daily and vary by lender, loan type, down payment, and whether you pay points. The tier table here uses a realistic spread based on typical FICO-based pricing, and its purpose is to show the relative value of a score improvement. For a real quote, get several lenders' pricing on the same day.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Credit Score to Interest Rate Impact Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Score to Interest Rate Impact Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" error={valErrors.loanAmount} />
              <CompactInput id="term" label="Loan Term" value={term} onChange={setTerm} suffix="years" error={valErrors.term} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="current-score" label="Current Score" value={currentScore} onChange={setCurrentScore} min="300" error={valErrors.currentScore} />
              <CompactInput id="improved-score" label="Improved Score" value={improvedScore} onChange={setImprovedScore} min="300" error={valErrors.improvedScore} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Interest Savings</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${results.totalInterestSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                Rate ${(results.currentRate - results.improvedRate).toFixed(2)}% lower — saves ${results.monthlySavings.toFixed(2)}/mo.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Rate</span>
                <span className="font-extrabold text-foreground">{results.currentRate.toFixed(2)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Improved Rate</span>
                <span className="font-extrabold text-emerald-600">{results.improvedRate.toFixed(2)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Savings</span>
                <span className="font-extrabold text-emerald-600">${results.monthlySavings.toFixed(2)}</span>
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
              <h3 className="text-base font-bold mb-2 w-full text-left">Rate at Each Score</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} barSize={64}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `${v.toFixed(1)}%`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {results.chartData.map((d, i) => (
                      <Cell key={i} fill={i === 0 ? "#f59e0b" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: i === 0 ? "#f59e0b" : "hsl(var(--primary))" }} />
                    {d.name} — {d.rate.toFixed(2)}%
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
            <h2 className="text-2xl font-bold mb-3">What Is a Credit Score to Interest Rate Impact Calculator?</h2>
            <p>This tool converts a credit score improvement into dollars. Lenders assign interest rates in tiers based on FICO-style score bands, and this calculator maps your current and target scores to their tier rates, then prices the difference on your loan with the standard mortgage payment formula.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Each score maps to a tier rate using a typical mortgage pricing table (760+ at 6.0%, stepping up to 9.2% below 640). Both rates are applied to the same principal and term via P × r(1+r)ⁿ ÷ ((1+r)ⁿ − 1). The gap between the two monthly payments, multiplied across the full term, is your total interest savings.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The headline figure is lifetime interest savings. Because rates move in tiers rather than continuously, the payoff is concentrated at tier boundaries — a 20-point gain that crosses a boundary can be worth far more than a 20-point gain within a tier. Use the table to find the nearest boundary above your current score and aim there.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-score-to-interest-rate-impact-calculator" />
          <PopularCalculators exclude="/calculator/credit-score-to-interest-rate-impact-calculator" />
        </div>
      </div>
    </>
  );
}
