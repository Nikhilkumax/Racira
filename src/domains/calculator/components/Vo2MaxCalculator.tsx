"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const Vo2MaxCalculator = () => {
  const [method, setMethod] = useState("rockport"); // rockport, cooper, resting
  
  // Resting Method
  const [age, setAge] = useState("30");
  const [restingHr, setRestingHr] = useState("65");
  
  // Cooper Test Method (12 min run)
  const [distance, setDistance] = useState("2400"); // meters
  
  // Rockport Test Method (1 mile walk)
  const [weight, setWeight] = useState("160"); // lbs
  const [gender, setGender] = useState("1"); // 1 for male, 0 for female
  const [walkTime, setWalkTime] = useState("15"); // minutes
  const [endHr, setEndHr] = useState("120"); // bpm at end of walk

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let vo2max = 0;

    if (method === "resting") {
      const a = parseFloat(age);
      const rhr = parseFloat(restingHr);
      if (a <= 0 || rhr <= 0) return;
      // Uth-Sørensen-Overgaard-Pedersen estimation: 15 * (HRmax / HRrest)
      const mhr = 208 - (0.7 * a); // Tanaka formula
      vo2max = 15 * (mhr / rhr);
    } 
    else if (method === "cooper") {
      const dist = parseFloat(distance);
      if (dist <= 0) return;
      // Cooper formula: (Distance in meters - 504.9) / 44.73
      vo2max = (dist - 504.9) / 44.73;
    } 
    else if (method === "rockport") {
      const wt = parseFloat(weight);
      const t = parseFloat(walkTime);
      const hr = parseFloat(endHr);
      const a = parseFloat(age);
      const g = parseInt(gender);
      
      if (wt <= 0 || t <= 0 || hr <= 0 || a <= 0) return;
      // Rockport formula: 132.853 - (0.0769 * weight in lbs) - (0.3877 * age) + (6.315 * gender) - (3.2649 * time in mins) - (0.1565 * heart rate)
      vo2max = 132.853 - (0.0769 * wt) - (0.3877 * a) + (6.315 * g) - (3.2649 * t) - (0.1565 * hr);
    }

    // Determine fitness level based on generic ranges
    let level = "";
    let color = "";
    if (vo2max < 30) { level = "Poor"; color = "red"; }
    else if (vo2max < 40) { level = "Fair"; color = "yellow"; }
    else if (vo2max < 50) { level = "Good"; color = "blue"; }
    else if (vo2max < 60) { level = "Excellent"; color = "green"; }
    else { level = "Superior (Elite Athlete)"; color = "purple"; }

    setResults({ 
      vo2max: vo2max.toFixed(1),
      level,
      color,
      mets: (vo2max / 3.5).toFixed(1) // 1 MET = 3.5 ml/kg/min
    });
  };

  const reset = () => {
    setShowResults(false); 
    setMethod("rockport"); setAge("30"); setRestingHr("65"); setDistance("2400");
    setWeight("160"); setGender("1"); setWalkTime("15"); setEndHr("120"); setResults(null); 
  };

  const faqs = [
    { question: "What is VO2 Max?", answer: "VO2 Max is the maximum amount of oxygen your body can utilize during intense exercise. It is measured in milliliters of oxygen used in one minute per kilogram of body weight (ml/kg/min) and is considered the gold standard of cardiovascular fitness." },
    { question: "What is a good VO2 Max?", answer: "A 'good' VO2 Max varies by age and gender. Generally, for a 30-year-old male, 40-50 is good, while >55 is excellent. For a 30-year-old female, 35-45 is good, and >50 is excellent. Elite endurance athletes often score between 70 and 90." },
    { question: "Which test method is best?", answer: "The Cooper Test (running as far as you can in 12 minutes) is very accurate for runners. The Rockport Walk Test is safer and better for beginners or older adults. The Resting Heart Rate method is the easiest but the least accurate." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "VO2 Max Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">VO2 Max Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Estimation Method</label>
                <select value={method} onChange={e => { setMethod(e.target.value); setResults(null); }} className="input-calc w-full sm:w-1/2">
                  <option value="rockport">Rockport 1-Mile Walk Test</option>
                  <option value="cooper">Cooper 12-Minute Run Test</option>
                  <option value="resting">Resting Heart Rate Formula</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                {method === "resting" && (
                  <>
                    <InputField id="age" label="Age" value={age} onChange={setAge} />
                    <InputField id="rhr" label="Resting Heart Rate (bpm)" value={restingHr} onChange={setRestingHr} />
                  </>
                )}
                {method === "cooper" && (
                  <>
                    <InputField id="dist" label="Distance Covered in 12 Mins (Meters)" value={distance} onChange={setDistance} />
                  </>
                )}
                {method === "rockport" && (
                  <>
                    <InputField id="wt" label="Weight (lbs)" value={weight} onChange={setWeight} />
                    <InputField id="age" label="Age" value={age} onChange={setAge} />
                    <InputField id="wtm" label="Walk Time (Minutes as decimal, e.g. 15.5)" value={walkTime} onChange={setWalkTime} />
                    <InputField id="ehr" label="Ending Heart Rate (bpm)" value={endHr} onChange={setEndHr} />
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value)} className="input-calc">
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Your Fitness Profile</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated VO2 Max</p>
                    <p className="text-4xl font-black text-foreground">{results.vo2max}</p>
                    <p className="text-sm text-muted-foreground mt-1">ml/kg/min</p>
                  </div>
                  <div className={`p-6 rounded-2xl text-center flex flex-col justify-center border 
                    ${results.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-600' : 
                      results.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' : 
                      results.color === 'green' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 
                      results.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' : 
                      'bg-purple-500/10 border-purple-500/20 text-purple-600'}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">Fitness Level</p>
                    <p className="text-2xl font-black">{results.level}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Max Metabolic Equivalents (METs)", value: 0, textValue: results.mets },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Improving Your VO2 Max</h2>
              <p>While genetics play a significant role in your absolute potential, almost anyone can improve their VO2 Max through consistent training. The most effective way to increase it is through High-Intensity Interval Training (HIIT).</p>
              <h3>Why It Matters for Health</h3>
              <p>Beyond athletic performance, VO2 Max is one of the strongest independent predictors of longevity. A high cardiovascular capacity means your heart doesn't have to work as hard during daily activities, lowering your risk of cardiovascular disease.</p>
              <h3>Clinical Testing vs. Estimation</h3>
              <p>The only way to find your true, exact VO2 Max is in a sports science lab, running on a treadmill with a mask strapped to your face measuring your oxygen inspiration and expiration. However, formulas like the Cooper Test and Rockport Test have been clinically validated to provide extremely close estimates.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vo2-max" />
          <PopularCalculators exclude="/calculator/vo2-max-calculator" />
        </div>
      </div>
    </>
  );
};
export default Vo2MaxCalculator;

