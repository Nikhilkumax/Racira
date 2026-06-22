"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Flame } from "lucide-react";

const RunningCalorieCalculator = () => {
  const [weight, setWeight] = useState("70");
  const [distance, setDistance] = useState("5");
  const [time, setTime] = useState("30");
  const [unit, setUnit] = useState("metric");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let w = parseFloat(weight) || 0;
    let d = parseFloat(distance) || 0;
    const t = parseFloat(time) || 0;

    if (unit === "imperial") {
      w = w / 2.20462;
      d = d * 1.60934;
    }

    if (w <= 0 || d <= 0) return;

    // Standard formula: Calories = Distance (km) * Weight (kg) * 1.036
    const calories = d * w * 1.036;
    
    // Adjusted for speed (approx METs)
    // Speed (km/h) = Distance / (Time / 60)
    const speed = t > 0 ? (d / (t / 60)) : 0;
    
    setResults({
      calories,
      speed,
      caloriesPerKm: calories / d,
      metValue: speed < 8 ? 6 : speed < 12 ? 10 : 13
    });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("70"); setDistance("5"); setTime("30"); setUnit("metric");
    setResults(null);
  };

  const faqs = [
    { question: "How many calories do I burn running a 5K?", answer: "An average person weighing 70kg (154 lbs) burns approximately 350 to 400 calories running 5 kilometers. This varies based on weight and intensity." },
    { question: "Does running faster burn more calories?", answer: "Yes, but not significantly more per mile. Running faster increases your heart rate and metabolic demand, but the total energy required to move your body from point A to point B is primarily determined by distance and weight." },
    { question: "What is the 'Afterburn' effect?", answer: "Technically known as EPOC (Excess Post-exercise Oxygen Consumption), this is the increase in metabolism after a high-intensity run as your body recovers. While real, it typically only adds an extra 6-15% to your total calorie burn." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Running Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Running Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="weight" label={unit === "metric" ? "Weight (kg)" : "Weight (lb)"} value={weight} onChange={setWeight} />
                <InputField id="distance" label={unit === "metric" ? "Distance (km)" : "Distance (mi)"} value={distance} onChange={setDistance} />
                <InputField id="time" label="Time (Minutes)" value={time} onChange={setTime} />
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
                <h2 className="text-xl font-bold mb-6">Workout Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Calories Burned</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.calories)} <span className="text-xl">kcal</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Average Speed</p>
                    <p className="text-3xl font-black text-foreground">{results.speed.toFixed(1)} <span className="text-sm font-normal">{unit === "metric" ? "km/h" : "mph"}</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Calories per " + (unit === "metric" ? "km" : "mi"), value: 0, textValue: results.caloriesPerKm.toFixed(1) + " kcal" },
                  { label: "Estimated METs", value: 0, textValue: results.metValue.toString() },
                  { label: "Intensity", value: 0, textValue: results.speed > 12 ? "High" : results.speed > 8 ? "Moderate" : "Low" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Maximizing Your Run</h2>
              <p>Running is one of the most efficient ways to burn calories and improve cardiovascular health. However, many people overestimate how much they burn during a workout.</p>
              <h3>Distance vs. Duration</h3>
              <p>While spending more time on your feet is good for endurance, calorie burn is primarily a function of work done. Moving your body weight over a specific distance requires a set amount of energy. This is why a slow 5-mile run and a fast 5-mile run burn a similar amount of calories, even if the fast one feels more exhausting.</p>
              <h3>Fueling and Recovery</h3>
              <p>If your goal is weight loss, remember that it's easy to "eat back" your calories after a run. A single sports drink or protein bar can negate the caloric deficit created by a 3-mile run. Focus on nutrient-dense whole foods and stay hydrated with water to see the best results.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/running-calorie" />
          <PopularCalculators exclude="/calculator/running-calorie-calculator" />
        </div>
      </div>
    </>
  );
};

export default RunningCalorieCalculator;

