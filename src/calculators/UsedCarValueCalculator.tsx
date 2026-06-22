"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Search, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface UsedCarResults {
  currentValue: number;
  totalDepreciation: number;
  depreciationPct: number;
  chartData: any[];
  breakdown: {
    baseDepreciation: number;
    mileagePenalty: number;
    conditionAdjustment: number;
    marketAdjustment: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateUsedCarValue = (inputs: typeof DEFAULTS): UsedCarResults => {
  const originalMsrp = parseFloat(inputs.originalMsrp) || 0;
  const currentAge = parseFloat(inputs.currentAge) || 0;
  const currentMileage = parseFloat(inputs.currentMileage) || 0;
  
  const vehicleType = inputs.vehicleType as "economy" | "standard" | "luxury" | "truck";
  const condition = inputs.condition as "excellent" | "good" | "fair" | "poor";
  
  // Advanced
  const marketDemand = inputs.marketDemand as "high" | "normal" | "low";

  if (originalMsrp <= 0) {
    return {
      currentValue: 0, totalDepreciation: 0, depreciationPct: 0, chartData: [],
      breakdown: { baseDepreciation: 0, mileagePenalty: 0, conditionAdjustment: 0, marketAdjustment: 0 },
      isError: true, errorMsg: "Original MSRP must be greater than zero."
    };
  }

  // Define depreciation curves based on vehicle type
  // Cars lose the most value in year 1, then a steady percentage each year thereafter.
  let year1Drop = 0.20; // 20%
  let annualDrop = 0.15; // 15%

  if (vehicleType === "economy") {
    year1Drop = 0.18;
    annualDrop = 0.12;
  } else if (vehicleType === "luxury") {
    year1Drop = 0.25; // Luxury drops like a rock
    annualDrop = 0.18;
  } else if (vehicleType === "truck") {
    year1Drop = 0.15; // Trucks hold value well
    annualDrop = 0.10;
  }

  // 1. Base Depreciation (Time)
  let baseValue = originalMsrp;
  let chartData = [];
  
  chartData.push({ year: 0, value: originalMsrp, isCurrent: 0 === Math.round(currentAge) ? originalMsrp : null });

  for (let y = 1; y <= Math.max(15, currentAge + 2); y++) {
    if (y === 1) {
      baseValue = baseValue * (1 - year1Drop);
    } else {
      baseValue = baseValue * (1 - annualDrop);
    }
    
    // Ensure it doesn't go to literal zero if it's running
    if (baseValue < 500) baseValue = 500;

    chartData.push({
      year: y,
      value: baseValue,
      isCurrent: y === Math.round(currentAge) ? baseValue : null
    });
  }

  // Get base value exactly at current age (interpolated if decimal)
  let exactBaseValue = 0;
  if (currentAge === 0) exactBaseValue = originalMsrp;
  else if (currentAge <= 1) {
    exactBaseValue = originalMsrp - (originalMsrp * year1Drop * currentAge);
  } else {
    // Value at year 1
    let valY1 = originalMsrp * (1 - year1Drop);
    // Value after remaining years
    exactBaseValue = valY1 * Math.pow(1 - annualDrop, currentAge - 1);
  }
  
  const baseDepreciation = originalMsrp - exactBaseValue;

  // 2. Mileage Adjustment
  // Average mileage is roughly 12,000 miles per year.
  const expectedMileage = currentAge * 12000;
  const mileageDifference = currentMileage - expectedMileage;
  
  // Roughly $0.10 penalty/bonus per mile off the average, scaling down for older/cheaper cars
  const mileageValueFactor = exactBaseValue / originalMsrp; 
  let mileagePenalty = mileageDifference * 0.10 * mileageValueFactor;
  
  // Cap the mileage penalty/bonus
  if (mileagePenalty > exactBaseValue * 0.3) mileagePenalty = exactBaseValue * 0.3;
  if (mileagePenalty < -exactBaseValue * 0.3) mileagePenalty = -exactBaseValue * 0.3;

  let valueAfterMileage = exactBaseValue - mileagePenalty;

  // 3. Condition Adjustment
  let conditionMultiplier = 1.0;
  if (condition === "excellent") conditionMultiplier = 1.05; // +5%
  else if (condition === "good") conditionMultiplier = 1.00; // Baseline
  else if (condition === "fair") conditionMultiplier = 0.85; // -15%
  else if (condition === "poor") conditionMultiplier = 0.65; // -35%

  const conditionAdjustment = (valueAfterMileage * conditionMultiplier) - valueAfterMileage;
  let valueAfterCondition = valueAfterMileage + conditionAdjustment;

  // 4. Market Adjustment
  let marketMultiplier = 1.0;
  if (marketDemand === "high") marketMultiplier = 1.10; // +10%
  else if (marketDemand === "low") marketMultiplier = 0.90; // -10%

  const marketAdjustment = (valueAfterCondition * marketMultiplier) - valueAfterCondition;
  let finalValue = valueAfterCondition + marketAdjustment;

  // Floor at scrap value
  if (finalValue < 500) finalValue = 500;

  const totalDepreciation = originalMsrp - finalValue;
  const depreciationPct = (totalDepreciation / originalMsrp) * 100;

  return {
    currentValue: finalValue,
    totalDepreciation,
    depreciationPct,
    chartData,
    breakdown: {
      baseDepreciation,
      mileagePenalty,
      conditionAdjustment,
      marketAdjustment
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  originalMsrp: "35000",
  currentAge: "5",
  currentMileage: "65000",
  vehicleType: "standard",
  condition: "good",
  // Advanced
  marketDemand: "normal"
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
export default function UsedCarValueCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<UsedCarResults>(calculateUsedCarValue(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateUsedCarValue(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateUsedCarValue(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "How fast do cars depreciate?", answer: "A new car loses roughly 10% to 20% of its value the second you drive it off the dealership lot. After that, most standard vehicles depreciate at a rate of 15% per year. By the end of year 5, the average car is worth roughly 40% of what it originally cost new." },
    { question: "Do some cars hold value better than others?", answer: "Yes, drastically. Pickup trucks (like the Toyota Tacoma or Ford F-150) and economy cars (like the Honda Civic) have incredibly slow depreciation curves because they are always in high demand on the used market. Luxury cars (like BMW, Mercedes, or Range Rover) have catastrophic depreciation, often losing over 60% of their value in the first 5 years due to expensive out-of-warranty repair costs." },
    { question: "How does mileage affect the value?", answer: "The industry standard expects a car to be driven roughly 12,000 miles per year. If your 5-year-old car has 100,000 miles (40,000 miles over average), its value will be heavily penalized. Conversely, if that same 5-year-old car only has 30,000 miles, it will carry a premium valuation over the baseline." },
    { question: "What is 'Market Demand'?", answer: "Used car prices fluctuate wildly based on macroeconomic factors. During the 2021-2022 chip shortage, 'High Demand' caused used car prices to skyrocket, sometimes eclipsing the price of new cars. Setting the market demand in the Advanced Options allows you to adjust the baseline math for current economic conditions." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Used Car Value Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Used Car Value Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="orig-msrp" label="Original Price (MSRP)" value={inputs.originalMsrp} onChange={(v: string) => handleChange("originalMsrp", v)} prefix="$" tooltip="The total price of the vehicle when it was brand new." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="age" label="Current Age" value={inputs.currentAge} onChange={(v: string) => handleChange("currentAge", v)} suffix="yrs" />
              <CompactInput id="miles" label="Current Mileage" value={inputs.currentMileage} onChange={(v: string) => handleChange("currentMileage", v)} suffix="mi" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3">Vehicle Details</div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="type" label="Vehicle Category" value={inputs.vehicleType} onChange={(v: string) => handleChange("vehicleType", v)} options={[
                { label: "Economy / Reliable (e.g. Civic, Corolla)", value: "economy" },
                { label: "Standard / Midsize (e.g. Accord, CR-V)", value: "standard" },
                { label: "Luxury / Premium (e.g. BMW, Mercedes)", value: "luxury" },
                { label: "Pickup Truck / SUV (e.g. F-150, Tacoma)", value: "truck" }
              ]} />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-1">
              <CompactInput id="condition" label="Overall Condition" value={inputs.condition} onChange={(v: string) => handleChange("condition", v)} options={[
                { label: "Excellent (Flawless, new tires, full records)", value: "excellent" },
                { label: "Good (Minor scratches, standard wear)", value: "good" },
                { label: "Fair (Visible damage, needs minor repairs)", value: "fair" },
                { label: "Poor (Severe damage, mechanical issues)", value: "poor" }
              ]} />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Market Trends) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="market" label="Macro Market Demand" value={inputs.marketDemand} onChange={(v: string) => handleChange("marketDemand", v)} options={[
                    { label: "High Demand (Low inventory, high prices)", value: "high" },
                    { label: "Normal (Standard historical depreciation)", value: "normal" },
                    { label: "Low Demand (Oversupply, recession)", value: "low" }
                  ]} tooltip="Adjusts the final value up or down by 10% based on current macroeconomic conditions." />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Search className="h-4 w-4" /> Estimate Value
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Current Value</div>
                  <div className="text-5xl font-bold text-primary mb-1">
                    {formatCurrency(results.currentValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">This is an estimate for private-party sale. Dealer trade-in will typically be 15-20% lower.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Original Price</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(parseFloat(inputs.originalMsrp))}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Value Lost</div>
                    <div className="text-lg font-bold text-destructive">-{formatCurrency(results.totalDepreciation)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Depreciation %</div>
                    <div className="text-lg font-bold text-destructive">-{results.depreciationPct.toFixed(1)}%</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Depreciation Curve Projection</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={[0, 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => {
                            if (name === "value") return [formatCurrency(value), "Base Value"];
                            return [value, name];
                          }} 
                          labelFormatter={(label) => `Year ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        
                        <ReferenceLine x={parseFloat(inputs.currentAge)} stroke="#3b82f6" strokeWidth={2} label={{ position: 'insideTopRight', value: 'CURRENT AGE', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 6}} name="value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Notice the steep drop in the first 2-3 years, followed by a flattening curve.</p>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Valuation Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Original MSRP</span>
                      <span className="font-medium text-foreground">{formatCurrency(parseFloat(inputs.originalMsrp))}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Age Depreciation ({inputs.currentAge} years)</span>
                      <span className="font-medium text-red-500">-{formatCurrency(results.breakdown.baseDepreciation)}</span>
                    </div>
                    
                    {results.breakdown.mileagePenalty !== 0 && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Mileage Adj. ({inputs.currentMileage} miles)</span>
                        <span className={`font-medium ${results.breakdown.mileagePenalty > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {results.breakdown.mileagePenalty > 0 ? '-' : '+'}{formatCurrency(Math.abs(results.breakdown.mileagePenalty))}
                        </span>
                      </div>
                    )}

                    {results.breakdown.conditionAdjustment !== 0 && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Condition Adj. ({inputs.condition})</span>
                        <span className={`font-medium ${results.breakdown.conditionAdjustment > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {results.breakdown.conditionAdjustment > 0 ? '+' : '-'}{formatCurrency(Math.abs(results.breakdown.conditionAdjustment))}
                        </span>
                      </div>
                    )}

                    {results.breakdown.marketAdjustment !== 0 && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 bg-muted/10">
                        <span className="text-muted-foreground">Market Demand ({inputs.marketDemand})</span>
                        <span className={`font-medium ${results.breakdown.marketAdjustment > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {results.breakdown.marketAdjustment > 0 ? '+' : '-'}{formatCurrency(Math.abs(results.breakdown.marketAdjustment))}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Estimated Private Party Value</span>
                      <span className="text-primary">{formatCurrency(results.currentValue)}</span>
                    </div>
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
            <h2>What Is a Used Car Value Calculator?</h2>
            <p>A Used Car Value Calculator is a financial modeling tool that estimates the current market value of an automobile by simulating its depreciation curve. Cars are depreciating assets, meaning they lose value every single day. This calculator takes the original sticker price (MSRP) of the vehicle when it was brand new and applies industry-standard depreciation logic based on its age, mileage, condition, and vehicle class to find its true current worth.</p>

            <h2>Understanding the Depreciation Curve</h2>
            <p>Car depreciation is highly non-linear. The moment you drive a brand new car off a dealership lot, it transforms into a "used car" and instantly loses 10% to 20% of its total value. It continues to drop sharply for the first three years. However, around year five or six, the curve begins to flatten. A 10-year-old car might only lose a few hundred dollars a year in value, whereas a 1-year-old car is losing thousands of dollars a year. Our <strong>Depreciation Curve Projection</strong> chart visualizes this exact mathematical reality.</p>

            <h2>How Mileage Affects Value</h2>
            <p>The automotive industry assumes an average driver covers roughly 12,000 miles per year. If your car's odometer reads exactly 12,000 miles multiplied by its age, there is no mileage penalty. If you drive significantly more than that, the calculator applies a <strong>Mileage Penalty</strong>, deducting value to account for the excessive mechanical wear and tear. If you drive significantly less (e.g., a 5-year-old car with only 20,000 miles), the calculator applies a bonus, increasing the car's value above the baseline.</p>

            <h2>Vehicle Categories Matter</h2>
            <p>Not all cars depreciate equally. A luxury European sedan might be packed with cutting-edge technology, but because out-of-warranty repairs are astronomically expensive, buyers on the used market refuse to pay high prices for them, resulting in a terrifyingly steep depreciation curve. Conversely, pickup trucks and economy cars (like a Honda Civic or Toyota Tacoma) are prized for utility and reliability, meaning they hold onto their value far better than average. The calculator adjusts the annual depreciation rate based on the <strong>Vehicle Category</strong> you select.</p>

            <h2>Private Party vs Dealer Trade-In</h2>
            <p>The result provided by this calculator represents the <strong>Private Party Value</strong>—the amount you could expect to receive if you sold the car yourself to another individual via Craigslist or Facebook Marketplace. If you choose to trade the car in at a dealership, expect them to offer you 15% to 20% less than this number. The dealer must pay to inspect, clean, and fix the car, and then they must mark the price back up to turn a profit on their used lot.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The High-Mileage Commuter.</strong> You have a 4-year-old standard car originally bought for $30,000. However, you commute heavily and have 80,000 miles on the odometer. The base age depreciation drops the value to roughly $15,600. But because you are 32,000 miles over the average (4 years x 12k = 48k), the calculator applies a massive $1,600 mileage penalty. Your car is only worth around $14,000.</p>
            <p><strong>Example 2: The Garage Queen.</strong> You bought a $50,000 luxury car 5 years ago, but you only drove it on weekends. It has a pristine 15,000 miles on the odometer. While luxury cars depreciate rapidly (dropping the base value to ~$17,000), your incredibly low mileage triggers a substantial bonus, pulling the final estimated value back up over $20,000.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/used-car-value-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
