"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, AlertTriangle, Battery, Navigation, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";

// 1. TypeScript interfaces
interface RangeResults {
  realWorldRange: number;
  safetyMarginMiles: number;
  safetyMarginPct: number;
  status: string;
  statusColor: string;
  arriveAtPercent: number;
  chartData: any[];
  breakdown: {
    epaRange: number;
    speedLoss: number;
    tempLoss: number;
    hvacLoss: number;
    elevationLoss: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateRange = (inputs: typeof DEFAULTS): RangeResults => {
  const currentPercent = parseFloat(inputs.currentPercent) || 0;
  const epaFullRange = parseFloat(inputs.epaFullRange) || 0;
  const distanceToDest = parseFloat(inputs.distanceToDest) || 0;
  
  const avgSpeed = parseFloat(inputs.avgSpeed) || 60;
  const temperature = parseFloat(inputs.temperature) || 70;
  const hvacLevel = inputs.hvacLevel;

  // Advanced
  const elevationChange = parseFloat(inputs.elevationChange) || 0; // Net ft up/down
  const headwind = parseFloat(inputs.headwind) || 0; // mph

  if (currentPercent <= 0 || epaFullRange <= 0 || distanceToDest <= 0) {
    return {
      realWorldRange: 0, safetyMarginMiles: 0, safetyMarginPct: 0, status: "", statusColor: "",
      arriveAtPercent: 0, chartData: [],
      breakdown: { epaRange: 0, speedLoss: 0, tempLoss: 0, hvacLoss: 0, elevationLoss: 0 },
      isError: true, errorMsg: "Battery percent, EPA range, and distance must be greater than zero."
    };
  }

  // Baseline available range
  const currentAvailableRange = epaFullRange * (currentPercent / 100);

  // Speed Penalty
  let speedMultiplier = 1.0;
  if (avgSpeed > 50) {
    speedMultiplier = Math.max(0.50, 1 - ((avgSpeed - 50) * 0.015));
  } else if (avgSpeed < 40 && avgSpeed > 15) {
    speedMultiplier = 1.10; // Better in city
  }
  const rangeAfterSpeed = currentAvailableRange * speedMultiplier;
  const speedLoss = currentAvailableRange - rangeAfterSpeed;

  // Temp Penalty
  let tempMultiplier = 1.0;
  if (temperature < 70) {
    tempMultiplier = Math.max(0.60, 1 - ((70 - temperature) * 0.005));
  }
  const rangeAfterTemp = rangeAfterSpeed * tempMultiplier;
  const tempLoss = rangeAfterSpeed - rangeAfterTemp;

  // HVAC Penalty
  let hvacMultiplier = 1.0;
  if (hvacLevel === "high") hvacMultiplier = 0.85;
  else if (hvacLevel === "low") hvacMultiplier = 0.95;
  if (temperature < 40 && hvacLevel !== "off") hvacMultiplier -= 0.10; // Extra heater penalty
  
  const rangeAfterHvac = rangeAfterTemp * hvacMultiplier;
  const hvacLoss = rangeAfterTemp - rangeAfterHvac;

  // Elevation and Wind Penalty (Flat deduction)
  // 1 mile lost per 100ft gained. Gaining 1 mile per 200ft dropped.
  let elevationLoss = 0;
  if (elevationChange > 0) {
    elevationLoss = (elevationChange / 100) * 1.5;
  } else if (elevationChange < 0) {
    elevationLoss = (elevationChange / 200) * 1.0; // Negative loss (gain)
  }

  // 1% loss per mph of headwind
  const windMultiplier = Math.max(0.70, 1 - (headwind * 0.01));
  
  let finalRealWorldRange = (rangeAfterHvac * windMultiplier) - elevationLoss;
  if (finalRealWorldRange < 0) finalRealWorldRange = 0;

  // Final calcs
  const safetyMarginMiles = finalRealWorldRange - distanceToDest;
  const arriveAtPercent = (safetyMarginMiles / epaFullRange) * 100;
  const safetyMarginPct = arriveAtPercent;

  let status = "N/A";
  let statusColor = "";
  if (safetyMarginMiles < 0) {
    status = "Danger: You Will Not Make It";
    statusColor = "text-destructive";
  } else if (safetyMarginPct < 5) {
    status = "Warning: Extreme Range Anxiety (Arrive < 5%)";
    statusColor = "text-orange-500";
  } else if (safetyMarginPct < 15) {
    status = "Caution: Low Buffer (Arrive < 15%)";
    statusColor = "text-amber-500";
  } else {
    status = "Safe: Plenty of Range";
    statusColor = "text-emerald-600";
  }

  // Chart Data: Plotting the journey
  // X: Distance driven (0 to Destination)
  // Y: Battery % remaining
  let chartData = [];
  const startY = currentPercent;
  const endY = arriveAtPercent; // Can be negative
  
  for (let i = 0; i <= distanceToDest; i += Math.max(1, Math.round(distanceToDest / 10))) {
    // Linear interpolation of battery drain over distance
    const pctComplete = i / distanceToDest;
    const currentBatt = startY - (startY - endY) * pctComplete;
    
    chartData.push({
      distance: i,
      battery: currentBatt,
      isZero: currentBatt <= 0 ? 0 : null
    });
  }

  // Ensure end point is exactly plotted
  if (chartData[chartData.length - 1].distance !== distanceToDest) {
    chartData.push({
      distance: distanceToDest,
      battery: endY,
      isZero: endY <= 0 ? 0 : null
    });
  }

  return {
    realWorldRange: finalRealWorldRange,
    safetyMarginMiles,
    safetyMarginPct,
    status,
    statusColor,
    arriveAtPercent,
    chartData,
    breakdown: {
      epaRange: currentAvailableRange,
      speedLoss,
      tempLoss,
      hvacLoss,
      elevationLoss: elevationLoss + (rangeAfterHvac - (rangeAfterHvac * windMultiplier))
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  currentPercent: "60",
  epaFullRange: "250",
  distanceToDest: "110",
  avgSpeed: "75",
  temperature: "45",
  hvacLevel: "low",
  // Advanced
  elevationChange: "2000",
  headwind: "0"
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
export default function RangeAnxietyCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RangeResults>(calculateRange(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateRange(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateRange(DEFAULTS));
  };

  const faqs = [
    { question: "What causes 'Range Anxiety'?", answer: "Range anxiety is the fear that an electric vehicle will run out of power before reaching a destination or charging station. It stems from the fact that EPA range estimates are highly optimistic, charging stations are less ubiquitous than gas stations, and charging takes significantly longer than pumping gas." },
    { question: "Why is the car's 'Guess-O-Meter' wrong?", answer: "Your car's dashboard range estimator (often called a GOM or Guess-O-Meter) predicts future range based on your recent past driving behavior. If you just spent 30 minutes in slow city traffic, it will predict a very high range. If you immediately get on a 75 mph highway and drive up a mountain, the GOM will plummet rapidly, causing severe anxiety because it was not predicting your future route." },
    { question: "How does elevation affect EV range?", answer: "Drastically. EVs are incredibly heavy due to their battery packs. Lifting a 4,500-pound vehicle up a 3,000-foot mountain pass requires immense amounts of energy, rapidly draining the battery. While you will recover some energy via regenerative braking on the way down, the net energy loss of driving over a mountain is significant." },
    { question: "What is a safe buffer to arrive with?", answer: "Most experienced EV drivers aim to arrive at a fast charger with no less than 10% to 15% battery remaining. This provides a safety buffer in case the charger is broken, occupied, or if they encounter an unexpected detour or massive headwind on the way." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Range Anxiety Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Range Anxiety Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Battery className="w-5 h-5 text-primary" /> Current Battery %</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <input type="number" value={inputs.currentPercent} onChange={e => handleChange("currentPercent", e.target.value)} className="w-full h-full px-4 text-xl font-bold bg-transparent outline-none border-none text-foreground" max="100" />
                <span className="pr-4 text-primary font-bold text-lg uppercase">%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="epa-range" label="Car's 100% EPA Range" value={inputs.epaFullRange} onChange={(v: string) => handleChange("epaFullRange", v)} suffix="mi" />
              <CompactInput id="dist" label="Dist to Destination" value={inputs.distanceToDest} onChange={(v: string) => handleChange("distanceToDest", v)} suffix="mi" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3">Conditions</div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="speed" label="Planned Cruising Speed" value={inputs.avgSpeed} onChange={(v: string) => handleChange("avgSpeed", v)} suffix="mph" />
              <CompactInput id="temp" label="Outside Temp" value={inputs.temperature} onChange={(v: string) => handleChange("temperature", v)} suffix="°F" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="hvac-level" label="Climate Control Use" value={inputs.hvacLevel} onChange={(v: string) => handleChange("hvacLevel", v)} options={[
                { label: "Off (Minimal battery draw)", value: "off" },
                { label: "Low (Normal A/C)", value: "low" },
                { label: "High (Max Heat/AC)", value: "high" }
              ]} />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Elevation & Wind) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="elevation" label="Net Elevation Gain" value={inputs.elevationChange} onChange={(v: string) => handleChange("elevationChange", v)} suffix="ft" tooltip="Enter positive for uphill, negative for downhill." />
                  <CompactInput id="wind" label="Direct Headwind" value={inputs.headwind} onChange={(v: string) => handleChange("headwind", v)} suffix="mph" />
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
                <div className={`border-l-4 rounded-lg p-5 relative ${results.safetyMarginMiles < 0 ? 'bg-destructive/10 border-destructive' : results.safetyMarginPct < 10 ? 'bg-primary/10 border-primary' : 'bg-[#10b981]/10 border-[#10b981]'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Arrival Battery</div>
                  <div className={`text-5xl font-bold mb-1 ${results.safetyMarginMiles < 0 ? 'text-destructive' : results.safetyMarginPct < 10 ? 'text-orange-500' : 'text-[#10b981]'}`}>
                    {results.arriveAtPercent < 0 ? "DEAD" : `${Math.round(results.arriveAtPercent)}%`}
                  </div>
                  <div className={`text-sm font-bold mt-1 ${results.statusColor}`}>{results.status}</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">True Range Left</div>
                    <div className="text-lg font-bold text-foreground">{Math.round(results.realWorldRange)} mi</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Dist to Target</div>
                    <div className="text-lg font-bold text-foreground">{inputs.distanceToDest} mi</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Safety Buffer</div>
                    <div className={`text-lg font-bold ${results.safetyMarginMiles < 0 ? 'text-destructive' : 'text-[#10b981]'}`}>{results.safetyMarginMiles < 0 ? '0' : Math.round(results.safetyMarginMiles)} mi</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Trip Battery Depletion</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorBatt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={results.arriveAtPercent < 10 ? "#f97316" : "#10b981"} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={results.arriveAtPercent < 10 ? "#f97316" : "#10b981"} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="distance" tickFormatter={(val) => `${Math.round(val)}mi`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={[0, inputs.distanceToDest]} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val}%`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[Math.min(0, Math.floor(results.arriveAtPercent)), Math.max(10, Math.ceil(parseFloat(inputs.currentPercent)))]} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => {
                            if (name === "battery") return [`${value.toFixed(1)}%`, "Battery Level"];
                            return [value, name];
                          }} 
                          labelFormatter={(label) => `Distance Driven: ${Math.round(Number(label))} miles`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <ReferenceLine y={0} stroke="#ef4444" strokeWidth={2} label={{ position: 'insideBottomLeft', value: 'BATTERY DEAD', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                        <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '10% Safety Buffer', fill: '#f59e0b', fontSize: 10 }} />
                        
                        <Area type="monotone" dataKey="battery" stroke={results.arriveAtPercent < 10 ? "#f97316" : "#10b981"} fillOpacity={1} fill="url(#colorBatt)" strokeWidth={3} />
                      </AreaChart>
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
                      <span className="text-muted-foreground">Base Available Range ({inputs.currentPercent}%)</span>
                      <span className="font-medium text-foreground">{Math.round(results.breakdown.epaRange)} miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Speed Penalty ({inputs.avgSpeed} mph)</span>
                      <span className="font-medium text-red-500">-{Math.round(results.breakdown.speedLoss)} miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Temperature ({inputs.temperature}°F) & HVAC</span>
                      <span className="font-medium text-red-500">-{Math.round(results.breakdown.tempLoss + results.breakdown.hvacLoss)} miles</span>
                    </div>
                    {results.breakdown.elevationLoss > 0 ? (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Elevation & Headwind</span>
                        <span className="font-medium text-red-500">-{Math.round(results.breakdown.elevationLoss)} miles</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Downhill Regen Gain</span>
                        <span className="font-medium text-emerald-500">+{Math.abs(Math.round(results.breakdown.elevationLoss))} miles</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>True Real-World Range</span>
                      <span className="text-primary">{Math.round(results.realWorldRange)} miles</span>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Range Anxiety Calculator?</h2>
            <p>A Range Anxiety Calculator is a trip-planning tool that replaces panic with mathematics. When driving an electric vehicle, trusting the dashboard's "estimated miles remaining" display can lead to severe anxiety, because that computer cannot see the massive mountain pass or the 75 mph speed limit in your immediate future. This calculator strips away the guesswork. By inputting your current battery level, destination distance, and expected driving conditions, it predicts exactly what percentage your battery will be at when you arrive.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The calculation starts with your baseline energy: your car's EPA-rated full range multiplied by your current battery percentage. However, we immediately begin applying real-world penalties to this theoretical number. The most severe penalty is the <strong>Speed Penalty</strong>. Aerodynamic drag increases exponentially; pushing a car through the air at 80 mph drains a battery vastly faster than at 55 mph. Next, we apply a <strong>Temperature Penalty</strong> (cold weather slows battery chemistry) and an <strong>HVAC Penalty</strong> (running the heater drains massive amounts of power).</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result is your <strong>Estimated Arrival Battery %</strong>. If this number is negative, you will be stranded on the side of the road. If the number is below 10%, you are in the "Danger Zone"—a single unexpected detour or strong headwind could ruin your trip. A healthy target is to arrive with a 15% safety buffer. The <strong>True Range Left</strong> metric tells you the absolute maximum distance you could drive under your specific current conditions before the car dies.</p>

            <h2 className="text-2xl font-bold mb-3">The Impact of Elevation</h2>
            <p>In the Advanced Options, you can add <strong>Net Elevation Gain</strong>. EVs are heavy. Fighting gravity requires an immense amount of energy. If you are starting at sea level and driving to a ski resort at 6,000 feet, you will lose a massive percentage of your range just climbing the hill. The calculator deducts roughly 1.5 miles of range for every 100 feet of elevation gained. (Conversely, if you are driving downhill, the calculator adds range back via regenerative braking).</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The Safe Commute.</strong> You have 60% battery left. Your car gets 250 miles at 100%. You need to drive 110 miles. Your dashboard might say you have 150 miles of range left. But you are driving 75 mph in 45-degree weather with the heater on. The calculator reveals that these conditions will slash your true range to just 115 miles. You will arrive at your destination with a terrifyingly low 3% battery. You should slow down or stop to charge.</p>
            <p><strong>Example 2: Fixing the Problem.</strong> Using the same scenario above, you are worried about arriving with 3%. You use the calculator to simulate slowing down from 75 mph to 65 mph. The math instantly changes. By simply reducing your speed, your aerodynamic drag plummets, your true range jumps to 135 miles, and you will arrive with a comfortable 11% safety buffer.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>If you find yourself experiencing range anxiety on the highway, the absolute fastest way to extend your range is to <strong>slow down</strong>. Dropping your speed by just 10 mph can restore 15% to 20% of your range instantly. Secondly, turn off the cabin heater and use the seat heaters instead. Heating the air in a car requires a 3,000-watt electric heater. Heating a seat requires a 50-watt element. Finally, if you are driving into a massive headwind, draft safely behind a large semi-truck to reduce wind resistance.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/range-anxiety-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
