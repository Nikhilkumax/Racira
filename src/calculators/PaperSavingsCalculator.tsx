"use client";
import { RotateCcw, Zap, FileText, Trees, Droplets } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const PaperSavingsCalculator = () => {
  const [reamsPerMonth, setReamsPerMonth] = useState("10");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const reams = parseFloat(reamsPerMonth) || 0;
    const annualReams = reams * 12;

    // Standard environmental impact estimates per 1 ream (500 sheets) of standard copy paper:
    // Trees: ~0.06 trees (1 tree makes ~16.67 reams)
    // Water: ~105 gallons
    // Energy: ~22.5 kWh
    // CO2: ~11 lbs

    setResults({
      annualReams,
      treesSaved: annualReams * 0.06,
      waterSavedGallons: annualReams * 105,
      energySavedKwh: annualReams * 22.5,
      co2SavedLbs: annualReams * 11
    });
  };

  const reset = () => {
    setReamsPerMonth("10");
  };

  const faqs = [
    { question: "How many sheets of paper are in a ream?", answer: "A standard ream of office copy paper contains exactly 500 sheets." },
    { question: "How many trees does it take to make paper?", answer: "It takes roughly one standard pine tree (about 40 feet tall and 6-8 inches in diameter) to produce 8,333 sheets of copy paper, or about 16.6 reams." },
    { question: "Why does paper production use so much water?", answer: "The paper-making process involves turning wood into a wet pulp. Water is required to break down the wood fibers, bleach them, and press them into flat sheets. While modern mills recycle some water, it remains a highly water-intensive industry." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Paper Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Paper Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="max-w-md space-y-6">
                 <h2 className="text-2xl font-bold mb-3">
                    <FileText className="h-6 w-6 text-primary" /> Paper Consumption
                 </h2>
                 <div>
                    <label className="block text-sm font-bold text-muted-foreground uppercase mb-2 text-center">Reams of Paper Saved per Month</label>
                    <input type="number" value={reamsPerMonth} onChange={(e) => setReamsPerMonth(e.target.value)} className="input-calc text-center text-2xl" min="0" />
                    <p className="text-xs text-muted-foreground mt-2 text-center">1 ream = 500 sheets of standard A4/Letter paper</p>
                 </div>
                 <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold">
                    <RotateCcw className="h-5 w-5" /> Reset
                 </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && results.annualReams > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-3">Annual Environmental Impact</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center flex flex-col items-center justify-center">
                    <Trees className="h-8 w-8 text-emerald-600 mb-2" />
                    <p className="text-2xl font-black text-emerald-700">{results.treesSaved.toFixed(1)}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Trees Saved</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center flex flex-col items-center justify-center">
                    <Droplets className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-black text-blue-700">{Math.round(results.waterSavedGallons).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Gallons of Water</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center flex flex-col items-center justify-center">
                    <Zap className="h-8 w-8 text-amber-600 mb-2" />
                    <p className="text-2xl font-black text-amber-700">{Math.round(results.energySavedKwh).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">kWh of Energy</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/20 text-center flex flex-col items-center justify-center">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-600 flex items-center justify-center font-black text-slate-600 mb-2 text-xs">CO₂</div>
                    <p className="text-2xl font-black text-slate-700">{Math.round(results.co2SavedLbs).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Lbs of CO₂</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border text-center">
                  <p className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-widest">Total Paper Saved</p>
                  <p className="text-4xl font-black text-foreground">{Math.round(results.annualReams * 500).toLocaleString()} <span className="text-xl font-normal text-muted-foreground">sheets per year</span></p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Environmental Cost of Paper</h2>
              <p>In the digital age, we often assume that our reliance on paper has drastically decreased. However, global paper consumption continues to rise, driven by packaging and printing. Understanding the true environmental cost of paper can inspire businesses and individuals to adopt "paperless" workflows.</p>
              
              <h3>More Than Just Trees</h3>
              <p>While the deforestation impact of paper is widely known, the water and energy footprints are often ignored. The pulp and paper industry is the single largest industrial consumer of water in Western countries. It takes roughly 3 gallons of water to produce a single sheet of standard copy paper.</p>

              <h3>Energy and Emissions</h3>
              <p>Processing raw timber into white copy paper requires massive amounts of energy for chipping, pulping, bleaching, and pressing. Furthermore, when paper decays in a landfill, it emits methane, a greenhouse gas significantly more potent than CO2.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/paper-savings" />
          <PopularCalculators exclude="/calculator/paper-savings-calculator" />
        </div>
      </div>
    </>
  );
};

export default PaperSavingsCalculator;

