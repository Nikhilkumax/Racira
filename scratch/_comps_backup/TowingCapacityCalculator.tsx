"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Truck, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface TowingResults {
  maxTrailerWeight: number;
  totalTruckWeight: number;
  remainingGCWR: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateTowing = (inputs: typeof DEFAULTS): TowingResults => {
  const gcwr = parseFloat(inputs.gcwr);
  const curbWeight = parseFloat(inputs.curbWeight);
  const payload = parseFloat(inputs.payload); // Passengers + Cargo in the truck

  if (isNaN(gcwr) || gcwr <= 0 || isNaN(curbWeight) || curbWeight <= 0 || isNaN(payload) || payload < 0) {
    return {
      maxTrailerWeight: 0, totalTruckWeight: 0, remainingGCWR: 0,
      chartData: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // The total weight of the truck itself
  const totalTruckWeight = curbWeight + payload;

  if (totalTruckWeight >= gcwr) {
    return {
      maxTrailerWeight: 0, totalTruckWeight, remainingGCWR: 0,
      chartData: [], isError: true, errorMsg: "The total weight of your truck (Curb + Payload) exceeds the Gross Combined Weight Rating. You cannot safely tow anything."
    };
  }

  // The maximum weight the trailer can be
  const maxTrailerWeight = gcwr - totalTruckWeight;
  const remainingGCWR = 0; // If you tow the max trailer weight, remaining GCWR is 0

  // Generate chart data: Show how Truck Weight + Trailer Weight = GCWR
  const chartData = [
    {
      name: "Weight Distribution",
      "Truck (Empty)": curbWeight,
      "Truck Payload (Passengers/Cargo)": payload,
      "Max Trailer Weight": maxTrailerWeight
    }
  ];

  return {
    maxTrailerWeight,
    totalTruckWeight,
    remainingGCWR,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  gcwr: "15000",      // Gross Combined Weight Rating
  curbWeight: "5000", // Empty truck
  payload: "600"      // Passengers and cargo in the truck bed
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function TowingCapacityCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<TowingResults>(calculateTowing(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateTowing(newInputs);
    if (!r.isError) setResults(r);
  };

const handleCalculate = () => {
    const r = calculateTowing(inputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateTowing(DEFAULTS));
  };

  const faqs = [
    { question: "What is GCWR?", answer: "Gross Combined Weight Rating (GCWR) is the absolute maximum allowable weight of both the fully loaded tow vehicle and the fully loaded trailer combined. It is a strict legal and engineering limit set by the manufacturer. If you put both your truck and your attached trailer onto a commercial scale at the same time, the total number on the screen must never exceed the GCWR." },
    { question: "Why doesn't my truck's 'Max Towing' number match?", answer: "Automakers advertise a theoretical 'Max Towing Capacity' (e.g., 'Tows up to 10,000 lbs!'). However, that marketing number assumes the truck is completely empty except for a 150 lb driver. If you put 800 lbs of family members and luggage into the truck, you have increased the truck's physical weight. Because you cannot exceed the GCWR, that extra 800 lbs in the truck means you must subtract 800 lbs from your maximum trailer weight." },
    { question: "What is Tongue Weight?", answer: "When you attach a trailer to your truck's hitch, the trailer physically pushes down on the back of the truck. This downward force is called Tongue Weight. Typically, 10% to 15% of a trailer's total weight rests on the hitch. This tongue weight consumes your truck's internal Payload Capacity. Even if you are under your GCWR, you must ensure the tongue weight does not overload the truck's rear suspension." },
    { question: "Is it illegal to exceed towing capacity?", answer: "Yes. Exceeding your vehicle's GCWR or GVWR is illegal. If you are involved in a traffic accident while towing an overweight trailer, your insurance company can deny your claim, and you can be held criminally liable for negligence, as overloaded brakes are guaranteed to fail." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Towing Capacity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Towing Capacity Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1">Manufacturer Limits</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="gcwr" label="GCWR (Gross Combined Weight Rating)" value={inputs.gcwr} onChange={(v: string) => handleChange("gcwr", v)} suffix="lbs" placeholder="15000" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Current Truck State</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="curb" label="Truck Curb Weight" value={inputs.curbWeight} onChange={(v: string) => handleChange("curbWeight", v)} suffix="lbs" placeholder="5000" />
              <CompactInput id="payload" label="Current Payload (People/Cargo)" value={inputs.payload} onChange={(v: string) => handleChange("payload", v)} suffix="lbs" placeholder="600" />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: Every pound of people or cargo you put inside the truck directly reduces the size of the trailer you are legally allowed to tow.
            </div>

            <div className="flex gap-2.5 mt-4">
                            <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Max Safe Trailer Weight</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.maxTrailerWeight.toLocaleString()}</div>
                      <div className="text-2xl font-bold text-primary mb-1">lbs</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Current Truck Weight</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.totalTruckWeight.toLocaleString()}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">lbs</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">GCWR Limit</div>
                    <div className="text-2xl font-bold text-destructive">{parseFloat(inputs.gcwr).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Truck + Trailer</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Truck Payload</div>
                    <div className="text-2xl font-bold text-orange-500">{parseFloat(inputs.payload).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">People & Cargo</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Trailer Limit</div>
                    <div className="text-2xl font-bold text-emerald-500">{results.maxTrailerWeight.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Towable</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Total Weight Breakdown (GCWR)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, parseFloat(inputs.gcwr) * 1.05]} />
                        <YAxis type="category" dataKey="name" hide />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value.toLocaleString()} lbs`, name]}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                        <Bar dataKey="Truck (Empty)" stackId="a" fill="hsl(var(--muted-foreground))" maxBarSize={60} />
                        <Bar dataKey="Truck Payload (Passengers/Cargo)" stackId="a" fill="hsl(var(--orange-500))" maxBarSize={60} />
                        <Bar dataKey="Max Trailer Weight" stackId="a" fill="hsl(var(--primary))" maxBarSize={60} />
                        <ReferenceLine x={parseFloat(inputs.gcwr)} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'top', value: 'GCWR LIMIT', fill: 'hsl(var(--destructive))', fontSize: 12, fontWeight: 'bold' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">The total length of the bar (Truck + Payload + Trailer) must never cross the red GCWR limit line.</div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Myth of "Max Towing Capacity"</h2>
            <p>If you watch a truck commercial, the manufacturer will proudly display a massive number: <em>"Maximum Towing Capacity: 12,000 lbs!"</em> However, this number is a marketing myth. It is a theoretical maximum calculated under impossible conditions. To achieve that 12,000 lb rating, the manufacturer assumes the truck is completely empty, holding absolutely zero cargo, and being driven by a single 150-pound person.</p>

            <h2 className="text-2xl font-bold mb-3">The GCWR is the Only Number That Matters</h2>
            <p>In reality, the only true limit for your vehicle is the <strong>Gross Combined Weight Rating (GCWR)</strong>. This is the absolute maximum weight that the engine, transmission, and brakes can safely move down the road. It includes the physical weight of the truck, the physical weight of the trailer, and everything inside them.</p>
            <p>If your truck has a GCWR of 15,000 lbs, and the empty truck weighs 5,000 lbs, you have 10,000 lbs remaining to split between Payload (people/cargo in the truck) and the Trailer. It is a zero-sum game.</p>
            <ul>
              <li>If you drive the truck alone (just you), you can tow a 9,850 lb trailer.</li>
              <li>If you load the truck with a family of four, three large dogs, a cooler, and firewood (totaling 1,000 lbs of Payload), the physical weight of the truck increases to 6,000 lbs. Because the GCWR never changes, you must subtract that 1,000 lbs from your trailer limit. You can now only tow an 9,000 lb trailer.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why is Overloading So Dangerous?</h2>
            <p>Engineers design the GCWR primarily around the braking system and the transmission cooling system. If you exceed the GCWR, your vehicle will still physically pull the trailer—engines are incredibly strong. However, when you attempt to stop that massive amount of kinetic energy from 65 MPH, the brakes will overheat, boil the brake fluid, and fail completely.</p>

            <h2 className="text-2xl font-bold mb-3">The Hidden Hitch Limit: Tongue Weight</h2>
            <p>Even if you are under your GCWR limit, you must also be aware of Tongue Weight. A trailer does not just pull backward on the truck; it pushes straight down onto the rear hitch. A 7,000 lb trailer will drop roughly 700 to 1,000 lbs of physical force directly onto the back of your truck. This force counts entirely against your truck's internal Payload Capacity. If you have a massive trailer, the tongue weight alone can overload the truck's rear suspension, causing the front tires to lift slightly, resulting in a terrifying loss of steering control.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/towing-capacity-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Towing Capacity Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Towing Capacity Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Towing Capacity Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Towing Capacity Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Towing Capacity Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
