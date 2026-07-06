"use client";
import { RotateCcw, Zap, Settings, Cpu } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const StepperMotorCalculator = () => {
  const [motorStepAngle, setMotorStepAngle] = useState("1.8"); // Degrees per step
  const [driverMicrostepping, setDriverMicrostepping] = useState("16"); // 1, 2, 4, 8, 16, 32
  const [beltPitch, setBeltPitch] = useState("2"); // mm (GT2 is 2mm)
  const [pulleyTeeth, setPulleyTeeth] = useState("20");
  const [leadScrewPitch, setLeadScrewPitch] = useState("8"); // mm/rev

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const angle = parseFloat(motorStepAngle) || 1.8;
    const ms = parseFloat(driverMicrostepping) || 16;
    const pitch = parseFloat(beltPitch) || 2;
    const teeth = parseFloat(pulleyTeeth) || 20;
    const lsPitch = parseFloat(leadScrewPitch) || 8;

    const fullStepsPerRev = 360 / angle;
    const microstepsPerRev = fullStepsPerRev * ms;

    // Belt Driven (X/Y Axis)
    const beltStepsPerMm = microstepsPerRev / (pitch * teeth);

    // Lead Screw Driven (Z Axis)
    const screwStepsPerMm = microstepsPerRev / lsPitch;

    setResults({
      fullStepsPerRev,
      microstepsPerRev,
      beltStepsPerMm,
      screwStepsPerMm
    });
  };

  const reset = () => {
    setMotorStepAngle("1.8");
    setDriverMicrostepping("16");
    setBeltPitch("2");
    setPulleyTeeth("20");
    setLeadScrewPitch("8");
  };

  const faqs = [
    { question: "What is microstepping?", answer: "Microstepping is a method of controlling stepper motors that increases the resolution of the motor by dividing each full step into smaller increments. For example, 16x microstepping divides one full step into 16 smaller steps." },
    { question: "How many steps is a 1.8° motor?", answer: "A 1.8° stepper motor has 200 full steps per revolution (360 / 1.8 = 200). A 0.9° motor has 400 full steps." },
    { question: "What is GT2 belt pitch?", answer: "GT2 is the standard timing belt used in 3D printers. The pitch (distance between the center of two teeth) is exactly 2mm." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Stepper Motor Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stepper Motor Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Cpu className="h-5 w-5 text-primary" /> Motor & Driver
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Step Angle (°)</label>
                      <select value={motorStepAngle} onChange={(e) => setMotorStepAngle(e.target.value)} className="input-calc">
                        <option value="1.8">1.8° (200 steps)</option>
                        <option value="0.9">0.9° (400 steps)</option>
                        <option value="7.5">7.5° (48 steps)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Microsteps</label>
                      <select value={driverMicrostepping} onChange={(e) => setDriverMicrostepping(e.target.value)} className="input-calc">
                        <option value="1">1 (Full)</option>
                        <option value="2">2 (Half)</option>
                        <option value="4">4 (Quarter)</option>
                        <option value="8">8</option>
                        <option value="16">16</option>
                        <option value="32">32</option>
                        <option value="64">64</option>
                        <option value="128">128</option>
                        <option value="256">256</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Settings className="h-5 w-5 text-primary" /> Mechanical System
                  </h2>
                  <div className="border-b border-border pb-4 mb-4">
                    <p className="text-[10px] font-black text-primary uppercase mb-3">Belt Drive (X/Y)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Belt Pitch (mm)</label>
                        <input type="number" value={beltPitch} onChange={(e) => setBeltPitch(e.target.value)} className="input-calc text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Pulley Teeth</label>
                        <input type="number" value={pulleyTeeth} onChange={(e) => setPulleyTeeth(e.target.value)} className="input-calc text-xs" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase mb-3">Lead Screw (Z)</p>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Screw Lead (mm/rev)</label>
                      <input type="number" value={leadScrewPitch} onChange={(e) => setLeadScrewPitch(e.target.value)} className="input-calc text-xs" />
                      <p className="text-[8px] text-muted-foreground mt-1">Common T8 screw is 8mm lead.</p>
                    </div>
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator text-center py-8 border-primary/20 bg-primary/5">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Belt Steps/mm</p>
                    <p className="text-4xl font-black text-foreground">{results.beltStepsPerMm.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono italic">M92 X{results.beltStepsPerMm.toFixed(2)} Y{results.beltStepsPerMm.toFixed(2)}</p>
                  </div>
                  <div className="card-calculator text-center py-8 border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Screw Steps/mm</p>
                    <p className="text-4xl font-black text-foreground">{results.screwStepsPerMm.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono italic">M92 Z{results.screwStepsPerMm.toFixed(2)}</p>
                  </div>
                </div>

                <div className="card-calculator">
                  <h2 className="text-2xl font-bold mb-3">
                    <Zap className="h-5 w-5 text-primary" /> Resolution Data
                  </h2>
                  <ResultDisplay items={[
                    { label: "Steps Per Revolution", value: results.fullStepsPerRev },
                    { label: "Microsteps Per Rev", value: 0, textValue: results.microstepsPerRev.toLocaleString() },
                    { label: "Linear Res (Belt)", value: 0, textValue: (1 / results.beltStepsPerMm * 1000).toFixed(2) + " μm" },
                    { label: "Linear Res (Screw)", value: 0, textValue: (1 / results.screwStepsPerMm * 1000).toFixed(2) + " μm" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Configuring 3D Printer Firmware</h2>
              <p>For a 3D printer or CNC machine to move accurately, its firmware (like Marlin, Klipper, or RepRapFirmware) must know exactly how many electronic pulses (steps) correspond to one millimeter of physical movement.</p>
              
              <h3>The Role of Microstepping</h3>
              <p>Modern stepper drivers like the TMC2209 or A4988 use microstepping to smooth out motor motion and increase precision. While higher microstepping (like 256x) sounds better, it places a massive processing load on 8-bit microcontrollers and doesn't always translate to better physical accuracy due to motor positioning errors.</p>

              <h3>Lead vs. Pitch</h3>
              <p>When calculating Z-axis steps, it's vital to use the 'Lead' of the screw, not just the 'Pitch'. The lead is the linear distance a nut travels in one complete revolution of the screw. For a single-start screw, lead equals pitch. For an 4-start T8 screw (very common in 3D printers), the pitch might be 2mm, but the lead is 8mm.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stepper-motor" />
          <PopularCalculators exclude="/calculator/stepper-motor-calculator" />
        </div>
      </div>
    </>
  );
};

export default StepperMotorCalculator;

