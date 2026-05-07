"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FAQSection from "@/components/FAQSection";

type SolveFor = "density" | "mass" | "volume";

const DensityCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("density");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const getLabels = () => {
    switch (solveFor) {
      case "density": return { a: "Mass", aUnit: "kg", b: "Volume", bUnit: "m³" };
      case "mass": return { a: "Density", aUnit: "kg/m³", b: "Volume", bUnit: "m³" };
      case "volume": return { a: "Mass", aUnit: "kg", b: "Density", bUnit: "kg/m³" };
    }
  };

  const calculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return null;

    switch (solveFor) {
      case "density": return { density: a / b, mass: a, volume: b };
      case "mass": return { density: a, mass: a * b, volume: b };
      case "volume": return { density: b, mass: a, volume: a / b };
    }
  };

  const labels = getLabels();
  const result = calculate();

  const commonMaterials = [
    { name: "Water", density: "1,000 kg/m³" },
    { name: "Steel", density: "7,850 kg/m³" },
    { name: "Aluminum", density: "2,700 kg/m³" },
    { name: "Gold", density: "19,320 kg/m³" },
    { name: "Air (STP)", density: "1.225 kg/m³" },
    { name: "Wood (Oak)", density: "600–900 kg/m³" },
  ];

  const faqs = [
    { question: "What is density?", answer: "Density is mass per unit volume (ρ = m/V). It tells you how tightly matter is packed in a substance." },
    { question: "What are the common units for density?", answer: "kg/m³ (SI), g/cm³, and lb/ft³ are the most commonly used density units." },
    { question: "Does temperature affect density?", answer: "Yes. Most materials expand when heated, so their density decreases with temperature. Water is an exception near 4°C." },
  ];

  return (
    <>
<Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Science & Engineering", href: "/calculator" },
        { label: "Density Calculator" }
      ]} />

      <div className="calculator-container">
        <h1 className="calculator-title">Density Calculator</h1>
        <p className="calculator-subtitle">Calculate density, mass, or volume using ρ = m / V.</p>

        <Card className="calculator-card">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Solve For</label>
              <Select value={solveFor} onValueChange={(v) => { setSolveFor(v as SolveFor); setInputA(""); setInputB(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="density">Density (ρ = m / V)</SelectItem>
                  <SelectItem value="mass">Mass (m = ρ × V)</SelectItem>
                  <SelectItem value="volume">Volume (V = m / ρ)</SelectItem>
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
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Density</p>
                <p className={`text-xl font-bold ${solveFor === "density" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.density.toFixed(4)} kg/m³</p>
              </div>
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Mass</p>
                <p className={`text-xl font-bold ${solveFor === "mass" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.mass.toFixed(4)} kg</p>
              </div>
              <div className="result-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Volume</p>
                <p className={`text-xl font-bold ${solveFor === "volume" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{result.volume.toFixed(4)} m³</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="calculator-card mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Common Material Densities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonMaterials.map(m => (
              <div key={m.name} className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span className="text-foreground font-medium">{m.name}</span>
                <span className="text-muted-foreground">{m.density}</span>
              </div>
            ))}
          </div>
        </Card>

        <FAQSection faqs={faqs} pageUrl="https://raciracalculator.lovable.app/density-calculator" />
      </div>
    </>
  );
};

export default DensityCalculator;

