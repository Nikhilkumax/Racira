"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface ErrorBudgetInputs {
  slo: number; // e.g. 99.9
  elapsedDays: number;
  daysInMonth: number;
  downtimeMinutes: number;
}

interface ErrorBudgetResult {
  monthlyBudgetMinutes: number;
  budgetUsedPct: number;
  budgetRemainingMinutes: number;
  burnRate: number;
  projectedExhaustionDay: number;
  status: "Healthy" | "At Risk" | "Exhausted";
  chartData: { name: string; minutes: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateErrorBudget(inputs: ErrorBudgetInputs): ErrorBudgetResult {
  const { slo, elapsedDays, daysInMonth, downtimeMinutes } = inputs;

  const totalMinutes = daysInMonth * 24 * 60;
  const monthlyBudgetMinutes = (totalMinutes * (100 - slo)) / 100;
  const elapsedMinutes = Math.min(elapsedDays, daysInMonth) * 24 * 60;
  const allowedSoFar = (monthlyBudgetMinutes / totalMinutes) * elapsedMinutes;
  const burnRate = allowedSoFar > 0 ? downtimeMinutes / allowedSoFar : 0;
  const budgetUsedPct = monthlyBudgetMinutes > 0 ? (downtimeMinutes / monthlyBudgetMinutes) * 100 : 0;
  const budgetRemainingMinutes = Math.max(0, monthlyBudgetMinutes - downtimeMinutes);

  const status: ErrorBudgetResult["status"] =
    budgetUsedPct >= 100 ? "Exhausted" : burnRate > 1.5 ? "At Risk" : "Healthy";

  const projectedExhaustionDay =
    burnRate > 0 ? Math.min(daysInMonth, Math.round(daysInMonth / burnRate)) : daysInMonth;

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });

  const chartData = [
    { name: "Allowed (Budget)", minutes: monthlyBudgetMinutes },
    { name: "Used (Downtime)", minutes: downtimeMinutes },
  ];

  const breakdown = [
    { label: "SLO (uptime target)", value: `${slo.toFixed(2)}%`, highlight: true },
    { label: "Monthly Error Budget", value: `${fmt(monthlyBudgetMinutes)} min`, highlight: true },
    { label: "Days Elapsed", value: `${elapsedDays} of ${daysInMonth}` },
    { label: "Downtime Used", value: `${fmt(downtimeMinutes)} min`, highlight: true },
    { label: "Budget Used", value: `${budgetUsedPct.toFixed(1)}%` },
    { label: "Budget Remaining", value: `${fmt(budgetRemainingMinutes)} min` },
    { label: "Burn Rate", value: `${burnRate.toFixed(2)}x`, isTotal: true },
  ];

  const summary = [
    { label: "SLO", value: `${slo.toFixed(2)}%` },
    { label: "Budget", value: `${fmt(monthlyBudgetMinutes)} min` },
    { label: "Used", value: `${fmt(downtimeMinutes)} min` },
    { label: "Burn Rate", value: `${burnRate.toFixed(2)}x` },
    { label: "Remaining", value: `${fmt(budgetRemainingMinutes)} min` },
    { label: "Status", value: status },
  ];

