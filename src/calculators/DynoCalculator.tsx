"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Activity, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

// 1. TypeScript interfaces
interface DynoResults {
  horsepower: number;
  torque: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDyno = (inputs: typeof DEFAULTS): DynoResults => {
  const calcType = inputs.calcType;
  const rpm = parseFloat(inputs.rpm);
  
  let horsepower = 0;
  let torque = 0;

  if (isNaN(rpm) || rpm <= 0) {
    return { horsepower: 0, torque: 0, chartData: [], schedule: [], isError: true, errorMsg: "RPM must be a valid positive number." };
  }

  if (calcType === "hp_from_torque") {
    torque = parseFloat(inputs.torque);
    if (isNaN(torque) || torque <= 0) {
      return { horsepower: 0, torque: 0, chartData: [], schedule: [], isError: true, errorMsg: "Torque must be a valid positive number." };
    }
    // HP = (Torque x RPM) / 5252
    horsepower = (torque * rpm) / 5252;
  } else {
    horsepower = parseFloat(inputs.horsepower);
    if (isNaN(horsepower) || horsepower <= 0) {
      return { horsepower: 0, torque: 0, chartData: [], schedule: [], isError: true, errorMsg: "Horsepower must be a valid positive number." };
    }
    // Torque = (HP x 5252) / RPM
    torque = (horsepower * 5252) / rpm;
  }

  // Generate chart data: Simulate a basic dyno curve crossing at 5252 RPM
  // We'll generate a realistic-looking parabolic torque curve peaking near the input RPM, and calculate HP from it.
  const chartData = [];
  const schedule = [];
  
  // Assume peak torque occurs at the input RPM for the sake of drawing a curve.
  const peakTorque = torque;
  const peakRpm = rpm;

  for (let r = 1000; r <= 8000; r += 500) {
    // Basic parabolic drop-off from peak torque
    const rpmDiff = Math.abs(r - peakRpm);
    const dropOffFactor = Math.pow(rpmDiff / 4000, 2); // Arbitrary curve shape
    const rTorque = Math.max(0, peakTorque * (1 - dropOffFactor));
    const rHp = (rTorque * r) / 5252;
    
    chartData.push({
      RPM: r,
      "Torque (lb-ft)": Math.round(rTorque),
      "Horsepower": Math.round(rHp)
    });

    if (r % 1000 === 0) {
      schedule.push({
        rpm: r,
        tq: Math.round(rTorque),
        hp: Math.round(rHp)
      });
    }
  }

  return {
    horsepower: Number(horsepower.toFixed(1)),
    torque: Number(torque.toFixed(1)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  calcType: "hp_from_torque", // "hp_from_torque" or "torque_from_hp"
  torque: "400",
  horsepower: "400",
  rpm: "5252"
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
export default function DynoCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DynoResults>(calculateDyno(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateDyno(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDyno(DEFAULTS));
  };

  const faqs = [
    { question: "What is the difference between Horsepower and Torque?", answer: "Torque is a measurement of twisting force. It is the actual physical force pushing you back in your seat when you accelerate. Horsepower is a measurement of work over time; it is calculated from Torque and RPM. The classic automotive saying is: 'Torque gets you moving, Horsepower keeps you moving.'" },
    { question: "Why do Horsepower and Torque always cross at 5252 RPM?", answer: "It is a mathematical law. The formula for Horsepower is (Torque x RPM) / 5252. Therefore, if you plug 5252 into the RPM variable, the RPM cancels out the 5252 denominator. At exactly 5252 RPM, Horsepower will always equal Torque. If you see a dyno graph where the lines cross anywhere other than 5252, the graph is fake or scaled incorrectly." },
    { question: "Can I increase Horsepower without increasing Torque?", answer: "Yes, by increasing the engine's RPM limit. Because Horsepower = (Torque x RPM) / 5252, if an engine maintains the exact same torque output but spins at 9,000 RPM instead of 6,000 RPM, it will mathematically generate significantly more horsepower. This is why Formula 1 cars have massive horsepower but relatively low torque—they spin at 15,000+ RPM." },
    { question: "What does a Dyno do?", answer: "A dynamometer (dyno) is a machine used to measure an engine's power output. A chassis dyno measures power at the wheels (WHP), while an engine dyno measures power directly at the crankshaft (BHP). The dyno physically measures Torque and RPM, and then its computer calculates the Horsepower." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Dyno Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dyno Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate engine Horsepower from Torque and RPM, or calculate Torque from Horsepower and RPM.</p>

            <div className="grid grid-cols-1 gap-4 mb-2">
              <CompactInput id="calcType" label="What do you want to calculate?" value={inputs.calcType} onChange={(v: string) => handleChange("calcType", v)} options={[
                { label: "Calculate Horsepower (from Torque)", value: "hp_from_torque" },
                { label: "Calculate Torque (from Horsepower)", value: "torque_from_hp" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {inputs.calcType === "hp_from_torque" ? (
                <CompactInput id="torque" label="Measured Torque" value={inputs.torque} onChange={(v: string) => handleChange("torque", v)} suffix="lb-ft" placeholder="400" />
              ) : (
                <CompactInput id="hp" label="Measured Horsepower" value={inputs.horsepower} onChange={(v: string) => handleChange("horsepower", v)} suffix="HP" placeholder="400" />
              )}
              <CompactInput id="rpm" label="Engine Speed" value={inputs.rpm} onChange={(v: string) => handleChange("rpm", v)} suffix="RPM" placeholder="5252" />
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
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm ${inputs.calcType === 'hp_from_torque' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Calculated Horsepower</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.horsepower}</div>
                      <div className="text-2xl font-bold text-primary mb-1">HP</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm ${inputs.calcType === 'torque_from_hp' ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background' : ''}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Calculated Torque</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.torque}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">lb-ft</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Horsepower</div>
                    <div className="text-2xl font-bold text-primary">{results.horsepower} HP</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Torque</div>
                    <div className="text-2xl font-bold text-emerald-500">{results.torque} lb-ft</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">RPM</div>
                    <div className="text-2xl font-bold text-muted-foreground">{inputs.rpm}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">The Dyno Curve (5252 RPM Crossing)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="RPM" tickFormatter={(val) => `${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={5252} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: '5252 Crossover', fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [value, name]}
                          labelFormatter={(label) => `Engine Speed: ${label} RPM`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Line type="monotone" name="Horsepower" dataKey="Horsepower" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                        <Line type="monotone" name="Torque (lb-ft)" dataKey="Torque (lb-ft)" stroke="hsl(150, 80%, 40%)" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Simulated Power Band</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Engine RPM</th>
                          <th className="px-4 py-3 font-semibold text-right text-emerald-600 dark:text-emerald-500">Torque (lb-ft)</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">Horsepower</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.rpm} className={`hover:bg-muted/20 transition-colors ${row.rpm == 5000 ? 'bg-muted/30 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.rpm} RPM</td>
                            <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500 font-bold">{row.tq}</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.hp}</td>
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
            <h2>The Mathematics of a Dyno</h2>
            <p>If you strap your car to a dynamometer (a "dyno"), it does not directly measure horsepower. A dyno is physically only capable of measuring two things: <strong>Torque</strong> (the twisting force of the tires against the rollers) and <strong>Engine Speed</strong> (RPM). Once the dyno captures these two variables, its internal computer uses a strict mathematical formula to calculate your Horsepower.</p>

            <h2>Horsepower vs. Torque: What is the difference?</h2>
            <p><strong>Torque</strong> is a measurement of physical force. If you use a 1-foot-long wrench and apply 100 pounds of force to the end of it, you are generating 100 lb-ft of torque. In an engine, torque is the raw, explosive force of the piston pushing down on the crankshaft. It is what pushes you back into your seat when you launch from a red light.</p>
            <p><strong>Horsepower</strong> is a measurement of work done over time. It answers the question: "How fast can you apply that torque?" If two cars both make 400 lb-ft of torque, but Car A can maintain that torque at 7,000 RPM while Car B chokes out at 4,000 RPM, Car A is doing significantly more work per second. Therefore, Car A has much more Horsepower and will win the race.</p>

            <h2>The 5252 RPM Crossover Rule</h2>
            <p>Look at the chart provided by our Dyno Calculator. You will notice that the Horsepower line and the Torque line perfectly intersect at exactly 5,252 RPM. This is not a coincidence; it is a mathematical law of physics originally established by James Watt.</p>
            <p>The formula for Horsepower is: <code>(Torque × RPM) / 5252</code></p>
            <p>If your engine is running at exactly 5,252 RPM, the formula becomes: <code>(Torque × 5252) / 5252</code>. The two 5252s cancel each other out, leaving Horsepower perfectly equal to Torque. If you ever look at a dyno graph from a tuning shop and the lines cross at 4,000 RPM or 6,000 RPM, the graph is either incorrectly scaled or completely fake.</p>

            <h2>Why Diesel Engines Feel So Different</h2>
            <p>Diesel trucks are famous for generating massive amounts of torque (e.g., 1,000+ lb-ft) but relatively low horsepower (e.g., 400 HP). Why? Because diesel engines physically cannot spin fast. A heavy-duty diesel engine might hit its redline at just 3,200 RPM. Because the RPM variable in the horsepower formula is so low, the resulting horsepower number remains low, despite the sheer twisting force being generated.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dyno-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
