"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// 1. TypeScript interfaces
interface MPGResults {
  mpg: number;
  costPerMile: number;
  totalTripCost: number;
  rangePerTank: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateMPG = (inputs: typeof DEFAULTS): MPGResults => {
  const distanceType = inputs.distanceType;
  let distance = 0;
  
  if (distanceType === "trip") {
    distance = parseFloat(inputs.tripDistance) || 0;
  } else {
    const currentOdo = parseFloat(inputs.currentOdo) || 0;
    const previousOdo = parseFloat(inputs.previousOdo) || 0;
    distance = currentOdo - previousOdo;
  }

  const gallonsUsed = parseFloat(inputs.gallonsUsed) || 0;
  const pricePerGallon = parseFloat(inputs.pricePerGallon) || 0;
  
  // Advanced
  const tankCapacity = parseFloat(inputs.tankCapacity) || 0;

  if (distance <= 0 || gallonsUsed <= 0) {
    return {
      mpg: 0, costPerMile: 0, totalTripCost: 0, rangePerTank: 0, chartData: [],
      isError: true, errorMsg: "Distance and gallons used must be greater than zero."
    };
  }

  const mpg = distance / gallonsUsed;
  const totalTripCost = gallonsUsed * pricePerGallon;
  const costPerMile = totalTripCost / distance;
  
  const rangePerTank = tankCapacity > 0 ? mpg * tankCapacity : 0;

  // Extrapolate costs for the chart
  // Assuming this MPG and price, what does driving cost?
  // Let's assume an average person drives 15,000 miles a year (roughly 41 miles a day)
  const dailyMiles = 41;
  const weeklyMiles = dailyMiles * 7;
  const monthlyMiles = dailyMiles * 30.4;
  const yearlyMiles = 15000;

  const chartData = [
    { name: "Daily", cost: costPerMile * dailyMiles, color: "#94a3b8" },
    { name: "Weekly", cost: costPerMile * weeklyMiles, color: "#10b981" },
    { name: "Monthly", cost: costPerMile * monthlyMiles, color: "#3b82f6" },
    { name: "Yearly", cost: costPerMile * yearlyMiles, color: "#f59e0b" },
  ];

  return {
    mpg,
    costPerMile,
    totalTripCost,
    rangePerTank,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  distanceType: "trip", // "trip" or "odo"
  tripDistance: "300",
  previousOdo: "45000",
  currentOdo: "45300",
  gallonsUsed: "12",
  pricePerGallon: "3.50",
  // Advanced
  tankCapacity: "16"
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
export default function MilesPerGallonCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<MPGResults>(calculateMPG(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateMPG(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateMPG(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const getDistance = () => {
    if (inputs.distanceType === "trip") return parseFloat(inputs.tripDistance) || 0;
    return (parseFloat(inputs.currentOdo) || 0) - (parseFloat(inputs.previousOdo) || 0);
  };

  const faqs = [
    { question: "How do I calculate MPG accurately?", answer: "The most accurate method is the 'fill-up' method. Fill your gas tank completely until the pump clicks off automatically. Reset your trip odometer to zero. Drive normally until you need gas again. Return to the station, fill the tank completely again. Look at the pump to see exactly how many gallons it took to refill the tank, and divide your trip odometer distance by those gallons." },
    { question: "Why is my real MPG lower than the sticker MPG?", answer: "The EPA window sticker numbers are calculated in a laboratory under perfectly controlled conditions. Real-world driving involves rapid acceleration, heavy traffic, aerodynamic drag from high speeds, varying terrain, and using the air conditioner—all of which decrease fuel efficiency." },
    { question: "Does using the AC lower MPG?", answer: "Yes. Running the air conditioning compressor requires mechanical energy from the engine, which uses extra gas. At low speeds, running the AC can lower fuel economy by 10-20%. However, at highway speeds, running the AC is actually more efficient than rolling the windows down, because open windows create massive aerodynamic drag." },
    { question: "Why is highway MPG higher than city MPG?", answer: "In the city, you are constantly stopping and accelerating. It takes a massive amount of energy to get a 3,000-pound vehicle moving from a dead stop. On the highway, you are maintaining momentum, which requires significantly less energy. However, if you drive too fast (e.g., 80 mph), aerodynamic drag takes over and destroys your highway MPG." },
    { question: "Does idling waste a lot of gas?", answer: "Yes. A modern car gets 0 MPG when idling and burns roughly a half-gallon to a full gallon of gas per hour just sitting still. If you are stopped for more than 30 seconds, it is more fuel-efficient to turn the engine off and restart it than to let it idle." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Miles Per Gallon (MPG) Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Miles Per Gallon (MPG) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">How do you want to enter distance?</label>
              <div className="flex rounded-md border border-input bg-muted/50 p-1 mb-2">
                <button type="button" onClick={() => handleChange("distanceType", "trip")} className={`flex-1 text-sm font-medium h-8 rounded-sm transition-all ${inputs.distanceType === "trip" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Trip Odometer</button>
                <button type="button" onClick={() => handleChange("distanceType", "odo")} className={`flex-1 text-sm font-medium h-8 rounded-sm transition-all ${inputs.distanceType === "odo" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Total Odometer</button>
              </div>
              
              {inputs.distanceType === "trip" ? (
                <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={inputs.tripDistance} onChange={e => handleChange("tripDistance", e.target.value)} className="w-full h-full px-4 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-4 text-primary font-bold text-sm uppercase">Miles</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput id="prev-odo" label="Previous Odometer" value={inputs.previousOdo} onChange={(v: string) => handleChange("previousOdo", v)} />
                  <CompactInput id="curr-odo" label="Current Odometer" value={inputs.currentOdo} onChange={(v: string) => handleChange("currentOdo", v)} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <CompactInput id="gallons" label="Gallons to Refill" value={inputs.gallonsUsed} onChange={(v: string) => handleChange("gallonsUsed", v)} suffix="gal" tooltip="The exact amount of fuel required to refill the tank." />
              <CompactInput id="price" label="Price per Gallon" value={inputs.pricePerGallon} onChange={(v: string) => handleChange("pricePerGallon", v)} prefix="$" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Tank Range) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="capacity" label="Total Fuel Tank Capacity" value={inputs.tankCapacity} onChange={(v: string) => handleChange("tankCapacity", v)} suffix="gal" tooltip="Check your owner's manual for exact tank size." />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate MPG
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Fuel Economy</div>
                  <div className="text-5xl font-bold text-primary mb-1">{results.mpg.toFixed(1)} MPG</div>
                  <div className="text-sm text-muted-foreground">You drove {getDistance().toFixed(1)} miles on {inputs.gallonsUsed} gallons of gas.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cost Per Mile</div>
                    <div className="text-lg font-bold text-destructive">{formatCurrency(results.costPerMile)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Trip Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.totalTripCost)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Max Tank Range</div>
                    <div className="text-lg font-bold text-[#10b981]">{results.rangePerTank > 0 ? `${Math.round(results.rangePerTank)} mi` : 'N/A'}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Estimated Future Fuel Costs</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                        <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Assuming an average driving habit of 15,000 miles per year.</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an MPG Calculator?</h2>
            <p>A Miles Per Gallon (MPG) Calculator is the most fundamental tool for tracking the health, efficiency, and operating cost of an internal combustion engine vehicle. It tells you exactly how many miles your car travels for every single gallon of gasoline it burns. While most modern cars have a digital dashboard that displays an estimated MPG, those onboard computers are notoriously inaccurate, often overestimating efficiency by 5% to 10% to make the driver feel better. This calculator relies on hard math based on actual fuel consumption.</p>

            <h2>How It Works</h2>
            <p>The calculation is stunningly simple: <strong>MPG = Total Distance Driven / Gallons Used</strong>. To use this effectively, you must employ the "Fill-Up Method." First, you fill your gas tank until the pump clicks off. You reset your trip odometer to zero. You drive until the tank is nearly empty. You return to the gas station and fill the tank until the pump clicks off again. The number of gallons displayed on the pump is exactly how much fuel you burned. The distance on your trip odometer is exactly how far you drove. Divide the distance by the gallons, and you have your true, real-world MPG.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Fuel Economy</strong> number is your baseline. If your car is rated for 25 MPG but you are only getting 18 MPG, there is a problem with either your driving habits or the vehicle's mechanics. We also calculate your <strong>Cost Per Mile</strong>. If gas is $3.50 a gallon and you get 20 MPG, it costs you roughly $0.17 every time your odometer ticks up one mile. This allows you to accurately budget for long road trips and daily commutes.</p>

            <h2>Key Factors That Destroy MPG</h2>
            <p><strong>Speed and Aerodynamics:</strong> Drag increases exponentially with speed. Driving 75 mph instead of 65 mph can reduce your fuel economy by over 15% because the engine has to work significantly harder to push the vehicle through the air. <strong>Aggressive Driving:</strong> Flooring the accelerator at green lights and slamming the brakes dumps raw fuel into the engine cylinders for maximum power, destroying efficiency. <strong>Maintenance Issues:</strong> Under-inflated tires increase rolling resistance. A clogged engine air filter starves the engine of oxygen, forcing it to burn more fuel to maintain power.</p>

            <h2>Advanced Features</h2>
            <p>By entering your <strong>Total Fuel Tank Capacity</strong> in the Advanced Options, the calculator will extrapolate your <strong>Max Tank Range</strong>. If you average 25 MPG and have a 16-gallon tank, your theoretical maximum range is 400 miles. Understanding this number is critical for planning road trips through desolate areas where gas stations are scarce. Never push your car to its absolute theoretical limit, as fuel pumps rely on the gasoline surrounding them to stay cool; running the tank completely dry can permanently damage the fuel pump.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Daily Commute.</strong> John drives 300 miles a week. He fills up his tank, and the pump says 12 gallons. His math is 300 / 12 = 25 MPG. If gas is $3.50, his weekly commute costs him $42.00, or about $0.14 per mile.</p>
            <p><strong>Example 2: The Cross-Country Road Trip.</strong> Sarah is planning a 1,200-mile road trip. She drives a large SUV that gets 15 MPG. She knows gas averages $3.80 along her route. Because she knows her exact MPG, she can budget precisely: (1,200 / 15) * $3.80 = $304.00 in fuel costs.</p>

            <h2>Tips & Best Practices</h2>
            <p>Do not trust your car's dashboard computer. Always manually calculate your MPG every few fill-ups. A sudden, unexplained drop in MPG is often the very first warning sign of a mechanical failure, such as a dying oxygen sensor, a stuck brake caliper, or an engine misfire. If your MPG drops by 10% or more and your driving habits haven't changed, take the car to a mechanic immediately.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/miles-per-gallon-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
