"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const MacroCalculator = () => {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("70");
  const [heightCm, setHeightCm] = useState("170");
  const [activity, setActivity] = useState(1.55);
  const [showResults, setShowResults] = useState(false);
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [split, setSplit] = useState<"balanced" | "lowcarb" | "highprotein" | "keto">("balanced");
  const [result, setResult] = useState<{
    calories: number; protein: number; carbs: number; fat: number;
    proteinCal: number; carbsCal: number; fatCal: number;
    proteinPct: number; carbsPct: number; fatPct: number;
  } | null>(null);

  const macroSplits = {
    balanced: { protein: 30, carbs: 40, fat: 30, label: "Balanced (30/40/30)" },
    lowcarb: { protein: 35, carbs: 25, fat: 40, label: "Low Carb (35/25/40)" },
    highprotein: { protein: 40, carbs: 30, fat: 30, label: "High Protein (40/30/30)" },
    keto: { protein: 25, carbs: 5, fat: 70, label: "Keto (25/5/70)" },
  };

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight) || 0;
    const h = parseFloat(heightCm) || 0;
    const a = parseFloat(age) || 0;
    if (w <= 0 || h <= 0 || a <= 0) return;

    const bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    let calories = bmr * activity;
    if (goal === "lose") calories -= 500;
    if (goal === "gain") calories += 500;
    calories = Math.round(calories);

    const s = macroSplits[split];
    const proteinCal = Math.round(calories * s.protein / 100);
    const carbsCal = Math.round(calories * s.carbs / 100);
    const fatCal = Math.round(calories * s.fat / 100);

    setResult({
      calories,
      protein: Math.round(proteinCal / 4),
      carbs: Math.round(carbsCal / 4),
      fat: Math.round(fatCal / 9),
      proteinCal, carbsCal, fatCal,
      proteinPct: s.protein, carbsPct: s.carbs, fatPct: s.fat,
    });
  };

  const reset = () => {
    setShowResults(false); setGender("male"); setAge("30"); setWeight("70"); setHeightCm("170"); setActivity(1.55); setGoal("maintain"); setSplit("balanced"); setResult(null); };

  const faqs = [
    { question: "What are macros?", answer: "Macros (macronutrients) are the three main nutrients that provide energy: protein (4 cal/g), carbohydrates (4 cal/g), and fat (9 cal/g). Tracking macros helps optimize body composition beyond just counting calories." },
    { question: "Which macro split should I choose?", answer: "Balanced (30/40/30) works for most people. High protein is ideal for muscle building. Low carb helps with insulin sensitivity. Keto is for fat-adapted athletes or medical protocols." },
    { question: "How much protein do I need?", answer: "For muscle maintenance: 1.2-1.6g/kg bodyweight. For muscle growth: 1.6-2.2g/kg. For fat loss while preserving muscle: 2.0-2.4g/kg." },
    { question: "Do I need to hit macros exactly?", answer: "No. Aim within ±5g for protein and ±10g for carbs/fat. Consistency over perfection matters more for results." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Macro Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Macro Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your daily protein, carbs, and fat targets based on your goals.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6 flex gap-2">
                <button onClick={() => setGender("male")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "male" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Male</button>
                <button onClick={() => setGender("female")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "female" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Female</button>
              </div>

              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="age" label="Age" value={age} onChange={setAge} suffix="years" />
                <InputField id="weight" label="Weight" value={weight} onChange={setWeight} suffix="kg" />
                <InputField id="heightCm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Activity Level</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    [1.2, "Sedentary"], [1.375, "Light"], [1.55, "Moderate"], [1.725, "Active"], [1.9, "Very Active"]
                  ] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setActivity(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activity === v ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Goal</label>
                <div className="flex gap-2">
                  {([["lose", "Lose Fat"], ["maintain", "Maintain"], ["gain", "Build Muscle"]] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setGoal(v)} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${goal === v ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Macro Split</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(macroSplits) as [string, { label: string }][]).map(([k, v]) => (
                    <button key={k} onClick={() => setSplit(k as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${split === k ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>{v.label}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Macros</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-xl font-bold mb-4">Your Daily Macros</h2>
                <div className="text-center mb-4">
                  <p className="text-3xl font-extrabold">{result.calories} kcal/day</p>
                </div>

                {/* Macro bar visual */}
                <div className="flex h-6 rounded-full overflow-hidden mb-4">
                  <div className="bg-blue-500" style={{ width: `${result.proteinPct}%` }} title="Protein" />
                  <div className="bg-amber-400" style={{ width: `${result.carbsPct}%` }} title="Carbs" />
                  <div className="bg-red-400" style={{ width: `${result.fatPct}%` }} title="Fat" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />Protein {result.proteinPct}%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" />Carbs {result.carbsPct}%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" />Fat {result.fatPct}%</span>
                </div>

                <ResultDisplay items={[
                  { label: "Protein", value: 0, textValue: `${result.protein}g (${result.proteinCal} kcal)`, highlight: true },
                  { label: "Carbohydrates", value: 0, textValue: `${result.carbs}g (${result.carbsCal} kcal)` },
                  { label: "Fat", value: 0, textValue: `${result.fat}g (${result.fatCal} kcal)` },
                  { label: "Total Calories", value: 0, textValue: `${result.calories} kcal` },
                ]} />
              </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is a Macro Calculator?</h2>
              <p>A macro calculator determines your optimal daily intake of the three macronutrients — protein, carbohydrates, and fat — based on your body stats, activity level, and fitness goals. Unlike simple calorie counting, macro tracking ensures you're getting the right balance of nutrients for body composition goals.</p>

              <h2>Macro Split Options Explained</h2>
              <ul>
                <li><strong>Balanced (30/40/30):</strong> Best for general fitness and health. Suitable for most people starting their nutrition journey.</li>
                <li><strong>Low Carb (35/25/40):</strong> Beneficial for insulin-resistant individuals or those who feel better on fewer carbs. Improves fat oxidation.</li>
                <li><strong>High Protein (40/30/30):</strong> Ideal for muscle building and fat loss. Higher protein maximizes muscle protein synthesis and satiety.</li>
                <li><strong>Keto (25/5/70):</strong> Very low carb, high fat. Forces the body into ketosis. Best for specific medical conditions or experienced dieters.</li>
              </ul>

              <h2>How to Track Macros</h2>
              <ul>
                <li>Use a food tracking app (MyFitnessPal, Cronometer, MacroFactor)</li>
                <li>Invest in a kitchen scale for accurate portions</li>
                <li>Plan meals ahead to hit targets consistently</li>
                <li>Focus on hitting protein first, then fill carbs and fats</li>
              </ul>

              <h2>Protein Sources by Grams</h2>
              <ul>
                <li>Chicken breast (100g): ~31g protein</li>
                <li>Eggs (1 large): ~6g protein</li>
                <li>Greek yogurt (100g): ~10g protein</li>
                <li>Lentils (100g cooked): ~9g protein</li>
                <li>Whey protein (1 scoop): ~25g protein</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Macro recommendations are general guidelines. Individual needs vary based on metabolism, health conditions, and training intensity. Consult a registered dietitian for personalized plans.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/macro-calculator" />
          <PopularCalculators exclude="/macro-calculator" />
        </div>
      </div>
    </>
  );
};

export default MacroCalculator;


