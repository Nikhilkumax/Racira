"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const PaceCalculator = () => {
  const [distance, setDistance] = useState("5");
  const [distanceUnit, setDistanceUnit] = useState("km"); // km, miles
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const dist = parseFloat(distance);
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;

    const totalSeconds = (h * 3600) + (m * 60) + s;
    if (dist <= 0 || totalSeconds <= 0) return;

    // Seconds per unit distance
    const paceSeconds = totalSeconds / dist;
    
    const paceMin = Math.floor(paceSeconds / 60);
    const paceSec = Math.floor(paceSeconds % 60);

    const speedUnitHour = dist / (totalSeconds / 3600);
    
    // Cross conversion
    let otherPace = "";
    let otherSpeed = "";
    
    if (distanceUnit === "km") {
      // Current is km, convert to miles
      const distMiles = dist * 0.621371;
      const otherPaceSecs = totalSeconds / distMiles;
      otherPace = `${Math.floor(otherPaceSecs / 60)}:${Math.floor(otherPaceSecs % 60).toString().padStart(2, '0')} /mi`;
      otherSpeed = `${(speedUnitHour * 0.621371).toFixed(2)} mph`;
    } else {
      // Current is miles, convert to km
      const distKm = dist * 1.60934;
      const otherPaceSecs = totalSeconds / distKm;
      otherPace = `${Math.floor(otherPaceSecs / 60)}:${Math.floor(otherPaceSecs % 60).toString().padStart(2, '0')} /km`;
      otherSpeed = `${(speedUnitHour * 1.60934).toFixed(2)} km/h`;
    }

    setResults({ 
      pace: `${paceMin}:${paceSec.toString().padStart(2, '0')} /${distanceUnit === 'km' ? 'km' : 'mi'}`,
      speed: `${speedUnitHour.toFixed(2)} ${distanceUnit === 'km' ? 'km/h' : 'mph'}`,
      otherPace,
      otherSpeed
    });
  };

  const reset = () => {
    setShowResults(false); setDistance("5"); setDistanceUnit("km"); setHours("0"); setMinutes("25"); setSeconds("0"); setResults(null); };

  const faqs = [
    { question: "What is pace vs. speed?", answer: "Speed is how much distance you cover in a specific time (e.g., miles per hour). Pace is the inverse: how much time it takes to cover a specific distance (e.g., minutes per mile). Runners generally use pace to train." },
    { question: "What is a good 5K pace?", answer: "A 'good' pace is entirely subjective and depends on age, gender, and fitness level. For a beginner, a 10:00 to 12:00 min/mile pace (about 30-37 minutes for a 5K) is great. Elite runners can run a 5K at a 4:30 min/mile pace." },
    { question: "How do I calculate treadmill speed from pace?", answer: "Treadmills use speed (mph or km/h). If your pace is 10:00 min/mi, you are running at 60 / 10 = 6.0 mph. This calculator provides the exact speed you need to set on the treadmill to hit your target pace." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pace Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pace Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                <InputField id="dist" label="Distance" value={distance} onChange={setDistance} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                  <select value={distanceUnit} onChange={e => setDistanceUnit(e.target.value)} className="input-calc">
                    <option value="km">Kilometers</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
                <InputField id="hrs" label="Hours" value={hours} onChange={setHours} />
                <InputField id="mins" label="Minutes" value={minutes} onChange={setMinutes} />
                <InputField id="secs" label="Seconds" value={seconds} onChange={setSeconds} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Running Metrics</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Average Pace</p>
                    <p className="text-4xl font-black text-foreground">{results.pace}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Average Speed</p>
                    <p className="text-3xl font-black text-foreground">{results.speed}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Equivalent Pace", value: 0, textValue: results.otherPace },
                  { label: "Equivalent Speed", value: 0, textValue: results.otherSpeed },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Training with Pace</h2>
              <p>Understanding your pace is the foundation of endurance training. Whether you are training for a 5K, a half-marathon, or a full marathon, knowing exactly how fast you are running per mile or kilometer allows you to pace yourself so you don't burn out early.</p>
              <h3>Pacing Strategies</h3>
              <p>For long races, a "negative split" strategy is often recommended. This means running the second half of the race slightly faster than the first half. It requires extreme discipline to run slower than you feel you can at the beginning.</p>
              <h3>Treadmill vs. Outdoor Running</h3>
              <p>Because there is no wind resistance or terrain variation, running on a treadmill at a 0% incline is slightly easier than running outdoors at the same pace. Many runners set the treadmill to a 1% incline to better simulate outdoor effort.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pace" />
          <PopularCalculators exclude="/calculator/pace-calculator" />
        </div>
      </div>
    </>
  );
};
export default PaceCalculator;

