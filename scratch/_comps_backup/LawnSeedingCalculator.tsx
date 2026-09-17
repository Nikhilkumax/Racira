"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SeedingInputs {
  area: number;      // sq ft
  seedType: string;  // "kbg" | "fescue" | "rye" | "bermuda" | "mixed"
  rate: number;      // lb per 1,000 sq ft
  bagSize: number;   // lb per bag
  bagPrice: number;  // $/bag
}

interface SeedingResults {
  totalLb: number;
  bagsNeeded: number;
  totalCost: number;
  costPerSqft: number;
  chartData: { name: string; weight: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const SEED_RATES: Record<string, { label: string; rate: number }> = {
  kbg: { label: "Kentucky Bluegrass", rate: 3 },
  fescue: { label: "Tall Fescue", rate: 9 },
  rye: { label: "Perennial Ryegrass", rate: 9 },
  bermuda: { label: "Bermudagrass", rate: 2 },
  mixed: { label: "Mixed Blend", rate: 5 },
};

function calcSeeding(i: SeedingInputs): SeedingResults {
  const totalLb = (i.area / 1000) * i.rate;
  const bagsNeeded = Math.ceil(totalLb / Math.max(0.1, i.bagSize));
  const totalCost = bagsNeeded * i.bagPrice;
  const costPerSqft = i.area > 0 ? totalCost / i.area : 0;

  const chartData = [
    { name: "Seed Needed", weight: +totalLb.toFixed(1) },
    { name: "Bag Weight Bought", weight: +(bagsNeeded * i.bagSize).toFixed(1) },
  ];

  const breakdown = [
    { label: "Lawn Area", value: `${i.area.toLocaleString()} sq ft` },
    { label: "Seed Type", value: SEED_RATES[i.seedType]?.label ?? "—" },
    { label: `Seeding Rate (${i.rate} lb/1,000 sq ft)`, value: `${i.rate} lb` },
    { label: "Seed Needed", value: `${totalLb.toFixed(1)} lb` },
    { label: `Bags Needed (${i.bagSize} lb)`, value: `${bagsNeeded} bags` },
    { label: `Bag Price ($${i.bagPrice.toFixed(2)})`, value: `$${totalCost.toFixed(2)}` },
    { label: "Total Seed Cost", value: `$${totalCost.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Cost per Sq Ft", value: `$${costPerSqft.toFixed(3)}` },
  ];

  const summaryStats = [
    { label: "Seed Needed", value: `${totalLb.toFixed(1)} lb` },
    { label: "Bags Needed", value: `${bagsNeeded}` },
    { label: "Total Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Cost per Sq Ft", value: `$${costPerSqft.toFixed(3)}` },
    { label: "Seed Type", value: SEED_RATES[i.seedType]?.label ?? "—" },
    { label: "Seeding Rate", value: `${i.rate} lb/1,000 sq ft` },
    { label: "Coverage per Bag", value: `${((i.bagSize * 1000) / i.rate).toFixed(0)} sq ft` },
    { label: "Seed per 1,000 sq ft", value: `${i.rate} lb` },
  ];

  return { totalLb, bagsNeeded, totalCost, costPerSqft, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  area: "5000",
  seedType: "kbg",
  rate: "3",
  bagSize: "10",
  bagPrice: "35",
};

// 4. Component
export default function LawnSeedingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<SeedingResults>(() => calcSeeding({ area: 5000, seedType: "kbg", rate: 3, bagSize: 10, bagPrice: 35 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcSeeding({ area: 5000, seedType: "kbg", rate: 3, bagSize: 10, bagPrice: 35 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const selectType = (t: string) => setInputs((s) => ({ ...s, seedType: t, rate: String(SEED_RATES[t]?.rate ?? s.rate) }));

  const calculate = () =>
    setResult(
      calcSeeding({
        area: parseFloat(inputs.area) || 0,
        seedType: inputs.seedType,
        rate: parseFloat(inputs.rate) || 0,
        bagSize: parseFloat(inputs.bagSize) || 0,
        bagPrice: parseFloat(inputs.bagPrice) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcSeeding({ area: 5000, seedType: "kbg", rate: 3, bagSize: 10, bagPrice: 35 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const area = parseFloat(inputs.area) || 0;
  const rate = parseFloat(inputs.rate) || 0;
  const bagSize = parseFloat(inputs.bagSize) || 0;
  if (area <= 0) errors.area = "Must be greater than 0";
  if (rate <= 0) errors.rate = "Must be greater than 0";
  if (bagSize <= 0) errors.bagSize = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much grass seed do I need?", answer: "Seeding rate depends on the grass: Kentucky bluegrass needs about 3 lb per 1,000 sq ft, tall fescue 8–10 lb, ryegrass 8–10 lb, and bermudagrass 1–2 lb (hulled). A 5,000 sq ft lawn of bluegrass needs 15 lb — three 10 lb bags or one 20 lb bag. The calculator applies the right rate when you pick the grass type." },
    { question: "Why do fescue and ryegrass need so much more seed?", answer: "Bunch-type grasses like fescue and ryegrass tiller from the base and fill in more slowly, so they're sown at 8–10 lb per 1,000 sq ft. Kentucky bluegrass and bermudagrass spread by rhizomes and stolons, so they need less seed — the plants themselves do the spreading. Mixing types means using the blend's label rate." },
    { question: "Should I overseed or start a new lawn?", answer: "New lawns and bare patches use the full rate; overseeding an existing lawn uses half to two-thirds of it — bluegrass overseeding drops to about 1.5–2 lb per 1,000 sq ft. If you're overseeding, set the rate manually to the lower number to avoid wasting seed." },
    { question: "When is the best time to seed?", answer: "Cool-season grasses (bluegrass, fescue, ryegrass) germinate best in early fall when soil is warm but air is cool, or early spring as a second choice. Warm-season grasses (bermudagrass) go down in late spring. Seed needs consistent moisture for the first 2–3 weeks — that schedule matters more than any rate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Lawn Seeding Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lawn Seeding Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="area" className={lbl}>Lawn Area</label>
                <div className={inp}>
                  <input id="area" type="number" min="1" step="100" value={inputs.area} onChange={(e) => set("area")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                </div>
                {errors.area && <p className="text-xs text-red-500 font-medium mt-1">{errors.area}</p>}
              </div>
              <div>
                <label htmlFor="seedType" className={lbl}>Grass Type</label>
                <select id="seedType" value={inputs.seedType} onChange={(e) => selectType(e.target.value)} className={sel}>
                  {Object.entries(SEED_RATES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="rate" className={lbl}>Seeding Rate</label>
              <div className={inp}>
                <input id="rate" type="number" min="0.5" step="0.5" value={inputs.rate} onChange={(e) => set("rate")(e.target.value)} className={ci} />
                <span className="pr-3 text-muted-foreground text-sm">lb / 1,000 sq ft</span>
              </div>
              {errors.rate && <p className="text-xs text-red-500 font-medium mt-1">{errors.rate}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Seed Purchase</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="bagSize" className={lbl}>Bag Size</label>
                        <div className={inp}>
                          <input id="bagSize" type="number" min="1" step="1" value={inputs.bagSize} onChange={(e) => set("bagSize")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">lb</span>
                        </div>
                        {errors.bagSize && <p className="text-xs text-red-500 font-medium mt-1">{errors.bagSize}</p>}
                      </div>
                      <div>
                        <label htmlFor="bagPrice" className={lbl}>Price per Bag</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="bagPrice" type="number" min="1" step="5" value={inputs.bagPrice} onChange={(e) => set("bagPrice")(e.target.value)} className={ci} />
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Seed Needed</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.totalLb.toFixed(1)} <span className="text-xl text-muted-foreground">lb</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.bagsNeeded} bag(s) · ${result.totalCost.toFixed(2)} total · {SEED_RATES[inputs.seedType]?.label ?? ""}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Bags Needed", `${result.bagsNeeded}`],
                ["Total Cost", `$${result.totalCost.toFixed(2)}`],
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
              <h3 className="text-base font-bold mb-4">Seed Needed vs Bought</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v} lb`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="weight" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Bags only come whole — the small overage is the buffer for patch repairs.</p>
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
            <h2 className="text-2xl font-bold mb-3">Rates Are Grass-Specific</h2>
            <p>Seed quantity is area times rate: (sq ft ÷ 1,000) × pounds per 1,000 sq ft. The rate is where grass types diverge — spreading grasses like Kentucky bluegrass and bermudagrass need only 2–3 lb per 1,000 sq ft, while bunch-type fescue and ryegrass need 8–10 lb because each plant must fill its own space. Pick your grass type and the calculator sets the correct rate.</p>
            <h2 className="text-2xl font-bold mb-3">Bags Are the Practical Unit</h2>
            <p>Seed is sold in bags — 3, 10, 20, or 50 lb — so the real question is how many bags to carry home. Divide total pounds by bag size and round up: a 5,000 sq ft bluegrass lawn (15 lb) means two 10 lb bags or one 20 lb bag. The extra pound or two is the patch-repair buffer you'll want after the first season.</p>
            <h2 className="text-2xl font-bold mb-3">Timing Beats Rate</h2>
            <p>No seeding rate fixes a lawn seeded in the wrong season. Cool-season grasses germinate best in early fall; warm-season in late spring. After sowing, the first 2–3 weeks of consistent moisture decide the outcome — seed that dries out once is seed that dies. Budget the rate, but schedule the moisture.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lawn-seeding-calculator" />
          <PopularCalculators exclude="/calculator/lawn-seeding-calculator" />
        </div>
      </div>
    </>
  );
}
