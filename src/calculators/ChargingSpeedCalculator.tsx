"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface ChargeSpeedResults {
  timeToChargeHours: number;
  timeFormatted: string;
  kwhNeededRaw: number;
  kwhNeededTotal: number;
  milesAdded: number;
  averageSpeedKw: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateChargingSpeed = (inputs: typeof DEFAULTS): ChargeSpeedResults => {
  const batteryCapacity = parseFloat(inputs.batteryCapacity) || 0;
  const startPercent = parseFloat(inputs.startPercent) || 0;
  const endPercent = parseFloat(inputs.endPercent) || 0;
  let chargerPower = parseFloat(inputs.chargerPower) || 0;
  
  // Advanced
  const chargingLossPct = parseFloat(inputs.chargingLoss) / 100 || 0;
  const evEfficiency = parseFloat(inputs.evEfficiency) || 0; // mi/kWh
  const batteryTemp = inputs.batteryTemp as "cold" | "optimal" | "hot";

  if (batteryCapacity <= 0 || chargerPower <= 0) {
    return {
      timeToChargeHours: 0, timeFormatted: "0h 0m", kwhNeededRaw: 0, kwhNeededTotal: 0,
      milesAdded: 0, averageSpeedKw: 0, chartData: [],
      isError: true, errorMsg: "Battery capacity and charger power must be greater than zero."
    };
  }

  if (startPercent >= endPercent) {
    return {
      timeToChargeHours: 0, timeFormatted: "0h 0m", kwhNeededRaw: 0, kwhNeededTotal: 0,
      milesAdded: 0, averageSpeedKw: 0, chartData: [],
      isError: true, errorMsg: "Target percentage must be greater than starting percentage."
    };
  }

  // Handle temperature throttling (very rough estimate)
  if (batteryTemp === "cold") {
    chargerPower *= 0.6; // Cold gating reduces speed significantly
  } else if (batteryTemp === "hot") {
    chargerPower *= 0.8; // Thermal throttling
  }

  // Calculate raw energy needed
  const percentToFill = (endPercent - startPercent) / 100;
  const kwhNeededRaw = batteryCapacity * percentToFill;

  // Account for charging losses
  const kwhNeededTotal = kwhNeededRaw / (1 - chargingLossPct);

  // Time calculation
  // Charging is NOT linear, especially for DC Fast Charging (high kW).
  // Above 80%, charging slows down drastically to protect the battery.
  let totalTimeHours = 0;
  let chartData = [];
  
  let currentKwh = batteryCapacity * (startPercent / 100);
  let currentPercent = startPercent;
  let elapsedHours = 0;

  // Simulate charging in 1% increments
  const stepKwh = batteryCapacity * 0.01;
  const stepKwhWithLoss = stepKwh / (1 - chargingLossPct);

  chartData.push({
    time: elapsedHours,
    percent: currentPercent,
    kw: 0 // Will populate dynamically
  });

  while (currentPercent < endPercent) {
    // Determine current charging speed based on SoC (State of Charge)
    let currentSpeedKw = chargerPower;

    // Apply charge curve logic
    // AC charging (usually < 22kW) is mostly flat until 95%
    // DC charging (usually > 50kW) tapers heavily
    if (chargerPower > 22) {
      if (currentPercent > 80) currentSpeedKw = chargerPower * 0.3; // Drops drastically above 80%
      else if (currentPercent > 60) currentSpeedKw = chargerPower * 0.6;
      else if (currentPercent > 40) currentSpeedKw = chargerPower * 0.8;
      // Below 40%, assume full power (if battery optimal)
    } else {
      // AC Charging
      if (currentPercent > 95) currentSpeedKw = chargerPower * 0.5; // Tapers only at the very top
    }

    // Time to add this 1% step
    const timeForStep = stepKwhWithLoss / currentSpeedKw;
    
    elapsedHours += timeForStep;
    currentPercent += 1;
    currentKwh += stepKwh;

    // Only add to chart every 5% for performance, or at the end
    if (currentPercent % 5 === 0 || currentPercent === endPercent) {
      chartData.push({
        time: elapsedHours,
        timeLabel: `${Math.floor(elapsedHours)}h ${Math.round((elapsedHours % 1) * 60)}m`,
        percent: currentPercent,
        kw: currentSpeedKw
      });
    }
  }

  totalTimeHours = elapsedHours;

  const hrs = Math.floor(totalTimeHours);
  const mins = Math.round((totalTimeHours - hrs) * 60);
  const timeFormatted = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const milesAdded = kwhNeededRaw * evEfficiency;
  const averageSpeedKw = kwhNeededTotal / totalTimeHours;

  return {
    timeToChargeHours: totalTimeHours,
    timeFormatted,
    kwhNeededRaw,
    kwhNeededTotal,
    milesAdded,
    averageSpeedKw,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  batteryCapacity: "75",
  startPercent: "20",
  endPercent: "80",
  chargerPreset: "150", // Custom mapped to kW
  chargerPower: "150",
  // Advanced
  chargingLoss: "10",
  evEfficiency: "4.0",
  batteryTemp: "optimal"
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
export default function ChargingSpeedCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<ChargeSpeedResults>(calculateChargingSpeed(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    let newInputs = { ...inputs, [key]: val };
    
    // Auto-update charger power if preset changes
    if (key === "chargerPreset") {
      if (val !== "custom") {
        newInputs.chargerPower = val;
      }
    }
    
    setInputs(newInputs);
  };

  const handleCalculate = () => {
    setResults(calculateChargingSpeed(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateChargingSpeed(DEFAULTS));
  };

  const faqs = [
    { question: "Why does charging slow down after 80%?", answer: "Lithium-ion batteries accept energy rapidly when they are relatively empty. As they fill up, it becomes harder to force lithium ions into the anode without causing physical damage or generating dangerous amounts of heat. To protect battery longevity and prevent thermal runaway, the car's computer intentionally slows down the charging speed dramatically once it reaches 80%." },
    { question: "What is a 'Charge Curve'?", answer: "A charge curve is a graph that plots charging speed (kW) against the battery's state of charge (%). If you plug into a 150kW fast charger, your car does not pull 150kW the entire time. It might pull 150kW from 10% to 40%, drop to 100kW at 60%, and drop to 40kW at 80%. This non-linear speed is the charge curve." },
    { question: "Why does cold weather make charging so slow?", answer: "Cold temperatures slow down the chemical reactions inside the battery. If you plug a freezing cold battery into a fast charger, the car will 'gate' the charge (restrict the power input) to protect the cells until the battery's internal heating system can warm it up to optimal temperatures." },
    { question: "What is the difference between Level 1, Level 2, and Level 3 charging?", answer: "Level 1 uses a standard 120V wall outlet (approx 1.4 kW) and adds about 3-5 miles of range per hour. Level 2 uses a 240V outlet (like an oven or dryer plug) operating at 7-11 kW, allowing a full charge overnight. Level 3 (DC Fast Charging) uses specialized commercial infrastructure pushing 50-350 kW, capable of charging a car in 20-40 minutes." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "EV Charging Speed Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV Charging Speed Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="start-percent" label="Starting Charge" value={inputs.startPercent} onChange={(v: string) => handleChange("startPercent", v)} suffix="%" />
              <CompactInput id="end-percent" label="Target Charge" value={inputs.endPercent} onChange={(v: string) => handleChange("endPercent", v)} suffix="%" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="battery-capacity" label="Battery Capacity" value={inputs.batteryCapacity} onChange={(v: string) => handleChange("batteryCapacity", v)} suffix="kWh" tooltip="Check your owner's manual. Typical values: 50-100 kWh." />
            </div>

            <div className="flex flex-col border-t border-border pt-4 mt-2">
              <label className="text-base font-medium text-foreground mb-1.5">Charger Type / Power</label>
              <select value={inputs.chargerPreset} onChange={(e) => handleChange("chargerPreset", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 h-10 shadow-sm focus:ring-2 focus:ring-primary/20 mb-3">
                <option value="1.4">Level 1 Wall Outlet (1.4 kW)</option>
                <option value="7.6">Level 2 Home Charger (32A / 7.6 kW)</option>
                <option value="9.6">Level 2 Home Charger (40A / 9.6 kW)</option>
                <option value="11.5">Level 2 Home Charger (48A / 11.5 kW)</option>
                <option value="50">DC Fast Charger (50 kW)</option>
                <option value="150">Tesla Supercharger V2 / DCFC (150 kW)</option>
                <option value="250">Tesla Supercharger V3 / DCFC (250 kW)</option>
                <option value="350">Electrify America Ultra-Fast (350 kW)</option>
                <option value="custom">Custom Power...</option>
              </select>

              {inputs.chargerPreset === "custom" && (
                <CompactInput id="charger-power" label="Custom Charger Output" value={inputs.chargerPower} onChange={(v: string) => handleChange("chargerPower", v)} suffix="kW" />
              )}
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Temp & Efficiency) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="charging-loss" label="Charging Loss" value={inputs.chargingLoss} onChange={(v: string) => handleChange("chargingLoss", v)} suffix="%" tooltip="Energy lost as heat during conversion (typically 10% for AC, 5% for DC)" />
                  <CompactInput id="ev-eff" label="Vehicle Efficiency" value={inputs.evEfficiency} onChange={(v: string) => handleChange("evEfficiency", v)} suffix="mi/kWh" tooltip="Used to calculate 'miles added' during the session." />
                  <CompactInput id="battery-temp" label="Battery Temperature" value={inputs.batteryTemp} onChange={(v: string) => handleChange("batteryTemp", v)} options={[
                    { label: "Optimal (Preconditioned / 70°F+)", value: "optimal" },
                    { label: "Cold (Winter / Not preconditioned)", value: "cold" },
                    { label: "Hot (Extreme Summer)", value: "hot" }
                  ]} />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Zap className="h-4 w-4" /> Calculate Time
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Charge Time</div>
                  <div className="text-5xl font-bold text-primary mb-1">{results.timeFormatted}</div>
                  <div className="text-sm text-muted-foreground">To charge from {inputs.startPercent}% to {inputs.endPercent}% at max {inputs.chargerPower} kW.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Energy Added</div>
                    <div className="text-lg font-bold text-[#3b82f6]">{results.kwhNeededRaw.toFixed(1)} kWh</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Miles Added</div>
                    <div className="text-lg font-bold text-[#10b981]">{Math.round(results.milesAdded)} mi</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Avg Speed</div>
                    <div className="text-lg font-bold text-foreground">{results.averageSpeedKw.toFixed(1)} kW</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Estimated Charge Curve</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="percent" tickFormatter={(val) => `${val}%`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={[inputs.startPercent, inputs.endPercent]} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tickFormatter={(val) => `${val}kW`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => {
                            if (name === "kw") return [`${value.toFixed(1)} kW`, "Charging Speed"];
                            return [value, name];
                          }} 
                          labelFormatter={(label) => `State of Charge: ${label}%`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line yAxisId="left" type="monotone" dataKey="kw" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6}} name="kw" />
                        <ReferenceLine yAxisId="left" x={80} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '80% Taper', fill: '#ef4444', fontSize: 12 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Notice how DC fast charging (if selected) tapers aggressively as the battery fills.</p>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is an EV Charging Speed Calculator?</h2>
            <p>An EV Charging Speed Calculator is a specialized tool designed to estimate exactly how long it will take to charge an Electric Vehicle battery. Unlike filling a gas tank, which takes exactly 3 minutes regardless of how empty the tank is, charging a battery is an incredibly dynamic process. It depends on the size of the battery, the maximum output of the charger, and crucially, the battery's current State of Charge (SoC). This calculator factors in these complex variables to provide a realistic time estimate.</p>

            <h2>How It Works</h2>
            <p>The core mathematical formula is simple: <strong>Time = Energy Needed / Charging Power</strong>. If you need 50 kWh of energy and plug into a 10 kW charger, it will take roughly 5 hours. However, real-world charging is not linear. Our algorithm simulates a "Charge Curve." If you are using a high-power DC Fast Charger, the calculator assumes your car will accept maximum power when the battery is low, but will begin to restrict (taper) that power as the battery fills up to prevent overheating.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Estimated Charge Time</strong> is the total hours and minutes you will be tethered to the charger. The <strong>Energy Added</strong> metric shows exactly how many kilowatt-hours (kWh) will be deposited into the battery, and the <strong>Miles Added</strong> converts that energy into practical driving distance based on your vehicle's efficiency.</p>

            <h2>The 80% Rule</h2>
            <p>If you look at the <strong>Estimated Charge Curve</strong> chart, you will likely notice a severe drop in charging speed (kW) right around the 80% mark. This is intentional. Lithium-ion batteries accept electrons easily when empty, but as they reach capacity, it becomes harder to force energy into the cells without generating catastrophic heat. Therefore, the car's Battery Management System (BMS) steps in and drastically slows down the charge. This is why it often takes just as long to charge from 80% to 100% as it did to charge from 10% to 80%.</p>

            <h2>Key Factors</h2>
            <p>Your <strong>Charger Power</strong> is the primary bottleneck. A standard Level 1 wall outlet delivers a microscopic 1.4 kW, taking days to fill a large battery. A Level 2 home charger delivers roughly 9.6 kW, completing the task overnight. A DC Fast Charger delivers 150+ kW, completing the task in under an hour. However, your car also has a maximum acceptance rate. Plugging a Chevy Bolt (max 55kW) into a 350kW Electrify America charger will not make it charge any faster; the car will still only pull 55kW.</p>

            <h2>Advanced Features</h2>
            <p>In the Advanced Options, you can adjust <strong>Battery Temperature</strong>. Cold weather is the enemy of fast charging. If you plug a freezing cold EV into a Supercharger without pre-conditioning (warming) the battery first, the car will severely limit the charging speed to protect the cold, brittle cells. The calculator simulates this thermal throttling if you select "Cold."</p>

            <h2>Tips & Best Practices</h2>
            <p>On road trips, do not charge to 100% unless absolutely necessary to reach your next destination. Because charging slows to a crawl above 80%, it is significantly faster to unplug at 80%, drive to the next charger, and charge from 10% to 60% at maximum speed. Your total travel time will be much lower using this "hop-scotch" strategy rather than waiting for 100% at every stop.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/charging-speed-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
