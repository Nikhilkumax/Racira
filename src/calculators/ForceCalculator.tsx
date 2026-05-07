"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FAQSection from "@/components/FAQSection";

type SolveFor = "force" | "mass" | "acceleration";

const ForceCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("force");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const getLabels = () => {
    switch (solveFor) {
      case "force": return { a: "Mass", aUnit: "kg", b: "Acceleration", bUnit: "m/s²" };
      case "mass": return { a: "Force", aUnit: "N", b: "Acceleration", bUnit: "m/s²" };
      case "acceleration": return { a: "Force", aUnit: "N", b: "Mass", bUnit: "kg" };
    }
  };

  const calculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return null;

    switch (solveFor) {
      case "force": return { force: a * b, mass: a, acceleration: b };
      case "mass": return { force: a, mass: a / b, acceleration: b };
      case "acceleration": return { force: a, mass: b, acceleration: a / b };
    }
  };

  const labels = getLabels();
  const result = calculate();

  // Additional derived quantities
  const weight = result ? result.mass * 9.80665 : null;

  const faqs = [
    { question: "What is Newton's Second Law?", answer: "Newton's Second Law states that Force equals mass times acceleration (F = m × a). It describes how the motion of an object changes when a net force acts on it." },
    { question: "What is a Newton?", answer: "A Newton (N) is the SI unit of force. 1 N is the force required to accelerate a 1 kg mass at 1 m/s²." },
    { question: "What is the difference between mass and weight?", answer: "Mass is the amount of matter in an object (kg). Weight is the gravitational force acting on that mass (W = m × g), measured in Newtons." },
  ];

  return (
    <>
<Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Science & Engineering", href: "/calculator" },
        { label: "Force Calculator" }
      ]} />

      <div className="calculator-container">
        <h1 className="calculator-title">Force Calculator</h1>
        <p className="calculator-subtitle">Calculate force, mass, or acceleration using Newton's Second Law (F = m × a).</p>

        <Card className="calculator-card">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Solve For</label>
              <Select value={solveFor} onValueChange={(v) => { setSolveFor(v as SolveFor); setInputA(""); setInputB(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="force">Force (F = m × a)</SelectItem>
                  <SelectItem value="mass">Mass (m = F / a)</SelectItem>
                  <SelectItem value="acceleration">Acceleration (a = F / m)</SelectItem>
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
            <div className="space-y-3 mt-6">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="result-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Force</p>
                  <p className={`text-xl font-bold ${solveFor === "force" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.force.toFixed(4)} N</p>
                </div>
                <div className="result-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Mass</p>
                  <p className={`text-xl font-bold ${solveFor === "mass" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.mass.toFixed(4)} kg</p>
                </div>
                <div className="result-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Acceleration</p>
                  <p className={`text-xl font-bold ${solveFor === "acceleration" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.acceleration.toFixed(4)} m/s²</p>
                </div>
              </div>
              {weight !== null && (
                <div className="result-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Weight on Earth (m × 9.81)</p>
                  <p className="text-lg font-bold text-foreground">{weight.toFixed(4)} N</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <FAQSection faqs={faqs} pageUrl="https://raciracalculator.lovable.app/force-calculator" />
      </div>
    </>
  );
};

export default ForceCalculator;