  return { monthlyBudgetMinutes, budgetUsedPct, budgetRemainingMinutes, burnRate, projectedExhaustionDay, status, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: ErrorBudgetInputs = { slo: 99.9, elapsedDays: 20, daysInMonth: 30, downtimeMinutes: 10 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
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

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

const SelectInput = ({ id, label, value, options, onChange }: SelectInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 bg-background border border-input rounded-md text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
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
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `${p.value.toLocaleString("en-US", { maximumFractionDigits: 1 })} min` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function ErrorBudgetBurnRateCalculator() {
  const [slo, setSlo] = useState(String(DEFAULTS.slo));
  const [elapsedDays, setElapsedDays] = useState(String(DEFAULTS.elapsedDays));
  const [daysInMonth, setDaysInMonth] = useState(String(DEFAULTS.daysInMonth));
  const [downtime, setDowntime] = useState(String(DEFAULTS.downtimeMinutes));
  const [results, setResults] = useState<ErrorBudgetResult>(() => calculateErrorBudget(DEFAULTS));

  const getInputs = (): ErrorBudgetInputs => ({
    slo: parseFloat(slo) || 0,
    elapsedDays: parseFloat(elapsedDays) || 0,
    daysInMonth: parseFloat(daysInMonth) || 0,
    downtimeMinutes: parseFloat(downtime) || 0,
  });

  useEffect(() => {
    setResults(calculateErrorBudget(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  const sloNum = parseFloat(slo) || 0;
  if (sloNum < 90 || sloNum > 99.999) valErrors.slo = "SLO must be 90–99.999%";
  const elapsedNum = parseFloat(elapsedDays) || 0;
  const daysNum = parseFloat(daysInMonth) || 0;
  if (elapsedNum < 0) valErrors.elapsedDays = "Days cannot be negative";
  if (daysNum < 1 || daysNum > 31) valErrors.daysInMonth = "Days must be 1–31";
  if (elapsedNum > daysNum) valErrors.elapsedDays = "Elapsed days can't exceed the month";
  if ((parseFloat(downtime) || 0) < 0) valErrors.downtime = "Downtime cannot be negative";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateErrorBudget(getInputs()));
  };

  const reset = () => {
    setSlo(String(DEFAULTS.slo));
    setElapsedDays(String(DEFAULTS.elapsedDays));
    setDaysInMonth(String(DEFAULTS.daysInMonth));
    setDowntime(String(DEFAULTS.downtimeMinutes));
    setResults(calculateErrorBudget(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const sloOptions = [
    { value: "99", label: "99% — 7.3 hrs/mo" },
    { value: "99.9", label: "99.9% — 43.2 min/mo" },
    { value: "99.95", label: "99.95% — 21.6 min/mo" },
    { value: "99.99", label: "99.99% — 4.3 min/mo" },
    { value: "99.999", label: "99.999% — 26 s/mo" },
  ];

  const faqs = [
    {
      question: "What is an error budget burn rate?",
      answer: "It measures how fast you're consuming your monthly error budget relative to the elapsed portion of the month. A burn rate of 1.0 means you're using budget exactly on pace — your projected downtime matches what the SLO allows. Above 1.0 you'll exhaust the budget before month-end; Google's SRE guidance treats >2x as 'alert' and >5x as 'page' territory.",
    },
    {
      question: "How is the error budget calculated from an SLO?",
      answer: "A 99.9% SLO allows 0.1% of uptime to be lost. In a 30-day month (43,200 minutes), that's 43.2 minutes of downtime. The budget is consumed by real downtime, and burn rate compares the downtime so far against the prorated allowance — for 20 days elapsed, the allowance is 43.2 × (20/30) = 28.8 minutes.",
    },
    {
      question: "What should I do when the burn rate is high?",
      answer: "Slowing releases — feature freezes, canaries only, no risky deploys — is the standard move, because every incident risks consuming the budget faster. If you're at risk of exhausting it, treat remaining budget as precious and consider whether the SLO itself needs review. The status label in this calculator flags Healthy, At Risk, or Exhausted based on your rate.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator/technology" }, { label: "Error Budget Burn Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Error Budget Burn Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="slo" label="SLO (Uptime Target)" value={slo} options={sloOptions} onChange={setSlo} />
              <CompactInput id="downtime" label="Downtime This Month" value={downtime} onChange={setDowntime} suffix="min" min="0" error={valErrors.downtime} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="elapsed" label="Days Elapsed" value={elapsedDays} onChange={setElapsedDays} suffix="days" min="0" error={valErrors.elapsedDays} />
              <CompactInput id="days-month" label="Days in Month" value={daysInMonth} onChange={setDaysInMonth} suffix="days" min="1" error={valErrors.daysInMonth} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Burn Rate</div>
              <div className="text-4xl font-bold text-primary tracking-tight">{results.burnRate.toFixed(2)}<span className="text-2xl font-semibold">x</span></div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.status} — {results.budgetUsedPct.toFixed(1)}% of budget used ({results.budgetRemainingMinutes.toFixed(1)} min left).
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Budget</span>
                <span className="font-extrabold text-foreground">{results.monthlyBudgetMinutes.toFixed(1)} min</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Downtime Used</span>
                <span className={`font-extrabold ${results.budgetUsedPct >= 100 ? "text-red-600" : "text-foreground"}`}>{results.budgetUsedPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Exhaustion Day</span>
                <span className="font-extrabold text-foreground">Day {results.projectedExhaustionDay}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[220px]">Value</th>
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
              <h3 className="text-base font-bold mb-2 w-full text-left">Budget Allowed vs Used</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} barSize={64}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `${v.toFixed(1)}m`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                    {results.chartData.map((d, i) => (
                      <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : d.minutes > results.monthlyBudgetMinutes ? "#ef4444" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: i === 0 ? "hsl(var(--primary))" : d.minutes > results.monthlyBudgetMinutes ? "#ef4444" : "#f59e0b" }} />
                    {d.name} — {d.minutes.toFixed(1)} min
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
            <h2 className="text-2xl font-bold mb-3">What Is an Error Budget Burn Rate Calculator?</h2>
            <p>Site reliability engineering gives each service an error budget — the downtime its SLO permits in a month. Burn rate tells you how fast that budget is being consumed relative to the calendar, and whether you're on pace to exhaust it before the month ends. It's the standard signal for deciding when to freeze releases.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>A 99.9% SLO over a 30-day month allows 43.2 minutes of downtime. After 20 days, the prorated allowance is 43.2 × (20/30) = 28.8 minutes. Burn rate divides your actual downtime by that allowance — 10 minutes gives 0.35x (healthy), 60 minutes gives 2.08x (alert). Exhaustion day projects when the budget runs out at the current rate.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The headline number is your burn rate — 1.0x is on pace, above 1.5x is at risk, 100% used is exhausted. The three-stat bar shows the monthly budget, the share used, and the projected exhaustion day. When the rate climbs, slow releases and treat remaining budget as scarce: every incident now compounds the risk of missing the SLO entirely.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/error-budget-burn-rate-calculator" />
          <PopularCalculators exclude="/calculator/error-budget-burn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
