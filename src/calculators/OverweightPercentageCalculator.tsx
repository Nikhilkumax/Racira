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
  idealMaxWeight: number;
  excessWeight: number;
  overweightPercentage: number;
  currentBmi: number;
}

// 2. Pure Calculation Function
const calculateOverweightPercentage = (inputs: CalculatorInputs): CalculatorResults | null => {
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

  // Upper bound of healthy BMI is 24.9
  const maxHealthyBmi = 24.9;
  const idealMaxWeightKg = maxHealthyBmi * Math.pow(heightMeters, 2);
  
  const currentBmi = currentWeight / Math.pow(heightMeters, 2);

  let excessWeightKg = 0;
  let overweightPercentage = 0;

  if (currentWeight > idealMaxWeightKg) {
    excessWeightKg = currentWeight - idealMaxWeightKg;
    overweightPercentage = (excessWeightKg / idealMaxWeightKg) * 100;
  }

  let finalIdealMax = idealMaxWeightKg;
  let finalExcess = excessWeightKg;

  if (unitSystem === "imperial") {
    finalIdealMax = idealMaxWeightKg / 0.453592;
    finalExcess = excessWeightKg / 0.453592;
  }

  return {
    idealMaxWeight: parseFloat(finalIdealMax.toFixed(1)),
    excessWeight: parseFloat(finalExcess.toFixed(1)),
    overweightPercentage: parseFloat(overweightPercentage.toFixed(1)),
    currentBmi: parseFloat(currentBmi.toFixed(1)),
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  heightFt: "5",
  heightIn: "10",
  heightCm: "178",
  weightLbs: "220",
  weightKg: "100"
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

export default function OverweightPercentageCalculator() {
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

    const res = calculateOverweightPercentage({ 
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
    { question: "What is the Overweight Percentage?", answer: "Overweight percentage indicates how much your current body weight exceeds the maximum recommended healthy weight for your height. The maximum healthy weight is typically defined by a Body Mass Index (BMI) of 24.9." },
    { question: "Why is a 10% weight loss significant?", answer: "Medical literature consistently demonstrates that an obese or overweight individual does not need to reach their 'ideal' weight to see profound health benefits. Losing just 5% to 10% of your total body weight drastically improves cellular insulin sensitivity, lowers systolic blood pressure, and significantly reduces visceral fat wrapping around the liver." },
    { question: "Is this calculator accurate for bodybuilders?", answer: "No. The standard BMI formula does not differentiate between lean muscle mass and adipose fat tissue. Elite athletes and bodybuilders often carry significant muscle mass, which can place them in the 'overweight' category despite having very low body fat percentages." },
    { question: "What is a healthy BMI?", answer: "The World Health Organization (WHO) defines a healthy or normal BMI range as 18.5 to 24.9. A BMI between 25 and 29.9 is considered overweight, and a BMI of 30 or higher is considered obese." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Overweight Percentage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Overweight Percentage Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">Calculate precisely how much your current weight exceeds the maximum healthy threshold for your height.</p>

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
                <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden relative">
                  {results.overweightPercentage > 0 ? (
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                  )}
                  
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                        {results.overweightPercentage > 0 ? "You are Currently" : "Weight Status"}
                      </p>
                      {results.overweightPercentage > 0 ? (
                        <>
                          <h2 className="text-4xl md:text-5xl font-black text-foreground tabular-nums">
                            {results.overweightPercentage}%
                          </h2>
                          <p className="text-lg text-red-500 font-bold mt-2">
                            Overweight ({results.excessWeight} {unitSystem === "imperial" ? "lbs" : "kg"} excess)
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-4xl md:text-5xl font-black text-emerald-500 tabular-nums">
                            Healthy Range
                          </h2>
                          <p className="text-lg text-emerald-600 font-bold mt-2">
                            You are not overweight.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 md:p-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-4 border border-border shadow-sm flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Current BMI</div>
                      <div className="text-xl font-bold text-foreground">{results.currentBmi}</div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-border shadow-sm flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Max Healthy Weight</div>
                      <div className="text-xl font-bold text-foreground">{results.idealMaxWeight} {unitSystem === "imperial" ? "lbs" : "kg"}</div>
                    </div>
                  </div>
                </div>

                <AdPlaceholder />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <p>Enter your height and weight to calculate your overweight percentage.</p>
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
