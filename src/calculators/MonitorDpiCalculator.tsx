"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Monitor } from "lucide-react";

const MonitorDpiCalculator = () => {
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [diagonal, setDiagonal] = useState("24");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;
    const d = parseFloat(diagonal) || 0;

    if (w <= 0 || h <= 0 || d <= 0) return;

    // Diagonal in pixels (Pythagoras)
    const diagPixels = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
    
    // PPI = Diagonal Pixels / Diagonal Inches
    const ppi = diagPixels / d;

    // Pixel pitch (distance between pixels in mm)
    // 1 inch = 25.4 mm
    const pixelPitch = 25.4 / ppi;

    // Aspect Ratio (GCD)
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const common = gcd(w, h);

    setResults({
      ppi,
      pixelPitch,
      totalPixels: w * h,
      aspectRatio: `${w/common}:${h/common}`,
      diagPixels
    });
  };

  const reset = () => {
    setShowResults(false);
    setWidth("1920"); setHeight("1080"); setDiagonal("24");
    setResults(null);
  };

  const faqs = [
    { question: "What is PPI?", answer: "PPI stands for Pixels Per Inch. It measures the 'pixel density' of a screen. A higher PPI means the image will appear sharper and more detailed, as the individual pixels are smaller and harder to see with the naked eye." },
    { question: "Is a 4K 27-inch monitor better than a 4K 32-inch?", answer: "Yes, in terms of sharpness. Both have the same number of pixels, but the 27-inch monitor packs them into a smaller area, resulting in a higher PPI (163 vs 140)." },
    { question: "What is considered a 'Retina' display?", answer: "Apple defines a 'Retina' display as one where the human eye cannot distinguish individual pixels at a typical viewing distance. This usually requires a PPI of around 220+ for laptops and 300+ for smartphones." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Monitor DPI Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Monitor DPI / PPI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="width" label="Width (Pixels)" value={width} onChange={setWidth} />
                <InputField id="height" label="Height (Pixels)" value={height} onChange={setHeight} />
                <InputField id="diagonal" label="Diagonal (Inches)" value={diagonal} onChange={setDiagonal} suffix="in" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Monitor className="h-5 w-5" /> Calculate Density
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Display Sharpness Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Pixel Density</p>
                    <p className="text-5xl font-black text-foreground">{results.ppi.toFixed(1)} <span className="text-xl">PPI</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Pixel Pitch</p>
                    <p className="text-3xl font-black text-foreground">{results.pixelPitch.toFixed(4)} <span className="text-sm font-normal text-muted-foreground">mm</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Pixels", value: 0, textValue: (results.totalPixels / 1000000).toFixed(1) + " Megapixels" },
                  { label: "Aspect Ratio", value: 0, textValue: results.aspectRatio },
                  { label: "Sharpness Category", value: 0, textValue: results.ppi > 200 ? "Retina Grade" : results.ppi > 100 ? "Standard Desktop" : "Low Density" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Why Pixel Density Matters</h2>
              <p>When buying a monitor, resolution is only half the story. A "1080p" resolution looks sharp on a 24-inch screen but will look blurry on a 32-inch screen because the pixels are stretched further apart. This is why **PPI (Pixels Per Inch)** is the best way to compare screen clarity.</p>
              <h3>Ideal PPI for Desktop</h3>
              <p>For most users, a PPI between **90 and 110** is considered the "sweet spot" for Windows desktop usage. At this density, text is readable without scaling, and the image is sharp enough for work and gaming. If you go much higher (e.g., 4K at 27-inch / 163 PPI), you will likely need to use Windows OS scaling (125% or 150%) to read comfortably.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/monitor-dpi" />
          <PopularCalculators exclude="/calculator/monitor-dpi-calculator" />
        </div>
      </div>
    </>
  );
};

export default MonitorDpiCalculator;

