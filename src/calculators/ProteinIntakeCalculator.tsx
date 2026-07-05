"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Utensils } from "lucide-react";

const ProteinIntakeCalculator = () => {
  const [weight, setWeight] = useState("180");
  const [unit, setUnit] = useState("lb");
  const [goal, setGoal] = useState("maintain"); // maintain, build, lose
  const [activity, setActivity] = useState("moderate");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const weightKg = unit === "lb" ? w / 2.20462 : w;
    const weightLb = unit === "lb" ? w : w * 2.20462;

    let rda = weightKg * 0.8; // Minimum RDA
    let optimal = 0;
    let high = 0;

    if (activity === "sedentary") {
      optimal = weightKg * 1.0;
      high = weightKg * 1.2;
    } else if (activity === "moderate") {
      optimal = weightKg * 1.4;
      high = weightKg * 1.6;
    } else {
      // active / athlete
      optimal = weightKg * 1.6;
      high = weightKg * 2.2; // approx 1g per lb
    }

    // Adjust for goals
    if (goal === "lose") {
      // Higher protein when in caloric deficit to preserve muscle
      optimal *= 1.2;
      high *= 1.2;
    } else if (goal === "build") {
      optimal *= 1.1;
      high *= 1.1;
    }

    setResults({ 
      rda: Math.round(rda), 
      optimal: Math.round(optimal), 
      high: Math.round(high),
      perLb: (optimal / weightLb).toFixed(2),
      calories: Math.round(optimal * 4) // 4 calories per gram of protein
    });
  };

  const reset = () => {
    setShowResults(false); setWeight("180"); setUnit("lb"); setGoal("maintain"); setActivity("moderate"); setResults(null); };

  const faqs = [
    { question: "How much protein do I actually need?", answer: "The Recommended Dietary Allowance (RDA) is a bare minimum (0.8g/kg) to prevent deficiency. Most active adults need significantly more (1.2-2.0g/kg) for optimal health, muscle recovery, and satiety." },
    { question: "Does a high-protein diet damage kidneys?", answer: "In healthy individuals with normal kidney function, high protein intake has not been shown to cause kidney damage. However, those with pre-existing kidney disease must strictly monitor protein intake." },
    { question: "Is the '1 gram per pound' rule accurate?", answer: "1g per pound of body weight (2.2g/kg) is a common bodybuilding rule. It's an excellent, simple target for those looking to maximize muscle growth or preserve muscle while losing weight, though slightly higher than what most clinical studies show is strictly necessary." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Protein Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Protein Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="wt" label={`Weight (${unit})`} value={weight} onChange={setWeight} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="input-calc">
                    <option value="lb">Pounds (lb)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Primary Goal</label>
                  <select value={goal} onChange={e => setGoal(e.target.value)} className="input-calc">
                    <option value="maintain">Maintain Weight</option>
                    <option value="lose">Lose Fat</option>
                    <option value="build">Build Muscle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Activity Level</label>
                  <select value={activity} onChange={e => setActivity(e.target.value)} className="input-calc">
                    <option value="sedentary">Sedentary (Little/no exercise)</option>
                    <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                    <option value="active">Active (Intense exercise 5+ days)</option>
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
                <h2 className="text-2xl font-bold mb-3">Daily Protein Targets</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Optimal Target</p>
                    <p className="text-5xl font-black text-foreground">{results.optimal}g</p>
                    <p className="text-sm text-muted-foreground mt-1">per day</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">High/Athletic Target</p>
                    <p className="text-3xl font-black text-foreground">{results.high}g</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Bare Minimum (RDA)", value: 0, textValue: results.rda + "g / day" },
                  { label: "Optimal Ratio", value: 0, textValue: results.perLb + "g per lb of body weight" },
                  { label: "Calories from Protein", value: 0, textValue: results.calories + " kcal" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Why Protein Matters</h2>
              <p>Protein is the building block of muscle, skin, enzymes, and hormones. Unlike fats and carbohydrates, the body does not store protein effectively, meaning you need a consistent daily intake.</p>
              <h3>Protein and Fat Loss</h3>
              <p>When in a caloric deficit (eating fewer calories than you burn), higher protein intake is essential. It prevents the body from burning muscle tissue for energy and provides a high level of satiety, keeping you fuller for longer compared to carbs or fats.</p>
              <h3>Distribution Throughout the Day</h3>
              <p>For optimal muscle protein synthesis (MPS), it's best to distribute your protein intake evenly across 3-5 meals. The body can only utilize a certain amount of protein (typically 25-40g) per sitting for muscle building; the rest is used for energy.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/protein-intake" />
          <PopularCalculators exclude="/calculator/protein-intake-calculator" />
        </div>
      </div>
    </>
  );
};
export default ProteinIntakeCalculator;

