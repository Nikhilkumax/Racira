"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface FormulaInputs {
  feedsPerDay: number;
  ouncesPerFeed: number;
  containerPrice: number;
  ouncesPerContainer: number;
  bottlesPerFeed: number;
}

interface FormulaResult {
  dailyOunces: number;
  monthlyOunces: number;
  annualOunces: number;
  containersPerMonth: number;
  containersPerYear: number;
  monthlyCost: number;
  annualCost: number;
  costPerOunce: number;
  costPerDay: number;
  chartData: { name: string; value: number; color: string; pct: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateFormula(inputs: FormulaInputs): FormulaResult {
  const { feedsPerDay, ouncesPerFeed, containerPrice, ouncesPerContainer, bottlesPerFeed } = inputs;
  const dailyOunces = feedsPerDay * ouncesPerFeed;
  const monthlyOunces = dailyOunces * 30;
  const annualOunces = dailyOunces * 365;
  const containersPerMonth = ouncesPerContainer > 0 ? Math.ceil(monthlyOunces / ouncesPerContainer) : 0;
  const containersPerYear = ouncesPerContainer > 0 ? Math.ceil(annualOunces / ouncesPerContainer) : 0;
  const monthlyCost = containersPerMonth * containerPrice;
  const annualCost = containersPerYear * containerPrice;
  const costPerOunce = ouncesPerContainer > 0 ? containerPrice / ouncesPerContainer : 0;
  const costPerDay = dailyOunces * costPerOunce;
  const bottlesPerDay = feedsPerDay * bottlesPerFeed;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Prepared Formula per Day", value: `${dailyOunces} oz` },
    { label: "Bottles per Day", value: `${bottlesPerDay}` },
    { label: "Cost per Ounce", value: `$${fmt(costPerOunce)}` },
    { label: "Containers per Month", value: `${containersPerMonth}`, highlight: true },
    { label: "Monthly Formula Cost", value: `$${monthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, highlight: true },
    { label: "Annual Formula Cost", value: `$${annualCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true },
  ];

  const summary = [
    { label: "Feeds per Day", value: `${feedsPerDay}` },
    { label: "Ounces per Feed", value: `${ouncesPerFeed} oz` },
    { label: "Prepared per Day", value: `${dailyOunces} oz` },
    { label: "Prepared per Month", value: `${monthlyOunces.toLocaleString("en-US", { maximumFractionDigits: 0 })} oz` },
    { label: "Cost per Ounce", value: `$${fmt(costPerOunce)}` },
    { label: "Containers per Month", value: `${containersPerMonth}` },
    { label: "Monthly Cost", value: `$${monthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Cost", value: `$${annualCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const totalOz = dailyOunces + ouncesPerContainer;
  const p1 = totalOz > 0 ? (dailyOunces / totalOz) * 100 : 0;
  const p2 = totalOz > 0 ? (ouncesPerContainer / totalOz) * 100 : 0;
  const chartData = [
    { name: "Monthly Needs", value: monthlyOunces, color: "hsl(var(--primary))", pct: Math.round(p1 * 10) / 10 },
    { name: "Container Size", value: ouncesPerContainer, color: "#f59e0b", pct: Math.round(p2 * 10) / 10 },
  ];

  return { dailyOunces, monthlyOunces, annualOunces, containersPerMonth, containersPerYear, monthlyCost, annualCost, costPerOunce, costPerDay, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: FormulaInputs = { feedsPerDay: 6, ouncesPerFeed: 4, containerPrice: 35, ouncesPerContainer: 180, bottlesPerFeed: 1 };

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
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} oz` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function BabyFormulaCostCalculator() {
  const [feedsPerDay, setFeedsPerDay] = useState(String(DEFAULTS.feedsPerDay));
  const [ouncesPerFeed, setOuncesPerFeed] = useState(String(DEFAULTS.ouncesPerFeed));
  const [containerPrice, setContainerPrice] = useState(String(DEFAULTS.containerPrice));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ouncesPerContainer, setOuncesPerContainer] = useState(String(DEFAULTS.ouncesPerContainer));
  const [bottlesPerFeed, setBottlesPerFeed] = useState(String(DEFAULTS.bottlesPerFeed));
  const [results, setResults] = useState<FormulaResult>(() => calculateFormula(DEFAULTS));

  const getInputs = (): FormulaInputs => ({
    feedsPerDay: parseFloat(feedsPerDay) || 0,
    ouncesPerFeed: parseFloat(ouncesPerFeed) || 0,
    containerPrice: parseFloat(containerPrice) || 0,
    ouncesPerContainer: parseFloat(ouncesPerContainer) || 0,
    bottlesPerFeed: parseFloat(bottlesPerFeed) || 1,
  });

  useEffect(() => {
    setResults(calculateFormula(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(feedsPerDay) || 0) < 1 || (parseFloat(feedsPerDay) || 0) > 12) valErrors.feedsPerDay = "Feeds must be 1–12 per day";
  if ((parseFloat(ouncesPerFeed) || 0) <= 0 || (parseFloat(ouncesPerFeed) || 0) > 12) valErrors.ouncesPerFeed = "Ounces must be 1–12";
  if ((parseFloat(containerPrice) || 0) <= 0) valErrors.containerPrice = "Price must be greater than 0";
  if ((parseFloat(ouncesPerContainer) || 0) <= 0) valErrors.ouncesPerContainer = "Container yield must be greater than 0";
  if ((parseFloat(bottlesPerFeed) || 0) < 1 || (parseFloat(bottlesPerFeed) || 0) > 4) valErrors.bottlesPerFeed = "Bottles must be 1–4";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateFormula(getInputs()));
  };

  const reset = () => {
    setFeedsPerDay(String(DEFAULTS.feedsPerDay));
    setOuncesPerFeed(String(DEFAULTS.ouncesPerFeed));
    setContainerPrice(String(DEFAULTS.containerPrice));
    setOuncesPerContainer(String(DEFAULTS.ouncesPerContainer));
    setBottlesPerFeed(String(DEFAULTS.bottlesPerFeed));
    setShowAdvanced(false);
    setResults(calculateFormula(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const faqs = [
    {
      question: "How much formula does a baby drink per day?",
      answer: "Most babies drink about 2.5 ounces of formula per pound of body weight per day, spread over 6–8 feedings. A newborn takes 1–3 ounces per feeding and a 6-month-old 6–8 ounces. Because intake changes week to week, use your pediatrician's guidance and adjust the feeds-per-day and ounces-per-feed inputs to your baby's actual pattern.",
    },
    {
      question: "Why is 'ounces of prepared formula per container' important?",
      answer: "The printed weight on a container is the dry powder weight; once mixed with water it yields far more prepared formula. A typical large tub of powder makes roughly 150–200 ounces of prepared formula. Entering the prepared yield (check the label or the brand's website) is what makes the container count and cost estimate realistic.",
    },
    {
      question: "Are store brands as good as name brands?",
      answer: "In the U.S., store-brand infant formulas meet the same FDA nutritional standards as name brands and are often 30–50% cheaper. If your baby tolerates one, switching can cut your annual formula bill significantly. Run the comparison with your store's price per container in this calculator to see the yearly difference.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Baby Formula Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baby Formula Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="feeds-per-day" label="Feeds per Day" value={feedsPerDay} onChange={setFeedsPerDay} suffix="x" min="1" error={valErrors.feedsPerDay} />
              <CompactInput id="ounces-per-feed" label="Ounces per Feed" value={ouncesPerFeed} onChange={setOuncesPerFeed} suffix="oz" min="1" error={valErrors.ouncesPerFeed} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="container-price" label="Price per Container" value={containerPrice} onChange={setContainerPrice} prefix="$" min="1" error={valErrors.containerPrice} />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Container & Feeding</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="ounces-per-container" label="Prepared oz per Container" value={ouncesPerContainer} onChange={setOuncesPerContainer} suffix="oz" min="1" error={valErrors.ouncesPerContainer} />
                      <CompactInput id="bottles-per-feed" label="Bottles per Feed" value={bottlesPerFeed} onChange={setBottlesPerFeed} suffix="x" min="1" error={valErrors.bottlesPerFeed} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Monthly Formula Cost</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${results.monthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.containersPerMonth} containers/month — about ${results.annualCost.toLocaleString("en-US", { maximumFractionDigits: 0 })} per year.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Prepared per Day</span>
                <span className="font-extrabold text-foreground">{results.dailyOunces} oz</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Ounce</span>
                <span className="font-extrabold text-foreground">${results.costPerOunce.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Cost</span>
                <span className="font-extrabold text-emerald-600">${results.annualCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
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
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-2 w-full text-left">Monthly Need vs Container Size</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                    {results.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    {d.name} — {d.pct}%
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
            <h2 className="text-2xl font-bold mb-3">What Is a Baby Formula Cost Calculator?</h2>
            <p>Formula feeding is a significant line item in a baby's first year. This calculator turns your feeding routine and formula brand into a monthly and annual budget: how many containers you will buy, how much prepared formula your baby actually drinks, and what that costs per ounce. It is a practical budgeting tool for new parents planning their first-year expenses.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Your daily volume is feeds per day multiplied by ounces per feed. That daily total is scaled to a month (30 days) and a year (365 days), then divided by the prepared ounces each container yields to find how many containers you will need. Monthly and annual cost follow from the price per container, and cost per ounce lets you compare brands directly regardless of package size.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary number is your monthly formula cost. The three-stat bar shows prepared volume per day, cost per ounce, and the annual total. The breakdown table walks from daily volume through containers per month to the annual total, and the summary block mirrors those figures so the headline number always ties back to the detail rows. Adjust the advanced inputs to your exact container yield and feeding pattern for a budget you can plan around.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baby-formula-cost-calculator" />
          <PopularCalculators exclude="/calculator/baby-formula-cost-calculator" />
        </div>
      </div>
    </>
  );
}
