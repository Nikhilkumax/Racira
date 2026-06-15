"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Flame } from "lucide-react";

interface BoilingResults {
  boilingPoint: number;
  timeSeconds: number;
  timeMinutes: number;
  energyRequired: number; // kJ
}

const WaterBoilingTimeCalculator = () => {
  const [waterAmount, setWaterAmount] = useState("1"); // 1 Liter
  const [initialTemp, setInitialTemp] = useState("20"); // 20°C
  const [power, setPower] = useState("1500"); // 1500W electric kettle
  const [efficiency, setEfficiency] = useState("85"); // 85% efficiency
  const [altitude, setAltitude] = useState("0"); // 0m (Sea Level)

  const [results, setResults] = useState<BoilingResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const mass = parseFloat(waterAmount) || 0; // 1L = 1kg
    const tInit = parseFloat(initialTemp) || 0;
    const pWatts = parseFloat(power) || 0;
    const eff = (parseFloat(efficiency) || 85) / 100;
    const alt = parseFloat(altitude) || 0;

    if (mass <= 0 || pWatts <= 0) return;

    // Boiling point at altitude
    // BP = 100 - (altitude / 300) approximately
    const boilingPoint = 100 - (alt / 300);

    // Energy required: Q = m * c * deltaT
    // c (specific heat of water) = 4.186 kJ/kg°C
    const deltaT = Math.max(0, boilingPoint - tInit);
    const energyKJ = mass * 4.186 * deltaT;
    const energyJoules = energyKJ * 1000;

    // Time = Energy / (Power * Efficiency)
    const effectivePower = pWatts * eff;
    const timeSeconds = effectivePower > 0 ? energyJoules / effectivePower : 0;

    setResults({
      boilingPoint,
      timeSeconds,
      timeMinutes: timeSeconds / 60,
      energyRequired: energyKJ
    });
  };

  const reset = () => {
    setShowResults(false);
    setWaterAmount("1"); setInitialTemp("20"); setPower("1500");
    setEfficiency("85"); setAltitude("0");
    setResults(null);
  };

  const faqs = [
    { question: "Why does altitude affect boiling point?", answer: "At higher altitudes, air pressure is lower. Since boiling occurs when water's vapor pressure equals atmospheric pressure, less heat is needed for water to reach that point. For every 500 feet of altitude, the boiling point drops by about 1°F." },
    { question: "How efficient are different heat sources?", answer: "Electric kettles are highly efficient (~85-90%) because the heating element is submerged. Induction stoves are about 85%, while gas stoves are the least efficient (~40%) because most heat escapes around the sides of the pot." },
    { question: "Does adding salt make water boil faster?", answer: "Technically, yes, but the amount of salt used in cooking is so small that the difference is negligible (less than a second). Salt actually raises the boiling point slightly, meaning the water must get hotter to boil." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Water Boiling Time Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Water Boiling Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                <InputField id="amount" label="Water Amount (Liters)" value={waterAmount} onChange={setWaterAmount} suffix="L" />
                <InputField id="temp" label="Initial Temp (°C)" value={initialTemp} onChange={setInitialTemp} suffix="°C" />
                <InputField id="power" label="Heating Power (Watts)" value={power} onChange={setPower} suffix="W" tooltip="Electric kettle: 1500W, Stove: ~2000W." />
                <InputField id="efficiency" label="Efficiency (%)" value={efficiency} onChange={setEfficiency} suffix="%" tooltip="Electric kettle: 85-90%, Gas stove: 40%." />
                <InputField id="altitude" label="Altitude (Meters)" value={altitude} onChange={setAltitude} suffix="m" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Flame className="h-5 w-5" /> Calculate Time
                </button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Boiling Estimates</h2>
                
                <div className="grid sm:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Time</p>
                    <p className="text-4xl font-black text-foreground">{results.timeMinutes.toFixed(1)} <span className="text-lg">min</span></p>
                    <p className="text-sm text-muted-foreground mt-1">({results.timeSeconds.toFixed(0)} seconds)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Boiling Point</p>
                    <p className="text-4xl font-black text-foreground">{results.boilingPoint.toFixed(1)}°C</p>
                    <p className="text-sm text-muted-foreground mt-1">({((results.boilingPoint * 9/5) + 32).toFixed(1)}°F)</p>
                  </div>
                </div>

                <ResultDisplay items={[
                  { label: "Energy Required", value: 0, textValue: results.energyRequired.toFixed(1) + " kJ" },
                  { label: "Effective Power", value: 0, textValue: (parseFloat(power) * (parseFloat(efficiency)/100)).toFixed(0) + " W" },
                  { label: "Altitude Impact", value: 0, textValue: (100 - results.boilingPoint).toFixed(1) + "°C lower" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>The Physics of Boiling</h2>
              <p>Boiling water seems simple, but it's a fascinating thermodynamic process. To boil water, you must first raise its temperature to the boiling point (sensible heat) and then provide enough energy to convert it from liquid to gas (latent heat of vaporization). This calculator focuses on the first stage: reaching the boiling point.</p>
              
              <h2>Efficiency of Heat Sources</h2>
              <p>Where your heat comes from matters as much as how much you have. A 2000W gas burner might take longer to boil a pot than a 1500W electric kettle because a kettle's heating element is directly in the water, whereas a gas burner loses more than half its heat to the surrounding air.</p>

              <h2>Cooking at High Altitudes</h2>
              <p>If you're in the mountains, you'll notice your water boils faster, but your food takes longer to cook. This is because the boiling water is at a lower temperature. Pasta or beans that require 100°C for optimal cooking will need significantly more time at 92°C (the boiling point at ~2,500m).</p>

              <h2>Tips for Faster Boiling</h2>
              <ul>
                <li><strong>Use a Lid:</strong> This traps heat and prevents evaporative cooling, saving up to 20% in energy and time.</li>
                <li><strong>Start with Warm Water:</strong> Using warm tap water (if safe and filtered) reduces the temperature delta.</li>
                <li><strong>Only Boil What You Need:</strong> Boiling two liters when you only need one cup wastes energy and doubles the wait time.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-boiling" />
          <PopularCalculators exclude="/calculator/water-boiling-time-calculator" />
        </div>
      </div>
    </>
  );
};

export default WaterBoilingTimeCalculator;

