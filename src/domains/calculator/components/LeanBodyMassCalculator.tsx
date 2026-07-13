"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Dumbbell } from "lucide-react";

const LeanBodyMassCalculator = () => {
  const [weight, setWeight] = useState("180");
  const [bodyFatPct, setBodyFatPct] = useState("22");
  const [unit, setUnit] = useState("lb");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFatPct) / 100;
    const weightKg = unit === "lb" ? w / 2.20462 : w;

    const fatMass = weightKg * bf;
    const lbm = weightKg - fatMass;
    const lbmLb = lbm * 2.20462;

    // Protein target: 1g per lb of LBM (aggressive athletes)
    const proteinTarget = lbmLb;
    // BMR using Katch-McArdle
    const bmr = 370 + (21.6 * lbm);

    setResults({ lbm: unit === "lb" ? lbmLb : lbm, fatMass: unit === "lb" ? fatMass * 2.20462 : fatMass, proteinTarget, bmr, lbmKg: lbm });
  };

  const reset = () => {
    setShowResults(false); setWeight("180"); setBodyFatPct("22"); setUnit("lb"); setResults(null); };

  const faqs = [
    { question: "What is lean body mass?", answer: "Lean Body Mass (LBM) is everything in your body except fat: muscles, organs, bones, water, and connective tissue. It is a more meaningful fitness metric than total body weight because it directly reflects muscle mass." },
    { question: "Why is LBM important?", answer: "LBM determines your resting metabolic rate (how many calories you burn at rest). Higher LBM = higher metabolism. Tracking LBM while losing weight ensures you are losing fat, not muscle." },
    { question: "How do I increase lean body mass?", answer: "Resistance training (weight lifting) combined with adequate protein intake (0.7–1g per pound of LBM) is the most effective way to build and preserve lean muscle tissue." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Lean Body Mass Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lean Body Mass Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="wt" label={`Body Weight (${unit})`} value={weight} onChange={setWeight} />
                <InputField id="bf" label="Body Fat (%)" value={bodyFatPct} onChange={setBodyFatPct} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="input-calc">
                    <option value="lb">Pounds (lb)</option>
                    <option value="kg">Kilograms (kg)</option>
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
                <h2 className="text-2xl font-bold mb-3">Body Composition Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Lean Body Mass</p>
                    <p className="text-5xl font-black text-foreground">{results.lbm.toFixed(1)} {unit}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Fat Mass</p>
                    <p className="text-3xl font-black text-foreground">{results.fatMass.toFixed(1)} {unit}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "BMR (Katch-McArdle)", value: 0, textValue: Math.round(results.bmr) + " kcal/day" },
                  { label: "Daily Protein Target", value: 0, textValue: Math.round(results.proteinTarget) + "g (1g per lb LBM)" },
                  { label: "Lean Mass Ratio", value: 0, textValue: (100 - parseFloat(bodyFatPct)).toFixed(1) + "%" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Why Lean Body Mass Matters More Than Weight</h2>
              <p>The number on the scale is a poor indicator of health and fitness. Two people at the same weight can look and perform very differently depending on their body composition.</p>
              <h3>Tracking Progress with LBM</h3>
              <p>When losing weight through diet and exercise, tracking LBM ensures you're losing fat and not muscle. Ideally, your LBM should stay the same or increase while total weight decreases during a cut.</p>
              <h3>Katch-McArdle Formula</h3>
              <p>This BMR formula is considered more accurate than Harris-Benedict for people who know their body fat percentage, because it accounts for lean mass directly rather than using height, weight, age, and sex as proxies.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lean-body-mass" />
          <PopularCalculators exclude="/calculator/lean-body-mass-calculator" />
        </div>
      </div>
    </>
  );
};
export default LeanBodyMassCalculator;

