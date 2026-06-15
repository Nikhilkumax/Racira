"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface EVRangeResults {
  realWorldRange: number;
  highwayRange: number;
  cityRange: number;
  coldWeatherRange: number;
  breakdown: {
    epaRange: number;
    degradationLoss: number;
    tempLoss: number;
    speedLoss: number;
    hvacLoss: number;
    otherLoss: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateEVRange = (inputs: typeof DEFAULTS): EVRangeResults => {
  const epaRange = parseFloat(inputs.epaRange) || 0;
  const batteryAge = parseFloat(inputs.batteryAge) || 0;
  const temperature = parseFloat(inputs.temperature) || 70;
  const avgSpeed = parseFloat(inputs.avgSpeed) || 60;
  const hvacLevel = inputs.hvacLevel as "off" | "low" | "high";
  
  // Advanced
  const payloadWeight = parseFloat(inputs.payloadWeight) || 0;
  const elevationChange = parseFloat(inputs.elevationChange) || 0;

  if (epaRange <= 0) {
    return {
      realWorldRange: 0, highwayRange: 0, cityRange: 0, coldWeatherRange: 0,
      breakdown: { epaRange: 0, degradationLoss: 0, tempLoss: 0, speedLoss: 0, hvacLoss: 0, otherLoss: 0 },
      isError: true, errorMsg: "EPA range must be greater than zero."
    };
  }

  // 1. Battery Degradation (Avg 2% per year)
  const degradationPct = batteryAge * 0.02;
  const degradationLoss = epaRange * degradationPct;
  const degradedCapacityRange = epaRange - degradationLoss;

  // 2. Temperature Impact
  // Optimal temp is around 70F. Cold severely impacts batteries. Extreme heat impacts slightly.
  let tempMultiplier = 1.0;
  if (temperature < 70) {
    // Roughly 1% drop per 2 degrees below 70, capping at 40% loss
    const diff = 70 - temperature;
    tempMultiplier = Math.max(0.60, 1 - (diff * 0.005));
  } else if (temperature > 85) {
    // Slight drop for heat
    const diff = temperature - 85;
    tempMultiplier = Math.max(0.90, 1 - (diff * 0.002));
  }
  const tempLoss = degradedCapacityRange * (1 - tempMultiplier);
  const rangeAfterTemp = degradedCapacityRange - tempLoss;

  // 3. Speed Impact
  // EPA highway test averages 48mph. Going 75mph destroys EV range.
  let speedMultiplier = 1.0;
  if (avgSpeed > 50) {
    // Roughly 1.5% loss for every 1 mph over 50
    const diff = avgSpeed - 50;
    speedMultiplier = Math.max(0.50, 1 - (diff * 0.015));
  } else if (avgSpeed < 40 && avgSpeed > 15) {
    // EVs do BETTER in city traffic due to regen braking
    speedMultiplier = 1.10; 
  }
  const speedLoss = rangeAfterTemp * (1 - speedMultiplier);
  const rangeAfterSpeed = rangeAfterTemp - speedLoss;

  // 4. HVAC Impact
  let hvacMultiplier = 1.0;
  if (hvacLevel === "high") hvacMultiplier = 0.85; // 15% loss
  else if (hvacLevel === "low") hvacMultiplier = 0.95; // 5% loss
  
  // Heating is worse than AC, so if it's cold AND high HVAC, it's brutal.
  if (temperature < 40 && hvacLevel !== "off") {
    hvacMultiplier -= 0.10; // Extra 10% penalty for resistive heating
  }
  
  const hvacLoss = rangeAfterSpeed * (1 - hvacMultiplier);
  const rangeAfterHvac = rangeAfterSpeed - hvacLoss;

  // 5. Advanced Impacts (Payload and Elevation)
  // 1% loss per 100 lbs over standard
  const weightMultiplier = Math.max(0.80, 1 - ((payloadWeight / 100) * 0.01));
  // Huge loss for uphill. 1 mile range lost per 100 ft elevation gain (rough estimate)
  const elevationLossRaw = elevationChange > 0 ? (elevationChange / 100) * 1.5 : 0;
  
  const rangeAfterWeight = rangeAfterHvac * weightMultiplier;
  let finalRealWorldRange = rangeAfterWeight - elevationLossRaw;
  if (finalRealWorldRange < 0) finalRealWorldRange = 0;

  const otherLoss = rangeAfterHvac - finalRealWorldRange;

  // Baseline Scenarios for the 3-Stat bar
  // Highway = Base EPA, current age, 70mph, low HVAC, 70F
  const hwSpeedMult = 1 - (20 * 0.015);
  const highwayRange = degradedCapacityRange * hwSpeedMult * 0.95; // 5% hvac loss

  // City = Base EPA, current age, 30mph, low HVAC, 70F
  const cityRange = degradedCapacityRange * 1.10 * 0.95;

  // Cold = Base EPA, current age, 60mph, high HVAC, 20F
  const coldTempMult = Math.max(0.60, 1 - (50 * 0.005));
  const coldSpeedMult = 1 - (10 * 0.015);
  const coldHvacMult = 0.85 - 0.10; // Extra penalty for heat
  const coldWeatherRange = degradedCapacityRange * coldTempMult * coldSpeedMult * coldHvacMult;

  return {
    realWorldRange: finalRealWorldRange,
    highwayRange,
    cityRange,
    coldWeatherRange,
    breakdown: {
      epaRange,
      degradationLoss,
      tempLoss,
      speedLoss: speedLoss < 0 ? 0 : speedLoss, // Can be negative if city driving
      hvacLoss,
      otherLoss
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  epaRange: "250",
  batteryAge: "3",
  temperature: "70",
  avgSpeed: "65",
  hvacLevel: "low",
  // Advanced
  payloadWeight: "0",
  elevationChange: "0"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function EVRangeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<EVRangeResults>(calculateEVRange(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateEVRange(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateEVRange(DEFAULTS));
  };

  const barData = results.isError ? [] : [
    { name: "Ideal / EPA", value: results.breakdown.epaRange, color: "#94a3b8" },
    { name: "City (Stop & Go)", value: results.cityRange, color: "#10b981" },
    { name: "Highway (70mph)", value: results.highwayRange, color: "#3b82f6" },
    { name: "Your Custom Scenario", value: results.realWorldRange, color: "#f59e0b" },
    { name: "Freezing Cold", value: results.coldWeatherRange, color: "#ef4444" },
  ];

  const faqs = [
    { question: "Why is my real EV range lower than the advertised EPA range?", answer: "The EPA test cycle is highly optimistic. It tests vehicles in perfect 70-degree weather with the AC turned off, and the 'highway' portion of the test averages only 48 mph. In the real world, you drive 70+ mph with the AC blasting, which drains the battery significantly faster." },
    { question: "Why does driving fast kill EV range?", answer: "Aerodynamic drag increases exponentially with speed. Pushing a car through the air at 75 mph requires drastically more energy than at 55 mph. While gas cars also lose efficiency at high speeds, they have multiple gears to keep engine RPMs low. Most EVs only have one gear, meaning the electric motor must spin incredibly fast at highway speeds, consuming massive amounts of power." },
    { question: "Why is EV range so bad in the winter?", answer: "Lithium-ion batteries rely on chemical reactions that slow down in freezing temperatures, temporarily reducing the battery's capacity to discharge energy. Furthermore, unlike gas engines that generate massive amounts of waste heat to warm the cabin for free, EVs must use precious battery power to run electric heaters, which is a massive drain on the system." },
    { question: "Do EVs really get better range in the city?", answer: "Yes! Because of regenerative braking. When you take your foot off the accelerator in city traffic, the electric motor acts as a generator, capturing the kinetic energy of the car slowing down and feeding it directly back into the battery. This makes stop-and-go city driving incredibly efficient for EVs." },
    { question: "How much range does a battery lose over time?", answer: "On average, a modern EV battery degrades by about 2% per year. A 5-year-old EV will typically have about 90% of its original battery capacity remaining." },
    { question: "Does using the AC affect range?", answer: "Yes, running the air conditioning or heating requires energy from the high-voltage battery. Running the AC typically reduces range by 5-10%, while running resistive heating in the winter can reduce range by 10-20%." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "EV Range Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV Range Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Advertised EPA Range</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <input type="number" value={inputs.epaRange} onChange={e => handleChange("epaRange", e.target.value)} className="w-full h-full px-4 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
                <span className="pr-4 text-primary font-bold text-sm uppercase">Miles</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="battery-age" label="Battery Age" value={inputs.batteryAge} onChange={(v: string) => handleChange("batteryAge", v)} suffix="years" />
              <CompactInput id="temperature" label="Outside Temp" value={inputs.temperature} onChange={(v: string) => handleChange("temperature", v)} suffix="°F" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="avg-speed" label="Average Speed" value={inputs.avgSpeed} onChange={(v: string) => handleChange("avgSpeed", v)} suffix="mph" tooltip="Cruising speed drastically alters range" />
              <CompactInput id="hvac-level" label="Climate Control" value={inputs.hvacLevel} onChange={(v: string) => handleChange("hvacLevel", v)} options={[
                { label: "Off (Windows Up)", value: "off" },
                { label: "Low (Normal A/C)", value: "low" },
                { label: "High (Max Heat/AC)", value: "high" }
              ]} />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Weight & Elevation) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="payload" label="Extra Passenger/Cargo Wt" value={inputs.payloadWeight} onChange={(v: string) => handleChange("payloadWeight", v)} suffix="lbs" />
                  <CompactInput id="elevation" label="Net Elevation Change" value={inputs.elevationChange} onChange={(v: string) => handleChange("elevationChange", v)} suffix="ft" tooltip="Enter positive number for uphill gain" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Real Range
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Real-World Range</div>
                  <div className="text-5xl font-bold text-primary mb-1">{Math.round(results.realWorldRange)} Miles</div>
                  <div className="text-sm text-muted-foreground">Based on your specific driving speed, weather, and battery health.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">City (Stop & Go)</div>
                    <div className="text-lg font-bold text-emerald-600">{Math.round(results.cityRange)} mi</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Highway (70mph)</div>
                    <div className="text-lg font-bold text-foreground">{Math.round(results.highwayRange)} mi</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Freezing (20°F)</div>
                    <div className="text-lg font-bold text-red-500">{Math.round(results.coldWeatherRange)} mi</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Scenario Comparison</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} mi`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => `${Math.round(value)} Miles`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Range Loss Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Original EPA Range</span>
                      <span className="font-medium text-foreground">{inputs.epaRange} Miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Battery Age Degradation</span>
                      <span className="font-medium text-red-500">-{Math.round(results.breakdown.degradationLoss)} Miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Temperature Impact</span>
                      <span className="font-medium text-red-500">-{Math.round(results.breakdown.tempLoss)} Miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Highway Speed Aerodynamics</span>
                      <span className="font-medium text-red-500">-{Math.round(results.breakdown.speedLoss)} Miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Climate Control (HVAC)</span>
                      <span className="font-medium text-red-500">-{Math.round(results.breakdown.hvacLoss)} Miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">Payload & Elevation</span>
                      <span className="font-medium text-red-500">-{Math.round(results.breakdown.otherLoss)} Miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Final Available Range</span>
                      <span className="text-primary">{Math.round(results.realWorldRange)} Miles</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is an EV Range Calculator?</h2>
            <p>An EV Range Calculator is a predictive tool that models the real-world driving range of an Electric Vehicle based on environmental and driving conditions. The range sticker plastered on the window of a new EV at the dealership is the official EPA estimate. However, this number is notoriously optimistic, acting more as a theoretical maximum under laboratory conditions than a practical guarantee. By inputting your actual driving speed, local weather, and battery age, this calculator strips away the marketing fluff to reveal exactly how far you can drive before you are stranded.</p>

            <h2>How It Works</h2>
            <p>Our algorithm starts with your vehicle's advertised EPA range and systematically subtracts mileage based on known lithium-ion battery physics. First, it accounts for <strong>Battery Degradation</strong>, stripping away roughly 2% capacity for every year of the battery's age. Next, it calculates the <strong>Temperature Impact</strong>. Below 70°F, lithium-ion cells lose their ability to discharge efficiently, dropping available capacity. Then, it assesses <strong>Aerodynamic Drag</strong>. Because drag increases exponentially with speed, driving 75 mph consumes massively more battery power than driving 55 mph. Finally, it subtracts parasitic draw from the <strong>HVAC system</strong> (heating and air conditioning).</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Estimated Real-World Range</strong> is your personalized, practical limit for a single trip under the exact conditions you specified. Do not plan a road trip using the EPA number; use this number instead. We also provide three vital benchmarks: <strong>City Range</strong> (which is often higher than EPA due to regenerative braking), <strong>Highway Range</strong> (cruising at 70 mph in perfect weather), and the dreaded <strong>Freezing Range</strong> (driving in winter weather with the heater on, which represents the worst-case scenario for any EV).</p>

            <h2>Key Factors</h2>
            <p><strong>Average Speed</strong> is the silent killer of EV range. Gas cars have complex transmissions with overdrive gears to keep the engine RPMs low at highway speeds. Most EVs have a single-speed transmission. When you drive 80 mph, the electric motor is screaming at maximum output to overcome immense wind resistance. <strong>Temperature</strong> is the second most critical factor. Freezing weather not only slows the chemical reactions inside the battery, but it forces the car to use massive amounts of energy to run an electric cabin heater (unlike a gas car, which uses free waste heat from the engine).</p>

            <h2>Advanced Features</h2>
            <p>For those planning serious road trips or hauling gear, the Advanced Options reveal even more range loss. <strong>Payload Weight</strong> is factored in; a family of four with luggage requires more energy to move than a single commuter. <strong>Elevation Change</strong> is brutal on EVs. If you are driving up a mountain pass, you are fighting gravity. While you will gain some energy back via regenerative braking on the way down, the immense energy required to climb cannot be fully recovered.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Perfect Commute.</strong> John drives a 3-year-old EV with an EPA range of 250 miles. He commutes in 70-degree weather at 40 mph through the city with minimal AC. His real-world range is actually <em>higher</em> than the EPA estimate, hovering around 260 miles due to the efficiency of regenerative braking at slow speeds.</p>
            <p><strong>Example 2: The Winter Road Trip.</strong> Sarah takes that exact same EV on a ski trip. It is 25°F outside. She drives 75 mph on the interstate with the heat blasting. Between the battery age, the cold crippling the chemistry, the massive aerodynamic drag at 75 mph, and the heater pulling thousands of watts, her real-world range collapses to just 135 miles. If she planned her charging stops based on the "250 mile" sticker, she would be stranded.</p>

            <h2>Tips & Best Practices</h2>
            <p>To maximize your EV range on road trips, slow down. Dropping your speed from 75 mph to 65 mph can instantly claw back 10-15% of your range. In the winter, use the seat heaters and steering wheel heaters instead of blasting the cabin air heater, as radiant heat is much more energy-efficient. Finally, pre-condition your car (turn on the heat) while it is still plugged into the charger at home. This warms the battery and the cabin using wall electricity rather than draining the battery before you even leave the driveway.</p>

            <h2>Benefits</h2>
            <p>Using this calculator cures "range anxiety" with hard mathematics. By understanding precisely how your speed, the weather, and your heater interact to drain the battery, you can plan charging stops accurately and avoid the catastrophic scenario of running out of power on a lonely stretch of highway.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ev-range-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
