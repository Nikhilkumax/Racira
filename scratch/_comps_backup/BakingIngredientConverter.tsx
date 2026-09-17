"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Ingredient =
  | "all-purpose-flour"
  | "whole-wheat-flour"
  | "sugar"
  | "brown-sugar"
  | "butter"
  | "honey"
  | "milk"
  | "cocoa-powder"
  | "oats"
  | "yeast";

type VolumeUnit = "cups" | "ml" | "tbsp" | "tsp" | "fl-oz";
type WeightUnit = "grams" | "oz" | "lb" | "kg";

interface IngredientMeta {
  label: string;
  gramsPerCup: number;
  density: number;
  siftedGramsPerCup: number;
  siftedDensity: number;
  color: string;
}

interface BakingInputs {
  amount: string;
  fromUnit: VolumeUnit;
  ingredient: Ingredient;
  toUnit: WeightUnit;
  sifted: boolean;
  densityOverride: string;
}

interface BakingResult {
  primary: { label: string; value: string };
  statBar: { label: string; value: string }[];
  breakdown: { label: string; value: string }[];
  chartData: { unit: string; value: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

const VOLUME_TO_CUPS: Record<VolumeUnit, number> = {
  cups: 1,
  ml: 1 / 236.588,
  tbsp: 1 / 16,
  tsp: 1 / 48,
  "fl-oz": 1 / 8,
};

const WEIGHT_TO_GRAMS: Record<WeightUnit, number> = {
  grams: 1,
  oz: 28.3495,
  lb: 453.592,
  kg: 1000,
};

const VOLUME_UNIT_META: Record<VolumeUnit, { label: string; symbol: string }> = {
  cups: { label: "Cups", symbol: "cup" },
  ml: { label: "Milliliters", symbol: "mL" },
  tbsp: { label: "Tablespoons", symbol: "tbsp" },
  tsp: { label: "Teaspoons", symbol: "tsp" },
  "fl-oz": { label: "Fluid Ounces", symbol: "fl oz" },
};

const WEIGHT_UNIT_META: Record<WeightUnit, { label: string; symbol: string }> = {
  grams: { label: "Grams", symbol: "g" },
  oz: { label: "Ounces", symbol: "oz" },
  lb: { label: "Pounds", symbol: "lb" },
  kg: { label: "Kilograms", symbol: "kg" },
};

const INGREDIENTS: Record<Ingredient, IngredientMeta> = {
  "all-purpose-flour": { label: "All-Purpose Flour", gramsPerCup: 120, density: 0.55, siftedGramsPerCup: 90, siftedDensity: 0.40, color: "#3b82f6" },
  "whole-wheat-flour": { label: "Whole Wheat Flour", gramsPerCup: 113, density: 0.50, siftedGramsPerCup: 113, siftedDensity: 0.50, color: "#92400e" },
  sugar: { label: "Sugar (Granulated)", gramsPerCup: 200, density: 0.85, siftedGramsPerCup: 200, siftedDensity: 0.85, color: "#10b981" },
  "brown-sugar": { label: "Brown Sugar (Packed)", gramsPerCup: 220, density: 0.95, siftedGramsPerCup: 220, siftedDensity: 0.95, color: "#f59e0b" },
  butter: { label: "Butter", gramsPerCup: 227, density: 0.911, siftedGramsPerCup: 227, siftedDensity: 0.911, color: "#fbbf24" },
  honey: { label: "Honey", gramsPerCup: 340, density: 1.42, siftedGramsPerCup: 340, siftedDensity: 1.42, color: "#f97316" },
  milk: { label: "Milk", gramsPerCup: 240, density: 1.03, siftedGramsPerCup: 240, siftedDensity: 1.03, color: "#06b6d4" },
  "cocoa-powder": { label: "Cocoa Powder", gramsPerCup: 100, density: 0.40, siftedGramsPerCup: 80, siftedDensity: 0.30, color: "#7c2d12" },
  oats: { label: "Oats", gramsPerCup: 80, density: 0.35, siftedGramsPerCup: 80, siftedDensity: 0.35, color: "#84cc16" },
  yeast: { label: "Yeast (Active Dry)", gramsPerCup: 150, density: 0.60, siftedGramsPerCup: 150, siftedDensity: 0.60, color: "#8b5cf6" },
};

const COLORS: string[] = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316"];

function calculateBaking(inputs: BakingInputs): BakingResult {
  const rawAmount = parseFloat(inputs.amount);
  const amount = Number.isFinite(rawAmount) ? Math.max(0, rawAmount) : 0;

  const ingredient = INGREDIENTS[inputs.ingredient] || INGREDIENTS["all-purpose-flour"];
  const sifted = inputs.sifted;

  let gramsPerCup = sifted ? ingredient.siftedGramsPerCup : ingredient.gramsPerCup;
  let density = sifted ? ingredient.siftedDensity : ingredient.density;

  const rawDensity = parseFloat(inputs.densityOverride);
  if (Number.isFinite(rawDensity) && rawDensity > 0) {
    density = rawDensity;
    const baseDensity = sifted ? ingredient.siftedDensity : ingredient.density;
    gramsPerCup = Math.round((ingredient.gramsPerCup / baseDensity) * density);
  }

  const cups = amount * VOLUME_TO_CUPS[inputs.fromUnit];
  const grams = cups * gramsPerCup;

  const round = (n: number, decimals = 4) => {
    if (!Number.isFinite(n)) return 0;
    return parseFloat(n.toFixed(decimals));
  };

  const toUnit = inputs.toUnit || "grams";
  const toGramsFactor = WEIGHT_TO_GRAMS[toUnit];
  const primaryValue = round(grams / toGramsFactor, 4);

  const primary = {
    label: `Converted Weight (${WEIGHT_UNIT_META[toUnit].label})`,
    value: `${primaryValue.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${WEIGHT_UNIT_META[toUnit].symbol}`,
  };

  const breakdown = (Object.keys(WEIGHT_TO_GRAMS) as WeightUnit[]).map((unit) => {
    const v = grams / WEIGHT_TO_GRAMS[unit];
    return {
      label: `${WEIGHT_UNIT_META[unit].label} (${WEIGHT_UNIT_META[unit].symbol})`,
      value: round(v).toLocaleString("en-US", { maximumFractionDigits: 4 }),
    };
  });

  const statBar = [
    { label: "Ingredient Density", value: `${density.toFixed(3)} g/mL` },
    { label: "Grams per Cup", value: `${gramsPerCup} g` },
    { label: "Input Volume", value: `${round(cups, 4)} cups` },
  ];

  const summaryStats = [
    { label: "Input Amount", value: `${amount} ${VOLUME_UNIT_META[inputs.fromUnit].symbol}` },
    { label: "Input in Cups", value: `${round(cups, 4)} cups` },
    { label: "Total Weight (g)", value: `${round(grams).toLocaleString("en-US")} g` },
    { label: "Density", value: `${density.toFixed(3)} g/mL` },
    { label: "Status", value: amount === 0 ? "Zero" : "Valid" },
  ];

  const chartData = [0.25, 0.5, 1, 2, 4].map((c, i) => {
    const g = c * gramsPerCup;
    const val = g / WEIGHT_TO_GRAMS[toUnit];
    return {
      unit: `${c} cup${c !== 1 ? "s" : ""}`,
      value: round(val, 4),
      fill: COLORS[i % COLORS.length],
    };
  });

  return {
    primary,
    statBar,
    breakdown,
    chartData,
    summaryStats,
  };
}

const DEFAULTS: BakingInputs = {
  amount: "2.5",
  fromUnit: "cups",
  ingredient: "all-purpose-flour",
  toUnit: "grams",
  sifted: false,
  densityOverride: "",
};

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function BakingIngredientConverter() {
  const [inputs, setInputs] = useState<BakingInputs>(DEFAULTS);
  const [result, setResult] = useState<BakingResult>(calculateBaking(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calculateBaking(inputs));
  }, []);

  const calculate = () => setResult(calculateBaking(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateBaking(DEFAULTS));
  };

  const update = (patch: Partial<BakingInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const faqs = [
    { question: "How do I convert cups of flour to grams?", answer: "Select All-Purpose Flour from the ingredient dropdown, enter your cup amount, and click Calculate. One cup of unsifted all-purpose flour equals approximately 120 grams, while sifted flour is about 90 grams per cup." },
    { question: "Why does sifted flour weigh less than unsifted?", answer: "Sifting aerates flour and removes lumps, reducing its density from about 0.55 g/mL to 0.40 g/mL. This means a cup of sifted flour weighs roughly 90 grams compared to 120 grams for unsifted, which significantly affects recipe hydration and structure." },
    { question: "What is ingredient density and why does it matter?", answer: "Density, measured in grams per milliliter, determines how much a given volume of an ingredient weighs. Honey is dense at about 1.42 g/mL, so a cup weighs 340 grams, while flour is lighter at around 0.55 g/mL, yielding only 120 grams per cup. Using the correct density ensures accurate weight conversions." },
    { question: "How do I handle dietary substitutions with this tool?", answer: "Use the Advanced Options panel to toggle sifted versus unsifted states or enter a custom density override when swapping ingredients. For example, substituting whole wheat flour for all-purpose flour changes the density from 0.55 to 0.50 g/mL, affecting the final weight and hydration in your recipe." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Baking Ingredient Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Baking Ingredient Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-base font-medium block mb-1.5">Amount</label>
                <div className={inp}>
                  <input type="number" value={inputs.amount} onChange={(e) => update({ amount: e.target.value })} className={ci} placeholder="2.5" />
                </div>
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">From Unit</label>
                <div className={inp}>
                  <select value={inputs.fromUnit} onChange={(e) => update({ fromUnit: e.target.value as VolumeUnit })} className={ci}>
                    {(Object.keys(VOLUME_TO_CUPS) as VolumeUnit[]).map((u) => (
                      <option key={u} value={u}>{VOLUME_UNIT_META[u].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-base font-medium block mb-1.5">Ingredient</label>
                <div className={inp}>
                  <select value={inputs.ingredient} onChange={(e) => update({ ingredient: e.target.value as Ingredient })} className={ci}>
                    {(Object.keys(INGREDIENTS) as Ingredient[]).map((i) => (
                      <option key={i} value={i}>{INGREDIENTS[i].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">To Unit</label>
                <div className={inp}>
                  <select value={inputs.toUnit} onChange={(e) => update({ toUnit: e.target.value as WeightUnit })} className={ci}>
                    {(Object.keys(WEIGHT_TO_GRAMS) as WeightUnit[]).map((u) => (
                      <option key={u} value={u}>{WEIGHT_UNIT_META[u].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={() => setShowAdv(!showAdv)} className="text-sm text-primary font-medium text-left">
              Advanced Options {showAdv ? "▲" : "▼"}
            </button>
            {showAdv && (
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Ingredient Properties</div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Sifted</label>
                    <div className={inp}>
                      <select value={inputs.sifted ? "yes" : "no"} onChange={(e) => update({ sifted: e.target.value === "yes" })} className={ci}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Density Override (g/mL)</label>
                    <div className={inp}>
                      <input type="number" value={inputs.densityOverride} onChange={(e) => update({ densityOverride: e.target.value })} className={ci} placeholder="Auto" step="0.01" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.primary.label}</div>
              <div className="text-4xl font-extrabold tracking-tight text-primary">{result.primary.value}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {result.statBar.map((s, i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                  <div className="text-base font-bold">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Weight Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Weight Equivalents (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US"), "Weight"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Baking Ingredient Conversion and Recipe Adaptation</h2>
            <p>Converting baking ingredients by weight instead of volume is one of the most impactful changes a home baker can make. Volume measurements vary wildly depending on how you scoop, pack, or sift, but weight stays constant. A cup of all-purpose flour can weigh anywhere from 100 grams to 140 grams depending on the measuring technique, humidity, and brand, which is why professional bakers rely on grams for consistency. This calculator uses ingredient-specific density factors—such as 0.55 g/mL for unsifted all-purpose flour and 0.40 g/mL for sifted flour—to translate your volume inputs into precise weight outputs. Whether you are scaling a recipe for a crowd, adapting a family favorite for metric measurements, or substituting ingredients for dietary needs, weight-based conversion removes the guesswork and helps you achieve repeatable results batch after batch.</p>

            <h2 className="text-2xl font-bold mb-3">Dietary Substitutions and Ingredient Density</h2>
            <p>When substituting ingredients—such as swapping all-purpose flour for whole wheat flour or replacing butter with honey—density becomes the critical variable. Whole wheat flour packs more densely at 0.50 g/mL, producing about 113 grams per cup instead of 120, while honey is far denser at 1.42 g/mL, giving you 340 grams per cup. These differences matter when you are managing sugar intake, gluten-free baking, or vegan substitutions because the weight of dry versus liquid ingredients changes the hydration, structure, and sweetness of the final product. Use the Advanced Options panel to toggle sifted versus unsifted states or enter a custom density override when working with non-standard ingredients like almond flour, coconut flour, or specialty sugars. The bar chart visually compares weight equivalents across common volumes, making it easy to see how a half-cup, one-cup, or two-cup serving compares in grams at a glance.</p>

            <h2 className="text-2xl font-bold mb-3">Common Baking Units and Practical Tips</h2>
            <p>Baking recipes in the United States often rely on cups, tablespoons, and teaspoons, while professional and international recipes use grams, kilograms, and milliliters. This converter bridges that gap by supporting both US customary and metric units simultaneously. Butter, for instance, converts from cups to grams at a precise 227 grams per cup, while brown sugar packed into a cup weighs 220 grams and granulated sugar comes in at 200 grams. Yeast has its own convention: one standard packet equals 7 grams or 2.25 teaspoons, a conversion that is essential when switching between dry and active yeast forms. Keep in mind that sifted cocoa powder weighs only 80 grams per cup because air is incorporated during sifting, while unsifted cocoa powder is closer to 100 grams. Use the density override in Advanced Options when your ingredient falls outside these standard values, and consult the summary statistics panel for a complete profile of your converted weight.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baking-ingredient-converter" />
          <PopularCalculators exclude="/calculator/baking-ingredient-converter" />
        </div>
      </div>
    </>
  );
}
