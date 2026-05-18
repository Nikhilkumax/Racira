"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Zap } from "lucide-react";

type SolveFor = "voltage" | "current" | "resistance" | "power";

const OhmsLawCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("voltage");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ voltage: number; current: number; resistance: number; power: number } | null>(null);

  const getLabels = (): { a: string; b: string; aUnit: string; bUnit: string } => {
    switch (solveFor) {
      case "voltage": return { a: "Current (I)", b: "Resistance (R)", aUnit: "A", bUnit: "Ω" };
      case "current": return { a: "Voltage (V)", b: "Resistance (R)", aUnit: "V", bUnit: "Ω" };
      case "resistance": return { a: "Voltage (V)", b: "Current (I)", aUnit: "V", bUnit: "A" };
      case "power": return { a: "Voltage (V)", b: "Current (I)", aUnit: "V", bUnit: "A" };
    }
  };

  const handleCalculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return;

    setShowResults(true);
    let v, i, r, p;
    switch (solveFor) {
      case "voltage": {
        v = a * b; i = a; r = b; p = v * i; break;
      }
      case "current": {
        v = a; i = a / b; r = b; p = v * i; break;
      }
      case "resistance": {
        v = a; i = b; r = a / b; p = v * i; break;
      }
      case "power": {
        p = a * b; v = a; i = b; r = a / b; break;
      }
    }
    setResults({ voltage: v, current: i, resistance: r, power: p });
  };

  const reset = () => {
    setShowResults(false);
    setInputA("");
    setInputB("");
    setResults(null);
  };

  const labels = getLabels();

  const faqs = [
    { question: "What is Ohm's Law?", answer: "Ohm's Law states that voltage (V) equals current (I) multiplied by resistance (R): V = I × R. It is the fundamental law governing electrical circuits." },
    { question: "What units does Ohm's Law use?", answer: "Voltage is measured in volts (V), current in amperes (A), resistance in ohms (Ω), and power in watts (W)." },
    { question: "How is power calculated?", answer: "Electrical power P = V × I. It can also be expressed as P = I²R or P = V²/R using Ohm's Law substitutions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ohm's Law Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Ohm's Law Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate voltage, current, resistance, and power for any electrical circuit.</p>

            <div className="card-calculator mb-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block text-[10px]">Solve For</label>
                  <select 
                    value={solveFor} 
                    onChange={(e) => { setSolveFor(e.target.value as SolveFor); setInputA(""); setInputB(""); setShowResults(false); }}
                    className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium"
                  >
                    <option value="voltage">Voltage (V = I × R)</option>
                    <option value="current">Current (I = V / R)</option>
                    <option value="resistance">Resistance (R = V / I)</option>
                    <option value="power">Power (P = V × I)</option>
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
                  <Zap className="h-5 w-5 text-primary" /> Electrical Results
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl border text-center ${solveFor === "voltage" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Voltage</p>
                    <p className={`text-lg font-black ${solveFor === "voltage" ? "text-primary" : "text-foreground"}`}>{results.voltage.toFixed(4)}V</p>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${solveFor === "current" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current</p>
                    <p className={`text-lg font-black ${solveFor === "current" ? "text-primary" : "text-foreground"}`}>{results.current.toFixed(4)}A</p>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${solveFor === "resistance" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Resistance</p>
                    <p className={`text-lg font-black ${solveFor === "resistance" ? "text-primary" : "text-foreground"}`}>{results.resistance.toFixed(4)}Ω</p>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${solveFor === "power" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Power</p>
                    <p className={`text-lg font-black ${solveFor === "power" ? "text-primary" : "text-foreground"}`}>{results.power.toFixed(4)}W</p>
                  </div>
                </div>
              </div>
            )}

            <article className="prose-finance">
              <h2>Understanding Ohm's Law</h2>
              <p>Ohm's Law is the most fundamental law in electronics. It defines the relationship between the three primary electrical quantities: voltage, current, and resistance.</p>
              
              <h3>The Core Relationship</h3>
              <div className="bg-secondary/50 p-4 rounded-xl text-center font-mono my-4">
                Voltage (V) = Current (I) × Resistance (R)
              </div>
              
              <h3>Key Definitions</h3>
              <ul>
                <li><strong>Voltage (V):</strong> The electrical pressure or potential difference between two points, measured in Volts.</li>
                <li><strong>Current (I):</strong> The flow of electrical charge through a conductor, measured in Amperes.</li>
                <li><strong>Resistance (R):</strong> The opposition to the flow of current, measured in Ohms.</li>
                <li><strong>Power (P):</strong> The rate at which electrical energy is transferred or consumed, measured in Watts.</li>
              </ul>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ohms-law-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl border border-primary/10 bg-primary/5">
                <h3 className="font-bold text-primary mb-2 italic">Pro Tip</h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">When using this calculator, ensure all units are consistent. If you have milliamps (mA), convert them to Amps (A) by dividing by 1,000 first.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default OhmsLawCalculator;
