"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { RotateCcw, Apple, Info, Leaf, Utensils } from "lucide-react";

const FoodCarbonFootprintCalculator = () => {
  const [dietType, setDietType] = useState("average");
  const [calories, setCalories] = useState("2000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cals = parseFloat(calories) || 2000;
    
    // Emission factors (kg CO2e per 2000 kcal per day, annual total)
    // Source: Oxford Study (Scarborough et al. 2014)
    const factors: any = {
      meat_heavy: 7.19 * 365, // > 100g meat/day
      meat_medium: 5.63 * 365, // 50-100g meat/day
      meat_low: 4.67 * 365, // < 50g meat/day
      pescatarian: 3.91 * 365,
      vegetarian: 3.81 * 365,
      vegan: 2.89 * 365,
      average: 5.50 * 365
    };

    const calorieMult = cals / 2000;
    const annualCO2 = factors[dietType] * calorieMult;

    setResults({
      annualCO2,
      annualTons: annualCO2 / 1000,
      dailyKG: annualCO2 / 365,
      treesNeeded: Math.ceil(annualCO2 / 20),
      savingsVsAverage: factors['average'] * calorieMult - annualCO2
    });
  };

  const reset = () => {
    setShowResults(false);
    setDietType("average"); setCalories("2000");
    setResults(null);
  };

  const faqs = [
    { question: "Why does meat have a higher carbon footprint?", answer: "Raising livestock requires vast amounts of land and water, and cattle produce methane, a potent greenhouse gas. Additionally, the process of growing grain to feed animals is much less efficient than humans eating plants directly." },
    { question: "How much impact does a vegan diet have?", answer: "A vegan diet generally has the lowest carbon footprint, typically 50-60% lower than a meat-heavy diet. Most of these savings come from the elimination of beef and lamb." },
    { question: "Is local food always better?", answer: "Not necessarily. 'Food miles' (transportation) usually account for only 5-10% of a food's total footprint. What you eat (e.g., plants vs. beef) matters much more than where it came from." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Food Carbon Footprint Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Food Carbon Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Dietary Habit</label>
                  <select value={dietType} onChange={(e) => setDietType(e.target.value)} className="input-calc">
                    <option value="meat_heavy">Meat Heavy (&gt;100g/day)</option>
                    <option value="meat_medium">Medium Meat (50-100g/day)</option>
                    <option value="meat_low">Low Meat (&lt;50g/day)</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="average">Average Global Diet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Daily Calorie Intake</label>
                  <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="input-calc" placeholder="e.g. 2000" />
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Info className="h-3 w-3" /> Higher calorie intake increases total emissions.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Apple className="h-5 w-5" /> Calculate Diet Impact
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Dietary Impact Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual Diet CO2e</p>
                    <p className="text-5xl font-black text-foreground">{results.annualTons.toFixed(2)} <span className="text-xl font-normal text-muted-foreground">Tons</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Daily Footprint</p>
                    <p className="text-3xl font-black text-foreground">{results.dailyKG.toFixed(1)} kg</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <ResultDisplay items={[
                    { label: "Trees to Offset (1yr)", value: 0, textValue: results.treesNeeded + " trees" },
                    { label: dietType === 'average' ? "Status" : results.savingsVsAverage > 0 ? "CO2 Saved vs Average" : "Extra CO2 vs Average", 
                      value: 0, 
                      textValue: dietType === 'average' ? "Benchmark" : Math.abs(results.savingsVsAverage).toFixed(0) + " kg" }
                  ]} />
                  <div className="flex justify-center">
                    <PieChart
                      segments={[
                        { label: "Your Diet", value: results.annualCO2, color: "hsl(142, 70%, 45%)" },
                        { label: "Avg Gap", value: Math.max(0, 2000 - results.annualCO2/1000), color: "hsl(220, 10%, 90%)" },
                      ]}
                      size={160}
                    />
                  </div>
                </div>

                {results.savingsVsAverage > 500 && (
                  <div className="mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 text-sm flex items-center gap-3">
                    <Leaf className="h-5 w-5 shrink-0" />
                    <p>Great job! Your diet saves over <strong>{Math.floor(results.savingsVsAverage)}kg of CO2</strong> annually compared to the average diet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Food and the Environment</h2>
              <p>Food production is responsible for about one-quarter of the world's greenhouse gas emissions. This includes everything from the fertilizer used on crops to the fuel used for transportation.</p>
              <h3>The Hierarchy of Impacts</h3>
              <p>Beef and lamb have by far the largest impact due to methane production and the vast amounts of land they require. Dairy products follow closely. In contrast, poultry and eggs have a significantly lower footprint, while plant-based foods like legumes, grains, and vegetables have the lowest of all.</p>
              <h3>Beyond CO2: Water and Land</h3>
              <p>While this calculator focuses on carbon emissions, diet choice also affects water usage and land conservation. A plant-based diet typically requires 75% less agricultural land than one rich in animal products—land that could instead be used for forests to naturally sequester carbon.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/food-carbon-footprint" />
          <PopularCalculators exclude="/calculator/food-carbon-footprint-calculator" />
        </div>
      </div>
    </>
  );
};

export default FoodCarbonFootprintCalculator;

