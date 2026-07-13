"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, MousePointer2 } from "lucide-react";

const MouseSensitivityCalculator = () => {
  const [dpi, setDpi] = useState("800");
  const [sensitivity, setSensitivity] = useState("1.0");
  const [windowsSens, setWindowsSens] = useState("6"); // 6/11 is default

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(dpi) || 0;
    const s = parseFloat(sensitivity) || 0;
    const w = parseInt(windowsSens) || 6;

    if (d <= 0 || s <= 0) return;

    // Windows Multiplier table
    const wMult: any = {
      "1": 0.03125, "2": 0.0625, "3": 0.25, "4": 0.5, "5": 0.75, "6": 1,
      "7": 1.5, "8": 2, "9": 2.5, "10": 3, "11": 3.5
    };

    const edpi = d * s * (wMult[w] || 1);
    
    // Physical distance (Rough estimate for CS/Valorant style games)
    // cm/360 = (360 * 2.54) / (DPI * Sens * GameScale)
    // For many shooters, GameScale is roughly 0.022
    const cmPer360 = (360 * 2.54) / (d * s * 0.022);

    setResults({
      edpi,
      cmPer360,
      inPer360: cmPer360 / 2.54,
      quality: edpi < 400 ? "Low Sens" : edpi < 1200 ? "Medium Sens" : "High Sens"
    });
  };

  const reset = () => {
    setShowResults(false);
    setDpi("800"); setSensitivity("1.0"); setWindowsSens("6");
    setResults(null);
  };

  const faqs = [
    { question: "What is eDPI?", answer: "eDPI stands for Effective Dots Per Inch. It is calculated by multiplying your hardware DPI by your in-game sensitivity. This allows players with different DPI settings to compare their true sensitivity." },
    { question: "Should I use high or low sensitivity for FPS gaming?", answer: "Most professional FPS players use lower sensitivities (400-800 eDPI) because it allows for more precise aiming and muscle memory. However, high sensitivity is better for fast-paced games where you need to turn 180 degrees quickly." },
    { question: "Does Windows sensitivity matter?", answer: "If your game uses 'Raw Input' (standard in most modern games), Windows sensitivity is ignored. If not, keeping Windows at 6/11 is recommended to avoid skipping pixels." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Mouse Sensitivity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mouse Sensitivity (eDPI) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="dpi" label="Mouse DPI" value={dpi} onChange={setDpi} suffix="DPI" tooltip="Your mouse hardware DPI setting." />
                <InputField id="sensitivity" label="In-Game Sensitivity" value={sensitivity} onChange={setSensitivity} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Windows Sensitivity</label>
                  <select value={windowsSens} onChange={(e) => setWindowsSens(e.target.value)} className="input-calc">
                    {[...Array(11)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}/11</option>
                    ))}
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
                <h2 className="text-2xl font-bold mb-3">Sensitivity Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Effective DPI (eDPI)</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.edpi)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Movement Type</p>
                    <p className="text-3xl font-black text-foreground">{results.quality}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "CM per 360° Turn", value: 0, textValue: results.cmPer360.toFixed(1) + " cm" },
                  { label: "Inches per 360° Turn", value: 0, textValue: results.inPer360.toFixed(1) + " inches" },
                  { label: "Precision Factor", value: 0, textValue: results.edpi < 800 ? "High Precision" : "Speed Focused" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering Your Aim</h2>
              <p>In competitive gaming, consistency is everything. If you change your DPI or switch to a new game, your "feel" for the mouse might be ruined. Using an eDPI calculator ensures you maintain the same physical movement distance across different hardware and software settings.</p>
              <h3>Why cm/360 Matters</h3>
              <p>While eDPI is good for comparing within a single game, **cm/360** is the universal metric. It tells you exactly how many centimeters you need to move your mouse physically to do a full circle in the game. Professional players often have a cm/360 between 30cm and 50cm for tactical shooters like CS2 or Valorant.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mouse-sensitivity" />
          <PopularCalculators exclude="/calculator/mouse-sensitivity-calculator" />
        </div>
      </div>
    </>
  );
};

export default MouseSensitivityCalculator;

