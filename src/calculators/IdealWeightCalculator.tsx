"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

// Multiple ideal weight formulas
const formulas = {
  devine: (heightCm: number, gender: string) => {
    const inches = heightCm / 2.54;
    const over60 = Math.max(0, inches - 60);
    return gender === "male" ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;
  },
  robinson: (heightCm: number, gender: string) => {
    const inches = heightCm / 2.54;
    const over60 = Math.max(0, inches - 60);
    return gender === "male" ? 52 + 1.9 * over60 : 49 + 1.7 * over60;
  },
  miller: (heightCm: number, gender: string) => {
    const inches = heightCm / 2.54;
    const over60 = Math.max(0, inches - 60);
    return gender === "male" ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;
  },
  hamwi: (heightCm: number, gender: string) => {
    const inches = heightCm / 2.54;
    const over60 = Math.max(0, inches - 60);
    return gender === "male" ? 48 + 2.7 * over60 : 45.5 + 2.2 * over60;
  },
};

const IdealWeightCalculator = () => {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [heightCm, setHeightCm] = useState("170");
  const [currentWeight, setCurrentWeight] = useState("75");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    devine: number; robinson: number; miller: number; hamwi: number; average: number;
    bmiHealthyMin: number; bmiHealthyMax: number; difference: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const h = parseFloat(heightCm) || 0;
    const cw = parseFloat(currentWeight) || 0;
    if (h <= 0) return;

    const d = Math.round(formulas.devine(h, gender) * 10) / 10;
    const r = Math.round(formulas.robinson(h, gender) * 10) / 10;
    const m = Math.round(formulas.miller(h, gender) * 10) / 10;
    const hw = Math.round(formulas.hamwi(h, gender) * 10) / 10;
    const avg = Math.round((d + r + m + hw) / 4 * 10) / 10;

    const hm = h / 100;
    const bmiMin = Math.round(18.5 * hm * hm * 10) / 10;
    const bmiMax = Math.round(24.9 * hm * hm * 10) / 10;

    setResult({ devine: d, robinson: r, miller: m, hamwi: hw, average: avg, bmiHealthyMin: bmiMin, bmiHealthyMax: bmiMax, difference: cw > 0 ? Math.round((cw - avg) * 10) / 10 : 0 });
  };

  const reset = () => {
    setShowResults(false); setGender("male"); setHeightCm("170"); setCurrentWeight("75"); setResult(null); };

  const faqs = [
    { question: "What is ideal body weight?", answer: "Ideal body weight (IBW) is a weight range associated with optimal health outcomes based on your height and gender. It's estimated using validated medical formulas and is used in clinical settings for drug dosing and nutritional planning." },
    { question: "Which ideal weight formula is best?", answer: "The Devine formula is most commonly used in clinical practice. However, since all formulas have limitations, this calculator shows results from four formulas and their average for a better estimate." },
    { question: "Is ideal weight the same for everyone of the same height?", answer: "No. Ideal weight varies based on body frame, muscle mass, age, and ethnicity. The formulas provide a baseline estimate. A muscular person may healthily weigh more than the calculated ideal." },
    { question: "Should I aim for my ideal weight?", answer: "Use ideal weight as a general guideline, not an exact target. Body fat percentage, waist circumference, and how you feel are often better indicators of health than a number on the scale." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ideal Weight Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ideal Weight Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6 flex gap-2">
                <button onClick={() => setGender("male")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "male" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Male</button>
                <button onClick={() => setGender("female")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "female" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Female</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="heightCm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
                <InputField id="currentWeight" label="Current Weight (optional)" value={currentWeight} onChange={setCurrentWeight} suffix="kg" tooltip="To show how far you are from ideal" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Ideal Weight</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Your Ideal Weight</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-1">{result.average} kg</p>
                  <p className="text-muted-foreground">Average of 4 formulas</p>
                  {result.difference !== 0 && (
                    <p className="text-sm mt-2">
                      You are <span className={`font-bold ${result.difference > 0 ? "text-orange-500" : "text-blue-500"}`}>
                        {Math.abs(result.difference)} kg {result.difference > 0 ? "above" : "below"}
                      </span> the average ideal weight
                    </p>
                  )}
                </div>

                <ResultDisplay items={[
                  { label: "Devine Formula", value: 0, textValue: `${result.devine} kg` },
                  { label: "Robinson Formula", value: 0, textValue: `${result.robinson} kg` },
                  { label: "Miller Formula", value: 0, textValue: `${result.miller} kg` },
                  { label: "Hamwi Formula", value: 0, textValue: `${result.hamwi} kg` },
                  { label: "Average", value: 0, textValue: `${result.average} kg`, highlight: true },
                  { label: "Healthy BMI Range", value: 0, textValue: `${result.bmiHealthyMin}–${result.bmiHealthyMax} kg` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is Ideal Body Weight?</h2>
              <p>Ideal body weight (IBW) is a clinical estimate of the weight at which a person of a given height is likely to be healthiest. It was originally developed for drug dosing calculations but is now widely used as a general health reference. This calculator uses four of the most established formulas in medicine.</p>

              <h2>The Four Formulas</h2>

              <h3>Devine Formula (1974)</h3>
              <p><strong>Men:</strong> IBW = 50 + 2.3 × (height in inches − 60)</p>
              <p><strong>Women:</strong> IBW = 45.5 + 2.3 × (height in inches − 60)</p>
              <p>Most widely used in clinical practice. Originally designed for drug dosing.</p>

              <h3>Robinson Formula (1983)</h3>
              <p><strong>Men:</strong> IBW = 52 + 1.9 × (height in inches − 60)</p>
              <p><strong>Women:</strong> IBW = 49 + 1.7 × (height in inches − 60)</p>

              <h3>Miller Formula (1983)</h3>
              <p><strong>Men:</strong> IBW = 56.2 + 1.41 × (height in inches − 60)</p>
              <p><strong>Women:</strong> IBW = 53.1 + 1.36 × (height in inches − 60)</p>

              <h3>Hamwi Formula (1964)</h3>
              <p><strong>Men:</strong> IBW = 48 + 2.7 × (height in inches − 60)</p>
              <p><strong>Women:</strong> IBW = 45.5 + 2.2 × (height in inches − 60)</p>

              <h2>Limitations of Ideal Weight Formulas</h2>
              <ul>
                <li>All formulas were developed using primarily Caucasian populations</li>
                <li>They don't account for body frame size, muscle mass, or age</li>
                <li>Athletes and muscular individuals will often exceed the "ideal" weight</li>
                <li>The BMI-based healthy weight range (18.5-24.9 kg/m²) provides an alternative reference</li>
              </ul>

              <h2>Beyond Ideal Weight</h2>
              <p>Rather than fixating on an ideal number, focus on body composition (fat vs. muscle), waist-to-hip ratio, blood pressure, blood sugar, and how you feel. A holistic approach to health is more meaningful than any single metric.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Ideal weight estimates are general guidelines based on population averages. They do not account for individual body composition. Consult a healthcare professional for personalized health advice.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ideal-weight-calculator" />
          <PopularCalculators exclude="/ideal-weight-calculator" />
        </div>
      </div>
    </>
  );
};

export default IdealWeightCalculator;


