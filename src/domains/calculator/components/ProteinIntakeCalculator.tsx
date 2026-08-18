"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ProteinInput {
  weight: number;
  unit: "lb" | "kg";
  goal: "maintain" | "build" | "lose";
  activity: "sedentary" | "moderate" | "active";
}

interface ProteinResult {
  weightKg: number;
  weightLb: number;
  rda: number;
  optimal: number;
  high: number;
  perLb: number;
  calories: number;
  chartData: { name: string; grams: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcProtein(input: ProteinInput): ProteinResult {
  const weightKg = input.unit === "lb" ? input.weight / 2.20462 : input.weight;
  const weightLb = input.unit === "lb" ? input.weight : input.weight * 2.20462;

  const rda = weightKg * 0.8; // minimum to prevent deficiency

  let optimal: number;
  let high: number;
  if (input.activity === "sedentary") {
    optimal = weightKg * 1.0;
    high = weightKg * 1.2;
  } else if (input.activity === "moderate") {
    optimal = weightKg * 1.4;
    high = weightKg * 1.6;
  } else {
    optimal = weightKg * 1.6;
    high = weightKg * 2.2; // ~1g per lb
  }

  if (input.goal === "lose") {
    optimal *= 1.2; // preserve muscle in a deficit
    high *= 1.2;
  } else if (input.goal === "build") {
    optimal *= 1.1;
    high *= 1.1;
  }

  const perLb = optimal / weightLb;
  const calories = optimal * 4; // 4 kcal per gram of protein

  const chartData = [
    { name: "RDA (Min)", grams: Math.round(rda), fill: "hsl(var(--muted-foreground))" },
    { name: "Optimal", grams: Math.round(optimal), fill: "hsl(var(--primary))" },
    { name: "High / Athletic", grams: Math.round(high), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Body Weight", value: `${weightLb.toFixed(0)} lb / ${weightKg.toFixed(1)} kg` },
    { label: "Primary Goal", value: input.goal === "maintain" ? "Maintain Weight" : input.goal === "build" ? "Build Muscle" : "Lose Fat" },
    { label: "Activity Level", value: input.activity === "sedentary" ? "Sedentary" : input.activity === "moderate" ? "Moderately Active" : "Active / Athletic" },
    { label: "RDA (0.8 g/kg)", value: `${Math.round(rda)} g/day` },
    { label: "Optimal Target", value: `${Math.round(optimal)} g/day` },
    { label: "High / Athletic Target", value: `${Math.round(high)} g/day` },
    { label: "Per Pound of Body Weight", value: `${perLb.toFixed(2)} g/lb` },
    { label: "Calories from Protein (4 kcal/g)", value: `${Math.round(calories).toLocaleString()} kcal/day` },
  ];

  const summaryStats = [
    { label: "RDA (Bare Minimum)", value: `${Math.round(rda)} g/day` },
    { label: "Optimal Target", value: `${Math.round(optimal)} g/day` },
    { label: "High / Athletic Target", value: `${Math.round(high)} g/day` },
    { label: "Per Pound", value: `${perLb.toFixed(2)} g/lb` },
    { label: "Calories from Protein", value: `${Math.round(calories).toLocaleString()} kcal` },
    { label: "Meals (30g each)", value: `${Math.max(1, Math.round(optimal / 30))} meals` },
  ];

  return { weightKg, weightLb, rda, optimal, high, perLb, calories, chartData, breakdown, summaryStats };
}

const DEFAULTS: ProteinInput = { weight: 180, unit: "lb", goal: "maintain", activity: "moderate" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function ProteinIntakeCalculator() {
  const [weight, setWeight] = useState(String(DEFAULTS.weight));
  const [unit, setUnit] = useState<ProteinInput["unit"]>(DEFAULTS.unit);
  const [goal, setGoal] = useState<ProteinInput["goal"]>(DEFAULTS.goal);
  const [activity, setActivity] = useState<ProteinInput["activity"]>(DEFAULTS.activity);
  const [result, setResult] = useState<ProteinResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcProtein({ weight: parse(weight, DEFAULTS.weight), unit, goal, activity }));
  const reset = () => {
    setWeight(String(DEFAULTS.weight));
    setUnit(DEFAULTS.unit);
    setGoal(DEFAULTS.goal);
    setActivity(DEFAULTS.activity);
    setResult(calcProtein(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcProtein(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How much protein do I actually need?", answer: "The RDA (0.8 g/kg) is a bare minimum to prevent deficiency. Most active adults need 1.2–2.0 g/kg for optimal muscle recovery, satiety, and body composition. This calculator tiers targets by activity level and adjusts for your goal." },
    { question: "Does a high-protein diet damage kidneys?", answer: "In healthy individuals with normal kidney function, high protein intake has not been shown to cause kidney damage. Those with pre-existing kidney disease should strictly monitor protein intake under medical guidance." },
    { question: "Is the '1 gram per pound' rule accurate?", answer: "1 g per pound of body weight (2.2 g/kg) is a common bodybuilding target. It is excellent for maximizing muscle growth or preserving muscle while losing weight, though slightly higher than what most clinical studies show is strictly necessary." },
    { question: "How should I distribute protein through the day?", answer: "Spread intake across 3–5 meals. Muscle protein synthesis peaks with roughly 25–40 g per sitting; extra protein in a single meal is largely used for energy rather than muscle building." },
    { question: "Does protein help with fat loss?", answer: "Yes. Protein is the most satiating macronutrient and has the highest thermic effect (~20–30% of its calories are burned digesting it). Higher intake during a deficit preserves lean mass, so weight lost is mostly fat." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Protein Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Protein Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Body Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value as ProteinInput["unit"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="lb">Pounds (lb)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Primary Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value as ProteinInput["goal"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="maintain">Maintain Weight</option>
                  <option value="build">Build Muscle</option>
                  <option value="lose">Lose Fat</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Activity Level</label>
                <select value={activity} onChange={(e) => setActivity(e.target.value as ProteinInput["activity"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="sedentary">Sedentary</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Active / Athletic</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Optimal Daily Protein</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{Math.round(result.optimal)} g</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.perLb.toFixed(2)} g per lb · {Math.round(result.calories).toLocaleString()} kcal from protein</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["RDA (Min)", `${Math.round(result.rda)} g`], ["Optimal", `${Math.round(result.optimal)} g`], ["High / Athletic", `${Math.round(result.high)} g`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Protein Target Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Daily Targets Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} g/day`, ""]} />
                      <Bar dataKey="grams" radius={[4, 4, 0, 0]}>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Protein Matters</h2>
            <p>Protein is the building block of muscle, skin, enzymes, and hormones. Unlike fats and carbohydrates, the body does not store protein effectively, so a consistent daily intake is required. The RDA (0.8 g/kg) prevents deficiency, but optimal intake for active adults is substantially higher.</p>
            <h2 className="text-2xl font-bold mb-3">Protein and Fat Loss</h2>
            <p>In a caloric deficit, higher protein preserves lean muscle mass — so the weight you lose is fat, not muscle. Protein is also the most satiating macronutrient, helping you stay full longer between meals. This calculator boosts targets by 20% when the goal is fat loss.</p>
            <h2 className="text-2xl font-bold mb-3">Distribution Throughout the Day</h2>
            <p>Muscle protein synthesis responds best to 25–40 g of protein every 3–4 hours. Spreading your target across 3–5 meals gives better results than one giant protein-heavy meal, because the body uses excess protein in a single sitting largely for energy.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/protein-intake-calculator" />
          <PopularCalculators exclude="/calculator/protein-intake-calculator" />
        </div>
      </div>
    </>
  );
}
