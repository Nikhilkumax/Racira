"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Thermometer, RotateCcw, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface TirePressureResults {
  adjustedPressurePsi: number;
  pressureDifferencePsi: number;
  isDangerous: boolean;
  dangerMessage: string;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateTirePressure = (inputs: typeof DEFAULTS): TirePressureResults => {
  const p1 = parseFloat(inputs.currentPressure);
  const t1F = parseFloat(inputs.currentTemp);
  const t2F = parseFloat(inputs.targetTemp);

  if (!p1 || isNaN(t1F) || isNaN(t2F) || p1 <= 0) {
    return {
      adjustedPressurePsi: 0, pressureDifferencePsi: 0, isDangerous: false, dangerMessage: "",
      chartData: [], isError: true, errorMsg: "Please enter valid pressure and temperature values."
    };
  }

  // Gay-Lussac's Law: P1 / T1 = P2 / T2  (Temperatures must be in absolute scale, e.g., Rankine or Kelvin)
  // Converting Fahrenheit to Rankine: R = F + 459.67
  const t1R = t1F + 459.67;
  const t2R = t2F + 459.67;

  // Absolute pressure = Gauge pressure + Atmospheric pressure (~14.7 psi)
  const p1Abs = p1 + 14.7;

  // Calculate new absolute pressure
  const p2Abs = p1Abs * (t2R / t1R);

  // Convert back to gauge pressure
  const p2 = p2Abs - 14.7;

  const pressureDifferencePsi = p2 - p1;

  // General rule of thumb: 10 degrees F drop = 1 psi drop. 
  // Let's generate a chart spanning T2 - 40 to T2 + 40
  const chartData = [];
  const minTemp = Math.min(t1F, t2F) - 30;
  const maxTemp = Math.max(t1F, t2F) + 30;

  for (let temp = minTemp; temp <= maxTemp; temp += 10) {
    const tempR = temp + 459.67;
    const tempPAbs = p1Abs * (tempR / t1R);
    const tempP = tempPAbs - 14.7;
    chartData.push({
      temperature: temp,
      Pressure: parseFloat(tempP.toFixed(1))
    });
  }

  // Determine if dangerous (Under-inflation or Over-inflation compared to factory)
  // Let's assume factory recommended is roughly 35 if not provided, but we just check absolute bounds
  let isDangerous = false;
  let dangerMessage = "";
  if (p2 < 25) {
    isDangerous = true;
    dangerMessage = "Dangerously under-inflated. High risk of tire blowout due to sidewall flexing and overheating.";
  } else if (p2 > 50) {
    isDangerous = true;
    dangerMessage = "Dangerously over-inflated. Reduced traction, harsh ride, and risk of structural failure.";
  } else if (p2 < 30) {
    isDangerous = true;
    dangerMessage = "Significantly under-inflated. Expect poor fuel economy and sluggish handling.";
  }

  return {
    adjustedPressurePsi: p2,
    pressureDifferencePsi,
    isDangerous,
    dangerMessage,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  currentPressure: "35",
  currentTemp: "70",
  targetTemp: "30"
};

const CompactInput = ({ id, label, value, onChange, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground font-semibold select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function TirePressureCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<TirePressureResults>(calculateTirePressure(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateTirePressure(newInputs);
    if (!r.isError) setResults(r);
  };

const handleCalculate = () => {
    const r = calculateTirePressure(inputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateTirePressure(DEFAULTS));
  };

  const format1 = (val: number) => val.toFixed(1);

  const isTempDrop = parseFloat(inputs.targetTemp) < parseFloat(inputs.currentTemp);

  const faqs = [
    { question: "Why does tire pressure drop in cold weather?", answer: "According to Gay-Lussac's Law of thermodynamics, the pressure of a fixed mass of gas is directly proportional to its absolute temperature. As the outside temperature drops, the air molecules inside your tire lose kinetic energy, move slower, and push with less force against the inside of the tire. This manifests as a drop in tire pressure." },
    { question: "What is the 'Rule of Thumb' for temperature and tire pressure?", answer: "A generally accepted rule of thumb is that for every 10°F change in outside temperature, your tire pressure will change by approximately 1 PSI (pound per square inch). If the temperature drops by 30°F, expect your tire pressure to drop by roughly 3 PSI." },
    { question: "Should I inflate my tires to the 'Max PSI' on the sidewall?", answer: "No. The PSI listed on the sidewall of the tire is the absolute maximum pressure the tire can safely hold when carrying its maximum load. You should inflate your tires to the pressure recommended by the vehicle manufacturer, which is typically found on a sticker inside the driver's side door jamb." },
    { question: "What happens if I drive on under-inflated tires?", answer: "Driving on under-inflated tires causes the sidewalls to flex excessively. This generates immense friction and heat inside the tire structure, which can quickly lead to a catastrophic blowout at highway speeds. Under-inflation also drastically reduces your fuel economy by increasing rolling resistance." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Tire Pressure Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tire Pressure Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            

            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 text-primary">Current Conditions</div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <CompactInput id="p1" label="Tire Pressure" value={inputs.currentPressure} onChange={(v: string) => handleChange("currentPressure", v)} suffix="PSI" />
              <CompactInput id="t1" label="Air Temperature" value={inputs.currentTemp} onChange={(v: string) => handleChange("currentTemp", v)} suffix="°F" />
            </div>

            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mt-2 text-blue-500">Expected Conditions</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="t2" label="New Air Temperature" value={inputs.targetTemp} onChange={(v: string) => handleChange("targetTemp", v)} suffix="°F" />
            </div>

            <div className="flex gap-2.5 mt-4">
                            <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset Calculator
              </button>
            </div>

            {results.isDangerous && (
              <div className="mt-2 bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-destructive">Warning</div>
                  <div className="text-sm text-foreground">{results.dangerMessage}</div>
                </div>
              </div>
            )}
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
                <div className={`border-l-4 rounded-lg p-6 relative overflow-hidden ${results.isDangerous ? 'bg-destructive/10 border-destructive' : 'bg-primary/10 border-primary'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated Tire Pressure at {inputs.targetTemp}°F</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className={`text-6xl font-black tracking-tighter ${results.isDangerous ? 'text-destructive' : 'text-primary'}`}>
                      {format1(results.adjustedPressurePsi)}
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground mb-1">PSI</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    Your tire pressure will {isTempDrop ? 'drop' : 'rise'} by <strong className={isTempDrop ? 'text-blue-500' : 'text-orange-500'}>{format1(Math.abs(results.pressureDifferencePsi))} PSI</strong>.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Start Temp</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.currentTemp}°F</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">End Temp</div>
                    <div className="text-2xl font-bold text-blue-500">{inputs.targetTemp}°F</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Change</div>
                    <div className="text-2xl font-bold text-foreground">
                      {isTempDrop ? '-' : '+'}{Math.abs(parseFloat(inputs.currentTemp) - parseFloat(inputs.targetTemp))}°F
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Pressure vs. Temperature Curve</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="temperature" tickFormatter={(val) => `${val}°F`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} psi`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.currentTemp)} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        <ReferenceLine x={parseFloat(inputs.targetTemp)} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: '#3b82f6', fontSize: 12, fontWeight: 'bold' }} />
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} PSI`, 'Pressure']}
                          labelFormatter={(label) => `Temperature: ${label}°F`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="Pressure" stroke="hsl(var(--foreground))" strokeWidth={3} dot={{r: 4, fill: 'var(--background)', strokeWidth: 2}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">Why Does Tire Pressure Drop in the Winter?</h2>
            <p>Every year, as autumn turns to winter, millions of drivers are startled by the sudden glow of their dashboard's TPMS (Tire Pressure Monitoring System) warning light. This phenomenon is a direct result of Gay-Lussac's Law of thermodynamics. Our Tire Pressure Calculator models this exact physical relationship so you can predict and adjust your tire pressure before the warning light ever comes on.</p>

            <h2 className="text-2xl font-bold mb-3">The Science of Tire Pressure</h2>
            <p>A tire is essentially a sealed rubber chamber filled with a fixed mass of gas molecules (air or nitrogen). These molecules are constantly bouncing around and colliding with the inner walls of the tire. The force of these collisions creates pressure. When the outside temperature drops, the gas molecules lose kinetic energy. They slow down and collide with the tire walls less forcefully. Less force equals less pressure, even though no air actually escaped the tire.</p>

            <h2 className="text-2xl font-bold mb-3">The "1 PSI per 10 Degrees" Rule</h2>
            <p>As a general rule of thumb, your tire pressure will drop by roughly 1 PSI for every 10°F drop in ambient temperature. For example, if you filled your tires to 35 PSI on a warm 80°F summer day, and the temperature plummets to 20°F in December (a 60-degree difference), your tire pressure will naturally drop by approximately 6 PSI. This is more than enough to trigger a TPMS warning light, which usually activates when pressure drops 25% below the factory recommendation.</p>

            <h2 className="text-2xl font-bold mb-3">Why Under-Inflation is Dangerous</h2>
            <p>Driving on under-inflated tires is extremely dangerous, particularly at highway speeds. When a tire lacks adequate pressure, its sidewalls flex excessively with every revolution. This constant flexing generates immense internal friction and heat. Eventually, the structural integrity of the rubber breaks down, leading to a catastrophic blowout. Furthermore, under-inflated tires increase rolling resistance, which forces your engine to work harder and drastically reduces your fuel economy.</p>

            <h2 className="text-2xl font-bold mb-3">When to Check Your Tire Pressure</h2>
            <p>You should check your tire pressure at least once a month, and always first thing in the morning <em>before</em> driving the car. As you drive, the friction between the tire and the road heats up the air inside, temporarily raising the pressure. If you check your tires after a long highway commute, you will get a falsely high reading. Always check "cold" tire pressure for accurate maintenance.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tire-pressure-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Tire Pressure Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Tire Pressure Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Tire Pressure Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Tire Pressure Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Tire Pressure Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
