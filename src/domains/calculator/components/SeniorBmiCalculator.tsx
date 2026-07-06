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
  category: "Underweight" | "Healthy Weight" | "Overweight" | "Obese";
  description: string;
  colorClass: string;
}

// 2. Pure Calculation Function
const calculateSeniorBmi = (inputs: CalculatorInputs): CalculatorResults | null => {
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
  
  let category: CalculatorResults["category"] = "Healthy Weight";
  let description = "";
  let colorClass = "text-emerald-500";

  // Geriatric BMI Classifications (Age 65+)
  if (bmi < 23) {
    category = "Underweight";
    description = "Your BMI is below the recommended range for seniors. In older adults, a BMI under 23 is associated with a significantly higher risk of osteoporosis, frailty, and increased mortality.";
    colorClass = "text-yellow-500";
  } else if (bmi <= 27.9) {
    category = "Healthy Weight";
    description = "Your BMI is in the optimal range for seniors (23 to 27.9). This range provides a protective biological buffer that supports bone density, immune function, and longevity.";
    colorClass = "text-emerald-500";
  } else if (bmi <= 29.9) {
    category = "Overweight";
    description = "Your BMI is slightly above the optimal senior range. While mild overweight in seniors is less risky than in younger adults, it should be monitored to prevent progression to obesity.";
    colorClass = "text-orange-500";
  } else {
    category = "Obese";
    description = "Your BMI is in the obese range (30+). This significantly increases the risk of osteoarthritis, cardiovascular disease, and metabolic disorders, limiting mobility and independence.";
    colorClass = "text-red-500";
  }

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    category,
    description,
    colorClass
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  heightFt: "5",
  heightIn: "7",
  heightCm: "170",
  weightLbs: "165", // ~25.8 BMI, healthy for a senior
  weightKg: "75"
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

export default function SeniorBmiCalculator() {
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

    if (unitSystem === "imperial" && ft === 0 && inch === 0) return setErrorMsg("Please enter height.");
    if (unitSystem === "metric" && cm === 0) return setErrorMsg("Please enter height.");
    if (unitSystem === "imperial" && lbs === 0) return setErrorMsg("Please enter weight.");
    if (unitSystem === "metric" && kg === 0) return setErrorMsg("Please enter weight.");

    const res = calculateSeniorBmi({ 
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
    { question: "Why is the healthy BMI range higher for seniors?", answer: "Geriatric medical research shows that the standard adult BMI range (18.5 - 24.9) does not apply to individuals over 65. For seniors, a slightly higher BMI (23 to 27.9) provides a protective physiological buffer against malnutrition, preserves bone mineral density (reducing fracture risk), and improves survival rates during illness or hospitalization." },
    { question: "Is a BMI of 25 'overweight' for a senior?", answer: "No. While a BMI of 25 is mathematically classified as the beginning of 'Overweight' for a 30-year-old, it is perfectly centered in the 'Healthy' optimal range for a 70-year-old. The goal shifts from extreme leanness to functional strength and resilience." },
    { question: "What are the dangers of being underweight as a senior?", answer: "In the elderly, being underweight (BMI < 23) is far more dangerous than being slightly overweight. It is strongly correlated with sarcopenia (muscle loss), severe osteoporosis, weakened immune function, and a drastically higher mortality rate." },
    { question: "Does BMI measure muscle mass?", answer: "No. BMI cannot distinguish between fat and muscle. Since seniors naturally lose muscle mass with age, a senior with a 'Healthy' BMI might still have very low muscle mass and high body fat. Therefore, BMI should be used alongside other metrics like grip strength and mobility assessments." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Senior BMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Senior BMI Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="bg-blue-500/10 border border-blue-500/50 p-3 rounded-md mb-2">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Note:</strong> This calculator applies the shifted geriatric BMI scale (Optimal: 23-27.9), not the standard adult scale.
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
                      Senior Adjusted BMI
                    </p>
                    <h2 className={`text-5xl md:text-6xl font-black tabular-nums ${results.colorClass}`}>
                      {results.bmi}
                    </h2>
                    
                    <div className="mt-4 px-6 py-2 bg-muted rounded-full">
                      <span className={`font-bold uppercase tracking-widest text-sm ${results.colorClass}`}>
                        {results.category}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6 max-w-md">
                      {results.description}
                    </p>
                  </div>
                </div>

                <AdPlaceholder />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <p>Enter your height and weight to calculate your geriatric BMI.</p>
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
