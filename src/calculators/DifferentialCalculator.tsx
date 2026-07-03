"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Settings, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface DiffResults {
  diffRatio: number;
  newSpeedAt3000: number;
  rpmAt70Mph: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDiff = (inputs: typeof DEFAULTS): DiffResults => {
  const ring = parseInt(inputs.ringTeeth, 10);
  const pinion = parseInt(inputs.pinionTeeth, 10);
  const tireDiameter = parseFloat(inputs.tireDiameter);
  const transRatio = parseFloat(inputs.transRatio); // e.g., 1.00 for 4th gear, 0.70 for overdrive

  if (isNaN(ring) || ring <= 0 || isNaN(pinion) || pinion <= 0 || isNaN(tireDiameter) || tireDiameter <= 0 || isNaN(transRatio) || transRatio <= 0) {
    return {
      diffRatio: 0, newSpeedAt3000: 0, rpmAt70Mph: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // Differential Ratio = Ring Teeth / Pinion Teeth
  const diffRatio = ring / pinion;

  // Constants
  const tireCircumferenceIn = tireDiameter * Math.PI;

  // Helper function to calculate Speed from RPM
  const getSpeed = (rpm: number, ratio: number) => {
    const totalRed = transRatio * ratio;
    const wheelRpm = rpm / totalRed;
    const ipm = wheelRpm * tireCircumferenceIn;
    return (ipm * 60) / 63360;
  };

  // Helper function to calculate RPM from Speed
  const getRpm = (speedMph: number, ratio: number) => {
    const ipm = (speedMph * 63360) / 60;
    const wheelRpm = ipm / tireCircumferenceIn;
    const totalRed = transRatio * ratio;
    return wheelRpm * totalRed;
  };

  const newSpeedAt3000 = getSpeed(3000, diffRatio);
  const rpmAt70Mph = getRpm(70, diffRatio);

  // Generate chart data comparing standard diff (e.g. 3.08) vs the new calculated diff
  // Let's use a standard 3.08 as a baseline for the chart, or just plot the single curve.
  // Actually, plotting the RPM vs Speed for the current diff is standard.
  const chartData = [];
  const schedule = [];
  
  for (let s = 10; s <= 100; s += 10) {
    const r = getRpm(s, diffRatio);
    
    chartData.push({
      "Vehicle Speed (MPH)": s,
      "Engine RPM": Math.round(r)
    });

    schedule.push({
      speed: s,
      rpm: Math.round(r)
    });
  }

  return {
    diffRatio: Number(diffRatio.toFixed(2)),
    newSpeedAt3000: Number(newSpeedAt3000.toFixed(1)),
    rpmAt70Mph: Math.round(rpmAt70Mph),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  ringTeeth: "41",
  pinionTeeth: "11",
  tireDiameter: "26.5",
  transRatio: "0.70" // Overdrive
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
export default function DifferentialCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DiffResults>(calculateDiff(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateDiff(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDiff(DEFAULTS));
  };

  const faqs = [
    { question: "What is a Differential?", answer: "The differential is a mechanical component located on the driving axle(s) of a vehicle. It takes the rotational power coming from the transmission via the driveshaft and turns it 90 degrees to spin the wheels. It also allows the left and right wheels to spin at different speeds when cornering (hence the name 'differential')." },
    { question: "How do you calculate the Differential Ratio?", answer: "Inside the differential is a gear set called the Ring and Pinion. The Pinion gear is attached to the driveshaft, and it spins the larger Ring gear. You calculate the ratio by dividing the number of teeth on the Ring gear by the number of teeth on the Pinion gear. For example, a 41-tooth ring driven by an 11-tooth pinion gives a 3.73:1 ratio." },
    { question: "What are 'Tall' vs. 'Short' gears?", answer: "Gears with a low numerical ratio (e.g., 2.73, 3.08) are called 'Tall' gears. They provide higher top speeds and great highway fuel economy because the engine runs at low RPM. Gears with a high numerical ratio (e.g., 4.10, 4.56) are called 'Short' gears. They force the engine to run at higher RPM on the highway, but they drastically multiply torque, providing violent off-the-line acceleration and extreme towing capability." },
    { question: "Why upgrade differential gears?", answer: "If you install massive 35-inch off-road tires on your truck, the larger physical circumference acts like a giant lever working against the engine, making the truck feel sluggish. To regain the lost acceleration, off-road enthusiasts install 'shorter' differential gears (like 4.88s) to multiply the engine's torque and compensate for the heavy tires." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Differential Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Differential Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine your vehicle's exact rear-end gear ratio by counting the Ring and Pinion teeth.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="ring" label="Ring Gear Teeth" value={inputs.ringTeeth} onChange={(v: string) => handleChange("ringTeeth", v)} placeholder="41" />
              <CompactInput id="pinion" label="Pinion Gear Teeth" value={inputs.pinionTeeth} onChange={(v: string) => handleChange("pinionTeeth", v)} placeholder="11" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-2 border-b border-border/50 pb-1">Vehicle Setup</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="tire" label="Tire Diameter" value={inputs.tireDiameter} onChange={(v: string) => handleChange("tireDiameter", v)} suffix="in" placeholder="26.5" />
              <CompactInput id="trans" label="Transmission Gear" value={inputs.transRatio} onChange={(v: string) => handleChange("transRatio", v)} suffix=": 1" placeholder="0.70" step="0.01" />
            </div>
            
            <div className="text-[10px] text-muted-foreground">
              * Transmission gear 1.00 is direct drive. 0.70 is typical overdrive for highway cruising.
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Differential Ratio</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.diffRatio}</div>
                      <div className="text-2xl font-bold text-primary mb-1">: 1</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Cruising at 70 MPH</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.rpmAt70Mph}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">RPM</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Ring Teeth</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.ringTeeth}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Pinion Teeth</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.pinionTeeth}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Speed at 3000 RPM</div>
                    <div className="text-2xl font-bold text-blue-500">{results.newSpeedAt3000} MPH</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Speed vs RPM (Transmission Ratio: {inputs.transRatio}:1)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Vehicle Speed (MPH)" tickFormatter={(val) => `${val} MPH`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={70} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Highway', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} RPM`, 'Engine Speed']}
                          labelFormatter={(label) => `Vehicle Speed: ${label} MPH`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="Engine RPM" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Velocity RPM Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Speed (MPH)</th>
                          <th className="px-4 py-3 font-semibold text-right">Required RPM</th>
                          <th className="px-4 py-3 font-semibold text-right">Drive Ratio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.speed} className={`hover:bg-muted/20 transition-colors ${row.speed == 70 ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.speed} MPH</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.rpm} RPM</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{results.diffRatio}:1</td>
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
            <h2>What is a Differential?</h2>
            <p>While the transmission handles shifting gears, the differential (often called the "rear end" in RWD trucks and cars) provides the final, permanent gear reduction before engine power reaches the tires. Inside the differential casing, there are two primary gears: a small Pinion gear connected to the spinning driveshaft, and a large Ring gear connected to the wheel axles. By dividing the number of teeth on the Ring gear by the teeth on the Pinion gear, you calculate your differential ratio (e.g., 41 ring teeth ÷ 11 pinion teeth = 3.73:1).</p>

            <h2>Why Upgrade Differential Gears?</h2>
            <p>Upgrading differential gears is one of the most effective mechanical modifications you can perform on a vehicle to drastically improve off-the-line acceleration or towing power without ever touching the engine.</p>
            <ul>
              <li><strong>Factory Economy Gears (e.g., 2.73:1 or 3.08:1):</strong> Often called "tall gears." The driveshaft only spins about three times to turn the wheels once. This forces the engine to run at incredibly low RPMs on the highway, maximizing fuel economy. However, the car will feel incredibly sluggish from a dead stop.</li>
              <li><strong>Performance Gears (e.g., 3.73:1 or 4.10:1):</strong> Often called "short gears." The driveshaft must spin four times to turn the wheels once. This massively multiplies engine torque, pushing the car forward with violent acceleration. The trade-off is that highway cruising at 70 MPH will force the engine to sit at a much higher, louder RPM, consuming significantly more fuel.</li>
            </ul>

            <h2>The Jeep and Truck Dilemma</h2>
            <p>If you own an off-road vehicle like a Jeep Wrangler or a Ford F-150 and you install massive 35-inch mud tires, you are completely changing the geometry of the drivetrain. A massive tire takes much longer to complete a full rotation, meaning the engine has to work significantly harder to get the heavy rubber rolling. This makes the truck feel incredibly slow and puts extreme stress on the transmission. To fix this, truck owners must "re-gear" the differential (often upgrading to 4.56:1 or 4.88:1 ratios) to restore the factory mechanical advantage and regain their acceleration.</p>

            <h2>Using the Differential Calculator</h2>
            <p>Our calculator allows you to predict exactly how a gear swap will affect your daily driving. By inputting the new Ring and Pinion teeth alongside your transmission's overdrive ratio (usually 0.70 or 0.75 for modern 6+ speed automatics) and tire size, the tool will instantly reveal your new highway cruising RPM. This ensures you do not accidentally install gears that are so aggressive they make your vehicle undrivable on the interstate.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/differential-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
