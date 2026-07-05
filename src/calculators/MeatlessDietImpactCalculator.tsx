"use client";
import { RotateCcw, Utensils, Droplets, CloudRain, Leaf, Bird } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const MeatlessDietImpactCalculator = () => {
  const [daysPerWeek, setDaysPerWeek] = useState("1");
  const [people, setPeople] = useState("1");
  const [weeks, setWeeks] = useState("52");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(daysPerWeek) || 0;
    const p = parseFloat(people) || 0;
    const w = parseFloat(weeks) || 0;

    const totalDays = d * p * w;

    if (totalDays <= 0) {
      setResults(null);
      return;
    }

    // Daily savings estimates per person switching from average meat diet to plant-based:
    // Water: 1,100 gallons
    // Grain: 40 lbs
    // Forested Land: 30 sq ft
    // CO2 Eq: 20 lbs
    // Animal Lives: 1 animal

    setResults({
      totalDays,
      waterGallons: totalDays * 1100,
      grainLbs: totalDays * 40,
      landSqFt: totalDays * 30,
      co2Lbs: totalDays * 20,
      animalLives: totalDays * 1 // Rough estimate, highly dependent on animal type
    });
  };

  const reset = () => {
    setDaysPerWeek("1");
    setPeople("1");
    setWeeks("52");
  };

  const faqs = [
    { question: "Are these estimates accurate?", answer: "These are averages based on global data regarding the resources required to produce meat (primarily beef and pork) versus plant-based foods. The exact savings vary based on agricultural practices and the specific meats avoided." },
    { question: "Why does meat use so much water?", answer: "The vast majority of the water footprint for meat comes from growing the crops needed to feed the animals. It takes hundreds of gallons of water to grow the grain required to produce just one pound of beef." },
    { question: "How does eating less meat help the rainforest?", answer: "A leading cause of deforestation, particularly in the Amazon, is clearing land for cattle grazing and to grow soy crops, which are overwhelmingly used for livestock feed rather than human consumption." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Meatless Diet Impact Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Meatless Impact Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="max-w-xl space-y-6">
                 <h2 className="text-2xl font-bold mb-3">
                    <Utensils className="h-6 w-6 text-primary" /> Diet Plan
                 </h2>
                 <div className="grid sm:grid-cols-3 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Days per Week</label>
                      <input type="number" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} className="input-calc text-center" min="0" max="7" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">People Participating</label>
                      <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} className="input-calc text-center" min="1" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Number of Weeks</label>
                      <input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} className="input-calc text-center" min="1" />
                   </div>
                 </div>
                 <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold">
                    <RotateCcw className="h-5 w-5" /> Reset Plan
                 </button>
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
                <div className="text-center mb-8">
                   <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Impact Over</p>
                   <p className="text-3xl font-black">{results.totalDays.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">Meatless Days</span></p>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center flex flex-col items-center justify-center">
                    <Droplets className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-xl font-black text-blue-700">{Math.round(results.waterGallons).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Water (Gallons)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/20 text-center flex flex-col items-center justify-center">
                    <CloudRain className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xl font-black text-slate-700">{Math.round(results.co2Lbs).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">CO₂ (Lbs)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center flex flex-col items-center justify-center">
                    <Leaf className="h-8 w-8 text-emerald-600 mb-2" />
                    <p className="text-xl font-black text-emerald-700">{Math.round(results.landSqFt).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Forest (Sq Ft)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-center flex flex-col items-center justify-center">
                    <Bird className="h-8 w-8 text-rose-600 mb-2" />
                    <p className="text-xl font-black text-rose-700">{Math.round(results.animalLives).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">Animals</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Environmental Impact of Diet</h2>
              <p>The foods we choose to eat have a profound impact on the environment. Animal agriculture is heavily resource-intensive compared to plant-based agriculture. Even a slight reduction in meat consumption, such as participating in "Meatless Mondays," can yield significant environmental benefits.</p>
              
              <h3>Water Scarcity and Agriculture</h3>
              <p>Agriculture accounts for approximately 70% of all global freshwater withdrawals. The water footprint of meat, particularly beef, is exceptionally high because the animals require years of feed before slaughter. A single pound of beef can require upwards of 1,800 gallons of water to produce.</p>

              <h3>Land Use and Deforestation</h3>
              <p>Vast tracts of natural ecosystems, including the Amazon rainforest, are cleared daily to make room for cattle ranching and to grow monoculture crops (like soy and corn) destined for animal feed. Transitioning to plant-based diets frees up massive amounts of land that can be rewilded to absorb carbon.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/meatless-monday-impact" />
          <PopularCalculators exclude="/calculator/meatless-monday-impact-calculator" />
        </div>
      </div>
    </>
  );
};

export default MeatlessDietImpactCalculator;

