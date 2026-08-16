"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface ArmResetInputs {
  balance: number;
  remainingYears: number;
  currentRate: number;
  indexRate: number;
  margin: number;
  periodicCap: number;
}

interface ArmResetResult {
  currentPayment: number;
  newRate: number;
  newPayment: number;
  paymentChange: number;
  annualImpact: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  interestImpact: number;
  balanceCurve: { year: number; current: number; reset: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function pmt(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function totalInterest(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  return pmt(principal, annualRate, years) * years * 12 - principal;
}

function amortizationCurve(principal: number, annualRate: number, years: number): number[] {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0 || n === 0) return [];
  const payment = pmt(principal, annualRate, years);
  const curve: number[] = [];
  let bal = principal;
  for (let m = 1; m <= n; m++) {
    bal = bal * (1 + r) - payment;
    if (m % 12 === 0) curve.push(Math.max(0, bal));
  }
  return curve;
}

function calculateArmReset(inputs: ArmResetInputs): ArmResetResult {
  const { balance, remainingYears, currentRate, indexRate, margin, periodicCap } = inputs;

  // New rate = index + margin, capped at current rate + periodic adjustment cap
  const rawNewRate = indexRate + margin;
  const newRate = Math.min(rawNewRate, currentRate + periodicCap);

  const currentPayment = pmt(balance, currentRate, remainingYears);
  const newPayment = pmt(balance, newRate, remainingYears);
  const paymentChange = newPayment - currentPayment;
  const annualImpact = paymentChange * 12;

  const currentTotalInterest = totalInterest(balance, currentRate, remainingYears);
  const newTotalInterest = totalInterest(balance, newRate, remainingYears);
  const interestImpact = newTotalInterest - currentTotalInterest;

  const curveCurrent = amortizationCurve(balance, currentRate, remainingYears);
  const curveReset = amortizationCurve(balance, newRate, remainingYears);
  const balanceCurve = curveCurrent.map((c, i) => ({
    year: i + 1,
    current: Math.round(c),
    reset: curveReset[i] !== undefined ? Math.round(curveReset[i]) : Math.round(c),
  }));

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Current Rate", value: `${currentRate}%` },
    { label: "New Rate (Index + Margin)", value: `${newRate}%`, highlight: true },
    { label: "Current Monthly Payment", value: `$${fmt(currentPayment)}` },
    { label: "New Monthly Payment", value: `$${fmt(newPayment)}` },
    { label: "Monthly Payment Change", value: `${paymentChange >= 0 ? "+" : "−"}$${fmt(Math.abs(paymentChange))}`, highlight: true },
    { label: "Total Interest at Current Rate", value: `$${fmt0(currentTotalInterest)}` },
    { label: "Total Interest at New Rate", value: `$${fmt0(newTotalInterest)}` },
    { label: "Interest Impact over Remaining Term", value: `${interestImpact >= 0 ? "+" : "−"}$${fmt0(Math.abs(interestImpact))}`, isTotal: true },
  ];

  const summary = [
    { label: "Remaining Balance", value: `$${fmt0(balance)}` },
    { label: "Remaining Term", value: `${remainingYears} years` },
    { label: "Current Rate", value: `${currentRate}%` },
    { label: "Index Rate", value: `${indexRate}%` },
    { label: "Margin", value: `${margin}%` },
    { label: "New Rate After Cap", value: `${newRate}%` },
    { label: "New Monthly Payment", value: `$${fmt(newPayment)}` },
    { label: "Monthly Change", value: `${paymentChange >= 0 ? "+" : "−"}$${fmt(Math.abs(paymentChange))}` },
    { label: "Annual Cost Impact", value: `${annualImpact >= 0 ? "+" : "−"}$${fmt0(Math.abs(annualImpact))}` },
  ];

  return {
    currentPayment, newRate, newPayment, paymentChange, annualImpact,
    currentTotalInterest, newTotalInterest, interestImpact, balanceCurve, breakdown, summary,
  };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: ArmResetInputs = { balance: 300000, remainingYears: 25, currentRate: 6, indexRate: 4.5, margin: 2, periodicCap: 2 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
const fmtMoney = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  label?: string | number;
  payload?: { name?: string | number; value?: number | string; color?: string }[];
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-1">Year {String(label)}</p>
      {payload.map((p, i) => (
        <p key={i} className="mb-0.5" style={{ color: p.color }}>
          {String(p.name)}: ${typeof p.value === "number" ? p.value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : String(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function AdjustableRateMortgageResetCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [remainingYears, setRemainingYears] = useState(String(DEFAULTS.remainingYears));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [indexRate, setIndexRate] = useState(String(DEFAULTS.indexRate));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [margin, setMargin] = useState(String(DEFAULTS.margin));
  const [periodicCap, setPeriodicCap] = useState(String(DEFAULTS.periodicCap));
  const [results, setResults] = useState<ArmResetResult>(() => calculateArmReset(DEFAULTS));

  const getInputs = (): ArmResetInputs => ({
    balance: parseFloat(balance) || 0,
    remainingYears: parseFloat(remainingYears) || 0,
    currentRate: parseFloat(currentRate) || 0,
    indexRate: parseFloat(indexRate) || 0,
    margin: parseFloat(margin) || 0,
    periodicCap: parseFloat(periodicCap) || 0,
  });

  useEffect(() => {
    setResults(calculateArmReset(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(balance) || 0) <= 0) valErrors.balance = "Balance must be greater than 0";
  if ((parseFloat(remainingYears) || 0) <= 0 || (parseFloat(remainingYears) || 0) > 40) valErrors.remainingYears = "Term must be 1–40 years";
  if ((parseFloat(currentRate) || 0) < 0.1 || (parseFloat(currentRate) || 0) > 25) valErrors.currentRate = "Rate must be 0.1%–25%";
  if ((parseFloat(indexRate) || 0) < 0 || (parseFloat(indexRate) || 0) > 25) valErrors.indexRate = "Index must be 0%–25%";
  if ((parseFloat(margin) || 0) < 0 || (parseFloat(margin) || 0) > 10) valErrors.margin = "Margin must be 0%–10%";
  if ((parseFloat(periodicCap) || 0) < 0 || (parseFloat(periodicCap) || 0) > 10) valErrors.periodicCap = "Cap must be 0%–10%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateArmReset(getInputs()));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setRemainingYears(String(DEFAULTS.remainingYears));
    setCurrentRate(String(DEFAULTS.currentRate));
    setIndexRate(String(DEFAULTS.indexRate));
    setMargin(String(DEFAULTS.margin));
    setPeriodicCap(String(DEFAULTS.periodicCap));
    setShowAdvanced(false);
    setResults(calculateArmReset(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const up = results.paymentChange > 0;
  const color = results.paymentChange === 0 ? "text-foreground" : up ? "text-red-600" : "text-emerald-600";

  const faqs = [
    {
      question: "How does an adjustable-rate mortgage reset work?",
      answer: "An ARM keeps a fixed rate for an initial period (often 5, 7, or 10 years), then resets periodically to a new rate based on a published index plus a margin set in your contract. The new rate is also limited by adjustment caps: a periodic cap limits how much the rate can jump at any single reset, and a lifetime cap limits total movement over the loan's life.",
    },
    {
      question: "What is the formula for the new rate?",
      answer: "The new rate equals the index rate plus your margin, but it cannot exceed your current rate plus the periodic adjustment cap. For example, with a 6% current rate, a 4.5% index, a 2% margin, and a 2% cap, the uncapped rate would be 6.5%, which is exactly at the cap — so the rate resets to 6.5%.",
    },
    {
      question: "Should I refinance after my ARM resets?",
      answer: "If your new payment after the reset is higher than a fixed-rate alternative, refinancing may save money — but compare the total interest over the remaining term, not just the monthly payment. This calculator shows both the payment change and the full interest impact at the new rate, which is the number that matters for a refinance decision.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Adjustable Rate Mortgage Reset Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Adjustable Rate Mortgage Reset Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="balance" label="Remaining Balance" value={balance} onChange={setBalance} prefix="$" error={valErrors.balance} />
              <CompactInput id="remaining-years" label="Remaining Term" value={remainingYears} onChange={setRemainingYears} suffix="yrs" min="1" error={valErrors.remainingYears} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="current-rate" label="Current Rate" value={currentRate} onChange={setCurrentRate} suffix="%" min="0.1" error={valErrors.currentRate} />
              <CompactInput id="index-rate" label="New Index Rate (e.g. SOFR)" value={indexRate} onChange={setIndexRate} suffix="%" min="0" error={valErrors.indexRate} />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Rate Settings</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="margin" label="Margin" value={margin} onChange={setMargin} suffix="%" min="0" error={valErrors.margin} />
                      <CompactInput id="periodic-cap" label="Periodic Rate Cap" value={periodicCap} onChange={setPeriodicCap} suffix="%" min="0" error={valErrors.periodicCap} />
                    </div>
                  </div>
                </div>
              )}
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">New Monthly Payment</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${fmtMoney(results.newPayment)}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                New rate {results.newRate.toFixed(2)}% vs current {(parseFloat(currentRate) || 0).toFixed(2)}% — a {up ? "increase" : "decrease"} of ${fmtMoney(Math.abs(results.paymentChange))}/mo.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payment Change</span>
                <span className={`font-extrabold ${color}`}>{results.paymentChange >= 0 ? "+" : "−"}${fmtMoney(Math.abs(results.paymentChange))}/mo</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New Rate</span>
                <span className="font-extrabold text-foreground">{results.newRate.toFixed(2)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Impact</span>
                <span className={`font-extrabold ${up ? "text-red-600" : "text-emerald-600"}`}>{results.annualImpact >= 0 ? "+" : "−"}${results.annualImpact.toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[180px]">Amount</th>
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
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-base font-bold mb-2">Balance Over Remaining Term</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={results.balanceCurve} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} width={52} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="current" name="Current Rate" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="reset" name="After Reset" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">What Is an Adjustable Rate Mortgage Reset Calculator?</h2>
            <p>An adjustable-rate mortgage holds a fixed rate for a set number of years, then periodically adjusts to market conditions. When that reset happens, your monthly payment can change dramatically — sometimes by hundreds of dollars. This calculator estimates your new rate and payment at the next reset using your contract's index, margin, and adjustment cap, so you can budget for the change before it hits.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enter your remaining balance, the years left on the loan, your current rate, and the index rate the lender will use at reset (such as SOFR). The calculator applies your margin and periodic adjustment cap to determine the new rate, then recalculates the payment with the standard amortization formula. The balance chart compares how quickly the loan is paid down under your current rate versus the reset rate over the remaining term.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary number is your new monthly payment after the reset. The three-stat bar shows the payment change, the new rate, and the annual dollar impact. The breakdown table details total interest at both rates over the remaining term, and the summary block mirrors those figures so every headline number can be traced back to a row. Use the advanced options to enter your exact margin and periodic cap from your loan documents for the most accurate estimate.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/adjustable-rate-mortgage-reset-calculator" />
          <PopularCalculators exclude="/calculator/adjustable-rate-mortgage-reset-calculator" />
        </div>
      </div>
    </>
  );
}
