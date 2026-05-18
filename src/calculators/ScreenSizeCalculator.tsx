"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const ScreenSizeCalculator = () => {
  const [diagonal, setDiagonal] = useState("27");
  const [ratioWidth, setRatioWidth] = useState("16");
  const [ratioHeight, setRatioHeight] = useState("9");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(diagonal) || 0;
    const rw = parseFloat(ratioWidth) || 16;
    const rh = parseFloat(ratioHeight) || 9;

    // d^2 = w^2 + h^2
    // w = rh_w * k, h = rh_h * k
    // d^2 = (rw*k)^2 + (rh*k)^2
    // d^2 = k^2 * (rw^2 + rh^2)
    // k = sqrt(d^2 / (rw^2 + rh^2))
    
    const k = Math.sqrt(Math.pow(d, 2) / (Math.pow(rw, 2) + Math.pow(rh, 2)));
    const width = rw * k;
    const height = rh * k;
    const area = width * height;

    setResults({
      width,
      height,
      area,
      ppi: 0 // Would need resolution for PPI
    });
  };

  const reset = () => {
    setShowResults(false);
    setDiagonal("27");
    setRatioWidth("16");
    setRatioHeight("9");
    setResults(null);
  };

  const faqs = [
    { question: "How is screen size measured?", answer: "Screen size is always measured diagonally from one corner of the viewing area to the opposite corner. This measurement does not include the bezels (the plastic frame) around the screen." },
    { question: "What is aspect ratio?", answer: "Aspect ratio is the proportional relationship between the width and height of a screen. Common ratios include 16:9 (standard widescreen TV/monitor), 21:9 (ultrawide), and 4:3 (older TVs)." },
    { question: "Why does a 16:9 screen look smaller than a 4:3 screen of the same diagonal?", answer: "For a fixed diagonal, the closer a rectangle is to a square, the more area it has. A 4:3 screen is more 'square' than a 16:9 screen, so a 27-inch 4:3 screen actually has more physical surface area than a 27-inch 16:9 screen." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Screen Size" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Screen Size Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate the physical width, height, and surface area of a screen based on its diagonal size and aspect ratio.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="diagonal" label="Diagonal Size" value={diagonal} onChange={setDiagonal} suffix="in" />
                <InputField id="ratioW" label="Ratio Width" value={ratioWidth} onChange={setRatioWidth} />
                <InputField id="ratioH" label="Ratio Height" value={ratioHeight} onChange={setRatioHeight} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Dimensions</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                <div className="grid sm:grid-cols-2 gap-8 items-center">
                  <div className="relative aspect-video bg-secondary/30 rounded-lg border border-border flex items-center justify-center overflow-hidden">
                     {/* Dynamic Visual representation */}
                     <div 
                       className="border-2 border-primary bg-primary/10 rounded"
                       style={{ 
                         aspectRatio: `${ratioWidth}/${ratioHeight}`,
                         width: '80%'
                       }}
                     />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-4">Physical Dimensions</h2>
                    <ResultDisplay items={[
                      { label: "Width", value: 0, textValue: `${results.width.toFixed(2)} in (${(results.width * 2.54).toFixed(1)} cm)` },
                      { label: "Height", value: 0, textValue: `${results.height.toFixed(2)} in (${(results.height * 2.54).toFixed(1)} cm)` },
                      { label: "Total Area", value: 0, textValue: `${results.area.toFixed(1)} sq in` },
                      { label: "Aspect Ratio", value: 0, textValue: `${ratioWidth}:${ratioHeight}` },
                    ]} />
                  </div>
                </div>
              </div>
            )}

            <article className="prose-finance">
              <h2>Choosing the Right Screen Size</h2>
              <p>When buying a new monitor or TV, diagonal size is only half the story. The aspect ratio significantly changes how much usable space you have for work or entertainment.</p>
              <h3>Area vs. Diagonal</h3>
              <p>Because screen sizes are marketed by diagonal, manufacturers can make a screen 'sound' bigger while providing less surface area by making it wider (increasing aspect ratio). For example, a 34-inch ultrawide (21:9) actually has a similar height to a 27-inch standard widescreen (16:9), but with extra width on the sides.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/screen-size-calculator" />
            <PopularCalculators exclude="/calculator/screen-size-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder label="Sidebar Ad" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ScreenSizeCalculator;

