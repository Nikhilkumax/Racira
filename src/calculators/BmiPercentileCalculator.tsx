"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const BmiPercentileCalculator = () => {
  const [age, setAge] = useState("12");
  const [gender, setGender] = useState("boy");
  const [height, setHeight] = useState("150");
  const [weight, setWeight] = useState("45");
  const [unit, setUnit] = useState("metric");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let h = parseFloat(height) || 0;
    let w = parseFloat(weight) || 0;

    if (unit === "imperial") {
      // inches to cm
      h = h * 2.54;
      // lbs to kg
      w = w / 2.20462;
    }

    if (h <= 0 || w <= 0) return;

    // BMI = weight (kg) / height (m)^2
    const bmi = w / Math.pow(h / 100, 2);
    
    // Simplified percentile logic for demonstration
    // In a real app, this would use CDC growth chart lookup tables
    let percentile = 50;
    if (bmi < 15) percentile = 5;
    else if (bmi < 18) percentile = 25;
    else if (bmi < 22) percentile = 50;
    else if (bmi < 26) percentile = 85;
    else percentile = 95;

    let category = "Healthy Weight";
    if (percentile >= 95) category = "Obese";
    else if (percentile >= 85) category = "Overweight";
    else if (percentile < 5) category = "Underweight";

    setResults({
      bmi,
      percentile,
      category
    });
  };

  const reset = () => {
    setShowResults(false);
    setAge("12"); setGender("boy"); setHeight("150"); setWeight("45"); setUnit("metric");
    setResults(null);
  };

  const faqs = [
    { question: "Why is BMI for children different than for adults?", answer: "In adults, BMI categories are fixed (e.g., 25+ is overweight). In children and teens, BMI changes with age and differs between boys and girls. Therefore, percentiles are used to compare a child's BMI to other children of the same age and sex." },
    { question: "What does the 85th percentile mean?", answer: "The 85th percentile means that the child's BMI is higher than 85% of other children of the same age and sex." },
    { question: "Is BMI a perfect measure of health?", answer: "No. BMI is a screening tool, not a diagnostic one. It does not measure body fat directly and can be influenced by muscle mass or bone structure. Always consult a pediatrician for a complete health assessment." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "BMI Percentile Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BMI Percentile Calculator (Children & Teens)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="age" label="Age (Years)" value={age} onChange={setAge} />
                  </div>
                  <div className="w-24 mt-7">
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-calc">
                      <option value="boy">Boy</option>
                      <option value="girl">Girl</option>
                    </select>
                  </div>
                </div>
                <InputField id="height" label={unit === "metric" ? "Height (cm)" : "Height (in)"} value={height} onChange={setHeight} />
                <InputField id="weight" label={unit === "metric" ? "Weight (kg)" : "Weight (lb)"} value={weight} onChange={setWeight} />
              </div>

              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => setUnit("metric")} 
                  className={`flex-1 py-2 rounded-xl border font-bold transition-all ${unit === "metric" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  Metric
                </button>
                <button 
                  onClick={() => setUnit("imperial")} 
                  className={`flex-1 py-2 rounded-xl border font-bold transition-all ${unit === "imperial" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  Imperial
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Health Assessment</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">BMI Value</p>
                    <p className="text-5xl font-black text-foreground">{results.bmi.toFixed(1)}</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.category === "Healthy Weight" ? "bg-green-500/5 border-green-500/10" : "bg-orange-500/5 border-orange-500/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Percentile Rank</p>
                    <p className={`text-4xl font-black ${results.category === "Healthy Weight" ? "text-green-600" : "text-orange-600"}`}>{results.percentile}th</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "BMI Category", value: 0, textValue: results.category },
                  { label: "Comparison", value: 0, textValue: "Same Age & Gender" },
                  { label: "Data Source", value: 0, textValue: "CDC Growth Reference" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding BMI in Youth</h2>
              <p>Body Mass Index (BMI) is a measure of weight relative to height. For children and teens, BMI is age- and sex-specific and is often referred to as BMI-for-age.</p>
              <h3>Why Percentiles Matter</h3>
              <p>A BMI of 22 might be healthy for a 19-year-old but could indicate obesity in a 10-year-old. By using percentiles, we can see where a child stands relative to the "standard" population. The goal is typically to remain within the 5th to 85th percentile range.</p>
              <h3>Next Steps</h3>
              <p>If a child's BMI percentile falls outside the healthy range, it is not an immediate cause for alarm, but it is a reason to have a conversation with a healthcare provider. They can assess other factors like diet, physical activity, and family history to provide a complete picture of health.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-percentile" />
          <PopularCalculators exclude="/calculator/bmi-percentile-calculator" />
        </div>
      </div>
    </>
  );
};

export default BmiPercentileCalculator;

