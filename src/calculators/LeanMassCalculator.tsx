"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Dumbbell } from "lucide-react";

const LeanMassCalculator = () => {
  const [weight, setWeight] = useState("80");
  const [bodyFat, setBodyFat] = useState("20");
  const [unit, setUnit] = useState("kg");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight) || 0;
    const fat = parseFloat(bodyFat) || 0;

    if (w <= 0) return;

    // Fat Mass = Weight * (Body Fat % / 100)
    const fatMass = w * (fat / 100);
    // Lean Mass = Weight - Fat Mass
    const leanMass = w - fatMass;

    setResults({
      leanMass,
      fatMass,
      unitLabel: unit
    });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("80"); setBodyFat("20"); setUnit("kg");
    setResults(null);
  };

  const faqs = [
    { question: "What is Lean Body Mass?", answer: "Lean Body Mass (LBM) is the total weight of your body minus all the weight due to your fat mass. It includes the weight of your bones, muscles, organs, and water." },
    { question: "How do I find my body fat percentage?", answer: "Common methods include using skinfold calipers, bioelectrical impedance scales, DXA scans, or the 'Navy Body Fat' method using tape measurements of your neck, waist, and hips." },
    { question: "Why is tracking lean mass important?", answer: "Tracking lean mass is critical for athletes and those on weight loss journeys. It ensures that you are losing fat while maintaining or building muscle, which is essential for a healthy metabolism." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Lean Mass Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lean Body Mass Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your lean body mass and body fat weight to better track your fitness and body composition goals.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="weight" label="Body Weight" value={weight} onChange={setWeight} />
                  </div>
                  <div className="w-24 mt-7">
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
                <InputField id="fat" label="Body Fat Percentage" value={bodyFat} onChange={setBodyFat} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Dumbbell className="h-5 w-5" /> Calculate Lean Mass
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Body Composition Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Lean Body Mass</p>
                    <p className="text-5xl font-black text-foreground">{results.leanMass.toFixed(1)} <span className="text-xl">{results.unitLabel}</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Fat Mass</p>
                    <p className="text-3xl font-black text-foreground">{results.fatMass.toFixed(1)} <span className="text-sm font-normal">{results.unitLabel}</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Lean Mass Ratio", value: 0, textValue: (100 - parseFloat(bodyFat)) + "%" },
                  { label: "BMR Estimate", value: 0, textValue: Math.round(370 + (21.6 * (unit === "lb" ? results.leanMass / 2.20462 : results.leanMass))) + " kcal" },
                  { label: "Status", value: 0, textValue: parseFloat(bodyFat) < 15 ? "Athletic" : parseFloat(bodyFat) < 25 ? "Average" : "High Fat" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Beyond the Scale</h2>
              <p>Your total body weight only tells part of the story. Two people can weigh 200 pounds, but one may be an elite athlete with 10% body fat, while the other may be sedentary with 35% body fat. Lean mass tracking helps you understand what your weight is actually composed of.</p>
              <h3>The Importance of Muscle</h3>
              <p>Muscle tissue is more metabolically active than fat tissue. This means that having a higher lean body mass increases your Basal Metabolic Rate (BMR) — the number of calories your body burns at rest. Building lean mass through resistance training is one of the most effective ways to manage weight long-term.</p>
              <h3>Tracking Progress</h3>
              <p>When you go on a diet, the scale might drop, but if you are losing muscle instead of fat, your metabolism will slow down. By calculating your lean mass regularly, you can ensure that your weight loss is coming from fat stores while your strength and health are preserved.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lean-mass" />
          <PopularCalculators exclude="/calculator/lean-mass-calculator" />
        </div>
      </div>
    </>
  );
};

export default LeanMassCalculator;

