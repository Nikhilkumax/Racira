"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SoilInputs {
  pots: number;
  diameter: number;  // in
  depth: number;     // in
  shape: string;     // "round" | "square"
  fillPct: number;   // % of pot volume filled
  bagSize: number;   // cu ft per bag
  bagPrice: number;  // $/bag
}

interface SoilResults {
  potVolumeCuFt: number;
  totalCuFt: number;
  totalQuarts: number;
  bagsNeeded: number;
  totalCost: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const CUFT_PER_GALLON = 7.48;
const QUARTS_PER_CUFT = 25.71;

function calcSoil(i: SoilInputs): SoilResults {
  const r = i.diameter / 2;
  const crossSection = i.shape === "round" ? Math.PI * r * r : i.diameter * i.diameter;
  const potVolumeCuIn = crossSection * i.depth;
  const potVolumeCuFt = potVolumeCuIn / 1728;
  const totalCuFt = potVolumeCuFt * i.pots * (i.fillPct / 100);
  const totalQuarts = totalCuFt * QUARTS_PER_CUFT;
  const bagsNeeded = Math.ceil(totalCuFt / Math.max(0.1, i.bagSize));
  const totalCost = bagsNeeded * i.bagPrice;

  const chartData = [
    { name: "Soil Needed", value: +totalCuFt.toFixed(1) },
    { name: "Bags Bought", value: +(bagsNeeded * i.bagSize).toFixed(1) },
  ];

  const breakdown = [
    { label: "Pots to Fill", value: `${i.pots}` },
    { label: "Pot Size", value: `${i.diameter} in ${i.shape === "round" ? "round" : "square"} × ${i.depth} in deep` },
    { label: "Volume per Pot", value: `${potVolumeCuFt.toFixed(2)} cu ft` },
    { label: `Fill Level (${i.fillPct}%)`, value: `${i.fillPct}%` },
    { label: "Total Soil Needed", value: `${totalCuFt.toFixed(2)} cu ft (${totalQuarts.toFixed(0)} qt)`, highlight: true, isTotal: true },
    { label: `Bags Needed (${i.bagSize} cu ft)`, value: `${bagsNeeded} bags` },
    { label: `Bag Price ($${i.bagPrice.toFixed(2)})`, value: `$${totalCost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Total Soil", value: `${totalCuFt.toFixed(2)} cu ft` },
    { label: "Quarts", value: `${totalQuarts.toFixed(0)} qt` },
    { label: "Bags Needed", value: `${bagsNeeded}` },
    { label: "Total Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Volume per Pot", value: `${potVolumeCuFt.toFixed(2)} cu ft` },
    { label: "Pots", value: `${i.pots}` },
    { label: "Fill Level", value: `${i.fillPct}%` },
    { label: "Cost per Pot", value: `$${(totalCost / i.pots).toFixed(2)}` },
  ];

  return { potVolumeCuFt, totalCuFt, totalQuarts, bagsNeeded, totalCost, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  pots: "5",
  diameter: "10",
  depth: "8",
  shape: "round",
  fillPct: "90",
  bagSize: "1.5",
  bagPrice: "8",
};

// 4. Component
export default function PottingSoilCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<SoilResults>(() => calcSoil({ pots: 5, diameter: 10, depth: 8, shape: "round", fillPct: 90, bagSize: 1.5, bagPrice: 8 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcSoil({ pots: 5, diameter: 10, depth: 8, shape: "round", fillPct: 90, bagSize: 1.5, bagPrice: 8 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcSoil({
        pots: parseFloat(inputs.pots) || 0,
        diameter: parseFloat(inputs.diameter) || 0,
        depth: parseFloat(inputs.depth) || 0,
        shape: inputs.shape,
        fillPct: parseFloat(inputs.fillPct) || 0,
        bagSize: parseFloat(inputs.bagSize) || 0,
        bagPrice: parseFloat(inputs.bagPrice) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcSoil({ pots: 5, diameter: 10, depth: 8, shape: "round", fillPct: 90, bagSize: 1.5, bagPrice: 8 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const pots = parseFloat(inputs.pots) || 0;
  const diameter = parseFloat(inputs.diameter) || 0;
  const depth = parseFloat(inputs.depth) || 0;
  const fillPct = parseFloat(inputs.fillPct) || 0;
  if (pots < 1 || pots > 500) errors.pots = "Must be 1–500";
  if (diameter <= 0) errors.diameter = "Must be greater than 0";
  if (depth <= 0) errors.depth = "Must be greater than 0";
  if (fillPct < 25 || fillPct > 100) errors.fillPct = "Must be 25–100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much potting soil do I need for a 10-inch pot?", answer: "A 10-inch round pot 8 inches deep holds about 0.36 cubic feet of soil at a 90% fill — roughly 9.3 quarts. Five such pots need 1.8 cubic feet: two 1.5 cu ft bags. The formula is πr² × depth for round pots, converted from cubic inches (÷ 1,728) to cubic feet." },
    { question: "What's the difference between potting soil and garden soil?", answer: "Potting mix is engineered for containers: light, aerated, and fast-draining, usually with perlite or bark. Garden soil compacts in pots and suffocates roots. For containers, always use potting mix — the calculator's bag sizes assume standard 1.5 cu ft retail bags of potting mix." },
    { question: "Why shouldn't I fill pots to the brim?", answer: "Leave 1–2 inches of headroom so water has a reservoir instead of running off, and so the soil doesn't wash over the rim when you water. The 90% default fill reflects this; seeds and small transplants may also need less. The fill field adjusts the total accordingly." },
    { question: "How do I convert between quarts and cubic feet?", answer: "One cubic foot equals 25.71 quarts — bags often list quarts (e.g., a 1.5 cu ft bag is about 40 quarts). The calculator reports both units so you can compare bag labels that use either, and it always rounds up to whole bags." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Potting Soil Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Potting Soil Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pots" className={lbl}>Number of Pots</label>
                <div className={inp}>
                  <input id="pots" type="number" min="1" max="500" value={inputs.pots} onChange={(e) => set("pots")(e.target.value)} className={ci} />
                </div>
                {errors.pots && <p className="text-xs text-red-500 font-medium mt-1">{errors.pots}</p>}
              </div>
              <div>
                <label htmlFor="diameter" className={lbl}>Pot Diameter</label>
                <div className={inp}>
                  <input id="diameter" type="number" min="1" step="0.5" value={inputs.diameter} onChange={(e) => set("diameter")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.diameter && <p className="text-xs text-red-500 font-medium mt-1">{errors.diameter}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="depth" className={lbl}>Pot Depth</label>
                <div className={inp}>
                  <input id="depth" type="number" min="1" step="0.5" value={inputs.depth} onChange={(e) => set("depth")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.depth && <p className="text-xs text-red-500 font-medium mt-1">{errors.depth}</p>}
              </div>
              <div>
                <label htmlFor="shape" className={lbl}>Pot Shape</label>
                <select id="shape" value={inputs.shape} onChange={(e) => set("shape")(e.target.value)} className={sel}>
                  <option value="round">Round</option>
                  <option value="square">Square / Box</option>
                </select>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Fill & Purchase</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="fillPct" className={lbl}>Fill Level</label>
                        <div className={inp}>
                          <input id="fillPct" type="number" min="25" max="100" step="5" value={inputs.fillPct} onChange={(e) => set("fillPct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.fillPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.fillPct}</p>}
                      </div>
                      <div>
                        <label htmlFor="bagSize" className={lbl}>Bag Size</label>
                        <div className={inp}>
                          <input id="bagSize" type="number" min="0.5" max="3" step="0.5" value={inputs.bagSize} onChange={(e) => set("bagSize")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">cu ft</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="bagPrice" className={lbl}>Price per Bag</label>
                      <div className={inp}>
                        <span className="pl-3 text-muted-foreground text-sm">$</span>
                        <input id="bagPrice" type="number" min="0.5" step="0.5" value={inputs.bagPrice} onChange={(e) => set("bagPrice")(e.target.value)} className={ci} />
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Soil Needed</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.totalCuFt.toFixed(2)} <span className="text-xl text-muted-foreground">cu ft</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.totalQuarts.toFixed(0)} qt · {result.bagsNeeded} bag(s) · ${result.totalCost.toFixed(2)} total
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Quarts", `${result.totalQuarts.toFixed(0)} qt`],
                ["Bags Needed", `${result.bagsNeeded}`],
                ["Total Cost", `$${result.totalCost.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Volume Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Soil Needed vs Bags Bought</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                  <Tooltip formatter={(v: number) => `${v} cu ft`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Bags are whole units — the surplus covers repotting and top-ups.</p>
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
            <h2 className="text-2xl font-bold mb-3">Pot Volume Is Geometry</h2>
            <p>A round pot is a cylinder: π × radius² × depth, converted from cubic inches to cubic feet (÷ 1,728). A square pot is side² × depth. A 10-inch round pot, 8 inches deep, holds 0.36 cu ft — about 9.3 quarts. The calculator does the unit conversions so you can compare any pot to any bag label.</p>
            <h2 className="text-2xl font-bold mb-3">Bags Are Sold in Two Languages</h2>
            <p>Retail potting mix comes in 1.5–2 cu ft bags, often also labeled in quarts (1.5 cu ft ≈ 40 qt). Buying one bag for five 10-inch pots fails; buying two bags for one 12-inch pot leaves you storing soil. The calculator converts to both units and rounds up to whole bags, so the trip to the garden center happens once.</p>
            <h2 className="text-2xl font-bold mb-3">Fill Is a Feature, Not Waste</h2>
            <p>The 90% default isn't under-filling — it's the headroom that keeps water in the pot instead of over the rim and prevents soil washing out during watering. Fill level is adjustable: seeds start lower, established transplants can go near-full, and the total adjusts automatically.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/potting-soil-calculator" />
          <PopularCalculators exclude="/calculator/potting-soil-calculator" />
        </div>
      </div>
    </>
  );
}
