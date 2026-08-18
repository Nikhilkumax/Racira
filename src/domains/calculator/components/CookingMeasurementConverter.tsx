"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CookingResult {
  amount: number;
  fromUnit: string;
  toUnit: string;
  factor: number;
  converted: number;
  grams: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const UNIT_ML: Record<string, number> = {
  teaspoon: 4.92892, tablespoon: 14.7868, fluidounce: 29.5735, cup: 236.588,
  pint: 473.176, quart: 946.353, gallon: 3785.41, milliliter: 1, liter: 1000,
};
const UNIT_LABELS: Record<string, string> = {
  teaspoon: "Teaspoon (tsp)", tablespoon: "Tablespoon (tbsp)", fluidounce: "Fluid Ounce (fl oz)", cup: "Cup",
  pint: "Pint (pt)", quart: "Quart (qt)", gallon: "Gallon (gal)", milliliter: "Milliliter (ml)", liter: "Liter (L)",
};
const INGREDIENT_DENSITY: Record<string, number> = {
  water: 1.0, flour: 0.53, sugar: 0.85, butter: 0.911, oil: 0.916, milk: 1.03, honey: 1.42, salt: 1.2,
};
const INGREDIENT_LABELS: Record<string, string> = {
  water: "Water", flour: "All-Purpose Flour", sugar: "Granulated Sugar", butter: "Butter", oil: "Olive Oil", milk: "Milk", honey: "Honey", salt: "Salt",
};

function calcCooking(amount: number, fromUnit: string, toUnit: string, ingredient: string, dp: number): CookingResult {
  const fromMl = amount * UNIT_ML[fromUnit];
  const converted = fromMl / UNIT_ML[toUnit];
  const factor = UNIT_ML[fromUnit] / UNIT_ML[toUnit];
  const grams = fromMl * INGREDIENT_DENSITY[ingredient];
  const r = (n: number) => parseFloat(n.toFixed(dp));

  const breakdown = [
    { label: `Amount (${UNIT_LABELS[fromUnit]})`, value: `${r(amount)}` },
    { label: `Converted (${UNIT_LABELS[toUnit]})`, value: `${r(converted)}` },
    { label: "Conversion Factor", value: `1 ${UNIT_LABELS[fromUnit].split(" (")[0].toLowerCase()} = ${r(factor)} ${UNIT_LABELS[toUnit].split(" (")[0].toLowerCase()}` },
    { label: `Grams (${INGREDIENT_LABELS[ingredient]})`, value: `${r(grams)} g` },
    { label: "Volume (Milliliters)", value: `${r(fromMl)} ml` },
  ];
  const summaryStats = [
    { label: "Converted Amount", value: `${r(converted)}` },
    { label: "From Unit", value: UNIT_LABELS[fromUnit].split(" (")[0] },
    { label: "To Unit", value: UNIT_LABELS[toUnit].split(" (")[0] },
    { label: "Grams", value: `${r(grams)} g` },
    { label: "Milliliters", value: `${r(fromMl)} ml` },
    { label: "Ingredient", value: INGREDIENT_LABELS[ingredient] },
    { label: "Factor", value: `${r(factor)}` },
    { label: "Precision", value: `${dp} dp` },
  ];
  const chartData = [
    { name: `Original (${UNIT_LABELS[fromUnit].split(" (")[0]})`, value: r(amount), fill: "hsl(var(--primary))" },
    { name: `Converted (${UNIT_LABELS[toUnit].split(" (")[0]})`, value: r(converted), fill: "#10b981" },
    { name: "Grams", value: r(grams), fill: "#f59e0b" },
  ];
  return { amount, fromUnit, toUnit, factor, converted, grams, breakdown, summaryStats, chartData };
}

const DEFAULTS = { amount: "2", from: "cup", to: "milliliter", ingredient: "water", decimals: "2" };

