"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

// US Navy method for body fat estimation
const calcNavyBodyFat = (gender: string, waist: number, neck: number, height: number, hip: number) => {
  if (gender === "male") {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  }
  return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
};

const getCategory = (bf: number, gender: string) => {
  if (gender === "male") {
    if (bf < 6) return "Essential Fat";
    if (bf < 14) return "Athletes";
    if (bf < 18) return "Fitness";
    if (bf < 25) return "Average";
    return "Obese";
  }
  if (bf < 14) return "Essential Fat";
  if (bf < 21) return "Athletes";
  if (bf < 25) return "Fitness";
  if (bf < 32) return "Average";
  return "Obese";
};

const BodyFatCalculator = () => {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("70");
  const [heightCm, setHeightCm] = useState("170");
  const [waist, setWaist] = useState("80");
  const [neck, setNeck] = useState("37");
  const [hip, setHip] = useState("95");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    bodyFat: number; category: string; fatMass: number; leanMass: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight) || 0;
    const h = parseFloat(heightCm) || 0;
    const waistCm = parseFloat(waist) || 0;
    const neckCm = parseFloat(neck) || 0;
    const hipCm = parseFloat(hip) || 0;
    if (w <= 0 || h <= 0 || waistCm <= 0 || neckCm <= 0) return;
    if (gender === "female" && hipCm <= 0) return;

    const bf = calcNavyBodyFat(gender, waistCm, neckCm, h, hipCm);
    const bodyFat = Math.max(0, Math.round(bf * 10) / 10);
    const fatMass = Math.round(w * bodyFat / 100 * 10) / 10;
    const leanMass = Math.round((w - fatMass) * 10) / 10;

    setResult({ bodyFat, category: getCategory(bodyFat, gender), fatMass, leanMass });
  };

  const reset = () => {
    setShowResults(false); setWeight("70"); setHeightCm("170"); setWaist("80"); setNeck("37"); setHip("95"); setResult(null); };

  const faqs = [
    { question: "What is the US Navy body fat formula?", answer: "The US Navy method estimates body fat using circumference measurements. For men: neck and waist. For women: neck, waist, and hip. It correlates well with hydrostatic weighing (within 1-3% accuracy)." },
    { question: "What is a healthy body fat percentage?", answer: "For men: 10-20% is healthy, with athletes at 6-13%. For women: 18-28% is healthy, with athletes at 14-20%. Essential fat is 2-5% for men and 10-13% for women." },
    { question: "How do I measure my waist correctly?", answer: "Measure at the narrowest point of your waist (usually at the navel level for men). Stand relaxed, don't suck in, and measure after a normal exhale. Use a flexible tape measure." },
    { question: "Is body fat percentage better than BMI?", answer: "Yes, body fat percentage is a better indicator of health and fitness than BMI because it directly measures fat. BMI can misclassify muscular individuals as overweight." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Body Fat Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Body Fat Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6 flex gap-2">
                <button onClick={() => setGender("male")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "male" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Male</button>
                <button onClick={() => setGender("female")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "female" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Female</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="weight" label="Weight" value={weight} onChange={setWeight} suffix="kg" />
                <InputField id="heightCm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
                <InputField id="waist" label="Waist Circumference" value={waist} onChange={setWaist} suffix="cm" tooltip="Measure at navel level" />
                <InputField id="neck" label="Neck Circumference" value={neck} onChange={setNeck} suffix="cm" tooltip="Measure just below the larynx" />
                {gender === "female" && <InputField id="hip" label="Hip Circumference" value={hip} onChange={setHip} suffix="cm" tooltip="Measure at the widest point" />}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-2xl font-bold mb-3">Your Body Composition</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-1">{result.bodyFat}%</p>
                  <p className="text-lg font-semibold text-primary">{result.category}</p>
                </div>
                <ResultDisplay items={[
                  { label: "Body Fat %", value: 0, textValue: `${result.bodyFat}%`, highlight: true },
                  { label: "Category", value: 0, textValue: result.category },
                  { label: "Fat Mass", value: 0, textValue: `${result.fatMass} kg` },
                  { label: "Lean Body Mass", value: 0, textValue: `${result.leanMass} kg` },
                ]} />

                {/* Body fat ranges */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">{gender === "male" ? "Male" : "Female"} Body Fat Ranges</h3>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div className="bg-red-400 flex-1" title="Essential" />
                    <div className="bg-blue-400 flex-[1.5]" title="Athletes" />
                    <div className="bg-green-400 flex-1" title="Fitness" />
                    <div className="bg-yellow-400 flex-[1.5]" title="Average" />
                    <div className="bg-orange-400 flex-1" title="Obese" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    {gender === "male" ? (
                      <><span>2%</span><span>6%</span><span>14%</span><span>18%</span><span>25%</span><span>35%+</span></>
                    ) : (
                      <><span>10%</span><span>14%</span><span>21%</span><span>25%</span><span>32%</span><span>40%+</span></>
                    )}
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is Body Fat Percentage?</h2>
              <p>Body fat percentage is the proportion of your total body weight that is fat tissue. It's a better indicator of health and fitness than weight alone, as it distinguishes between fat mass and lean mass (muscle, bone, water, organs).</p>

              <h2 className="text-2xl font-bold mb-3">US Navy Body Fat Formula</h2>
              <p><strong>Men:</strong> BF% = 495 / (1.0324 − 0.19077 × log₁₀(waist − neck) + 0.15456 × log₁₀(height)) − 450</p>
              <p><strong>Women:</strong> BF% = 495 / (1.29579 − 0.35004 × log₁₀(waist + hip − neck) + 0.22100 × log₁₀(height)) − 450</p>
              <p>This method is validated against hydrostatic weighing and is accurate to within 1-3% for most individuals.</p>

              <h2 className="text-2xl font-bold mb-3">Body Fat Categories</h2>
              <table className="w-full text-sm mb-4">
                <thead><tr><th className="text-left py-1">Category</th><th className="text-right">Men</th><th className="text-right">Women</th></tr></thead>
                <tbody>
                  <tr><td>Essential Fat</td><td className="text-right">2-5%</td><td className="text-right">10-13%</td></tr>
                  <tr><td>Athletes</td><td className="text-right">6-13%</td><td className="text-right">14-20%</td></tr>
                  <tr><td>Fitness</td><td className="text-right">14-17%</td><td className="text-right">21-24%</td></tr>
                  <tr><td>Average</td><td className="text-right">18-24%</td><td className="text-right">25-31%</td></tr>
                  <tr><td>Obese</td><td className="text-right">25%+</td><td className="text-right">32%+</td></tr>
                </tbody>
              </table>

              <h2 className="text-2xl font-bold mb-3">How to Reduce Body Fat</h2>
              <ul>
                <li>Maintain a moderate caloric deficit (300-500 calories below TDEE)</li>
                <li>Prioritize protein intake (1.6-2.2g per kg bodyweight)</li>
                <li>Strength train 3-4× per week to preserve muscle</li>
                <li>Get 7-9 hours of sleep for optimal hormone balance</li>
                <li>Manage stress — cortisol promotes fat storage, especially visceral fat</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> The US Navy method provides estimates. For precise measurements, consider DEXA scans, hydrostatic weighing, or Bod Pod testing. Consult a healthcare professional.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-fat-calculator" />
          <PopularCalculators exclude="/body-fat-calculator" />
        </div>
      </div>
    </>
  );
};

export default BodyFatCalculator;


