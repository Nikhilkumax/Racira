"use client";
import { RotateCcw, TrendingUp, Info } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const PopulationGrowthEcologyCalculator = () => {
  const [modelType, setModelType] = useState("exponential");
  const [initialPopulation, setInitialPopulation] = useState("100");
  const [growthRate, setGrowthRate] = useState("5");
  const [timePeriods, setTimePeriods] = useState("10");
  const [carryingCapacity, setCarryingCapacity] = useState("1000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const N0 = parseFloat(initialPopulation) || 0;
    const r = (parseFloat(growthRate) || 0) / 100;
    const t = parseFloat(timePeriods) || 0;
    const K = parseFloat(carryingCapacity) || 0;

    if (t < 0 || N0 < 0) return;

    let finalPopulation = 0;
    let dataPoints = [];

    if (modelType === "exponential") {
      finalPopulation = N0 * Math.exp(r * t);
      
      for (let i = 0; i <= t; i++) {
        dataPoints.push({ time: i, pop: N0 * Math.exp(r * i) });
      }
    } else {
      // Logistic Growth: N(t) = K / (1 + ((K - N0)/N0) * e^(-rt))
      if (K <= 0 || N0 === 0) return;
      const calcLogistic = (time: number) => K / (1 + ((K - N0) / N0) * Math.exp(-r * time));
      
      finalPopulation = calcLogistic(t);
      
      for (let i = 0; i <= t; i++) {
        dataPoints.push({ time: i, pop: calcLogistic(i) });
      }
    }

    setResults({
      finalPopulation,
      dataPoints
    });
  };

  const reset = () => {
    setModelType("exponential");
    setInitialPopulation("100");
    setGrowthRate("5");
    setTimePeriods("10");
    setCarryingCapacity("1000");
  };

  const faqs = [
    { question: "What is exponential growth?", answer: "Exponential growth occurs when a population's per capita growth rate stays the same, regardless of population size, making the population grow faster and faster as it gets larger. This usually happens when resources are unlimited." },
    { question: "What is logistic growth?", answer: "Logistic growth takes resource limitations into account. It starts exponentially, but as the population approaches the carrying capacity of the environment, the growth rate slows and eventually stops." },
    { question: "What is carrying capacity (K)?", answer: "Carrying capacity is the maximum population size of a biological species that can be sustained by that specific environment, given the food, habitat, water, and other necessities available." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Population Growth Ecology Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Population Growth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                     <TrendingUp className="h-4 w-4" /> Parameters
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Growth Model</label>
                    <select value={modelType} onChange={(e) => setModelType(e.target.value)} className="input-calc">
                      <option value="exponential">Exponential (Unlimited Resources)</option>
                      <option value="logistic">Logistic (Carrying Capacity)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Initial Population (N₀)</label>
                    <input type="number" value={initialPopulation} onChange={(e) => setInitialPopulation(e.target.value)} className="input-calc" min="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Growth Rate (r)</label>
                    <div className="relative">
                      <input type="number" step="0.1" value={growthRate} onChange={(e) => setGrowthRate(e.target.value)} className="input-calc" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="h-6"></div> {/* Spacer for alignment */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Time Periods (t)</label>
                    <input type="number" value={timePeriods} onChange={(e) => setTimePeriods(e.target.value)} className="input-calc" min="0" />
                  </div>
                  
                  {modelType === "logistic" && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">Carrying Capacity (K) <Info className="h-3 w-3" /></label>
                      <input type="number" value={carryingCapacity} onChange={(e) => setCarryingCapacity(e.target.value)} className="input-calc border-primary/50 bg-primary/5" min="1" />
                    </div>
                  )}

                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold">
                      <RotateCcw className="h-5 w-5" /> Reset Model
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
                <div className="text-center mb-8">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Final Population at Time t={timePeriods}</p>
                  <p className="text-5xl font-black text-foreground">{Math.round(results.finalPopulation).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total growth: +{Math.round(results.finalPopulation - parseFloat(initialPopulation)).toLocaleString()} individuals
                  </p>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border">
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                     <TrendingUp className="h-4 w-4 text-primary" /> Growth Projection
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                     {results.dataPoints.map((dp: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-border/50 last:border-0">
                           <span className="font-medium text-muted-foreground">Time {dp.time}</span>
                           <span className="font-bold">{Math.round(dp.pop).toLocaleString()}</span>
                        </div>
                     ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Population Dynamics in Ecology</h2>
              <p>In population ecology, understanding how populations grow and what limits their growth is fundamental to managing wildlife, conserving endangered species, and understanding human impacts on ecosystems.</p>
              
              <h3>The Exponential Model</h3>
              <p>The exponential model describes a population that increases continuously at a constant proportional rate. This is often seen in nature when a species colonizes a new, unexploited habitat with abundant resources. The famous equation is <strong>N(t) = N₀ * e^(rt)</strong>.</p>

              <h3>The Logistic Model</h3>
              <p>Because no environment has infinite resources, exponential growth cannot continue forever. The logistic growth model introduces the concept of carrying capacity (K). As the population size approaches K, the growth rate approaches zero. The resulting curve is S-shaped (sigmoidal).</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/population-growth-ecology" />
          <PopularCalculators exclude="/calculator/population-growth-ecology-calculator" />
        </div>
      </div>
    </>
  );
};

export default PopulationGrowthEcologyCalculator;

