"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Timer } from "lucide-react";

type SolveFor = "speed" | "distance" | "time";

const SpeedDistanceTimeCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("speed");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ speed: number; distance: number; time: number } | null>(null);

  const getLabels = () => {
    switch (solveFor) {
      case "speed": return { a: "Distance", aUnit: "km", b: "Time", bUnit: "hours" };
      case "distance": return { a: "Speed", aUnit: "km/h", b: "Time", bUnit: "hours" };
      case "time": return { a: "Distance", aUnit: "km", b: "Speed", bUnit: "km/h" };
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.round(((hours - h) * 60 - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  const handleCalculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return;

    setShowResults(true);
    switch (solveFor) {
      case "speed": setResults({ speed: a / b, distance: a, time: b }); break;
      case "distance": setResults({ speed: a, distance: a * b, time: b }); break;
      case "time": setResults({ speed: b, distance: a, time: a / b }); break;
    }
  };

  const reset = () => {
    setShowResults(false);
    setInputA("");
    setInputB("");
    setResults(null);
  };

  const labels = getLabels();

  const faqs = [
    { question: "What is the speed formula?", answer: "Speed = Distance / Time. This is the fundamental relationship connecting how fast something moves with how far it goes and how long it takes." },
    { question: "How do I convert between km/h and m/s?", answer: "Multiply km/h by 5/18 to get m/s, or multiply m/s by 18/5 to get km/h." },
    { question: "What is average speed vs instantaneous speed?", answer: "Average speed is total distance divided by total time. Instantaneous speed is the speed at a specific moment in time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Speed Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Speed Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate speed, distance, or time using the formula Speed = Distance / Time.</p>

            <div className="card-calculator mb-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block text-[10px]">Solve For</label>
                  <select 
                    value={solveFor} 
                    onChange={(e) => { setSolveFor(e.target.value as SolveFor); setInputA(""); setInputB(""); setShowResults(false); }}
                    className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium"
                  >
                    <option value="speed">Speed (S = D / T)</option>
                    <option value="distance">Distance (D = S × T)</option>
                    <option value="time">Time (T = D / S)</option>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <InputField id="inputA" label={labels.a} value={inputA} onChange={setInputA} suffix={labels.aUnit} type="number" />
                  <InputField id="inputB" label={labels.b} value={inputB} onChange={setInputB} suffix={labels.bUnit} type="number" />
                </div>

                <div className="flex gap-3 items-center pt-4 border-t border-border">
                  <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                </div>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" /> Journey Results
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "speed" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Speed</p>
                    <p className={`text-xl font-black ${solveFor === "speed" ? "text-primary" : "text-foreground"}`}>{results.speed.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">km/h</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{(results.speed / 3.6).toFixed(2)} m/s</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "distance" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Distance</p>
                    <p className={`text-xl font-black ${solveFor === "distance" ? "text-primary" : "text-foreground"}`}>{results.distance.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">km</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{(results.distance * 1000).toLocaleString()} m</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "time" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Time</p>
                    <p className={`text-xl font-black ${solveFor === "time" ? "text-primary" : "text-foreground"}`}>{results.time.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">hours</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTime(results.time)}</p>
                  </div>
                </div>
              </div>
            )}

            <article className="prose-finance">
              <h2>The Mechanics of Speed</h2>
              <p>The relationship between speed, distance, and time is one of the most basic and important concepts in physics and everyday life.</p>
              
              <h3>The Formula Triangle</h3>
              <p>A simple way to remember the relationship is the formula triangle:</p>
              <ul>
                <li><strong>Speed = Distance ÷ Time</strong></li>
                <li><strong>Distance = Speed × Time</strong></li>
                <li><strong>Time = Distance ÷ Speed</strong></li>
              </ul>
              
              <h3>Common Speed Benchmarks</h3>
              <ul>
                <li><strong>Walking:</strong> ~5 km/h (3.1 mph)</li>
                <li><strong>Cycling:</strong> ~15-25 km/h (9-15 mph)</li>
                <li><strong>Driving (Highway):</strong> ~100-120 km/h (62-75 mph)</li>
                <li><strong>Commercial Aircraft:</strong> ~800-900 km/h (500-560 mph)</li>
                <li><strong>Speed of Sound:</strong> ~1,235 km/h (767 mph)</li>
              </ul>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/speed-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl border border-primary/10 bg-primary/5">
                <h3 className="font-bold text-primary mb-2 italic">Unit Conversion</h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">Always ensure your units are consistent! If you have distance in miles and time in hours, your speed will be in mph. This calculator uses kilometers and hours by default.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default SpeedDistanceTimeCalculator;
