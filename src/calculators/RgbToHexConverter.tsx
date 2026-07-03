"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Palette, Copy, Check, Hash } from "lucide-react";

const RgbToHexConverter = () => {
  const [r, setR] = useState("103");
  const [g, setG] = useState("58");
  const [b, setB] = useState("183"); // Deep Violet default
  const [copied, setCopied] = useState("");
  const [showResults, setShowResults] = useState(false);

  const componentToHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  const hexValue = rgbToHex(parseInt(r) || 0, parseInt(g) || 0, parseInt(b) || 0).toUpperCase();

  const handleCopy = (val: string, type: string) => {
    navigator.clipboard.writeText(val);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const faqs = [
    { question: "What is the difference between RGB and HEX?", answer: "RGB (Red, Green, Blue) uses three numbers from 0-255 to define a color. HEX uses a six-digit hexadecimal code (0-9, A-F) to represent the same values. They are just different ways of representing the same digital color." },
    { question: "Why are there only 255 levels?", answer: "In standard 8-bit color depth, each channel (Red, Green, Blue) is allocated 8 bits, which allows for 2^8 (256) possible values, ranging from 0 to 255." },
    { question: "How many total colors are possible in RGB?", answer: "With 256 levels per channel, there are 256 * 256 * 256 = 16,777,216 possible color combinations. This is often referred to as 'True Color'." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "RGB to HEX Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">RGB to HEX Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  {/* Red */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-red-500 uppercase tracking-widest">Red</label>
                      <input type="number" min="0" max="255" value={r} onChange={(e) => setR(e.target.value)} className="w-16 p-1 text-center bg-secondary rounded border border-border font-mono font-bold" />
                    </div>
                    <input type="range" min="0" max="255" value={r} onChange={(e) => setR(e.target.value)} className="w-full accent-red-500" />
                  </div>

                  {/* Green */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-green-500 uppercase tracking-widest">Green</label>
                      <input type="number" min="0" max="255" value={g} onChange={(e) => setG(e.target.value)} className="w-16 p-1 text-center bg-secondary rounded border border-border font-mono font-bold" />
                    </div>
                    <input type="range" min="0" max="255" value={g} onChange={(e) => setG(e.target.value)} className="w-full accent-green-500" />
                  </div>

                  {/* Blue */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-blue-500 uppercase tracking-widest">Blue</label>
                      <input type="number" min="0" max="255" value={b} onChange={(e) => setB(e.target.value)} className="w-16 p-1 text-center bg-secondary rounded border border-border font-mono font-bold" />
                    </div>
                    <input type="range" min="0" max="255" value={b} onChange={(e) => setB(e.target.value)} className="w-full accent-blue-500" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <div 
                    className="w-full aspect-square max-w-[240px] rounded-3xl shadow-2xl border-4 border-white dark:border-border overflow-hidden relative"
                    style={{ backgroundColor: hexValue }}
                  >
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Palette className="h-12 w-12 text-white mix-blend-difference opacity-20" />
                     </div>
                  </div>
                  <div className="text-center">
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Current Color</p>
                     <p className="text-3xl font-black font-mono">{hexValue}</p>
                  </div>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-calculator py-6">
                  <h2 className="text-2xl font-bold mb-3">
                     <Hash className="h-4 w-4" /> Hexadecimal
                  </h2>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                     <span className="font-mono text-xl font-bold">{hexValue}</span>
                     <button onClick={() => handleCopy(hexValue, 'hex')} className="text-primary hover:text-primary/80 transition-colors">
                        {copied === 'hex' ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                     </button>
                  </div>
               </div>
               <div className="card-calculator py-6">
                  <h2 className="text-2xl font-bold mb-3">
                     <Palette className="h-4 w-4" /> CSS RGB
                  </h2>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                     <span className="font-mono text-sm font-bold">rgb({r}, {g}, {b})</span>
                     <button onClick={() => handleCopy(`rgb(${r}, ${g}, ${b})`, 'rgb')} className="text-primary hover:text-primary/80 transition-colors">
                        {copied === 'rgb' ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                     </button>
                  </div>
               </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Color Models in Web Design</h2>
              <p>Computers create colors by mixing light. The primary colors of light are Red, Green, and Blue (RGB). By varying the intensity of these three lights, we can create millions of distinct colors.</p>
              
              <h3>Hexadecimal (HEX)</h3>
              <p>Hexadecimal is a base-16 numbering system. In color codes, the first two characters represent Red, the middle two represent Green, and the last two represent Blue. Values range from 00 (0 in decimal) to FF (255 in decimal).</p>

              <h3>Why Use One Over the Other?</h3>
              <p>HEX is the industry standard for CSS because it's concise and easy to copy. RGB is often used when you need to adjust opacity (using RGBA), as HEX opacity support is newer and less intuitive (e.g., adding 80 to the end for 50% transparency).</p>

              <h3>Understanding the Values</h3>
              <p>When all three values are the same, you get a shade of gray. Higher values result in lighter colors (FFF is white), while lower values result in darker colors (000 is black).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rgb-to-hex" />
          <PopularCalculators exclude="/calculator/rgb-to-hex-converter" />
        </div>
      </div>
    </>
  );
};

export default RgbToHexConverter;

