"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface PoolInputs {
  shape: string;    // "rect" | "oval" | "round" | "irregular"
  length: number;   // ft
  width: number;    // ft
  avgDepth: number; // ft
  waterPrice: number; // $ per 1,000 gallons
}

interface PoolResults {
  cubicFeet: number;
  gallons: number;
  liters: number;
  fillCost: number;
  chartData: { name: string; gallons: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const SHAPE_FACTORS: Record<string, number> = { rect: 7.48, oval: 5.9, round: 5.9, irregular: 4.49 };
const GALLONS_PER_CUBIC_FT = 7.48;

function calcPool(i: PoolInputs): PoolResults {
  const shapeFactor = SHAPE_FACTORS[i.shape] ?? 7.48;
  let baseArea: number;
  if (i.shape === "round") {
    const r = Math.min(i.length, i.width) / 2;
    baseArea = Math.PI * r * r;
  } else {
    baseArea = i.length * i.width;
  }
  const cubicFeet = baseArea * i.avgDepth;
  const gallons = cubicFeet * shapeFactor;
  const liters = gallons * 3.78541;
  const fillCost = (gallons / 1000) * i.waterPrice;

  const chartData = [
    { name: "Rect", gallons: +(i.length * i.width * i.avgDepth * SHAPE_FACTORS.rect).toFixed(0), selected: i.shape === "rect" },
    { name: "Oval", gallons: +(i.length * i.width * i.avgDepth * SHAPE_FACTORS.oval).toFixed(0), selected: i.shape === "oval" },
    { name: "Round", gallons: +((Math.PI * Math.pow(Math.min(i.length, i.width) / 2, 2)) * i.avgDepth * SHAPE_FACTORS.round).toFixed(0), selected: i.shape === "round" },
    { name: "Irregular", gallons: +(i.length * i.width * i.avgDepth * SHAPE_FACTORS.irregular).toFixed(0), selected: i.shape === "irregular" },
  ];

  const breakdown = [
    { label: "Shape", value: i.shape.charAt(0).toUpperCase() + i.shape.slice(1) },
    { label: "Dimensions", value: `${i.length} ft × ${i.width} ft` },
    { label: "Average Depth", value: `${i.avgDepth} ft` },
    { label: "Volume (cubic ft)", value: `${cubicFeet.toFixed(1)} cu ft` },
    { label: "Volume (gallons)", value: `${gallons.toFixed(0)} gal`, highlight: true, isTotal: true },
    { label: "Volume (liters)", value: `${liters.toFixed(0)} L` },
    { label: `Fill Cost ($${i.waterPrice.toFixed(2)}/1,000 gal)`, value: `$${fillCost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Pool Volume", value: `${gallons.toFixed(0)} gal` },
    { label: "Cubic Feet", value: `${cubicFeet.toFixed(1)}` },
    { label: "Liters", value: `${liters.toFixed(0)} L` },
    { label: "Fill Cost", value: `$${fillCost.toFixed(2)}` },
    { label: "Length × Width", value: `${i.length} × ${i.width} ft` },
    { label: "Average Depth", value: `${i.avgDepth} ft` },
    { label: "Surface Area", value: `${baseArea.toFixed(1)} sq ft` },
    { label: "Shape Factor", value: `${shapeFactor} gal/cu ft` },
  ];

  return { cubicFeet, gallons, liters, fillCost, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  shape: "rect",
  length: "20",
  width: "12",
  avgDepth: "5",
  waterPrice: "5.50",
};

// 4. Component
export default function PoolVolumeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PoolResults>(() => calcPool({ shape: "rect", length: 20, width: 12, avgDepth: 5, waterPrice: 5.5 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcPool({ shape: "rect", length: 20, width: 12, avgDepth: 5, waterPrice: 5.5 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcPool({
        shape: inputs.shape,
        length: parseFloat(inputs.length) || 0,
        width: parseFloat(inputs.width) || 0,
        avgDepth: parseFloat(inputs.avgDepth) || 0,
        waterPrice: parseFloat(inputs.waterPrice) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcPool({ shape: "rect", length: 20, width: 12, avgDepth: 5, waterPrice: 5.5 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const length = parseFloat(inputs.length) || 0;
  const width = parseFloat(inputs.width) || 0;
  const avgDepth = parseFloat(inputs.avgDepth) || 0;
  if (length <= 0) errors.length = "Must be greater than 0";
  if (width <= 0) errors.width = "Must be greater than 0";
  if (avgDepth <= 0) errors.avgDepth = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How many gallons is a typical pool?", answer: "A 20×12 ft pool with a 5 ft average depth holds about 8,976 gallons (rectangular). Oval and irregular shapes hold less for the same footprint — roughly 7,080 and 5,390 gallons — because the corners aren't usable. Most residential pools range 10,000–30,000 gallons." },
    { question: "What's the formula for pool volume?", answer: "Gallons = surface area × average depth × 7.48 (gallons per cubic foot). For rectangles, surface area is length × width. The 7.48 factor is the exact conversion: one cubic foot of water holds 7.48 US gallons. Round and oval pools use the ellipse or circle area formula before the same conversion." },
    { question: "How do I find the average depth?", answer: "Measure the shallow and deep ends, then average them: (shallow + deep) ÷ 2. A pool that slopes from 3 to 7 ft has a 5 ft average depth. Using the deep-end number overestimates volume by up to 30%, which matters for chemical dosing — most pool chemicals are dosed per 10,000 gallons." },
    { question: "What does it cost to fill a pool?", answer: "Multiply gallons ÷ 1,000 by your water rate. At $5.50 per 1,000 gallons, an 8,976-gallon pool costs about $49 to fill. If you use a water truck, rates are often $150–300 per 5,000 gallons — several times the municipal rate. Check your utility's tiered pricing before ordering a truck." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Pool Volume Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pool Volume Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="shape" className={lbl}>Pool Shape</label>
                <select id="shape" value={inputs.shape} onChange={(e) => set("shape")(e.target.value)} className={sel}>
                  <option value="rect">Rectangular</option>
                  <option value="oval">Oval</option>
                  <option value="round">Round</option>
                  <option value="irregular">Irregular / Freeform</option>
                </select>
              </div>
              <div>
                <label htmlFor="length" className={lbl}>Length</label>
                <div className={inp}>
                  <input id="length" type="number" min="1" step="0.5" value={inputs.length} onChange={(e) => set("length")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.length && <p className="text-xs text-red-500 font-medium mt-1">{errors.length}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="width" className={lbl}>Width</label>
                <div className={inp}>
                  <input id="width" type="number" min="1" step="0.5" value={inputs.width} onChange={(e) => set("width")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.width && <p className="text-xs text-red-500 font-medium mt-1">{errors.width}</p>}
              </div>
              <div>
                <label htmlFor="avgDepth" className={lbl}>Average Depth</label>
                <div className={inp}>
                  <input id="avgDepth" type="number" min="0.5" step="0.5" value={inputs.avgDepth} onChange={(e) => set("avgDepth")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.avgDepth && <p className="text-xs text-red-500 font-medium mt-1">{errors.avgDepth}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Fill Cost</div>
                    <div>
                      <label htmlFor="waterPrice" className={lbl}>Water Rate</label>
                      <div className={inp}>
                        <span className="pl-3 text-muted-foreground text-sm">$</span>
                        <input id="waterPrice" type="number" min="0.01" step="0.25" value={inputs.waterPrice} onChange={(e) => set("waterPrice")(e.target.value)} className={ci} />
                        <span className="pr-3 text-muted-foreground text-sm">/1,000 gal</span>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pool Volume</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.gallons.toFixed(0)} <span className="text-xl text-muted-foreground">gal</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.cubicFeet.toFixed(0)} cu ft · {result.liters.toFixed(0)} L · ~${result.fillCost.toFixed(2)} to fill
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Cubic Feet", `${result.cubicFeet.toFixed(0)}`],
                ["Liters", `${result.liters.toFixed(0)} L`],
                ["Fill Cost", `$${result.fillCost.toFixed(2)}`],
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
              <h3 className="text-base font-bold mb-4">Gallons by Shape (same footprint)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `${v} gal`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="gallons" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Shape alone can swing volume by 40% at identical length, width, and depth.</p>
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
            <h2 className="text-2xl font-bold mb-3">Volume Is Area × Depth × 7.48</h2>
            <p>Every pool volume calculation is the same shape: surface area times average depth times 7.48 — the exact number of US gallons in a cubic foot of water. What changes with shape is the surface-area formula: rectangles use length × width, round pools use πr², and ovals use the ellipse approximation. Irregular freeform pools average out to about 60% of a rectangle's volume.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Number Matters</h2>
            <p>Pool chemicals are dosed per 10,000 gallons, so a 20% volume error means a 20% dosing error. Sanitizer, shock, and algaecide all scale with true volume — over-dosing wastes money and can irritate swimmers; under-dosing fails to keep the water safe. The average depth (shallow + deep ÷ 2) is the most common input mistake.</p>
            <h2 className="text-2xl font-bold mb-3">Filling Costs Real Money</h2>
            <p>At municipal rates, filling an average residential pool runs $50–150. Water trucks cost more per gallon but are needed where fill times are extreme or utility rates are tiered. Know the volume before you open the tap — the fill-cost line here uses your local rate per 1,000 gallons to turn gallons into dollars.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pool-volume-calculator" />
          <PopularCalculators exclude="/calculator/pool-volume-calculator" />
        </div>
      </div>
    </>
  );
}
