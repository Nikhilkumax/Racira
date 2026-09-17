"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Droplet } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type DietKey = "low" | "moderate" | "high";

const DIETS: Record<DietKey, { label: string; pct: number }> = {
  low: { label: "Low fat (20%)", pct: 0.2 },
  moderate: { label: "Moderate (30%)", pct: 0.3 },
  high: { label: "High fat / keto (60%)", pct: 0.6 },
};

interface FatResult {
  calories: number;
  diet: DietKey;
  pct: number;
  fatCalories: number;
  fatGrams: number;
  saturatedGrams: number;
  otherCalories: number;
  chartData: { name: string; value: number }[];
}

function calcFat(calories: number, diet: DietKey): FatResult {
  const pct = DIETS[diet].pct;
  const fatCalories = calories * pct;
  const fatGrams = fatCalories / 9;
  const saturatedGrams = (calories * 0.1) / 9;
  const otherCalories = calories - fatCalories;
  const chartData = [
    { name: "Fat", value: fatCalories },
    { name: "Carbs & Protein", value: otherCalories },
  ];
  return { calories, diet, pct, fatCalories, fatGrams, saturatedGrams, otherCalories, chartData };
}

const DEFAULTS = { calories: "2000", diet: "moderate" as DietKey };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "How much fat should I eat?", answer: "Dietary guidelines recommend 20–35% of calories from fat (about 44–78 g on a 2,000-calorie diet). Keto diets run 60–75%; low-fat plans 15–20%. Fat provides 9 kcal per gram, more than double protein or carbs." },
  { question: "What about saturated fat?", answer: "Guidelines cap saturated fat at ~10% of calories — about 22 g on 2,000 calories. Replace it with unsaturated sources (olive oil, nuts, fish) for heart health; trans fats should be avoided entirely." },
  { question: "Are all fats the same?", answer: "No. Unsaturated fats (mono- and poly-) support heart health; saturated fats raise LDL cholesterol in excess; trans fats are harmful at any level. This calculator tracks total fat — aim to get most of it from unsaturated sources." },
];

export default function FatIntakeCalculator() {
  const [calories, setCalories] = useState(DEFAULTS.calories);
  const [diet, setDiet] = useState<DietKey>(DEFAULTS.diet);
  const [result, setResult] = useState<FatResult>(() => calcFat(2000, "moderate"));

  useEffect(() => {
    const c = parseFloat(calories);
    if (!isNaN(c) && c > 0) setResult(calcFat(c, diet));
  }, []);

  const handleCalculate = () => {
    const c = parseFloat(calories);
    if (!isNaN(c) && c > 0) setResult(calcFat(c, diet));
  };
  const reset = () => { setCalories(DEFAULTS.calories); setDiet(DEFAULTS.diet); setResult(calcFat(parseFloat(DEFAULTS.calories), DEFAULTS.diet)); };
  const invalid = isNaN(parseFloat(calories)) || parseFloat(calories) <= 0;

  const breakdown = [
    { label: "Daily Calories", value: `${Math.round(result.calories).toLocaleString()} kcal` },
    { label: "Fat Share of Diet", value: `${(result.pct * 100).toFixed(0)}%` },
    { label: "Calories from Fat", value: `${Math.round(result.fatCalories).toLocaleString()} kcal` },
    { label: "Total Fat", value: `${result.fatGrams.toFixed(0)} g`, highlight: true },
    { label: "Fat per Meal (3 meals)", value: `${(result.fatGrams / 3).toFixed(0)} g` },
    { label: "Saturated Fat Limit (≤10%)", value: `${result.saturatedGrams.toFixed(0)} g` },
    { label: "Carbs & Protein Calories", value: `${Math.round(result.otherCalories).toLocaleString()} kcal` },
  ];

  const summaryStats = [
    { label: "Total Fat", value: `${result.fatGrams.toFixed(0)} g` },
    { label: "Fat Calories", value: `${Math.round(result.fatCalories).toLocaleString()} kcal` },
    { label: "Fat Share", value: `${(result.pct * 100).toFixed(0)}%` },
    { label: "Saturated Limit", value: `${result.saturatedGrams.toFixed(0)} g` },
    { label: "Per Meal", value: `${(result.fatGrams / 3).toFixed(0)} g` },
    { label: "Other Macros", value: `${Math.round(result.otherCalories).toLocaleString()} kcal` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fat Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fat Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="fi-cals" className="block text-sm font-medium mb-1 text-foreground">Daily Calories</label>
              <input id="fi-cals" type="number" min="500" step="100" value={calories} onChange={(e) => setCalories(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="fi-diet" className="block text-sm font-medium mb-1 text-foreground">Diet Type</label>
              <select id="fi-diet" value={diet} onChange={(e) => setDiet(e.target.value as DietKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(DIETS).map(([key, d]) => <option key={key} value={key}>{d.label}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Droplet className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive daily calorie target.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recommended Fat Intake</div>
              <div className="text-4xl font-extrabold text-primary">{result.fatGrams.toFixed(0)} g</div>
              <div className="text-sm text-muted-foreground mt-1">{Math.round(result.fatCalories).toLocaleString()} kcal from fat · {(result.pct * 100).toFixed(0)}% of diet</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Meal</div>
                <div className="text-lg font-bold text-primary">{(result.fatGrams / 3).toFixed(0)} g</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Saturated ≤</div>
                <div className="text-lg font-bold text-primary">{result.saturatedGrams.toFixed(0)} g</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Fat Calories</div>
                <div className="text-lg font-bold text-primary">{Math.round(result.fatCalories).toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Calorie Split by Macro</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${Math.round(v).toLocaleString()} kcal (${((v / result.calories) * 100).toFixed(0)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Fat Intake Calculator</h2>
            <p>Fat is the most calorie-dense macro at 9 kcal per gram, so targets convert easily: fat grams = calories × fat % ÷ 9. On 2,000 calories at 30% fat, that is 600 kcal and about 67 g of fat — with saturated fat capped near 22 g (10% of calories).</p>
            <h3>Quality Over Quantity</h3>
            <p>The total-fat target matters less than the source. Unsaturated fats from olive oil, nuts, avocado, and fish improve lipid profiles, while excess saturated fat from butter, fatty meats, and processed foods raises LDL cholesterol. Track total fat here, but choose the unsaturated sources within it.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fat-intake-calculator" />
          <PopularCalculators exclude="/calculator/fat-intake-calculator" />
        </div>
      </div>
    </>
  );
}
