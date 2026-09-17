"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface RainInputs {
  roofArea: number;    // sq ft
  rainfall: number;    // inches/year
  efficiency: number;  // % runoff captured
  storage: number;     // gallons capacity
  dailyUse: number;    // gallons/day
}

interface RainResults {
  annualGallons: number;
  monthlyAvg: number;
  dailyAvg: number;
  daysOfSupply: number;
  tanksNeeded: number;
  chartData: { name: string; gallons: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const GALLONS_PER_CUBIC_FT = 7.48;
const TANK_SIZE = 1000; // gallons per standard tank

function calcRain(i: RainInputs): RainResults {
  const annualGallons = i.roofArea * (i.rainfall / 12) * GALLONS_PER_CUBIC_FT * (i.efficiency / 100);
  const monthlyAvg = annualGallons / 12;
  const dailyAvg = annualGallons / 365;
  const daysOfSupply = i.dailyUse > 0 ? i.storage / i.dailyUse : 0;
  const tanksNeeded = Math.ceil(annualGallons / TANK_SIZE);

  const chartData = [
    { name: "Annual Harvest", gallons: Math.round(annualGallons) },
    { name: "Storage Capacity", gallons: Math.round(i.storage) },
    { name: "Annual Use", gallons: Math.round(i.dailyUse * 365) },
  ];

  const breakdown = [
    { label: "Roof Area", value: `${i.roofArea.toLocaleString()} sq ft` },
    { label: "Annual Rainfall", value: `${i.rainfall} in` },
    { label: `Runoff Capture (${i.efficiency}%)`, value: `${i.efficiency}%` },
    { label: "Annual Harvest", value: `${annualGallons.toLocaleString(undefined, { maximumFractionDigits: 0 })} gal`, highlight: true, isTotal: true },
    { label: "Monthly Average", value: `${monthlyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })} gal` },
    { label: "Daily Average", value: `${dailyAvg.toFixed(1)} gal` },
    { label: `Storage (${i.storage.toLocaleString()} gal)`, value: `${i.dailyUse > 0 ? `${daysOfSupply.toFixed(1)} days of supply` : "—"}` },
    { label: `Tanks to Store Annual (${TANK_SIZE} gal)`, value: `${tanksNeeded}` },
  ];

  const summaryStats = [
    { label: "Annual Harvest", value: `${annualGallons.toLocaleString(undefined, { maximumFractionDigits: 0 })} gal` },
    { label: "Monthly Average", value: `${monthlyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })} gal` },
    { label: "Daily Average", value: `${dailyAvg.toFixed(1)} gal` },
    { label: "Days of Supply (stored)", value: `${daysOfSupply.toFixed(1)} days` },
    { label: "Tanks Needed", value: `${tanksNeeded}` },
    { label: "Roof Area", value: `${i.roofArea.toLocaleString()} sq ft` },
    { label: "Annual Rainfall", value: `${i.rainfall} in` },
    { label: "Runoff Capture", value: `${i.efficiency}%` },
  ];

  return { annualGallons, monthlyAvg, dailyAvg, daysOfSupply, tanksNeeded, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  roofArea: "1500",
  rainfall: "35",
  efficiency: "85",
  storage: "1000",
  dailyUse: "30",
};

// 4. Component
export default function RainwaterCollectionCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<RainResults>(() => calcRain({ roofArea: 1500, rainfall: 35, efficiency: 85, storage: 1000, dailyUse: 30 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcRain({ roofArea: 1500, rainfall: 35, efficiency: 85, storage: 1000, dailyUse: 30 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcRain({
        roofArea: parseFloat(inputs.roofArea) || 0,
        rainfall: parseFloat(inputs.rainfall) || 0,
        efficiency: parseFloat(inputs.efficiency) || 0,
        storage: parseFloat(inputs.storage) || 0,
        dailyUse: parseFloat(inputs.dailyUse) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRain({ roofArea: 1500, rainfall: 35, efficiency: 85, storage: 1000, dailyUse: 30 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const roofArea = parseFloat(inputs.roofArea) || 0;
  const rainfall = parseFloat(inputs.rainfall) || 0;
  const efficiency = parseFloat(inputs.efficiency) || 0;
  if (roofArea <= 0) errors.roofArea = "Must be greater than 0";
  if (rainfall < 1 || rainfall > 200) errors.rainfall = "Must be 1–200 in";
  if (efficiency < 10 || efficiency > 100) errors.efficiency = "Must be 10–100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much rainwater can I collect?", answer: "Gallons = roof area × (rainfall ÷ 12) × 7.48 × runoff factor. A 1,500 sq ft roof in 35 inches of rain with 85% capture harvests about 27,800 gallons a year — 76 gallons a day on average. For every 1 inch of rain, a 1,500 sq ft roof sheds about 935 gallons before losses." },
    { question: "Why isn't capture 100%?", answer: "Roofs don't shed every drop: some water is absorbed by shingles or moss, some evaporates, some is lost to overshoot and first-flush diversion. Metal roofs capture 90–95%, asphalt shingles 75–90%, and porous surfaces much less. The 85% default reflects a typical shingle roof with a first-flush diverter." },
    { question: "How big should my storage tank be?", answer: "Storage is a budget decision, not a yield decision: a 1,000-gallon tank paired with 30 gallons/day of use gives 33 days of supply, enough to ride out most dry spells. Sizing to store the full annual harvest usually means thousands of gallons of tank — most systems store 1–3 months of expected use and let the rest overflow." },
    { question: "What can harvested rainwater be used for?", answer: "Landscape irrigation is the highest-value use — lawns and gardens consume the most water in most homes. With filtration and treatment, rainwater can serve laundry, toilets, and even potable uses (subject to local codes). Many states incentivize rain barrels and cisterns, and some restrict potable use, so check local regulations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Rainwater Collection Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rainwater Collection Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="roofArea" className={lbl}>Roof Area (catchment)</label>
                <div className={inp}>
                  <input id="roofArea" type="number" min="1" step="100" value={inputs.roofArea} onChange={(e) => set("roofArea")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                </div>
                {errors.roofArea && <p className="text-xs text-red-500 font-medium mt-1">{errors.roofArea}</p>}
              </div>
              <div>
                <label htmlFor="rainfall" className={lbl}>Annual Rainfall</label>
                <div className={inp}>
                  <input id="rainfall" type="number" min="1" max="200" step="1" value={inputs.rainfall} onChange={(e) => set("rainfall")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.rainfall && <p className="text-xs text-red-500 font-medium mt-1">{errors.rainfall}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="efficiency" className={lbl}>Runoff Capture Efficiency</label>
              <div className={inp}>
                <input id="efficiency" type="number" min="10" max="100" step="5" value={inputs.efficiency} onChange={(e) => set("efficiency")(e.target.value)} className={ci} />
                <span className="pr-3 text-muted-foreground text-sm">%</span>
              </div>
              {errors.efficiency && <p className="text-xs text-red-500 font-medium mt-1">{errors.efficiency}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Storage & Usage</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="storage" className={lbl}>Storage Capacity</label>
                        <div className={inp}>
                          <input id="storage" type="number" min="1" step="250" value={inputs.storage} onChange={(e) => set("storage")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">gal</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="dailyUse" className={lbl}>Daily Water Use</label>
                        <div className={inp}>
                          <input id="dailyUse" type="number" min="1" step="5" value={inputs.dailyUse} onChange={(e) => set("dailyUse")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">gal/day</span>
                        </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Collectable Rain</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.annualGallons.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xl text-muted-foreground">gal</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.dailyAvg.toFixed(1)} gal/day average · {result.monthlyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })} gal/month
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Daily Average", `${result.dailyAvg.toFixed(1)} gal`],
                ["Days of Supply", `${result.daysOfSupply.toFixed(1)} days`],
                ["Tanks Needed", `${result.tanksNeeded}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Harvest Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Harvest vs Storage vs Use</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} gal`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="gallons" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Storage rarely matches annual harvest — tanks sized to carry dry spells are the practical target.</p>
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
            <h2 className="text-2xl font-bold mb-3">Every Inch of Rain Counts</h2>
            <p>One inch of rain falling on 1,000 sq ft of roof is 623 gallons of water — enough to run a garden for weeks. The annual harvest equation is simple: roof area × rainfall depth × 7.48 gallons per cubic foot × runoff efficiency. A 1,500 sq ft roof in 35 inches of rain with an 85% capture rate delivers about 27,800 gallons a year.</p>
            <h2 className="text-2xl font-bold mb-3">The Roof Is a Reservoir</h2>
            <p>Roof material sets the ceiling: standing-seam metal captures 90–95% of rainfall, asphalt shingles 75–90%, and tile somewhere between. First-flush diverters sacrifice the first 10–20 gallons of each storm — carrying dust, pollen, and bird droppings — which the capture-efficiency figure accounts for. The rest of the loss is evaporation and overshoot during intense downpours.</p>
            <h2 className="text-2xl font-bold mb-3">Sizing Storage to the Drought</h2>
            <p>The natural instinct is to size tanks to the annual harvest; the practical instinct is to size them to the dry spell. A 1,000-gallon tank at 30 gallons/day of garden use provides 33 days of supply — enough to cover most summer gaps between storms. Overflow during wet months is a feature, not waste: it protects the system and the foundation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rainwater-collection-calculator" />
          <PopularCalculators exclude="/calculator/rainwater-collection-calculator" />
        </div>
      </div>
    </>
  );
}
