"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface CalculatorInputs {
  unitSystem: "imperial" | "metric";
  heightFt: number;
  heightIn: number;
  heightCm: number;
  weightLbs: number;
  weightKg: number;
}

interface CalculatorResults {
  bmi: number;
  category: "Extreme" | "Severe" | "Moderate" | "Mild" | "Healthy" | "Overweight";
  description: string;
  targetWeightKg: number;
  deficitKg: number;
  targetWeightLbs: number;
  deficitLbs: number;
  colorClass: string;
}

// 2. Pure Calculation Function
const calculateAnorexicBmi = (inputs: CalculatorInputs): CalculatorResults | null => {
  const { unitSystem, heightFt, heightIn, heightCm, weightLbs, weightKg } = inputs;
  
  let heightMeters = 0;
  let currentWeight = 0;

  if (unitSystem === "imperial") {
    if (heightFt <= 0 && heightIn <= 0) return null;
    if (weightLbs <= 0) return null;
    const totalInches = heightFt * 12 + heightIn;
    heightMeters = totalInches * 0.0254;
    currentWeight = weightLbs * 0.453592;
  } else {
    if (heightCm <= 0) return null;
    if (weightKg <= 0) return null;
    heightMeters = heightCm / 100;
    currentWeight = weightKg;
  }

  if (heightMeters <= 0 || currentWeight <= 0) return null;

  const bmi = currentWeight / Math.pow(heightMeters, 2);
  
  // Target is the minimum healthy BMI (18.5)
  const targetWeightKg = 18.5 * Math.pow(heightMeters, 2);
  const deficitKg = Math.max(0, targetWeightKg - currentWeight);
  
  const targetWeightLbs = targetWeightKg / 0.453592;
  const deficitLbs = deficitKg / 0.453592;

  let category: CalculatorResults["category"] = "Healthy";
  let description = "";
  let colorClass = "text-emerald-500";

  // DSM-5 / WHO Anorexia Nervosa Severity Classifications based on BMI
  if (bmi < 15) {
    category = "Extreme";
    description = "Extreme anorexia nervosa. Severe medical intervention and hospitalization may be required immediately.";
    colorClass = "text-red-600";
  } else if (bmi < 16) {
    category = "Severe";
    description = "Severe anorexia nervosa. Professional clinical treatment is urgently recommended.";
    colorClass = "text-red-500";
  } else if (bmi < 17) {
    category = "Moderate";
    description = "Moderate anorexia nervosa. Medical and psychological monitoring is strongly advised.";
    colorClass = "text-orange-500";
  } else if (bmi < 18.5) {
    category = "Mild";
    description = "Mild anorexia nervosa / Underweight. Focus on weight restoration and nutritional counseling.";
    colorClass = "text-yellow-500";
  } else if (bmi <= 24.9) {
    category = "Healthy";
    description = "Your BMI is within the healthy range. Note: Anorexia is a behavioral disorder, and people with healthy or higher BMIs can still suffer from atypical anorexia.";
    colorClass = "text-emerald-500";
  } else {
    category = "Overweight";
    description = "Your BMI is above the healthy range. Note: Anorexia is a behavioral disorder, and people with healthy or higher BMIs can still suffer from atypical anorexia.";
    colorClass = "text-blue-500";
  }

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    category,
    description,
    targetWeightKg: parseFloat(targetWeightKg.toFixed(1)),
    deficitKg: parseFloat(deficitKg.toFixed(1)),
    targetWeightLbs: parseFloat(targetWeightLbs.toFixed(1)),
    deficitLbs: parseFloat(deficitLbs.toFixed(1)),
    colorClass
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  heightFt: "5",
  heightIn: "6",
  heightCm: "168",
  weightLbs: "100", // Will result in BMI ~ 16.1
  weightKg: "45"
};

