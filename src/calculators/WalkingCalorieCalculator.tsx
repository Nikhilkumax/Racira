"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Flame } from "lucide-react";

const WalkingCalorieCalculator = () => {
  const [weight, setWeight] = useState("70");
  const [distance, setDistance] = useState("5");
  const [pace, setPace] = useState("brisk");
  const [unit, setUnit] = useState("metric");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let w = parseFloat(weight) || 0;
    let d = parseFloat(distance) || 0;

    if (unit === "imperial") {
      w = w / 2.20462;
      d = d * 1.60934;
    }

    if (w <= 0 || d <= 0) return;

    // MET values for walking: 
    // slow: 3.0, brisk: 3.8, very brisk: 5.0
    const metMap: any = { slow: 3.0, brisk: 3.8, veryBrisk: 5.0 };
    const met = metMap[pace];

    // Formula: Calories = (MET * 3.5 * weight_kg / 200) * Time (mins)
    // We need time. Let's assume average speeds:
    // slow: 3km/h, brisk: 5km/h, veryBrisk: 6.5km/h
    const speedMap: any = { slow: 3, brisk: 5, veryBrisk: 6.5 };
    const speed = speedMap[pace];
    const timeInHours = d / speed;
    const timeInMins = timeInHours * 60;

    const calories = (met * 3.5 * w / 200) * timeInMins;

    setResults({
      calories,
      timeInMins,
      speed,
      caloriesPerKm: calories / d
    });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("70"); setDistance("5"); setPace("brisk"); setUnit("metric");
    setResults(null);
  };

  const faqs = [
    { question: "Is walking 10,000 steps enough to lose weight?", answer: "Walking 10,000 steps (about 5 miles) burns roughly 300 to 500 calories. While a great habit, weight loss also depends on your caloric intake. Consistency is key!" },
    { question: "How does pace affect calorie burn?", answer: "A faster pace increases your metabolic rate (MET value), meaning you burn more calories per minute. However, the total calories burned over a specific distance is relatively similar across different walking speeds." },
    { question: "Does walking burn more fat than running?", answer: "Walking uses a higher percentage of fat as fuel compared to running, but running burns more total calories in the same amount of time. Total caloric deficit is the primary driver for fat loss." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Walking Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Walking Calorie Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate the calories burned during your walk based on distance, weight, and pace.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="weight" label={unit === "metric" ? "Weight (kg)" : "Weight (lb)"} value={weight} onChange={setWeight} />
                <InputField id="distance" label={unit === "metric" ? "Distance (km)" : "Distance (mi)"} value={distance} onChange={setDistance} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Walking Pace</label>
                  <select value={pace} onChange={(e) => setPace(e.target.value)} className="input-calc">
                    <option value="slow">Slow (Stroll)</option>
                    <option value="brisk">Brisk (Power Walk)</option>
                    <option value="veryBrisk">Very Brisk (Fast)</option>
                  </select>
                </div>
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
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Flame className="h-5 w-5" /> Calculate Burn
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Walk Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Calories Burned</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.calories)} <span className="text-xl">kcal</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Duration</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.timeInMins)} <span className="text-sm font-normal">min</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Est. Speed", value: 0, textValue: results.speed.toFixed(1) + (unit === "metric" ? " km/h" : " mph") },
                  { label: "Calories per " + (unit === "metric" ? "km" : "mi"), value: 0, textValue: results.caloriesPerKm.toFixed(1) + " kcal" },
                  { label: "MET Value", value: 0, textValue: pace === "slow" ? "3.0" : pace === "brisk" ? "3.8" : "5.0" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Benefits of Walking</h2>
              <p>Walking is the most accessible form of physical activity and offers profound health benefits for your heart, bones, and mind. Unlike high-impact exercises, it's gentle on the joints and can be sustained daily.</p>
              <h3>Steps and Heart Health</h3>
              <p>Walking at a brisk pace for just 30 minutes a day has been shown to reduce the risk of heart disease and stroke. It helps lower blood pressure, improves circulation, and can help manage blood sugar levels.</p>
              <h3>Walking for Weight Management</h3>
              <p>While often underestimated, walking is a fantastic tool for weight loss because it is low-stress and doesn't typically trigger the same "extreme hunger" response that high-intensity workouts can. It is much easier to maintain a caloric deficit when you incorporate regular, pleasant walks into your routine.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/walking-calorie" />
          <PopularCalculators exclude="/calculator/walking-calorie-calculator" />
        </div>
      </div>
    </>
  );
};

export default WalkingCalorieCalculator;

