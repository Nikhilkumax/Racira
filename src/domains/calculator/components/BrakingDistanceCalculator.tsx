"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Octagon, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface BrakingResults {
  brakingDistanceFt: number;
  brakingDistanceM: number;
  frictionCoefficient: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBraking = (inputs: typeof DEFAULTS): BrakingResults => {
  const speedMph = parseFloat(inputs.speed);
  const roadCondition = inputs.roadCondition;

  if (isNaN(speedMph) || speedMph < 0) {
    return {
      brakingDistanceFt: 0, brakingDistanceM: 0, frictionCoefficient: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "Speed must be a valid positive number."
    };
  }

  // Coefficient of friction based on road condition
  let friction = 0.7; // Dry road default
  if (roadCondition === "dry") friction = 0.7;
  else if (roadCondition === "wet") friction = 0.4;
  else if (roadCondition === "snow") friction = 0.15;
  else if (roadCondition === "ice") friction = 0.08;

  // Constants
  const gravity = 32.2; // ft/s^2

  const calcDist = (mph: number) => {
    // Convert MPH to ft/s (1 mph = 1.46667 ft/s)
    const fps = mph * 1.46667;
    // Braking distance = v^2 / (2 * g * f)
    return Math.pow(fps, 2) / (2 * gravity * friction);
  };

  const brakingDistanceFt = calcDist(speedMph);
  const brakingDistanceM = brakingDistanceFt * 0.3048;

  // Generate chart data: 10 to 120 MPH
  const chartData = [];
  const schedule = [];
  
  for (let s = 10; s <= 120; s += 10) {
    const dist = calcDist(s);
    
    chartData.push({
      Speed: s,
      "Distance (ft)": Math.round(dist)
    });

    if (s % 20 === 0) {
      schedule.push({
        speed: s,
        distFt: Math.round(dist),
        distM: Math.round(dist * 0.3048)
      });
    }
  }

  return {
    brakingDistanceFt: Number(brakingDistanceFt.toFixed(1)),
    brakingDistanceM: Number(brakingDistanceM.toFixed(1)),
    frictionCoefficient: friction,
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  speed: "60",
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
export default function BrakingDistanceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BrakingResults>(calculateBraking(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateBraking(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBraking(DEFAULTS));
  };

  const faqs = [
    { question: "What is Braking Distance vs Stopping Distance?", answer: "Stopping Distance includes human reaction time—the distance the car travels while your brain processes danger and moves your foot to the brake pedal. Braking Distance is purely mechanical. It measures the physical distance the car travels from the exact millisecond the brake pads clamp the rotors until the car comes to a dead stop." },
    { question: "Why does double the speed equal quadruple the distance?", answer: "This is a fundamental law of physics (Kinetic Energy). The formula for kinetic energy is one-half the mass times velocity squared. Because the speed variable is squared, if you double your speed (e.g., from 30 MPH to 60 MPH), the energy your brakes must absorb multiplies by four. Consequently, your braking distance will also multiply by four." },
    { question: "How does wet pavement affect braking?", answer: "Your brakes do not stop the car; the friction between the tires and the road stops the car. On dry asphalt, tires have a high friction coefficient (roughly 0.70). Water acts as a lubricant, dropping the friction coefficient down to 0.40. This massive loss in grip means the car will slide significantly further before the tires can arrest its momentum." },
    { question: "Does vehicle weight affect braking distance?", answer: "Yes and no. In basic physics models, heavier cars have more kinetic energy but also push down harder on the tires, creating more friction. These two forces largely cancel each other out. However, in the real world, a massive 8,000-pound truck requires significantly larger, heavier-duty brakes to prevent the brake pads from instantly overheating and failing (brake fade)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Braking Distance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Braking Distance Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate the physical distance required for a vehicle to stop once the brakes are fully applied.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="speed" label="Vehicle Speed" value={inputs.speed} onChange={(v: string) => handleChange("speed", v)} suffix="MPH" placeholder="60" />
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
              * Note: This calculator only measures the physical braking distance. It assumes the brake pedal is already fully depressed.
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
                  <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-destructive/80 mb-2 font-bold">Physical Braking Distance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-destructive tracking-tighter">{results.brakingDistanceFt}</div>
                      <div className="text-2xl font-bold text-destructive mb-1">ft</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Metric Distance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.brakingDistanceM}</div>
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
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Friction Coeff.</div>
                    <div className="text-2xl font-bold text-blue-500">{results.frictionCoefficient}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Road Condition</div>
                    <div className="text-xl font-bold text-foreground uppercase">{inputs.roadCondition}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">The Exponential Curve of Kinetic Energy</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Speed" tickFormatter={(val) => `${val} MPH`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} ft`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.speed)} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: 'hsl(var(--destructive))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} ft`, 'Braking Distance']}
                          labelFormatter={(label) => `Speed: ${label} MPH`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="Distance (ft)" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Because kinetic energy squares with velocity, doubling your speed quadruples your braking distance.</div>
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
                          <th className="px-4 py-3 font-semibold text-right text-destructive">Braking Distance (ft)</th>
                          <th className="px-4 py-3 font-semibold text-right">Braking Distance (m)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.speed} className={`hover:bg-muted/20 transition-colors ${row.speed == parseFloat(inputs.speed) ? 'bg-destructive/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.speed} MPH</td>
                            <td className="px-4 py-3 text-right text-destructive font-bold">{row.distFt} ft</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.distM} m</td>
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
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Deceleration</h2>
            <p>Every time you press the brake pedal, you are engaging in a violent exercise of physics. A 4,000-pound vehicle traveling at 70 MPH possesses a massive amount of kinetic energy. The brakes must convert 100% of that kinetic energy into thermal energy (heat) in a matter of seconds. The physical distance the car travels while the brakes are working to dissipate this energy is known as the <strong>Braking Distance</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">The Exponential Danger of Speed</h2>
            <p>Look at the exponential curve on the calculator's chart. Notice how the line rockets upward as speeds increase. This is due to the formula for kinetic energy: <code>KE = 1/2 × Mass × Velocity²</code>.</p>
            <p>Because velocity is <em>squared</em> in the equation, speed has an exponential impact on braking distance. If you are driving through a neighborhood at 20 MPH, your braking distance is a brief 19 feet. If you speed up to 40 MPH (double the speed), your braking distance does not double to 38 feet—it quadruples to 76 feet. If you are speeding on the highway at 80 MPH, you will need over 300 feet of clear asphalt to stop.</p>

            <h2 className="text-2xl font-bold mb-3">Why Good Tires Matter More Than Good Brakes</h2>
            <p>A common misconception in the automotive world is that installing massive, expensive "Big Brake Kits" will drastically reduce your stopping distance. This is false. A factory braking system on a modern Honda Civic is more than capable of locking up the wheels and triggering the Anti-Lock Braking System (ABS). Once the wheels lock, the brakes have done 100% of their job.</p>
            <p>At that point, the only thing stopping the car is the friction between the rubber tire and the road. If you have cheap, bald tires with a low friction coefficient, the car will slide. The absolute best way to decrease your braking distance is to buy high-quality, sticky tires. Big brake kits are designed to prevent heat fade during repeated, extreme track driving, not to shorten a single panic stop.</p>

            <h2 className="text-2xl font-bold mb-3">The Weather Factor</h2>
            <p>The road surface coefficient of friction is the master variable in the braking equation. Dry asphalt provides an excellent coefficient of ~0.70. When it rains, a layer of water forms between the rubber and the road, dropping friction to ~0.40. Driving in the rain physically increases your braking distance by 75%. On ice, the friction coefficient drops near zero, rendering your brakes almost entirely useless.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/braking-distance-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Braking Distance Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Braking Distance Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Braking Distance Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Braking Distance Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Braking Distance Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
