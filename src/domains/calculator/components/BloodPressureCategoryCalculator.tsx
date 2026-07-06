"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Heart } from "lucide-react";

const BloodPressureCategoryCalculator = () => {
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const s = parseInt(systolic) || 0;
    const d = parseInt(diastolic) || 0;

    let category = "";
    let color = "";
    let description = "";

    if (s < 120 && d < 80) {
      category = "Normal";
      color = "text-green-500";
      description = "Your blood pressure is in the healthy range. Maintain healthy lifestyle habits.";
    } else if (s < 130 && d < 80) {
      category = "Elevated";
      color = "text-yellow-500";
      description = "You are at risk for high blood pressure. Lifestyle changes are often recommended.";
    } else if (s < 140 || d < 90) {
      category = "Hypertension Stage 1";
      color = "text-orange-500";
      description = "Blood pressure is consistently high. Doctors may prescribe lifestyle changes and medication.";
    } else if (s < 180 || d < 120) {
      category = "Hypertension Stage 2";
      color = "text-red-500";
      description = "Blood pressure is significantly high. Medical intervention is usually required.";
    } else {
      category = "Hypertensive Crisis";
      color = "text-red-700 font-bold animate-pulse";
      description = "URGENT: Consult a doctor immediately or seek emergency medical care.";
    }

    setResults({ category, color, description, s, d });
  };

  const reset = () => {
    setShowResults(false);
    setSystolic("120");
    setDiastolic("80");
    setResults(null);
  };

  const faqs = [
    { question: "What do the blood pressure numbers mean?", answer: "The top number (systolic) measures the pressure in your arteries when your heart beats. The bottom number (diastolic) measures the pressure in your arteries when your heart rests between beats." },
    { question: "What is considered high blood pressure?", answer: "According to the American Heart Association (AHA), high blood pressure is defined as a reading of 130/80 mmHg or higher." },
    { question: "How can I lower my blood pressure naturally?", answer: "Reducing sodium (salt) intake, exercising regularly, losing weight, and limiting alcohol can all help lower blood pressure. The DASH diet is also highly effective." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Blood Pressure" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Blood Pressure Category Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="systolic" label="Systolic (Top Number)" value={systolic} onChange={setSystolic} suffix="mmHg" />
                <InputField id="diastolic" label="Diastolic (Bottom Number)" value={diastolic} onChange={setDiastolic} suffix="mmHg" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-3">Reading Category</h2>
                  <p className={`text-4xl font-extrabold mb-2 ${results.color}`}>{results.category}</p>
                  <p className="text-muted-foreground max-w-md">{results.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                   <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Systolic</p>
                      <p className="text-2xl font-bold">{results.s}</p>
                   </div>
                   <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Diastolic</p>
                      <p className="text-2xl font-bold">{results.d}</p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The 'Silent Killer': Why Monitoring Matters</h2>
              <p>High blood pressure (hypertension) often has no symptoms, earning it the nickname 'the silent killer.' Left untreated, it can lead to heart attacks, strokes, and kidney disease. Regular monitoring at home can help you and your doctor identify trends that might not be visible during an occasional office visit.</p>
              <h3>Understanding the AHA Guidelines</h3>
              <p>In 2017, the American Heart Association lowered the threshold for Hypertension Stage 1 from 140/90 to 130/80. This change was based on research showing that risks for cardiovascular complications double when blood pressure is in the 130-139 range compared to the normal range.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/blood-pressure-category-calculator" />
          <PopularCalculators exclude="/calculator/blood-pressure-category-calculator" />
        </div>
      </div>
    </>
  );
};

export default BloodPressureCategoryCalculator;

