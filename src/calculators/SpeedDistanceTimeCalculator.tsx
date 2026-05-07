"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FAQSection from "@/components/FAQSection";

type SolveFor = "speed" | "distance" | "time";

const SpeedDistanceTimeCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("speed");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const getLabels = () => {
    switch (solveFor) {
      case "speed": return { a: "Distance", aUnit: "km", b: "Time", bUnit: "hours" };
      case "distance": return { a: "Speed", aUnit: "km/h", b: "Time", bUnit: "hours" };
      case "time": return { a: "Distance", aUnit: "km", b: "Speed", bUnit: "km/h" };
    }
  };

  const calculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return null;

    switch (solveFor) {
      case "speed": return { speed: a / b, distance: a, time: b };
      case "distance": return { speed: a, distance: a * b, time: b };
      case "time": return { speed: b, distance: a, time: a / b };
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.round(((hours - h) * 60 - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  const labels = getLabels();
  const result = calculate();

  const faqs = [
    { question: "What is the speed formula?", answer: "Speed = Distance / Time. This is the fundamental relationship connecting how fast something moves with how far it goes and how long it takes." },
    { question: "How do I convert between km/h and m/s?", answer: "Multiply km/h by 5/18 to get m/s, or multiply m/s by 18/5 to get km/h." },
    { question: "What is average speed vs instantaneous speed?", answer: "Average speed is total distance divided by total time. Instantaneous speed is the speed at a specific moment in time." },
  ];

  return (
    <>
<Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Science & Engineering", href: "/calculator" },
        { label: "Speed Calculator" }
      ]} />

      <div className="calculator-container">
        <h1 className="calculator-title">Speed Calculator</h1>
        <p className="calculator-subtitle">Calculate speed, distance, or time using Speed = Distance / Time.</p>

        <Card className="calculator-card">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Solve For</label>
              <Select value={solveFor} onValueChange={(v) => { setSolveFor(v as SolveFor); setInputA(""); setInputB(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="speed">Speed (S = D / T)</SelectItem>
                  <SelectItem value="distance">Distance (D = S × T)</SelectItem>
                  <SelectItem value="time">Time (T = D / S)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="inputA" className="text-sm font-medium text-foreground mb-1.5 block">{labels.a}</label>
              <div className="relative">
                <input id="inputA" type="number" value={inputA} onChange={e => setInputA(e.target.value)} className="input-calc pr-16" placeholder="0" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{labels.aUnit}</span>
              </div>
            </div>

            <div>
              <label htmlFor="inputB" className="text-sm font-medium text-foreground mb-1.5 block">{labels.b}</label>
              <div className="relative">
                <input id="inputB" type="number" value={inputB} onChange={e => setInputB(e.target.value)} className="input-calc pr-16" placeholder="0" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{labels.bUnit}</span>
              </div>
            </div>
          </div>

          {result && (
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Speed</p>
                <p className={`text-xl font-bold ${solveFor === "speed" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.speed.toFixed(2)} km/h</p>
                <p className="text-xs text-muted-foreground mt-0.5">{(result.speed / 3.6).toFixed(2)} m/s</p>
              </div>
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Distance</p>
                <p className={`text-xl font-bold ${solveFor === "distance" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.distance.toFixed(2)} km</p>
                <p className="text-xs text-muted-foreground mt-0.5">{(result.distance * 1000).toFixed(0)} m</p>
              </div>
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Time</p>
                <p className={`text-xl font-bold ${solveFor === "time" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.time.toFixed(4)} hours</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatTime(result.time)}</p>
              </div>
            </div>
          )}
        </Card>

        <FAQSection faqs={faqs} pageUrl="https://raciracalculator.lovable.app/speed-calculator" />
      </div>
    </>
  );
};

export default SpeedDistanceTimeCalculator;

