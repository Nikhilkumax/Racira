"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Utensils } from "lucide-react";

const FatIntakeCalculator = () => {
  const [calories, setCalories] = useState("2000");
  const [dietType, setDietType] = useState("moderate"); // low, moderate, high/keto

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cals = parseFloat(calories);
    
    let pct = 0.30; // moderate by default
    if (dietType === "low") pct = 0.20;
    else if (dietType === "moderate") pct = 0.30;
    else if (dietType === "keto") pct = 0.70;

    const fatCalories = cals * pct;
    const fatGrams = fatCalories / 9; // 9 cals per gram of fat

    // Saturated fat limit (AHA recommends < 6-10%)
    const saturatedLimitGrams = (cals * 0.10) / 9;

    setResults({ 
      fatGrams: Math.round(fatGrams), 
      fatCalories: Math.round(fatCalories), 
      pct: pct * 100,
      saturatedLimitGrams: Math.round(saturatedLimitGrams)
    });
  };

  const reset = () => {
    setShowResults(false); setCalories("2000"); setDietType("moderate"); setResults(null); };

  const faqs = [
    { question: "How much fat should I eat daily?", answer: "The Dietary Guidelines for Americans suggest that 20% to 35% of total daily calories should come from fat. For a 2,000-calorie diet, this equates to roughly 44 to 78 grams of fat per day." },
    { question: "Are all fats the same?", answer: "No. Monounsaturated and polyunsaturated fats (found in olive oil, avocados, nuts, and fish) are heart-healthy and reduce inflammation. Saturated fats (found in red meat, butter, and cheese) should be limited to less than 10% of calories. Trans fats should be avoided entirely." },
    { question: "Why do fats have more calories?", answer: "Fats are energy-dense, containing 9 calories per gram. In contrast, proteins and carbohydrates contain only 4 calories per gram. This is why high-fat foods quickly add to your daily caloric total." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fat Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fat Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="cals" label="Total Daily Calories" value={calories} onChange={setCalories} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Diet Type</label>
                  <select value={dietType} onChange={e => setDietType(e.target.value)} className="input-calc">
                    <option value="low">Low Fat (20% calories)</option>
                    <option value="moderate">Moderate / Standard (30% calories)</option>
                    <option value="keto">High Fat / Ketogenic (70% calories)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Daily Fat Target</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Dietary Fat</p>
                    <p className="text-5xl font-black text-foreground">{results.fatGrams}g</p>
                    <p className="text-sm text-muted-foreground mt-1">per day</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Calories from Fat</p>
                    <p className="text-3xl font-black text-foreground">{results.fatCalories} kcal</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Diet Percentage", value: 0, textValue: results.pct + "% of total calories" },
                  { label: "Saturated Fat Limit", value: 0, textValue: "< " + results.saturatedLimitGrams + "g (10% limit)" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Importance of Dietary Fat</h2>
              <p>For decades, fat was demonized as the primary cause of weight gain and heart disease. Modern nutritional science has shown that dietary fat is essential for health, hormone production, and nutrient absorption.</p>
              <h3>Hormonal Balance and Fat</h3>
              <p>Your body needs fat to produce hormones, including testosterone and estrogen. Diets that are extremely low in fat (under 15-20% of calories) can lead to hormonal imbalances, fatigue, and fat-soluble vitamin (A, D, E, K) deficiencies.</p>
              <h3>The Ketogenic Diet</h3>
              <p>A ketogenic diet flips standard macros upside down, making fat the primary energy source (70-80% of calories). When carbohydrate intake is extremely low, the liver converts fats into ketones, which the brain and body use for fuel.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fat-intake" />
          <PopularCalculators exclude="/calculator/fat-intake-calculator" />
        </div>
      </div>
    </>
  );
};
export default FatIntakeCalculator;

