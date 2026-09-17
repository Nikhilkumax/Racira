"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Droplets, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface InjectorResults {
  injectorSizeLbHr: number;
  injectorSizeCcMin: number;
  maxHpSupported: number; // Max HP supported by calculated injectors if pushed to 100% duty cycle (not recommended)
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateInjector = (inputs: typeof DEFAULTS): InjectorResults => {
  const targetHp = parseFloat(inputs.targetHp);
  const cylinders = parseInt(inputs.cylinders, 10);
  const bsfc = parseFloat(inputs.bsfc);
  const dutyCycle = parseFloat(inputs.dutyCycle) / 100;

  if (isNaN(targetHp) || targetHp <= 0 || isNaN(cylinders) || cylinders <= 0 || isNaN(bsfc) || bsfc <= 0 || isNaN(dutyCycle) || dutyCycle <= 0 || dutyCycle > 1) {
    return {
      injectorSizeLbHr: 0, injectorSizeCcMin: 0, maxHpSupported: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers. Duty Cycle must be between 1 and 100."
    };
  }

  // Required Injector Size (lb/hr) = (Target HP * BSFC) / (Cylinders * Duty Cycle)
  const injectorSizeLbHr = (targetHp * bsfc) / (cylinders * dutyCycle);
  
  // Convert lb/hr to cc/min (industry standard conversion is * 10.5)
  const injectorSizeCcMin = injectorSizeLbHr * 10.5;

  // Max HP supported if these injectors were run at 100% duty cycle (unsafe)
  // Max HP = (Injector Size * Cylinders * 1.00) / BSFC
  const maxHpSupported = (injectorSizeLbHr * cylinders * 1.0) / bsfc;

  // Generate chart data: HP supported at various duty cycles for this specific injector
  const chartData = [];
  const schedule = [];
  
  for (let dc = 50; dc <= 100; dc += 5) {
    const hpAtDc = (injectorSizeLbHr * cylinders * (dc / 100)) / bsfc;
    chartData.push({
      "Duty Cycle": dc,
      "Supported HP": Math.round(hpAtDc)
    });
    
    if (dc % 10 === 0 || dc === 85) {
      schedule.push({
        dutyCycle: dc,
        hp: Math.round(hpAtDc)
      });
    }
  }

  return {
    injectorSizeLbHr: Number(injectorSizeLbHr.toFixed(1)),
    injectorSizeCcMin: Math.round(injectorSizeCcMin),
    maxHpSupported: Math.round(maxHpSupported),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  targetHp: "500",
  cylinders: "8",
  engineType: "na_gas", // Used to set BSFC default
  bsfc: "0.50",
  dutyCycle: "80"
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
        <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function FuelInjectorCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<InjectorResults>(calculateInjector(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTypeChange = (type: string) => {
    let newBsfc = "0.50";
    if (type === "na_gas") newBsfc = "0.50";
    else if (type === "boost_gas") newBsfc = "0.60";
    else if (type === "na_e85") newBsfc = "0.65";
    else if (type === "boost_e85") newBsfc = "0.75";
    else if (type === "custom") newBsfc = inputs.bsfc;

    const newInputs = { ...inputs, engineType: type, bsfc: newBsfc };
    setInputs(newInputs);
    setResults(calculateInjector(newInputs));
  };

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    if (key === "bsfc") newInputs.engineType = "custom";
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateInjector(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleCalculate = () => {
    const r = calculateInjector(inputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateInjector(DEFAULTS));
  };

  const faqs = [
    { question: "What is BSFC (Brake Specific Fuel Consumption)?", answer: "BSFC is a ratio that tells you how efficiently an engine creates horsepower from fuel. Specifically, it measures how many pounds of fuel an engine must burn per hour to produce one horsepower. Naturally aspirated engines are very efficient (BSFC of ~0.50). Supercharged engines are less efficient because the engine must use fuel to spin the heavy supercharger (BSFC of ~0.60 to 0.65)." },
    { question: "Why do E85 engines need bigger injectors?", answer: "E85 (85% ethanol) contains less energy per gallon than pure gasoline. To produce the exact same amount of horsepower, an engine must burn roughly 30% more E85 fuel. Therefore, if you switch your car to run on E85, you must upgrade your fuel injectors and fuel pump to handle the massive increase in required flow volume." },
    { question: "What is Injector Duty Cycle?", answer: "Duty cycle is the percentage of time that a fuel injector is physically held open to spray fuel into the engine during a single engine cycle. A 100% duty cycle means the injector is held wide open continuously and has literally reached its maximum possible flow limit. It cannot provide any more fuel, regardless of engine demand." },
    { question: "Why is an 80% maximum Duty Cycle recommended?", answer: "Fuel injectors are highly sensitive electromagnetic valves. If you run them at 100% duty cycle (wide open constantly), the internal electromagnets will overheat and fail. Furthermore, running at 100% leaves you with zero safety margin. If the weather gets incredibly cold (creating dense air that needs more fuel), the engine will run lean and detonate because the injectors cannot supply any extra fuel. Sizing injectors for an 80% maximum duty cycle ensures they run cool and always have a 20% safety buffer." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Fuel Injector Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fuel Injector Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine the exact fuel injector size required to safely support your target engine horsepower.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="hp" label="Target Crank HP" value={inputs.targetHp} onChange={(v: string) => handleChange("targetHp", v)} suffix="HP" placeholder="500" />
              <CompactInput id="cyl" label="Number of Cylinders" value={inputs.cylinders} onChange={(v: string) => handleChange("cylinders", v)} placeholder="8" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="type" label="Engine Setup & Fuel Type" value={inputs.engineType} onChange={handleTypeChange} options={[
                { label: "Naturally Aspirated (Gasoline)", value: "na_gas" },
                { label: "Supercharged / Turbocharged (Gasoline)", value: "boost_gas" },
                { label: "Naturally Aspirated (E85)", value: "na_e85" },
                { label: "Supercharged / Turbocharged (E85)", value: "boost_e85" },
                { label: "Custom Setup", value: "custom" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="bsfc" label="BSFC Value" value={inputs.bsfc} onChange={(v: string) => handleChange("bsfc", v)} step="0.01" />
              <CompactInput id="duty" label="Max Duty Cycle" value={inputs.dutyCycle} onChange={(v: string) => handleChange("dutyCycle", v)} suffix="%" placeholder="80" />
            </div>
            
            <div className="text-[10px] text-muted-foreground">
              * Recommended Max Duty Cycle is 80-85% for safety and reliability.
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Required Size (US)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-primary tracking-tighter">{results.injectorSizeLbHr}</div>
                      <div className="text-xl font-bold text-primary mb-1">lb/hr</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Required Size (Metric)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.injectorSizeCcMin}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">cc/min</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Target Power</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.targetHp} HP</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Max Duty Cycle</div>
                    <div className="text-2xl font-bold text-blue-500">{inputs.dutyCycle}%</div>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-destructive uppercase font-bold mb-1">100% Max HP</div>
                    <div className="text-2xl font-bold text-destructive">{results.maxHpSupported} HP</div>
                    <div className="text-[10px] text-muted-foreground">(Unsafe to run at 100%)</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Horsepower Supported by {results.injectorSizeLbHr} lb/hr Injectors</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Duty Cycle" tickFormatter={(val) => `${val}%`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} HP`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.dutyCycle)} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Target DC', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} HP`, 'Supported']}
                          labelFormatter={(label) => `Duty Cycle: ${label}%`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="Supported HP" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Duty Cycle Flow Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Duty Cycle</th>
                          <th className="px-4 py-3 font-semibold text-right">Supported HP</th>
                          <th className="px-4 py-3 font-semibold text-right">Safety Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => {
                          let status = "Safe";
                          let color = "text-emerald-500";
                          if (row.dutyCycle > 85) { status = "Warning"; color = "text-orange-500"; }
                          if (row.dutyCycle >= 95) { status = "Dangerous"; color = "text-destructive font-bold"; }
                          
                          return (
                            <tr key={row.dutyCycle} className={`hover:bg-muted/20 transition-colors ${row.dutyCycle == inputs.dutyCycle ? 'bg-primary/5' : ''}`}>
                              <td className="px-4 py-3 font-medium text-foreground">{row.dutyCycle}%</td>
                              <td className="px-4 py-3 text-right font-bold text-foreground">{row.hp} HP</td>
                              <td className={`px-4 py-3 text-right ${color}`}>{status}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
            <h2 className="text-2xl font-bold mb-3">Why Fuel Injector Sizing is Critical</h2>
            <p>If you are upgrading your engine to make more horsepower—whether by installing a supercharger, adding a turbo, or switching to E85 fuel—your factory fuel injectors will rapidly become a bottleneck. An engine requires a very precise ratio of air to fuel to operate safely. If you force massive amounts of air into the engine, but the injectors are too small to supply the matching amount of fuel, the engine will run "lean." A lean engine runs violently hot and will suffer from detonation, quickly melting pistons and destroying the block. Our Fuel Injector Calculator uses strict engineering formulas to ensure you buy the exact size injector required to safely support your horsepower goals.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding BSFC (Brake Specific Fuel Consumption)</h2>
            <p>The core of injector sizing math relies on BSFC. BSFC is an efficiency rating that defines exactly how many pounds of fuel an engine must burn per hour to generate a single horsepower. A lower number means the engine is highly efficient.</p>
            <ul>
              <li><strong>Naturally Aspirated (Gasoline):</strong> ~0.45 to 0.50. These engines do not have to fight the parasitic drag of a supercharger, making them very efficient at converting fuel into power.</li>
              <li><strong>Supercharged (Gasoline):</strong> ~0.60 to 0.65. A supercharger is driven by a belt attached to the engine's crankshaft. It takes tremendous power just to spin the supercharger rotors. Therefore, the engine must burn a lot of extra fuel just to break even, resulting in worse efficiency.</li>
              <li><strong>Turbocharged (Gasoline):</strong> ~0.55 to 0.60. Turbos are driven by waste exhaust gas, making them more efficient than superchargers, but they still create exhaust backpressure that slightly lowers engine efficiency.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The E85 Fuel Dilemma</h2>
            <p>E85 (a blend of 85% ethanol and 15% gasoline) is incredibly popular in the performance world because it has an extremely high octane rating, allowing builders to run massive amounts of boost without detonation. However, ethanol contains roughly 30% less energy per gallon than pure gasoline. Therefore, to make the exact same horsepower on E85, you must physically flow 30% more fuel into the cylinders. This requires a massive increase in injector size. An engine that only requires a 60 lb/hr injector on pump gas will require an 80+ lb/hr injector to run E85.</p>

            <h2 className="text-2xl font-bold mb-3">The 80% Duty Cycle Rule</h2>
            <p>Fuel injectors are electromagnetic valves that open and close thousands of times per minute. <strong>Duty Cycle</strong> refers to the percentage of time the valve is held open during a single combustion cycle. A 100% duty cycle means the injector is held wide open constantly and has reached its absolute physical limit. It is an industry-standard rule to size injectors so that they never exceed an 80% to 85% duty cycle.</p>
            <p>Why? If an injector is held open continuously (approaching 100%), the electromagnet inside will overheat, leading to catastrophic failure. Furthermore, leaving a 20% safety buffer ensures that if the air temperature suddenly drops (cold air is denser and requires more fuel), the ECU has the physical capacity to add extra fuel to prevent the engine from running lean.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fuel-injector-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
