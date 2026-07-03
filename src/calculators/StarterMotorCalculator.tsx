"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Key, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

// 1. TypeScript interfaces
interface StarterResults {
  requiredCCA: number;
  expectedVoltageDrop: number;
  crankingTimeSec: number;
  isBatterySufficient: boolean;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateStarter = (inputs: typeof DEFAULTS): StarterResults => {
  const displacementL = parseFloat(inputs.displacementL);
  const compressionRatio = parseFloat(inputs.compressionRatio);
  const batteryCCA = parseFloat(inputs.batteryCCA);
  const temperature = inputs.temperature; // "warm", "cold", "extreme_cold"

  if (isNaN(displacementL) || displacementL <= 0 || isNaN(compressionRatio) || compressionRatio <= 0 || isNaN(batteryCCA) || batteryCCA <= 0) {
    return {
      requiredCCA: 0, expectedVoltageDrop: 0, crankingTimeSec: 0, isBatterySufficient: false,
      chartData: [], schedule: [], isError: true, errorMsg: "Displacement, Compression, and Battery CCA must be valid positive numbers."
    };
  }

  // Base Required CCA = roughly 150 CCA per Liter of displacement for a standard engine
  let baseCCA = displacementL * 150;

  // Adjust for Compression Ratio (High compression takes significantly more force to turn over)
  // Baseline is ~9.5:1. Above 10.5, we scale up exponentially.
  let compMultiplier = 1.0;
  if (compressionRatio > 10.0) {
    compMultiplier = 1.0 + ((compressionRatio - 10.0) * 0.08); // 8% increase per point of compression above 10
  }
  
  // Adjust for Temperature
  // Warm = 1.0, Cold (32F) = 1.3, Extreme Cold (0F) = 1.6
  let tempMultiplier = 1.0;
  let startingVoltage = 12.6; // Fully charged resting voltage
  let crankingTimeSec = 1.5; // Quick start

  if (temperature === "cold") {
    tempMultiplier = 1.3; // Oil is thicker, battery chemical reaction is slower
    startingVoltage = 12.4;
    crankingTimeSec = 3.0;
  } else if (temperature === "extreme_cold") {
    tempMultiplier = 1.6; // Oil is like molasses
    startingVoltage = 12.2;
    crankingTimeSec = 5.0;
  }

  const requiredCCA = baseCCA * compMultiplier * tempMultiplier;
  const isBatterySufficient = batteryCCA >= requiredCCA;

  // Expected Voltage Drop: Based on how hard the battery has to work (Ratio of Required vs Available)
  // A healthy start drops voltage to ~10.5V. A struggling start drops to ~9.0V.
  // If voltage drops below 9.0V, the ECU shuts off and the car won't start at all.
  const loadRatio = requiredCCA / batteryCCA;
  let voltageDrop = loadRatio * 2.5; // E.g. if ratio is 0.8, drop is 2V. (12.6 - 2.0 = 10.6V)
  if (voltageDrop > 4.5) voltageDrop = 4.5; // Cap it so we don't go negative in display

  const minimumVoltageDuringCrank = startingVoltage - voltageDrop;

  // Generate chart data: Simulating a 5-second cranking window
  const chartData = [];
  const schedule: any[] = [];
  
  // Simulation loop (0 to 6 seconds)
  for (let t = 0; t <= 6; t += 0.5) {
    let currentV = startingVoltage;
    let status = "Resting";

    if (t > 0 && t <= crankingTimeSec) {
      // During cranking, voltage dips to the minimum
      currentV = minimumVoltageDuringCrank;
      status = "Cranking";
    } else if (t > crankingTimeSec) {
      // Post-start recovery (Alternator kicks in if it started successfully)
      if (isBatterySufficient && minimumVoltageDuringCrank >= 9.0) {
        currentV = 14.4; // Alternator charging voltage
        status = "Running (Charging)";
      } else {
        currentV = startingVoltage - 0.5; // Failed to start, battery is slightly drained
        status = "Failed Start";
      }
    }
    
    chartData.push({
      "Time (s)": t,
      "Battery Voltage": Number(currentV.toFixed(1))
    });

    if (t % 1 === 0) {
      schedule.push({
        time: t,
        voltage: Number(currentV.toFixed(1)),
        status: status
      });
    }
  }

  return {
    requiredCCA: Math.round(requiredCCA),
    expectedVoltageDrop: Number(voltageDrop.toFixed(1)),
    crankingTimeSec,
    isBatterySufficient: isBatterySufficient && minimumVoltageDuringCrank >= 9.0,
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  displacementL: "5.0",      // Typical V8
  compressionRatio: "10.5",  // Modern engine compression
  batteryCCA: "600",         // Average car battery
  temperature: "cold"        // "warm", "cold", "extreme_cold"
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, options, step }: any) => (
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
        <input id={id} type="number" step={step || "any"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function StarterMotorCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<StarterResults>(calculateStarter(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateStarter(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateStarter(DEFAULTS));
  };

  const faqs = [
    { question: "What are Cold Cranking Amps (CCA)?", answer: "Cold Cranking Amps (CCA) is a measurement of a battery's ability to start an engine in freezing temperatures. Specifically, it is the number of Amps a 12-volt battery can deliver at 0°F (-18°C) for 30 seconds while maintaining a voltage of at least 7.2 Volts. The higher the CCA, the greater the starting power of the battery." },
    { question: "Why do big engines need more CCA?", answer: "The starter motor has to physically rotate the heavy steel crankshaft, push massive pistons up and down, and fight against the mechanical resistance of compressing air inside the cylinders. A 5.0L V8 engine has significantly larger, heavier internal components and compresses a much larger volume of air than a 2.0L 4-cylinder engine, requiring exponentially more electrical torque from the starter motor to get it moving." },
    { question: "Why is starting a car harder in the winter?", answer: "Two reasons combine to make cold starts incredibly difficult. First, engine oil thickens in the cold, turning from a fluid into a molasses-like sludge. The starter motor must fight through this thick physical resistance. Second, the chemical reaction inside a Lead-Acid battery slows down significantly in freezing temperatures, severely crippling the battery's ability to output the necessary electrical current." },
    { question: "Why does my car click but not start?", answer: "Modern vehicles use complex Engine Control Units (ECUs) to manage spark plugs and fuel injectors. These ECUs require a minimum voltage (usually around 9.0V) to function. If your battery is weak, the immense strain of the starter motor pulling current will drop the system voltage below 9.0V. When this happens, the ECU shuts down to protect itself, resulting in a rapid 'clicking' sound as the starter solenoid engages and disengages repeatedly." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Starter Motor Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Starter Motor Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine exactly how many Cold Cranking Amps (CCA) your battery needs to successfully start your specific engine.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Engine Specifications</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="disp" label="Engine Displacement" value={inputs.displacementL} onChange={(v: string) => handleChange("displacementL", v)} suffix="Liters" placeholder="5.0" step="0.1" />
              <CompactInput id="comp" label="Compression Ratio" value={inputs.compressionRatio} onChange={(v: string) => handleChange("compressionRatio", v)} suffix=":1" placeholder="10.5" step="0.1" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Environmental Conditions</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="temp" label="Ambient Temperature" value={inputs.temperature} onChange={(v: string) => handleChange("temperature", v)} options={[
                { label: "Warm Start (70°F+ / Summer)", value: "warm" },
                { label: "Cold Start (32°F / Freezing)", value: "cold" },
                { label: "Extreme Cold (0°F / Deep Winter)", value: "extreme_cold" }
              ]} />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Battery Capacity</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="cca" label="Battery Rating (CCA)" value={inputs.batteryCCA} onChange={(v: string) => handleChange("batteryCCA", v)} suffix="CCA" placeholder="600" />
            </div>
            
            <div className="text-[10px] text-muted-foreground mt-1">
              * Note: High compression engines (like performance V8s) require significantly more energy to compress the air/fuel mixture before ignition.
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Required Starting Power</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.requiredCCA}</div>
                      <div className="text-2xl font-bold text-primary mb-1">CCA</div>
                    </div>
                  </div>

                  <div className={`border border-border rounded-lg p-6 relative overflow-hidden shadow-sm ${results.isBatterySufficient ? 'bg-card' : 'bg-destructive/10 ring-2 ring-destructive ring-offset-2 ring-offset-background'}`}>
                    <div className={`text-xs uppercase tracking-wide mb-2 font-bold ${results.isBatterySufficient ? 'text-muted-foreground' : 'text-destructive/80'}`}>Start Status Result</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-4xl font-black tracking-tighter ${results.isBatterySufficient ? 'text-foreground' : 'text-destructive'}`}>
                        {results.isBatterySufficient ? "SUCCESS" : "FAILED (NO START)"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Battery Rating</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.batteryCCA} CCA</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cranking Time</div>
                    <div className="text-2xl font-bold text-blue-500">{results.crankingTimeSec} sec</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Expected Volt Drop</div>
                    <div className="text-2xl font-bold text-orange-500">-{results.expectedVoltageDrop}V</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Starting Voltage Simulation (Cranking Draw)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Time (s)" tickFormatter={(val) => `${val}s`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={[0, 6]} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val}V`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[7, 15]} axisLine={false} tickLine={false} />
                        
                        <ReferenceLine y={9.0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'ECU CUTOFF (9.0V) - DEAD ZONE', fill: 'hsl(var(--destructive))', fontSize: 11, fontWeight: 'bold' }} />
                        <ReferenceLine y={14.4} stroke="hsl(var(--emerald-500))" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: 'ALTERNATOR CHARGING', fill: 'hsl(var(--emerald-500))', fontSize: 11, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value} Volts`, name]}
                          labelFormatter={(label) => `Time Elapsed: ${label} sec`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="stepAfter" name="System Voltage" dataKey="Battery Voltage" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">If the blue voltage line dips below the red cutoff line during cranking, the vehicle's computer shuts off and it will not start.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Cranking Timeline Event Log</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Time</th>
                          <th className="px-4 py-3 font-semibold text-right">System Voltage</th>
                          <th className="px-4 py-3 font-semibold text-right">Engine Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.time} className={`hover:bg-muted/20 transition-colors ${row.voltage < 9.0 ? 'bg-destructive/5' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.time} sec</td>
                            <td className={`px-4 py-3 text-right font-bold ${row.voltage < 9.0 ? 'text-destructive' : 'text-primary'}`}>{row.voltage} V</td>
                            <td className={`px-4 py-3 text-right font-bold ${row.status.includes('Failed') ? 'text-destructive' : row.status.includes('Running') ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                              {row.status}
                            </td>
                          </tr>
                        ))}
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
          <article className="prose-finance text-[15.75px]">
            <h2>The Mechanics of Starting an Engine</h2>
            <p>Before a modern internal combustion engine can run on its own power, it must be physically rotated by an external force to suck in the first breath of air and compress the first spray of fuel. This incredibly demanding task falls on the <strong>Starter Motor</strong>, a small but incredibly powerful electric motor bolted to the side of the engine block.</p>
            <p>The starter motor draws a massive, instantaneous surge of electrical current from the battery to force the heavy steel crankshaft to turn against the mechanical resistance of the engine's internal compression.</p>

            <h2>Why Engine Size (Displacement) Matters</h2>
            <p>Engine displacement (measured in Liters) dictates the physical size of the internal components. A 1.5L four-cylinder engine found in an economy car is relatively light and easy to rotate. It requires very little electrical power to start, usually around 250 Cold Cranking Amps (CCA).</p>
            <p>In stark contrast, a heavy-duty pickup truck equipped with a massive 6.2L V8 engine has giant, heavy pistons that must compress a massive volume of air. To physically rotate this massive block of steel, the starter motor must pull hundreds of Amps (often 700+ CCA) from the battery. If you put the small battery from the economy car into the V8 truck, the starter motor will not have enough electrical torque to overcome the physical resistance of the V8's cylinders.</p>

            <h2>The Death Zone: Voltage Drop</h2>
            <p>When the starter motor engages, it pulls so much current out of the battery that the overall system voltage in the vehicle instantly plummets. A fully charged resting battery sits at 12.6 Volts. During a healthy engine start, the massive draw of the starter motor will briefly pull the system voltage down to roughly 10.5 Volts before bouncing back.</p>
            <p>However, if the battery is old, weak, or severely undersized for the engine (e.g., trying to start a V8 with a 400 CCA battery), the starter motor will strain the battery to its breaking point. The system voltage will crash down into the "Death Zone" below 9.0 Volts. Because modern Engine Control Units (ECUs) require a stable 9.0V to operate the spark plugs and fuel injectors, the computer will actively shut down to protect itself. This is why a weak battery results in a rapid "clicking" sound rather than a successful start.</p>

            <h2>The Brutality of Winter (Cold Starts)</h2>
            <p>Starting an engine in the dead of winter is exponentially harder than in the summer. When temperatures drop below freezing, the engine oil thickens from a smooth fluid into a thick, sticky sludge. The starter motor must fight against this increased mechanical resistance. Simultaneously, the freezing temperatures slow down the chemical reaction inside the Lead-Acid battery, severely reducing its ability to output maximum current. This combination of increased physical resistance and decreased electrical output is why batteries almost always fail on cold winter mornings.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/starter-motor-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
