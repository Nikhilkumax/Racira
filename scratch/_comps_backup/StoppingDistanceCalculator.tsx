"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ShieldAlert, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface StoppingResults {
  reactionDistanceFt: number;
  brakingDistanceFt: number;
  totalDistanceFt: number;
  totalDistanceM: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateStopping = (inputs: typeof DEFAULTS): StoppingResults => {
  const speedMph = parseFloat(inputs.speed);
  const reactionTime = parseFloat(inputs.reactionTime);
  const roadCondition = inputs.roadCondition;

  if (isNaN(speedMph) || speedMph < 0 || isNaN(reactionTime) || reactionTime < 0) {
    return {
      reactionDistanceFt: 0, brakingDistanceFt: 0, totalDistanceFt: 0, totalDistanceM: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "Speed and Reaction Time must be valid positive numbers."
    };
  }

  // Coefficient of friction based on road condition
  let friction = 0.7; // Dry road default
  if (roadCondition === "wet") friction = 0.4;
  else if (roadCondition === "snow") friction = 0.15;
  else if (roadCondition === "ice") friction = 0.08;

  // Constants
  const gravity = 32.2; // ft/s^2

  const calcDistances = (mph: number) => {
    // Convert MPH to ft/s (1 mph = 1.46667 ft/s)
    const fps = mph * 1.46667;
    const reactDist = fps * reactionTime;
    // Braking distance = v^2 / (2 * g * f)
    const brakeDist = Math.pow(fps, 2) / (2 * gravity * friction);
    return { reactDist, brakeDist, totalDist: reactDist + brakeDist };
  };

  const { reactDist, brakeDist, totalDist } = calcDistances(speedMph);
  const totalDistanceM = totalDist * 0.3048;

  // Generate chart data: 20 to 100 MPH
  const chartData = [];
  const schedule = [];
  
  for (let s = 20; s <= 100; s += 20) {
    const d = calcDistances(s);
    
    chartData.push({
      Speed: `${s} MPH`,
      "Reaction Dist (ft)": Math.round(d.reactDist),
      "Braking Dist (ft)": Math.round(d.brakeDist)
    });

    schedule.push({
      speed: s,
      react: Math.round(d.reactDist),
      brake: Math.round(d.brakeDist),
      total: Math.round(d.totalDist)
    });
  }

  return {
    reactionDistanceFt: Number(reactDist.toFixed(1)),
    brakingDistanceFt: Number(brakeDist.toFixed(1)),
    totalDistanceFt: Number(totalDist.toFixed(1)),
    totalDistanceM: Number(totalDistanceM.toFixed(1)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  speed: "60",
  reactionTime: "1.5", // Average perception-reaction time is 1.5s
  roadCondition: "dry"
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
export default function StoppingDistanceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<StoppingResults>(calculateStopping(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateStopping(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateStopping(DEFAULTS));
  };

  const faqs = [
    { question: "What is Reaction Distance?", answer: "Before you can stop a car, your brain must recognize the hazard and your foot must physically move from the gas pedal to the brake pedal. This is called Perception-Reaction Time. The average driver takes 1.5 seconds to react. If you are driving 60 MPH, your car is traveling 88 feet per second. This means you will travel 132 feet before you even begin to apply the brakes." },
    { question: "What is Braking Distance?", answer: "Braking Distance is the physical distance the car travels from the exact moment the brake pads clamp onto the rotors until the vehicle comes to a complete, dead stop. This distance is entirely determined by your speed, the weight of the car, and the friction between the tires and the road." },
    { question: "Why does wet weather increase stopping distance so much?", answer: "Tires rely entirely on friction to stop a heavy vehicle. Water acts as a lubricant between the rubber and the asphalt. On a dry road, the coefficient of friction is roughly 0.70. On a wet road, that drops to 0.40, nearly doubling the distance your car will slide before the brakes can overcome the vehicle's momentum." },
    { question: "How does speed affect stopping distance?", answer: "Braking distance increases exponentially with speed, not linearly. If you double your speed from 30 MPH to 60 MPH, your braking distance does not double—it quadruples. This is due to the laws of kinetic energy, which dictate that energy equals one-half mass times velocity squared." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Stopping Distance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stopping Distance Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate the exact distance your vehicle will travel from the moment you spot a hazard to a complete stop.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="speed" label="Vehicle Speed" value={inputs.speed} onChange={(v: string) => handleChange("speed", v)} suffix="MPH" placeholder="60" />
              <CompactInput id="react" label="Driver Reaction Time" value={inputs.reactionTime} onChange={(v: string) => handleChange("reactionTime", v)} suffix="sec" step="0.1" placeholder="1.5" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="road" label="Road Surface Condition" value={inputs.roadCondition} onChange={(v: string) => handleChange("roadCondition", v)} options={[
                { label: "Dry Asphalt (Optimal Grip)", value: "dry" },
                { label: "Wet Asphalt (Rain)", value: "wet" },
                { label: "Packed Snow", value: "snow" },
                { label: "Solid Ice", value: "ice" }
              ]} />
            </div>
            
            <div className="text-[10px] text-muted-foreground mt-1">
              * Note: The average, alert driver has a perception-reaction time of 1.5 seconds. Distracted or impaired drivers may take 3.0+ seconds.
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={() => setResults(calculateStopping(inputs))} className="flex-1 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="h-11 w-11 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none shadow-sm">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Stopping Distance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.totalDistanceFt}</div>
                      <div className="text-2xl font-bold text-primary mb-1">ft</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Metric Distance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.totalDistanceM}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">meters</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Speed</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.speed} MPH</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Reaction Travel</div>
                    <div className="text-2xl font-bold text-orange-500">{results.reactionDistanceFt} ft</div>
                    <div className="text-xs text-muted-foreground">Before braking</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Physical Braking</div>
                    <div className="text-2xl font-bold text-destructive">{results.brakingDistanceFt} ft</div>
                    <div className="text-xs text-muted-foreground">Pedal applied</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Total Distance Composition</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="Speed" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} width={80} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                        <Bar dataKey="Reaction Dist (ft)" stackId="a" fill="hsl(var(--primary))" maxBarSize={40} />
                        <Bar dataKey="Braking Dist (ft)" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3 text-center">Notice how Physical Braking distance violently expands at higher speeds due to kinetic energy.</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5 mt-2">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vehicle Speed</p>
                      <p className="font-semibold text-foreground">{inputs.speed} mph</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reaction Time</p>
                      <p className="font-semibold text-foreground">{inputs.reactionTime} sec</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reaction Distance</p>
                      <p className="font-semibold text-foreground">{results.reactionDistanceFt} ft</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Braking Distance</p>
                      <p className="font-semibold text-foreground">{results.brakingDistanceFt} ft</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Stopping Distance</p>
                      <p className="font-semibold text-primary">{results.totalDistanceFt} ft ({results.totalDistanceM} m)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Road Condition</p>
                      <p className="font-semibold text-foreground capitalize">{inputs.roadCondition}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Speed Scaling Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Speed (MPH)</th>
                          <th className="px-4 py-3 font-semibold text-right">Reaction Dist.</th>
                          <th className="px-4 py-3 font-semibold text-right">Braking Dist.</th>
                          <th className="px-4 py-3 font-semibold text-right text-destructive">Total Distance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.speed} className={`hover:bg-muted/20 transition-colors ${row.speed == parseFloat(inputs.speed) ? 'bg-destructive/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.speed} MPH</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.react} ft</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.brake} ft</td>
                            <td className="px-4 py-3 text-right text-destructive font-bold">{row.total} ft</td>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Two Halves of Stopping</h2>
            <p>Most drivers assume that "stopping distance" refers only to how strong their car's brakes are. In reality, a vehicle's total stopping distance is comprised of two completely separate phases: <strong>Reaction Distance</strong> (the human element) and <strong>Braking Distance</strong> (the mechanical element). Our Stopping Distance Calculator analyzes both to give you a true, real-world estimate of how much space you need to avoid an accident.</p>

            <h2 className="text-2xl font-bold mb-3">Phase 1: Reaction Distance</h2>
            <p>If a deer jumps into the road, your car does not immediately begin to slow down. First, your eyes must see the deer. Then, your brain must process the danger. Finally, your brain must send a signal to your leg to lift off the gas pedal and slam onto the brake pedal. This is called Perception-Reaction Time. </p>
            <p>Traffic engineers universally agree that the average, sober, alert driver takes roughly 1.5 seconds to react. While 1.5 seconds sounds incredibly fast, a car traveling at 60 MPH covers 88 feet every single second. This means your car will travel over 130 feet forward—more than a third of a football field—before your foot even touches the brake pedal.</p>

            <h2 className="text-2xl font-bold mb-3">Phase 2: Braking Distance and Kinetic Energy</h2>
            <p>Once the brake pads clamp onto the rotors, the mechanical braking phase begins. This is where physics takes over. According to the laws of kinetic energy, the energy required to stop a moving object squares with its velocity. This means that if you double your speed, your braking distance does not double; it quadruples.</p>
            <ul>
              <li>At 30 MPH, a typical car on dry pavement might need 45 feet to physically brake.</li>
              <li>At 60 MPH, that same car will need over 180 feet to stop.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Danger of Wet and Icy Roads</h2>
            <p>Your brakes do not stop the car; your tires stop the car. The brakes simply stop the wheels from spinning. The entire system relies on the friction between your rubber tires and the asphalt. If the road is wet, water acts as a lubricant, reducing the coefficient of friction by almost half. If the road is covered in snow or ice, friction is nearly eliminated, causing the braking distance to explode to terrifying lengths, regardless of how advanced your Anti-Lock Braking System (ABS) is.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stopping-distance-calculator" />
          <PopularCalculators exclude="/calculator/stopping-distance-calculator" />
        </div>
      </div>
    </>
  );
}
