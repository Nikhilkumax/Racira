"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Droplets, Info, Calculator, Home } from "lucide-react";

const RainBarrelCalculator = () => {
  const [roofArea, setRoofArea] = useState("1000"); // sq ft
  const [rainfall, setRainfall] = useState("1"); // inches
  const [runoffCoeff, setRunoffCoeff] = useState("0.9"); // Efficiency (0.9 for asphalt shingles)

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const area = parseFloat(roofArea) || 0;
    const rain = parseFloat(rainfall) || 0;
    const coeff = parseFloat(runoffCoeff) || 0.9;

    // Formula: Area (sq ft) * Rain (inches) * 0.623 (conversion factor) * Coefficient
    const totalGallons = area * rain * 0.623 * coeff;

    setResults({
      totalGallons,
      liters: totalGallons * 3.785,
      barrelsNeeded: Math.ceil(totalGallons / 55), // Standard 55-gallon barrel
      gardenAreaSupported: totalGallons / 0.623 // Sq ft of garden that can get 1 inch of water
    });
  };

  const reset = () => {
    setShowResults(false);
    setRoofArea("1000"); setRainfall("1"); setRunoffCoeff("0.9");
    setResults(null);
  };

  const faqs = [
    { question: "How much water can a roof collect?", answer: "A general rule of thumb is that 1 inch of rain on a 1,000 square foot roof yields about 600 gallons of water. Even a small shed can fill a standard rain barrel in a single storm." },
    { question: "What is the 'Runoff Coefficient'?", answer: "It represents the efficiency of your roof material. Asphalt shingles have a coefficient of about 0.9 (90% collection), while a flat gravel roof might only have 0.6 due to absorption and evaporation." },
    { question: "Is rain barrel water safe for vegetables?", answer: "Generally yes, but it depends on your roof material. Water from asphalt shingles may contain trace chemicals. Many experts recommend watering the base of the plants rather than the leaves, or using the water primarily for ornamental plants." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rain Barrel Sizing Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rain Barrel Sizing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="area" label="Roof Area" value={roofArea} onChange={setRoofArea} suffix="sq ft" />
                <InputField id="rain" label="Rainfall Amount" value={rainfall} onChange={setRainfall} suffix="inches" />
                <InputField id="coeff" label="Runoff Efficiency" value={runoffCoeff} onChange={setRunoffCoeff} tooltip="Asphalt: 0.9, Metal: 0.95, Tile: 0.85" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Collection Potential</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Water Captured</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.totalGallons).toLocaleString()} <span className="text-xl font-normal text-muted-foreground">Gallons</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({Math.round(results.liters).toLocaleString()} Liters)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Storage Required</p>
                    <p className="text-3xl font-black text-foreground">{results.barrelsNeeded} <span className="text-lg">Barrels</span></p>
                    <p className="text-xs text-muted-foreground mt-1">(Standard 55-Gallon Size)</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Home className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-2">Usage Potential</h3>
                      <p className="text-sm text-muted-foreground mb-4">This single rain event provides enough water to give a <strong>{Math.round(results.gardenAreaSupported).toLocaleString()} sq ft</strong> garden a full inch of irrigation.</p>
                      <ResultDisplay items={[
                        { label: "Collection Efficiency", value: 0, textValue: (parseFloat(runoffCoeff) * 100) + "%" },
                        { label: "Total Weight", value: 0, textValue: (results.totalGallons * 8.34).toFixed(0) + " lbs" },
                      ]} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Rainwater Harvesting</h2>
              <p>Rainwater harvesting is an ancient practice that is seeing a modern resurgence. By catching water before it hits the ground, you reduce local runoff (which carries pollutants to streams) and decrease your reliance on treated municipal water for landscaping.</p>
              <h3>How to Measure Your Roof Area</h3>
              <p>For this calculation, you only need the 'footprint' area of the roof that drains into your collection system. You don't need to account for the pitch (slope) of the roof; a 1,000 sq ft flat roof and a 1,000 sq ft steep roof catch the same amount of vertical rainfall.</p>
              <h3>Maintenance Tips</h3>
              <ul>
                <li><strong>Gutter Guards:</strong> Keep leaves and debris out of your barrels to prevent clogging and anaerobic smells.</li>
                <li><strong>First Flush Diverter:</strong> This device directs the first few gallons of a storm (which contain the most roof debris) away from the barrel.</li>
                <li><strong>Dark Barrels:</strong> Use opaque (usually dark green or black) barrels to prevent sunlight from entering, which stops algae from growing.</li>
                <li><strong>Screen Tops:</strong> Always ensure your barrel is tightly screened to prevent mosquitoes from breeding.</li>
              </ul>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rain-barrel" />
          <PopularCalculators exclude="/calculator/rain-barrel-calculator" />
        </div>
      </div>
    </>
  );
};

export default RainBarrelCalculator;

