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
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Font Size Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Input Value</label>
                  <span className="text-[10px] font-bold text-primary uppercase">{fromUnit}</span>
                </div>
                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="input-calc text-2xl font-black py-4" />
                <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="input-calc font-bold">
                  <option value="px">Pixels (px)</option>
                  <option value="rem">Root EM (rem)</option>
                  <option value="em">Element EM (em)</option>
                  <option value="pt">Points (pt)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>
              <button onClick={swapUnits} className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-2">
                <ArrowRightLeft className="h-5 w-5" />
              </button>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Converted</label>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">{toUnit}</span>
                </div>
                <div className="input-calc text-2xl font-black py-4 flex items-center bg-secondary/20 border-emerald-500/30">
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
            <div className="border-t border-border pt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Base Font Size (px)</label>
                <div className="relative">
                  <input type="number" value={baseSize} onChange={(e) => setBaseSize(e.target.value)} className="input-calc" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">px</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Browser default is 16px.</p>
              </div>
              <div className="flex flex-col justify-end gap-2">
                <button onClick={handleCalculate} className="btn-calculate">Convert</button>
                <button onClick={() => { setBaseSize("16"); setInputValue("1"); setFromUnit("rem"); setToUnit("px"); }} className="p-2 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 text-sm font-medium">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && conversionTable.length > 0 && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Result</p>
                  <p className="text-5xl font-black text-foreground">
                    {convertedValue.toFixed(convertedValue % 1 === 0 ? 0 : 3)}
                    <span className="text-2xl ml-2 text-muted-foreground">{toUnit}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{inputValue} {fromUnit} at base {baseSize}px</p>
                </div>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Table className="h-4 w-4 text-primary" /> Common Sizes (base {baseSize}px)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          <th className="pb-3 px-2">px</th>
                          <th className="pb-3 px-2">rem</th>
                          <th className="pb-3 px-2">pt</th>
                          <th className="pb-3 px-2">%</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {conversionTable.map((row, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-2 px-2 font-black">{row.px}</td>
                            <td className="py-2 px-2">{row.rem.toFixed(3)}</td>
                            <td className="py-2 px-2">{row.pt.toFixed(1)}</td>
                            <td className="py-2 px-2">{row.pct.toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>Modern Web Typography Units</h2>
            <p>In modern web development, absolute units like pixels (px) are generally discouraged. Responsive, accessible designs prioritize relative units like REM and EM.</p>
            <h3>The Power of REM</h3>
            <p>The rem unit is relative to the root HTML element font size. If a user sets their browser default to 20px, your entire layout scales proportionally.</p>
            <h3>When to Use EM</h3>
            <p>While rem is great for global layout, em is useful for components that should scale relative to their own container.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/font-size-converter" />
          <PopularCalculators exclude="/calculator/font-size-converter" />
        </div>
      </div>
    </>
  );
};

export default FontSizeConverter;
