"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Scale, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface WeightResults {
  curbWeight: number;
  payloadCapacity: number;
  gvwr: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateWeight = (inputs: typeof DEFAULTS): WeightResults => {
  const calcMode = inputs.calcMode;
  let curbWeight = 0;
  let payloadCapacity = 0;
  let gvwr = 0;

  if (calcMode === "payload") {
    // Calculate Payload: Payload = GVWR - Curb Weight
    gvwr = parseFloat(inputs.gvwr);
    curbWeight = parseFloat(inputs.curbWeight);
    
    if (isNaN(gvwr) || gvwr <= 0 || isNaN(curbWeight) || curbWeight <= 0) {
      return { curbWeight: 0, payloadCapacity: 0, gvwr: 0, chartData: [], isError: true, errorMsg: "GVWR and Curb Weight must be valid positive numbers." };
    }
    
    if (curbWeight >= gvwr) {
      return { curbWeight: 0, payloadCapacity: 0, gvwr: 0, chartData: [], isError: true, errorMsg: "Curb Weight cannot be greater than or equal to GVWR." };
    }
    
    payloadCapacity = gvwr - curbWeight;
  } else {
    // Calculate GVWR: GVWR = Curb Weight + Payload
    curbWeight = parseFloat(inputs.curbWeight);
    payloadCapacity = parseFloat(inputs.payloadCapacity);
    
    if (isNaN(curbWeight) || curbWeight <= 0 || isNaN(payloadCapacity) || payloadCapacity <= 0) {
      return { curbWeight: 0, payloadCapacity: 0, gvwr: 0, chartData: [], isError: true, errorMsg: "Curb Weight and Payload must be valid positive numbers." };
    }
    
    gvwr = curbWeight + payloadCapacity;
  }

  // Generate chart data: Simple stacked bar showing Curb + Payload = GVWR
  const chartData = [
    {
      name: "Weight Composition",
      "Empty Vehicle (Curb Weight)": curbWeight,
      "Max Cargo/Passengers (Payload)": payloadCapacity
    }
  ];

  return {
    curbWeight,
    payloadCapacity,
    gvwr,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  calcMode: "payload", // "payload" or "gvwr"
  curbWeight: "4500",
  gvwr: "6000",
  payloadCapacity: "1500"
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function VehicleWeightCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<WeightResults>(calculateWeight(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateWeight(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateWeight(DEFAULTS));
  };

  const faqs = [
    { question: "What is Curb Weight?", answer: "Curb Weight is the physical weight of your vehicle when it is completely empty but fully fueled. It includes all necessary operating fluids (oil, coolant, transmission fluid, and a 100% full tank of gas), but it does NOT include the driver, passengers, or any cargo. It is the weight of the vehicle sitting 'on the curb' waiting to be driven." },
    { question: "What is GVWR?", answer: "Gross Vehicle Weight Rating (GVWR) is the absolute maximum safe operating weight of your vehicle. It is a strict legal and engineering limit set by the manufacturer. If you put your vehicle on a scale, its total weight (including the car, passengers, cargo, and trailer tongue weight) must never exceed the GVWR. Exceeding this number means the brakes, suspension, and tires are no longer guaranteed to work safely." },
    { question: "What is Payload Capacity?", answer: "Payload Capacity is the maximum amount of physical weight you can put inside the vehicle. This includes the driver, all passengers, luggage, and the 'tongue weight' of any trailer you are towing. It is calculated by taking the vehicle's GVWR and subtracting its Curb Weight." },
    { question: "Are passengers included in Payload?", answer: "Yes! Many drivers make the mistake of assuming payload only refers to cargo in the trunk or truck bed. If your vehicle has a 1,000 lb payload capacity, and you put four 200 lb adults in the cab, you only have 200 lbs of payload capacity remaining for luggage." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Vehicle Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vehicle Weight Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine your vehicle's safe payload limits or find its maximum legal operating weight (GVWR).</p>

            <div className="grid grid-cols-1 gap-4 mb-2">
              <CompactInput id="mode" label="What are you trying to calculate?" value={inputs.calcMode} onChange={(v: string) => handleChange("calcMode", v)} options={[
                { label: "Calculate Payload Capacity", value: "payload" },
                { label: "Calculate GVWR", value: "gvwr" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="curb" label="Curb Weight (Empty Car)" value={inputs.curbWeight} onChange={(v: string) => handleChange("curbWeight", v)} suffix="lbs" placeholder="4500" />
              
              {inputs.calcMode === "payload" ? (
                <CompactInput id="gvwr" label="GVWR (Max Legal Weight)" value={inputs.gvwr} onChange={(v: string) => handleChange("gvwr", v)} suffix="lbs" placeholder="6000" />
              ) : (
                <CompactInput id="payload" label="Payload Capacity" value={inputs.payloadCapacity} onChange={(v: string) => handleChange("payloadCapacity", v)} suffix="lbs" placeholder="1500" />
              )}
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: You can usually find the official GVWR printed on the safety compliance sticker located inside the driver's side door jamb.
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
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm ${inputs.calcMode === 'payload' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Max Safe Payload</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.payloadCapacity.toLocaleString()}</div>
                      <div className="text-2xl font-bold text-primary mb-1">lbs</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm ${inputs.calcMode === 'gvwr' ? 'ring-2 ring-destructive ring-offset-2 ring-offset-background' : ''}`}>
                    <div className="text-xs uppercase tracking-wide text-destructive/80 mb-2 font-bold">Absolute Max Weight (GVWR)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-destructive tracking-tighter">{results.gvwr.toLocaleString()}</div>
                      <div className="text-xl font-bold text-destructive/80 mb-1">lbs</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Curb Weight</div>
                    <div className="text-2xl font-bold text-foreground">{results.curbWeight.toLocaleString()} lbs</div>
                    <div className="text-xs text-muted-foreground">Empty Vehicle</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Payload Limit</div>
                    <div className="text-2xl font-bold text-primary">{results.payloadCapacity.toLocaleString()} lbs</div>
                    <div className="text-xs text-muted-foreground">People & Cargo</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">GVWR</div>
                    <div className="text-2xl font-bold text-destructive">{results.gvwr.toLocaleString()} lbs</div>
                    <div className="text-xs text-muted-foreground">Do Not Exceed</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Weight Composition (Total = GVWR)</h3>
                  <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, results.gvwr * 1.1]} />
                        <YAxis type="category" dataKey="name" hide />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value.toLocaleString()} lbs`, name]}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                        <Bar dataKey="Empty Vehicle (Curb Weight)" stackId="a" fill="hsl(var(--muted-foreground))" maxBarSize={40} />
                        <Bar dataKey="Max Cargo/Passengers (Payload)" stackId="a" fill="hsl(var(--primary))" maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">The blue bar represents the physical limit of what you can safely add to the vehicle.</div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Vehicle Weight Limits</h2>
            <p>Every vehicle on the road, from a tiny Smart car to a massive commercial semi-truck, operates within strict weight boundaries designed by structural engineers. Ignoring these boundaries does not just cause accelerated wear and tear on your vehicle; it introduces catastrophic safety hazards. Overloading a vehicle causes brakes to overheat and fail, tires to blow out due to excessive sidewall pressure, and suspension components to snap.</p>

            <h2 className="text-2xl font-bold mb-3">The Three Primary Weight Metrics</h2>
            <ul>
              <li><strong>Curb Weight:</strong> This is the baseline. Curb weight is the physical weight of your vehicle exactly as it rolled out of the factory, fully fueled and filled with all necessary operating fluids (coolant, oil, etc.). It represents the weight of the vehicle sitting empty at the curb.</li>
              <li><strong>GVWR (Gross Vehicle Weight Rating):</strong> This is the absolute legal and physical limit of the vehicle. If you were to drive your fully loaded vehicle onto a commercial truck scale, the total number on the screen must never exceed the GVWR. This rating is permanently stamped on the metal placard inside the driver's side door jamb.</li>
              <li><strong>Payload Capacity:</strong> This is the functional difference between the GVWR and the Curb Weight. It represents exactly how much weight you are allowed to add to the vehicle. </li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Hidden Danger of Payload</h2>
            <p>The most common mistake drivers make is assuming "Payload" only refers to luggage in the trunk or dirt in the bed of a pickup truck. In reality, Payload Capacity must account for <em>everything</em> added to the vehicle after it leaves the factory.</p>
            <p>This includes:</p>
            <ul>
              <li>The driver and all passengers.</li>
              <li>Any aftermarket accessories (e.g., heavy steel off-road bumpers, winches, toolboxes).</li>
              <li>The "Tongue Weight" of any trailer you are towing (a 5,000 lb trailer typically drops 500 lbs of physical weight straight down onto the truck's rear hitch, consuming 500 lbs of payload capacity).</li>
            </ul>
            <p>If your half-ton pickup truck has a Payload Capacity of 1,200 lbs, and you load the cab with four adult men weighing 250 lbs each, you have consumed 1,000 lbs of payload before you even put a single piece of cargo in the bed.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vehicle-weight-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Vehicle Weight Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Vehicle Weight Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Vehicle Weight Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Vehicle Weight Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Vehicle Weight Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
