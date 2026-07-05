"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const WaistToHipRatioCalculator = () => {
  const [waist, setWaist] = useState("32");
  const [hip, setHip] = useState("38");
  const [gender, setGender] = useState("female");
  const [unit, setUnit] = useState("in");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(waist);
    const h = parseFloat(hip);
    const ratio = w / h;

    let risk = "";
    let color = "";
    if (gender === "male") {
      if (ratio < 0.90) { risk = "Low Risk"; color = "green"; }
      else if (ratio < 1.0) { risk = "Moderate Risk"; color = "yellow"; }
      else { risk = "High Risk"; color = "red"; }
    } else {
      if (ratio < 0.80) { risk = "Low Risk"; color = "green"; }
      else if (ratio < 0.85) { risk = "Moderate Risk"; color = "yellow"; }
      else { risk = "High Risk"; color = "red"; }
    }

    setResults({ ratio, risk, color });
  };

  const reset = () => {
    setShowResults(false); setWaist("32"); setHip("38"); setGender("female"); setUnit("in"); setResults(null); };

  const faqs = [
    { question: "What is waist-to-hip ratio?", answer: "WHR is the ratio of your waist circumference to your hip circumference. It measures fat distribution and is a better predictor of cardiovascular disease than BMI alone." },
    { question: "What is a healthy waist-to-hip ratio?", answer: "For women, a ratio below 0.80 is low risk; 0.80-0.85 is moderate; above 0.85 is high. For men, below 0.90 is low risk; 0.90-1.0 is moderate; above 1.0 is high." },
    { question: "Why is waist-to-hip ratio important?", answer: "Apple-shaped bodies (excess belly fat) carry significantly higher risk of heart disease, type 2 diabetes, and stroke than pear-shaped bodies (fat carried in hips and thighs). WHR helps identify this risk pattern." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Waist-to-Hip Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Waist-to-Hip Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="waist" label={`Waist (${unit})`} value={waist} onChange={setWaist} />
                <InputField id="hip" label={`Hip (${unit})`} value={hip} onChange={setHip} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="input-calc">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="input-calc">
                    <option value="in">Inches</option>
                    <option value="cm">Centimeters</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">WHR Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Your WHR</p>
                    <p className="text-5xl font-black text-foreground">{results.ratio.toFixed(2)}</p>
                  </div>
                  <div className={`p-6 rounded-2xl text-center flex flex-col justify-center ${results.color === "green" ? "bg-green-500/10 border border-green-500/20" : results.color === "yellow" ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">Risk Level</p>
                    <p className={`text-3xl font-black ${results.color === "green" ? "text-green-600" : results.color === "yellow" ? "text-yellow-600" : "text-red-600"}`}>{results.risk}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Waist", value: 0, textValue: waist + " " + unit },
                  { label: "Hip", value: 0, textValue: hip + " " + unit },
                  { label: "WHO Standard (Low Risk)", value: 0, textValue: gender === "male" ? "< 0.90" : "< 0.80" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Waist-to-Hip Ratio</h2>
              <p>The WHO uses WHR as a key indicator of abdominal obesity and associated health risks. Fat stored around the abdomen (visceral fat) is metabolically active and linked to insulin resistance, inflammation, and cardiovascular disease.</p>
              <h3>Apple vs. Pear Body Shape</h3>
              <p>"Apple-shaped" individuals carry weight in the abdomen (high WHR). "Pear-shaped" individuals carry weight in the hips and thighs (low WHR). Research consistently shows that apple-shaped body composition carries significantly higher health risks.</p>
              <h3>How to Measure Correctly</h3>
              <p>Measure your waist at its narrowest point (usually just above the belly button). Measure your hip at the widest point (around the hip bones and buttocks). Breathe normally during measurement — don't suck in.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/waist-to-hip-ratio" />
          <PopularCalculators exclude="/calculator/waist-to-hip-ratio-calculator" />
        </div>
      </div>
    </>
  );
};
export default WaistToHipRatioCalculator;

