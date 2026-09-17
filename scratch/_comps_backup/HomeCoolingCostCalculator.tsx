"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface CoolingInputs {
  homeSize: number;   // sq ft
  acType: string;     // "central" | "heatpump" | "window" | "evap"
  price: number;      // $/kWh
  months: number;     // cooling season length
  seer: number;       // seasonal energy efficiency ratio
  thermostat: string; // "cool" | "moderate" | "warm"
}

interface AcTypeInfo {
  label: string;
  usagePerSqft: number; // kWh/sq ft/year at SEER 14 baseline
}

interface CoolingResults {
  seasonKwh: number;
  totalCost: number;
  monthlyCost: number;
  costPerSqft: number;
  costPerYear: number;
  ac: AcTypeInfo;
  chartData: { name: string; cost: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const AC_TYPES: Record<string, AcTypeInfo> = {
  central: { label: "Central AC", usagePerSqft: 6.5 },
  heatpump: { label: "Heat Pump", usagePerSqft: 5.2 },
  window: { label: "Window Units", usagePerSqft: 8.5 },
  evap: { label: "Evaporative Cooler", usagePerSqft: 1.4 },
};

const THERMOSTAT_FACTOR: Record<string, number> = { cool: 1.1, moderate: 1.0, warm: 0.85 };
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function calcCooling(i: CoolingInputs): CoolingResults {
  const ac = AC_TYPES[i.acType] ?? AC_TYPES.central;
  const thermoFactor = THERMOSTAT_FACTOR[i.thermostat] ?? 1.0;
  const seerFactor = 14 / Math.max(1, i.seer);
  const annualKwh = i.homeSize * ac.usagePerSqft * thermoFactor * seerFactor;
  const seasonKwh = annualKwh * (i.months / 12);
  const totalCost = seasonKwh * i.price;
  const monthlyCost = i.months > 0 ? totalCost / i.months : 0;
  const costPerSqft = i.homeSize > 0 ? totalCost / i.homeSize : 0;
  const costPerYear = annualKwh * i.price;

  const months = Math.min(12, Math.max(1, Math.round(i.months)));
  const startIdx = months >= 6 ? 5 : 12 - Math.ceil(months / 2) - 1;
  const chartData: { name: string; cost: number }[] = [];
  for (let m = 0; m < months; m++) {
    const idx = (startIdx + m) % 12;
    const depth = Math.sin(((m + 0.5) / months) * Math.PI);
    const weight = depth > 0.01 ? depth : 0.5;
    const share = weight / months;
    chartData.push({ name: MONTH_NAMES[idx], cost: +(totalCost * share).toFixed(2) });
  }

  const breakdown = [
    { label: "Home Size", value: `${i.homeSize.toLocaleString()} sq ft` },
    { label: "Cooling System", value: ac.label },
    { label: `SEER Rating`, value: `${i.seer}` },
    { label: `Thermostat Setting`, value: i.thermostat === "cool" ? "Cool (≤70°F)" : i.thermostat === "warm" ? "Warm (78°F+)" : "Moderate (72–74°F)" },
    { label: `Season Usage (${i.months} mo)`, value: `${seasonKwh.toFixed(0)} kWh` },
    { label: `Price ($${i.price.toFixed(2)}/kWh)`, value: `$${i.price.toFixed(2)}` },
    { label: "Total Cooling Cost", value: `$${totalCost.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Monthly Average", value: `$${monthlyCost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Total Cooling Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Monthly Average", value: `$${monthlyCost.toFixed(2)}` },
    { label: "Per Year (12 mo)", value: `$${costPerYear.toFixed(2)}` },
    { label: "Per Sq Ft", value: `$${costPerSqft.toFixed(2)}` },
    { label: "Season Usage", value: `${seasonKwh.toFixed(0)} kWh` },
    { label: "System", value: ac.label },
    { label: "SEER", value: `${i.seer}` },
    { label: "Cooling Season", value: `${i.months} month(s)` },
  ];

  return { seasonKwh, totalCost, monthlyCost, costPerSqft, costPerYear, ac, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  homeSize: "2000",
  acType: "central",
  price: "0.16",
  months: "4",
  seer: "14",
  thermostat: "moderate",
};

// 4. Component
export default function HomeCoolingCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<CoolingResults>(() => calcCooling({ homeSize: 2000, acType: "central", price: 0.16, months: 4, seer: 14, thermostat: "moderate" }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcCooling({ homeSize: 2000, acType: "central", price: 0.16, months: 4, seer: 14, thermostat: "moderate" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcCooling({
        homeSize: parseFloat(inputs.homeSize) || 0,
        acType: inputs.acType,
        price: parseFloat(inputs.price) || 0,
        months: parseFloat(inputs.months) || 0,
        seer: parseFloat(inputs.seer) || 14,
        thermostat: inputs.thermostat,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcCooling({ homeSize: 2000, acType: "central", price: 0.16, months: 4, seer: 14, thermostat: "moderate" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const homeSize = parseFloat(inputs.homeSize) || 0;
  const price = parseFloat(inputs.price) || 0;
  const months = parseFloat(inputs.months) || 0;
  const seer = parseFloat(inputs.seer) || 0;
  if (homeSize < 200 || homeSize > 20000) errors.homeSize = "Must be 200–20,000 sq ft";
  if (price <= 0) errors.price = "Must be greater than 0";
  if (months < 1 || months > 12) errors.months = "Must be 1–12 months";
  if (seer < 8 || seer > 30) errors.seer = "Must be 8–30";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much does it cost to run central AC for a month?", answer: "A typical 2,000 sq ft home with a SEER 14 central system at $0.16/kWh runs about $87 a month in a 4-month season — roughly $347 total. Costs scale with home size, SEER rating, thermostat setting, and local electricity rates, all of which you can adjust here." },
    { question: "What does SEER mean and why does it matter?", answer: "SEER (Seasonal Energy Efficiency Ratio) measures cooling output per unit of electricity — higher is more efficient. A SEER 20 system uses 30% less electricity than a SEER 14 for the same cooling, because usage scales inversely with the ratio (14 ÷ SEER). Modern minimums are SEER 13–15; top units reach 20–25." },
    { question: "Is it cheaper to use window units than central AC?", answer: "Window units are cheaper to buy but less efficient to run — roughly 8.5 kWh per sq ft per year vs 6.5 for central, because they reject heat less effectively and often cool only part of the home. If you cool only one or two rooms, window units win; whole-house cooling favors central." },
    { question: "How much does raising the thermostat save?", answer: "Each degree you raise the thermostat cuts cooling energy by roughly 3%. Moving from a 70°F to a 78°F setting (the 'warm' option) reduces usage about 15–25% — on a $350 season that's $60–90 saved. A programmable or smart thermostat applies this automatically while you're away." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Home Cooling Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Cooling Cost Calculator</h1>

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
                <label htmlFor="acType" className={lbl}>Cooling System</label>
                <select id="acType" value={inputs.acType} onChange={(e) => set("acType")(e.target.value)} className={sel}>
                  <option value="central">Central AC</option>
                  <option value="heatpump">Heat Pump</option>
                  <option value="window">Window Units</option>
                  <option value="evap">Evaporative Cooler</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="price" className={lbl}>Electricity Price</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="price" type="number" min="0.01" step="0.01" value={inputs.price} onChange={(e) => set("price")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/kWh</span>
                </div>
                {errors.price && <p className="text-xs text-red-500 font-medium mt-1">{errors.price}</p>}
              </div>
              <div>
                <label htmlFor="months" className={lbl}>Cooling Season</label>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">System Efficiency</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="seer" className={lbl}>SEER Rating</label>
                        <div className={inp}>
                          <input id="seer" type="number" min="8" max="30" value={inputs.seer} onChange={(e) => set("seer")(e.target.value)} className={ci} />
                        </div>
                        {errors.seer && <p className="text-xs text-red-500 font-medium mt-1">{errors.seer}</p>}
                      </div>
                      <div>
                        <label htmlFor="thermostat" className={lbl}>Thermostat Setting</label>
                        <select id="thermostat" value={inputs.thermostat} onChange={(e) => set("thermostat")(e.target.value)} className={sel}>
                          <option value="cool">Cool (70°F)</option>
                          <option value="moderate">Moderate (74°F)</option>
                          <option value="warm">Warm (78°F+)</option>
                        </select>
                      </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Cooling Cost ({inputs.months} mo)</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.monthlyCost.toFixed(2)}/month · ${result.costPerSqft.toFixed(2)}/sq ft · {result.seasonKwh.toFixed(0)} kWh
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Average", `$${result.monthlyCost.toFixed(2)}`],
                ["Season Usage", `${result.seasonKwh.toFixed(0)} kWh`],
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
              <p className="text-xs text-muted-foreground mt-2 text-center">Mid-season months are weighted heavier — the hottest weeks demand the most electricity.</p>
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
            <h2 className="text-2xl font-bold mb-3">Cooling Energy, Modeled Transparently</h2>
            <p>Cooling usage is estimated from per-square-foot benchmarks normalized to a SEER 14 system: 6.5 kWh/sq ft per year for central AC, 5.2 for heat pumps, 8.5 for window units, and just 1.4 for evaporative coolers, which use far less electricity because they chill air with water. SEER and thermostat settings then scale the baseline — the model never hides its assumptions.</p>
            <h2 className="text-2xl font-bold mb-3">SEER: Efficiency You Can Buy</h2>
            <p>Cooling energy scales inversely with SEER, so upgrading from a SEER 14 to a SEER 20 system cuts usage by 30% — the same cooling for less electricity. The trade-off is upfront cost: high-SEER units cost more, but in hot climates the monthly savings usually repay the difference within a few seasons. Enter your system's SEER to see your own number.</p>
            <h2 className="text-2xl font-bold mb-3">Small Settings, Real Savings</h2>
            <p>Thermostat behavior moves the needle more than most people expect: each degree of setback saves about 3% of cooling energy, so a 70°F vs 78°F setting is worth 15–25% of your season total. Combine that with ceiling fans and window shading, and a $350 cooling season can become a $250 one without touching the system.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-cooling-cost-calculator" />
          <PopularCalculators exclude="/calculator/home-cooling-cost-calculator" />
        </div>
      </div>
    </>
  );
}
