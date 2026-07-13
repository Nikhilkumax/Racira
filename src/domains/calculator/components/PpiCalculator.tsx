"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Monitor, Maximize, Smartphone, Info } from "lucide-react";

const PpiCalculator = () => {
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [diagonal, setDiagonal] = useState("24");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(width);
    const h = parseFloat(height);
    const d = parseFloat(diagonal);

    if (w <= 0 || h <= 0 || d <= 0) return;

    // Diagonal resolution in pixels
    const diagonalPixels = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
    const ppi = diagonalPixels / d;
    
    // Pixel pitch (distance between pixels in mm)
    const dotPitch = (d * 25.4) / diagonalPixels;

    setResults({
      ppi,
      totalPixels: (w * h).toLocaleString(),
      dotPitch,
      aspectRatio: `${w / gcd(w, h)}:${h / gcd(w, h)}`,
      rating: ppi > 300 ? "Retina / High Density" : ppi > 150 ? "Sharp / Desktop Standard" : "Low Density"
    });
  };

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const reset = () => {
    setShowResults(false);
    setWidth("1920"); setHeight("1080"); setDiagonal("24");
    setResults(null);
  };

  const faqs = [
    { question: "What is PPI?", answer: "PPI stands for Pixels Per Inch. It is a measurement of the pixel density of a digital display, such as a computer monitor or smartphone screen. The higher the PPI, the more detail the screen can display and the sharper images and text will appear." },
    { question: "What is a 'Retina' display?", answer: "Retina is a brand name used by Apple for screens with a pixel density high enough that the human eye cannot distinguish individual pixels at a typical viewing distance. This is usually around 300 PPI for phones and 220 PPI for laptops." },
    { question: "Does a higher PPI always mean a better screen?", answer: "Generally yes, but there are diminishing returns. Once you reach the limit of human vision, adding more pixels just increases the load on the graphics processor without a visible benefit. Color accuracy, contrast ratio, and refresh rate are also critical for screen quality." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "PPI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pixel Density (PPI) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="width" label="Width (Pixels)" value={width} onChange={setWidth} />
                <InputField id="height" label="Height (Pixels)" value={height} onChange={setHeight} />
                <InputField id="diagonal" label="Diagonal Size (Inches)" value={diagonal} onChange={setDiagonal} />
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
                <h2 className="text-2xl font-bold mb-3">Display Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Pixel Density</p>
                    <p className="text-5xl font-black text-foreground">{results.ppi.toFixed(2)} <span className="text-xl font-normal text-muted-foreground">PPI</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Visual Rating</p>
                    <p className="text-2xl font-black text-foreground">{results.rating}</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Smartphone className="h-6 w-6 text-primary" /></div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Technical Details</h3>
                      <ResultDisplay items={[
                        { label: "Total Resolution", value: 0, textValue: `${width} x ${height}` },
                        { label: "Total Pixels", value: 0, textValue: results.totalPixels },
                        { label: "Aspect Ratio", value: 0, textValue: results.aspectRatio },
                        { label: "Pixel Pitch (Dot Pitch)", value: 0, textValue: results.dotPitch.toFixed(4) + " mm" },
                      ]} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">PPI vs. Resolution</h2>
              <p>Many people confuse resolution with pixel density. Resolution is simply the total count of pixels (e.g., 1920x1080), while PPI describes how tightly those pixels are packed together on a physical surface. A 50-inch 4K TV and a 5-inch 4K smartphone have the same resolution, but vastly different PPIs.</p>
              <h3>Viewing Distance Matters</h3>
              <p>The "required" PPI for a sharp image depends on how far away you are from the screen. Because you hold a phone closer to your face than a computer monitor, you need a higher PPI on the phone for the screen to look equally sharp.</p>
              <h3>The Impact on Performance</h3>
              <p>Higher density displays require more processing power and battery life to drive the extra pixels. This is why some laptop and phone users choose to run their devices at a lower "logical" resolution than the native physical resolution of the screen.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ppi" />
          <PopularCalculators exclude="/calculator/pixel-density-calculator" />
        </div>
      </div>
    </>
  );
};

export default PpiCalculator;

