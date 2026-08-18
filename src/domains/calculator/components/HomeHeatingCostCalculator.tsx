"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface HeatingInputs {
  homeSize: number;   // sq ft
  fuel: string;       // "gas" | "electric" | "propane" | "oil" | "heatpump"
  fuelPrice: number;  // per unit
  months: number;     // heating season length
  insulation: string; // "good" | "average" | "poor"
}

interface FuelInfo {
  label: string;
  unit: string;
  usagePerSqft: number; // annual usage per sq ft at average insulation
  effFactor: number;    // applied to base usage
}

interface HeatingResults {
  annualUsage: number;
  seasonUsage: number;
  totalCost: number;
  monthlyCost: number;
  costPerSqft: number;
  costPerYear: number;
  fuel: FuelInfo;
  chartData: { name: string; cost: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const FUELS: Record<string, FuelInfo> = {
  gas: { label: "Natural Gas", unit: "therms", usagePerSqft: 0.45, effFactor: 1 },
  electric: { label: "Electricity", unit: "kWh", usagePerSqft: 6.0, effFactor: 1 },
  propane: { label: "Propane", unit: "gal", usagePerSqft: 0.49, effFactor: 1 },
  oil: { label: "Heating Oil", unit: "gal", usagePerSqft: 0.32, effFactor: 1 },
  heatpump: { label: "Heat Pump", unit: "kWh", usagePerSqft: 2.1, effFactor: 1 },
};

const INSULATION_FACTOR: Record<string, number> = { good: 0.78, average: 1.0, poor: 1.35 };

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function calcHeating(i: HeatingInputs): HeatingResults {
  const fuel = FUELS[i.fuel] ?? FUELS.gas;
  const insFactor = INSULATION_FACTOR[i.insulation] ?? 1.0;
  const annualUsage = i.homeSize * fuel.usagePerSqft * insFactor;
  const seasonUsage = annualUsage * (i.months / 12);
  const totalCost = seasonUsage * i.fuelPrice;
  const monthlyCost = i.months > 0 ? totalCost / i.months : 0;
  const costPerSqft = i.homeSize > 0 ? totalCost / i.homeSize : 0;
  const costPerYear = annualUsage * i.fuelPrice;

  // Monthly cost chart: weight the middle months of the season higher
  const months = Math.min(12, Math.max(1, Math.round(i.months)));
  const startIdx = months >= 6 ? 0 : 12 - months;
  const chartData: { name: string; cost: number }[] = [];
  for (let m = 0; m < months; m++) {
    const idx = (startIdx + m) % 12;
    const depth = Math.sin(((m + 0.5) / months) * Math.PI); // 0 at edges, 1 in middle
    const weight = depth > 0.01 ? depth : 0.5;
    const share = weight / months;
    chartData.push({ name: MONTH_NAMES[idx], cost: +(totalCost * share).toFixed(2) });
  }

  const breakdown = [
    { label: "Home Size", value: `${i.homeSize.toLocaleString()} sq ft` },
    { label: "Insulation", value: i.insulation.charAt(0).toUpperCase() + i.insulation.slice(1) },
    { label: `Annual Usage (${fuel.label})`, value: `${annualUsage.toFixed(1)} ${fuel.unit}` },
    { label: `Season Usage (${i.months} mo)`, value: `${seasonUsage.toFixed(1)} ${fuel.unit}` },
    { label: `Price ($${i.fuelPrice.toFixed(2)}/${fuel.unit})`, value: `$${i.fuelPrice.toFixed(2)}` },
    { label: "Total Heating Cost", value: `$${totalCost.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Monthly Average", value: `$${monthlyCost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Total Heating Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Monthly Average", value: `$${monthlyCost.toFixed(2)}` },
    { label: "Per Year (12 mo)", value: `$${costPerYear.toFixed(2)}` },
    { label: "Per Sq Ft", value: `$${costPerSqft.toFixed(2)}` },
    { label: "Season Usage", value: `${seasonUsage.toFixed(1)} ${fuel.unit}` },
    { label: "Annual Usage", value: `${annualUsage.toFixed(1)} ${fuel.unit}` },
    { label: "Fuel", value: fuel.label },
    { label: "Heating Season", value: `${i.months} month(s)` },
  ];

  return { annualUsage, seasonUsage, totalCost, monthlyCost, costPerSqft, costPerYear, fuel, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  homeSize: "2000",
  fuel: "gas",
  fuelPrice: "1.20",
  months: "6",
  insulation: "average",
};

// 4. Component
export default function HomeHeatingCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<HeatingResults>(() => calcHeating({ homeSize: 2000, fuel: "gas", fuelPrice: 1.2, months: 6, insulation: "average" }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcHeating({ homeSize: 2000, fuel: "gas", fuelPrice: 1.2, months: 6, insulation: "average" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const fuelDefaults: Record<string, string> = { gas: "1.20", electric: "0.16", propane: "2.60", oil: "3.40", heatpump: "0.16" };

  const selectFuel = (f: string) => setInputs((s) => ({ ...s, fuel: f, fuelPrice: fuelDefaults[f] ?? s.fuelPrice }));

  const calculate = () =>
    setResult(
      calcHeating({
        homeSize: parseFloat(inputs.homeSize) || 0,
        fuel: inputs.fuel,
        fuelPrice: parseFloat(inputs.fuelPrice) || 0,
        months: parseFloat(inputs.months) || 0,
        insulation: inputs.insulation,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcHeating({ homeSize: 2000, fuel: "gas", fuelPrice: 1.2, months: 6, insulation: "average" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const homeSize = parseFloat(inputs.homeSize) || 0;
  const fuelPrice = parseFloat(inputs.fuelPrice) || 0;
  const months = parseFloat(inputs.months) || 0;
  if (homeSize < 200 || homeSize > 20000) errors.homeSize = "Must be 200–20,000 sq ft";
  if (fuelPrice <= 0) errors.fuelPrice = "Must be greater than 0";
  if (months < 1 || months > 12) errors.months = "Must be 1–12 months";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much does it cost to heat a house per month?", answer: "A typical 2,000 sq ft home with natural gas at $1.20/therm, average insulation, and a 6-month season runs about $90 a month — $540 for the season. Electric resistance heat costs roughly 60–80% more, while a heat pump is usually the cheapest option where winters are moderate." },
    { question: "Why is my heating bill so much higher than the calculator?", answer: "The biggest factors are insulation and air leakage (the model assumes average construction), thermostat settings (each degree up adds about 3%), and local fuel prices. Poorly insulated older homes can easily use 35% more fuel than the average estimate — the Advanced Options insulation setting captures this range." },
    { question: "Is it cheaper to heat with gas or electricity?", answer: "At typical prices, natural gas is usually the cheapest per unit of heat: a therm of gas delivers about 100,000 BTU, while a kWh of electric resistance heat delivers only 3,412 BTU. Electric resistance costs 2–3× more per BTU; heat pumps, at 2.5–3.5× efficiency, often beat gas in mild climates." },
    { question: "How can I cut my heating costs?", answer: "Sealing air leaks and adding attic insulation are the highest-return upgrades — they can cut heating use by 20–30%. Dropping the thermostat 5°F at night, using a programmable thermostat, and servicing the furnace (85–90% efficiency instead of 70%) each add savings that compound together." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Home Heating Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Heating Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="homeSize" className={lbl}>Home Size</label>
                <div className={inp}>
                  <input id="homeSize" type="number" min="200" step="100" value={inputs.homeSize} onChange={(e) => set("homeSize")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                </div>
                {errors.homeSize && <p className="text-xs text-red-500 font-medium mt-1">{errors.homeSize}</p>}
              </div>
              <div>
                <label htmlFor="fuel" className={lbl}>Heating Fuel</label>
                <select id="fuel" value={inputs.fuel} onChange={(e) => selectFuel(e.target.value)} className={sel}>
                  <option value="gas">Natural Gas</option>
                  <option value="electric">Electricity</option>
                  <option value="propane">Propane</option>
                  <option value="oil">Heating Oil</option>
                  <option value="heatpump">Heat Pump</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fuelPrice" className={lbl}>Fuel Price</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="fuelPrice" type="number" min="0.01" step="0.05" value={inputs.fuelPrice} onChange={(e) => set("fuelPrice")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/{result.fuel.unit}</span>
                </div>
                {errors.fuelPrice && <p className="text-xs text-red-500 font-medium mt-1">{errors.fuelPrice}</p>}
              </div>
              <div>
                <label htmlFor="months" className={lbl}>Heating Season</label>
                <div className={inp}>
                  <input id="months" type="number" min="1" max="12" value={inputs.months} onChange={(e) => set("months")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">months</span>
                </div>
                {errors.months && <p className="text-xs text-red-500 font-medium mt-1">{errors.months}</p>}
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Home Efficiency</div>
                    <div>
                      <label htmlFor="insulation" className={lbl}>Insulation & Air Sealing</label>
                      <select id="insulation" value={inputs.insulation} onChange={(e) => set("insulation")(e.target.value)} className={sel}>
                        <option value="good">Good (modern, well-sealed)</option>
                        <option value="average">Average (typical home)</option>
                        <option value="poor">Poor (older, drafty)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Heating Cost ({inputs.months} mo)</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.monthlyCost.toFixed(2)}/month · ${result.costPerSqft.toFixed(2)}/sq ft · {result.seasonUsage.toFixed(0)} {result.fuel.unit}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Average", `$${result.monthlyCost.toFixed(2)}`],
                ["Season Usage", `${result.seasonUsage.toFixed(0)} ${result.fuel.unit}`],
                ["Per Year", `$${result.costPerYear.toFixed(2)}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Energy Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Estimated Monthly Cost by Month</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Mid-season months are weighted heavier — coldest weather demands the most fuel.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Heating Loads, Simplified</h2>
            <p>This calculator uses transparent per-square-foot usage benchmarks derived from typical U.S. consumption data: about 0.45 therms of natural gas per square foot per year at average insulation — 900 therms for a 2,000 sq ft home — with electricity (6.0 kWh/sq ft) and heat pumps (2.1 kWh/sq ft, reflecting ~3× COP) scaled accordingly. The season length simply pro-rates the annual figure.</p>
            <h2 className="text-2xl font-bold mb-3">Fuel Choice Is the Biggest Lever</h2>
            <p>At current typical prices, natural gas and heat pumps are the cheapest ways to heat a home, electric resistance the most expensive, and propane and oil in between. Because each fuel uses a different unit — therms, kWh, gallons — comparing them on dollars alone is the honest way: enter each fuel's local price and compare the season totals side by side.</p>
            <h2 className="text-2xl font-bold mb-3">Insulation Multiplies Everything</h2>
            <p>The Advanced Options insulation setting shifts usage by −22% to +35%. Air sealing and attic insulation are the classic high-return upgrades precisely because they cut every fuel type at once. A poor-to-good insulation improvement on a 2,000 sq ft gas home saves roughly $200–250 a season — every year, for the life of the home.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-heating-cost-calculator" />
          <PopularCalculators exclude="/calculator/home-heating-cost-calculator" />
        </div>
      </div>
    </>
  );
}
