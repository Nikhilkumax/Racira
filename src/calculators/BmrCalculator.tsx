"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calculator } from "lucide-react";

const BMRCalculator = () => {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("70");
  const [heightCm, setHeightCm] = useState("170");
  const [formula, setFormula] = useState<"mifflin" | "harris" | "katch">("mifflin");
  const [bodyFat, setBodyFat] = useState("20");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ bmr: number; formulaUsed: string } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight) || 0;
    const h = parseFloat(heightCm) || 0;
    const a = parseFloat(age) || 0;
    if (w <= 0 || h <= 0 || a <= 0) return;

    let bmr: number;
    let formulaName: string;

    if (formula === "mifflin") {
      // Mifflin-St Jeor (most accurate for most people)
      bmr = gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;
      formulaName = "Mifflin-St Jeor";
    } else if (formula === "harris") {
      // Revised Harris-Benedict
      bmr = gender === "male"
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
      formulaName = "Harris-Benedict (Revised)";
    } else {
      // Katch-McArdle (uses lean body mass)
      const bf = parseFloat(bodyFat) || 20;
      const lbm = w * (1 - bf / 100);
      bmr = 370 + 21.6 * lbm;
      formulaName = "Katch-McArdle";
    }

    setResult({ bmr: Math.round(bmr), formulaUsed: formulaName });
  };

  const reset = () => {
    setShowResults(false); setGender("male"); setAge("30"); setWeight("70"); setHeightCm("170"); setFormula("mifflin"); setBodyFat("20"); setResult(null);
  };

  const faqs = [
    { question: "What is BMR?", answer: "Basal Metabolic Rate (BMR) is the number of calories your body needs to perform basic life-sustaining functions like breathing, circulation, and cell production while completely at rest." },
    { question: "Which BMR formula is most accurate?", answer: "The Mifflin-St Jeor equation is considered the most accurate for most people. The Katch-McArdle formula is better if you know your body fat percentage, as it accounts for lean body mass." },
    { question: "How is BMR different from TDEE?", answer: "BMR is calories burned at complete rest. TDEE (Total Daily Energy Expenditure) includes BMR plus calories burned through daily activities and exercise. TDEE = BMR × Activity Multiplier." },
    { question: "Can I increase my BMR?", answer: "Yes — building muscle mass increases BMR since muscle tissue burns more calories at rest than fat. Regular strength training, adequate protein intake, and staying hydrated can help boost BMR." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "BMR Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">BMR Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate your Basal Metabolic Rate — the calories your body burns at complete rest.</p>

            <div className="card-calculator mb-8">
              <div className="mb-6 flex gap-2">
                <button onClick={() => setGender("male")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "male" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Male</button>
                <button onClick={() => setGender("female")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "female" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Female</button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Formula</label>
                <div className="flex flex-wrap gap-2">
                  {([["mifflin", "Mifflin-St Jeor"], ["harris", "Harris-Benedict"], ["katch", "Katch-McArdle"]] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setFormula(val)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formula === val ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="age" label="Age" value={age} onChange={setAge} suffix="years" />
                <InputField id="weight" label="Weight" value={weight} onChange={setWeight} suffix="kg" />
                <InputField id="heightCm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
                {formula === "katch" && <InputField id="bodyFat" label="Body Fat" value={bodyFat} onChange={setBodyFat} suffix="%" tooltip="Required for Katch-McArdle formula" />}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Calculator className="h-5 w-5" /> Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Your BMR</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-1">{result.bmr.toLocaleString()}</p>
                  <p className="text-muted-foreground">calories/day at rest</p>
                  <p className="text-xs text-muted-foreground mt-1">Using {result.formulaUsed}</p>
                </div>
                <ResultDisplay items={[
                  { label: "Daily BMR", value: 0, textValue: `${result.bmr} kcal` },
                  { label: "Weekly BMR", value: 0, textValue: `${(result.bmr * 7).toLocaleString()} kcal` },
                  { label: "Monthly BMR", value: 0, textValue: `${(result.bmr * 30).toLocaleString()} kcal` },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            {/* SEO Content Sections */}
            <div className="mt-4 space-y-8 mb-10">
              <section>
                <h2 className="text-2xl font-bold mb-4">How the BMR Calculator Works</h2>
                <p className="text-muted-foreground mb-3">Our BMR Calculator uses scientifically validated equations to estimate the minimum calories your body needs while completely at rest. Simply enter your gender, age, weight, and height, choose a formula, and click Calculate to get your personal Basal Metabolic Rate in seconds.</p>
                <p className="text-muted-foreground mb-3">The Mifflin-St Jeor formula (the default) is the gold standard recommended by most dietitians. If you know your body fat percentage, the Katch-McArdle formula offers even higher precision by working directly from lean body mass instead of total weight.</p>
                <p className="text-muted-foreground">All three supported equations — Mifflin-St Jeor, Harris-Benedict (Revised), and Katch-McArdle — are explained in detail below so you can choose the one that best fits your situation.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Understanding Your Results</h2>
                <p className="text-muted-foreground mb-3">Your BMR result represents the calories burned per day doing absolutely nothing — just lying still while your heart beats, lungs breathe, and cells repair themselves. It is not the number of calories you should eat; it is the baseline before activity is factored in.</p>
                <p className="text-muted-foreground mb-3">To find your Total Daily Energy Expenditure (TDEE), multiply your BMR by an activity factor: sedentary (×1.2), lightly active (×1.375), moderately active (×1.55), very active (×1.725), or extra active (×1.9). TDEE is the calorie target for weight maintenance.</p>
                <p className="text-muted-foreground">To lose weight, aim for a deficit of 300–500 kcal below TDEE. To gain muscle, add 200–300 kcal above it. Never eat below your BMR without medical supervision — doing so can cause muscle loss, nutrient deficiencies, and metabolic slowdown.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
                <p className="text-muted-foreground mb-3"><strong>Weight management:</strong> Athletes and dieters use BMR to set precise calorie targets rather than guessing. Knowing your baseline prevents under-eating (which slows metabolism) and over-eating (which causes fat gain).</p>
                <p className="text-muted-foreground mb-3"><strong>Fitness programming:</strong> Personal trainers calculate client BMR to design nutrition plans that support training goals — whether cutting, bulking, or maintaining body composition.</p>
                <p className="text-muted-foreground"><strong>Health monitoring:</strong> Tracking BMR over months reveals how lifestyle changes (strength training, improved sleep, hormonal treatment) affect your resting metabolism, making it a useful biometric alongside weight and body fat percentage.</p>
              </section>
            </div>

            <article className="prose-finance">
              <h2>What Is BMR?</h2>
              <p>Basal Metabolic Rate (BMR) represents the minimum number of calories your body needs to function while at complete rest. This includes essential processes like breathing, blood circulation, nutrient processing, and cell production. BMR typically accounts for 60-75% of your total daily calorie expenditure.</p>

              <h2>BMR Formulas Explained</h2>
              <h3>Mifflin-St Jeor (Recommended)</h3>
              <p><strong>Men:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 5</p>
              <p><strong>Women:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161</p>

              <h3>Harris-Benedict (Revised)</h3>
              <p><strong>Men:</strong> BMR = 88.362 + 13.397 × weight(kg) + 4.799 × height(cm) - 5.677 × age</p>
              <p><strong>Women:</strong> BMR = 447.593 + 9.247 × weight(kg) + 3.098 × height(cm) - 4.330 × age</p>

              <h3>Katch-McArdle</h3>
              <p><strong>Both:</strong> BMR = 370 + 21.6 × lean body mass(kg)</p>
              <p>This formula is most accurate when body fat percentage is known, as it uses lean body mass rather than total weight.</p>

              <h2>Factors That Affect BMR</h2>
              <ul>
                <li><strong>Age:</strong> BMR decreases ~1-2% per decade after 20</li>
                <li><strong>Gender:</strong> Males typically have 5-10% higher BMR</li>
                <li><strong>Body composition:</strong> More muscle = higher BMR</li>
                <li><strong>Genetics:</strong> Can account for up to 10% variation</li>
                <li><strong>Hormones:</strong> Thyroid hormones significantly impact BMR</li>
                <li><strong>Temperature:</strong> Cold environments can increase BMR</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> BMR calculations provide estimates. Individual metabolic rates can vary. Consult a healthcare professional for personalized nutrition advice.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmr-calculator" />
            <PopularCalculators exclude="/bmr-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BMRCalculator;
