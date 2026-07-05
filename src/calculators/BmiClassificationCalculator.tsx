"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const BmiClassificationCalculator = () => {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let bmi = 0;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;

    if (unit === "metric") {
      bmi = w / Math.pow(h / 100, 2);
    } else {
      bmi = (w / Math.pow(h, 2)) * 703;
    }

    let category = "";
    let color = "";
    if (bmi < 18.5) { category = "Underweight"; color = "text-blue-500"; }
    else if (bmi < 25) { category = "Normal weight"; color = "text-green-500"; }
    else if (bmi < 30) { category = "Overweight"; color = "text-yellow-500"; }
    else { category = "Obese"; color = "text-red-500"; }

    setResults({ bmi, category, color });
  };

  const reset = () => {
    setShowResults(false);
    setWeight(unit === "metric" ? "70" : "154");
    setHeight(unit === "metric" ? "175" : "69");
    setResults(null);
  };

  const faqs = [
    { question: "What is BMI?", answer: "BMI (Body Mass Index) is a simple calculation using a person's height and weight. The formula is BMI = kg/m², where kg is a person's weight in kilograms and m² is their height in metres squared." },
    { question: "Is BMI an accurate measure of health?", answer: "BMI is a useful screening tool but has limitations. It doesn't distinguish between muscle and fat. Athletes or bodybuilders may have a high BMI due to muscle mass, even if they have low body fat." },
    { question: "What are the standard BMI categories?", answer: "According to the WHO, the categories are: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), and Obese (30 or greater)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "BMI Classification" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BMI Classification Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex bg-secondary rounded-lg p-1 mb-6">
                <button onClick={() => setUnit("metric")} className={`flex-1 py-2 rounded-md text-sm font-medium ${unit === "metric" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
                <button onClick={() => setUnit("imperial")} className={`flex-1 py-2 rounded-md text-sm font-medium ${unit === "imperial" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Imperial (lb/in)</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="weight" label={`Weight (${unit === 'metric' ? 'kg' : 'lb'})`} value={weight} onChange={setWeight} />
                <InputField id="height" label={`Height (${unit === 'metric' ? 'cm' : 'in'})`} value={height} onChange={setHeight} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator mb-8 text-center">
                <h2 className="text-2xl font-bold mb-3">Your BMI Result</h2>
                <p className="text-6xl font-extrabold">{results.bmi.toFixed(1)}</p>
                <p className={`text-xl font-bold mt-2 ${results.color}`}>Category: {results.category}</p>
                
                <div className="mt-8 max-w-md">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-400 w-[18.5%] h-full" />
                    <div className="bg-green-400 w-[6.5%] h-full" />
                    <div className="bg-yellow-400 w-[5%] h-full" />
                    <div className="bg-red-400 w-[70%] h-full" />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                    <span>18.5</span>
                    <span>25.0</span>
                    <span>30.0</span>
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding BMI in Context</h2>
              <p>While BMI is the standard tool used by the WHO and CDC to categorize body weight and health risks, it should not be the only metric you track. It does not measure body fat percentage directly or account for bone density or muscle mass.</p>
              <h3>Why Categories Matter</h3>
              <p>Falling into the Overweight or Obese categories is statistically associated with higher risks of chronic conditions like type 2 diabetes, hypertension, and cardiovascular diseases. However, a person with a 'Normal' BMI can still be unhealthy if they have high visceral fat or poor fitness levels.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-classification-calculator" />
          <PopularCalculators exclude="/calculator/bmi-classification-calculator" />
        </div>
      </div>
    </>
  );
};

export default BmiClassificationCalculator;

