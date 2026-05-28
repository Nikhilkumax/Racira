"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Wind, Zap, Info, ShieldCheck } from "lucide-react";

const WindTurbineEnergyCalculator = () => {
  const [rotorDiameter, setRotorDiameter] = useState("3"); // meters
  const [windSpeed, setWindSpeed] = useState("5"); // m/s
  const [efficiency, setEfficiency] = useState("35"); // % (Betz limit is 59.3%)
  const [airDensity, setAirDensity] = useState("1.225"); // kg/m^3 (sea level)

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(rotorDiameter) || 0;
    const v = parseFloat(windSpeed) || 0;
    const eff = (parseFloat(efficiency) || 0) / 100;
    const rho = parseFloat(airDensity) || 1.225;

    // Swept Area A = pi * r^2
    const radius = d / 2;
    const area = Math.PI * Math.pow(radius, 2);

    // Power in the wind P = 0.5 * rho * A * v^3
    const powerInWind = 0.5 * rho * area * Math.pow(v, 3);
    const availablePower = powerInWind * eff;

    // Daily and Annual Energy
    const dailyEnergy = (availablePower * 24) / 1000; // kWh/day
    const annualEnergy = dailyEnergy * 365;

    setResults({
      powerWatts: availablePower,
      dailyEnergy,
      annualEnergy,
      area,
      powerInWind,
      co2Saved: annualEnergy * 0.4 // 0.4 kg/kWh offset
    });
  };

  const reset = () => {
    setShowResults(false);
    setRotorDiameter("3"); setWindSpeed("5"); setEfficiency("35"); setAirDensity("1.225");
    setResults(null);
  };

  const faqs = [
    { question: "What is the Betz Limit?", answer: "The Betz Limit is the theoretical maximum efficiency for a wind turbine, which is 59.3%. No turbine can capture more than 59.3% of the kinetic energy in wind because the wind must continue to move through the turbine to keep the blades spinning." },
    { question: "Why is wind speed so important?", answer: "Power generated is proportional to the CUBE of the wind speed. This means if you double the wind speed, you get EIGHT times more power. This is why location is the most critical factor for wind energy." },
    { question: "How large are residential wind turbines?", answer: "Typical residential turbines have rotor diameters between 2 and 5 meters and are mounted on towers 20 to 40 meters high to reach more consistent, higher-speed winds." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Wind Turbine Energy Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wind Turbine Energy Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate the power output and energy generation of a wind turbine based on size and wind conditions.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="diameter" label="Rotor Diameter" value={rotorDiameter} onChange={setRotorDiameter} suffix="m" />
                <InputField id="speed" label="Average Wind Speed" value={windSpeed} onChange={setWindSpeed} suffix="m/s" tooltip="Average speed at hub height." />
                <InputField id="eff" label="Turbine Efficiency" value={efficiency} onChange={setEfficiency} suffix="%" />
                <InputField id="density" label="Air Density" value={airDensity} onChange={setAirDensity} suffix="kg/m³" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Wind className="h-5 w-5" /> Calculate Generation
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Generation Report</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Power Output</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.powerWatts).toLocaleString()} <span className="text-xl font-normal text-muted-foreground">Watts</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Annual Energy</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.annualEnergy).toLocaleString()} <span className="text-lg text-muted-foreground">kWh</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg text-primary"><Zap className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Daily Generation</p>
                      <p className="font-bold">{results.dailyEnergy.toFixed(1)} kWh</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg text-primary"><ShieldCheck className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">CO2 Offset</p>
                      <p className="font-bold">{results.co2Saved.toFixed(0)} kg/yr</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                  <p className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Theoretical maximum power in the wind for this area is {Math.round(results.powerInWind).toLocaleString()}W. Your efficiency of {efficiency}% captures {Math.round(results.powerWatts).toLocaleString()}W.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Harnessing the Wind</h2>
              <p>Wind energy is one of the fastest-growing sources of renewable electricity. Unlike solar, wind can produce power 24 hours a day, though it is often more intermittent and highly dependent on local terrain.</p>
              <h3>The Cube Law</h3>
              <p>The most important concept in wind energy is that the power available in the wind is proportional to the cube of the wind speed. This means small increases in wind speed lead to massive increases in energy. For example, a 6 m/s wind has nearly double the energy of a 5 m/s wind.</p>
              <h3>Rotor Diameter and Swept Area</h3>
              <p>The power captured is also directly proportional to the swept area of the blades. Doubling the length of the blades (the radius) quadruples the swept area and the potential power output. This is why commercial wind turbines are becoming increasingly massive.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wind-turbine-energy" />
          <PopularCalculators exclude="/calculator/wind-turbine-energy-calculator" />
        </div>
      </div>
    </>
  );
};

export default WindTurbineEnergyCalculator;

