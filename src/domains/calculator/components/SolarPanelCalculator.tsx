"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SolarInputs {
  usage: number;      // kWh/month
  sunHours: number;   // peak sun hours per day
  wattage: number;    // W per panel
  losses: number;     // % system losses
  costPerWatt: number; // $/W installed
}

interface SolarResults {
  dailyKwh: number;
  systemKw: number;
  panels: number;
  monthlyProduction: number;
  systemCost: number;
  chartData: { name: string; kwh: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcSolar(i: SolarInputs): SolarResults {
  const dailyKwh = i.usage / 30;
  const eff = 1 - i.losses / 100;
  const systemKw = eff > 0 ? dailyKwh / i.sunHours / eff : 0;
  const panels = Math.ceil((systemKw * 1000) / Math.max(1, i.wattage));
  const monthlyProduction = (panels * i.wattage * i.sunHours * 30 * eff) / 1000;
  const systemCost = systemKw * 1000 * i.costPerWatt;

  const chartData = [
    { name: "Monthly Usage", kwh: +i.usage.toFixed(0) },
    { name: "Solar Production", kwh: +monthlyProduction.toFixed(0) },
  ];

  const breakdown = [
    { label: "Monthly Usage", value: `${i.usage.toLocaleString()} kWh` },
    { label: "Daily Usage", value: `${dailyKwh.toFixed(1)} kWh` },
    { label: "Peak Sun Hours", value: `${i.sunHours} hrs/day` },
    { label: `System Losses (${i.losses}%)`, value: `${i.losses}%` },
    { label: "System Size", value: `${systemKw.toFixed(2)} kW` },
    { label: `Panel Wattage (${i.wattage} W)`, value: `${panels} panels` },
    { label: "Estimated Monthly Production", value: `${monthlyProduction.toFixed(0)} kWh`, highlight: true, isTotal: true },
    { label: `Installed Cost ($${i.costPerWatt.toFixed(2)}/W)`, value: `$${systemCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Panels Needed", value: `${panels}` },
    { label: "System Size", value: `${systemKw.toFixed(2)} kW` },
    { label: "Monthly Production", value: `${monthlyProduction.toFixed(0)} kWh` },
    { label: "Daily Production", value: `${(monthlyProduction / 30).toFixed(1)} kWh` },
    { label: "System Cost (pre-incentive)", value: `$${systemCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Roof Area (approx)", value: `${(panels * 17.5).toFixed(0)} sq ft` },
    { label: "Usage Coverage", value: `${Math.min(100, (monthlyProduction / Math.max(1, i.usage)) * 100).toFixed(0)}%` },
    { label: "Peak Sun Hours", value: `${i.sunHours} hrs/day` },
  ];

  return { dailyKwh, systemKw, panels, monthlyProduction, systemCost, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  usage: "900",
  sunHours: "5",
  wattage: "400",
  losses: "20",
  costPerWatt: "2.50",
};

// 4. Component
export default function SolarPanelCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<SolarResults>(() => calcSolar({ usage: 900, sunHours: 5, wattage: 400, losses: 20, costPerWatt: 2.5 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcSolar({ usage: 900, sunHours: 5, wattage: 400, losses: 20, costPerWatt: 2.5 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcSolar({
        usage: parseFloat(inputs.usage) || 0,
        sunHours: parseFloat(inputs.sunHours) || 0,
        wattage: parseFloat(inputs.wattage) || 0,
        losses: parseFloat(inputs.losses) || 0,
        costPerWatt: parseFloat(inputs.costPerWatt) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcSolar({ usage: 900, sunHours: 5, wattage: 400, losses: 20, costPerWatt: 2.5 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const usage = parseFloat(inputs.usage) || 0;
  const sunHours = parseFloat(inputs.sunHours) || 0;
  const wattage = parseFloat(inputs.wattage) || 0;
  const losses = parseFloat(inputs.losses) || 0;
  if (usage <= 0) errors.usage = "Must be greater than 0";
  if (sunHours < 1 || sunHours > 12) errors.sunHours = "Must be 1–12 hrs";
  if (wattage <= 0) errors.wattage = "Must be greater than 0";
  if (losses < 0 || losses > 50) errors.losses = "Must be 0–50%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How many solar panels do I need?", answer: "Divide your daily kWh usage by the energy one panel produces per day: panel watts × peak sun hours × system efficiency. A home using 900 kWh/month (30 kWh/day) with 5 sun hours and 20% losses needs about 18.8 kW of production — at 400 W per panel, that's 19 panels." },
    { question: "What are peak sun hours?", answer: "Peak sun hours are the equivalent daily hours of full-strength sun — 5 peak hours means the sunlight hitting your roof equals 5 hours at 1,000 W/m². The US averages 3.5–6 depending on region: the Southwest tops 6, the Northeast sits near 4. Your utility or a solar calculator for your zip code gives the local number." },
    { question: "Why 20% system losses?", answer: "Solar systems lose power to inverter conversion (~3–5%), high panel temperatures (5–10%), dust and soiling (2–5%), and shading and wiring. A 20% derate is the industry-standard planning figure. The losses field in Advanced Options lets you adjust for a shaded roof (higher) or a premium setup (lower)." },
    { question: "What does a solar system cost?", answer: "US residential solar runs $2.50–3.50 per watt installed before incentives. The 18.8 kW system in the defaults costs about $47,000 before the 30% federal tax credit — roughly $32,900 after. Actual quotes vary widely by region and roofer, and the calculator's figure is a planning estimate, not a bid." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Solar Panel Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Solar Panel Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="usage" className={lbl}>Monthly Electricity Usage</label>
                <div className={inp}>
                  <input id="usage" type="number" min="1" step="50" value={inputs.usage} onChange={(e) => set("usage")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">kWh</span>
                </div>
                {errors.usage && <p className="text-xs text-red-500 font-medium mt-1">{errors.usage}</p>}
              </div>
              <div>
                <label htmlFor="sunHours" className={lbl}>Peak Sun Hours</label>
                <div className={inp}>
                  <input id="sunHours" type="number" min="1" max="12" step="0.5" value={inputs.sunHours} onChange={(e) => set("sunHours")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">hrs/day</span>
                </div>
                {errors.sunHours && <p className="text-xs text-red-500 font-medium mt-1">{errors.sunHours}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wattage" className={lbl}>Panel Wattage</label>
                <div className={inp}>
                  <input id="wattage" type="number" min="50" step="50" value={inputs.wattage} onChange={(e) => set("wattage")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">W</span>
                </div>
                {errors.wattage && <p className="text-xs text-red-500 font-medium mt-1">{errors.wattage}</p>}
              </div>
              <div>
                <label htmlFor="losses" className={lbl}>System Losses</label>
                <div className={inp}>
                  <input id="losses" type="number" min="0" max="50" step="5" value={inputs.losses} onChange={(e) => set("losses")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">%</span>
                </div>
                {errors.losses && <p className="text-xs text-red-500 font-medium mt-1">{errors.losses}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Cost Estimate</div>
                    <div>
                      <label htmlFor="costPerWatt" className={lbl}>Installed Cost per Watt</label>
                      <div className={inp}>
                        <span className="pl-3 text-muted-foreground text-sm">$</span>
                        <input id="costPerWatt" type="number" min="0.5" step="0.25" value={inputs.costPerWatt} onChange={(e) => set("costPerWatt")(e.target.value)} className={ci} />
                        <span className="pr-3 text-muted-foreground text-sm">/W</span>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Solar Panels Needed</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.panels} <span className="text-xl text-muted-foreground">panels</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.systemKw.toFixed(2)} kW system · ~{result.monthlyProduction.toFixed(0)} kWh/month produced · ${result.systemCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} installed
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["System Size", `${result.systemKw.toFixed(2)} kW`],
                ["Monthly Output", `${result.monthlyProduction.toFixed(0)} kWh`],
                ["System Cost", `$${result.systemCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">System Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Usage vs Production</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `${v} kWh`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="kwh" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Production is sized to match usage — net metering or batteries handle the timing mismatch.</p>
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
            <h2 className="text-2xl font-bold mb-3">Sizing Solar in Four Numbers</h2>
            <p>Panel count = daily kWh ÷ (panel watts × sun hours × system efficiency). Monthly usage ÷ 30 gives the daily target; peak sun hours (3.5–6 across the US) say how many full-strength hours the roof sees; and the 20% losses derate accounts for inverters, heat, dust, and wiring. Every input is something you can find on your bill, a solar map, or a panel spec sheet.</p>
            <h2 className="text-2xl font-bold mb-3">The Derate Is Not Optional</h2>
            <p>New solar owners consistently wonder why production runs 15–25% below the panel ratings. It's physics: inverters lose 3–5%, panels run hot in midday sun losing 5–10%, and soiling plus shading nibble the rest. Sizing without the derate produces a system that under-delivers on paper — the calculator bakes the industry-standard 20% in by default.</p>
            <h2 className="text-2xl font-bold mb-3">Cost Before and After Incentives</h2>
            <p>The $/W figure ($2.50–3.50 typical) covers panels, inverters, racking, labor, and permits. The federal Investment Tax Credit rebates 30% of that, and many states and utilities add their own. Use the cost line as a sanity check against installer quotes — a bid wildly above $/W × system size deserves a second opinion.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/solar-panel-calculator" />
          <PopularCalculators exclude="/calculator/solar-panel-calculator" />
        </div>
      </div>
    </>
  );
}
