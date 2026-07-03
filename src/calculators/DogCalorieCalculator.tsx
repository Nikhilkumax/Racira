"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Bone } from "lucide-react";

const DogCalorieCalculator = () => {
  const [weight, setWeight] = useState("20");
  const [unit, setUnit] = useState("kg");
  const [activity, setActivity] = useState("active");
  const [isNeutered, setIsNeutered] = useState("yes");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let wInKg = parseFloat(weight) || 0;
    if (unit === "lbs") wInKg /= 2.20462;

    if (wInKg <= 0) return;

    // RER (Resting Energy Requirement) = 70 * (weight in kg)^0.75
    const rer = 70 * Math.pow(wInKg, 0.75);
    
    // Multipliers for MER (Maintenance Energy Requirement)
    let multiplier = 1.6; // Neutered adult
    if (isNeutered === "no") multiplier = 1.8;
    
    if (activity === "inactive") multiplier -= 0.4;
    if (activity === "working") multiplier += 1.0;

    const mer = rer * multiplier;

    setResults({
      rer,
      mer,
      multiplier
    });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("20"); setUnit("kg"); setActivity("active"); setIsNeutered("yes");
    setResults(null);
  };

  const faqs = [
    { question: "How many calories does my dog need?", answer: "Calorie needs vary based on age, breed, weight, and activity level. A 20kg neutered adult dog with typical activity needs about 900-1,000 calories per day." },
    { question: "What is RER vs MER?", answer: "RER (Resting Energy Requirement) is the energy needed for basic body functions at rest. MER (Maintenance Energy Requirement) accounts for activity, life stage, and metabolism." },
    { question: "Should I count treats in the calorie total?", answer: "Yes! Treats should make up no more than 10% of your dog's total daily calorie intake. If you give high-calorie treats, you must reduce their main meal size accordingly." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dog Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="weight" label="Weight" value={weight} onChange={setWeight} />
                  </div>
                  <div className="w-20 mt-7">
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Activity Level</label>
                  <select value={activity} onChange={(e) => setActivity(e.target.value)} className="input-calc">
                    <option value="inactive">Sedentary / Inactive</option>
                    <option value="active">Typically Active</option>
                    <option value="working">Working / Athlete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Neutered/Spayed</label>
                  <select value={isNeutered} onChange={(e) => setIsNeutered(e.target.value)} className="input-calc">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Daily Nutrition Plan</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Target Calories</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.mer)} <span className="text-xl">kcal</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Resting Energy (RER)</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.rer)} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Activity Multiplier", value: 0, textValue: results.multiplier.toFixed(1) + "x" },
                  { label: "Treat Allowance (10%)", value: 0, textValue: Math.round(results.mer * 0.1) + " kcal" },
                  { label: "Main Meal Energy", value: 0, textValue: Math.round(results.mer * 0.9) + " kcal" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Feeding Your Dog for Longevity</h2>
              <p>Maintaining a healthy weight is the single most important factor in extending your dog's life. Even a slight excess in calories can lead to obesity-related joint issues and health complications.</p>
              <h3>Understanding Caloric Density</h3>
              <p>Different dog foods have vastly different caloric densities. A high-protein kibble might have 450 kcal per cup, while a 'healthy weight' formula might only have 300 kcal. Always check the packaging for the 'kcal/kg' or 'kcal/cup' measurement and use this calculator's result to measure precisely.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-calorie" />
          <PopularCalculators exclude="/calculator/dog-calorie-calculator" />
        </div>
      </div>
    </>
  );
};

export default DogCalorieCalculator;

