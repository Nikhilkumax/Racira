"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WaterInput {
  weight: number;
  exerciseMinutes: number;
  climate: "mild" | "hot";
}

interface WaterResult {
  baseOunces: number;
  exerciseOunces: number;
  totalOunces: number;
  cups: number;
  liters: number;
  bottles: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWater(input: WaterInput): WaterResult {
  const baseOunces = input.weight * 0.67; // 2/3 oz per lb rule
  const exerciseOunces = (input.exerciseMinutes / 30) * 12;
  const climateBonus = input.climate === "hot" ? baseOunces * 0.1 : 0;
  const totalOunces = baseOunces + exerciseOunces + climateBonus;
  const cups = totalOunces / 8;
  const liters = totalOunces / 33.814;
  const bottles = totalOunces / 16.9;

  const donutData = [
    { name: "Base Intake", value: Number((baseOunces + climateBonus).toFixed(0)), color: "hsl(var(--primary))" },
    { name: "Exercise Addition", value: Number(exerciseOunces.toFixed(0)), color: "#10b981" },
  ];

  const breakdown = [
    { label: "Body Weight", value: `${input.weight.toFixed(0)} lb` },
    { label: "Exercise / Day", value: `${input.exerciseMinutes} min` },
    { label: "Climate", value: input.climate === "hot" ? "Hot / Humid (+10%)" : "Mild" },
    { label: "Base Intake (2/3 oz/lb)", value: `${(baseOunces + climateBonus).toFixed(0)} oz` },
    { label: "Exercise Addition", value: `${exerciseOunces.toFixed(0)} oz` },
    { label: "Total Daily Intake", value: `${totalOunces.toFixed(0)} oz` },
    { label: "Cups (8 oz)", value: `${cups.toFixed(0)} cups` },
    { label: "Liters", value: `${liters.toFixed(2)} L` },
    { label: "Water Bottles (16.9 oz)", value: `${bottles.toFixed(1)} bottles` },
  ];

  const summaryStats = [
    { label: "Total Intake", value: `${totalOunces.toFixed(0)} oz` },
    { label: "Liters", value: `${liters.toFixed(2)} L` },
    { label: "Cups", value: `${cups.toFixed(0)}` },
    { label: "Bottles (16.9 oz)", value: `${bottles.toFixed(1)}` },
    { label: "Base Intake", value: `${baseOunces.toFixed(0)} oz` },
    { label: "Per 8-Hour Workday", value: `${(totalOunces / 8).toFixed(1)} oz/hr` },
  ];

  return { baseOunces, exerciseOunces, totalOunces, cups, liters, bottles, donutData, breakdown, summaryStats };
}

const DEFAULTS: WaterInput = { weight: 175, exerciseMinutes: 30, climate: "mild" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState(String(DEFAULTS.weight));
  const [exercise, setExercise] = useState(String(DEFAULTS.exerciseMinutes));
  const [climate, setClimate] = useState<WaterInput["climate"]>(DEFAULTS.climate);
  const [result, setResult] = useState<WaterResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcWater({ weight: parse(weight, DEFAULTS.weight), exerciseMinutes: parse(exercise, DEFAULTS.exerciseMinutes), climate }));
  const reset = () => {
    setWeight(String(DEFAULTS.weight));
    setExercise(String(DEFAULTS.exerciseMinutes));
    setClimate(DEFAULTS.climate);
    setResult(calcWater(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcWater(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How much water should I drink a day?", answer: "The 2/3 rule is a solid baseline: drink 0.67 ounces of water per pound of body weight — about 117 oz (3.5 L) for a 175 lb person — plus 12 oz for every 30 minutes of exercise. Adjust for hot climates and heavy sweating." },
    { question: "Is 8 glasses of water a day accurate?", answer: "The '8×8' rule (64 oz) is a rounded minimum, not a personalized target. Larger, more active people need significantly more. Your actual need scales with body weight, activity, climate, and diet — the 2/3-oz-per-pound formula accounts for all of these." },
    { question: "What counts as water intake?", answer: "Plain water is best, but milk, tea, coffee, and water-rich foods (fruits, soups) all count toward hydration. Caffeine's diuretic effect is mild for regular consumers — coffee still hydrates on net. Alcohol is the exception: it dehydrates rather than hydrates." },
    { question: "What are signs of dehydration?", answer: "Dark urine, thirst, headache, fatigue, dry mouth, and reduced focus are early signs. Mild dehydration of just 1–2% of body weight measurably impairs cognition and physical performance. Drink before you feel thirsty — thirst lags behind actual need." },
    { question: "Can I drink too much water?", answer: "Yes — hyponatremia (water intoxication) occurs when extreme intake dilutes blood sodium, usually from drinking several gallons in hours while sweating heavily or during endurance events. For normal daily hydration, exceeding your target by a liter or two is harmless." },
    { question: "How does exercise change water needs?", answer: "Add roughly 12 oz for every 30 minutes of moderate exercise — more in heat or for intense effort. Weigh yourself before and after workouts: every pound lost to sweat equals about 16 oz of fluid to replace. Sports drinks help for sessions over an hour." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Water Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Water Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Body Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Daily Exercise</label>
                <div className={inp}><input type="number" value={exercise} onChange={(e) => setExercise(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Climate</label>
                <select value={climate} onChange={(e) => setClimate(e.target.value as WaterInput["climate"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="mild">Mild / Temperate</option>
                  <option value="hot">Hot / Humid</option>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Daily Water Intake</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.totalOunces.toFixed(0)} oz</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.liters.toFixed(2)} L · {result.cups.toFixed(0)} cups · {result.bottles.toFixed(1)} bottles</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Liters", `${result.liters.toFixed(2)} L`], ["Cups", `${result.cups.toFixed(0)}`], ["Bottles (16.9 oz)", `${result.bottles.toFixed(1)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Hydration Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Intake Composition</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} oz`, ""]} />
                      <Legend />
                    </PieChart>
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
            <h2 className="text-2xl font-bold mb-3">Personalizing Your Hydration Target</h2>
            <p>Water needs are individual. The widely cited 2/3-ounce-per-pound rule scales your baseline to body size, then this calculator adds exercise fluid and a hot-climate bonus. For a 175 lb adult: about 117 oz baseline, 12 oz for 30 minutes of exercise, and roughly 12 more in heat — a total near 141 oz on active summer days.</p>
            <h2 className="text-2xl font-bold mb-3">Why Hydration Matters</h2>
            <p>Water regulates temperature, transports nutrients, lubricates joints, and clears waste. Even mild dehydration degrades mood, concentration, and physical performance. Athletes can lose 1–2% of body weight in sweat during a single session — replacing that fluid is essential for recovery and next-day performance.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Habits</h2>
            <p>Drink a glass on waking, one with every meal, and one before and after workouts. Carry a marked bottle and track against your target. Let urine color be your guide — pale yellow means well hydrated. Over the course of a day, sipping steadily beats chugging large volumes all at once.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-intake-calculator" />
          <PopularCalculators exclude="/calculator/water-intake-calculator" />
        </div>
      </div>
    </>
  );
}
