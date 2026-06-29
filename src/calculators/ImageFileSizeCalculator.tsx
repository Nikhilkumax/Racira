"use client";
import { RotateCcw, Image, Maximize, FileDigit } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const ImageFileSizeCalculator = () => {
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [bitDepth, setBitDepth] = useState("24"); // 8, 16, 24, 32, 48
  const [compressionRatio, setCompressionRatio] = useState("10"); // 1 to 100

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;
    const bits = parseInt(bitDepth) || 24;
    const comp = parseFloat(compressionRatio) || 1;

    // Uncompressed size in bits = width * height * bit depth
    const totalBits = w * h * bits;
    const uncompressedBytes = totalBits / 8;
    const uncompressedMB = uncompressedBytes / (1024 * 1024);

    // Compressed estimate
    // Simple model: Uncompressed / Compression Ratio
    // Typical JPEG: 10:1 to 20:1
    // PNG: 2:1 to 5:1
    const compressedMB = uncompressedMB / Math.max(1, comp);

    setResults({
      uncompressedMB,
      compressedMB,
      totalPixels: w * h,
      megapixels: (w * h) / 1000000
    });
  };

  const reset = () => {
    setWidth("1920");
    setHeight("1080");
    setBitDepth("24");
    setCompressionRatio("10");
  };

  const faqs = [
    { question: "What is bit depth?", answer: "Bit depth determines how much color information is available for each pixel. 24-bit is 'True Color' (8 bits each for Red, Green, and Blue), providing 16.7 million colors. 32-bit often adds an 8-bit Alpha channel for transparency." },
    { question: "What is a typical compression ratio?", answer: "High-quality JPEGs usually have a 10:1 to 20:1 compression ratio. PNGs use lossless compression and typically achieve 2:1 to 5:1 ratios depending on the image complexity." },
    { question: "How many megapixels is 4K?", answer: "A standard 4K UHD image (3840 x 2160) is approximately 8.3 Megapixels." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Image File Size Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Image File Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Maximize className="h-5 w-5 text-primary" /> Dimensions
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Width (px)</label>
                      <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="input-calc" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Height (px)</label>
                      <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="input-calc" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={() => { setWidth("1280"); setHeight("720"); }} className="px-3 py-1 rounded bg-secondary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors">720p</button>
                    <button onClick={() => { setWidth("1920"); setHeight("1080"); }} className="px-3 py-1 rounded bg-secondary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors">1080p</button>
                    <button onClick={() => { setWidth("3840"); setHeight("2160"); }} className="px-3 py-1 rounded bg-secondary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors">4K UHD</button>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <FileDigit className="h-5 w-5 text-primary" /> Format Specs
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Color Bit Depth</label>
                    <select value={bitDepth} onChange={(e) => setBitDepth(e.target.value)} className="input-calc">
                      <option value="1">1-bit (B&W)</option>
                      <option value="8">8-bit (256 Colors)</option>
                      <option value="16">16-bit (High Color)</option>
                      <option value="24">24-bit (True Color - RGB)</option>
                      <option value="32">32-bit (True Color + Alpha)</option>
                      <option value="48">48-bit (Deep Color)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Compression Ratio (n:1)</label>
                    <input type="number" value={compressionRatio} onChange={(e) => setCompressionRatio(e.target.value)} className="input-calc" min="1" step="0.5" />
                    <p className="text-[10px] text-muted-foreground mt-1">e.g. 10 for 10:1 compression (typical JPEG)</p>
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset Settings
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-secondary/5 border-dashed text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Uncompressed Size (RAW)</p>
                    <p className="text-4xl font-black text-foreground">{results.uncompressedMB.toFixed(2)} <span className="text-xl font-normal text-muted-foreground">MB</span></p>
                  </div>
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Estimated File Size</p>
                    <p className="text-4xl font-black text-foreground">{results.compressedMB.toFixed(2)} <span className="text-xl font-normal text-muted-foreground">MB</span></p>
                  </div>
                </div>

                <div className="card-calculator">
                  <h2 className="text-2xl font-bold mb-3">
                    <Image className="h-5 w-5 text-primary" /> Technical Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Total Pixels", value: 0, textValue: results.totalPixels.toLocaleString() + " px" },
                    { label: "Megapixels", value: 0, textValue: results.megapixels.toFixed(2) + " MP" },
                    { label: "Bits Per Pixel", value: 0, textValue: bitDepth + " bits" },
                    { label: "Compression Used", value: 0, textValue: compressionRatio + ":1" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Digital Image Architecture</h2>
              <p>Understanding how image file sizes are calculated requires knowledge of resolution and color depth. A digital image is essentially a grid of pixels, where each pixel stores a specific color value.</p>
              
              <h3>Uncompressed vs. Compressed</h3>
              <p>A "RAW" or uncompressed image file size is calculated strictly by multiplying the number of pixels (width × height) by the bit depth. This is why high-resolution cameras produce such large files. However, most images we use daily (like JPEGs or WebPs) use compression algorithms to remove redundant data, drastically reducing the file size without significant loss in quality.</p>

              <h3>Bit Depth and Color Range</h3>
              <p>The bit depth determines the precision of color representation. For example, a 1-bit image only has two states: 0 or 1 (Black or White). A 24-bit image uses 8 bits for each of the three primary color channels (Red, Green, Blue), resulting in over 16 million possible color combinations per pixel.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/image-file-size" />
          <PopularCalculators exclude="/calculator/image-file-size-calculator" />
        </div>
      </div>
    </>
  );
};

export default ImageFileSizeCalculator;

