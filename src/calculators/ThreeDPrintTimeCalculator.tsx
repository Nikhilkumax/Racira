"use client";
import { RotateCcw, Zap, Box, Layers } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const ThreeDPrintTimeCalculator = () => {
  const [modelVolume, setModelVolume] = useState("50"); // cm3
  const [layerHeight, setLayerHeight] = useState("0.2"); // mm
  const [printSpeed, setPrintSpeed] = useState("60"); // mm/s
  const [infillDensity, setInfillDensity] = useState("20"); // %
  const [shellCount, setShellCount] = useState("3");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const volCm3 = parseFloat(modelVolume) || 0;
    const layerMm = parseFloat(layerHeight) || 0.2;
    const speed = parseFloat(printSpeed) || 60;
    const infill = (parseFloat(infillDensity) || 0) / 100;
    const shells = parseInt(shellCount) || 3;

    if (volCm3 <= 0 || speed <= 0) {
      setResults(null);
      return;
    }

    // Rough estimation formula
    // Volume to print = (Shells volume) + (Infill volume)
    // For a standard cube, shells are roughly 10-20% of volume depending on shape
    const effectiveInfillVol = volCm3 * infill;
    const shellVol = volCm3 * 0.15 * (shells/3);
    const totalVolToPrintMm3 = (effectiveInfillVol + shellVol) * 1000;

    // Time = Volume / (Flow Rate)
    // Flow rate = Layer Height * Nozzle Width (0.4) * Speed
    const flowRate = layerMm * 0.4 * speed;
    
    const timeSeconds = totalVolToPrintMm3 / flowRate;
    
    // Add 20% for travel moves, acceleration, and heating
    const totalTimeSec = timeSeconds * 1.2;
    
    const hours = Math.floor(totalTimeSec / 3600);
    const minutes = Math.floor((totalTimeSec % 3600) / 60);

    setResults({
      hours,
      minutes,
      totalTimeSec,
      totalVolToPrintMm3
    });
  };

  const reset = () => {
    setModelVolume("50");
    setLayerHeight("0.2");
    setPrintSpeed("60");
    setInfillDensity("20");
    setShellCount("3");
  };

  const faqs = [
    { question: "How accurate is this estimate?", answer: "This is a rough mathematical estimate. Actual print times depend heavily on your specific slicer settings (Cura, PrusaSlicer), acceleration/jerk settings, and the geometric complexity of the model." },
    { question: "How does layer height affect time?", answer: "Layer height has the most significant impact on print time. Reducing layer height from 0.2mm to 0.1mm will roughly double your print time because the printer has to lay down twice as many layers." },
    { question: "What is infill density?", answer: "Infill is the internal structure of a 3D print. 0% means the object is hollow, while 100% means it is solid plastic. Most functional prints use 15% to 40% infill." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "3D Print Time Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">3D Print Time Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate FDM 3D printing duration based on volume, speed, and slicer settings.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Box className="h-5 w-5 text-primary" /> Model Info
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Model Volume (cm³)</label>
                    <input type="number" value={modelVolume} onChange={(e) => setModelVolume(e.target.value)} className="input-calc" />
                    <p className="text-[10px] text-muted-foreground mt-1">Found in your slicer or CAD software.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Infill (%)</label>
                      <input type="number" value={infillDensity} onChange={(e) => setInfillDensity(e.target.value)} className="input-calc" min="0" max="100" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Shells/Walls</label>
                      <input type="number" value={shellCount} onChange={(e) => setShellCount(e.target.value)} className="input-calc" min="1" />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Layers className="h-5 w-5 text-primary" /> Print Settings
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Layer Height (mm)</label>
                    <select value={layerHeight} onChange={(e) => setLayerHeight(e.target.value)} className="input-calc">
                      <option value="0.1">0.1 mm (Fine)</option>
                      <option value="0.15">0.15 mm (Good)</option>
                      <option value="0.2">0.2 mm (Standard)</option>
                      <option value="0.28">0.28 mm (Draft)</option>
                      <option value="0.3">0.3 mm (Coarse)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Print Speed (mm/s)</label>
                    <input type="number" value={printSpeed} onChange={(e) => setPrintSpeed(e.target.value)} className="input-calc" />
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

            {showResults && results && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-10 mb-6">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated Print Time</p>
                    <p className="text-6xl font-black text-foreground">
                       {results.hours}h {results.minutes}m
                    </p>
                    <p className="text-xs text-muted-foreground mt-4 italic">Including 20% overhead for travel and heating.</p>
                </div>

                <div className="card-calculator">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Zap className="h-5 w-5 text-primary" /> Print Data
                  </h2>
                  <ResultDisplay items={[
                    { label: "Material to Print", value: 0, textValue: (results.totalVolToPrintMm3 / 1000).toFixed(2) + " cm³" },
                    { label: "Est. Filament Length (1.75mm)", value: 0, textValue: ((results.totalVolToPrintMm3 / 1000) / 0.024).toFixed(1) + " cm" },
                    { label: "Est. Weight (PLA)", value: 0, textValue: ((results.totalVolToPrintMm3 / 1000) * 1.24).toFixed(1) + " g" },
                  ]} />
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />
            <article className="prose-finance">
              <h2>Optimizing 3D Print Speed</h2>
              <p>FDM (Fused Deposition Modeling) 3D printing is a time-consuming process. Understanding the relationship between your slicer settings and the final print time is crucial for efficient production.</p>
              
              <h3>Layer Height: The Primary Lever</h3>
              <p>Layer height determines the vertical resolution of your print. While thinner layers (e.g., 0.1mm) look much smoother and hide "layer lines," they require the printer to make twice as many passes compared to 0.2mm layers. For functional parts where aesthetics matter less, using a larger layer height can save hours of time.</p>

              <h3>Infill vs. Walls</h3>
              <p>Many beginners increase infill to 100% for strength, but this is rarely efficient. Most of a part's structural integrity comes from its "walls" or "shells." Increasing the wall count from 2 to 4 often makes a part stronger than increasing infill from 20% to 50%, while using less filament and taking less time.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/3d-print-time" />
            <PopularCalculators exclude="/calculator/3d-print-time-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ThreeDPrintTimeCalculator;

