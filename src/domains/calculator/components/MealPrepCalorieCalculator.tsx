"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface MealPrepInputs {
  batchCalories: number;
  servings: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  weeklyCost: number;
}

interface MealPrepResult {
  perServingCalories: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  macroCalories: number;
  macroDiffPct: number;
  costPerServing: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcMealPrep(inputs: MealPrepInputs): MealPrepResult {
  const perServingCalories = inputs.servings > 0 ? inputs.batchCalories / inputs.servings : 0;
  const proteinPerServing = inputs.servings > 0 ? inputs.proteinG / inputs.servings : 0;
  const carbsPerServing = inputs.servings > 0 ? inputs.carbsG / inputs.servings : 0;
  const fatPerServing = inputs.servings > 0 ? inputs.fatG / inputs.servings : 0;
  const macroCalories = inputs.proteinG * 4 + inputs.carbsG * 4 + inputs.fatG * 9;
  const macroDiffPct = inputs.batchCalories > 0 ? ((macroCalories - inputs.batchCalories) / inputs.batchCalories) * 100 : 0;
  const costPerServing = inputs.servings > 0 ? inputs.weeklyCost / inputs.servings : 0;

  const chartData = [
    { name: "Protein", value: inputs.proteinG * 4, color: "hsl(var(--primary))" },
    { name: "Carbs", value: inputs.carbsG * 4, color: "#f59e0b" },
    { name: "Fat", value: inputs.fatG * 9, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const breakdown = [
    { label: "Total Batch Calories", value: `${inputs.batchCalories.toLocaleString()} kcal` },
    { label: "Number of Servings", value: `${inputs.servings}` },
    { label: "Calories per Serving", value: `${perServingCalories.toFixed(0)} kcal`, highlight: true },
    { label: "Protein per Serving", value: `${proteinPerServing.toFixed(1)} g` },
    { label: "Carbs per Serving", value: `${carbsPerServing.toFixed(1)} g` },
    { label: "Fat per Serving", value: `${fatPerServing.toFixed(1)} g` },
    { label: "Macro-Derived Calories", value: `${macroCalories.toFixed(0)} kcal` },
    { label: "Macro vs. Label Difference", value: `${macroDiffPct >= 0 ? "+" : ""}${macroDiffPct.toFixed(1)}%` },
    { label: "Weekly Ingredient Cost", value: `$${inputs.weeklyCost.toFixed(2)}` },
    { label: "Cost per Serving", value: `$${costPerServing.toFixed(2)}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Calories per Serving", value: `${perServingCalories.toFixed(0)} kcal` },
    { label: "Protein per Serving", value: `${proteinPerServing.toFixed(1)} g` },
    { label: "Carbs per Serving", value: `${carbsPerServing.toFixed(1)} g` },
    { label: "Fat per Serving", value: `${fatPerServing.toFixed(1)} g` },
    { label: "Cost per Serving", value: `$${costPerServing.toFixed(2)}` },
    { label: "Macro Consistency", value: `${Math.abs(macroDiffPct).toFixed(1)}% ${macroDiffPct >= 0 ? "over" : "under"} label` },
  ];

  return { perServingCalories, proteinPerServing, carbsPerServing, fatPerServing, macroCalories, macroDiffPct, costPerServing, chartData, breakdown, summaryStats };
}

const DEFAULTS: MealPrepInputs = { batchCalories: 2400, servings: 6, proteinG: 120, carbsG: 300, fatG: 90, weeklyCost: 85 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">{payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
  </div>
) : null;

export default function MealPrepCalorieCalculator() {
  const [batchCalories, setBatchCalories] = useState("2400");
  const [servings, setServings] = useState("6");
  const [proteinG, setProteinG] = useState("120");
  const [carbsG, setCarbsG] = useState("300");
  const [fatG, setFatG] = useState("90");
  const [weeklyCost, setWeeklyCost] = useState("85");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<MealPrepResult | null>(null);

  const calculate = () =>
    setResult(calcMealPrep({
      batchCalories: parseFloat(batchCalories) || 0,
      servings: parseFloat(servings) || 1,
      proteinG: parseFloat(proteinG) || 0,
      carbsG: parseFloat(carbsG) || 0,
      fatG: parseFloat(fatG) || 0,
      weeklyCost: parseFloat(weeklyCost) || 0,
    }));
  const reset = () => { setBatchCalories(DEFAULTS.batchCalories.toString()); setServings(DEFAULTS.servings.toString()); setProteinG(DEFAULTS.proteinG.toString()); setCarbsG(DEFAULTS.carbsG.toString()); setFatG(DEFAULTS.fatG.toString()); setWeeklyCost(DEFAULTS.weeklyCost.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "How do I calculate calories per serving?", answer: "Divide the batch's total calories by the number of servings: a 2,400 kcal batch portioned into 6 containers is 400 kcal per serving. Weigh the finished batch once and divide by the container count for accurate portions." },
    { question: "Why does my macro total differ from the label?", answer: "Labels round calories, and fiber, sugar alcohols, and cooking changes create small gaps. Protein and carbs contribute 4 kcal/g, fat 9 kcal/g. If your macro-derived total is far off the label, one of the macro entries is likely off — the calculator's consistency check flags it." },
    { question: "How should I portion macros per meal?", answer: "A balanced meal prep targets roughly 25–35% of calories from protein, 40–55% from carbs, and 20–35% from fat. For a 400 kcal serving that is about 25–35 g protein, 40–55 g carbs, and 9–15 g fat." },
    { question: "Does meal prep really save money?", answer: "Usually — bulk ingredient buying and portioned cooking cut both waste and per-meal restaurant costs. The calculator's cost-per-serving figure (weekly ingredients ÷ servings) quantifies it: $85 of ingredients across 6 servings is about $14 per meal." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Meal Prep Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Meal Prep Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="batch" label="Total Batch Calories" value={batchCalories} onChange={setBatchCalories} suffix="kcal" />
              <CompactInput id="servings" label="Number of Servings" value={servings} onChange={setServings} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="protein" label="Protein (g)" value={proteinG} onChange={setProteinG} suffix="g" />
              <CompactInput id="carbs" label="Carbs (g)" value={carbsG} onChange={setCarbsG} suffix="g" />
              <CompactInput id="fat" label="Fat (g)" value={fatG} onChange={setFatG} suffix="g" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Budget</label>
                    <CompactInput id="cost" label="Weekly Ingredient Cost" value={weeklyCost} onChange={setWeeklyCost} suffix="$" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Calories per Serving</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{result.perServingCalories.toFixed(0)} kcal</div>
                <div className="text-sm text-muted-foreground font-medium">from a {batchCalories} kcal batch split into {servings} servings</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Protein / Serving", `${result.proteinPerServing.toFixed(1)} g`], ["Carbs / Serving", `${result.carbsPerServing.toFixed(1)} g`], ["Fat / Serving", `${result.fatPerServing.toFixed(1)} g`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                <h3 className="text-base font-bold mb-2 w-full text-left">Macro Calorie Split</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                      {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                    </div>
                  ))}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">Portioning a Batch with Precision</h2>
            <p>Meal prep works when the numbers survive the split. A batch's total calories divided by servings gives the per-meal figure, and dividing the macros the same way keeps protein, carbs, and fat consistent across the week. This <strong>meal prep calorie calculator</strong> does both — and cross-checks your macro entries against the calorie label.</p>
            <h2 className="text-2xl font-bold mb-3">The Macro Consistency Check</h2>
            <p>Because protein and carbs carry 4 kcal/g and fat carries 9, your macro grams imply a calorie total. If that implied total drifts more than a few percent from the label, one of your entries is likely wrong. The calculator surfaces the gap so a miscounted batch does not silently derail a week of tracking.</p>
            <h2 className="text-2xl font-bold mb-3">Meal Prep Economics</h2>
            <p>Prepping also changes the money math: $85 of ingredients split into 6 servings is about $14 per meal, usually a fraction of eating out. Tracking cost per serving alongside calories makes the habit's value visible — and makes the case for bulk buying and batch cooking stick.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/meal-prep-calorie-calculator" />
          <PopularCalculators exclude="/calculator/meal-prep-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
