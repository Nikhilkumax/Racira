"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Wind, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface DragResults {
  dragForceLbs: number;
  powerRequiredHp: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDrag = (inputs: typeof DEFAULTS): DragResults => {
  const cd = parseFloat(inputs.cd);
  const area = parseFloat(inputs.area);
  const speedMph = parseFloat(inputs.speed);
  const airDensity = parseFloat(inputs.airDensity); // Default 0.0023769 slugs/ft^3 at sea level, 59°F

  if (isNaN(cd) || cd <= 0 || isNaN(area) || area <= 0 || isNaN(speedMph) || speedMph < 0 || isNaN(airDensity) || airDensity <= 0) {
    return {
      dragForceLbs: 0, powerRequiredHp: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // Convert Speed from MPH to feet per second (fps)
  // 1 MPH = 1.46667 fps
  const speedFps = speedMph * 1.46667;

  // Aerodynamic Drag Force Equation: Fd = 0.5 * p * V^2 * Cd * A
  // p = air density (slugs/ft^3)
  // V = velocity (fps)
  // Cd = drag coefficient
  // A = frontal area (sq ft)
  // Fd = Force in Pounds (lbs)
  const dragForceLbs = 0.5 * airDensity * Math.pow(speedFps, 2) * cd * area;

  // Power Required to Overcome Aerodynamic Drag (Horsepower)
  // Power (ft-lb/sec) = Force * Velocity
  // 1 HP = 550 ft-lb/sec
  const powerRequiredHp = (dragForceLbs * speedFps) / 550;

  // Generate chart data: Drag force and HP required from 20 to 160 MPH
  const chartData = [];
  const schedule = [];
  
  for (let s = 20; s <= 160; s += 10) {
    const sFps = s * 1.46667;
    const force = 0.5 * airDensity * Math.pow(sFps, 2) * cd * area;
    const hpReq = (force * sFps) / 550;
    
    chartData.push({
      Speed: s,
      "Drag Force (lbs)": Math.round(force),
      "HP Required": Math.round(hpReq)
    });

    if (s % 20 === 0) {
      schedule.push({
        speed: s,
        force: Math.round(force),
        hpReq: Math.round(hpReq)
      });
    }
  }

  return {
    dragForceLbs: Number(dragForceLbs.toFixed(1)),
    powerRequiredHp: Number(powerRequiredHp.toFixed(1)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  cd: "0.30",           // Typical modern sedan
  area: "24.0",         // Sq ft (typical car)
  speed: "70",          // MPH highway speed
  airDensity: "0.00237" // Standard sea level density in slugs/ft^3
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
export default function DragCoefficientCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DragResults>(calculateDrag(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateDrag(newInputs);
    if (!r.isError) setResults(r);
  };

  const setPreset = (cd: string, area: string) => {
    handleChange("cd", cd);
    // The previous state update might not have committed, so doing them together is safer:
    const newInputs = { ...inputs, cd, area };
    setInputs(newInputs);
    const r = calculateDrag(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDrag(DEFAULTS));
  };

  const faqs = [
    { question: "What is a Drag Coefficient (Cd)?", answer: "The Drag Coefficient (Cd) is a dimensionless number that describes how easily air flows around an object. A perfectly flat, brick-like wall might have a Cd of 1.0, meaning it catches almost all the air. A highly aerodynamic teardrop shape has a Cd of roughly 0.04. Modern cars typically range from 0.24 (Tesla Model 3, Prius) to 0.45 (Jeep Wrangler)." },
    { question: "Why does Drag Force increase so much at highway speeds?", answer: "Aerodynamic drag does not increase linearly; it increases exponentially with the square of your speed. If you double your speed from 35 MPH to 70 MPH, the air resistance does not double—it quadruples. This is why fuel economy drops so rapidly when driving above 65 MPH." },
    { question: "What is Frontal Area?", answer: "Frontal Area is the physical two-dimensional size of your vehicle if you looked at it directly from the front (height multiplied by width, minus the empty space under the car). A large SUV and a sleek sports car might both have a Drag Coefficient of 0.30, but because the SUV has twice the Frontal Area, it creates twice as much total drag force." },
    { question: "Why do supercars need so much horsepower?", answer: "Because power required to overcome drag scales with the cube of velocity. To push a car 200 MPH requires roughly eight times more horsepower than pushing it 100 MPH. At 200 MPH, a supercar is using over 500 horsepower solely to punch a hole through the air." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Drag Coefficient Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Drag Coefficient Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate the aerodynamic drag force pressing against your vehicle and the exact horsepower required to overcome it.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cd" label="Drag Coefficient (Cd)" value={inputs.cd} onChange={(v: string) => handleChange("cd", v)} step="0.01" placeholder="0.30" />
              <CompactInput id="area" label="Frontal Area" value={inputs.area} onChange={(v: string) => handleChange("area", v)} suffix="sq ft" placeholder="24.0" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-1">
              <CompactInput id="speed" label="Target Speed" value={inputs.speed} onChange={(v: string) => handleChange("speed", v)} suffix="MPH" placeholder="70" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-2 border-b border-border/50 pb-1">Quick Presets</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button type="button" onClick={() => setPreset("0.23", "23.5")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">Tesla Model 3</button>
              <button type="button" onClick={() => setPreset("0.28", "24.0")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">Standard Sedan</button>
              <button type="button" onClick={() => setPreset("0.36", "30.0")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">Pickup Truck</button>
              <button type="button" onClick={() => setPreset("0.45", "32.0")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">Jeep Wrangler</button>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="dens" label="Air Density (slugs/ft³)" value={inputs.airDensity} onChange={(v: string) => handleChange("airDensity", v)} step="0.00001" placeholder="0.00237" />
            </div>

            <div className="flex gap-2.5 mt-2">
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Aerodynamic Drag Force</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.dragForceLbs}</div>
                      <div className="text-2xl font-bold text-primary mb-1">lbs</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">HP Req. to Maintain Speed</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.powerRequiredHp}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">HP</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Drag Coeff (Cd)</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.cd}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Frontal Area</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.area} sq ft</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Speed</div>
                    <div className="text-2xl font-bold text-blue-500">{inputs.speed} MPH</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">The Exponential Cost of Speed</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Speed" tickFormatter={(val) => `${val} mph`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} HP`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.speed)} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value}`, name]}
                          labelFormatter={(label) => `Speed: ${label} MPH`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="HP Required" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Drag force scales exponentially. Notice how HP Required skyrockets after 80 MPH.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Aero Load Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Speed (MPH)</th>
                          <th className="px-4 py-3 font-semibold text-right">Physical Drag Force</th>
                          <th className="px-4 py-3 font-semibold text-right">HP Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.speed} className={`hover:bg-muted/20 transition-colors ${row.speed == parseFloat(inputs.speed) ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.speed} MPH</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.force} lbs</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.hpReq} HP</td>
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
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Invisible Wall: Aerodynamic Drag</h2>
            <p>When you drive down the road, your vehicle is physically ramming into billions of air molecules. At low speeds, air easily parts and flows around the car. However, air behaves like a fluid. As you drive faster, the air resists being moved out of the way, creating immense backward pressure against the front bumper and windshield. This invisible wall of air is known as Aerodynamic Drag Force. Our calculator uses fluid dynamics equations to show exactly how much horsepower your engine is wasting just to slice through the air.</p>

            <h2>Why Speed Kills Fuel Economy</h2>
            <p>Look at the HP Required chart provided by the calculator; it is not a straight line. The formula for drag force dictates that drag increases with the <strong>square of your velocity</strong>. This means if you double your speed from 35 MPH to 70 MPH, the air resistance does not double—it quadruples. </p>
            <p>Worse still, the engine horsepower required to overcome that drag increases with the <strong>cube of your velocity</strong>. If it takes 20 horsepower to cruise at 50 MPH, it will require 160 horsepower to cruise at 100 MPH. This is why fuel economy drops so violently when driving above 65 MPH on the highway.</p>

            <h2>Drag Coefficient vs. Frontal Area</h2>
            <p>The total drag on a vehicle is determined by two major factors multiplying against each other: Drag Coefficient (Cd) and Frontal Area (A).</p>
            <ul>
              <li><strong>Drag Coefficient (Cd):</strong> This measures how "slippery" the shape is. A raindrop has an incredibly low Cd. A boxy Jeep Wrangler has a very high Cd because the flat windshield catches the air like a parachute.</li>
              <li><strong>Frontal Area:</strong> This is the physical size of the hole you are punching in the air (width × height). A massive semi-truck and a modern sports car might technically have the exact same aerodynamic Drag Coefficient (0.35), but because the truck is physically five times larger, it will experience five times more drag force.</li>
            </ul>

            <h2>Why Top Speed is So Hard to Increase</h2>
            <p>This calculator perfectly demonstrates why building a 200 MPH supercar is so difficult. If a car maxes out at 150 MPH using 300 horsepower, you cannot simply add another 100 horsepower to reach 200 MPH. Because of the cubic relationship between speed and drag, you would likely need well over 700 horsepower just to push through that extra 50 MPH of dense air resistance.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/drag-coefficient-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
