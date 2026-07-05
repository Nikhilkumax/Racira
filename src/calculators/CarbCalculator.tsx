"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Utensils } from "lucide-react";

const CarbCalculator = () => {
  const [calories, setCalories] = useState("2000");
  const [dietType, setDietType] = useState("moderate"); // keto, low, moderate, high

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cals = parseFloat(calories);
    
    let pct = 0.50; // moderate by default
    if (dietType === "keto") pct = 0.05;
    else if (dietType === "low") pct = 0.25;
    else if (dietType === "moderate") pct = 0.50;
    else if (dietType === "high") pct = 0.65;

    const carbCalories = cals * pct;
    const carbGrams = carbCalories / 4; // 4 cals per gram of carbohydrate

    // Recommended fiber (14g per 1000 cals)
    const fiber = (cals / 1000) * 14;

    setResults({ 
      carbGrams: Math.round(carbGrams), 
      carbCalories: Math.round(carbCalories), 
      pct: pct * 100,
      fiber: Math.round(fiber)
    });
  };

  const reset = () => {
    setShowResults(false); setCalories("2000"); setDietType("moderate"); setResults(null); };

  const faqs = [
    { question: "How many carbs should I eat daily?", answer: "The Dietary Guidelines for Americans recommend that carbohydrates make up 45-65% of your total daily calories. For a 2,000-calorie diet, that's 225-325 grams of carbs per day. However, optimal intake varies widely based on activity level and metabolic health." },
    { question: "What is the difference between simple and complex carbs?", answer: "Simple carbs (sugar, white bread) digest quickly, causing rapid blood sugar spikes. Complex carbs (whole grains, beans, vegetables) contain fiber, digesting slowly and providing sustained energy without severe blood sugar fluctuations." },
    { question: "What are net carbs?", answer: "Net carbs equal Total Carbs minus Dietary Fiber (and sometimes minus sugar alcohols). Because fiber isn't digested for energy in the small intestine, net carbs represent the carbohydrates that actually impact blood sugar. This concept is heavily used in Keto and low-carb diets." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Carb Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carbohydrate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="cals" label="Total Daily Calories" value={calories} onChange={setCalories} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Diet Type</label>
                  <select value={dietType} onChange={e => setDietType(e.target.value)} className="input-calc">
                    <option value="keto">Ketogenic (5% carbs)</option>
                    <option value="low">Low Carb (25% carbs)</option>
                    <option value="moderate">Moderate / Standard (50% carbs)</option>
                    <option value="high">High Carb / Athlete (65% carbs)</option>
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
                <h2 className="text-2xl font-bold mb-3">Daily Carb Target</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Carbohydrates</p>
                    <p className="text-5xl font-black text-foreground">{results.carbGrams}g</p>
                    <p className="text-sm text-muted-foreground mt-1">per day</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Calories from Carbs</p>
                    <p className="text-3xl font-black text-foreground">{results.carbCalories} kcal</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Diet Percentage", value: 0, textValue: results.pct + "% of total calories" },
                  { label: "Daily Fiber Goal", value: 0, textValue: results.fiber + "g minimum" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Role of Carbohydrates</h2>
              <p>Carbohydrates are the body's primary and preferred energy source. When digested, they are broken down into glucose, which fuels your brain, muscles, and organs.</p>
              <h3>Carbs and Exercise</h3>
              <p>If you are highly active, especially in endurance sports or high-intensity interval training, you need more carbohydrates. Muscle glycogen (stored carbs) is rapidly depleted during intense exercise, and replenishing it is essential for recovery.</p>
              <h3>Low Carb vs. Keto</h3>
              <p>A standard low-carb diet restricts carbs to about 20-30% of calories (often 100-150g per day). This can aid in weight loss and blood sugar control. A ketogenic diet severely restricts carbs to under 50g (usually 20-30g) to force the body into ketosis, where it burns fat for fuel instead of glucose.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carb" />
          <PopularCalculators exclude="/calculator/carb-calculator" />
        </div>
      </div>
    </>
  );
};
export default CarbCalculator;

