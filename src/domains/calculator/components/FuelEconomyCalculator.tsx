"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// 1. TypeScript interfaces
interface FuelEconomyResults {
  usMpg: number;
  ukMpg: number;
  litersPer100km: number;
  kmPerLiter: number;
  distanceMiles: number;
  distanceKm: number;
  fuelUsGal: number;
  fuelLiters: number;
  tripCost: number;
  costPerDistance: number;
  costUnit: string;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateFuelEconomy = (inputs: typeof DEFAULTS): FuelEconomyResults => {
  const distance = parseFloat(inputs.distance) || 0;
  const fuel = parseFloat(inputs.fuel) || 0;
  const fuelPrice = parseFloat(inputs.fuelPrice) || 0;

  if (distance <= 0 || fuel <= 0) {
    return {
      usMpg: 0, ukMpg: 0, litersPer100km: 0, kmPerLiter: 0, distanceMiles: 0, distanceKm: 0,
      fuelUsGal: 0, fuelLiters: 0, tripCost: 0, costPerDistance: 0, costUnit: "", chartData: [],
      isError: true, errorMsg: "Distance and fuel must be greater than zero."
    };
  }

  // Convert distance to both Miles and KM
  let distanceMiles = 0;
  let distanceKm = 0;
  if (inputs.distanceUnit === "miles") {
    distanceMiles = distance;
    distanceKm = distance * 1.60934;
  } else {
    distanceKm = distance;
    distanceMiles = distance / 1.60934;
  }

  // Convert fuel to US Gal, UK Gal, and Liters
  let fuelUsGal = 0;
  let fuelUkGal = 0;
  let fuelLiters = 0;
  
  if (inputs.fuelUnit === "us_gal") {
    fuelUsGal = fuel;
    fuelLiters = fuel * 3.78541;
    fuelUkGal = fuel * 0.832674;
  } else if (inputs.fuelUnit === "uk_gal") {
    fuelUkGal = fuel;
    fuelUsGal = fuel / 0.832674;
    fuelLiters = fuel * 4.54609;
  } else if (inputs.fuelUnit === "liters") {
    fuelLiters = fuel;
    fuelUsGal = fuel / 3.78541;
    fuelUkGal = fuel / 4.54609;
  }

  // Calculate Efficiency Metrics
  const usMpg = distanceMiles / fuelUsGal;
  const ukMpg = distanceMiles / fuelUkGal;
  const kmPerLiter = distanceKm / fuelLiters;
  // L/100km = (Liters / KM) * 100
  const litersPer100km = (fuelLiters / distanceKm) * 100;

  // Cost calculation
  const tripCost = fuel * fuelPrice;
  let costPerDistance = 0;
  let costUnit = "";

  if (inputs.distanceUnit === "miles") {
    costPerDistance = tripCost / distanceMiles;
    costUnit = "/ mile";
  } else {
    costPerDistance = tripCost / distanceKm;
    costUnit = "/ km";
  }

  const chartData = [
    { name: "US MPG", value: usMpg, color: "#3b82f6" },
    { name: "UK MPG", value: ukMpg, color: "#8b5cf6" },
    { name: "KM / Liter", value: kmPerLiter, color: "#10b981" },
    { name: "L / 100km", value: litersPer100km, color: "#f59e0b" },
  ];

  return {
    usMpg,
    ukMpg,
    litersPer100km,
    kmPerLiter,
    distanceMiles,
    distanceKm,
    fuelUsGal,
    fuelLiters,
    tripCost,
    costPerDistance,
    costUnit,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  distance: "300",
  distanceUnit: "miles",
  fuel: "12",
  fuelUnit: "us_gal",
  // Advanced
  fuelPrice: "3.50"
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
export default function FuelEconomyCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<FuelEconomyResults>(calculateFuelEconomy(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateFuelEconomy(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateFuelEconomy(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const getPrimaryResult = () => {
    if (inputs.distanceUnit === "km" || inputs.fuelUnit === "liters") {
      return { label: "Liters per 100km", value: results.litersPer100km, unit: "L/100km", smallerIsBetter: true };
    }
    return { label: "US Miles per Gallon", value: results.usMpg, unit: "MPG (US)", smallerIsBetter: false };
  };

  const primaryResult = getPrimaryResult();

  const faqs = [
    { question: "What is the difference between US MPG and UK MPG?", answer: "The Imperial (UK) gallon is roughly 20% larger than the US gallon. One UK gallon is 4.546 liters, while a US gallon is 3.785 liters. Because the UK gallon holds more fuel, a car's UK MPG rating will always be numerically higher than its US MPG rating, even though the actual efficiency of the car is exactly the same." },
    { question: "How does L/100km work?", answer: "While MPG measures 'Distance per unit of Fuel' (higher is better), L/100km measures 'Fuel consumed per fixed Distance' (lower is better). It tells you exactly how many liters of fuel you need to drive 100 kilometers. This is the standard metric used in Europe, Australia, and most of the world outside the US and UK." },
    { question: "Why is my real-world fuel economy worse than advertised?", answer: "Vehicle manufacturers test fuel economy in laboratories under perfect conditions: perfectly flat roads, 70-degree temperatures, no wind, no air conditioning, and slow acceleration. In the real world, you idle in traffic, blast the AC, drive up hills, and accelerate quickly, all of which consume significantly more fuel." },
    { question: "Does driving faster use more fuel?", answer: "Yes, exponentially so. Once you surpass roughly 50-55 mph, aerodynamic drag becomes the dominant force your engine must overcome. Driving 75 mph requires drastically more fuel than driving 55 mph, often reducing your fuel economy by 15% to 25%." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Fuel Economy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fuel Economy Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <CompactInput id="distance" label="Distance Driven" value={inputs.distance} onChange={(v: string) => handleChange("distance", v)} />
                </div>
                <div className="w-[120px]">
                  <CompactInput id="dist-unit" label="Unit" value={inputs.distanceUnit} onChange={(v: string) => handleChange("distanceUnit", v)} options={[
                    { label: "Miles", value: "miles" },
                    { label: "Kilometers", value: "km" }
                  ]} />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <CompactInput id="fuel" label="Fuel Consumed" value={inputs.fuel} onChange={(v: string) => handleChange("fuel", v)} />
                </div>
                <div className="w-[120px]">
                  <CompactInput id="fuel-unit" label="Unit" value={inputs.fuelUnit} onChange={(v: string) => handleChange("fuelUnit", v)} options={[
                    { label: "US Gal", value: "us_gal" },
                    { label: "Liters", value: "liters" },
                    { label: "UK Gal", value: "uk_gal" }
                  ]} />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Trip Cost) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fuel Pricing</div>
                  <CompactInput id="price" label={`Price per ${inputs.fuelUnit === 'liters' ? 'Liter' : 'Gallon'}`} value={inputs.fuelPrice} onChange={(v: string) => handleChange("fuelPrice", v)} prefix="$" tooltip="Enter the price you paid for fuel to calculate total trip cost." />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{primaryResult.label}</div>
                  <div className="text-5xl font-bold text-primary mb-1">{primaryResult.value.toFixed(1)} {primaryResult.unit}</div>
                  <div className="text-sm text-muted-foreground">{primaryResult.smallerIsBetter ? "For L/100km, a lower number means better fuel efficiency." : "For MPG, a higher number means better fuel efficiency."}</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">US MPG</div>
                    <div className="text-lg font-bold text-[#3b82f6]">{results.usMpg.toFixed(1)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">UK MPG</div>
                    <div className="text-lg font-bold text-[#8b5cf6]">{results.ukMpg.toFixed(1)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Liters/100km</div>
                    <div className="text-lg font-bold text-[#f59e0b]">{results.litersPer100km.toFixed(1)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Conversion Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium text-foreground">{results.distanceMiles.toFixed(1)} miles / {results.distanceKm.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Fuel Consumed</span>
                      <span className="font-medium text-foreground">{results.fuelUsGal.toFixed(2)} US Gal / {results.fuelLiters.toFixed(2)} Liters</span>
                    </div>
                    {results.tripCost > 0 && (
                      <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                        <span>Total Trip Cost</span>
                        <span className="text-primary">{formatCurrency(results.tripCost)} <span className="text-sm font-normal text-muted-foreground ml-1">({formatCurrency(results.costPerDistance)} {results.costUnit})</span></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Efficiency Metrics Comparison</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} width={100} />
                        <RechartsTooltip formatter={(value: number) => value.toFixed(1)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Note: MPG and KM/L are "higher is better". L/100km is "lower is better".</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Fuel Economy Calculator?</h2>
            <p>A Fuel Economy Calculator is a universal conversion and efficiency tool that bridges the gap between different global measurement systems. While the United States measures fuel efficiency in <strong>Miles Per Gallon (US MPG)</strong>, Europe and much of the world use <strong>Liters per 100 Kilometers (L/100km)</strong>, and the United Kingdom uses the slightly different <strong>Imperial MPG (UK MPG)</strong>. This calculator instantly processes your raw trip data (distance and fuel burned) and converts it across all these formats simultaneously.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the Different Metrics</h2>
            <p>There are two fundamentally different ways to express fuel efficiency. The US and UK use the "Distance per Volume" method (MPG). In this system, a higher number is always better, because you are driving further on the same amount of fuel. Europe uses the "Volume per Distance" method (L/100km). In this system, a lower number is better, because it means you consumed fewer liters of fuel to travel a fixed 100-kilometer distance.</p>

            <h2 className="text-2xl font-bold mb-3">Why US MPG and UK MPG are Different</h2>
            <p>It is a common point of confusion when Americans and Britons compare car efficiencies online. A British driver might boast that their car gets 40 MPG, while the exact same car in America is rated for 33 MPG. Neither is lying. The Imperial Gallon (used in the UK) contains exactly 4.54609 liters of fluid. The US Liquid Gallon contains only 3.78541 liters. Because the UK gallon is 20% physically larger, a car will always drive 20% further on a UK gallon than a US gallon.</p>

            <h2 className="text-2xl font-bold mb-3">How to Use This Tool</h2>
            <p>Simply enter the distance you drove and the amount of fuel you burned. You do not need to do any conversions yourself. If you rented a car in Germany and drove 400 kilometers and put in 35 liters of gas, enter those exact numbers. The calculator will tell you that you achieved 8.75 L/100km, which translates to exactly 26.8 US MPG.</p>

            <h2 className="text-2xl font-bold mb-3">The Cost of Fuel</h2>
            <p>By utilizing the Advanced Options, you can enter the price you paid for fuel (either per Gallon or per Liter). The calculator will immediately output your <strong>Total Trip Cost</strong> and your <strong>Cost per Mile (or KM)</strong>. This is incredibly useful for splitting gas money on a road trip or expensing mileage for business purposes.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The European Vacation.</strong> You rent a car in France. The dashboard says you are getting 6.5 L/100km. You want to know what that means in American terms. You input a theoretical 100 km distance and 6.5 liters of fuel. The calculator immediately reveals this is a highly efficient 36.1 US MPG.</p>
            <p><strong>Example 2: The Canadian Commute.</strong> You live in Canada, where distance is measured in kilometers but cars are often still discussed in MPG due to US influence. You drive 500 kilometers and fill up with 45 liters of gas. The calculator shows you used 11.88 US Gallons and achieved 26.1 US MPG.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>To get the most accurate baseline for your car, perform the calculation over a long distance (e.g., an entire tank of gas rather than a 10-mile trip). Small variations in how the gas pump clicks off can skew your results significantly on short trips. Furthermore, use this calculator to verify your car's dashboard computer. Many modern vehicles will display an estimated L/100km or MPG on the screen, but these digital estimates are notoriously optimistic compared to hard math at the pump.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fuel-economy-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
