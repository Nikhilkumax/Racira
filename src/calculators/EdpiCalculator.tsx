"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Target } from "lucide-react";

const EdpiCalculator = () => {
  const [dpi, setDpi] = useState("800");
  const [sensitivity, setSensitivity] = useState("1.0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(dpi) || 0;
    const s = parseFloat(sensitivity) || 0;

    if (d <= 0 || s <= 0) return;

    const edpi = d * s;

    setResults({
      edpi,
      category: edpi < 400 ? "Very Low" : edpi < 800 ? "Low" : edpi < 1200 ? "Medium" : "High"
    });
  };

  const reset = () => {
    setShowResults(false);
    setDpi("800"); setSensitivity("1.0");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between DPI and eDPI?", answer: "DPI is the hardware resolution of your mouse sensor. eDPI is the actual sensitivity you experience in-game after your software sensitivity multiplier is applied." },
    { question: "Is 1600 DPI better than 400 DPI?", answer: "Technically, higher DPI provides more data points to the computer, which can lead to smoother movement and less input lag. Most players use 1600 DPI and then lower their in-game sensitivity to match their preferred eDPI." },
    { question: "Can I compare eDPI between different games?", answer: "No. Every game engine (Source, Unreal, etc.) uses different sensitivity scales. An eDPI of 800 in CS2 is not the same as an eDPI of 800 in Overwatch." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "eDPI Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">eDPI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="dpi" label="Mouse DPI" value={dpi} onChange={setDpi} suffix="DPI" />
                <InputField id="sensitivity" label="Game Sensitivity" value={sensitivity} onChange={setSensitivity} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Target className="h-5 w-5" /> Calculate eDPI
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="text-center p-8 bg-primary/5 rounded-3xl border border-primary/10">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Your Effective DPI</p>
                  <p className="text-7xl font-black text-foreground mb-4">{Math.round(results.edpi)}</p>
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                    {results.category} Sensitivity
                  </div>
                </div>
                <div className="mt-8">
                  <ResultDisplay items={[
                    { label: "Hardware DPI", value: 0, textValue: dpi },
                    { label: "Game Multiplier", value: 0, textValue: sensitivity },
                    { label: "Raw Input Status", value: 0, textValue: "Recommended" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Standardizing Your Sensitivity</h2>
              <p>eDPI is the most common way for gamers to share their settings. If a pro player uses 400 DPI and 2.0 sensitivity, their eDPI is 800. If you use 800 DPI and 1.0 sensitivity, your eDPI is also 800—meaning you both have the exact same in-game feel.</p>
              <h3>Common eDPI Ranges (CS2/Valorant)</h3>
              <ul>
                <li><strong>Low:</strong> 400 - 600 eDPI (Requires large arm movements)</li>
                <li><strong>Medium:</strong> 600 - 1000 eDPI (Standard for most pros)</li>
                <li><strong>High:</strong> 1000 - 1600 eDPI (Wrist-heavy movement)</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/edpi" />
          <PopularCalculators exclude="/calculator/edpi-calculator" />
        </div>
      </div>
    </>
  );
};

export default EdpiCalculator;

