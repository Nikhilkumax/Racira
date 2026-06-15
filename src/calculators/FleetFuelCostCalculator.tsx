"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Fuel, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// 1. TypeScript interfaces
interface FleetFuelResults {
  totalAnnualCost: number;
  monthlyCost: number;
  costPerVehicleYear: number;
  totalGallons: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateFleetFuel = (inputs: typeof DEFAULTS): FleetFuelResults => {
  const vehicleCount = parseInt(inputs.vehicleCount);
  const avgMilesPerVehicle = parseFloat(inputs.avgMilesPerVehicle);
  const avgFleetMpg = parseFloat(inputs.avgFleetMpg);
  const fuelPrice = parseFloat(inputs.fuelPrice);

  if (isNaN(vehicleCount) || vehicleCount <= 0 || isNaN(avgMilesPerVehicle) || avgMilesPerVehicle <= 0 || 
      isNaN(avgFleetMpg) || avgFleetMpg <= 0 || isNaN(fuelPrice) || fuelPrice <= 0) {
    return {
      totalAnnualCost: 0, monthlyCost: 0, costPerVehicleYear: 0, totalGallons: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // Calculate Gallons used per vehicle per year
  const gallonsPerVehicle = avgMilesPerVehicle / avgFleetMpg;
  
  // Total Gallons for the entire fleet
  const totalGallons = gallonsPerVehicle * vehicleCount;
  
  // Total Costs
  const totalAnnualCost = totalGallons * fuelPrice;
  const monthlyCost = totalAnnualCost / 12;
  const costPerVehicleYear = totalAnnualCost / vehicleCount;

  // Generate chart data: Show Cost breakdown by Time (Monthly vs Annual)
  const chartData = [
    {
      name: "Single Vehicle (Year)",
      "Fuel Cost": Math.round(costPerVehicleYear),
      fill: "hsl(var(--blue-500))"
    },
    {
      name: "Entire Fleet (Month)",
      "Fuel Cost": Math.round(monthlyCost),
      fill: "hsl(var(--orange-500))"
    },
    {
      name: "Entire Fleet (Year)",
      "Fuel Cost": Math.round(totalAnnualCost),
      fill: "hsl(var(--primary))"
    }
  ];

  // Schedule to show the impact of changing fuel prices (+/- $0.50)
  const schedule: any[] = [];
  const priceVariations = [fuelPrice - 1.0, fuelPrice - 0.5, fuelPrice, fuelPrice + 0.5, fuelPrice + 1.0];
  
  priceVariations.forEach((price) => {
    if (price > 0) {
      const pCost = totalGallons * price;
      schedule.push({
        priceStr: `$${price.toFixed(2)}`,
        price: price,
        annualCost: Math.round(pCost),
        variance: Math.round(pCost - totalAnnualCost)
      });
    }
  });

  return {
    totalAnnualCost: Math.round(totalAnnualCost),
    monthlyCost: Math.round(monthlyCost),
    costPerVehicleYear: Math.round(costPerVehicleYear),
    totalGallons: Math.round(totalGallons),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  vehicleCount: "10",
  avgMilesPerVehicle: "25000",
  avgFleetMpg: "15", // Typical delivery box truck or heavy van
  fuelPrice: "4.50"
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function FleetFuelCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<FleetFuelResults>(calculateFleetFuel(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateFleetFuel(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateFleetFuel(DEFAULTS));
  };

  const faqs = [
    { question: "Why is tracking fleet fuel cost so important?", answer: "Fuel is almost always the second-highest operational expense for a delivery or service fleet (right behind driver payroll). Unlike payroll or insurance, which are fixed costs, fuel costs are highly volatile. A sudden $0.50 per gallon spike in fuel prices can instantly wipe out a logistics company's profit margin if they do not have fuel surcharges built into their customer contracts." },
    { question: "How can I improve my Fleet's Average MPG?", answer: "The most effective way to improve fleet MPG is not buying new vehicles; it is changing driver behavior. Aggressive acceleration, hard braking, and excessive idling absolutely destroy fuel economy. Many modern fleets install telematics devices (GPS trackers that plug into the OBD2 port) to monitor and penalize drivers who idle for more than 5 minutes or aggressively speed on the highway." },
    { question: "What is a 'Fuel Surcharge'?", answer: "A fuel surcharge is a dynamic fee that logistics companies add to their customer invoices to protect themselves against volatile oil prices. If the baseline price of diesel is $4.00, the company charges their standard rate. If diesel spikes to $5.00, the contract automatically triggers a surcharge (e.g., an extra 5% fee on the invoice) so the customer absorbs the unpredictable fuel cost, not the fleet owner." },
    { question: "Should my fleet switch to EVs?", answer: "Switching to electric vehicles requires massive upfront capital for both the vehicles themselves and the charging infrastructure at your depot. However, electricity costs are much lower and far more stable than diesel prices. For 'last-mile' delivery fleets (like Amazon vans) that drive predictable, short, low-speed routes every day and return to the depot every night, EVs offer a tremendous long-term return on investment." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Fleet Fuel Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fleet Fuel Cost Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate your company's total annual fuel expenditure and forecast the financial risk of rising gas/diesel prices.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Fleet Specifications</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="count" label="Number of Vehicles" value={inputs.vehicleCount} onChange={(v: string) => handleChange("vehicleCount", v)} placeholder="10" />
              <CompactInput id="mpg" label="Average Fleet MPG" value={inputs.avgFleetMpg} onChange={(v: string) => handleChange("avgFleetMpg", v)} suffix="MPG" placeholder="15" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Usage & Cost</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="miles" label="Avg Miles / Vehicle / Yr" value={inputs.avgMilesPerVehicle} onChange={(v: string) => handleChange("avgMilesPerVehicle", v)} suffix="mi" placeholder="25000" />
              <CompactInput id="fuel" label="Price per Gallon" value={inputs.fuelPrice} onChange={(v: string) => handleChange("fuelPrice", v)} prefix="$" placeholder="4.50" />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: For commercial fleets, use the price of Diesel if applicable, as it is often priced differently than regular Unleaded.
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Annual Fuel Cost</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-xl font-bold text-primary mb-1">$</div>
                      <div className="text-5xl lg:text-6xl font-black text-primary tracking-tighter">{results.totalAnnualCost.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Monthly Budget Required</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-xl font-bold text-muted-foreground mb-1">$</div>
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.monthlyCost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Fleet Size</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.vehicleCount} Vehicles</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Gallons Burned</div>
                    <div className="text-2xl font-bold text-orange-500">{results.totalGallons.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cost Per Vehicle (Yr)</div>
                    <div className="text-2xl font-bold text-emerald-500">${results.costPerVehicleYear.toLocaleString()}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cost Scale Comparison</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Fuel Cost']}
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="Fuel Cost" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {
                            results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Volatility Risk Assessment</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Fuel Price Scenario</th>
                          <th className="px-4 py-3 font-semibold text-right">New Annual Cost</th>
                          <th className="px-4 py-3 font-semibold text-right">Impact to Bottom Line</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.price} className={`hover:bg-muted/20 transition-colors ${row.price === parseFloat(inputs.fuelPrice) ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.priceStr} / gal {row.price === parseFloat(inputs.fuelPrice) ? '(Current)' : ''}</td>
                            <td className="px-4 py-3 text-right text-foreground font-bold">${row.annualCost.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-right font-bold ${row.variance > 0 ? 'text-destructive' : row.variance < 0 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                              {row.variance > 0 ? `-$${Math.abs(row.variance).toLocaleString()} (Loss)` : row.variance < 0 ? `+$${Math.abs(row.variance).toLocaleString()} (Profit)` : 'Baseline'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <h2>The Hidden Danger of Fleet Scaling</h2>
            <p>When a logistics or service business is small (1 or 2 vans), fuel is just a frustrating weekly expense. However, as a fleet scales up to 10, 20, or 50 vehicles, fuel costs silently transform into a massive liability capable of destroying a company's entire profit margin overnight.</p>
            <p>Unlike rent or insurance, which are fixed, predictable costs, fuel is a highly volatile commodity traded on the global market. A geopolitical conflict on the other side of the world can spike diesel prices by $1.00 a gallon in a matter of days. If your fleet burns 50,000 gallons of fuel a year, that sudden $1.00 spike just instantly erased $50,000 from your company's bottom line.</p>

            <h2>Why Idling is the Ultimate Profit Killer</h2>
            <p>When analyzing fleet fuel efficiency, most owners focus on the vehicles themselves (e.g., upgrading older trucks to newer, more aerodynamic models). However, studies show that changing driver behavior yields significantly higher returns on investment. The biggest culprit is idling.</p>
            <p>A heavy-duty diesel delivery truck burns roughly half a gallon of fuel for every hour it spends idling. If a driver leaves the truck running while filling out paperwork, eating lunch, or waiting at a loading dock for 2 hours a day, that driver is burning an extra 5 gallons of fuel per week doing absolutely zero work. Across a 20-truck fleet, that single bad habit costs the company thousands of dollars a year in purely wasted fuel.</p>

            <h2>Protecting Your Margin: Fuel Surcharges</h2>
            <p>Successful logistics companies do not absorb the risk of volatile fuel prices; they pass that risk onto the customer using a <strong>Fuel Surcharge</strong>. </p>
            <p>When a trucking company signs a 12-month contract to haul freight, they base their rate on the current price of diesel (the "baseline"). They include a mathematical clause in the contract stating that if the national average price of diesel rises above that baseline, a surcharge percentage is automatically added to the customer's invoice. This ensures that the fleet's profit margin remains perfectly intact, regardless of what the oil market does.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fleet-fuel-cost-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
