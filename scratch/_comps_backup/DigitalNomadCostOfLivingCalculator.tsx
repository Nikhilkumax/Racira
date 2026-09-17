"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface NomadInputs {
  homeMonthlyCost: number;
  monthlyIncome: number;
  destinationIndex: number;
  months: number;
}

interface NomadResult {
  destinationMonthlyCost: number;
  monthlySavings: number;
  totalSavings: number;
  savingsRate: number;
  destinationName: string;
  chartData: { name: string; cost: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateNomad(inputs: NomadInputs): NomadResult {
  const { homeMonthlyCost, monthlyIncome, destinationIndex, months } = inputs;
  const destinationMonthlyCost = homeMonthlyCost * destinationIndex;
  const monthlySavings = Math.max(0, homeMonthlyCost - destinationMonthlyCost);
  const totalSavings = monthlySavings * months;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  const destinations: Record<string, string> = {
    "0.55": "Ho Chi Minh City",
    "0.6": "Bangkok",
    "0.65": "Medellín / Bali",
    "0.7": "Mexico City",
    "0.75": "Chiang Mai",
    "0.85": "Lisbon",
    "0.95": "Berlin",
    "1.0": "U.S. Average (baseline)",
  };
  const destinationName = destinations[String(destinationIndex)] || "Selected city";

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const chartData = [
    { name: "Home Base", cost: homeMonthlyCost },
    { name: "Destination", cost: destinationMonthlyCost },
  ];

  const breakdown = [
    { label: "Monthly Income", value: `$${fmt(monthlyIncome)}` },
    { label: "Home-Base Monthly Cost", value: `$${fmt(homeMonthlyCost)}` },
    { label: "Destination Index", value: `${(destinationIndex * 100).toFixed(0)}% of home`, highlight: true },
    { label: "Destination Monthly Cost", value: `$${fmt(destinationMonthlyCost)}`, highlight: true },
    { label: "Monthly Savings", value: `$${fmt(monthlySavings)}`, highlight: true },
    { label: "Trip Length", value: `${months} month${months === 1 ? "" : "s"}` },
    { label: "Total Savings", value: `$${fmt(totalSavings)}`, isTotal: true },
  ];

  const summary = [
    { label: "Home Cost", value: `$${fmt(homeMonthlyCost)}` },
    { label: "Destination", value: destinationName },
    { label: "Destination Cost", value: `$${fmt(destinationMonthlyCost)}` },
    { label: "Monthly Savings", value: `$${fmt(monthlySavings)}` },
    { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%` },
    { label: "Total Savings", value: `$${fmt(totalSavings)}` },
  ];

  return { destinationMonthlyCost, monthlySavings, totalSavings, savingsRate, destinationName, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: NomadInputs = { homeMonthlyCost: 3200, monthlyIncome: 4500, destinationIndex: 0.6, months: 6 };

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
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `$${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function DigitalNomadCostOfLivingCalculator() {
  const [homeCost, setHomeCost] = useState(String(DEFAULTS.homeMonthlyCost));
  const [income, setIncome] = useState(String(DEFAULTS.monthlyIncome));
  const [destination, setDestination] = useState(String(DEFAULTS.destinationIndex));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [results, setResults] = useState<NomadResult>(() => calculateNomad(DEFAULTS));

  const getInputs = (): NomadInputs => ({
    homeMonthlyCost: parseFloat(homeCost) || 0,
    monthlyIncome: parseFloat(income) || 0,
    destinationIndex: parseFloat(destination) || 1,
    months: parseFloat(months) || 0,
  });

  useEffect(() => {
    setResults(calculateNomad(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(homeCost) || 0) <= 0) valErrors.homeCost = "Cost must be greater than 0";
  if ((parseFloat(income) || 0) <= 0) valErrors.income = "Income must be greater than 0";
  const monthsNum = parseFloat(months) || 0;
  if (monthsNum < 1 || monthsNum > 60) valErrors.months = "Trip must be 1–60 months";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateNomad(getInputs()));
  };

  const reset = () => {
    setHomeCost(String(DEFAULTS.homeMonthlyCost));
    setIncome(String(DEFAULTS.monthlyIncome));
    setDestination(String(DEFAULTS.destinationIndex));
    setMonths(String(DEFAULTS.months));
    setResults(calculateNomad(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const destinationOptions = [
    { value: "0.55", label: "Ho Chi Minh City — 55% of U.S." },
    { value: "0.6", label: "Bangkok — 60% of U.S." },
    { value: "0.65", label: "Medellín / Bali — 65% of U.S." },
    { value: "0.7", label: "Mexico City — 70% of U.S." },
    { value: "0.75", label: "Chiang Mai — 75% of U.S." },
    { value: "0.85", label: "Lisbon — 85% of U.S." },
    { value: "0.95", label: "Berlin — 95% of U.S." },
    { value: "1", label: "U.S. Average (baseline)" },
  ];

  const faqs = [
    {
      question: "How accurate are these destination cost indices?",
      answer: "The indices are approximate ratios of typical monthly living costs relative to the U.S. average — they cover rent, food, transport, and other everyday expenses, and they're intended for planning, not budgeting to the dollar. Actual costs vary a lot by neighborhood, lifestyle, and currency moves, so verify with a detailed cost-of-living site for your specific city before committing.",
    },
    {
      question: "What should I include in my home-base monthly cost?",
      answer: "Include everything you spend to live: rent or mortgage, utilities, groceries, transport, insurance, dining, and subscriptions. Then think about what you'll still pay while abroad — storage, a car you're keeping, U.S. credit card bills — and add that to the home-base figure so the savings estimate stays realistic. Many nomads find they keep 40–60% of their home cost regardless of destination.",
    },
    {
      question: "Is saving money the only reason to go nomadic?",
      answer: "No — many do it for lifestyle, travel, or location flexibility. But the math matters: at a 40% cheaper destination, someone spending $3,200/month at home saves about $1,280/month, or $7,680 over six months. That's meaningful runway for travel or a sabbatical. If a destination isn't actually cheaper once you account for flights and visas, the savings column will show it immediately.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator/everyday-life" }, { label: "Digital Nomad Cost of Living Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Digital Nomad Cost of Living Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="home-cost" label="Home-Base Monthly Cost" value={homeCost} onChange={setHomeCost} prefix="$" error={valErrors.homeCost} />
              <CompactInput id="income" label="Monthly Income" value={income} onChange={setIncome} prefix="$" error={valErrors.income} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="destination" label="Destination" value={destination} options={destinationOptions} onChange={setDestination} />
              <CompactInput id="months" label="Trip Length" value={months} onChange={setMonths} suffix="months" min="1" error={valErrors.months} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Savings Over Trip</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${results.totalSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.destinationName} — saves ${results.monthlySavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo ({results.savingsRate.toFixed(1)}% of income).
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Home Cost</span>
                <span className="font-extrabold text-foreground">${(parseFloat(homeCost) || DEFAULTS.homeMonthlyCost).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Destination Cost</span>
                <span className="font-extrabold text-foreground">${results.destinationMonthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Savings</span>
                <span className="font-extrabold text-emerald-600">${results.monthlySavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
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
              <h3 className="text-base font-bold mb-2 w-full text-left">Monthly Cost: Home vs Destination</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} barSize={64}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `$${v.toLocaleString()}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                    {results.chartData.map((d, i) => (
                      <Cell key={i} fill={i === 0 ? "hsl(var(--muted-foreground)/0.5)" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: i === 0 ? "hsl(var(--muted-foreground)/0.5)" : "hsl(var(--primary))" }} />
                    {d.name} — ${d.cost.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo
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
            <h2 className="text-2xl font-bold mb-3">What Is a Digital Nomad Cost of Living Calculator?</h2>
            <p>This calculator estimates how much cheaper — or pricier — living abroad is versus your home base, and converts that into real savings over the length of your trip. It compares your monthly cost at home against a destination cost index, then projects the total saved while you work remotely.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Your home-base monthly cost is multiplied by the destination's cost index (a ratio of typical living costs relative to the U.S. average) to estimate what the same lifestyle would cost there. The monthly difference is your savings, scaled by trip length for the headline total. The bar chart puts the two monthly costs side by side.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary figure is total savings over the whole trip — what you can bank, spend on travel, or use as runway. Watch the savings-rate stat: if the destination isn't cheaper after flights, visas, and insurance, the monthly savings will be small or negative. Treat the indices as planning estimates and confirm city-level prices before you book.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/digital-nomad-cost-of-living-calculator" />
          <PopularCalculators exclude="/calculator/digital-nomad-cost-of-living-calculator" />
        </div>
      </div>
    </>
  );
}
