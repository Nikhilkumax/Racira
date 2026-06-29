"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Leaf, Info, Sprout } from "lucide-react";

const CompostRatioCalculator = () => {
  const [greensWeight, setGreensWeight] = useState("10"); // kg
  const [greensCN, setGreensCN] = useState("15"); // Typical for grass
  const [brownsWeight, setBrownsWeight] = useState("10"); // kg
  const [brownsCN, setBrownsCN] = useState("60"); // Typical for leaves

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const wG = parseFloat(greensWeight) || 0;
    const rG = parseFloat(greensCN) || 15;
    const wB = parseFloat(brownsWeight) || 0;
    const rB = parseFloat(brownsCN) || 60;

    // Formula for combined C:N ratio:
    // (wG + wB) / ( (wG/rG) + (wB/rB) )
    // Actually, it's weighted by Carbon content, but a common simplified formula is:
    // Total Carbon / Total Nitrogen
    // If we assume both have 50% Carbon by weight (common simplification for organic matter):
    // Total Carbon = 0.5 * (wG + wB)
    // Total Nitrogen = (0.5 * wG / rG) + (0.5 * wB / rB)
    // Ratio = Total Carbon / Total Nitrogen
    
    const nitrogen = (wG / rG) + (wB / rB);
    const totalRatio = (wG + wB) / (nitrogen || 1);

    setResults({
      totalRatio,
      status: totalRatio < 20 ? "Too much Nitrogen (Add Browns)" : totalRatio > 40 ? "Too much Carbon (Add Greens)" : "Optimal (Ideal for Hot Composting)",
      isOptimal: totalRatio >= 25 && totalRatio <= 30
    });
  };

  const reset = () => {
    setShowResults(false);
    setGreensWeight("10"); setGreensCN("15"); setBrownsWeight("10"); setBrownsCN("60");
    setResults(null);
  };

  const faqs = [
    { question: "What are 'Greens' and 'Browns'?", answer: "Greens are nitrogen-rich materials like grass clippings, vegetable scraps, and coffee grounds. Browns are carbon-rich materials like dry leaves, straw, wood chips, and shredded cardboard." },
    { question: "What is the ideal C:N ratio?", answer: "The sweet spot for fast, 'hot' composting is between 25:1 and 30:1. If the ratio is too low (too much nitrogen), the pile may smell like ammonia. If it's too high (too much carbon), the decomposition process will be very slow." },
    { question: "Why do I need both carbon and nitrogen?", answer: "Decomposing microorganisms use carbon for energy and nitrogen for building proteins and reproducing. A balanced diet allows them to thrive and break down organic matter quickly." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Compost C:N Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Compost C:N Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-6">
                <section>
                  <div className="flex items-center gap-2 mb-4 text-green-600">
                    <Sprout className="h-5 w-5" />
                    <h2 className="text-2xl font-bold mb-3">Greens (Nitrogen)</h2>
                  </div>
                  <div className="space-y-4">
                    <InputField id="gw" label="Weight / Volume" value={greensWeight} onChange={setGreensWeight} suffix="units" />
                    <InputField id="gc" label="C:N Ratio" value={greensCN} onChange={setGreensCN} tooltip="Grass: 15-20, Food Scraps: 12-15" />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4 text-orange-700">
                    <Leaf className="h-5 w-5" />
                    <h2 className="text-2xl font-bold mb-3">Browns (Carbon)</h2>
                  </div>
                  <div className="space-y-4">
                    <InputField id="bw" label="Weight / Volume" value={brownsWeight} onChange={setBrownsWeight} suffix="units" />
                    <InputField id="bc" label="C:N Ratio" value={brownsCN} onChange={setBrownsCN} tooltip="Leaves: 40-80, Cardboard: 350, Wood: 500" />
                  </div>
                </section>
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
                <h2 className="text-2xl font-bold mb-3">Mix Analysis</h2>
                <div className="max-w-md mx-auto text-center mb-8">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Calculated Ratio</p>
                  <p className={`text-6xl font-black mb-4 ${results.isOptimal ? 'text-green-600' : 'text-foreground'}`}>{results.totalRatio.toFixed(1)}<span className="text-2xl">:1</span></p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${results.isOptimal ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {results.status}
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Info className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-2">Pro-Tip for Gardeners</h3>
                      <p className="text-sm text-muted-foreground">If your ratio is high (brown heavy), your pile will sit dormant. If it's low (green heavy), it will turn slimy and smelly. Aim for a mix that feels like a wrung-out sponge in terms of moisture for best results.</p>
                      <ResultDisplay items={[
                        { label: "Target Ratio", value: 0, textValue: "25:1 - 30:1" },
                        { label: "Material Balance", value: 0, textValue: (parseFloat(brownsWeight) / (parseFloat(greensWeight) || 1)).toFixed(1) + " Browns to 1 Green" },
                      ]} />
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
              <h2>The Science of Composting</h2>
              <p>Composting is a biological process where microorganisms convert organic material into a nutrient-rich soil amendment. The speed and quality of this process depend on four factors: Carbon, Nitrogen, Oxygen, and Water.</p>
              <h3>Why the Ratio Matters</h3>
              <p>Think of carbon as the energy source (carbohydrates) and nitrogen as the protein for the "compost microbes." If you provide only energy (dry leaves), they have no building blocks to grow their population. If you provide only protein (fresh grass), they burn through it too fast, creating heat and ammonia gas that escapes the pile.</p>
              <h3>Common C:N Values</h3>
              <ul>
                <li><strong>Vegetable Scraps:</strong> 12:1 to 15:1</li>
                <li><strong>Fresh Grass Clippings:</strong> 15:1 to 20:1</li>
                <li><strong>Dry Leaves:</strong> 40:1 to 80:1</li>
                <li><strong>Straw:</strong> 75:1</li>
                <li><strong>Cardboard:</strong> 350:1</li>
                <li><strong>Sawdust:</strong> 500:1</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/compost-ratio" />
          <PopularCalculators exclude="/calculator/compost-ratio-calculator" />
        </div>
      </div>
    </>
  );
};

export default CompostRatioCalculator;

