"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Zap, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area } from "recharts";

// 1. TypeScript interfaces
interface AlternatorResults {
  idleOutputAmps: number;
  maxOutputAmps: number;
  totalDrawAmps: number;
  surplusAtIdle: number;
  isBatteryDrainingAtIdle: boolean;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateAlternator = (inputs: typeof DEFAULTS): AlternatorResults => {
  const ratingAmps = parseFloat(inputs.ratingAmps);
  const audioWatts = parseFloat(inputs.audioWatts);
  const lightBarsWatts = parseFloat(inputs.lightBarsWatts);
  const winchAmps = parseFloat(inputs.winchAmps);
  const factoryDrawAmps = parseFloat(inputs.factoryDrawAmps);

  if (isNaN(ratingAmps) || ratingAmps <= 0) {
    return {
      idleOutputAmps: 0, maxOutputAmps: 0, totalDrawAmps: 0, surplusAtIdle: 0, isBatteryDrainingAtIdle: false,
      chartData: [], schedule: [], isError: true, errorMsg: "Alternator rating must be a valid positive number."
    };
  }

  // Calculate Amps from Watts for 14.4V system (Running Alternator Voltage)
  const audioAmps = isNaN(audioWatts) ? 0 : audioWatts / 14.4;
  const lightsAmps = isNaN(lightBarsWatts) ? 0 : lightBarsWatts / 14.4;
  
  // Total Draw
  const totalDrawAmps = (isNaN(factoryDrawAmps) ? 0 : factoryDrawAmps) + audioAmps + lightsAmps + (isNaN(winchAmps) ? 0 : winchAmps);

  // Alternator Curve
  // Typically, alternators output ~45% of max capacity at engine idle (600-800 RPM)
  // They hit max capacity around 2000-2500 engine RPM
  const idleOutputAmps = ratingAmps * 0.45;
  const maxOutputAmps = ratingAmps;

  const surplusAtIdle = idleOutputAmps - totalDrawAmps;
  const isBatteryDrainingAtIdle = surplusAtIdle < 0;

  // Generate chart data: Engine RPM vs Alternator Output
  const chartData = [];
  const schedule: any[] = [];
  
  for (let rpm = 600; rpm <= 3000; rpm += 200) {
    // Basic logarithmic curve for alternator output
    // At 600 RPM = 45%
    // At 2000 RPM = 100%
    let outputPct = 0.45 + ((rpm - 600) / 1400) * 0.55;
    if (outputPct > 1.0) outputPct = 1.0;
    
    const output = ratingAmps * outputPct;
    
    chartData.push({
      "Engine RPM": rpm,
      "Alternator Output (Amps)": Math.round(output)
    });

    if (rpm === 600 || rpm % 1000 === 0 || rpm === 2000) {
      schedule.push({
        rpm: rpm,
        output: Math.round(output),
        status: Math.round(output) >= totalDrawAmps ? "Charging" : "Draining"
      });
    }
  }

  return {
    idleOutputAmps: Math.round(idleOutputAmps),
    maxOutputAmps: Math.round(maxOutputAmps),
    totalDrawAmps: Math.round(totalDrawAmps),
    surplusAtIdle: Math.round(surplusAtIdle),
    isBatteryDrainingAtIdle,
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  ratingAmps: "120", // Typical factory sedan/truck alternator
  factoryDrawAmps: "40", // Headlights, ECU, Fuel Pump, AC fan
  audioWatts: "1000",
  lightBarsWatts: "200",
  winchAmps: "0" // Winches use extreme power, normally 0 unless off-roading
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, step }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step={step || "any"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function AlternatorOutputCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AlternatorResults>(calculateAlternator(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateAlternator(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAlternator(DEFAULTS));
  };

  const faqs = [
    { question: "What does an alternator do?", answer: "The alternator is the electrical generator bolted to your engine. While the battery is used to start the engine, the alternator provides 100% of the vehicle's electrical power once the engine is running. It runs the spark plugs, headlights, radio, and recharges the battery simultaneously." },
    { question: "Why does my battery die when my engine is running?", answer: "This happens when your total electrical draw exceeds the alternator's output capacity. If your alternator maxes out at 100 Amps, but your massive stereo and light bars are demanding 150 Amps, the vehicle will pull the missing 50 Amps directly from the battery. The battery will slowly drain to zero, and the engine will stall, even while driving." },
    { question: "Why do my headlights dim at red lights?", answer: "An alternator is spun by the engine via a belt. It does not produce maximum power until the engine hits roughly 2,000 RPM. At idle (600 RPM), an alternator only produces roughly 45% of its rated power. If you have a heavy electrical load, the alternator cannot keep up at idle, causing a temporary voltage drop (headlight dimming) until you step on the gas." },
    { question: "Should I buy a High-Output Alternator?", answer: "If you install aftermarket accessories (like air suspension compressors, a 2000W subwoofer, or a snowplow) and notice your voltage gauge dropping below 13.5V at idle, you need a High-Output alternator. Upgrading the battery will NOT fix the problem; the battery will simply act as a larger bucket that the factory alternator still cannot fill." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Alternator Output Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Alternator Output Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine if your factory alternator can support aftermarket accessories, especially at engine idle.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Power Source</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="rating" label="Alternator Max Rating" value={inputs.ratingAmps} onChange={(v: string) => handleChange("ratingAmps", v)} suffix="Amps" placeholder="120" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Electrical Load (Draw)</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="factory" label="Factory Base Load" value={inputs.factoryDrawAmps} onChange={(v: string) => handleChange("factoryDrawAmps", v)} suffix="Amps" placeholder="40" />
              <CompactInput id="audio" label="Audio System" value={inputs.audioWatts} onChange={(v: string) => handleChange("audioWatts", v)} suffix="Watts" placeholder="1000" />
              <CompactInput id="lights" label="Light Bars/Halogens" value={inputs.lightBarsWatts} onChange={(v: string) => handleChange("lightBarsWatts", v)} suffix="Watts" placeholder="200" />
              <CompactInput id="winch" label="Winch/Compressors" value={inputs.winchAmps} onChange={(v: string) => handleChange("winchAmps", v)} suffix="Amps" placeholder="0" />
            </div>
            
            <div className="text-[10px] text-muted-foreground mt-1">
              * Note: Factory Base Load (ECU, Fuel Pump, Sparks, AC, Factory Lights) typically consumes 30-50 Amps automatically.
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
                  <div className={`border-l-4 rounded-lg p-6 relative overflow-hidden shadow-sm ${results.isBatteryDrainingAtIdle ? 'bg-destructive/10 border-destructive ring-2 ring-destructive ring-offset-2 ring-offset-background' : 'bg-primary/10 border-primary'}`}>
                    <div className={`text-xs uppercase tracking-wide mb-2 font-bold ${results.isBatteryDrainingAtIdle ? 'text-destructive/80' : 'text-muted-foreground'}`}>
                      {results.isBatteryDrainingAtIdle ? "WARNING: Battery Draining At Idle" : "Surplus Power At Idle"}
                    </div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-6xl font-black tracking-tighter ${results.isBatteryDrainingAtIdle ? 'text-destructive' : 'text-primary'}`}>
                        {Math.abs(results.surplusAtIdle)}
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${results.isBatteryDrainingAtIdle ? 'text-destructive' : 'text-primary'}`}>Amps</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total System Draw</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.totalDrawAmps}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">Amps</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Alternator Max</div>
                    <div className="text-2xl font-bold text-foreground">{results.maxOutputAmps} Amps</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Alternator at Idle</div>
                    <div className="text-2xl font-bold text-blue-500">{results.idleOutputAmps} Amps</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">System Health</div>
                    <div className={`text-xl font-bold ${results.maxOutputAmps >= results.totalDrawAmps ? 'text-emerald-500' : 'text-destructive uppercase'}`}>
                      {results.maxOutputAmps >= results.totalDrawAmps ? "Adequate" : "Needs Upgrade"}
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Alternator Power Curve vs Demand</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Engine RPM" tickFormatter={(val) => `${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} A`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, Math.max(results.maxOutputAmps, results.totalDrawAmps) * 1.1]} axisLine={false} tickLine={false} />
                        
                        <ReferenceLine y={results.totalDrawAmps} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'TOTAL SYSTEM DEMAND', fill: 'hsl(var(--destructive))', fontSize: 11, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value} Amps`, name]}
                          labelFormatter={(label) => `Engine Speed: ${label} RPM`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Area type="monotone" name="Power Produced" dataKey="Alternator Output (Amps)" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOut)" strokeWidth={3} activeDot={{r: 6}} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Anytime the blue power curve falls BELOW the red demand line, your battery is actively dying.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Engine RPM Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Engine Speed</th>
                          <th className="px-4 py-3 font-semibold text-right">Amps Produced</th>
                          <th className="px-4 py-3 font-semibold text-right">System Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.rpm} className={`hover:bg-muted/20 transition-colors ${row.status === 'Draining' ? 'bg-destructive/5' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.rpm} RPM</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.output} A</td>
                            <td className={`px-4 py-3 text-right font-bold ${row.status === 'Draining' ? 'text-destructive' : 'text-emerald-500'}`}>
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Misunderstood Alternator</h2>
            <p>Many drivers believe that the battery powers the car while driving. This is entirely false. The battery has exactly one job: to provide a massive burst of power to the starter motor for roughly three seconds to start the engine. Once the engine is running, the alternator takes over completely. The alternator powers the spark plugs, the headlights, the radio, the fuel pump, and simultaneously acts as a battery charger to replenish the power used during startup.</p>

            <h2>The Idle Problem</h2>
            <p>An alternator is a mechanical generator spun by a belt connected to the engine's crankshaft. Because it is mechanically linked, its power output is directly tied to engine speed. An alternator rated for 120 Amps only produces that 120 Amps when the engine is spinning fast (usually around 2,000 RPM). </p>
            <p>When you are stopped at a red light (idling at 600 RPM), the alternator is barely spinning. At idle, an alternator only produces roughly 45% of its maximum power. Therefore, a 120A alternator is only generating about 54 Amps at a stoplight. If your factory car needs 40 Amps to run, you are perfectly fine.</p>

            <h2>Why Aftermarket Accessories Kill Batteries</h2>
            <p>If you install a 1000-Watt subwoofer (which draws ~70 Amps) and a roof-mounted light bar (which draws ~15 Amps), your Total System Demand skyrockets to 125 Amps. </p>
            <p>When you sit at a red light, your vehicle demands 125 Amps, but the alternator is only producing 54 Amps. The laws of physics dictate that the missing 71 Amps must come from somewhere—so the vehicle starts draining the battery. If the red light is long enough, the battery will drain to zero, the spark plugs will lose power, and the engine will instantly stall in the middle of the intersection. Upgrading to a larger battery will not fix this; you must install a High-Output Alternator capable of generating 125+ Amps at idle.</p>

            <h2>How to Convert Watts to Amps</h2>
            <p>Most aftermarket accessories (like audio amplifiers and LED lights) are marketed in Watts, but alternators are rated in Amps. To convert Watts to Amps, you use Ohm's Law: <code>Amps = Watts ÷ Volts</code>. Because a healthy running alternator produces roughly 14.4 Volts, you divide the accessory's wattage by 14.4 to find its true Amperage draw.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/alternator-output-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