// Input Component
const CompactInput = ({ id, label, value, onChange, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function AnorexicBmiCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [weightLbs, setWeightLbs] = useState(DEFAULTS.weightLbs);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CalculatorResults | null>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const ft = parseInt(heightFt, 10) || 0;
    const inch = parseInt(heightIn, 10) || 0;
    const cm = parseFloat(heightCm) || 0;
    const lbs = parseFloat(weightLbs) || 0;
    const kg = parseFloat(weightKg) || 0;

    if (unitSystem === "imperial" && ft === 0 && inch === 0) return setErrorMsg("Please enter your height.");
    if (unitSystem === "metric" && cm === 0) return setErrorMsg("Please enter your height.");
    if (unitSystem === "imperial" && lbs === 0) return setErrorMsg("Please enter your weight.");
    if (unitSystem === "metric" && kg === 0) return setErrorMsg("Please enter your weight.");

    const res = calculateAnorexicBmi({ 
      unitSystem, 
      heightFt: ft, 
      heightIn: inch, 
      heightCm: cm, 
      weightLbs: lbs, 
      weightKg: kg 
    });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setHeightCm(DEFAULTS.heightCm);
    setWeightLbs(DEFAULTS.weightLbs);
    setWeightKg(DEFAULTS.weightKg);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, heightFt, heightIn, heightCm, weightLbs, weightKg]);

  const faqs = [
    { question: "What are the DSM-5 severity classifications for Anorexia Nervosa?", answer: "The DSM-5 classifies severity based on BMI for adults: Mild is a BMI greater than or equal to 17; Moderate is a BMI of 16 to 16.99; Severe is a BMI of 15 to 15.99; and Extreme is a BMI of less than 15." },
    { question: "Is Anorexia defined strictly by BMI?", answer: "No. Anorexia Nervosa is a severe psychological eating disorder characterized by an intense fear of gaining weight and a distorted body image. While BMI is used to gauge the severity of physical starvation, people at a normal or even overweight BMI can suffer from 'Atypical Anorexia Nervosa,' which carries the exact same psychological and physiological risks." },
    { question: "When does a low BMI become an acute medical emergency?", answer: "A BMI below 15 (Extreme Anorexia) is often considered an acute medical emergency because organ systems begin to shut down due to severe starvation. This can lead to cardiac arrest, severe electrolyte imbalances, and bone marrow failure. However, sudden or rapid weight loss is dangerous at any BMI." },
    { question: "What is the target BMI for weight restoration?", answer: "Clinical guidelines usually set a minimum target BMI of 18.5, which is the lower boundary of the standard 'Healthy' weight category according to the WHO. Reaching this target restores basic metabolic function and hormonal balance." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Anorexic BMI Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Anorexic BMI Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="bg-orange-500/10 border border-orange-500/50 p-3 rounded-md mb-2">
              <p className="text-xs text-orange-700 dark:text-orange-400">
                <strong>Disclaimer:</strong> This tool uses standard clinical criteria to calculate physical severity. It is not a diagnostic tool for psychological disorders. If you are struggling with an eating disorder, please seek professional medical help immediately.
              </p>
            </div>

            <div className="flex bg-muted p-1 rounded-lg">
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "imperial" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setUnitSystem("imperial")}
              >
                Imperial
              </button>
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "metric" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setUnitSystem("metric")}
              >
                Metric
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              {unitSystem === "imperial" ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <CompactInput id="ft" label="Height (ft)" value={heightFt} onChange={setHeightFt} suffix="ft" />
                    <CompactInput id="in" label="Height (in)" value={heightIn} onChange={setHeightIn} suffix="in" />
                  </div>
                  <CompactInput id="lbs" label="Current Weight" value={weightLbs} onChange={setWeightLbs} suffix="lbs" />
                </>
              ) : (
                <>
                  <CompactInput id="cm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
                  <CompactInput id="kg" label="Current Weight" value={weightKg} onChange={setWeightKg} suffix="kg" />
                </>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleCalculate}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold"
              >
                Calculate
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Result Card */}
                <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                  <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Current BMI
                    </p>
                    <h2 className={`text-5xl md:text-6xl font-black tabular-nums ${results.colorClass}`}>
                      {results.bmi}
                    </h2>
                    
                    <div className="mt-4 px-6 py-2 bg-muted rounded-full">
                      <span className={`font-bold uppercase tracking-widest text-sm ${results.colorClass}`}>
                        {results.category} {results.category !== "Healthy" && results.category !== "Overweight" ? "Severity" : ""}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
                      {results.description}
                    </p>
                  </div>

                  {results.deficitKg > 0 && (
                    <div className="bg-muted/50 p-6 md:p-8 border-t border-border flex flex-col md:flex-row gap-4 items-center justify-between text-center md:text-left">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Target Clinical Minimum (BMI 18.5)</div>
                        <div className="text-2xl font-bold text-foreground">
                          {unitSystem === "imperial" ? results.targetWeightLbs : results.targetWeightKg} {unitSystem === "imperial" ? "lbs" : "kg"}
                        </div>
                      </div>
                      <div className="bg-background rounded-lg p-3 border border-border shadow-sm">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Restoration Goal</div>
                        <div className="text-xl font-black text-emerald-600">
                          +{unitSystem === "imperial" ? results.deficitLbs : results.deficitKg} {unitSystem === "imperial" ? "lbs" : "kg"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <AdPlaceholder />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <p>Enter your height and weight to calculate physical severity.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 xl:mt-12">
          <FAQSection faqs={faqs} />
        </div>

        <div className="mt-8 xl:mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
