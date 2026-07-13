"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Droplets } from "lucide-react";

const WaterIntakeCalculator = () => {
  const [weight, setWeight] = useState("160");
  const [activity, setActivity] = useState("30"); // minutes of exercise
  const [climate, setClimate] = useState("moderate"); // moderate, hot
  const [unitSystem, setUnitSystem] = useState("imperial"); // imperial or metric

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const exercise = parseFloat(activity);

    const weightLb = unitSystem === "imperial" ? w : w * 2.20462;

    // Baseline: 0.5 oz to 1 oz per lb of body weight
    // We'll use 0.6 oz as a solid moderate baseline
    let baseOz = weightLb * 0.6;

    // Add 12 oz for every 30 mins of exercise
    const exerciseAddOz = (exercise / 30) * 12;

    // Add 10% for hot climate
    const climateMultiplier = climate === "hot" ? 1.1 : 1.0;

    const totalOz = (baseOz + exerciseAddOz) * climateMultiplier;
    
    // Conversions
    const totalLiters = totalOz * 0.0295735;
    const totalCups = totalOz / 8;

    setResults({ 
      oz: Math.round(totalOz), 
      liters: totalLiters.toFixed(2), 
      cups: Math.round(totalCups) 
    });
  };

  const reset = () => {
    setShowResults(false); setWeight("160"); setActivity("30"); setClimate("moderate"); setUnitSystem("imperial"); setResults(null); };

  const faqs = [
    { question: "Is the '8 glasses a day' rule true?", answer: "The '8 glasses a day' (64 ounces) rule is a reasonable baseline for some, but it's not a one-size-fits-all rule. Your true water needs depend on your body weight, activity level, climate, and overall health." },
    { question: "Does coffee or tea count toward my water intake?", answer: "Yes. While caffeine has a mild diuretic effect, the water in coffee and tea still contributes to your overall daily hydration. However, plain water should still make up the majority of your intake." },
    { question: "Can I drink too much water?", answer: "Yes, though it is rare. Drinking excessive amounts of water rapidly can lead to hyponatremia (water intoxication), a dangerous condition where sodium levels in the blood become too diluted." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Water Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Water Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit System</label>
                  <select value={unitSystem} onChange={e => setUnitSystem(e.target.value)} className="input-calc">
                    <option value="imperial">Pounds (lb)</option>
                    <option value="metric">Kilograms (kg)</option>
                  </select>
                </div>
                <InputField id="weight" label="Body Weight" value={weight} onChange={setWeight} />
                <InputField id="activity" label="Exercise (Minutes/Day)" value={activity} onChange={setActivity} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Climate</label>
                  <select value={climate} onChange={e => setClimate(e.target.value)} className="input-calc">
                    <option value="moderate">Moderate / Indoor</option>
                    <option value="hot">Hot / Humid</option>
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
                <h2 className="text-2xl font-bold mb-3">Daily Hydration Goal</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Volume (Ounces)</p>
                    <p className="text-5xl font-black text-foreground">{results.oz} oz</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Volume (Liters)</p>
                    <p className="text-3xl font-black text-foreground">{results.liters} L</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Standard Cups (8 oz)", value: 0, textValue: results.cups + " cups" },
                  { label: "Standard Bottles (16.9 oz)", value: 0, textValue: (results.oz / 16.9).toFixed(1) + " bottles" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Why Hydration is Essential</h2>
              <p>Water makes up about 60% of your body weight. It is vital for flushing toxins, lubricating joints, regulating body temperature, and transporting nutrients to cells. Even mild dehydration can impair energy levels and brain function.</p>
              <h3>Signs You Aren't Drinking Enough</h3>
              <p>Thirst is an obvious sign, but by the time you feel thirsty, you may already be slightly dehydrated. Other signs include dark yellow urine, fatigue, headaches, dry skin, and infrequent urination.</p>
              <h3>Factors That Increase Your Needs</h3>
              <p>You need to drink more water if you are exercising heavily, spending time in hot or humid environments, experiencing a fever, or experiencing fluid loss through vomiting or diarrhea. Pregnant and breastfeeding women also have significantly higher hydration requirements.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-intake" />
          <PopularCalculators exclude="/calculator/water-intake-calculator" />
        </div>
      </div>
    </>
  );
};
export default WaterIntakeCalculator;

