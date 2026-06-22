"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Grid, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

// 1. TypeScript interfaces
interface RadiatorResults {
  requiredCoreArea: number; // Square inches
  recommendedWidth: number; // inches
  recommendedHeight: number; // inches
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateRadiator = (inputs: typeof DEFAULTS): RadiatorResults => {
  const horsepower = parseFloat(inputs.horsepower);
  const coreRows = parseInt(inputs.coreRows); // 1, 2, 3, 4

  if (isNaN(horsepower) || horsepower <= 0 || isNaN(coreRows) || coreRows <= 0) {
    return {
      requiredCoreArea: 0, recommendedWidth: 0, recommendedHeight: 0,
      chartData: [], isError: true, errorMsg: "Horsepower and Core Rows must be valid positive numbers."
    };
  }

  // Rule of thumb for standard copper/brass radiators:
  // Roughly 1.5 to 2.0 sq-in of 1-row core area per horsepower.
  // Aluminum is more efficient, but we'll use a safe conservative baseline of 1.7 sq-in for 1-row equivalent.
  // Adding rows increases capacity, but with diminishing returns because the air gets hotter as it passes through.
  // 1 Row = 1.0x capacity multiplier (baseline)
  // 2 Row = 1.6x capacity multiplier (not 2.0x)
  // 3 Row = 2.0x capacity multiplier (not 3.0x)
  // 4 Row = 2.2x capacity multiplier
  
  let rowMultiplier = 1.0;
  if (coreRows === 2) rowMultiplier = 1.6;
  if (coreRows === 3) rowMultiplier = 2.0;
  if (coreRows === 4) rowMultiplier = 2.2;

  // Calculate required baseline 1-Row Area, then adjust based on actual rows chosen
  const baselineArea = horsepower * 1.7; 
  const requiredCoreArea = baselineArea / rowMultiplier;

  // Guess a rectangular shape for the radiator, roughly a 1.5:1 to 1.8:1 width-to-height ratio (e.g. 24x16, 28x19)
  // Area = W * H, assuming W = 1.5 * H
  // Area = 1.5 * H^2
  // H = sqrt(Area / 1.5)
  const estimatedHeight = Math.sqrt(requiredCoreArea / 1.5);
  const estimatedWidth = estimatedHeight * 1.5;

  // Generate chart data: Comparing different row configurations for the SAME horsepower
  const chartData = [
    {
      name: "1-Row Thin Core",
      "Required Area (sq-in)": Math.round(baselineArea / 1.0),
      fill: "hsl(var(--destructive))" // Might be too large to fit in car
    },
    {
      name: "2-Row Standard",
      "Required Area (sq-in)": Math.round(baselineArea / 1.6),
      fill: "hsl(var(--primary))"
    },
    {
      name: "3-Row Heavy Duty",
      "Required Area (sq-in)": Math.round(baselineArea / 2.0),
      fill: "hsl(var(--blue-500))"
    },
    {
      name: "4-Row Maximum",
      "Required Area (sq-in)": Math.round(baselineArea / 2.2),
      fill: "hsl(var(--orange-500))"
    }
  ];

  return {
    requiredCoreArea: Math.round(requiredCoreArea),
    recommendedWidth: Math.round(estimatedWidth),
    recommendedHeight: Math.round(estimatedHeight),
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  horsepower: "400",
  coreRows: "2" // Common upgrade
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
export default function RadiatorSizeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RadiatorResults>(calculateRadiator(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateRadiator(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateRadiator(DEFAULTS));
  };

  const faqs = [
    { question: "Why does radiator size matter?", answer: "The radiator acts as a heat exchanger, transferring the extreme thermal energy of the engine into the passing atmosphere. The primary factor in how much heat it can dissipate is its physical Surface Area (measured in square inches). A tiny radiator simply does not have enough surface area touching the air to shed the heat generated by a large V8 engine, leading to overheating." },
    { question: "What are Radiator Rows?", answer: "Radiators are built with vertical or horizontal tubes that the liquid coolant flows through. A '1-Row' radiator has a single layer of tubes. A '2-Row' radiator is physically twice as thick, stacking a second layer of tubes behind the first. Adding rows increases the cooling capacity without increasing the height or width of the radiator, which is crucial because the front grille of a car has limited physical space." },
    { question: "Does a 2-Row radiator provide double the cooling?", answer: "No, this is a common misconception. As outside air flows through the front row of the radiator, it absorbs heat. By the time that same air reaches the second row, the air is already hot. Hot air cannot absorb as much heat as cold air. Because of this diminishing return, a 2-row radiator only provides about 60% more cooling capacity than a 1-row, not 100%. A 3-row provides about double the capacity of a 1-row." },
    { question: "Why do racers use Aluminum radiators instead of Copper/Brass?", answer: "Older vehicles used copper/brass radiators because copper is an incredible heat conductor. However, copper is very weak, so the cooling tubes had to be kept small, and the joints had to be sealed with thick, heat-blocking lead solder. Modern aluminum is much stronger, allowing for massive 1-inch or 1.5-inch cooling tubes with no heat-blocking solder. This results in significantly more internal surface area touching the coolant, making aluminum radiators vastly superior for high horsepower applications." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Radiator Size Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Radiator Size Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate the physical surface area and thickness required to keep your high-horsepower engine cool.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Thermal Load</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="hp" label="Engine Horsepower (Max)" value={inputs.horsepower} onChange={(v: string) => handleChange("horsepower", v)} suffix="HP" placeholder="400" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Core Thickness Configuration</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="rows" label="Number of Cooling Rows" value={inputs.coreRows} onChange={(v: string) => handleChange("coreRows", v)} options={[
                { label: "1-Row (Thin / Factory Standard)", value: "1" },
                { label: "2-Row (Medium / Common Upgrade)", value: "2" },
                { label: "3-Row (Thick / Heavy Duty Towing)", value: "3" },
                { label: "4-Row (Massive / Extreme Racing)", value: "4" }
              ]} />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: If you have limited space in the front of your car (small width/height), you must compensate by selecting a thicker core (more rows).
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Required Core Area</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.requiredCoreArea}</div>
                      <div className="text-2xl font-bold text-primary mb-1">sq-in</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated Size Format</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.recommendedWidth}" <span className="text-2xl text-muted-foreground">x</span> {results.recommendedHeight}"</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Thermal Load</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.horsepower} HP</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Core Depth</div>
                    <div className="text-2xl font-bold text-blue-500">{inputs.coreRows}-Row</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Width x Height</div>
                    <div className="text-2xl font-bold text-emerald-500">{results.requiredCoreArea} in²</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Space Required by Row Count (For {inputs.horsepower} HP)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} sq-in`, 'Required Frontal Area']}
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="Required Area (sq-in)" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {
                            results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                        <ReferenceLine y={results.requiredCoreArea} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'YOUR SELECTION', fill: 'hsl(var(--primary))', fontSize: 11, fontWeight: 'bold' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Notice how a thicker 4-Row radiator drastically reduces the amount of physical width/height you need to fit it in the car.</div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Cooling</h2>
            <p>An internal combustion engine acts essentially as a massive heater. When you burn fuel to create horsepower, roughly one-third of the energy from that fuel is absorbed directly into the metal engine block as raw thermal heat. If you double the horsepower of an engine, you are burning twice as much fuel, which means you are dumping twice as much heat into the block.</p>
            <p>The radiator's only job is to act as a heat exchanger, pulling that heat out of the liquid coolant and dissipating it into the passing atmosphere. To dissipate more heat, you need a physically larger radiator.</p>

            <h2>The Frontal Area Problem (Square Inches)</h2>
            <p>The primary factor determining how much heat a radiator can shed is its "Frontal Area"—the width multiplied by the height. The more square inches of metal that touch the passing air, the more heat is removed. A typical rule of thumb is that you need roughly 1.7 square inches of standard 1-row radiator core to effectively cool 1 unit of horsepower.</p>
            <p>If you build a 600 HP engine, you need a massive 1020 sq-in radiator (e.g., a massive 40-inch wide by 25-inch tall unit). However, most cars do not have a front grille large enough to fit a radiator that wide.</p>

            <h2>The Solution: Adding Core Rows</h2>
            <p>If your engine bay is physically too small to fit a wider radiator, the only solution is to make the radiator thicker by adding rows of cooling tubes. A standard factory radiator is usually a 1-Row design. By stacking a second row of tubes behind the first (creating a 2-Row radiator), you increase the cooling capacity without making the radiator any wider or taller.</p>
            <p>However, there are diminishing returns. As outside air flows through the first row of tubes, the air heats up. By the time that same air hits the second row, it is already warm. By the time it hits a 3rd or 4th row, the air is scorching hot, meaning the back rows are vastly less efficient at extracting heat than the front row. Because of this, a 2-Row radiator only provides about 60% more cooling capacity than a 1-Row, not double.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/radiator-size-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
