"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Zap } from "lucide-react";

const HpToKwCalculator = () => {
  const [hp, setHp] = useState("300");
  const [hpType, setHpType] = useState("mechanical"); // Mechanical vs Metric vs Electrical

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const value = parseFloat(hp) || 0;
    if (value <= 0) return;

    let kw = 0;
    // Mechanical (US) HP = 0.7457 kW
    // Metric (PS) HP = 0.7355 kW
    // Electrical HP = 0.746 kW
    
    if (hpType === "mechanical") kw = value * 0.7457;
    else if (hpType === "metric") kw = value * 0.7355;
    else kw = value * 0.746;

    setResults({
      kw,
      watts: kw * 1000,
      ps: hpType === "mechanical" ? value * 1.01387 : value,
      mechanical: hpType === "metric" ? value * 0.98632 : value
    });
  };

  const reset = () => {
    setShowResults(false);
    setHp("300"); setHpType("mechanical");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between Mechanical and Metric Horsepower?", answer: "Mechanical horsepower (hp) is the standard in the US and UK (approx. 745.7 Watts). Metric horsepower (PS or CV) is used in Europe and is slightly less powerful (approx. 735.5 Watts)." },
    { question: "Why do we use Kilowatts for cars now?", answer: "Kilowatts (kW) is the standard SI unit for power. Many countries have transitioned to kW for automotive ratings because it is more precise and applies equally to internal combustion and electric motors." },
    { question: "How many Watts are in one horsepower?", answer: "One mechanical horsepower is defined as approximately 746 Watts (0.746 kW)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "HP to kW Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Horsepower to Kilowatts Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Convert between different standards of horsepower and kilowatts (kW) for engines and motors.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="hp" label="Horsepower (HP)" value={hp} onChange={setHp} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">HP Standard</label>
                  <select value={hpType} onChange={(e) => setHpType(e.target.value)} className="input-calc">
                    <option value="mechanical">Mechanical (US/Imperial)</option>
                    <option value="metric">Metric (PS/CV)</option>
                    <option value="electrical">Electrical (Motors)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" /> Convert Power
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Power Conversion</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Kilowatts</p>
                    <p className="text-5xl font-black text-foreground">{results.kw.toFixed(2)} <span className="text-xl">kW</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Watts</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.watts).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">W</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Metric Horsepower (PS)", value: 0, textValue: results.ps.toFixed(1) + " PS" },
                  { label: "Mechanical HP", value: 0, textValue: results.mechanical.toFixed(1) + " hp" },
                  { label: "Standard Used", value: 0, textValue: hpType.charAt(0).toUpperCase() + hpType.slice(1) },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>What is a Horsepower?</h2>
              <p>The term "horsepower" was coined by James Watt in the 18th century to compare the output of steam engines to the power of draft horses. Today, it remains the most popular unit for describing engine power in the automotive world.</p>
              <h3>Mechanical vs. Metric</h3>
              <p>Not all horsepower is created equal. <strong>Mechanical horsepower</strong> (used in the US) is defined as 550 foot-pounds per second. <strong>Metric horsepower</strong> (PS, CV, or pk) was developed in Germany and is slightly different, defined as the power required to raise a 75 kg mass against gravity at a speed of 1 meter per second.</p>
              <h3>The Shift to Watts</h3>
              <p>As the world moves toward electric vehicles, the Watt (and its multiple, the Kilowatt) is becoming the universal unit for power. Since electric motors are rated in Watts, using kW allows for a direct comparison between internal combustion engines and electric powertrains without the confusion of regional horsepower standards.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hp-to-kw" />
            <PopularCalculators exclude="/calculator/horsepower-to-kilowatts-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default HpToKwCalculator;

