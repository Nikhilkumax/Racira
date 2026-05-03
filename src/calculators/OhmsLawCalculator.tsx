"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FAQSection from "@/components/FAQSection";

type SolveFor = "voltage" | "current" | "resistance" | "power";

const OhmsLawCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("voltage");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const getLabels = (): { a: string; b: string; aUnit: string; bUnit: string } => {
    switch (solveFor) {
      case "voltage": return { a: "Current (I)", b: "Resistance (R)", aUnit: "A", bUnit: "Ω" };
      case "current": return { a: "Voltage (V)", b: "Resistance (R)", aUnit: "V", bUnit: "Ω" };
      case "resistance": return { a: "Voltage (V)", b: "Current (I)", aUnit: "V", bUnit: "A" };
      case "power": return { a: "Voltage (V)", b: "Current (I)", aUnit: "V", bUnit: "A" };
    }
  };

  const calculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return null;

    switch (solveFor) {
      case "voltage": {
        const V = a * b;
        const P = V * a;
        return { voltage: V, current: a, resistance: b, power: P };
      }
      case "current": {
        const I = a / b;
        const P = a * I;
        return { voltage: a, current: I, resistance: b, power: P };
      }
      case "resistance": {
        const R = a / b;
        const P = a * b;
        return { voltage: a, current: b, resistance: R, power: P };
      }
      case "power": {
        const P = a * b;
        const R = a / b;
        return { voltage: a, current: b, resistance: R, power: P };
      }
    }
  };

  const labels = getLabels();
  const result = calculate();

  const faqs = [
    { question: "What is Ohm's Law?", answer: "Ohm's Law states that voltage (V) equals current (I) multiplied by resistance (R): V = I × R. It is the fundamental law governing electrical circuits." },
    { question: "What units does Ohm's Law use?", answer: "Voltage is measured in volts (V), current in amperes (A), resistance in ohms (Ω), and power in watts (W)." },
    { question: "How is power calculated?", answer: "Electrical power P = V × I. It can also be expressed as P = I²R or P = V²/R using Ohm's Law substitutions." },
  ];

  return (
    <>
<Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Science & Engineering", href: "/calculator" },
        { label: "Ohm's Law Calculator" }
      ]} />

      <div className="calculator-container">
        <h1 className="calculator-title">Ohm's Law Calculator</h1>
        <p className="calculator-subtitle">Calculate voltage, current, resistance, and power for electrical circuits.</p>

        <Card className="calculator-card">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Solve For</label>
              <Select value={solveFor} onValueChange={(v) => { setSolveFor(v as SolveFor); setInputA(""); setInputB(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="voltage">Voltage (V = I × R)</SelectItem>
                  <SelectItem value="current">Current (I = V / R)</SelectItem>
                  <SelectItem value="resistance">Resistance (R = V / I)</SelectItem>
                  <SelectItem value="power">Power (P = V × I)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="inputA" className="text-sm font-medium text-foreground mb-1.5 block">{labels.a}</label>
              <div className="relative">
                <input id="inputA" type="number" value={inputA} onChange={e => setInputA(e.target.value)} className="input-calc pr-14" placeholder="0" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{labels.aUnit}</span>
              </div>
            </div>

            <div>
              <label htmlFor="inputB" className="text-sm font-medium text-foreground mb-1.5 block">{labels.b}</label>
              <div className="relative">
                <input id="inputB" type="number" value={inputB} onChange={e => setInputB(e.target.value)} className="input-calc pr-14" placeholder="0" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{labels.bUnit}</span>
              </div>
            </div>
          </div>

          {result && (
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Voltage</p>
                <p className={`text-xl font-bold ${solveFor === "voltage" ? "text-accent" : "text-foreground"}`}>{result.voltage.toFixed(4)} V</p>
              </div>
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Current</p>
                <p className={`text-xl font-bold ${solveFor === "current" ? "text-accent" : "text-foreground"}`}>{result.current.toFixed(4)} A</p>
              </div>
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Resistance</p>
                <p className={`text-xl font-bold ${solveFor === "resistance" ? "text-accent" : "text-foreground"}`}>{result.resistance.toFixed(4)} Ω</p>
              </div>
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Power</p>
                <p className={`text-xl font-bold ${solveFor === "power" ? "text-accent" : "text-foreground"}`}>{result.power.toFixed(4)} W</p>
              </div>
            </div>
          )}
        </Card>

        <FAQSection faqs={faqs} pageUrl="https://raciracalculator.lovable.app/ohms-law-calculator" />
      </div>
    </>
  );
};

export default OhmsLawCalculator;

