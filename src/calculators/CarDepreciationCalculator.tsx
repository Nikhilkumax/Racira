"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript interfaces
interface CarDepreciationResults {
  finalValue: number;
  totalDepreciation: number;
  percentLost: number;
  avgAnnualLoss: number;
  yearlyData: { year: number; value: number; loss: number }[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDepreciation = (inputs: typeof DEFAULTS): CarDepreciationResults => {
  const price = parseFloat(inputs.price) || 0;
  const currentAge = parseFloat(inputs.currentAge) || 0;
  const yearsOwned = parseFloat(inputs.yearsOwned) || 1;
  const brandType = inputs.brandType as "standard" | "luxury" | "reliable";
  const annualMiles = parseFloat(inputs.annualMiles) || 15000;

  if (price <= 0 || yearsOwned <= 0) {
    return {
      finalValue: 0, totalDepreciation: 0, percentLost: 0, avgAnnualLoss: 0,
      yearlyData: [], isError: true, errorMsg: "Price and Ownership years must be greater than zero."
    };
  }

  // Define depreciation curves (cumulative percentage remaining)
  // Year 0 is brand new.
  let curve = [1.0, 0.80, 0.69, 0.58, 0.49, 0.40, 0.33, 0.27, 0.22, 0.18, 0.15]; // Standard
  if (brandType === "luxury") {
    curve = [1.0, 0.70, 0.55, 0.45, 0.35, 0.28, 0.22, 0.18, 0.14, 0.11, 0.09]; // Fast
  } else if (brandType === "reliable") {
    curve = [1.0, 0.85, 0.76, 0.68, 0.61, 0.55, 0.49, 0.43, 0.38, 0.34, 0.30]; // Slow
  }

  // Get function to estimate value at any year
  const getValueAtYear = (y: number) => {
    if (y < 0) return 1.0;
    const wholeYear = Math.floor(y);
    if (wholeYear >= curve.length - 1) {
      // Exponential decay after year 10
      const lastVal = curve[curve.length - 1];
      const decayRate = brandType === "luxury" ? 0.15 : (brandType === "reliable" ? 0.08 : 0.12);
      return lastVal * Math.pow(1 - decayRate, y - (curve.length - 1));
    }
    // Linear interpolate
    const frac = y - wholeYear;
    return curve[wholeYear] * (1 - frac) + curve[wholeYear + 1] * frac;
  };

  // Adjust for mileage
  const baseMiles = 15000;
  const mileDiff = annualMiles - baseMiles;
  const mileAdjustmentFactor = 1 - (mileDiff * 0.00001); // 1% loss per 1000 extra miles

  const startValuePct = getValueAtYear(currentAge);
  const endValuePct = getValueAtYear(currentAge + yearsOwned);

  // The actual starting value is what they paid for it NOW.
  // We assume 'price' is the price they pay today.
  // To find future value, we take: Price * (endPct / startPct) * mileageFactor
  
  const yearlyData = [];
  let currentVal = price;
  
  yearlyData.push({
    year: 0,
    value: price,
    loss: 0
  });

  for (let i = 1; i <= yearsOwned; i++) {
    const targetAge = currentAge + i;
    const pct = getValueAtYear(targetAge);
    const prevPct = getValueAtYear(targetAge - 1);
    
    // Drop ratio this year
    let dropRatio = pct / prevPct;
    
    // Apply mileage adj
    let adjDropRatio = dropRatio * Math.pow(mileAdjustmentFactor, 1/yearsOwned);
    if (adjDropRatio > 1) adjDropRatio = 1; // Can't appreciate
    
    const newVal = currentVal * adjDropRatio;
    const loss = currentVal - newVal;
    
    yearlyData.push({
      year: i,
      value: newVal,
      loss: loss
    });
    
    currentVal = newVal;
  }

  const finalValue = yearlyData[yearlyData.length - 1].value;
  const totalDepreciation = price - finalValue;
  const percentLost = (totalDepreciation / price) * 100;
  const avgAnnualLoss = totalDepreciation / yearsOwned;

  return {
    finalValue,
    totalDepreciation,
    percentLost,
    avgAnnualLoss,
    yearlyData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  price: "35000",
  currentAge: "0", // New car
  yearsOwned: "5",
  brandType: "standard", // standard, luxury, reliable
  annualMiles: "15000"
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
export default function CarDepreciationCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<CarDepreciationResults>(calculateDepreciation(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateDepreciation(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDepreciation(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const chartData = results.yearlyData.map(d => ({
    name: `Year ${d.year}`,
    Value: d.value
  }));

  const faqs = [
    { question: "What is car depreciation?", answer: "Car depreciation is the difference between a car's value when you buy it and what it's worth when you sell or trade it in. It's the single largest expense of owning a vehicle, often costing more than gas, insurance, and maintenance combined." },
    { question: "When do cars lose their value the fastest?", answer: "Cars lose value fastest in their first year. A brand new car can lose 20% to 30% of its value by the end of year one. Depreciation slows down significantly after the 5th year." },
    { question: "Which cars depreciate the most?", answer: "Luxury sedans and electric vehicles tend to depreciate the fastest. They can lose up to 60-70% of their value in the first 5 years due to expensive maintenance, rapidly changing technology, and lower demand in the used market." },
    { question: "Which cars hold their value the best?", answer: "Toyota trucks, Honda SUVs, and Jeep Wranglers consistently hold their value better than almost anything else on the road. They often retain 60-70% of their value after 5 years." },
    { question: "Does mileage affect depreciation?", answer: "Yes. The standard calculation assumes 15,000 miles per year. If you drive significantly more than that, your car will depreciate faster due to increased wear and tear." },
    { question: "How can I avoid depreciation?", answer: "The best way to avoid the steepest depreciation curve is to buy a 3 to 5-year-old used car and drive it for a long time. Let the original owner take the massive first-year hit." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Depreciation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Depreciation Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Purchase Price Today</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-lg">$</span>
                <input type="number" value={inputs.price} onChange={e => handleChange("price", e.target.value)} className="w-full h-full px-2 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="current-age" label="Current Age of Car" value={inputs.currentAge} onChange={(v: string) => handleChange("currentAge", v)} suffix="years" tooltip="0 for brand new" />
              <CompactInput id="years-owned" label="Years You'll Keep It" value={inputs.yearsOwned} onChange={(v: string) => handleChange("yearsOwned", v)} suffix="years" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="brand-type" label="Depreciation Type" value={inputs.brandType} onChange={(v: string) => handleChange("brandType", v)} options={[
                { label: "Standard (Ford, Chevy)", value: "standard" },
                { label: "Holds Value (Toyota, Honda)", value: "reliable" },
                { label: "Luxury / Fast Loss (BMW, EV)", value: "luxury" }
              ]} />
              <CompactInput id="annual-miles" label="Annual Mileage" value={inputs.annualMiles} onChange={(v: string) => handleChange("annualMiles", v)} suffix="miles" />
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Value After {inputs.yearsOwned} Years</div>
                  <div className="text-4xl font-bold text-primary mb-1">{formatCurrency(results.finalValue)}</div>
                  <div className="text-sm text-muted-foreground">You will lose exactly <strong>{formatCurrency(results.totalDepreciation)}</strong> to depreciation.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Loss</div>
                    <div className="text-lg font-bold text-red-500">-{formatCurrency(results.totalDepreciation)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">% Value Lost</div>
                    <div className="text-lg font-bold text-foreground">{results.percentLost.toFixed(1)}%</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Avg Loss/Year</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.avgAnnualLoss)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Year-by-Year Depreciation</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/10 border-b border-border text-xs uppercase text-muted-foreground">
                          <th className="px-4 py-2 font-semibold">Year</th>
                          <th className="px-4 py-2 font-semibold text-right">Value</th>
                          <th className="px-4 py-2 font-semibold text-right">Value Lost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.yearlyData.map((row) => (
                          <tr key={row.year} className="border-b border-border/50 last:border-0 hover:bg-muted/5">
                            <td className="px-4 py-2.5 text-base font-medium text-foreground">
                              {row.year === 0 ? "Today" : `Year ${row.year}`}
                            </td>
                            <td className="px-4 py-2.5 text-base text-right font-medium text-primary">
                              {formatCurrency(row.value)}
                            </td>
                            <td className="px-4 py-2.5 text-base text-right text-red-500 font-medium">
                              {row.loss > 0 ? `-${formatCurrency(row.loss)}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Value Trend</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                        />
                        <Area type="monotone" dataKey="Value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Depreciation Summary</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Original Price:</span><span className="font-medium">{formatCurrency(parseFloat(inputs.price))}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Final Value:</span><span className="font-medium">{formatCurrency(results.finalValue)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Ownership:</span><span className="font-medium">{inputs.yearsOwned} Years</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Miles Driven:</span><span className="font-medium">{parseInt(inputs.annualMiles) * parseFloat(inputs.yearsOwned)}</span></div>
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
            <h2>What Is Car Depreciation?</h2>
            <p>Car depreciation is the financial reality that a vehicle loses value over time. It is the single largest hidden expense of car ownership. While most people focus on their monthly loan payment, insurance, and gas, the thousands of dollars the vehicle sheds in market value every year quietly dwarfs those other costs. A Car Depreciation Calculator is an essential tool for buyers who want to understand the true cost to own a vehicle before signing the paperwork.</p>

            <h2>How It Works</h2>
            <p>Our calculator uses historical industry depreciation curves to project future value. The standard curve assumes a massive 20% drop in Year 1, followed by roughly 10-15% drops in subsequent years. The formula applies exponential decay based on the selected vehicle tier (Standard, Luxury, Reliable) and adjusts for your projected annual mileage. If you drive over 15,000 miles a year, a penalty factor reduces the curve further because high-mileage cars command less on the used market.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Estimated Value</strong> represents what you could reasonably expect to sell or trade the vehicle for at the end of your ownership period. <strong>Total Loss</strong> is the raw dollar amount that vanished into thin air while you owned the car. For example, if you buy a $40,000 car and sell it 5 years later for $18,000, your total loss is $22,000. <strong>Average Annual Loss</strong> breaks this down, showing you that the car cost you $4,400 a year just in lost value, regardless of repairs or fuel.</p>

            <h2>Key Factors</h2>
            <p><strong>Depreciation Type</strong> is the most critical variable. Luxury cars (BMW, Mercedes) and EVs depreciate like rocks, often losing 60% of their value in 5 years. Standard cars (Ford, Chevy) lose about 50%. Exceptionally reliable cars (Toyota Tacoma, Honda CR-V) might only lose 30-40%. <strong>Current Age</strong> also dictates the curve; a brand-new car takes the steepest hit, while a 5-year-old car has already "flattened out" and will depreciate much slower.</p>

            <h2>Advanced Features</h2>
            <p>The calculator dynamically adjusts the depreciation curve based on <strong>Annual Mileage</strong>. The used car market heavily penalizes vehicles that exceed the standard 12,000 to 15,000 miles per year. By inputting your specific driving habits, the algorithm ensures you aren't overestimating the final trade-in value, preventing negative equity surprises when you go to sell the car.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: Buying New.</strong> Mark buys a brand new $50,000 luxury SUV. In Year 1, he loses $15,000 in value immediately. After 5 years, the SUV is worth just $17,500. He lost $32,500 in depreciation, or $6,500 per year.</p>
            <p><strong>Example 2: Buying Used.</strong> Sarah buys the exact same luxury SUV, but she buys it when it is 4 years old for $22,000. She keeps it for 5 years. Because the steepest part of the curve has passed, the SUV is worth $10,000 when she sells it. Her total depreciation is only $12,000, or $2,400 per year.</p>

            <h2>Tips & Best Practices</h2>
            <p>To minimize depreciation, buy slightly used vehicles (3-5 years old) where the original owner has already absorbed the massive early-year losses. Hold onto vehicles as long as possible; keeping a car for 10 years flattens the curve to near zero in the final years. Choose colors that are universally appealing (white, black, silver) and maintain meticulous service records, as condition heavily impacts the actual real-world trade-in value.</p>

            <h2>Benefits</h2>
            <p>Using this calculator before purchasing a car forces you to look beyond the monthly payment. By visualizing the massive loss in value, you can make smarter decisions—such as opting for a gently used vehicle or choosing a brand known for retaining its value—ultimately saving you tens of thousands of dollars over your lifetime.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-depreciation-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
