"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface BurnPerPoundInputs {
  weightLb: number;
  factor: number; // kcal per lb per day
}

interface BurnPerPoundResult {
  dailyBurn: number;
  weeklyBurn: number;
  monthlyBurn: number;
  chartData: { name: string; factor: number; burn: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateBurnPerPound(inputs: BurnPerPoundInputs): BurnPerPoundResult {
  const { weightLb, factor } = inputs;
  const dailyBurn = weightLb * factor;
  const weeklyBurn = dailyBurn * 7;
  const monthlyBurn = dailyBurn * 30.44;

  const levels = [
    { name: "Sedentary", factor: 12 },
    { name: "Lightly Active", factor: 13 },
    { name: "Moderately Active", factor: 14.5 },
    { name: "Very Active", factor: 16 },
    { name: "Athlete", factor: 18 },
  ];

  const chartData = levels.map((l) => ({ name: l.name, factor: l.factor, burn: Math.round(weightLb * l.factor) }));

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Body Weight", value: `${weightLb} lb` },
    { label: "Activity Factor", value: `${factor.toFixed(1)} kcal/lb/day`, highlight: true },
    { label: "Daily Calorie Burn", value: `${fmt(dailyBurn)} kcal`, highlight: true },
    { label: "Weekly Calorie Burn", value: `${fmt(weeklyBurn)} kcal`, highlight: true },
    { label: "Monthly Calorie Burn", value: `${fmt(monthlyBurn)} kcal` },
    { label: "Daily Burn / kg", value: `${Math.round((dailyBurn / (weightLb * 0.45359237)) * 10) / 10} kcal/kg`, isTotal: true },
  ];

  const summary = [
    { label: "Weight", value: `${weightLb} lb` },
    { label: "Factor", value: `${factor.toFixed(1)} kcal/lb` },
    { label: "Daily Burn", value: `${fmt(dailyBurn)} kcal` },
    { label: "Weekly Burn", value: `${fmt(weeklyBurn)} kcal` },
    { label: "Monthly Burn", value: `${fmt(monthlyBurn)} kcal` },
    { label: "Weight (kg)", value: `${(weightLb * 0.45359237).toFixed(1)} kg` },
  ];

  return { dailyBurn, weeklyBurn, monthlyBurn, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: BurnPerPoundInputs = { weightLb: 175, factor: 14.5 };

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
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `${Math.round(p.value).toLocaleString()} kcal` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function CalorieBurnPerPoundCalculator() {
  const [weight, setWeight] = useState(String(DEFAULTS.weightLb));
  const [factor, setFactor] = useState(String(DEFAULTS.factor));
  const [results, setResults] = useState<BurnPerPoundResult>(() => calculateBurnPerPound(DEFAULTS));

  const getInputs = (): BurnPerPoundInputs => ({
    weightLb: parseFloat(weight) || 0,
    factor: parseFloat(factor) || 0,
  });

  useEffect(() => {
    setResults(calculateBurnPerPound(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  const weightNum = parseFloat(weight) || 0;
  if (weightNum < 50 || weightNum > 700) valErrors.weight = "Weight must be 50–700 lb";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateBurnPerPound(getInputs()));
  };

  const reset = () => {
    setWeight(String(DEFAULTS.weightLb));
    setFactor(String(DEFAULTS.factor));
    setResults(calculateBurnPerPound(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const factorOptions = [
    { value: "12", label: "Sedentary (12 kcal/lb)" },
    { value: "13", label: "Lightly Active (13 kcal/lb)" },
    { value: "14.5", label: "Moderately Active (14.5 kcal/lb)" },
    { value: "16", label: "Very Active (16 kcal/lb)" },
    { value: "18", label: "Athlete / Heavy Training (18 kcal/lb)" },
  ];

  const faqs = [
    {
      question: "What is 'calorie burn per pound of body weight'?",
      answer: "It's a quick rule of thumb: your total daily energy expenditure roughly equals your body weight in pounds times an activity factor. Sedentary people burn about 12–13 kcal per pound per day, moderately active people about 14.5–16, and athletes 18 or more. A 175 lb moderately active person therefore burns about 2,540 kcal per day.",
    },
    {
      question: "How accurate is this method compared to Mifflin-St Jeor?",
      answer: "The per-pound method is a population average — it ignores age, sex, and height, so it's best for quick estimates. Mifflin-St Jeor accounts for those variables and is more accurate for individuals. This calculator's real value is showing how the same weight maps to very different burns at different activity levels, which the bar chart makes obvious.",
    },
    {
      question: "Why does burn scale with body weight?",
      answer: "Larger bodies have more tissue to maintain and move, so they burn more at the same activity level. This scaling is why heavier people burn more calories doing the same exercise, and why weight loss gradually lowers your maintenance calories — a 10 lb loss at 14.5 kcal/lb reduces daily burn by about 145 kcal.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Daily Calorie Burn per Pound of Body Weight" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Daily Calorie Burn per Pound of Body Weight</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix="lb" min="50" error={valErrors.weight} />
              <SelectInput id="factor" label="Activity Level" value={factor} options={factorOptions} onChange={setFactor} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Daily Calorie Burn</div>
              <div className="text-4xl font-bold text-primary tracking-tight">{results.dailyBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })} <span className="text-2xl font-semibold">kcal</span></div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {(parseFloat(weight) || DEFAULTS.weightLb).toLocaleString()} lb × {(parseFloat(factor) || DEFAULTS.factor).toFixed(1)} kcal/lb/day.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Day</span>
                <span className="font-extrabold text-foreground">{results.dailyBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Week</span>
                <span className="font-extrabold text-foreground">{results.weeklyBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Month</span>
                <span className="font-extrabold text-foreground">{results.monthlyBurn.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
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
              <h3 className="text-base font-bold mb-2 w-full text-left">Daily Burn by Activity Level</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tickFormatter={(v: number) => `${v.toLocaleString()}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="burn" radius={[6, 6, 0, 0]}>
                    {results.chartData.map((d, i) => (
                      <Cell key={i} fill={d.factor === (parseFloat(factor) || DEFAULTS.factor) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.35)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }} />
                  Selected level
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--muted-foreground)/0.35)" }} />
                  Other levels
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
            <h2 className="text-2xl font-bold mb-3">What Is Daily Calorie Burn per Pound?</h2>
            <p>Daily calorie burn per pound of body weight is a quick way to estimate total daily energy expenditure without tracking every activity. Multiply your weight by an activity factor — roughly 12 kcal/lb for sedentary people up to 18 for athletes — and you get a solid estimate of what you burn in a day.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The calculator multiplies your body weight in pounds by the selected factor. Because the factor covers total daily burn (resting metabolism plus activity), no separate BMR step is needed. The bar chart shows how the same weight produces very different daily burns across all five activity levels, with the selected one highlighted.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The headline number is your estimated total daily burn — your maintenance calories if weight is stable. Eat below it to lose weight (a 500 kcal deficit is roughly one pound per week) or above it to gain. Remember the method ignores age, sex, and height, so treat it as a starting point and adjust based on what the scale actually does.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/daily-calorie-burn-per-pound-of-body-weight" />
          <PopularCalculators exclude="/calculator/daily-calorie-burn-per-pound-of-body-weight" />
        </div>
      </div>
    </>
  );
}
