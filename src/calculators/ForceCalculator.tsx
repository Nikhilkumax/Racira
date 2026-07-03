"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import FAQSection from "@/components/FAQSection";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Zap } from "lucide-react";

type SolveFor = "force" | "mass" | "acceleration";

const ForceCalculator = () => {
  const [solveFor, setSolveFor] = useState<SolveFor>("force");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ force: number; mass: number; acceleration: number; weight: number } | null>(null);

  const getLabels = () => {
    switch (solveFor) {
      case "force": return { a: "Mass", aUnit: "kg", b: "Acceleration", bUnit: "m/s²" };
      case "mass": return { a: "Force", aUnit: "N", b: "Acceleration", bUnit: "m/s²" };
      case "acceleration": return { a: "Force", aUnit: "N", b: "Mass", bUnit: "kg" };
    }
  };

  const handleCalculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a) || isNaN(b) || b === 0) return;

    setShowResults(true);
    let f, m, acc;
    switch (solveFor) {
      case "force": f = a * b; m = a; acc = b; break;
      case "mass": f = a; m = a / b; acc = b; break;
      case "acceleration": f = a; acc = a / b; m = b; break;
    }
    setResults({ force: f, mass: m, acceleration: acc, weight: m * 9.80665 });
  };

  const reset = () => {
    setShowResults(false);
    setInputA("");
    setInputB("");
    setResults(null);
  };

  const labels = getLabels();

  const faqs = [
    { question: "What is Newton's Second Law?", answer: "Newton's Second Law states that Force equals mass times acceleration (F = m × a). It describes how the motion of an object changes when a net force acts on it." },
    { question: "What is a Newton?", answer: "A Newton (N) is the SI unit of force. 1 N is the force required to accelerate a 1 kg mass at 1 m/s²." },
    { question: "What is the difference between mass and weight?", answer: "Mass is the amount of matter in an object (kg). Weight is the gravitational force acting on that mass (W = m × g), measured in Newtons." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Force Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Force Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block text-[10px]">Solve For</label>
                  <select 
                    value={solveFor} 
                    onChange={(e) => { setSolveFor(e.target.value as SolveFor); setInputA(""); setInputB(""); setShowResults(false); }}
                    className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium"
                  >
                    <option value="force">Force (F = m × a)</option>
                    <option value="mass">Mass (m = F / a)</option>
                    <option value="acceleration">Acceleration (a = F / m)</option>
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

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">
                  <Zap className="h-5 w-5 text-primary" /> Physics Results
                </h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "force" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Force</p>
                    <p className={`text-xl font-black ${solveFor === "force" ? "text-primary" : "text-foreground"}`}>{results.force.toFixed(4)}</p>
                    <p className="text-[10px] text-muted-foreground">Newtons (N)</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "mass" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Mass</p>
                    <p className={`text-xl font-black ${solveFor === "mass" ? "text-primary" : "text-foreground"}`}>{results.mass.toFixed(4)}</p>
                    <p className="text-[10px] text-muted-foreground">Kilograms (kg)</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${solveFor === "acceleration" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/50"}`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Acceleration</p>
                    <p className={`text-xl font-black ${solveFor === "acceleration" ? "text-primary" : "text-foreground"}`}>{results.acceleration.toFixed(4)}</p>
                    <p className="text-[10px] text-muted-foreground">m/s²</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Equivalent Weight on Earth</p>
                  <p className="text-lg font-bold text-foreground">{results.weight.toFixed(4)} N</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space" />
          <article className="prose-finance text-[15.75px]">
              <h2>Newton's Second Law of Motion</h2>
              <p>Newton's Second Law is one of the most fundamental principles in classical mechanics. it describes the relationship between an object's mass and the amount of force needed to accelerate it.</p>
              
              <h3>The Formula</h3>
              <div className="bg-secondary/50 p-4 rounded-xl text-center font-mono my-4">
                Force (F) = Mass (m) × Acceleration (a)
              </div>
              
              <h3>Key Definitions</h3>
              <ul>
                <li><strong>Force (N):</strong> A push or pull acting upon an object resulting from its interaction with another object. Measured in Newtons.</li>
                <li><strong>Mass (kg):</strong> The amount of matter in an object. Unlike weight, mass does not change based on gravity.</li>
                <li><strong>Acceleration (m/s²):</strong> The rate at which an object changes its velocity.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/force-calculator" />
          <PopularCalculators exclude="/calculator/force-calculator" />
        </div>
      </div>
    </>
  );
};

export default ForceCalculator;
