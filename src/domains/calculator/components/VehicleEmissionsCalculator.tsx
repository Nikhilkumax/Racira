"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Car, Gauge, Fuel } from "lucide-react";

const VehicleEmissionsCalculator = () => {
  const [milesDriven, setMilesDriven] = useState("12000"); // annual miles
  const [fuelEfficiency, setFuelEfficiency] = useState("25"); // MPG
  const [fuelType, setFuelType] = useState("gasoline");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const miles = parseFloat(milesDriven) || 0;
    const mpg = parseFloat(fuelEfficiency) || 1;
    
    // Emission factors (kg CO2 per gallon)
    const factors: any = {
      gasoline: 8.887,
      diesel: 10.180,
      lpg: 5.790,
      electric: 0 // Electric depends on grid, but direct tailpipe is 0
    };

    const gallonsConsumed = fuelType === 'electric' ? 0 : miles / mpg;
    const co2kg = gallonsConsumed * factors[fuelType];
    
    // For electric, let's estimate based on average US grid (0.4 kg/kWh)
    // Avg EV efficiency is ~3 miles per kWh
    let electricCO2 = 0;
    if (fuelType === 'electric') {
      const kwhConsumed = miles / 3;
      electricCO2 = kwhConsumed * 0.4;
    }

    const finalCO2 = fuelType === 'electric' ? electricCO2 : co2kg;

    setResults({
      totalCO2: finalCO2,
      totalTons: finalCO2 / 1000,
      treesNeeded: Math.ceil(finalCO2 / 20),
      monthlyAverage: finalCO2 / 12
    });
  };

  const reset = () => {
    setShowResults(false);
    setMilesDriven("12000"); setFuelEfficiency("25"); setFuelType("gasoline");
    setResults(null);
  };

  const faqs = [
    { question: "How much CO2 does a gallon of gas produce?", answer: "Burning one gallon of gasoline produces about 8.9 kg (19.6 lbs) of CO2. Diesel is slightly higher at about 10.2 kg (22.4 lbs) per gallon." },
    { question: "Are electric cars really zero emissions?", answer: "While electric cars have zero 'tailpipe' emissions, the electricity used to charge them often comes from power plants that burn fossil fuels. However, even on a coal-heavy grid, EVs are generally more efficient and produce less total CO2 per mile than internal combustion vehicles." },
    { question: "What is the average annual vehicle emission?", answer: "A typical passenger vehicle emits about 4.6 metric tons of carbon dioxide per year, assuming 22 MPG and 11,500 miles driven." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Vehicle Emissions Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vehicle Emissions Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="miles" label="Annual Miles Driven" value={milesDriven} onChange={setMilesDriven} suffix="miles" />
                <InputField id="efficiency" label="Fuel Efficiency (MPG)" value={fuelEfficiency} onChange={setFuelEfficiency} suffix="MPG" disabled={fuelType === 'electric'} />
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Fuel Type</label>
                  <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="input-calc">
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="lpg">LPG</option>
                    <option value="electric">Electric (EV)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Environmental Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual CO2 Output</p>
                    <p className="text-5xl font-black text-foreground">{results.totalTons.toFixed(2)} <span className="text-xl font-normal text-muted-foreground">Tons</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({results.totalCO2.toFixed(0)} kg CO2e)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Average</p>
                    <p className="text-3xl font-black text-foreground">{results.monthlyAverage.toFixed(0)} kg</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg"><Fuel className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Trees to Offset</p>
                      <p className="font-bold">{results.treesNeeded} Trees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg"><Gauge className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Daily Emission</p>
                      <p className="font-bold">{(results.totalCO2 / 365).toFixed(1)} kg</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Transportation and CO2</h2>
              <p>The transportation sector is one of the largest contributors to greenhouse gas emissions worldwide. For many households, the personal vehicle is the single largest source of their carbon footprint.</p>
              <h3>MPG Matters</h3>
              <p>The relationship between MPG and CO2 is non-linear. Improving from 15 MPG to 20 MPG saves much more fuel and CO2 than improving from 35 MPG to 40 MPG over the same distance. This is why replacing the most inefficient vehicles on the road provides the largest immediate environmental benefit.</p>
              <h3>Why Electric is Better</h3>
              <p>Even when powered by a grid that includes natural gas or coal, electric motors are far more efficient (85-90%) than internal combustion engines (20-30%). This efficiency gap means that an EV will almost always produce fewer emissions per mile than a comparable gasoline car.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vehicle-emissions" />
          <PopularCalculators exclude="/calculator/vehicle-emissions-calculator" />
        </div>
      </div>
    </>
  );
};

export default VehicleEmissionsCalculator;

