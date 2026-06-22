"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { TrendingDown, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface BreakEvenResults {
  pricePremium: number;
  annualSavings: number;
  breakEvenYears: number;
  breakEvenMiles: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBreakEven = (inputs: typeof DEFAULTS): BreakEvenResults => {
  const basePrice = parseFloat(inputs.basePrice);
  const baseMpg = parseFloat(inputs.baseMpg);
  const premiumPrice = parseFloat(inputs.premiumPrice);
  const premiumMpg = parseFloat(inputs.premiumMpg);
  const fuelPrice = parseFloat(inputs.fuelPrice);
  const annualMiles = parseFloat(inputs.annualMiles);

  if (isNaN(basePrice) || basePrice <= 0 || isNaN(baseMpg) || baseMpg <= 0 ||
      isNaN(premiumPrice) || premiumPrice <= 0 || isNaN(premiumMpg) || premiumMpg <= 0 ||
      isNaN(fuelPrice) || fuelPrice <= 0 || isNaN(annualMiles) || annualMiles <= 0) {
    return {
      pricePremium: 0, annualSavings: 0, breakEvenYears: 0, breakEvenMiles: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // The extra money paid upfront to buy the more efficient car
  const pricePremium = premiumPrice - basePrice;

  if (pricePremium <= 0) {
    return {
      pricePremium: 0, annualSavings: 0, breakEvenYears: 0, breakEvenMiles: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "The Premium car must cost more than the Base car to calculate a break-even point."
    };
  }
  
  if (premiumMpg <= baseMpg) {
    return {
      pricePremium: 0, annualSavings: 0, breakEvenYears: 0, breakEvenMiles: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "The Premium car must have better fuel economy than the Base car to save money."
    };
  }

  // Calculate Fuel Costs per Year
  const baseGallonsPerYear = annualMiles / baseMpg;
  const baseFuelCostPerYear = baseGallonsPerYear * fuelPrice;

  const premiumGallonsPerYear = annualMiles / premiumMpg;
  const premiumFuelCostPerYear = premiumGallonsPerYear * fuelPrice;

  // Calculate Savings
  const annualSavings = baseFuelCostPerYear - premiumFuelCostPerYear;

  // Calculate Break Even
  const breakEvenYears = pricePremium / annualSavings;
  const breakEvenMiles = breakEvenYears * annualMiles;

  // Generate chart data: Total Cost of Ownership (Purchase + Fuel) over 10 Years
  const chartData = [];
  const schedule: any[] = [];
  
  for (let year = 0; year <= 10; year++) {
    const baseTotalCost = basePrice + (baseFuelCostPerYear * year);
    const premiumTotalCost = premiumPrice + (premiumFuelCostPerYear * year);
    
    chartData.push({
      Year: year,
      "Base Car Total Cost": Math.round(baseTotalCost),
      "Premium Car Total Cost": Math.round(premiumTotalCost)
    });

    schedule.push({
      year: year,
      baseCost: Math.round(baseTotalCost),
      premiumCost: Math.round(premiumTotalCost),
      netDifference: Math.round(baseTotalCost - premiumTotalCost) // If positive, premium car is cheaper
    });
  }

  return {
    pricePremium: Math.round(pricePremium),
    annualSavings: Math.round(annualSavings),
    breakEvenYears: Number(breakEvenYears.toFixed(1)),
    breakEvenMiles: Math.round(breakEvenMiles),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  basePrice: "25000",
  baseMpg: "30",
  premiumPrice: "28000", // Hybrid version
  premiumMpg: "50",      // Hybrid MPG
  fuelPrice: "3.50",
  annualMiles: "12000"
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
export default function BreakEvenMileageCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BreakEvenResults>(calculateBreakEven(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateBreakEven(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBreakEven(DEFAULTS));
  };

  const faqs = [
    { question: "What is a Break-Even point?", answer: "When you buy a more expensive Hybrid or Diesel vehicle to save money on gas, you are paying a 'Price Premium' upfront. The Break-Even point is the exact moment in time when the money you saved at the gas pump finally equals the extra money you paid at the dealership. After you pass the break-even point, you are finally saving real money." },
    { question: "Why does it take so long to break even on a Hybrid?", answer: "Hybrids usually cost $2,000 to $4,000 more than their gas-only counterparts. While getting 50 MPG sounds amazing, if you only drive 10,000 miles a year, your actual fuel savings might only be $300 a year. At that rate, it takes over 10 years just to earn back the extra $3,000 you spent on the car." },
    { question: "Are Electric Vehicles (EVs) worth the price premium?", answer: "It depends entirely on how many miles you drive and the cost of electricity in your area. EVs carry a massive upfront price premium (often $10,000+ more than a gas car). If you drive 25,000 miles a year and charge at home, the fuel savings are astronomical, and you will break even quickly. If you drive 8,000 miles a year, you will likely sell the EV before you ever break even." },
    { question: "How does gas price affect the calculation?", answer: "Gas prices heavily dictate the break-even point. If gas is $5.00 a gallon, the fuel savings from a Hybrid are massive, and the break-even time drops significantly. If gas drops to $2.00 a gallon, the fuel savings become microscopic, and it could take 15+ years to break even on the Hybrid upgrade." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Break-Even Mileage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Break-Even Mileage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine if spending extra money upfront for a fuel-efficient Hybrid, Diesel, or EV is mathematically worth it based on your driving habits.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1">Base Vehicle (Gasoline)</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="baseP" label="Purchase Price" value={inputs.basePrice} onChange={(v: string) => handleChange("basePrice", v)} prefix="$" placeholder="25000" />
              <CompactInput id="baseM" label="Fuel Economy" value={inputs.baseMpg} onChange={(v: string) => handleChange("baseMpg", v)} suffix="MPG" placeholder="30" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Premium Vehicle (Hybrid/EV)</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="premP" label="Purchase Price" value={inputs.premiumPrice} onChange={(v: string) => handleChange("premiumPrice", v)} prefix="$" placeholder="28000" />
              <CompactInput id="premM" label="Fuel Economy" value={inputs.premiumMpg} onChange={(v: string) => handleChange("premiumMpg", v)} suffix="MPG" placeholder="50" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Driving Habits & Fuel Cost</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="miles" label="Miles Driven per Year" value={inputs.annualMiles} onChange={(v: string) => handleChange("annualMiles", v)} suffix="mi" placeholder="12000" />
              <CompactInput id="fuel" label="Fuel Price per Gallon" value={inputs.fuelPrice} onChange={(v: string) => handleChange("fuelPrice", v)} prefix="$" placeholder="3.50" />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Time to Break Even</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.breakEvenYears}</div>
                      <div className="text-2xl font-bold text-primary mb-1">years</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Mileage to Break Even</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.breakEvenMiles.toLocaleString()}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">mi</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Upfront Premium</div>
                    <div className="text-2xl font-bold text-destructive">+${results.pricePremium.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Extra paid at dealer</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fuel Savings</div>
                    <div className="text-2xl font-bold text-emerald-500">${results.annualSavings.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Saved per year</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Verdict</div>
                    <div className={`text-xl font-bold ${results.breakEvenYears <= 5 ? 'text-emerald-500' : results.breakEvenYears <= 10 ? 'text-blue-500' : 'text-orange-500'}`}>
                      {results.breakEvenYears <= 5 ? "Great Deal" : results.breakEvenYears <= 10 ? "Fair Return" : "Not Worth It"}
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Total Cost of Ownership (TCO) Over 10 Years</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorPrem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Year" tickFormatter={(val) => `Yr ${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                        <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                          labelFormatter={(label) => `End of Year ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" name="Premium Car Total Cost" dataKey="Premium Car Total Cost" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrem)" strokeWidth={3} activeDot={{r: 6}} />
                        <Area type="monotone" name="Base Car Total Cost" dataKey="Base Car Total Cost" stroke="hsl(var(--destructive))" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">The point where the blue line crosses below the red line is your exact Break-Even point.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Cumulative Financial Position</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Year</th>
                          <th className="px-4 py-3 font-semibold text-right">Base Car TCO</th>
                          <th className="px-4 py-3 font-semibold text-right">Premium Car TCO</th>
                          <th className="px-4 py-3 font-semibold text-right">Net Financial Position</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.year} className={`hover:bg-muted/20 transition-colors ${row.netDifference > 0 ? 'bg-emerald-500/10' : ''}`}>
                            <td className="px-4 py-3 text-foreground font-medium">Year {row.year}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">${row.baseCost.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-primary">${row.premiumCost.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-right font-bold ${row.netDifference > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}`}>
                              {row.netDifference > 0 ? "+" : ""}{row.netDifference > 0 ? "$" + row.netDifference.toLocaleString() : "-$" + Math.abs(row.netDifference).toLocaleString()}
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Efficiency</h2>
            <p>Automakers heavily heavily market Hybrid and Electric Vehicles (EVs) based on fuel savings. A salesman will excitedly tell you that upgrading to the Hybrid trim level will jump your fuel economy from 30 MPG to an astonishing 50 MPG. What they rarely mention is the upfront math. The Hybrid engine upgrade usually carries a massive <strong>Price Premium</strong> (often $2,000 to $4,000) that gets rolled into your loan.</p>
            <p>This creates a race between two numbers: The extra money you paid at the dealership vs the money you are saving at the gas pump each week.</p>

            <h2>The Concept of the Break-Even Point</h2>
            <p>The Break-Even Point is the exact moment in time when the total fuel savings finally equals the Price Premium. Until you reach this point, you have not saved a single dime; you are simply earning back the extra money you already spent. Once you cross the break-even threshold, every dollar saved at the pump is true profit.</p>

            <h2>The "Low Mileage" Trap</h2>
            <p>Many drivers make the mistake of buying expensive Hybrid or Diesel vehicles when they only commute a few miles to work. If you only drive 8,000 miles a year, you are not burning much fuel in the first place. Therefore, jumping from 30 MPG to 50 MPG might only save you $200 a year. If you paid a $3,000 Price Premium for the Hybrid, it will take you <strong>15 years</strong> to break even. Most people sell their cars long before 15 years, meaning the Hybrid upgrade was a complete financial loss.</p>
            <p>Hybrids and EVs are mathematically advantageous for high-mileage drivers (Uber drivers, long commuters, traveling salesmen). The more miles you drive per year, the faster you erase the upfront Price Premium.</p>

            <h2>The Volatility of Fuel Prices</h2>
            <p>The break-even timeline is at the complete mercy of global oil prices. When gas spikes to $5.00 a gallon, the mathematical advantage of a 50 MPG Hybrid becomes massive, shortening the break-even time to just a few years. When gas drops down to $2.50 a gallon, the financial penalty of driving a standard 30 MPG gas car is so low that the Hybrid premium becomes nearly impossible to justify mathematically.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/break-even-mileage-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
