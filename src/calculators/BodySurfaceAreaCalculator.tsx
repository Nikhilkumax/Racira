"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Ruler } from "lucide-react";

const BodySurfaceAreaCalculator = () => {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [unitSystem, setUnitSystem] = useState("metric");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const h = parseFloat(height);

    const weightKg = unitSystem === "imperial" ? w * 0.453592 : w;
    const heightCm = unitSystem === "imperial" ? h * 2.54 : h;

    if (weightKg <= 0 || heightCm <= 0) return;

    // Mosteller formula: sqrt((height_cm * weight_kg) / 3600)
    const mosteller = Math.sqrt((heightCm * weightKg) / 3600);
    // DuBois formula: 0.007184 * weight_kg^0.425 * height_cm^0.725
    const dubois = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
    // Haycock formula: 0.024265 * weight_kg^0.5378 * height_cm^0.3964
    const haycock = 0.024265 * Math.pow(weightKg, 0.5378) * Math.pow(heightCm, 0.3964);
    // Gehan and George formula: 0.0235 * weight_kg^0.51456 * height_cm^0.42246
    const gehan = 0.0235 * Math.pow(weightKg, 0.51456) * Math.pow(heightCm, 0.42246);

    setResults({ mosteller, dubois, haycock, gehan });
  };

  const reset = () => {
    setShowResults(false); setWeight("70"); setHeight("175"); setUnitSystem("metric"); setResults(null); };

  const faqs = [
    { question: "What is Body Surface Area (BSA)?", answer: "Body Surface Area is the measured or calculated surface area of a human body. It is generally considered a more accurate indicator of metabolic mass than body weight alone." },
    { question: "Why is BSA used in medicine?", answer: "BSA is widely used in clinical settings to calculate dosages for medications with a narrow therapeutic index, such as chemotherapy drugs, and to assess cardiac index and renal function (GFR)." },
    { question: "Which BSA formula is best?", answer: "The Mosteller formula is the most widely used today due to its simplicity and accuracy across different body types. The DuBois formula is the oldest and also very common in clinical research." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Body Surface Area Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Body Surface Area Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your BSA using Mosteller, DuBois, and other standard clinical formulas.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit System</label>
                  <select value={unitSystem} onChange={e => setUnitSystem(e.target.value)} className="input-calc">
                    <option value="metric">Metric (kg/cm)</option>
                    <option value="imperial">Imperial (lb/in)</option>
                  </select>
                </div>
                <InputField id="weight" label={`Weight (${unitSystem === 'imperial' ? 'lb' : 'kg'})`} value={weight} onChange={setWeight} />
                <InputField id="height" label={`Height (${unitSystem === 'imperial' ? 'in' : 'cm'})`} value={height} onChange={setHeight} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Ruler className="h-5 w-5" /> Calculate BSA</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">BSA Results (m²)</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Mosteller Formula</p>
                    <p className="text-5xl font-black text-foreground">{results.mosteller.toFixed(3)} m²</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">DuBois Formula</p>
                    <p className="text-3xl font-black text-foreground">{results.dubois.toFixed(3)} m²</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Haycock Formula", value: 0, textValue: results.haycock.toFixed(3) + " m²" },
                  { label: "Gehan & George Formula", value: 0, textValue: results.gehan.toFixed(3) + " m²" },
                  { label: "Average Adult BSA", value: 0, textValue: "1.7 - 1.9 m²" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Importance of Body Surface Area</h2>
              <p>While Body Mass Index (BMI) is useful for population-level health screening, Body Surface Area (BSA) is critical for precise medical dosing and physiological assessment.</p>
              <h3>Why Not Just Use Weight?</h3>
              <p>Adipose (fat) tissue is less metabolically active than lean muscle. Therefore, a purely weight-based drug dose might overdose an obese patient and underdose a muscular one. BSA provides a better estimate of metabolic mass and cardiac output.</p>
              <h3>Clinical Applications</h3>
              <p>BSA is routinely used to calculate doses for chemotherapy, glucocorticoids, and pediatric medications. It is also used to index cardiac output (Cardiac Index) and renal function (GFR) to a standardized body size.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-surface-area" />
          <PopularCalculators exclude="/calculator/body-surface-area-calculator" />
        </div>
      </div>
    </>
  );
};
export default BodySurfaceAreaCalculator;

