"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, HeartPulse } from "lucide-react";

const TargetHeartRateCalculator = () => {
  const [age, setAge] = useState("30");
  const [restingHr, setRestingHr] = useState("60");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const a = parseInt(age);
    const rhr = parseInt(restingHr);

    if (a <= 0 || rhr <= 0) return;

    // Max Heart Rate (Gellish formula is more accurate than 220-age)
    // Formula: 207 - (0.7 * age)
    const mhr = Math.round(207 - (0.7 * a));

    // Heart Rate Reserve (Karvonen method)
    const hrr = mhr - rhr;

    // Zones
    // Moderate (50-70% of max, or 40-59% of HRR)
    // Vigorous (70-85% of max, or 60-84% of HRR)
    
    // Using Karvonen method for zones (more accurate as it accounts for resting fitness)
    const z1Start = Math.round(rhr + (hrr * 0.50));
    const z1End = Math.round(rhr + (hrr * 0.60)); // Warm up / Recovery

    const z2Start = Math.round(rhr + (hrr * 0.60));
    const z2End = Math.round(rhr + (hrr * 0.70)); // Fat Burn / Aerobic Base

    const z3Start = Math.round(rhr + (hrr * 0.70));
    const z3End = Math.round(rhr + (hrr * 0.80)); // Aerobic / Cardio

    const z4Start = Math.round(rhr + (hrr * 0.80));
    const z4End = Math.round(rhr + (hrr * 0.90)); // Anaerobic / Threshold

    const z5Start = Math.round(rhr + (hrr * 0.90));
    const z5End = mhr; // VO2 Max / Peak

    setResults({ 
      mhr, 
      hrr,
      z1: `${z1Start} - ${z1End} bpm`,
      z2: `${z2Start} - ${z2End} bpm`,
      z3: `${z3Start} - ${z3End} bpm`,
      z4: `${z4Start} - ${z4End} bpm`,
      z5: `${z5Start} - ${z5End} bpm`
    });
  };

  const reset = () => {
    setShowResults(false); setAge("30"); setRestingHr("60"); setResults(null); };

  const faqs = [
    { question: "What is the Karvonen Formula?", answer: "The Karvonen formula is a mathematical equation that helps determine your target heart rate zones. Unlike the standard '220 - age' formula, Karvonen factors in your resting heart rate (Heart Rate Reserve), making it highly personalized to your current fitness level." },
    { question: "What is the 'Fat Burning Zone'?", answer: "Zone 2 (roughly 60-70% of your maximum heart rate) is often called the fat-burning zone because a higher percentage of calories burned comes from fat rather than carbohydrates. However, high-intensity workouts (Zone 4) burn more total calories overall." },
    { question: "How do I find my true resting heart rate?", answer: "The best way to find your resting heart rate (RHR) is to measure it first thing in the morning, before getting out of bed. You can count your pulse for 60 seconds, or use a fitness tracker or smartwatch that tracks sleep metrics." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Target Heart Rate Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Target Heart Rate Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your personalized heart rate training zones using the Karvonen formula for optimal fitness results.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="age" label="Age" value={age} onChange={setAge} />
                <InputField id="rhr" label="Resting Heart Rate (bpm)" value={restingHr} onChange={setRestingHr} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><HeartPulse className="h-5 w-5" /> Calculate Zones</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Your Heart Rate Zones</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">Max Heart Rate</p>
                    <p className="text-4xl font-black text-foreground">{results.mhr}</p>
                    <p className="text-sm text-muted-foreground mt-1">bpm</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Heart Rate Reserve</p>
                    <p className="text-3xl font-black text-foreground">{results.hrr}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-bold">Zone 5: Peak / VO2 Max</p>
                      <p className="text-sm text-muted-foreground">90-100% HRR (Sprinting)</p>
                    </div>
                    <div className="font-black text-red-500">{results.z5}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-bold">Zone 4: Anaerobic</p>
                      <p className="text-sm text-muted-foreground">80-90% HRR (Hard interval training)</p>
                    </div>
                    <div className="font-black text-orange-500">{results.z4}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-bold">Zone 3: Aerobic</p>
                      <p className="text-sm text-muted-foreground">70-80% HRR (Tempo runs, cardio)</p>
                    </div>
                    <div className="font-black text-yellow-600">{results.z3}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-bold">Zone 2: Fat Burn</p>
                      <p className="text-sm text-muted-foreground">60-70% HRR (Light jogging, cycling)</p>
                    </div>
                    <div className="font-black text-green-500">{results.z2}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-bold">Zone 1: Warm Up</p>
                      <p className="text-sm text-muted-foreground">50-60% HRR (Brisk walking)</p>
                    </div>
                    <div className="font-black text-blue-500">{results.z1}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Why Train in Zones?</h2>
              <p>Heart rate zone training ensures you are working out at the right intensity to achieve your specific goals. If you want to run a faster 5K, you need to spend time in Zones 3 and 4. If you want to build endurance for a marathon or burn fat efficiently, you should spend the majority of your time in Zone 2.</p>
              <h3>The 80/20 Rule of Endurance Training</h3>
              <p>Elite endurance athletes spend about 80% of their training time in Zone 2 (easy, aerobic effort) and only 20% in Zones 4 and 5 (hard, anaerobic effort). Amateurs often make the mistake of running every run in Zone 3—too fast to recover, but too slow to build high-end speed.</p>
              <h3>Checking Your Max Heart Rate</h3>
              <p>Formulas provide estimates. Your true maximum heart rate is determined genetically and can only be definitively found through a strenuous stress test (like running 400m intervals on a track until absolute exhaustion).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/target-heart-rate" />
          <PopularCalculators exclude="/calculator/target-heart-rate-calculator" />
        </div>
      </div>
    </>
  );
};
export default TargetHeartRateCalculator;

