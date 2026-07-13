"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const activityLevels = [
  { value: 1.2, label: "Sedentary", desc: "Little or no exercise, desk job" },
  { value: 1.375, label: "Light", desc: "Light exercise 1-3 days/week" },
  { value: 1.55, label: "Moderate", desc: "Moderate exercise 3-5 days/week" },
  { value: 1.725, label: "Active", desc: "Hard exercise 6-7 days/week" },
  { value: 1.9, label: "Very Active", desc: "Athlete / physical job + training" },
];

const TDEECalculator = () => {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("70");
  const [heightCm, setHeightCm] = useState("170");
  const [activity, setActivity] = useState(1.55);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    bmr: number; tdee: number; cutCalories: number; bulkCalories: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight) || 0;
    const h = parseFloat(heightCm) || 0;
    const a = parseFloat(age) || 0;
    if (w <= 0 || h <= 0 || a <= 0) return;

    // Mifflin-St Jeor
    const bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const tdee = bmr * activity;
    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      cutCalories: Math.round(tdee - 500),
      bulkCalories: Math.round(tdee + 500),
    });
  };

  const reset = () => {
    setShowResults(false); setGender("male"); setAge("30"); setWeight("70"); setHeightCm("170"); setActivity(1.55); setResult(null); };

  const faqs = [
    { question: "What is TDEE?", answer: "Total Daily Energy Expenditure (TDEE) is the total number of calories you burn per day, including BMR, physical activity, and the thermic effect of food. It's the most important number for managing weight." },
    { question: "How do I use TDEE for weight loss?", answer: "To lose weight, eat 300-500 calories below your TDEE (caloric deficit). A 500 cal/day deficit results in approximately 0.45 kg (1 lb) of fat loss per week." },
    { question: "How accurate is TDEE?", answer: "TDEE estimates are within 10-15% accuracy. Tracking your actual weight changes over 2-3 weeks and adjusting calories is the most reliable approach." },
    { question: "Should I eat back exercise calories?", answer: "TDEE already includes exercise calories based on your activity level. If you use a separate tracker, be careful not to double-count exercise calories." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "TDEE Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">TDEE Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
                <div className="space-y-2">
                  {activityLevels.map(a => (
                    <button key={a.value} onClick={() => setActivity(a.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${activity === a.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      <span className="font-medium">{a.label}</span> — <span className="text-xs">{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Your TDEE</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-1">{result.tdee.toLocaleString()}</p>
                  <p className="text-muted-foreground">calories/day</p>
                </div>
                <ResultDisplay items={[
                  { label: "BMR (at rest)", value: 0, textValue: `${result.bmr} kcal` },
                  { label: "Maintenance (TDEE)", value: 0, textValue: `${result.tdee} kcal`, highlight: true },
                  { label: "Weight Loss (-500)", value: 0, textValue: `${result.cutCalories} kcal` },
                  { label: "Weight Gain (+500)", value: 0, textValue: `${result.bulkCalories} kcal` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is TDEE?</h2>
              <p>Total Daily Energy Expenditure (TDEE) is the total number of calories your body burns in a day. It combines your Basal Metabolic Rate (BMR) — calories burned at rest — with the energy used for physical activity, digestion, and non-exercise movement. TDEE is the cornerstone of any weight management plan.</p>

              <h2 className="text-2xl font-bold mb-3">How Is TDEE Calculated?</h2>
              <p><strong>TDEE = BMR × Activity Multiplier</strong></p>
              <p>This calculator uses the Mifflin-St Jeor equation for BMR (the most accurate for most people) and multiplies it by your activity factor.</p>

              <h2 className="text-2xl font-bold mb-3">Activity Multiplier Values</h2>
              <ul>
                <li><strong>Sedentary (×1.2):</strong> Office job, minimal movement</li>
                <li><strong>Light (×1.375):</strong> Walking, light gym 1-3×/week</li>
                <li><strong>Moderate (×1.55):</strong> Regular exercise 3-5×/week</li>
                <li><strong>Active (×1.725):</strong> Intense exercise 6-7×/week</li>
                <li><strong>Very Active (×1.9):</strong> Athlete, physical labor + training</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Using TDEE for Your Goals</h2>
              <ul>
                <li><strong>Weight loss:</strong> Eat 300-500 calories below TDEE (moderate deficit). Don't go below BMR.</li>
                <li><strong>Maintenance:</strong> Eat at TDEE to maintain current weight.</li>
                <li><strong>Muscle gain:</strong> Eat 300-500 calories above TDEE (lean bulk). Pair with strength training.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Common Mistakes</h2>
              <ul>
                <li>Overestimating activity level — most people are "Light" or "Moderate"</li>
                <li>Not adjusting as weight changes — recalculate TDEE every 5-10 kg</li>
                <li>Eating too far below TDEE — extreme deficits slow metabolism and lose muscle</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> TDEE is an estimate. Track your weight over 2-3 weeks and adjust calories accordingly. Consult a nutritionist for personalized plans.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tdee-calculator" />
          <PopularCalculators exclude="/tdee-calculator" />
        </div>
      </div>
    </>
  );
};

export default TDEECalculator;


