"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, Coffee } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
interface CoffeeInputs {
  coffeeGrams: string;
  waterMl: string;
}

interface CoffeeResult {
  coffeeGrams: number;
  waterMl: number;
  ratio: number; // water : coffee (1:X)
  gramsPerLiter: number;
  cups: number;
  strength: string;
  strengthColor: string;
  pieData: { name: string; value: number; pct: number; color: string }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation ───────────────────────────────────────────────────
function strengthBand(ratio: number): { text: string; color: string } {
  if (ratio <= 4) return { text: "Espresso strength", color: "text-red-500" };
  if (ratio <= 10) return { text: "Strong", color: "text-amber-600" };
  if (ratio <= 15) return { text: "Balanced-strong", color: "text-amber-600" };
  if (ratio <= 18) return { text: "Balanced (golden ratio)", color: "text-emerald-600" };
  if (ratio <= 22) return { text: "Mild", color: "text-emerald-600" };
  return { text: "Weak", color: "text-muted-foreground" };
}

function calculateCoffee(inputs: CoffeeInputs): CoffeeResult {
  const empty: CoffeeResult = {
    coffeeGrams: 0, waterMl: 0, ratio: 0, gramsPerLiter: 0, cups: 0,
    strength: "", strengthColor: "", pieData: [], isError: true,
  };
  const g = parseFloat(inputs.coffeeGrams);
  const w = parseFloat(inputs.waterMl);
  if (isNaN(g) || isNaN(w)) {
    return { ...empty, errorMsg: "Please enter valid numbers for coffee and water." };
  }
  if (g <= 0 || w <= 0) {
    return { ...empty, errorMsg: "Coffee and water must both be greater than zero." };
  }

  const ratio = w / g;
  const gramsPerLiter = (g / w) * 1000;
  const cups = w / 250;
  const band = strengthBand(ratio);
  const total = g + w;
  const coffeePct = (g / total) * 100;
  const waterPct = 100 - coffeePct;

  return {
    coffeeGrams: g,
    waterMl: w,
    ratio,
    gramsPerLiter,
    cups,
    strength: band.text,
    strengthColor: band.color,
    pieData: [
      { name: "Coffee", value: g, pct: +coffeePct.toFixed(1), color: "hsl(var(--primary))" },
      { name: "Water", value: w, pct: +waterPct.toFixed(1), color: "#10b981" },
    ],
    isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: CoffeeInputs = { coffeeGrams: "30", waterMl: "500" };

const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const CompactInput = ({
  id, label, value, onChange, suffix,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
      />
      <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const CoffeeStrengthCalculator = () => {
  const [inputs, setInputs] = useState<CoffeeInputs>(DEFAULTS);
  const [result, setResult] = useState<CoffeeResult>(() => calculateCoffee(DEFAULTS));

  useEffect(() => {
    setResult(calculateCoffee(DEFAULTS));
  }, []);

  const handleChange = (key: keyof CoffeeInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));
  const handleCalculate = () => setResult(calculateCoffee(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCoffee(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "What is the golden ratio for coffee?", answer: "The Specialty Coffee Association's golden ratio is about 60 grams of coffee per liter of water — a 1:16.7 brew ratio. Many brewers prefer anywhere from 1:15 (stronger) to 1:18 (milder) depending on the bean and method. This calculator labels ratios of 1:15–1:18 as 'balanced'." },
    { question: "How do I read the brew ratio?", answer: "The ratio '1:16.7' means one part coffee to 16.7 parts water by weight. With 30 g of coffee and 500 mL of water, you get 30 × 16.7 ≈ 500. Lower ratios (like 1:12) make stronger coffee; higher ratios (1:20) make weaker coffee." },
    { question: "Should I weigh coffee or use scoops?", answer: "Weigh your coffee. A 'tablespoon' or 'scoop' of ground coffee varies with grind size and bean density, while grams are exact. Weighing water is also more precise than cup markings — 1 mL of water weighs 1 g, so the same kitchen scale works for both." },
    { question: "Why does my coffee taste bitter or weak?", answer: "If it tastes bitter, the ratio may be too high (too much coffee per water), the grind too fine, or the water too hot. If it tastes weak, increase the coffee dose — try moving from 1:18 toward 1:15. Adjust one variable at a time so you know what changed the flavor." },
    { question: "How many cups does this make?", answer: "This calculator counts a cup as 250 mL (about 8.5 oz). 500 mL of water yields 2 cups. Espresso cups, mugs, and travel cups all hold different volumes, so adjust for your actual mug size." },
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Coffee Strength Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Coffee Strength Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="coffee-grams" label="Coffee" value={inputs.coffeeGrams} onChange={(v) => handleChange("coffeeGrams", v)} suffix="g" />
              <CompactInput id="water-ml" label="Water" value={inputs.waterMl} onChange={(v) => handleChange("waterMl", v)} suffix="mL" />
            </div>
            <p className="text-xs text-muted-foreground -mt-1">Weigh both for accuracy — 1 mL of water = 1 g.</p>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 print-section">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Brew Ratio</div>
                  <div className="text-4xl font-bold text-primary">
                    1:{fmt(result.ratio)} <span className="text-xl">water : coffee</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className={`font-semibold ${result.strengthColor}`}>{result.strength}</span> · {fmt(result.gramsPerLiter)} g/L
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Coffee Dose", value: `${fmt(result.coffeeGrams)} g`, color: "text-foreground" },
                    { label: "Water Volume", value: `${fmt(result.waterMl, 0)} mL`, color: "text-foreground" },
                    { label: "Cups (250 mL)", value: fmt(result.cups, 1), color: "text-primary" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Brew Profile</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Coffee Dose", value: `${fmt(result.coffeeGrams)} g` },
                        { label: "Water Volume", value: `${fmt(result.waterMl, 0)} mL (${fmt(result.waterMl, 0)} g)` },
                        { label: "Brew Ratio", value: `1:${fmt(result.ratio)}` },
                        { label: "Coffee per Liter", value: `${fmt(result.gramsPerLiter)} g/L` },
                        { label: "Strength Rating", value: result.strength, highlight: true },
                        { label: "Servings (250 mL)", value: fmt(result.cups, 1) },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b last:border-0 ${r.highlight ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 text-right font-semibold">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Coffee vs Water by Weight</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-[160px] h-[160px] relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RPie>
                          <Pie data={result.pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">
                            {result.pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: number, name: string) => [`${fmt(v as number, 0)} g`, name]} />
                        </RPie>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
                        <span className="text-sm font-extrabold text-foreground">{fmt(result.coffeeGrams + result.waterMl, 0)} g</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      {result.pieData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground">{fmt(item.value, 0)} g ({item.pct.toFixed(1)}%)</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-[13px] border-t border-border pt-2">
                        <span className="font-semibold text-muted-foreground">Brew Ratio</span>
                        <span className="font-bold text-primary">1:{fmt(result.ratio)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Coffee Dose", value: `${fmt(result.coffeeGrams)} g` },
                      { label: "Water Volume", value: `${fmt(result.waterMl, 0)} mL` },
                      { label: "Brew Ratio", value: `1:${fmt(result.ratio)}` },
                      { label: "Coffee per Liter", value: `${fmt(result.gramsPerLiter)} g/L` },
                      { label: "Strength Rating", value: result.strength },
                      { label: "Servings (250 mL)", value: fmt(result.cups, 1) },
                      { label: "Coffee Share", value: `${result.pieData[0].pct.toFixed(1)}%` },
                      { label: "Water Share", value: `${result.pieData[1].pct.toFixed(1)}%` },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Coffee Strength?</h2>
            <p>Coffee strength is the ratio of coffee to water. The Specialty Coffee Association's golden ratio is roughly 60 grams of coffee per liter of water — about 1:16.7 by weight — which produces a balanced, flavorful cup. Going stronger (toward 1:12) extracts more solids and flavor compounds; going weaker (toward 1:20) yields a lighter brew. This calculator turns your dose and water into the same ratio the pros use.</p>

            <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
            <p>Enter the weight of your ground coffee in grams and the volume of water in milliliters, then click Calculate. The result shows your brew ratio (1:X), grams of coffee per liter of water, how many 250 mL servings that makes, and a strength rating from espresso strength to weak. The ratio is the single number to remember — once you find one you love, replicate it with any batch size.</p>

            <h2 className="text-2xl font-bold mb-3">The Golden Ratio and Dialing In</h2>
            <p>Start at 1:16.7 and adjust from there. If the coffee tastes thin or sour, move toward 1:15 (more coffee). If it tastes harsh or bitter, move toward 1:18 (less coffee). Change only the dose while keeping water fixed so each adjustment teaches you something. Because beans vary — dark roasts dissolve more easily, light roasts extract slower — the right ratio for one bag may not suit the next.</p>

            <h2 className="text-2xl font-bold mb-3">Weighing vs Scooping</h2>
            <p>A kitchen scale removes all guesswork: ground coffee density varies with grind size, so a scoop of fine espresso grind weighs more than the same scoop of coarse filter grind. Weighing water is equally simple since 1 mL of water weighs 1 g — you can tare the carafe on the same scale. Precision here is what separates a repeatable recipe from a lucky cup.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/coffee-strength-calculator" />
          <PopularCalculators exclude="/calculator/coffee-strength-calculator" />
        </div>
      </div>
    </>
  );
};

export default CoffeeStrengthCalculator;
