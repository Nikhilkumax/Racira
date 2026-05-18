"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const activityMultipliers = [
  { value: 1.2, label: "Sedentary" },
  { value: 1.375, label: "Light Active" },
  { value: 1.55, label: "Moderate Active" },
  { value: 1.725, label: "Very Active" },
  { value: 1.9, label: "Extra Active" },
];

const CalorieCalculator = () => {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("70");
  const [heightCm, setHeightCm] = useState("170");
  const [activity, setActivity] = useState(1.55);
  const [showResults, setShowResults] = useState(false);
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [result, setResult] = useState<{
    bmr: number; tdee: number; targetCalories: number; protein: number; carbs: number; fat: number; weeksToGoal: string;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight) || 0;
    const h = parseFloat(heightCm) || 0;
    const a = parseFloat(age) || 0;
    if (w <= 0 || h <= 0 || a <= 0) return;

    const bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const tdee = bmr * activity;
    let target: number;
    let weeks: string;

    if (goal === "lose") {
      target = tdee - 500; // ~0.45 kg/week loss
      weeks = "~0.45 kg/week loss";
    } else if (goal === "gain") {
      target = tdee + 500;
      weeks = "~0.45 kg/week gain";
    } else {
      target = tdee;
      weeks = "Weight maintenance";
    }

    // Basic macro split: 30% protein, 40% carbs, 30% fat
    const protein = Math.round((target * 0.30) / 4);
    const carbs = Math.round((target * 0.40) / 4);
    const fat = Math.round((target * 0.30) / 9);

    setResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories: Math.round(target), protein, carbs, fat, weeksToGoal: weeks });
  };

  const reset = () => {
    setShowResults(false); setGender("male"); setAge("30"); setWeight("70"); setHeightCm("170"); setActivity(1.55); setGoal("maintain"); setResult(null); };

  const faqs = [
    { question: "How many calories should I eat to lose weight?", answer: "A safe caloric deficit is 300-500 calories below your TDEE. This produces roughly 0.3-0.5 kg of weight loss per week. Never eat below your BMR for extended periods." },
    { question: "Are all calories equal?", answer: "Calorically yes, but nutritionally no. 100 calories of broccoli and 100 calories of candy have vastly different effects on satiety, insulin, and nutrient intake. Focus on nutrient-dense whole foods." },
    { question: "How accurate are calorie calculators?", answer: "Calorie calculators provide estimates within 10-15% accuracy. Use them as a starting point and adjust based on real-world results over 2-3 weeks." },
    { question: "Should I eat more on workout days?", answer: "Your TDEE already factors in average activity. If you have very intense workout days, you might eat 100-200 extra calories on those days and slightly less on rest days." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Calorie Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Calorie Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate your daily calorie needs for weight loss, maintenance, or muscle gain.</p>

            <div className="card-calculator mb-8">
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
                  {activityMultipliers.map(a => (
                    <button key={a.value} onClick={() => setActivity(a.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activity === a.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>{a.label}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Goal</label>
                <div className="flex gap-2">
                  <button onClick={() => setGoal("lose")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${goal === "lose" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Lose Weight</button>
                  <button onClick={() => setGoal("maintain")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${goal === "maintain" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Maintain</button>
                  <button onClick={() => setGoal("gain")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${goal === "gain" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Gain Weight</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Calories</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Daily Calorie Target</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-1">{result.targetCalories.toLocaleString()}</p>
                  <p className="text-muted-foreground">calories/day — {result.weeksToGoal}</p>
                </div>
                <ResultDisplay items={[
                  { label: "BMR", value: 0, textValue: `${result.bmr} kcal` },
                  { label: "TDEE (Maintenance)", value: 0, textValue: `${result.tdee} kcal` },
                  { label: "Target Calories", value: 0, textValue: `${result.targetCalories} kcal`, highlight: true },
                  { label: "Protein", value: 0, textValue: `${result.protein}g (30%)` },
                  { label: "Carbs", value: 0, textValue: `${result.carbs}g (40%)` },
                  { label: "Fat", value: 0, textValue: `${result.fat}g (30%)` },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>How to Calculate Daily Calorie Needs</h2>
              <p>Your daily calorie needs are determined by your Basal Metabolic Rate (BMR) — the calories burned at rest — multiplied by an activity factor to get Total Daily Energy Expenditure (TDEE). This calculator uses the Mifflin-St Jeor equation, considered the most accurate for most adults.</p>

              <h2>Calorie Targets by Goal</h2>
              <ul>
                <li><strong>Weight Loss:</strong> TDEE minus 300-500 calories. Produces 0.3-0.5 kg/week loss. Avoid going below BMR.</li>
                <li><strong>Maintenance:</strong> Eat at TDEE to maintain current weight and body composition.</li>
                <li><strong>Weight/Muscle Gain:</strong> TDEE plus 300-500 calories. Pair with progressive resistance training for muscle gain rather than fat gain.</li>
              </ul>

              <h2>Understanding Macronutrients</h2>
              <ul>
                <li><strong>Protein (4 cal/g):</strong> Essential for muscle repair, satiety, and metabolism. Aim for 1.6-2.2g per kg of bodyweight.</li>
                <li><strong>Carbohydrates (4 cal/g):</strong> Primary energy source for brain and muscles. Choose complex carbs over simple sugars.</li>
                <li><strong>Fat (9 cal/g):</strong> Essential for hormones, vitamin absorption, and cell function. Don't go below 20% of calories.</li>
              </ul>

              <h2>Tips for Accurate Calorie Tracking</h2>
              <ul>
                <li>Use a food scale rather than volume measurements</li>
                <li>Track consistently for at least 2 weeks before adjusting</li>
                <li>Weigh yourself daily and use weekly averages</li>
                <li>Account for cooking oils, sauces, and beverages</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Calorie estimates are approximations. Individual metabolism varies. Consult a registered dietitian for medical nutrition therapy.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-calculator" />
            <PopularCalculators exclude="/calorie-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default CalorieCalculator;


