"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, BatteryCharging } from "lucide-react";

const UpsBatteryRuntimeCalculator = () => {
  const [batteryCapacity, setBatteryCapacity] = useState("100"); // 100 Ah
  const [batteryVoltage, setBatteryVoltage] = useState("12"); // 12V
  const [load, setLoad] = useState("300"); // 300 Watts
  const [efficiency, setEfficiency] = useState("85"); // 85%

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const ah = parseFloat(batteryCapacity) || 0;
    const v = parseFloat(batteryVoltage) || 0;
    const w = parseFloat(load) || 0;
    const eff = (parseFloat(efficiency) || 85) / 100;

    if (ah <= 0 || v <= 0 || w <= 0) return;

    // Total Energy in Watt-hours = Ah * V
    const totalWh = ah * v;
    
    // Effective Energy (Efficiency loss)
    const effectiveWh = totalWh * eff;

    // Runtime = Effective Energy / Load
    const runtimeHours = effectiveWh / w;
    const runtimeMinutes = runtimeHours * 60;

    setResults({
      runtimeHours,
      runtimeMinutes,
      totalWh,
      loadPct: (w / (ah * v)) * 100, // This is just a rough metric
    });
  };

  const reset = () => {
    setShowResults(false);
    setBatteryCapacity("100"); setBatteryVoltage("12");
    setLoad("300"); setEfficiency("85");
    setResults(null);
  };

  const faqs = [
    { question: "Does a 1500VA UPS give me 1500 Watts?", answer: "No. VA (Volt-Amps) is the apparent power, while Watts is the real power. For most modern computer equipment, the power factor is ~0.9, so a 1500VA UPS usually supports around 1350 Watts." },
    { question: "Why is the runtime so short under full load?", answer: "Lead-acid batteries (common in UPS) suffer from the Peukert Effect, where discharging at a very high rate significantly reduces the total usable capacity compared to a slow discharge." },
    { question: "Can I use car batteries for my UPS?", answer: "It is not recommended. Car batteries are 'starter' batteries designed for short bursts of high current. UPS systems require 'deep cycle' batteries designed for long, consistent discharges." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "UPS Runtime Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">UPS Battery Runtime Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="batteryCapacity" label="Battery Capacity (Ah)" value={batteryCapacity} onChange={setBatteryCapacity} suffix="Ah" tooltip="Amp-hours of your battery bank." />
                <InputField id="batteryVoltage" label="Battery Voltage (V)" value={batteryVoltage} onChange={setBatteryVoltage} suffix="V" />
                <InputField id="load" label="Total Load (Watts)" value={load} onChange={setLoad} suffix="W" tooltip="Combined power consumption of all connected devices." />
                <InputField id="efficiency" label="UPS Efficiency (%)" value={efficiency} onChange={setEfficiency} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <BatteryCharging className="h-5 w-5" /> Calculate Runtime
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Backup Projection</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Runtime</p>
                    <p className="text-5xl font-black text-foreground">{Math.floor(results.runtimeMinutes)} <span className="text-xl">min</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({results.runtimeHours.toFixed(1)} hours)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Battery Storage</p>
                    <p className="text-3xl font-black text-foreground">{results.totalWh.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Wh</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Energy", value: 0, textValue: results.totalWh + " Watt-hours" },
                  { label: "Continuous Load", value: 0, textValue: load + " Watts" },
                  { label: "Efficiency Loss", value: 0, textValue: (100 - parseFloat(efficiency)) + "%" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Planning Your Backup Power</h2>
              <p>A UPS is your first line of defense against data loss and hardware damage from power surges or blackouts. Understanding its limits is crucial for maintaining server uptime.</p>
              <h3>Factors Affecting Runtime</h3>
              <ul>
                <li><strong>Age of Battery:</strong> Batteries lose capacity over time. A 3-year-old battery might only provide 60-70% of its original runtime.</li>
                <li><strong>Temperature:</strong> Lead-acid batteries are sensitive to heat. Operating in a room above 25°C (77°F) significantly shortens their lifespan.</li>
                <li><strong>Depth of Discharge:</strong> Repeatedly draining a battery to 0% will kill it quickly. Most UPS units shut down with 10-20% remaining to protect the battery.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ups-runtime" />
          <PopularCalculators exclude="/calculator/ups-battery-runtime-calculator" />
        </div>
      </div>
    </>
  );
};

export default UpsBatteryRuntimeCalculator;

