"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface ColaInputs {
  currentAmount: number;
  colaRate: number;
  years: number;
}

interface ColaResult {
  adjustedAmount: number;
  totalIncrease: number;
  cumulativeGrowthPct: number;
  yearlyData: { year: number; amount: number; increase: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateCola(inputs: ColaInputs): ColaResult {
  const { currentAmount, colaRate, years } = inputs;
  const yearlyData = [];
  let amount = currentAmount;
  for (let y = 1; y <= Math.min(years, 30); y++) {
    const prev = amount;
    amount = prev * (1 + colaRate / 100);
    yearlyData.push({ year: y, amount, increase: amount - prev });
  }
  const adjustedAmount = amount;
  const totalIncrease = adjustedAmount - currentAmount;
  const cumulativeGrowthPct = currentAmount > 0 ? (totalIncrease / currentAmount) * 100 : 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Current Annual Amount", value: `$${fmt(currentAmount)}` },
    { label: "COLA Rate", value: `${colaRate.toFixed(2)}%`, highlight: true },
    { label: "Period", value: `${years} year${years === 1 ? "" : "s"}` },
    { label: "Year-1 Adjusted Amount", value: `$${fmt(yearlyData.length > 0 ? yearlyData[0].amount : adjustedAmount)}` },
    { label: "Final Adjusted Amount", value: `$${fmt(adjustedAmount)}`, highlight: true },
    { label: "Total Increase", value: `$${fmt(totalIncrease)}`, highlight: true },
    { label: "Cumulative Growth", value: `${cumulativeGrowthPct.toFixed(1)}%`, isTotal: true },
  ];

  const summary = [
    { label: "Current Amount", value: `$${fmt(currentAmount)}` },
    { label: "COLA Rate", value: `${colaRate.toFixed(2)}%` },
    { label: "Period", value: `${years} years` },
    { label: "Adjusted Amount", value: `$${fmt(adjustedAmount)}` },
    { label: "Total Increase", value: `$${fmt(totalIncrease)}` },
    { label: "Cumulative Growth", value: `${cumulativeGrowthPct.toFixed(1)}%` },
  ];

  return { adjustedAmount, totalIncrease, cumulativeGrowthPct, yearlyData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: ColaInputs = { currentAmount: 60000, colaRate: 3.2, years: 5 };

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
  label?: string | number;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">Year {String(label)}</p>
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `$${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function CostOfLivingAdjustmentColaCalculator() {
  const [currentAmount, setCurrentAmount] = useState(String(DEFAULTS.currentAmount));
  const [colaRate, setColaRate] = useState(String(DEFAULTS.colaRate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [results, setResults] = useState<ColaResult>(() => calculateCola(DEFAULTS));

  const getInputs = (): ColaInputs => ({
    currentAmount: parseFloat(currentAmount) || 0,
    colaRate: parseFloat(colaRate) || 0,
    years: parseFloat(years) || 0,
  });

  useEffect(() => {
    setResults(calculateCola(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(currentAmount) || 0) <= 0) valErrors.currentAmount = "Amount must be greater than 0";
  if ((parseFloat(colaRate) || 0) < 0 || (parseFloat(colaRate) || 0) > 20) valErrors.colaRate = "Rate must be 0–20%";
  const yearsNum = parseFloat(years) || 0;
  if (yearsNum < 1 || yearsNum > 30) valErrors.years = "Period must be 1–30 years";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateCola(getInputs()));
  };

  const reset = () => {
    setCurrentAmount(String(DEFAULTS.currentAmount));
    setColaRate(String(DEFAULTS.colaRate));
    setYears(String(DEFAULTS.years));
    setResults(calculateCola(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const faqs = [
    {
      question: "What is a cost-of-living adjustment (COLA)?",
      answer: "A COLA is an annual percentage increase applied to an income or benefit to offset inflation, so its purchasing power stays roughly constant. Social Security benefits receive COLAs based on the Consumer Price Index for Urban Wage Earners (CPI-W) — 3.2% for 2024 and 2.5% for 2025. Many pensions, union contracts, and employment agreements tie raises to the same principle.",
    },
    {
      question: "How does compounding change the impact of a COLA?",
      answer: "Each year's adjustment applies to the previous year's already-adjusted amount, so the effect compounds. A 3% COLA on a $60,000 income adds $1,800 in year one but the base grows every year — after 5 years the income reaches about $69,553, a cumulative 15.9% increase rather than a flat 15%. This calculator shows the year-by-year curve.",
    },
    {
      question: "Is a COLA the same as a merit raise?",
      answer: "No. A COLA preserves purchasing power against inflation, while a merit raise increases real income above inflation. If your employer gives only a 2% COLA while inflation runs 3%, your real income actually falls by about 1%. Compare your raise to the current CPI inflation rate to see whether you are keeping pace.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator/business" }, { label: "Cost-of-Living Adjustment (COLA) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost-of-Living Adjustment (COLA) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="current-amount" label="Current Annual Amount" value={currentAmount} onChange={setCurrentAmount} prefix="$" error={valErrors.currentAmount} />
              <CompactInput id="cola-rate" label="COLA Rate" value={colaRate} onChange={setColaRate} suffix="%" error={valErrors.colaRate} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="years" label="Period" value={years} onChange={setYears} suffix="years" min="1" error={valErrors.years} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Adjusted Annual Amount</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${results.adjustedAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                After {parseFloat(years) || DEFAULTS.years} year{(parseFloat(years) || DEFAULTS.years) === 1 ? "" : "s"} of {colaRate || DEFAULTS.colaRate}% COLA — up ${results.totalIncrease.toLocaleString("en-US", { maximumFractionDigits: 0 })}.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Amount</span>
                <span className="font-extrabold text-foreground">${(parseFloat(currentAmount) || DEFAULTS.currentAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Increase</span>
                <span className="font-extrabold text-emerald-600">${results.totalIncrease.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cumulative Growth</span>
                <span className="font-extrabold text-foreground">{results.cumulativeGrowthPct.toFixed(1)}%</span>
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
              <h3 className="text-base font-bold mb-2 w-full text-left">Amount by Year</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={results.yearlyData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} label={{ value: "Year", position: "insideBottomRight", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickFormatter={(v: number) => `$${v.toLocaleString()}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colaGradient)" name="Amount" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }} />
                  Adjusted amount grows {colaRate || DEFAULTS.colaRate}% per year
                </div>
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
            <h2 className="text-2xl font-bold mb-3">What Is a COLA Calculator?</h2>
            <p>A cost-of-living adjustment calculator projects how an income or benefit grows when it is raised annually by a fixed percentage. It applies the COLA rate on top of the previous year's amount, so the increase compounds — the year-five dollar gain is larger than the year-one gain even at a constant rate.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Each year, the new amount equals the prior amount multiplied by (1 + rate). After N years, the final amount equals the starting amount times (1 + rate)ⁿ. The area chart traces the growth curve year by year, and the breakdown table reports the starting amount, final amount, and the cumulative dollar and percentage increase.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The headline number is your adjusted annual amount at the end of the period. Compare it against your current amount and the cumulative growth percentage to see how much of your raise is simply inflation protection versus real growth. If your actual raise is below the COLA rate you assumed, your purchasing power is shrinking year over year.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cost-of-living-adjustment-cola-calculator" />
          <PopularCalculators exclude="/calculator/cost-of-living-adjustment-cola-calculator" />
        </div>
      </div>
    </>
  );
}
