"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Atom } from "lucide-react";

type SolveFor = "density" | "mass" | "volume";

const DensityCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("density");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ density: number; mass: number; volume: number } | null>(null);

  const getLabels = () => {
    switch (solveFor) {
      case "density": return { a: "Mass", aUnit: "kg", b: "Volume", bUnit: "m³" };
      case "mass": return { a: "Density", aUnit: "kg/m³", b: "Volume", bUnit: "m³" };
      case "volume": return { a: "Mass", aUnit: "kg", b: "Density", bUnit: "kg/m³" };
    }
  };

  const handleCalculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return;

    setShowResults(true);
    switch (solveFor) {
      case "density": setResults({ density: a / b, mass: a, volume: b }); break;
      case "mass": setResults({ density: a, mass: a * b, volume: b }); break;
      case "volume": setResults({ density: b, mass: a, volume: a / b }); break;
    }
  };

  const reset = () => {
    setShowResults(false);
    setInputA("");
    setInputB("");
    setResults(null);
  };

  const labels = getLabels();

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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Density Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Density Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate density, mass, or volume using the standard formula ρ = m / V.</p>

            <div className="card-calculator mb-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block text-[10px]">Solve For</label>
                  <select 
                    value={solveFor} 
                    onChange={(e) => { setSolveFor(e.target.value as SolveFor); setInputA(""); setInputB(""); setShowResults(false); }}
                    className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium"
                  >
                    <option value="density">Density (ρ = m / V)</option>
                    <option value="mass">Mass (m = ρ × V)</option>
                    <option value="volume">Volume (V = m / ρ)</option>
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
                  <Atom className="h-5 w-5 text-primary" /> Calculation Results
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "density" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-xs">Density</p>
                    <p className={`text-xl font-black ${solveFor === "density" ? "text-primary" : "text-foreground"}`}>{results.density.toFixed(4)}</p>
                    <p className="text-[10px] text-muted-foreground">kg/m³</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "mass" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-xs">Mass</p>
                    <p className={`text-xl font-black ${solveFor === "mass" ? "text-primary" : "text-foreground"}`}>{results.mass.toFixed(4)}</p>
                    <p className="text-[10px] text-muted-foreground">kg</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "volume" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-xs">Volume</p>
                    <p className={`text-xl font-black ${solveFor === "volume" ? "text-primary" : "text-foreground"}`}>{results.volume.toFixed(4)}</p>
                    <p className="text-[10px] text-muted-foreground">m³</p>
                  </div>
                </div>
              </div>
            )}

            <div className="card-calculator mb-8">
              <h2 className="text-xl font-bold mb-6">Common Material Densities</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {commonMaterials.map(m => (
                  <div key={m.name} className="flex justify-between items-center rounded-xl bg-secondary/50 border border-border p-3">
                    <span className="text-sm font-bold text-foreground">{m.name}</span>
                    <span className="text-xs font-medium text-muted-foreground">{m.density}</span>
                  </div>
                ))}
              </div>
            </div>

            <article className="prose-finance">
              <h2>About Density Calculation</h2>
              <p>Density is a measure of how much mass is contained in a given unit of volume. It is a fundamental property of matter that describes how tightly atoms or molecules are packed together.</p>
              
              <h3>The Density Formula</h3>
              <p>The standard formula for density is:</p>
              <div className="bg-secondary/50 p-4 rounded-xl text-center font-mono my-4">
                Density (ρ) = Mass (m) / Volume (V)
              </div>
              
              <h3>Practical Applications</h3>
              <ul>
                <li><strong>Material Identification:</strong> Every pure substance has a unique density, helping scientists identify unknown materials.</li>
                <li><strong>Buoyancy:</strong> Objects with a lower density than water will float, while those with a higher density will sink.</li>
                <li><strong>Construction:</strong> Engineers calculate the density of concrete and steel to ensure buildings can support their own weight.</li>
              </ul>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/density-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl border border-primary/10 bg-primary/5">
                <h3 className="font-bold text-primary mb-2 italic">Pro Tip</h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">Density changes with temperature and pressure, especially for gases. These calculations assume standard conditions unless otherwise specified.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default DensityCalculator;
