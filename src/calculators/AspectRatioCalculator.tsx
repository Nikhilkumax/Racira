"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Monitor, Maximize, Smartphone, Info } from "lucide-react";

const AspectRatioCalculator = () => {
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [newWidth, setNewWidth] = useState("");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(width);
    const h = parseFloat(height);

    if (w <= 0 || h <= 0) return;

    const commonDivisor = gcd(w, h);
    const ratioW = w / commonDivisor;
    const ratioH = h / commonDivisor;
    
    let scaledHeight = "";
    if (newWidth) {
      scaledHeight = ((parseFloat(newWidth) * h) / w).toFixed(1);
    }

    setResults({
      ratio: `${ratioW}:${ratioH}`,
      decimal: (w / h).toFixed(3),
      scaledHeight,
      isWide: w / h > 1.8,
      commonName: getCommonName(ratioW, ratioH)
    });
  };

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const getCommonName = (w: number, h: number) => {
    if (w === 16 && h === 9) return "Widescreen (HDTV)";
    if (w === 4 && h === 3) return "Standard (SDTV)";
    if (w === 21 && h === 9) return "Ultrawide";
    if (w === 3 && h === 2) return "Photography / Classic";
    if (w === 1 && h === 1) return "Square (Instagram)";
    if (w === 9 && h === 16) return "Vertical (TikTok/Shorts)";
    return "Custom Ratio";
  };

  const reset = () => {
    setShowResults(false);
    setWidth("1920"); setHeight("1080"); setNewWidth("");
    setResults(null);
  };

  const faqs = [
    { question: "What is an Aspect Ratio?", answer: "An aspect ratio is the proportional relationship between the width and height of an image or screen. It is expressed as two numbers separated by a colon, such as 16:9." },
    { question: "What is the most common aspect ratio?", answer: "16:9 is currently the most common aspect ratio for computer monitors, televisions, and online video. For mobile devices, taller ratios like 19.5:9 are becoming standard." },
    { question: "Why do some movies have black bars?", answer: "Black bars (letterboxing or pillarboxing) appear when the aspect ratio of the content doesn't match the aspect ratio of your screen. To show the full image without cropping or stretching, the player adds bars to fill the empty space." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Aspect Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Aspect Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="width" label="Original Width" value={width} onChange={setWidth} />
                <InputField id="height" label="Original Height" value={height} onChange={setHeight} />
                <InputField id="newWidth" label="New Width (Optional)" value={newWidth} onChange={setNewWidth} placeholder="Calculate height..." />
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
                <h2 className="text-2xl font-bold mb-3">Ratio Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Aspect Ratio</p>
                    <p className="text-5xl font-black text-foreground">{results.ratio}</p>
                    <p className="text-xs text-muted-foreground mt-2">{results.commonName}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Decimal Ratio</p>
                    <p className="text-3xl font-black text-foreground">{results.decimal}</p>
                  </div>
                </div>

                {results.scaledHeight && (
                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
                    <h3 className="font-bold mb-2">New Dimensions</h3>
                    <p className="text-lg">To maintain the same ratio with a width of <strong>{newWidth}px</strong>, your new height should be <strong>{results.scaledHeight}px</strong>.</p>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Visual Comparison</h3>
                  <div className="flex justify-center p-8 bg-secondary/10 rounded-2xl border border-border/50">
                     <div 
                        style={{ 
                          aspectRatio: results.ratio.replace(':', '/'),
                          width: '100%',
                          maxWidth: '300px'
                        }} 
                        className="bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center text-primary font-bold shadow-inner"
                      >
                        {results.ratio}
                      </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Common Aspect Ratios</h2>
              <p>Aspect ratios have evolved significantly over the history of cinema and television. Understanding which one to use is vital for content creators and web designers.</p>
              
              <h3>16:9 (Widescreen)</h3>
              <p>The international standard for high-definition television and most online video platforms like YouTube. It was chosen as a compromise between the old 4:3 TV standard and the 2.39:1 cinema standard.</p>
              
              <h3>9:16 (Vertical)</h3>
              <p>Essentially a 16:9 screen turned on its side. This is the dominant format for mobile-first content like Instagram Stories, TikTok, and YouTube Shorts.</p>
              
              <h3>21:9 (Ultrawide)</h3>
              <p>Popular in PC gaming and cinematic filmmaking. It provides a much wider field of view, creating a more immersive experience for the viewer.</p>
              
              <h3>4:3 (Classic)</h3>
              <p>The standard for nearly all television and computer monitors before the mid-2000s. While rare now, it is still used in some photography formats and retro-gaming.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aspect-ratio" />
          <PopularCalculators exclude="/calculator/aspect-ratio-calculator" />
        </div>
      </div>
    </>
  );
};

export default AspectRatioCalculator;

