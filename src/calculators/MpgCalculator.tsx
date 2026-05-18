"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Fuel } from "lucide-react";

const MpgCalculator = () => {
  const [distance, setDistance] = useState("350");
  const [fuel, setFuel] = useState("12");
  const [pricePerUnit, setPricePerUnit] = useState("3.50");
  const [unit, setUnit] = useState("imperial"); // US MPG

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(distance) || 0;
    const f = parseFloat(fuel) || 0;
    const p = parseFloat(pricePerUnit) || 0;

    if (d <= 0 || f <= 0) return;

    const mpg = d / f;
    const totalCost = f * p;
    const costPerMile = totalCost / d;
    
    // L/100km conversion: (100 * 3.785) / (mpg * 1.609)
    const l100km = unit === "imperial" ? (235.215 / mpg) : (282.481 / mpg);

    setResults({
      mpg,
      l100km,
      totalCost,
      costPerMile,
      unitLabel: unit === "imperial" ? "US MPG" : "UK MPG"
    });
  };

  const reset = () => {
    setShowResults(false);
    setDistance("350"); setFuel("12"); setPricePerUnit("3.50"); setUnit("imperial");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between US and UK MPG?", answer: "A US gallon is 3.785 liters, while a UK (Imperial) gallon is 4.546 liters. Therefore, UK MPG values are significantly higher than US MPG values for the same fuel consumption." },
    { question: "How can I improve my fuel economy?", answer: "Common ways to improve MPG include maintaining proper tire pressure, removing excess weight from the vehicle, avoiding rapid acceleration, and keeping your engine well-tuned." },
    { question: "Does idling waste a lot of fuel?", answer: "Yes, idling can burn between 0.2 to 0.5 gallons of fuel per hour. Modern 'Stop-Start' systems are designed to eliminate this waste by turning the engine off when the car is stationary." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "MPG Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">MPG (Fuel Economy) Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your vehicle's fuel efficiency and estimated travel costs per mile.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="dist" label="Distance Traveled" value={distance} onChange={setDistance} suffix="miles" />
                <InputField id="fuel" label="Fuel Used" value={fuel} onChange={setFuel} suffix="gallons" />
                <InputField id="price" label="Price per Gallon" value={pricePerUnit} onChange={setPricePerUnit} prefix="$" />
              </div>

              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => setUnit("imperial")} 
                  className={`flex-1 py-2 rounded-xl border font-bold transition-all ${unit === "imperial" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  US Gallons
                </button>
                <button 
                  onClick={() => setUnit("uk")} 
                  className={`flex-1 py-2 rounded-xl border font-bold transition-all ${unit === "uk" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  UK Gallons
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Fuel className="h-5 w-5" /> Calculate MPG
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Efficiency Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Fuel Economy</p>
                    <p className="text-5xl font-black text-foreground">{results.mpg.toFixed(1)} <span className="text-xl">MPG</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({results.unitLabel})</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Metric Efficiency</p>
                    <p className="text-3xl font-black text-foreground">{results.l100km.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">L/100km</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Trip Fuel Cost", value: 0, textValue: "$" + results.totalCost.toFixed(2) },
                  { label: "Cost Per Mile", value: 0, textValue: "$" + results.costPerMile.toFixed(2) },
                  { label: "Estimated Range (15g Tank)", value: 0, textValue: Math.round(results.mpg * 15) + " miles" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Understanding Fuel Economy</h2>
              <p>Fuel economy is a measure of how far a vehicle can travel with a specific amount of fuel. In the United States and the United Kingdom, this is expressed in Miles Per Gallon (MPG). In most other parts of the world, efficiency is measured as Liters per 100 Kilometers (L/100km).</p>
              <h3>Why MPG Matters</h3>
              <p>Besides the environmental impact of burning more fossil fuels, poor fuel economy directly affects your wallet. Over a 100,000-mile ownership period, the difference between a car that gets 20 MPG and one that gets 40 MPG can amount to over $10,000 in fuel savings (at $4/gallon).</p>
              <h3>Factors Affecting Real-World MPG</h3>
              <p>The MPG figures reported by manufacturers are often achieved in lab settings. Your actual fuel economy will be lower due to factors like stop-and-go traffic, idling, aggressive driving, using air conditioning, and driving at high speeds on the highway, where aerodynamic drag increases significantly.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mpg" />
            <PopularCalculators exclude="/calculator/miles-per-gallon-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default MpgCalculator;

