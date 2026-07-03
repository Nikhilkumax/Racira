"use client";
import { RotateCcw, Zap, Clock, DollarSign } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const EnergyEfficientApplianceCalculator = () => {
  const [currentWattage, setCurrentWattage] = useState("500");
  const [newWattage, setNewWattage] = useState("200");
  const [hoursPerDay, setHoursPerDay] = useState("4");
  const [costPerKwh, setCostPerKwh] = useState("0.15");
  const [newApplianceCost, setNewApplianceCost] = useState("800");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w1 = parseFloat(currentWattage) || 0;
    const w2 = parseFloat(newWattage) || 0;
    const hpd = parseFloat(hoursPerDay) || 0;
    const cpk = parseFloat(costPerKwh) || 0;
    const cost = parseFloat(newApplianceCost) || 0;

    const oldAnnualKwh = (w1 * hpd * 365) / 1000;
    const newAnnualKwh = (w2 * hpd * 365) / 1000;
    const annualSavingsKwh = oldAnnualKwh - newAnnualKwh;
    
    const annualSavingsDollars = annualSavingsKwh * cpk;
    const paybackYears = annualSavingsDollars > 0 ? cost / annualSavingsDollars : 0;

    setResults({
      annualSavingsKwh,
      annualSavingsDollars,
      paybackYears,
      oldCost: oldAnnualKwh * cpk,
      newCost: newAnnualKwh * cpk
    });
  };

  const reset = () => {
    setCurrentWattage("500");
    setNewWattage("200");
    setHoursPerDay("4");
    setCostPerKwh("0.15");
    setNewApplianceCost("800");
  };

  const faqs = [
    { question: "What is ROI in energy efficiency?", answer: "ROI (Return on Investment) for energy efficiency measures how quickly the energy savings will pay for the upfront cost of the new appliance. After the payback period, the savings represent pure financial gain." },
    { question: "How do I find my electricity rate?", answer: "Look at your recent electric bill. Find the total amount charged for electricity and divide it by the total kWh used. The US average is around $0.15 to $0.17 per kWh, but it varies widely by region." },
    { question: "Are energy-efficient appliances worth it?", answer: "Yes, especially for appliances that run constantly (like refrigerators) or use heating elements (like dryers and water heaters). The long-term energy savings often exceed the initial purchase price." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Energy Efficiency ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Energy Efficiency ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Zap className="h-5 w-5 text-primary" /> Appliance Specs
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Old Appliance Wattage</label>
                    <div className="relative">
                      <input type="number" value={currentWattage} onChange={(e) => setCurrentWattage(e.target.value)} className="input-calc" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">W</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">New Appliance Wattage</label>
                    <div className="relative">
                      <input type="number" value={newWattage} onChange={(e) => setNewWattage(e.target.value)} className="input-calc" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">W</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Hours Used Per Day</label>
                    <input type="number" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} className="input-calc" />
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <DollarSign className="h-5 w-5 text-primary" /> Financial Details
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Cost per kWh ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                      <input type="number" step="0.01" value={costPerKwh} onChange={(e) => setCostPerKwh(e.target.value)} className="input-calc pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Cost of New Appliance ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                      <input type="number" value={newApplianceCost} onChange={(e) => setNewApplianceCost(e.target.value)} className="input-calc pl-8" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold">
                      <RotateCcw className="h-5 w-5" /> Reset Values
                    </button>
                  </div>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && results.annualSavingsDollars > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-3">Return on Investment</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Payback Period</p>
                    <p className="text-3xl font-black text-foreground">{results.paybackYears.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Years</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Annual Savings</p>
                    <p className="text-3xl font-black text-emerald-700">${results.annualSavingsDollars.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Energy Saved</p>
                    <p className="text-3xl font-black text-foreground">{results.annualSavingsKwh.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">kWh/yr</span></p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Clock className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-1 text-sm uppercase tracking-wider">Operating Costs</h3>
                      <p className="text-xs text-muted-foreground">Compare the annual cost to run both appliances.</p>
                    </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Old Appliance Cost/Year", value: 0, textValue: "$" + results.oldCost.toFixed(2) },
                    { label: "New Appliance Cost/Year", value: 0, textValue: "$" + results.newCost.toFixed(2) },
                    { label: "10-Year Savings", value: 0, textValue: "$" + ((results.annualSavingsDollars * 10) - parseFloat(newApplianceCost)).toFixed(2) },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding Appliance Energy Efficiency</h2>
              <p>Upgrading to energy-efficient appliances is one of the most effective ways to reduce your household's carbon footprint and save money on electricity bills. Modern appliances, especially those with the ENERGY STAR label, use significantly less energy than models built just a decade ago.</p>
              
              <h3>The Hidden Cost of Old Appliances</h3>
              <p>While an old, functioning refrigerator might seem "free," its operating costs are heavily impacting your electric bill. An inefficient refrigerator from the 1990s can use three times as much electricity as a modern, efficient equivalent.</p>

              <h3>What is a Payback Period?</h3>
              <p>The payback period is the time it takes for the energy savings to equal the cost of the new appliance. For example, if a new washing machine costs $800 but saves you $100 a year in electricity and water, the payback period is 8 years. If the appliance lasts 12 years, you will enjoy 4 years of pure profit.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/energy-efficient-appliance" />
          <PopularCalculators exclude="/calculator/energy-efficient-appliance-calculator" />
        </div>
      </div>
    </>
  );
};

export default EnergyEfficientApplianceCalculator;

