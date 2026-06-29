"use client";
import { RotateCcw, Globe, Utensils, Car, Home } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const EcologicalFootprintCalculator = () => {
  // Diet
  const [diet, setDiet] = useState("meat_daily"); // meat_daily, meat_often, vegetarian, vegan
  // Housing
  const [houseSize, setHouseSize] = useState("medium"); // small, medium, large, xl
  const [householdSize, setHouseholdSize] = useState("2");
  // Transport
  const [driveHours, setDriveHours] = useState("10"); // per week
  const [flightHours, setFlightHours] = useState("4"); // per year
  // Consumption
  const [shoppingHabits, setShoppingHabits] = useState("average"); // minimalist, average, high

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    // Base footprint in global hectares (gha)
    let gha = 1.0; 

    // Diet impact
    if (diet === "meat_daily") gha += 2.5;
    else if (diet === "meat_often") gha += 1.8;
    else if (diet === "vegetarian") gha += 1.2;
    else if (diet === "vegan") gha += 0.8;

    // Housing impact
    let houseGha = 0;
    if (houseSize === "small") houseGha = 1.0;
    else if (houseSize === "medium") houseGha = 1.5;
    else if (houseSize === "large") houseGha = 2.5;
    else if (houseSize === "xl") houseGha = 3.5;
    
    // Divide house impact by people living there
    const people = parseFloat(householdSize) || 1;
    gha += (houseGha / Math.max(1, people));

    // Transport impact
    const drive = parseFloat(driveHours) || 0;
    gha += (drive * 0.1); // rough estimate: 0.1 gha per hour driven a week
    
    const flight = parseFloat(flightHours) || 0;
    gha += (flight * 0.05);

    // Shopping
    if (shoppingHabits === "minimalist") gha += 0.5;
    else if (shoppingHabits === "average") gha += 1.5;
    else if (shoppingHabits === "high") gha += 3.0;

    // Global Earth equivalent (1 Earth = ~1.6 gha per person based on biocapacity)
    const earthEquivalent = gha / 1.6;

    setResults({
      gha,
      earthEquivalent,
      breakdown: {
        diet: diet.includes("meat") ? 35 : 20,
        housing: 25,
        transport: 30,
        goods: 10
      }
    });
  };

  const reset = () => {
    setDiet("meat_daily");
    setHouseSize("medium");
    setHouseholdSize("2");
    setDriveHours("10");
    setFlightHours("4");
    setShoppingHabits("average");
  };

  const faqs = [
    { question: "What is an Ecological Footprint?", answer: "The Ecological Footprint measures how much biologically productive land and water area an individual, a city, a country, or humanity uses to produce the resources it consumes and to absorb the waste it generates." },
    { question: "What is a global hectare (gha)?", answer: "A global hectare is a biologically productive hectare with world average biological productivity for a given year. It is the standardized unit used to measure ecological footprints." },
    { question: "How many 'Earths' are available?", answer: "We only have one Earth. However, if everyone lived like the average resident of a high-income country (like the US or Canada), it would take 4 to 5 Earths to sustainably support the global population." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ecological Footprint Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ecological Footprint</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Utensils className="h-5 w-5 text-primary" /> Diet & Goods
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Diet Type</label>
                    <select value={diet} onChange={(e) => setDiet(e.target.value)} className="input-calc">
                      <option value="meat_daily">Meat Daily (High Impact)</option>
                      <option value="meat_often">Meat 2-3 Times a Week</option>
                      <option value="vegetarian">Vegetarian (No Meat)</option>
                      <option value="vegan">Vegan (No Animal Products)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Shopping Habits</label>
                    <select value={shoppingHabits} onChange={(e) => setShoppingHabits(e.target.value)} className="input-calc">
                      <option value="minimalist">Minimalist (Second-hand mostly)</option>
                      <option value="average">Average (Replace things when broken)</option>
                      <option value="high">High (Buy new trends often)</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Home className="h-5 w-5 text-primary" /> Housing
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">House Size</label>
                    <select value={houseSize} onChange={(e) => setHouseSize(e.target.value)} className="input-calc">
                      <option value="small">Small (Apartment/Condo)</option>
                      <option value="medium">Medium (Avg Suburban Home)</option>
                      <option value="large">Large (4+ Bedrooms)</option>
                      <option value="xl">Extra Large / Mansion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">People in Household</label>
                    <input type="number" value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} className="input-calc" min="1" />
                  </div>
                </section>

                <section className="space-y-6 sm:col-span-2 border-t border-border pt-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Car className="h-5 w-5 text-primary" /> Transportation
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Hours Driven Per Week</label>
                      <input type="number" value={driveHours} onChange={(e) => setDriveHours(e.target.value)} className="input-calc" min="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Flight Hours Per Year</label>
                      <input type="number" value={flightHours} onChange={(e) => setFlightHours(e.target.value)} className="input-calc" min="0" />
                    </div>
                  </div>
                </section>
              </div>
              <div className="flex gap-3 items-center">
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                   <RotateCcw className="h-4 w-4" /> Reset
                 </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">
                   <Globe className="h-5 w-5 text-primary" /> Your Impact
                </h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">If everyone lived like you, we'd need</p>
                    <p className="text-5xl font-black text-foreground">{results.earthEquivalent.toFixed(1)} <span className="text-2xl font-normal text-muted-foreground">Earths</span></p>
                    <div className="flex gap-1 mt-4 flex-wrap justify-center">
                       {Array.from({ length: Math.ceil(results.earthEquivalent) }).map((_, i) => (
                          <Globe key={i} className={`h-6 w-6 ${i < Math.floor(results.earthEquivalent) ? 'text-emerald-500' : 'text-emerald-500/30'}`} />
                       ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/10 border border-border flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Footprint</p>
                    <p className="text-5xl font-black text-foreground">{results.gha.toFixed(1)}</p>
                    <p className="text-sm font-bold text-muted-foreground mt-2">Global Hectares (gha)</p>
                  </div>
                </div>

                <div className="bg-secondary/5 rounded-2xl p-6 border border-border/50">
                  <ResultDisplay items={[
                    { label: "Global Biocapacity Available per Person", value: 1.6, textValue: "1.6 gha" },
                    { label: "Your Biocapacity Deficit/Surplus", value: 0, textValue: (1.6 - results.gha).toFixed(2) + " gha" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>What is Earth Overshoot Day?</h2>
              <p>Earth Overshoot Day marks the date when humanity's demand for ecological resources and services in a given year exceeds what Earth can regenerate in that year. We maintain this deficit by liquidating stocks of ecological resources and accumulating waste, primarily carbon dioxide in the atmosphere.</p>
              
              <h3>Reducing Your Footprint</h3>
              <ul>
                <li><strong>Food:</strong> Shifting towards plant-based diets highly reduces your footprint, as meat production requires vastly more land and water than crops.</li>
                <li><strong>Energy:</strong> Upgrading home insulation and switching to renewable energy sources slashes your carbon footprint.</li>
                <li><strong>Mobility:</strong> Replacing short car trips with walking or cycling, and using public transit, makes a massive difference.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ecological-footprint" />
          <PopularCalculators exclude="/calculator/ecological-footprint-calculator" />
        </div>
      </div>
    </>
  );
};

export default EcologicalFootprintCalculator;