export default function CookingMeasurementConverter() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [fromUnit, setFromUnit] = useState(DEFAULTS.from);
  const [toUnit, setToUnit] = useState(DEFAULTS.to);
  const [ingredient, setIngredient] = useState(DEFAULTS.ingredient);
  const [decimals, setDecimals] = useState(DEFAULTS.decimals);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<CookingResult | null>(null);

  const a = parseFloat(amount) || 0;
  const dp = Math.max(0, Math.min(6, parseInt(decimals) || 2));
  const errs: string[] = [];
  if (a <= 0) errs.push("Amount must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcCooking(a, fromUnit, toUnit, ingredient, dp)); };
  const reset = () => {
    setAmount(DEFAULTS.amount); setFromUnit(DEFAULTS.from); setToUnit(DEFAULTS.to); setIngredient(DEFAULTS.ingredient); setDecimals(DEFAULTS.decimals);
    setResult(calcCooking(2, "cup", "milliliter", "water", 2));
  };
  useEffect(() => { setResult(calcCooking(2, "cup", "milliliter", "water", 2)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How many tablespoons are in a cup?", answer: "There are 16 tablespoons in 1 US cup. So 2 cups equals 32 tablespoons. Other key conversions: 3 teaspoons = 1 tablespoon, 2 cups = 1 pint, 4 quarts = 1 gallon." },
    { question: "Why do grams vary by ingredient?", answer: "Volume measures (cups, tablespoons) describe space, while grams measure mass. Different ingredients have different densities — a cup of flour weighs about 125 g while a cup of water weighs 236 g. Weighing is the most accurate way to bake." },
    { question: "What is the difference between US and metric cups?", answer: "The US customary cup is 236.6 ml, while the legal US cup (nutrition labels) is 240 ml, the metric cup is 250 ml, and the imperial cup is 284 ml. This calculator uses US customary units, which most American recipes assume." },
    { question: "Can I convert between liquid and dry measurements?", answer: "Directly, no — liquids and dry ingredients have different densities. Use the ingredient selector to convert volume to grams for common baking ingredients like flour, sugar, and butter, then weigh instead of scooping for consistent results." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Cooking Measurement Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Cooking Measurement Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Amount</label>
                <div className={inp}><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>From Unit</label>
                <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className={sel}>
                  {Object.keys(UNIT_LABELS).map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>To Unit</label>
              <select value={toUnit} onChange={e => setToUnit(e.target.value)} className={sel}>
                {Object.keys(UNIT_LABELS).map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Weight Conversion</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Ingredient</label>
                      <select value={ingredient} onChange={e => setIngredient(e.target.value)} className={sel}>
                        {Object.keys(INGREDIENT_LABELS).map(i => <option key={i} value={i}>{INGREDIENT_LABELS[i]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Decimal Places</label>
                      <div className={inp}><input type="number" min="0" max="6" value={decimals} onChange={e => setDecimals(e.target.value)} className={ci} /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Amount</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.converted} <span className="text-2xl text-muted-foreground">{UNIT_LABELS[result.toUnit].split(" (")[0]}</span></div>
                <div className="text-sm text-muted-foreground mt-1">{result.amount} {UNIT_LABELS[result.fromUnit].split(" (")[0]} = {result.grams} g of {INGREDIENT_LABELS[ingredient]}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Volume (ml)", `${result.breakdown[4].value}`], ["Grams", `${result.grams} g`], ["Factor", `${result.factor}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 1 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Original vs Converted</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Kitchen Unit Conversions</h2>
            <p>Recipes call for teaspoons, tablespoons, cups, pints, quarts, and gallons — all volume measures. This <strong>cooking measurement converter</strong> converts between them and metric milliliters and liters using exact US customary factors: 1 tsp = 4.93 ml, 1 tbsp = 14.79 ml, 1 cup = 236.59 ml.</p>
            <h2 className="text-2xl font-bold mb-3">Volume vs Weight</h2>
            <p>Baking by weight is far more reliable than scooping. A cup of all-purpose flour weighs about 125 g (density 0.53 g/ml), while a cup of honey weighs 340 g (density 1.42 g/ml). Select the ingredient and the converter reports the gram equivalent of your volume.</p>
            <h2 className="text-2xl font-bold mb-3">Scaling Recipes</h2>
            <p>Convert every ingredient of a scaled recipe with the same tool: multiply each volume by your scale factor, convert to grams per ingredient for accuracy, and adjust cooking time carefully — larger batches need more time in the oven but not proportionally more.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cooking-measurement-converter" />
          <PopularCalculators exclude="/calculator/cooking-measurement-converter" />
        </div>
      </div>
    </>
  );
}
