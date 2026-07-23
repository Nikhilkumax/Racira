"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type VolumeUnit = "cups" | "tbsp" | "tsp" | "pint" | "quart" | "gallon" | "mL" | "grams" | "ounces";
type Ingredient = "all-purpose-flour" | "sugar" | "butter" | "honey" | "milk" | "cocoa" | "oats";

interface BakingInputs {
  value: string;
  fromUnit: VolumeUnit;
  toUnit: VolumeUnit;
  ingredient: Ingredient;
  decimals: string;
}

interface ConversionEntry {
  unit: VolumeUnit;
  label: string;
  symbol: string;
  value: number;
}

interface BakingResult {
  primary: { label: string; value: string };
  conversions: ConversionEntry[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { unit: string; value: number; fill: string }[];
}

const VOL_TO_ML: Record<string, number> = {
  cups: 236.588,
  tbsp: 14.787,
  tsp: 4.929,
  pint: 473.176,
  quart: 946.353,
  gallon: 3785.41,
  mL: 1,
};

const INGREDIENT_DENSITY: Record<Ingredient, number> = {
  "all-purpose-flour": 0.55,
  sugar: 0.85,
  butter: 0.95,
  honey: 1.42,
  milk: 1.03,
  cocoa: 0.55,
  oats: 0.40,
};

const UNIT_META: Record<VolumeUnit, { label: string; symbol: string }> = {
  cups: { label: "Cups", symbol: "cup" },
  tbsp: { label: "Tablespoons", symbol: "tbsp" },
  tsp: { label: "Teaspoons", symbol: "tsp" },
  pint: { label: "Pints", symbol: "pt" },
  quart: { label: "Quarts", symbol: "qt" },
  gallon: { label: "Gallons", symbol: "gal" },
  mL: { label: "Milliliters", symbol: "mL" },
  grams: { label: "Grams", symbol: "g" },
  ounces: { label: "Ounces", symbol: "oz" },
};

const COLORS: Record<string, string> = {
  cups: "#3b82f6",
  tbsp: "#10b981",
  tsp: "#f59e0b",
  pint: "#8b5cf6",
  quart: "#ef4444",
  gallon: "#06b6d4",
  mL: "#ec4899",
  grams: "#84cc16",
  ounces: "#f97316",
};

function roundTo(n: number, decimals: number): number {
  if (!Number.isFinite(n)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

function calcBakingConversion(inputs: BakingInputs): BakingResult {
  const rawValue = parseFloat(inputs.value);
  const value = Number.isFinite(rawValue) ? rawValue : 0;
  const rawDecimals = parseInt(inputs.decimals);
  const decimals = Number.isFinite(rawDecimals) ? Math.max(0, Math.min(10, rawDecimals)) : 2;
  const fromUnit: VolumeUnit = inputs.fromUnit || "cups";
  const toUnit: VolumeUnit = inputs.toUnit || "grams";
  const ingredient: Ingredient = inputs.ingredient || "all-purpose-flour";

  const density = INGREDIENT_DENSITY[ingredient] || 0.55;
  const isFromWeight = fromUnit === "grams" || fromUnit === "ounces";
  const isToWeight = toUnit === "grams" || toUnit === "ounces";

  let baseMl = 0;

  if (isFromWeight) {
    const grams = fromUnit === "ounces" ? value * 28.3495 : value;
    baseMl = grams / density;
  } else {
    baseMl = value * (VOL_TO_ML[fromUnit] || 1);
  }

  const round = (n: number) => roundTo(n, decimals);

  const conversions: ConversionEntry[] = [];
  const units: VolumeUnit[] = ["cups", "tbsp", "tsp", "pint", "quart", "gallon", "mL", "grams", "ounces"];

  for (const unit of units) {
    const isWeight = unit === "grams" || unit === "ounces";
    let convertedValue = 0;

    if (isWeight) {
      const grams = baseMl * density;
      convertedValue = unit === "grams" ? grams : grams / 28.3495;
    } else {
      convertedValue = baseMl / (VOL_TO_ML[unit] || 1);
    }

    conversions.push({
      unit,
      label: UNIT_META[unit].label,
      symbol: UNIT_META[unit].symbol,
      value: round(convertedValue),
    });
  }

  const primaryConv = conversions.find((c) => c.unit === toUnit)!;
  const primary = {
    label: "Converted Amount",
    value: `${primaryConv.value.toLocaleString("en-US", { maximumFractionDigits: decimals })} ${primaryConv.symbol}`,
  };

  const breakdown = conversions.map((c) => ({
    label: `${c.label} (${c.symbol})`,
    value: c.value.toLocaleString("en-US", { maximumFractionDigits: decimals }),
  }));

  const positive = value > 0;
  const statusLabel = positive ? "Valid" : value < 0 ? "Negative" : "Zero";

  const summaryStats = [
    { label: "Input Value", value: `${value.toLocaleString("en-US", { maximumFractionDigits: decimals })} ${UNIT_META[fromUnit].symbol}` },
    { label: "Ingredient", value: UNIT_META[ingredient === "all-purpose-flour" ? "cups" : "mL"].label },
    { label: "Base Volume", value: `${round(baseMl).toLocaleString("en-US")} mL` },
    { label: "Density", value: `${density} g/mL` },
    { label: "Total Units", value: `${conversions.length}` },
    { label: "Status", value: statusLabel },
  ];

  const chartData = conversions.map((c) => ({
    unit: c.symbol,
    value: c.value,
    fill: COLORS[c.unit] || "#3b82f6",
  }));

  return { primary, conversions, breakdown, summaryStats, chartData };
}

const DEFAULTS: BakingInputs = {
  value: "2.5",
  fromUnit: "cups",
  toUnit: "grams",
  ingredient: "all-purpose-flour",
  decimals: "2",
};

const COLORS_LIST = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#f97316"];

export default function BakingConversionCalculator() {
  const [inputs, setInputs] = useState<BakingInputs>(DEFAULTS);
  const [result, setResult] = useState<BakingResult>(calcBakingConversion(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calcBakingConversion(inputs));
  }, []);

  const calculate = () => setResult(calcBakingConversion(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcBakingConversion(DEFAULTS));
  };

  const update = (patch: Partial<BakingInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const fromIsWeight = inputs.fromUnit === "grams" || inputs.fromUnit === "ounces";
  const toIsWeight = inputs.toUnit === "grams" || inputs.toUnit === "ounces";

  const volumeUnits: VolumeUnit[] = ["cups", "tbsp", "tsp", "pint", "quart", "gallon", "mL"];
  const weightUnits: VolumeUnit[] = ["grams", "ounces"];
  const allUnits: VolumeUnit[] = [...volumeUnits, ...weightUnits];

  const faqs = [
    { question: "How do you convert cups to grams for flour?", answer: "Multiply cups by 236.588 to get milliliters, then multiply by the ingredient density. For all-purpose flour at 0.55 g/mL, 1 cup = 236.588 * 0.55 = 130.12 g. So 2.5 cups of flour weighs about 325.3 grams. Different ingredients have different densities: butter is denser (~0.95 g/mL), so 1 cup of butter weighs about 224.8 g, while honey is even denser (~1.42 g/mL), making 1 cup of honey weigh about 336 g." },
    { question: "Why does the same volume of different ingredients weigh differently?", answer: "Density determines weight for a given volume. Flour is fluffy and aerated (0.55 g/mL), while honey is thick and heavy (1.42 g/mL). Water sits near 1.0 g/mL as a reference. Baking is chemistry, so measuring by weight (grams or ounces) is far more accurate than by volume because spooning vs scooping flour can introduce 20%+ variance by weight. Professional bakers prefer weight measurements for consistent results." },
    { question: "How accurate are these baking conversions?", answer: "These conversions use standard ingredient densities and exact volume-to-milliliter factors (1 cup = 236.588 mL, 1 tbsp = 14.787 mL, 1 tsp = 4.929 mL). Real-world variation comes from how ingredients are packed, humidity, and temperature. For best results, use the weight (grams) output rather than volume when scaling recipes up or down, and always measure dry ingredients by weight for precision." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Baking Conversion Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baking Conversion Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-4 !p-6 border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-base font-medium block mb-1.5">Value</label>
                <div className={inp}>
                  <input type="number" value={inputs.value} onChange={(e) => update({ value: e.target.value })} className={ci} placeholder="2.5" />
                </div>
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">From Unit</label>
                <div className={inp}>
                  <select value={inputs.fromUnit} onChange={(e) => update({ fromUnit: e.target.value as VolumeUnit })} className={ci}>
                    {allUnits.map((u) => (
                      <option key={u} value={u}>{UNIT_META[u].label} ({UNIT_META[u].symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-base font-medium block mb-1.5">To Unit</label>
                <div className={inp}>
                  <select value={inputs.toUnit} onChange={(e) => update({ toUnit: e.target.value as VolumeUnit })} className={ci}>
                    {allUnits.map((u) => (
                      <option key={u} value={u}>{UNIT_META[u].label} ({UNIT_META[u].symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Ingredient</label>
                <div className={inp}>
                  <select value={inputs.ingredient} onChange={(e) => update({ ingredient: e.target.value as Ingredient })} className={ci}>
                    <option value="all-purpose-flour">All-Purpose Flour</option>
                    <option value="sugar">Sugar</option>
                    <option value="butter">Butter</option>
                    <option value="honey">Honey</option>
                    <option value="milk">Milk</option>
                    <option value="cocoa">Cocoa Powder</option>
                    <option value="oats">Oats</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="text-sm text-primary font-medium text-left">
              Advanced Options {showAdv ? "▲" : "▼"}
            </button>

            {showAdv && (
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Precision</div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Decimal Places</label>
                    <div className={inp}>
                      <input type="number" value={inputs.decimals} onChange={(e) => update({ decimals: e.target.value })} min={0} max={10} className={ci} />
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
              <div className="text-sm text-muted-foreground mt-1">
                {inputs.value} {UNIT_META[inputs.fromUnit].label} = {result.primary.value}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {result.conversions.slice(0, 3).map((c, i) => (
                <div key={c.unit} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{c.symbol}</div>
                  <div className="text-base font-bold">{c.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.startsWith(UNIT_META[inputs.toUnit].label) ? "bg-primary/5" : ""}`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Equivalent Amounts (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US"), "Amount"]} />
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
            <h2 className="text-2xl font-bold mb-3">Baking Conversion Fundamentals</h2>
            <p>Baking conversions bridge the gap between the volume measurements used in home kitchens and the precise weight measurements preferred by professional bakers. This calculator translates cups, tablespoons, teaspoons, pints, quarts, and gallons into grams and ounces using ingredient-specific densities. The core formula converts your input volume to milliliters, then applies density to derive weight: grams = milliliters * density. For reverse conversions, weight is divided by density to recover volume. Factors like 1 cup = 236.588 mL, 1 tablespoon = 14.787 mL, and 1 teaspoon = 4.929 mL are exact, while densities vary by ingredient—flour is about 0.55 g/mL, sugar 0.85 g/mL, butter 0.95 g/mL, honey 1.42 g/mL, milk 1.03 g/mL, cocoa 0.55 g/mL, and oats 0.40 g/mL. Using these precise numbers prevents the 20 percent variance that can come from loosely packed flour scoops.</p>

            <h2 className="text-2xl font-bold mb-3">Recipe Scaling and Ingredient Substitution</h2>
            <p>When scaling a recipe up or down, converting to weight ensures each ingredient stays proportional regardless of batch size. A baker doubling a cookie recipe from 2.5 cups to 5 cups of flour can confirm that 2.5 cups equals roughly 325 grams, making it simple to halve the recipe to 162.5 grams for a smaller batch. Ingredient substitution follows the same logic: if a recipe calls for honey but you prefer maple syrup, the calculator helps you match viscosity and weight rather than guessing by volume. Weight also matters when substituting between granulated and powdered sugar, which have different densities. By outputting every common unit at once, the tool lets you compare options side by side and choose the measurement that matches your kitchen scale or measuring cups.</p>

            <h2 className="text-2xl font-bold mb-3">Precision Control and Practical Tips</h2>
            <p>The Advanced Options panel lets you set decimal places (default 2) to control rounding across every conversion, breakdown row, and chart value. For delicate pastries, keep two decimals; for hearty breads, whole numbers may suffice. The calculator handles zero, negative, and empty inputs without crashing: an empty field is treated as zero, and a negative value simply mirrors its sign to represent a deficit or removal. Use the primary result card for the exact answer, the three-stat bar for a quick glance at common units, the breakdown table for all nine units, the bar chart for visual comparison, and the summary statistics for context like base volume and ingredient density. Together these outputs turn a simple conversion into a complete baking planning tool.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baking-conversion-calculator" />
          <PopularCalculators exclude="/calculator/baking-conversion-calculator" />
        </div>
      </div>
    </>
  );
}
