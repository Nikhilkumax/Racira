"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Droplets } from "lucide-react";

const HydrationCalculator = () => {
  const [weight, setWeight] = useState("70");
  const [activityTime, setActivityTime] = useState("30");
  const [climate, setClimate] = useState("temperate");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight) || 0;
    const activity = parseFloat(activityTime) || 0;
    
    // Basic formula: 35ml per kg of body weight
    let intakeMl = w * 35;
    
    // Add 500ml for every 30 mins of activity
    intakeMl += (activity / 30) * 500;
    
    // Climate adjustment
    if (climate === "hot") intakeMl += 500;
    if (climate === "cold") intakeMl -= 200;

    const liters = intakeMl / 1000;
    const ounces = intakeMl / 29.5735;
    const glasses = intakeMl / 250; // 250ml per glass

    setResults({ liters, ounces, glasses });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("70");
    setActivityTime("30");
    setClimate("temperate");
    setResults(null);
  };

  const faqs = [
    { question: "How much water should I drink a day?", answer: "While the '8 glasses a day' rule is famous, the real amount depends on your weight, activity level, and climate. Most adults need between 2 and 3.5 liters of total fluid daily, some of which comes from food." },
    { question: "Does coffee count toward hydration?", answer: "Yes! Recent studies show that moderate caffeine intake does not cause significant dehydration, and the water in coffee or tea contributes to your daily fluid intake." },
    { question: "What are the signs of dehydration?", answer: "Common signs include dark-colored urine, dry mouth, fatigue, dizziness, and confusion. If your urine is pale yellow (like lemonade), you are likely well-hydrated." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Hydration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Daily Hydration Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="weight" label="Weight (kg)" value={weight} onChange={setWeight} />
                <InputField id="activity" label="Daily Exercise (mins)" value={activityTime} onChange={setActivityTime} />
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Climate Type</label>
                  <select 
                    value={climate} 
                    onChange={(e) => setClimate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="cold">Cold / Winter</option>
                    <option value="temperate">Temperate / Mild</option>
                    <option value="hot">Hot / Summer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Recommended Daily Intake</h2>
                <p className="text-6xl font-extrabold">{results.liters.toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground mt-2">Approximately {Math.round(results.ounces)} oz or {Math.round(results.glasses)} glasses</p>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-bold text-blue-600 uppercase">Liters</p>
                      <p className="text-lg font-bold">{results.liters.toFixed(2)}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-bold text-blue-600 uppercase">Ounces</p>
                      <p className="text-lg font-bold">{Math.round(results.ounces)}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-bold text-blue-600 uppercase">Glasses</p>
                      <p className="text-lg font-bold">{Math.round(results.glasses)}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-bold text-blue-600 uppercase">Milliliters</p>
                      <p className="text-lg font-bold">{Math.round(results.liters * 1000)}</p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Importance of Staying Hydrated</h2>
              <p>Water is the most essential nutrient for the human body. Every cell, tissue, and organ needs water to work properly. From regulating body temperature to lubricating joints and carrying nutrients to cells, staying hydrated is a cornerstone of metabolic health.</p>
              <h3>Factors That Increase Your Needs</h3>
              <p>While this calculator provides a baseline, you should increase your intake if you have a fever, are pregnant or breastfeeding, or are consuming high amounts of fiber or protein. Additionally, if you work outdoors or in a physically demanding job, your needs may be significantly higher than the average person.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hydration-calculator" />
          <PopularCalculators exclude="/calculator/hydration-calculator" />
        </div>
      </div>
    </>
  );
};

export default HydrationCalculator;

