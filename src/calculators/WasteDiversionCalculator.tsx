"use client";
import { RotateCcw, RefreshCw, Info, Trash2, Leaf } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const WasteDiversionCalculator = () => {
  const [totalWaste, setTotalWaste] = useState("1000");
  const [recycled, setRecycled] = useState("300");
  const [composted, setComposted] = useState("150");
  const [reused, setReused] = useState("50");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const total = parseFloat(totalWaste) || 0;
    const r = parseFloat(recycled) || 0;
    const c = parseFloat(composted) || 0;
    const re = parseFloat(reused) || 0;

    const totalDiverted = r + c + re;
    const landfilled = total - totalDiverted;
    
    // Prevent division by zero
    if (total <= 0) {
      setResults(null);
      return;
    }

    const diversionRate = (totalDiverted / total) * 100;

    setResults({
      totalDiverted,
      landfilled: landfilled > 0 ? landfilled : 0,
      diversionRate,
      warning: totalDiverted > total
    });
  };

  const reset = () => {
    setTotalWaste("1000");
    setRecycled("300");
    setComposted("150");
    setReused("50");
  };

  const faqs = [
    { question: "What is a waste diversion rate?", answer: "The waste diversion rate is the percentage of total waste generated that is diverted from landfills or incinerators through recycling, composting, or reuse." },
    { question: "What is considered a 'good' diversion rate?", answer: "A 50% diversion rate is considered average for an eco-conscious business. A rate of 90% or higher qualifies as 'Zero Waste' under many international certifications." },
    { question: "How can I improve my diversion rate?", answer: "Implement clear, color-coded bins for recycling and compost, conduct regular waste audits to see what is mistakenly thrown away, and switch to compostable or recyclable packaging." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Waste Diversion Rate Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Waste Diversion Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate the percentage of your waste that avoids the landfill via recycling, composting, and reuse.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid md:grid-cols-[1fr_1fr] gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Trash2 className="h-5 w-5 text-primary" /> Waste Data (lbs or kg)
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Total Waste Generated</label>
                    <input type="number" value={totalWaste} onChange={(e) => setTotalWaste(e.target.value)} className="input-calc" />
                    <p className="text-[10px] text-muted-foreground mt-1">Include everything: trash, recycling, and compost.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Recycled</label>
                    <input type="number" value={recycled} onChange={(e) => setRecycled(e.target.value)} className="input-calc" />
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="h-10 hidden md:block"></div>
                  <div>
                    <label className="block text-xs font-bold text-amber-600 uppercase mb-2 flex items-center gap-1"><Leaf className="h-3 w-3" /> Composted</label>
                    <input type="number" value={composted} onChange={(e) => setComposted(e.target.value)} className="input-calc" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-2">Reused / Donated</label>
                    <input type="number" value={reused} onChange={(e) => setReused(e.target.value)} className="input-calc" />
                  </div>
                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                      <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                  </div>
                </section>
              </div>
            
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button
                  onClick={reset}
                  className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                {results.warning && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-2">
                    <Info className="h-5 w-5 shrink-0" />
                    <p><strong>Error:</strong> The total diverted waste ({results.totalDiverted}) cannot be greater than the total waste generated ({totalWaste}). Please check your numbers.</p>
                  </div>
                )}
                
                <h2 className="text-xl font-bold mb-6">Diversion Analysis</h2>
                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Diversion Rate</p>
                    <p className="text-5xl font-black text-foreground">{results.diversionRate.toFixed(1)}<span className="text-2xl font-normal text-muted-foreground">%</span></p>
                    <p className="text-xs text-muted-foreground mt-2">
                       {results.diversionRate >= 90 ? "Zero Waste Achieved! 🏆" : results.diversionRate >= 50 ? "Good Progress 👍" : "Needs Improvement 📉"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Diverted</p>
                    <p className="text-3xl font-black text-emerald-700">{results.totalDiverted.toLocaleString()}</p>
                    <p className="text-xs font-medium text-emerald-600/70 mt-1">Saved from landfill</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Landfilled</p>
                    <p className="text-3xl font-black text-red-700">{results.landfilled.toLocaleString()}</p>
                    <p className="text-xs font-medium text-red-600/70 mt-1">Sent to trash</p>
                  </div>
                </div>

                <div className="w-full h-4 bg-red-500/20 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (parseFloat(recycled) / parseFloat(totalWaste)) * 100)}%` }} title="Recycled" />
                  <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (parseFloat(composted) / parseFloat(totalWaste)) * 100)}%` }} title="Composted" />
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (parseFloat(reused) / parseFloat(totalWaste)) * 100)}%` }} title="Reused" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-bold uppercase">
                   <span>0% Diverted</span>
                   <span>100% (Zero Waste)</span>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Importance of Waste Diversion</h2>
              <p>Waste diversion is the process of redirecting waste from landfills and incinerators to more sustainable channels like recycling, composting, or reuse. It is a key metric for businesses, municipalities, and households aiming for environmental sustainability.</p>
              
              <h3>Why Landfills are a Problem</h3>
              <p>Landfills are one of the largest sources of human-made methane, a greenhouse gas that is 25 times more potent than carbon dioxide at trapping heat in the atmosphere. Furthermore, burying resources like paper, plastic, and metal means we must extract new raw materials to replace them, compounding the environmental damage.</p>

              <h3>The Road to "Zero Waste"</h3>
              <p>The internationally recognized standard for a "Zero Waste" organization is achieving a waste diversion rate of 90% or higher. The remaining 10% accounts for materials that currently have no viable recycling or composting infrastructure.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/waste-diversion" />
          <PopularCalculators exclude="/calculator/waste-diversion-calculator" />
        </div>
      </div>
    </>
  );
};

export default WasteDiversionCalculator;

