"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SpacingInputs {
  length: number;   // ft
  width: number;    // ft
  spacing: number;  // in between plants
  rowSpacing: number; // in between rows
  inset: number;    // in from edges
  arrangement: string; // "square" | "staggered"
}

interface SpacingResults {
  plantsPerRow: number;
  rows: number;
  totalPlants: number;
  plantsPerSqft: number;
  chartData: { name: string; plants: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcSpacing(i: SpacingInputs): SpacingResults {
  const usableLength = Math.max(0, i.length * 12 - 2 * i.inset);
  const usableWidth = Math.max(0, i.width * 12 - 2 * i.inset);
  const plantsPerRow = Math.max(0, Math.floor(usableLength / i.spacing) + 1);
  const rows = Math.max(0, Math.floor(usableWidth / i.rowSpacing) + 1);
  const totalPlants = plantsPerRow * rows;
  const areaSqft = i.length * i.width;
  const plantsPerSqft = areaSqft > 0 ? totalPlants / areaSqft : 0;

  // Staggered (hexagonal) packing fits about 15.5% more plants in the same space
  const staggeredTotal = Math.round(totalPlants * 1.155);

  const chartData = [
    { name: "Square Grid", plants: totalPlants },
    { name: "Staggered", plants: staggeredTotal },
  ];

  const breakdown = [
    { label: "Garden Size", value: `${i.length} ft × ${i.width} ft` },
    { label: `Plant Spacing (${i.spacing} in)`, value: `${i.spacing} in` },
    { label: `Row Spacing (${i.rowSpacing} in)`, value: `${i.rowSpacing} in` },
    { label: `Border Inset (${i.inset} in)`, value: `${i.inset} in` },
    { label: "Plants per Row", value: `${plantsPerRow}` },
    { label: "Number of Rows", value: `${rows}` },
    { label: "Total Plants (square grid)", value: `${totalPlants}`, highlight: true, isTotal: true },
    { label: "Plants per Sq Ft", value: `${plantsPerSqft.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Total Plants", value: `${totalPlants}` },
    { label: "Staggered Layout", value: `${staggeredTotal} (+${staggeredTotal - totalPlants})` },
    { label: "Plants per Row", value: `${plantsPerRow}` },
    { label: "Rows", value: `${rows}` },
    { label: "Plants per Sq Ft", value: `${plantsPerSqft.toFixed(2)}` },
    { label: "Spacing", value: `${i.spacing} in` },
    { label: "Row Spacing", value: `${i.rowSpacing} in` },
    { label: "Arrangement", value: i.arrangement === "staggered" ? "Staggered" : "Square grid" },
  ];

  return { plantsPerRow, rows, totalPlants, plantsPerSqft, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  length: "10",
  width: "5",
  spacing: "12",
  rowSpacing: "12",
  inset: "6",
  arrangement: "square",
};

// 4. Component
export default function PlantSpacingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<SpacingResults>(() => calcSpacing({ length: 10, width: 5, spacing: 12, rowSpacing: 12, inset: 6, arrangement: "square" }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcSpacing({ length: 10, width: 5, spacing: 12, rowSpacing: 12, inset: 6, arrangement: "square" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcSpacing({
        length: parseFloat(inputs.length) || 0,
        width: parseFloat(inputs.width) || 0,
        spacing: parseFloat(inputs.spacing) || 0,
        rowSpacing: parseFloat(inputs.rowSpacing) || 0,
        inset: parseFloat(inputs.inset) || 0,
        arrangement: inputs.arrangement,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcSpacing({ length: 10, width: 5, spacing: 12, rowSpacing: 12, inset: 6, arrangement: "square" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const length = parseFloat(inputs.length) || 0;
  const width = parseFloat(inputs.width) || 0;
  const spacing = parseFloat(inputs.spacing) || 0;
  const rowSpacing = parseFloat(inputs.rowSpacing) || 0;
  const inset = parseFloat(inputs.inset) || 0;
  if (length <= 0) errors.length = "Must be greater than 0";
  if (width <= 0) errors.width = "Must be greater than 0";
  if (spacing <= 0) errors.spacing = "Must be greater than 0";
  if (rowSpacing <= 0) errors.rowSpacing = "Must be greater than 0";
  if (inset < 0) errors.inset = "Must be ≥ 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How many plants fit in a 10×5 ft garden?", answer: "With 12-inch spacing and a 6-inch border inset, a 10×5 ft bed fits 9 plants per row × 4 rows = 36 plants. The math: usable feet ÷ spacing + 1 per row, rounded down. Staggering rows in a hexagonal pattern fits about 15% more — 42 plants in the same space." },
    { question: "What spacing should I use for vegetables?", answer: "Follow the seed packet or plant tag: tomatoes 18–24 in, peppers 18 in, lettuce 6–8 in, carrots 2–3 in, and most herbs 12 in. Spacing too tight starves the roots and invites disease from poor airflow; too loose wastes bed space. The calculator takes whatever spacing your plants need." },
    { question: "Should I use square or staggered spacing?", answer: "Square grids are easier to plan and weed in straight rows. Staggered (hexagonal) packing fits more plants — about 15.5% more by geometry — and is ideal for beds where you want dense ground cover or maximum yield. The calculator shows both counts so you can compare before planting." },
    { question: "Why leave a border inset?", answer: "Plants at the very edge of a bed get trampled, shaded by paths, or lost to the lawn edge. A 6-inch inset keeps the outermost plants fully inside the bed's soil. Set it to 0 if your bed has solid borders and you want every inch of planting space." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Plant Spacing Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Plant Spacing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="length" className={lbl}>Garden Length</label>
                <div className={inp}>
                  <input id="length" type="number" min="0.5" step="0.5" value={inputs.length} onChange={(e) => set("length")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.length && <p className="text-xs text-red-500 font-medium mt-1">{errors.length}</p>}
              </div>
              <div>
                <label htmlFor="width" className={lbl}>Garden Width</label>
                <div className={inp}>
                  <input id="width" type="number" min="0.5" step="0.5" value={inputs.width} onChange={(e) => set("width")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.width && <p className="text-xs text-red-500 font-medium mt-1">{errors.width}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="spacing" className={lbl}>Plant Spacing</label>
                <div className={inp}>
                  <input id="spacing" type="number" min="1" step="1" value={inputs.spacing} onChange={(e) => set("spacing")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.spacing && <p className="text-xs text-red-500 font-medium mt-1">{errors.spacing}</p>}
              </div>
              <div>
                <label htmlFor="rowSpacing" className={lbl}>Row Spacing</label>
                <div className={inp}>
                  <input id="rowSpacing" type="number" min="1" step="1" value={inputs.rowSpacing} onChange={(e) => set("rowSpacing")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.rowSpacing && <p className="text-xs text-red-500 font-medium mt-1">{errors.rowSpacing}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Layout</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="inset" className={lbl}>Border Inset</label>
                        <div className={inp}>
                          <input id="inset" type="number" min="0" step="1" value={inputs.inset} onChange={(e) => set("inset")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">in</span>
                        </div>
                        {errors.inset && <p className="text-xs text-red-500 font-medium mt-1">{errors.inset}</p>}
                      </div>
                      <div>
                        <label htmlFor="arrangement" className={lbl}>Arrangement</label>
                        <select id="arrangement" value={inputs.arrangement} onChange={(e) => set("arrangement")(e.target.value)} className={sel}>
                          <option value="square">Square grid</option>
                          <option value="staggered">Staggered</option>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Number of Plants</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.totalPlants}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.plantsPerRow} per row × {result.rows} rows · {result.plantsPerSqft.toFixed(2)} per sq ft · staggered fits {Math.round(result.totalPlants * 1.155)} plants
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Plants per Row", `${result.plantsPerRow}`],
                ["Rows", `${result.rows}`],
                ["Plants per Sq Ft", `${result.plantsPerSqft.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Layout Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Square vs Staggered</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v} plants`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="plants" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Hexagonal staggering packs ~15.5% more plants — ideal for dense beds, harder to weed.</p>
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
            <h2 className="text-2xl font-bold mb-3">Spacing Is Simple Division</h2>
            <p>Plants per row = usable length ÷ spacing + 1, rounded down — the +1 because a plant goes in each corner. Rows work the same on the width axis, and the border inset shrinks both usable dimensions. For a 10×5 ft bed at 12-inch spacing with a 6-inch inset, that's 9 plants per row and 4 rows: 36 plants.</p>
            <h2 className="text-2xl font-bold mb-3">The Staggered Bonus</h2>
            <p>Shifting alternate rows half a spacing creates the hexagonal packing pattern, which is the densest way to arrange circles in a plane — about 15.5% more plants than a square grid. It's the difference between 36 and 42 plants in the same bed. The trade-off: staggered beds are harder to weed in straight lines.</p>
            <h2 className="text-2xl font-bold mb-3">Spacing Rules Are Root Rules</h2>
            <p>The distance between plants is really about how much soil each root system needs and how much air each canopy requires. Seed-packet spacing exists because plants packed too tightly compete for water and light and breed fungal disease. When in doubt, round spacing up — crowded plants yield less than well-spaced ones.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/plant-spacing-calculator" />
          <PopularCalculators exclude="/calculator/plant-spacing-calculator" />
        </div>
      </div>
    </>
  );
}
