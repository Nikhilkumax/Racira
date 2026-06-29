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
  targetBmi: number;
}

interface CalculatorResults {
  exactTargetWeight: number;
  minHealthyWeight: number;
  maxHealthyWeight: number;
  targetBmi: number;
}

// 2. Pure Calculation Function
const calculateIdealWeight = (inputs: CalculatorInputs): CalculatorResults | null => {
  const { unitSystem, heightFt, heightIn, heightCm, targetBmi } = inputs;
  
  let heightMeters = 0;

  if (unitSystem === "imperial") {
    if (heightFt <= 0 && heightIn <= 0) return null;
    const totalInches = heightFt * 12 + heightIn;
    heightMeters = totalInches * 0.0254;
  } else {
    if (heightCm <= 0) return null;
    heightMeters = heightCm / 100;
  }

  if (heightMeters <= 0 || targetBmi <= 0) return null;

  const targetWeightKg = targetBmi * Math.pow(heightMeters, 2);
  const minHealthyWeightKg = 18.5 * Math.pow(heightMeters, 2);
  const maxHealthyWeightKg = 24.9 * Math.pow(heightMeters, 2);
  
  let exactTargetWeight = targetWeightKg;
  let minHealthyWeight = minHealthyWeightKg;
  let maxHealthyWeight = maxHealthyWeightKg;

  if (unitSystem === "imperial") {
    exactTargetWeight = targetWeightKg / 0.453592;
    minHealthyWeight = minHealthyWeightKg / 0.453592;
    maxHealthyWeight = maxHealthyWeightKg / 0.453592;
  }

  return {
    exactTargetWeight: parseFloat(exactTargetWeight.toFixed(1)),
    minHealthyWeight: parseFloat(minHealthyWeight.toFixed(1)),
    maxHealthyWeight: parseFloat(maxHealthyWeight.toFixed(1)),
    targetBmi: parseFloat(targetBmi.toFixed(1)),
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  heightFt: "5",
  heightIn: "10",
  heightCm: "178",
  targetBmi: "22.0",
};

// Input Component
const CompactInput = ({ id, label, value, onChange, suffix, type = "number", step = "1", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function IdealBmiWeightCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [targetBmi, setTargetBmi] = useState(DEFAULTS.targetBmi);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CalculatorResults | null>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const ft = parseInt(heightFt, 10) || 0;
    const inch = parseInt(heightIn, 10) || 0;
    const cm = parseFloat(heightCm) || 0;
    const bmi = parseFloat(targetBmi) || 0;

    if (unitSystem === "imperial" && ft === 0 && inch === 0) return setErrorMsg("Please enter height.");
    if (unitSystem === "metric" && cm === 0) return setErrorMsg("Please enter height.");
    if (bmi <= 0 || bmi > 60) return setErrorMsg("Please enter a realistic target BMI.");

    const res = calculateIdealWeight({ 
      unitSystem, 
      heightFt: ft, 
      heightIn: inch, 
      heightCm: cm, 
      targetBmi: bmi
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
    setTargetBmi(DEFAULTS.targetBmi);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, heightFt, heightIn, heightCm, targetBmi]);

  const faqs = [
    { question: "How is this different from a standard BMI calculator?", answer: "A standard BMI calculator takes your weight and tells you your BMI. This tool works in reverse: you select the exact BMI you want to achieve, and it calculates the precise weight in pounds or kilograms you need to reach to hit that goal." },
    { question: "Why is a BMI of 22 often considered 'Ideal'?", answer: "A BMI of 22 is exactly in the middle of the healthy range (18.5 - 24.9). Many medical studies and actuarial life insurance tables indicate that a BMI around 22 to 22.5 correlates with the lowest all-cause mortality rate for average adults." },
    { question: "Is my 'Ideal Weight' a single number?", answer: "No. Your 'Ideal Weight' is a range, not a fixed point on the scale. Depending on hydration, glycogen stores, and muscle mass, your weight naturally fluctuates. This calculator provides both the exact number for your specific target BMI, and the wide boundary of the healthy range." },
    { question: "Does the ideal weight change for men and women?", answer: "The mathematical formula for BMI is gender-neutral. However, men typically carry more lean muscle mass than women, meaning a healthy man might naturally sit closer to a BMI of 24, while a healthy woman might naturally sit closer to a BMI of 21. Your specific target should be discussed with a doctor." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Ideal BMI Weight Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ideal BMI Weight Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
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
                </>
              ) : (
                <>
                  <CompactInput id="cm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
                </>
              )}
              
              <div className="border-t border-border mt-2 pt-4">
                <CompactInput id="bmi" label="Target BMI" value={targetBmi} onChange={setTargetBmi} step="0.1" suffix="BMI" />
              </div>
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
                      Target Weight for BMI {results.targetBmi}
                    </p>
                    <h2 className="text-2xl font-bold mb-3">
                      {results.exactTargetWeight} <span className="text-2xl md:text-3xl text-muted-foreground ml-1">{unitSystem === "imperial" ? "lbs" : "kg"}</span>
                    </h2>
                  </div>

                  <div className="bg-emerald-500/10 p-6 md:p-8 border-t border-emerald-500/20 text-center">
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Total Healthy Weight Range (BMI 18.5 - 24.9)</div>
                    <div className="text-2xl font-black text-emerald-600">
                      {results.minHealthyWeight} - {results.maxHealthyWeight} {unitSystem === "imperial" ? "lbs" : "kg"}
                    </div>
                  </div>
                </div>

                <AdPlaceholder />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <p>Enter your height and target BMI to calculate your goal weight.</p>
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
