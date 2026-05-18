"use client";
import { RotateCcw, Lightbulb, DollarSign, Leaf } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const LedSavingsCalculator = () => {
  const [numberOfBulbs, setNumberOfBulbs] = useState("10");
  const [oldWattage, setOldWattage] = useState("60");
  const [newWattage, setNewWattage] = useState("9");
  const [hoursPerDay, setHoursPerDay] = useState("5");
  const [costPerKwh, setCostPerKwh] = useState("0.15");
  const [costPerLed, setCostPerLed] = useState("3");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const bulbs = parseFloat(numberOfBulbs) || 0;
    const w1 = parseFloat(oldWattage) || 0;
    const w2 = parseFloat(newWattage) || 0;
    const hpd = parseFloat(hoursPerDay) || 0;
    const cpk = parseFloat(costPerKwh) || 0;
    const cost = parseFloat(costPerLed) || 0;

    const totalUpfrontCost = bulbs * cost;

    // Daily kWh for all bulbs
    const oldDailyKwh = (w1 * bulbs * hpd) / 1000;
    const newDailyKwh = (w2 * bulbs * hpd) / 1000;

    // Annual Cost
    const oldAnnualCost = oldDailyKwh * 365 * cpk;
    const newAnnualCost = newDailyKwh * 365 * cpk;

    const annualSavingsDollars = oldAnnualCost - newAnnualCost;
    const annualSavingsKwh = (oldDailyKwh - newDailyKwh) * 365;
    
    // LED Lifetime (average 25,000 hours)
    const ledLifetimeYears = 25000 / (hpd * 365);
    const lifecycleSavings = (annualSavingsDollars * ledLifetimeYears) - totalUpfrontCost;

    const paybackMonths = annualSavingsDollars > 0 ? (totalUpfrontCost / annualSavingsDollars) * 12 : 0;

    setResults({
      annualSavingsKwh,
      annualSavingsDollars,
      paybackMonths,
      totalUpfrontCost,
      lifecycleSavings,
      ledLifetimeYears
    });
  };

  const reset = () => {
    setNumberOfBulbs("10");
    setOldWattage("60");
    setNewWattage("9");
    setHoursPerDay("5");
    setCostPerKwh("0.15");
    setCostPerLed("3");
  };

  const faqs = [
    { question: "How long do LED bulbs last?", answer: "A typical LED bulb is rated to last between 15,000 to 25,000 hours. If you use it for 5 hours a day, it could last up to 13 years before needing replacement, far longer than traditional incandescent or CFL bulbs." },
    { question: "Why are LED bulbs more efficient?", answer: "Incandescent bulbs create light by heating a filament until it glows, which wastes 90% of the energy as heat. LEDs produce light through an electronic process (electroluminescence) that generates very little heat, making them up to 85% more efficient." },
    { question: "Are LED bulbs safe for the environment?", answer: "Yes, they are highly beneficial. Aside from reducing the carbon footprint of power plants due to lower energy demand, LEDs do not contain toxic mercury, unlike CFL bulbs, making them easier and safer to dispose of." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "LED Lighting Savings Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">LED Savings Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate how much money and energy you can save by replacing old incandescent or CFL bulbs with LEDs.</p>

            <div className="card-calculator mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-primary" /> Lighting Setup
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Number of Bulbs</label>
                    <input type="number" value={numberOfBulbs} onChange={(e) => setNumberOfBulbs(e.target.value)} className="input-calc" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Old Wattage</label>
                       <div className="relative">
                         <input type="number" value={oldWattage} onChange={(e) => setOldWattage(e.target.value)} className="input-calc" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">W</span>
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">New LED Wattage</label>
                       <div className="relative">
                         <input type="number" value={newWattage} onChange={(e) => setNewWattage(e.target.value)} className="input-calc" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">W</span>
                       </div>
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Hours Used Per Day</label>
                    <input type="number" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} className="input-calc" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" /> Financials
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Cost per kWh ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                      <input type="number" step="0.01" value={costPerKwh} onChange={(e) => setCostPerKwh(e.target.value)} className="input-calc pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Cost per LED Bulb ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                      <input type="number" value={costPerLed} onChange={(e) => setCostPerLed(e.target.value)} className="input-calc pl-8" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold">
                      <RotateCcw className="h-5 w-5" /> Reset Values
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {results && results.annualSavingsDollars > 0 && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Your Savings Projection</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Annual Savings</p>
                    <p className="text-2xl font-black text-emerald-700">${results.annualSavingsDollars.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Payback Period</p>
                    <p className="text-2xl font-black text-foreground">{results.paybackMonths.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">mo</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Upfront Cost</p>
                    <p className="text-2xl font-black text-foreground">${results.totalUpfrontCost.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Lifecycle Profit</p>
                    <p className="text-2xl font-black text-blue-700">${results.lifecycleSavings.toFixed(0)}</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Leaf className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-1 text-sm uppercase tracking-wider">Environmental Impact</h3>
                      <p className="text-xs text-muted-foreground">Energy reduction over the {results.ledLifetimeYears.toFixed(0)}-year lifespan of your LEDs.</p>
                    </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Annual Energy Saved", value: 0, textValue: results.annualSavingsKwh + " kWh" },
                    { label: "10-Year Energy Saved", value: 0, textValue: (results.annualSavingsKwh * 10) + " kWh" },
                    { label: "CO2 Reduction (Estimated)", value: 0, textValue: (results.annualSavingsKwh * 0.85).toFixed(1) + " lbs/yr" },
                  ]} />
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>The LED Revolution</h2>
              <p>Switching to LED (Light Emitting Diode) lighting is one of the fastest, easiest, and most profitable energy-saving investments you can make for your home or business.</p>
              
              <h3>Incredible ROI</h3>
              <p>While an LED bulb costs slightly more upfront than a traditional incandescent, it uses a fraction of the electricity. Most homeowners find that the energy savings pay back the cost of the LED bulb in less than a year. Once the bulb pays for itself, it continues to save you money for decades.</p>

              <h3>Lifespan Matters</h3>
              <p>An incandescent bulb lasts about 1,000 hours. A CFL lasts about 8,000 hours. A quality LED bulb lasts 25,000 hours or more. This means you won't just save money on electricity; you will save money (and time) by not having to constantly buy and replace burnt-out bulbs.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/led-savings" />
            <PopularCalculators exclude="/calculator/led-savings-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default LedSavingsCalculator;

