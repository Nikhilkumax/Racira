"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface MulchInputs {
  area: number;       // sq ft
  depth: number;      // inches
  mulchType: string;  // "hardwood" | "cedar" | "rubber" | "stone"
  pricePerYard: number; // $/cubic yard
  bagSize: number;    // cu ft per bag
  bagPrice: number;   // $/bag
}

interface MulchResults {
  cubicYards: number;
  bagsNeeded: number;
  bulkCost: number;
  bagCost: number;
  costPerSqft: number;
  chartData: { name: string; cost: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const MULCH_PRICES: Record<string, number> = { hardwood: 35, cedar: 45, rubber: 110, stone: 60 };

function calcMulch(i: MulchInputs): MulchResults {
  const cubicYards = (i.area * (i.depth / 12)) / 27;
  const bagsNeeded = Math.ceil((cubicYards * 27) / Math.max(0.1, i.bagSize));
  const bulkCost = cubicYards * i.pricePerYard;
  const bagCost = bagsNeeded * i.bagPrice;
  const costPerSqft = i.area > 0 ? bulkCost / i.area : 0;

  const chartData = [
    { name: "Bulk (by the yard)", cost: +bulkCost.toFixed(2) },
    { name: "Bags", cost: +bagCost.toFixed(2) },
  ];

  const breakdown = [
    { label: "Area to Cover", value: `${i.area.toLocaleString()} sq ft` },
    { label: "Depth", value: `${i.depth} in` },
    { label: "Volume Needed", value: `${cubicYards.toFixed(2)} cu yd (${(cubicYards * 27).toFixed(1)} cu ft)` },
    { label: `Bags Needed (${i.bagSize} cu ft)`, value: `${bagsNeeded} bags` },
    { label: `Bulk Price ($${i.pricePerYard.toFixed(2)}/yd³)`, value: `$${bulkCost.toFixed(2)}` },
    { label: `Bag Price ($${i.bagPrice.toFixed(2)}/bag)`, value: `$${bagCost.toFixed(2)}` },
    { label: "Total (bulk)", value: `$${bulkCost.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Cost per Sq Ft", value: `$${costPerSqft.toFixed(3)}` },
  ];

  const summaryStats = [
    { label: "Total Cost (bulk)", value: `$${bulkCost.toFixed(2)}` },
    { label: "Total Cost (bags)", value: `$${bagCost.toFixed(2)}` },
    { label: "Cubic Yards Needed", value: `${cubicYards.toFixed(2)}` },
    { label: "Bags Needed", value: `${bagsNeeded}` },
    { label: "Cost per Sq Ft", value: `$${costPerSqft.toFixed(3)}` },
    { label: "Mulch Type", value: i.mulchType.charAt(0).toUpperCase() + i.mulchType.slice(1) },
    { label: "Coverage (3 in)", value: `${((27 * 12) / 3).toFixed(0)} sq ft/yard` },
    { label: "Bulk Savings", value: `${bulkCost > 0 ? Math.round((1 - bagCost / Math.max(bulkCost, 0.01)) * 100) : 0}%` },
  ];

  return { cubicYards, bagsNeeded, bulkCost, bagCost, costPerSqft, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  area: "200",
  depth: "3",
  mulchType: "hardwood",
  pricePerYard: "35",
  bagSize: "2",
  bagPrice: "4.50",
};

// 4. Component
export default function MulchCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<MulchResults>(() => calcMulch({ area: 200, depth: 3, mulchType: "hardwood", pricePerYard: 35, bagSize: 2, bagPrice: 4.5 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcMulch({ area: 200, depth: 3, mulchType: "hardwood", pricePerYard: 35, bagSize: 2, bagPrice: 4.5 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const selectType = (t: string) => setInputs((s) => ({ ...s, mulchType: t, pricePerYard: String(MULCH_PRICES[t] ?? s.pricePerYard) }));

  const calculate = () =>
    setResult(
      calcMulch({
        area: parseFloat(inputs.area) || 0,
        depth: parseFloat(inputs.depth) || 0,
        mulchType: inputs.mulchType,
        pricePerYard: parseFloat(inputs.pricePerYard) || 0,
        bagSize: parseFloat(inputs.bagSize) || 0,
        bagPrice: parseFloat(inputs.bagPrice) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcMulch({ area: 200, depth: 3, mulchType: "hardwood", pricePerYard: 35, bagSize: 2, bagPrice: 4.5 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const area = parseFloat(inputs.area) || 0;
  const depth = parseFloat(inputs.depth) || 0;
  const pricePerYard = parseFloat(inputs.pricePerYard) || 0;
  const bagSize = parseFloat(inputs.bagSize) || 0;
  if (area <= 0) errors.area = "Must be greater than 0";
  if (depth < 1 || depth > 12) errors.depth = "Must be 1–12 in";
  if (pricePerYard <= 0) errors.pricePerYard = "Must be greater than 0";
  if (bagSize <= 0) errors.bagSize = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much mulch do I need?", answer: "Volume = area × depth ÷ 12, converted to cubic yards (÷ 27). A 200 sq ft bed at 3 inches needs 1.85 cubic yards — about 1.9 yards, or 25 bags if buying 2 cu ft bags. For new beds use 3 inches; for refreshing existing mulch, 1.5–2 inches is usually enough." },
    { question: "Is bulk mulch cheaper than bags?", answer: "Almost always. Bulk mulch runs $30–45 per cubic yard delivered, while bags cost $3.50–5.50 per 2 cu ft — which works out to $47–74 per cubic yard. In the defaults, bulk saves about 27%. Bulk wins on price, but bags win on convenience: no delivery minimums and easier handling for small projects." },
    { question: "Which mulch type should I choose?", answer: "Hardwood mulch ($35/yard) is the standard choice — it breaks down and enriches soil but needs topping up yearly. Cedar ($45) resists insects and lasts longer. Rubber ($110) never decomposes, ideal for playgrounds but inert for soil. Stone ($60) lasts indefinitely but retains heat and offers no organic benefit." },
    { question: "How much does one cubic yard of mulch cover?", answer: "One cubic yard covers 108 sq ft at 3 inches deep (27 cu ft ÷ 0.25 ft). At 2 inches it covers 162 sq ft; at 4 inches, 81 sq ft. The calculator reports coverage so you can size your order before delivery — most suppliers sell in whole or half yards." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Mulch Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mulch Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="area" className={lbl}>Area to Cover</label>
                <div className={inp}>
                  <input id="area" type="number" min="1" step="10" value={inputs.area} onChange={(e) => set("area")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                </div>
                {errors.area && <p className="text-xs text-red-500 font-medium mt-1">{errors.area}</p>}
              </div>
              <div>
                <label htmlFor="depth" className={lbl}>Mulch Depth</label>
                <div className={inp}>
                  <input id="depth" type="number" min="1" max="12" step="0.5" value={inputs.depth} onChange={(e) => set("depth")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">in</span>
                </div>
                {errors.depth && <p className="text-xs text-red-500 font-medium mt-1">{errors.depth}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mulchType" className={lbl}>Mulch Type</label>
                <select id="mulchType" value={inputs.mulchType} onChange={(e) => selectType(e.target.value)} className={sel}>
                  <option value="hardwood">Hardwood</option>
                  <option value="cedar">Cedar</option>
                  <option value="rubber">Rubber</option>
                  <option value="stone">Stone / Rock</option>
                </select>
              </div>
              <div>
                <label htmlFor="pricePerYard" className={lbl}>Price per Cubic Yard</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="pricePerYard" type="number" min="1" step="5" value={inputs.pricePerYard} onChange={(e) => set("pricePerYard")(e.target.value)} className={ci} />
                </div>
                {errors.pricePerYard && <p className="text-xs text-red-500 font-medium mt-1">{errors.pricePerYard}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Bags vs Bulk</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="bagSize" className={lbl}>Bag Size</label>
                        <div className={inp}>
                          <input id="bagSize" type="number" min="0.5" max="4" step="0.5" value={inputs.bagSize} onChange={(e) => set("bagSize")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">cu ft</span>
                        </div>
                        {errors.bagSize && <p className="text-xs text-red-500 font-medium mt-1">{errors.bagSize}</p>}
                      </div>
                      <div>
                        <label htmlFor="bagPrice" className={lbl}>Price per Bag</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="bagPrice" type="number" min="0.5" step="0.25" value={inputs.bagPrice} onChange={(e) => set("bagPrice")(e.target.value)} className={ci} />
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Mulch Cost (bulk)</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.bulkCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.cubicYards.toFixed(2)} cu yd · {result.bagsNeeded} bags (${result.bagCost.toFixed(2)}) · ${result.costPerSqft.toFixed(3)}/sq ft
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Cubic Yards", `${result.cubicYards.toFixed(2)}`],
                ["Bags Needed", `${result.bagsNeeded}`],
                ["Cost per Sq Ft", `$${result.costPerSqft.toFixed(3)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Order Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Bulk vs Bags</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {result.bulkCost > 0 && result.bagCost > result.bulkCost ? `Bulk saves ${Math.round((1 - result.bulkCost / result.bagCost) * 100)}% — worth the delivery for large beds.` : "Bags are competitive here — handy for small projects without delivery minimums."}
              </p>
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
            <h2 className="text-2xl font-bold mb-3">Mulch Volume Is Simple Geometry</h2>
            <p>Mulch volume = area × depth ÷ 12 (feet) ÷ 27 (cubic feet per yard). A 200 sq ft bed at 3 inches needs 1.85 cubic yards, and one yard covers 108 sq ft at that depth. Ordering slightly up is safer than down — mulch settles and compacts by 10–20% over the first season.</p>
            <h2 className="text-2xl font-bold mb-3">Bulk vs. Bagged: The Real Difference</h2>
            <p>Bulk mulch costs $30–45 per cubic yard; bags at $4.50 per 2 cu ft cost $61 per cubic yard — about 40% more. Bulk is the clear winner for anything over a few yards, with delivery fees amortized across the order. Bags make sense for small beds, no-truck households, and top-ups where a delivery minimum would be wasteful.</p>
            <h2 className="text-2xl font-bold mb-3">Match the Mulch to the Job</h2>
            <p>Hardwood mulch breaks down into soil organic matter but needs refreshing yearly; cedar resists insects and lasts longer; rubber never decomposes (great for playgrounds, inert for plants); stone lasts indefinitely but traps heat and offers no soil benefit. Price-per-yard differences are wide — the calculator sets realistic defaults for each type.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mulch-cost-calculator" />
          <PopularCalculators exclude="/calculator/mulch-cost-calculator" />
        </div>
      </div>
    </>
  );
}
