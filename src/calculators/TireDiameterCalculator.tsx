"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Circle } from "lucide-react";

const TireDiameterCalculator = () => {
  const [width, setWidth] = useState("245");
  const [aspectRatio, setAspectRatio] = useState("40");
  const [rimSize, setRimSize] = useState("18");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(width) || 0;
    const ar = parseFloat(aspectRatio) || 0;
    const r = parseFloat(rimSize) || 0;

    if (w <= 0 || ar <= 0 || r <= 0) return;

    // Sidewall Height (mm) = Width * (Aspect Ratio / 100)
    const sidewallMm = w * (ar / 100);
    const sidewallIn = sidewallMm / 25.4;

    // Total Diameter (in) = Rim Size + (2 * Sidewall Height)
    const totalDiameterIn = r + (2 * sidewallIn);
    const totalDiameterMm = totalDiameterIn * 25.4;

    // Circumference = pi * diameter
    const circumferenceIn = Math.PI * totalDiameterIn;
    const revsPerMile = 63360 / circumferenceIn;

    setResults({
      sidewallMm,
      sidewallIn,
      totalDiameterIn,
      totalDiameterMm,
      circumferenceIn,
      revsPerMile
    });
  };

  const reset = () => {
    setShowResults(false);
    setWidth("245"); setAspectRatio("40"); setRimSize("18");
    setResults(null);
  };

  const faqs = [
    { question: "What do the numbers on a tire mean?", answer: "In a 245/40R18 tire: 245 is the width in millimeters, 40 is the aspect ratio (sidewall height is 40% of the width), and 18 is the diameter of the wheel rim in inches." },
    { question: "How does changing tire size affect my speedometer?", answer: "If you install larger diameter tires, your speedometer will read slower than you are actually going. If the new diameter is 3% larger, your speedometer will read 60 mph when you are actually going 61.8 mph." },
    { question: "What is the 3% rule for tires?", answer: "Most automotive experts recommend keeping any tire size change within +/- 3% of the original tire's total diameter to avoid issues with clearance, gear ratios, and electronic stability systems." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tire Diameter Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Tire Diameter Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate the overall diameter, circumference, and revolutions per mile for any tire size.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="width" label="Tire Width (mm)" value={width} onChange={setWidth} tooltip="The first number (e.g., 245)" />
                <InputField id="aspect" label="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} tooltip="The second number (e.g., 40)" />
                <InputField id="rim" label="Rim Size (in)" value={rimSize} onChange={setRimSize} tooltip="The last number (e.g., 18)" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Circle className="h-5 w-5" /> Calculate Dimensions
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Tire Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Diameter</p>
                    <p className="text-5xl font-black text-foreground">{results.totalDiameterIn.toFixed(2)} <span className="text-xl">in</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({results.totalDiameterMm.toFixed(1)} mm)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Revolutions Per Mile</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.revsPerMile)} <span className="text-sm font-normal text-muted-foreground">revs</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Sidewall Height", value: 0, textValue: results.sidewallIn.toFixed(2) + " in (" + results.sidewallMm.toFixed(1) + " mm)" },
                  { label: "Circumference", value: 0, textValue: results.circumferenceIn.toFixed(2) + " in" },
                  { label: "Tire Format", value: 0, textValue: "Metric (P-Metric)" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Choosing the Right Tires</h2>
              <p>Tire sizing is a mix of metric and imperial measurements that can be confusing for even experienced car enthusiasts. Understanding these numbers is vital when upgrading your wheels or looking for better performance.</p>
              <h3>Width and Aspect Ratio</h3>
              <p>The width of the tire (in mm) determines the "contact patch" on the road. A wider tire generally offers more grip but can increase rolling resistance and fuel consumption. The aspect ratio is a percentage — a "40" means the sidewall height is 40% of the width. Low-profile tires (lower aspect ratio) offer better handling but a stiffer, harsher ride.</p>
              <h3>Overall Diameter Matters</h3>
              <p>Your car's drivetrain and computer systems are tuned for a specific total tire diameter. Changing this diameter affects your gear ratios, speedometer accuracy, and can even interfere with ABS and traction control sensors. When buying new tires, always try to match the original overall diameter as closely as possible.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tire-diameter" />
            <PopularCalculators exclude="/calculator/tire-diameter-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default TireDiameterCalculator;

