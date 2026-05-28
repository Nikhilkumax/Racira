"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const AdjustedBodyWeightCalculator = () => {
  const [actualWeight, setActualWeight] = useState("220");
  const [height, setHeight] = useState("70");
  const [gender, setGender] = useState("male");
  const [unitSystem, setUnitSystem] = useState("imperial"); // imperial or metric

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(actualWeight);
    const h = parseFloat(height);

    let weightKg = unitSystem === "imperial" ? w * 0.453592 : w;
    let heightCm = unitSystem === "imperial" ? h * 2.54 : h;

    // Ideal Body Weight (Devine formula)
    let ibw = 0;
    if (gender === "male") {
      ibw = 50 + 2.3 * ((heightCm / 2.54) - 60);
    } else {
      ibw = 45.5 + 2.3 * ((heightCm / 2.54) - 60);
    }

    // Adjusted Body Weight (ABW)
    let abw = ibw;
    if (weightKg > ibw) {
      abw = ibw + 0.4 * (weightKg - ibw);
    }

    const actualBmi = weightKg / Math.pow(heightCm / 100, 2);
    
    const displayIbw = unitSystem === "imperial" ? ibw * 2.20462 : ibw;
    const displayAbw = unitSystem === "imperial" ? abw * 2.20462 : abw;

    setResults({ 
      abw: displayAbw, 
      ibw: displayIbw, 
      actualBmi, 
      isOverweight: weightKg > ibw * 1.2 
    });
  };

  const reset = () => {
    setShowResults(false); 
    setActualWeight("220"); 
    setHeight("70"); 
    setGender("male"); 
    setUnitSystem("imperial"); 
    setResults(null); 
  };

  const faqs = [
    { question: "What is Adjusted Body Weight (ABW)?", answer: "Adjusted Body Weight (ABW) is a calculated weight used for dosing certain medications or estimating nutritional needs in obese patients. It accounts for the fact that fat tissue requires less metabolic support and drug distribution than lean tissue." },
    { question: "When is ABW used?", answer: "ABW is typically used when a person's actual weight is significantly higher (usually > 20% or 30%) than their Ideal Body Weight (IBW). It is often used by dietitians to calculate energy needs and by pharmacists to dose hydrophilic medications like aminoglycosides." },
    { question: "How is it calculated?", answer: "The most common formula is: ABW = IBW + 0.4 × (Actual Weight - IBW). The 0.4 factor represents the assumption that 40% of excess body weight is metabolically active tissue or volume of distribution." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Adjusted Body Weight Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Adjusted Body Weight Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your Adjusted Body Weight (ABW) and Ideal Body Weight (IBW) for clinical nutrition and dosing.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit System</label>
                  <select value={unitSystem} onChange={e => setUnitSystem(e.target.value)} className="input-calc">
                    <option value="imperial">Imperial (lb/in)</option>
                    <option value="metric">Metric (kg/cm)</option>
                  </select>
                </div>
                <InputField id="weight" label={`Actual Weight (${unitSystem === 'imperial' ? 'lb' : 'kg'})`} value={actualWeight} onChange={setActualWeight} />
                <InputField id="height" label={`Height (${unitSystem === 'imperial' ? 'in' : 'cm'})`} value={height} onChange={setHeight} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="input-calc">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Activity className="h-5 w-5" /> Calculate ABW</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Body Weight Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Adjusted Body Weight</p>
                    <p className="text-5xl font-black text-foreground">{results.abw.toFixed(1)} {unitSystem === 'imperial' ? 'lb' : 'kg'}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Ideal Body Weight</p>
                    <p className="text-3xl font-black text-foreground">{results.ibw.toFixed(1)} {unitSystem === 'imperial' ? 'lb' : 'kg'}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Actual BMI", value: 0, textValue: results.actualBmi.toFixed(1) },
                  { label: "Weight Status", value: 0, textValue: results.isOverweight ? "Over 120% of IBW" : "Within 120% of IBW" },
                  { label: "Recommendation", value: 0, textValue: results.isOverweight ? "Use ABW for dosing/nutrition" : "Use Actual Weight or IBW" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Clinical Uses of Body Weight Calculations</h2>
              <p>In clinical settings, using a patient's actual weight can lead to overdosing or overfeeding if the patient is obese. Using their ideal body weight can lead to underdosing or underfeeding.</p>
              <h3>Why Use ABW?</h3>
              <p>Fat tissue has a lower metabolic rate and lower water content than lean muscle tissue. Therefore, someone weighing 300 lbs does not need twice the calories or twice the medication dose as someone weighing 150 lbs of the same height.</p>
              <h3>When to Apply the Formula</h3>
              <p>Standard clinical practice suggests using Adjusted Body Weight when a patient's actual weight is greater than 120% or 130% of their Ideal Body Weight, depending on the specific hospital protocol or medication.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/adjusted-body-weight" />
          <PopularCalculators exclude="/calculator/adjusted-body-weight-calculator" />
        </div>
      </div>
    </>
  );
};
export default AdjustedBodyWeightCalculator;

