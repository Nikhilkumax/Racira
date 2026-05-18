"use client";
import { RotateCcw, ArrowRightLeft, Table } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const FontSizeConverter = () => {
  const [baseSize, setBaseSize] = useState("16");
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("rem");
  const [toUnit, setToUnit] = useState("px");
  const [showResults, setShowResults] = useState(false);

  const [convertedValue, setConvertedValue] = useState<number>(16);
  const [conversionTable, setConversionTable] = useState<any[]>([]);

  const handleCalculate = () => {
    setShowResults(true);
    const base = parseFloat(baseSize) || 16;
    const val = parseFloat(inputValue) || 0;

    // Convert input to pixels
    let pxValue = val;
    if (fromUnit === "rem" || fromUnit === "em") pxValue = val * base;
    else if (fromUnit === "pt") pxValue = val * (96 / 72);
    else if (fromUnit === "percent") pxValue = (val / 100) * base;

    // Convert pixels to target
    let result = pxValue;
    if (toUnit === "rem" || toUnit === "em") result = pxValue / base;
    else if (toUnit === "pt") result = pxValue * (72 / 96);
    else if (toUnit === "percent") result = (pxValue / base) * 100;

    setConvertedValue(result);

    // Build common table
    const commonSizes = [10, 12, 14, 16, 18, 20, 24, 32, 48, 64];
    const table = commonSizes.map(px => ({
      px,
      rem: px / base,
      pt: px * (72 / 96),
      pct: (px / base) * 100
    }));
    setConversionTable(table);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const faqs = [
    { question: "What is the difference between EM and REM?", answer: "REM (Root EM) is always relative to the font size of the root element (usually 16px). EM is relative to the font size of its parent element, which can cause 'nesting' issues where sizes multiply." },
    { question: "Why use REM instead of Pixels?", answer: "REM is better for accessibility. If a user changes their browser's default font size, your entire layout will scale proportionally. Pixels are absolute and do not respect user preferences." },
    { question: "How do I convert Points to Pixels?", answer: "The standard conversion used in web design is 1 Point (pt) = 1.333 Pixels (px). This is based on the assumption that a standard screen has 96 DPI (Dots Per Inch)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Font Size Converter" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Font Size Converter</h1>
            <p className="text-muted-foreground mb-8 text-lg">Convert typography units between Pixels, REM, EM, Points, and Percentages.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Input Value</label>
                    <span className="text-[10px] font-bold text-primary uppercase">{fromUnit}</span>
                  </div>
                  <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="input-calc text-3xl font-black py-6 h-20" />
                  <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="input-calc font-bold">
                    <option value="px">Pixels (px)</option>
                    <option value="rem">Root EM (rem)</option>
                    <option value="em">Element EM (em)</option>
                    <option value="pt">Points (pt)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>

                <button onClick={swapUnits} className="p-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors mt-6">
                  <ArrowRightLeft className="h-6 w-6" />
                </button>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Converted</label>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">{toUnit}</span>
                  </div>
                  <div className="input-calc text-3xl font-black py-6 h-20 flex items-center bg-secondary/20 border-emerald-500/30">
                    {convertedValue.toFixed(convertedValue % 1 === 0 ? 0 : 3)}
                  </div>
                  <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="input-calc font-bold">
                    <option value="px">Pixels (px)</option>
                    <option value="rem">Root EM (rem)</option>
                    <option value="em">Element EM (em)</option>
                    <option value="pt">Points (pt)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border grid sm:grid-cols-2 gap-8">
                <div>
                   <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Base Font Size (px)</label>
                   <div className="relative">
                      <input type="number" value={baseSize} onChange={(e) => setBaseSize(e.target.value)} className="input-calc" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">px</span>
                   </div>
                   <p className="text-[10px] text-muted-foreground mt-2">Browser default is 16px. Used for REM and EM calculations.</p>
                </div>
                <div className="flex flex-col justify-center">
                  <button onClick={() => { setBaseSize("16"); setInputValue("1"); setFromUnit("rem"); setToUnit("px"); }} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                    <RotateCcw className="h-4 w-4" /> Reset Default
                  </button>
                </div>
              </div>
            </div>

            <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                 <Table className="h-5 w-5 text-primary" /> Common Conversion Table
               </h2>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead>
                     <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                       <th className="pb-4 px-2">Pixels</th>
                       <th className="pb-4 px-2">REM (at {baseSize}px)</th>
                       <th className="pb-4 px-2">Points</th>
                       <th className="pb-4 px-2">Percent</th>
                     </tr>
                   </thead>
                   <tbody className="font-mono">
                     {conversionTable.map((row, i) => (
                       <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                         <td className="py-3 px-2 font-black">{row.px}px</td>
                         <td className="py-3 px-2">{row.rem.toFixed(3)}rem</td>
                         <td className="py-3 px-2">{row.pt.toFixed(1)}pt</td>
                         <td className="py-3 px-2">{row.pct.toFixed(0)}%</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            <AdPlaceholder className="my-8" />
            <article className="prose-finance">
              <h2>Modern Web Typography</h2>
              <p>In modern web development, using absolute units like pixels (px) for font sizes is generally discouraged. Instead, responsive and accessible designs prioritize relative units like REM and EM.</p>
              
              <h3>The Power of REM</h3>
              <p>The `rem` unit is relative to the root (HTML) element's font size. By using `rem`, you ensure that if a user has their browser font size set to "Large" (typically 20px instead of 16px), your entire website will scale up proportionally. This is a critical requirement for Web Content Accessibility Guidelines (WCAG).</p>

              <h3>When to Use EM</h3>
              <p>While `rem` is great for general layout and typography, `em` is useful for components that should scale relative to their own container's font size. For example, padding or icons inside a button might use `em` so they shrink or grow if you change only that button's font size.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/font-size-converter" />
            <PopularCalculators exclude="/calculator/font-size-converter" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default FontSizeConverter;

