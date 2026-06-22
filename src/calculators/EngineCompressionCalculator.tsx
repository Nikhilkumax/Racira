"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Settings } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface CompressionResults {
  compressionRatio: number;
  sweptVolumeCc: number;
  clearanceVolumeCc: number;
  totalEngineDisplacementCc: number;
  totalEngineDisplacementCi: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateCompression = (inputs: typeof DEFAULTS): CompressionResults => {
  const bore = parseFloat(inputs.bore);
  const stroke = parseFloat(inputs.stroke);
  const cylinders = parseInt(inputs.cylinders, 10);
  
  // Advanced
  const chamberVolume = parseFloat(inputs.chamberVolume) || 0;
  const pistonVolume = parseFloat(inputs.pistonVolume) || 0; // Negative for dome, positive for dish
  const gasketThickness = parseFloat(inputs.gasketThickness) || 0;
  const gasketBore = parseFloat(inputs.gasketBore) || bore;
  const deckClearance = parseFloat(inputs.deckClearance) || 0; // Positive means below deck, negative means above deck

  if (!bore || !stroke || bore <= 0 || stroke <= 0 || !cylinders || cylinders <= 0) {
    return {
      compressionRatio: 0, sweptVolumeCc: 0, clearanceVolumeCc: 0, totalEngineDisplacementCc: 0, totalEngineDisplacementCi: 0,
      chartData: [], isError: true, errorMsg: "Bore, Stroke, and Cylinders must be greater than zero."
    };
  }

  // Convert mm to cm for cc calculations (1 cc = 1 cm^3)
  const boreCm = bore / 10;
  const strokeCm = stroke / 10;
  const gasketThicknessCm = gasketThickness / 10;
  const gasketBoreCm = gasketBore / 10;
  const deckClearanceCm = deckClearance / 10;

  // Swept Volume (Displacement of one cylinder)
  // Volume = PI * (Bore/2)^2 * Stroke
  const sweptVolumeCc = Math.PI * Math.pow(boreCm / 2, 2) * strokeCm;

  // Head Gasket Volume
  const gasketVolumeCc = Math.PI * Math.pow(gasketBoreCm / 2, 2) * gasketThicknessCm;

  // Deck Clearance Volume
  const deckVolumeCc = Math.PI * Math.pow(boreCm / 2, 2) * deckClearanceCm;

  // Total Clearance Volume
  // Clearance = Chamber Volume + Gasket Volume + Deck Volume + Piston Volume (Dish adds volume, Dome subtracts)
  const clearanceVolumeCc = chamberVolume + gasketVolumeCc + deckVolumeCc + pistonVolume;

  if (clearanceVolumeCc <= 0) {
    return {
      compressionRatio: 0, sweptVolumeCc: 0, clearanceVolumeCc: 0, totalEngineDisplacementCc: 0, totalEngineDisplacementCi: 0,
      chartData: [], isError: true, errorMsg: "Calculated clearance volume is zero or negative. Check inputs (Piston Dome may be too large)."
    };
  }

  // Static Compression Ratio = (Swept Volume + Clearance Volume) / Clearance Volume
  const compressionRatio = (sweptVolumeCc + clearanceVolumeCc) / clearanceVolumeCc;

  const totalEngineDisplacementCc = sweptVolumeCc * cylinders;
  const totalEngineDisplacementCi = totalEngineDisplacementCc * 0.0610237;

  const chartData = [
    { name: "Swept Volume", value: Math.round(sweptVolumeCc * 10) / 10, fill: "hsl(var(--primary))" },
    { name: "Clearance Volume", value: Math.round(clearanceVolumeCc * 10) / 10, fill: "hsl(var(--muted-foreground))" }
  ];

  return {
    compressionRatio,
    sweptVolumeCc,
    clearanceVolumeCc,
    totalEngineDisplacementCc,
    totalEngineDisplacementCi,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  cylinders: "8",
  bore: "101.6",       // 4.00 inches in mm (Chevy 350)
  stroke: "88.39",     // 3.48 inches in mm
  // Advanced
  chamberVolume: "64", // cc
  pistonVolume: "5",   // cc (Dish)
  gasketThickness: "1.016", // 0.040 inches in mm
  gasketBore: "104.14", // 4.100 inches in mm
  deckClearance: "0.635" // 0.025 inches in mm
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options, step }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} step={step || "any"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function EngineCompressionCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<CompressionResults>(calculateCompression(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateCompression(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateCompression(DEFAULTS));
  };

  const format1 = (val: number) => val.toFixed(1);
  const format2 = (val: number) => val.toFixed(2);

  const faqs = [
    { question: "What is a Compression Ratio?", answer: "The Compression Ratio is the mathematical ratio between the total volume of the engine cylinder when the piston is at the very bottom of its stroke (Bottom Dead Center) compared to the volume when the piston is at the very top of its stroke (Top Dead Center). A 10:1 ratio means the air-fuel mixture is squeezed into a space one-tenth of its original size before ignition." },
    { question: "What is a good Compression Ratio?", answer: "It depends heavily on the engine type and induction system. For a naturally aspirated (non-turbo) gasoline engine running on 93 octane pump gas, a ratio between 9.5:1 and 11.0:1 is typical and safe. Modern direct-injection engines can push closer to 12.0:1. Turbocharged or supercharged engines require significantly lower static compression ratios (usually 8.5:1 to 9.5:1) to prevent catastrophic engine detonation under boost." },
    { question: "How does head gasket thickness affect compression?", answer: "The head gasket sits between the engine block and the cylinder head, creating a small disc of empty volume. Installing a thicker head gasket increases this clearance volume, which mathematically lowers the compression ratio. Conversely, using a thinner 'cometic' gasket will raise the compression ratio. Engine builders frequently use gasket thickness to fine-tune final compression." },
    { question: "What is Piston Dome vs Dish volume?", answer: "Pistons are rarely perfectly flat on top. A 'Dish' piston has a crater carved into the top, which adds to the clearance volume and lowers the compression ratio. A 'Dome' piston has a hump that protrudes upward into the combustion chamber, taking up space and drastically increasing the compression ratio." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Engine Compression Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Engine Compression Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cyl" label="Number of Cylinders" value={inputs.cylinders} onChange={(v: string) => handleChange("cylinders", v)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="bore" label="Cylinder Bore" value={inputs.bore} onChange={(v: string) => handleChange("bore", v)} suffix="mm" />
              <CompactInput id="stroke" label="Crankshaft Stroke" value={inputs.stroke} onChange={(v: string) => handleChange("stroke", v)} suffix="mm" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Clearance Details (CCs & Gaskets) <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1">Combustion Chamber</div>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <CompactInput id="chamber" label="Head Volume" value={inputs.chamberVolume} onChange={(v: string) => handleChange("chamberVolume", v)} suffix="cc" />
                    <CompactInput id="piston" label="Piston Dish/Dome" value={inputs.pistonVolume} onChange={(v: string) => handleChange("pistonVolume", v)} suffix="cc" tooltip="Positive for Dish (lowers CR), Negative for Dome (raises CR)" />
                  </div>
                  
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1">Head Gasket & Deck</div>
                  <div className="grid grid-cols-2 gap-3">
                    <CompactInput id="thick" label="Gasket Thickness" value={inputs.gasketThickness} onChange={(v: string) => handleChange("gasketThickness", v)} suffix="mm" />
                    <CompactInput id="gbore" label="Gasket Bore" value={inputs.gasketBore} onChange={(v: string) => handleChange("gasketBore", v)} suffix="mm" />
                    <CompactInput id="deck" label="Deck Clearance" value={inputs.deckClearance} onChange={(v: string) => handleChange("deckClearance", v)} suffix="mm" />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">* Note: Piston Volume is positive (+) for a dish/valve reliefs, and negative (-) for a dome.</div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-10 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset Data
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Static Compression Ratio</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-7xl font-black text-primary tracking-tighter">{format2(results.compressionRatio)}</div>
                    <div className="text-3xl font-bold text-primary mb-1.5">: 1</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    The air-fuel mixture is compressed to {format2(results.compressionRatio)} times its original volume.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Engine Displacement</div>
                    <div className="text-2xl font-bold text-foreground">{format0(results.totalEngineDisplacementCc)} cc</div>
                    <div className="text-sm text-muted-foreground">({format1(results.totalEngineDisplacementCc / 1000)} Liters)</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Swept Vol (Per Cyl)</div>
                    <div className="text-2xl font-bold text-blue-500">{format1(results.sweptVolumeCc)} cc</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Clearance Vol (Per Cyl)</div>
                    <div className="text-2xl font-bold text-orange-500">{format1(results.clearanceVolumeCc)} cc</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cylinder Volume Distribution at BDC</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} cc`, 'Volume']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                      </PieChart>
                    </ResponsiveContainer>
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
            <h2>Why Engine Compression Ratio Matters</h2>
            <p>The Static Compression Ratio is one of the most fundamental specifications of any internal combustion engine. It defines the mathematical relationship between the maximum volume of a cylinder (when the piston is at Bottom Dead Center) and the minimum volume (when the piston is at Top Dead Center). The higher the compression ratio, the more thermal energy the engine can extract from a single drop of fuel. High compression yields more horsepower, crisper throttle response, and better fuel efficiency.</p>

            <h2>The Science of Detonation (Engine Knock)</h2>
            <p>If high compression is good, why aren't all engines built with a 15.0:1 ratio? The limiting factor is the octane rating of pump gas. When you compress a gas, it rapidly heats up. If you squeeze the air-fuel mixture too tightly before the spark plug fires, the immense heat and pressure will cause the gasoline to spontaneously auto-ignite. This is known as detonation, pre-ignition, or "engine knock." Detonation sends violent shockwaves through the engine block that can shatter pistons and bend connecting rods in seconds. Therefore, engine builders must use a Compression Calculator to perfectly match the engine's ratio to the fuel octane it will run on.</p>

            <h2>Swept Volume vs. Clearance Volume</h2>
            <p>To calculate compression, you must understand two distinct volumes:</p>
            <ul>
              <li><strong>Swept Volume:</strong> The sheer volume of air displaced as the piston travels up and down the cylinder bore. This is calculated using only the Bore and Stroke.</li>
              <li><strong>Clearance Volume:</strong> The tiny pocket of dead space that remains when the piston is at the very top of its stroke. This volume is a complex sum of the combustion chamber in the cylinder head, the thickness of the head gasket, the space between the piston and the deck of the block, and the dish or dome carved into the piston itself.</li>
            </ul>

            <h2>How Engine Builders Adjust Compression</h2>
            <p>If a mechanic is building an engine and discovers the compression ratio is dangerously high for 93-octane street gas, they have several ways to lower it. They can install a thicker head gasket, which adds a few cubic centimeters of clearance volume. They can switch to "dished" pistons, which have a crater on top to increase volume. Or, they can physically grind away metal inside the cylinder head combustion chambers to make them larger.</p>

            <h2>Turbochargers and Dynamic Compression</h2>
            <p>The ratio calculated by this tool is the <strong>Static</strong> Compression Ratio. It assumes the cylinder fills with air at normal atmospheric pressure. However, if you add a turbocharger or supercharger, you are forcibly cramming double or triple the amount of air into the cylinder. Because the cylinder is artificially overfilled, turbocharged engines must run much lower static compression ratios (e.g., 8.5:1) to prevent catastrophic detonation when the boost kicks in.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/engine-compression-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}

const format0 = (val: number) => val.toFixed(0);
