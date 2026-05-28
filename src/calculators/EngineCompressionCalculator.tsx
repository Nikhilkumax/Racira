"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Gauge } from "lucide-react";

const EngineCompressionCalculator = () => {
  const [bore, setBore] = useState("4.00");
  const [stroke, setStroke] = useState("3.48");
  const [chamberVolume, setChamberVolume] = useState("64");
  const [pistonVolume, setPistonVolume] = useState("5");
  const [gasketThick, setGasketThick] = useState("0.040");
  const [deckHeight, setDeckHeight] = useState("0.010");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const b = parseFloat(bore) || 0;
    const s = parseFloat(stroke) || 0;
    const c = parseFloat(chamberVolume) || 0;
    const p = parseFloat(pistonVolume) || 0;
    const g = parseFloat(gasketThick) || 0;
    const d = parseFloat(deckHeight) || 0;

    if (b <= 0 || s <= 0) return;

    // Displacement per cylinder (cc)
    // Area = pi * r^2
    const radius = b / 2;
    const cylVol_in3 = Math.PI * Math.pow(radius, 2) * s;
    const cylVol_cc = cylVol_in3 * 16.387;

    // Gasket Volume
    const gasketVol_cc = (Math.PI * Math.pow(radius, 2) * g) * 16.387;
    // Deck Volume
    const deckVol_cc = (Math.PI * Math.pow(radius, 2) * d) * 16.387;

    // Total Compressed Volume (V_c) = Chamber + Piston + Gasket + Deck
    const v_c = c + p + gasketVol_cc + deckVol_cc;
    // Total Volume (V_t) = CylVol + V_c
    const v_t = cylVol_cc + v_c;

    const compressionRatio = v_t / v_c;

    setResults({
      ratio: compressionRatio,
      displacementCc: cylVol_cc,
      displacementIn3: cylVol_in3,
      v_c
    });
  };

  const reset = () => {
    setShowResults(false);
    setBore("4.00"); setStroke("3.48"); setChamberVolume("64");
    setPistonVolume("5"); setGasketThick("0.040"); setDeckHeight("0.010");
    setResults(null);
  };

  const faqs = [
    { question: "What is a good compression ratio for a street engine?", answer: "For modern street engines running on pump gas (91-93 octane), a compression ratio between 10:1 and 11:1 is typical. High-performance or direct-injection engines can sometimes exceed 12:1." },
    { question: "How does compression affect performance?", answer: "Higher compression ratios increase thermal efficiency, leading to more power and better fuel economy. However, higher compression also increases the risk of 'knock' or detonation, which can damage the engine." },
    { question: "What is 'Static' vs 'Dynamic' compression?", answer: "Static compression is the physical ratio of the volumes when the piston is at the bottom vs top. Dynamic compression accounts for the point when the intake valve actually closes, which is influenced by camshaft timing." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Engine Compression Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Engine Compression Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate the static compression ratio of your internal combustion engine based on cylinder geometry.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="bore" label="Cylinder Bore (in)" value={bore} onChange={setBore} />
                <InputField id="stroke" label="Crank Stroke (in)" value={stroke} onChange={setStroke} />
                <InputField id="chamber" label="Chamber Volume (cc)" value={chamberVolume} onChange={setChamberVolume} />
                <InputField id="piston" label="Piston Volume (cc)" value={pistonVolume} onChange={setPistonVolume} tooltip="Positive for dish/valve relief, negative for dome." />
                <InputField id="gasket" label="Gasket Thickness (in)" value={gasketThick} onChange={setGasketThick} />
                <InputField id="deck" label="Deck Height (in)" value={deckHeight} onChange={setDeckHeight} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Gauge className="h-5 w-5" /> Calculate Compression
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Engine Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Compression Ratio</p>
                    <p className="text-5xl font-black text-foreground">{results.ratio.toFixed(2)}:1</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Cylinder Displacement</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.displacementCc)} <span className="text-sm font-normal text-muted-foreground">cc</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Displacement (in³)", value: 0, textValue: results.displacementIn3.toFixed(2) + " in³" },
                  { label: "Compressed Volume (V_c)", value: 0, textValue: results.v_c.toFixed(1) + " cc" },
                  { label: "Fuel Requirement", value: 0, textValue: results.ratio > 11 ? "93+ Octane" : results.ratio > 9.5 ? "91 Octane" : "87 Octane" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Building for Performance</h2>
              <p>The compression ratio is one of the most fundamental parameters in engine design. It is the ratio between the volume of the cylinder when the piston is at the bottom of its stroke (Bottom Dead Center) and the volume when the piston is at the top (Top Dead Center).</p>
              <h3>Why Compression Ratio Matters</h3>
              <p>Increasing the compression ratio squeeze the air-fuel mixture into a smaller space, which results in a more forceful explosion when the spark plug ignites. This leads to higher thermal efficiency, meaning you get more work out of every drop of fuel. For racing engines, ratios of 13:1 to 15:1 are common, but these require specialized racing fuels with very high octane ratings to prevent detonation.</p>
              <h3>Factors in the Calculation</h3>
              <p>To get an accurate result, you must account for every tiny void in the combustion chamber. This includes the volume of the head gasket, the "deck height" (the distance between the top of the piston and the top of the block at TDC), and any "piston relief" or "dish" in the piston face. Even a small change in gasket thickness can swing the compression ratio by several tenths of a point.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/engine-compression" />
          <PopularCalculators exclude="/calculator/engine-compression-calculator" />
        </div>
      </div>
    </>
  );
};

export default EngineCompressionCalculator;

