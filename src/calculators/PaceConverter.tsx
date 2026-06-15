"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Timer } from "lucide-react";

const PaceConverter = () => {
  const [distance, setDistance] = useState("5");
  const [distUnit, setDistUnit] = useState("km");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(distance) || 0;
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    const s = parseFloat(seconds) || 0;

    if (d <= 0) return;

    const totalSeconds = (h * 3600) + (m * 60) + s;
    if (totalSeconds <= 0) return;

    // Convert to common base: km
    const distKm = distUnit === "km" ? d : d * 1.60934;
    const distMi = distUnit === "mi" ? d : d / 1.60934;

    // Pace: seconds per distance
    const secPerKm = totalSeconds / distKm;
    const secPerMi = totalSeconds / distMi;

    const fmtPace = (sec: number) => {
      const min = Math.floor(sec / 60);
      const s = Math.round(sec % 60);
      return `${min}:${s.toString().padStart(2, "0")}`;
    };

    setResults({
      paceKm: fmtPace(secPerKm),
      paceMi: fmtPace(secPerMi),
      speedKph: (distKm / (totalSeconds / 3600)).toFixed(1),
      speedMph: (distMi / (totalSeconds / 3600)).toFixed(1)
    });
  };

  const reset = () => {
    setShowResults(false);
    setDistance("5"); setDistUnit("km"); setHours("0"); setMinutes("25"); setSeconds("0");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between pace and speed?", answer: "Speed is distance divided by time (e.g., 10 km/h). Pace is time divided by distance (e.g., 6:00 per km). Pace is the standard metric used by runners to track their effort." },
    { question: "How do I calculate my 5K pace?", answer: "To find your 5K pace, divide your total finishing time by 5. For example, a 25:00 5K is a 5:00/km pace." },
    { question: "What is a 'good' running pace?", answer: "A 'good' pace is highly subjective. For many recreational runners, a pace under 6:00/km (9:40/mile) is a common goal. Elite marathoners run at a pace under 3:00/km (4:50/mile)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pace Converter" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pace Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="dist" label="Distance" value={distance} onChange={setDistance} />
                  </div>
                  <div className="w-20 mt-7">
                    <select value={distUnit} onChange={(e) => setDistUnit(e.target.value)} className="input-calc">
                      <option value="km">km</option>
                      <option value="mi">mi</option>
                    </select>
                  </div>
                </div>
                <InputField id="h" label="Hours" value={hours} onChange={setHours} />
                <InputField id="m" label="Minutes" value={minutes} onChange={setMinutes} />
                <InputField id="s" label="Seconds" value={seconds} onChange={setSeconds} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Timer className="h-5 w-5" /> Convert Pace
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Conversion Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Pace (/km)</p>
                    <p className="text-3xl font-black text-foreground">{results.paceKm}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Pace (/mi)</p>
                    <p className="text-3xl font-black text-foreground">{results.paceMi}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Speed (km/h)</p>
                    <p className="text-3xl font-black text-foreground">{results.speedKph}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Speed (mph)</p>
                    <p className="text-3xl font-black text-foreground">{results.speedMph}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Mastering Your Pace</h2>
              <p>Pace is the primary language of runners. Unlike speed, which tells you how much distance you cover in a set time, pace tells you how long it will take to reach your destination. This makes it invaluable for race planning and training.</p>
              <h3>Training Zones</h3>
              <p>Most running coaches use pace to define training zones. An "Easy Run" might be done at a pace 60-90 seconds slower than your 5K race pace, while "Interval Training" might be done at or faster than race pace to build speed and aerobic capacity.</p>
              <h3>Predicting Race Times</h3>
              <p>Once you know your steady training pace, you can use it to predict your time for longer distances. However, remember that as the distance increases, your pace will naturally slow down. A common rule is to add 15-20 seconds per mile when doubling the distance of a race (e.g., from 5K to 10K).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pace-converter" />
          <PopularCalculators exclude="/calculator/pace-converter" />
        </div>
      </div>
    </>
  );
};

export default PaceConverter;

