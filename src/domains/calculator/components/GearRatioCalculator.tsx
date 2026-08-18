"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Settings, RotateCcw, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript interfaces
interface Gear {
  id: string;
  teeth: string;
}

interface RatioResults {
  overallRatio: number;
  torqueMultiplier: number;
  speedMultiplier: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateGearRatio = (gears: Gear[]): RatioResults => {
  if (gears.length < 2) {
    return { overallRatio: 0, torqueMultiplier: 0, speedMultiplier: 0, chartData: [], schedule: [], isError: true, errorMsg: "At least two gears are required." };
  }

  const parsedGears = gears.map(g => parseInt(g.teeth, 10));
  if (parsedGears.some(t => isNaN(t) || t <= 0)) {
    return { overallRatio: 0, torqueMultiplier: 0, speedMultiplier: 0, chartData: [], schedule: [], isError: true, errorMsg: "All gear teeth must be valid positive numbers." };
  }

  // Calculate overall gear ratio for a simple gear train (or compound if we assume alternating driving/driven, but let's assume simple train first, where idler gears don't affect ratio)
  // Wait, the prompt implies a standard ratio: Driven / Driving.
  // If it's a compound gear train: (Driven1/Driving1) * (Driven2/Driving2).
  // Let's implement a simple interface: just two gears for the basic calc, and maybe advanced is compound.
  // Actually, let's just make it simple: Gear 1 drives Gear 2. Gear 2 drives Gear 3...
  // In a simple gear train, any gears between the first and last are "idler gears" and do not affect the overall ratio!
  // Overall ratio = Last Driven Gear / First Driving Gear.
  
  const drivingTeeth = parsedGears[0];
  const drivenTeeth = parsedGears[parsedGears.length - 1];
  
  const overallRatio = drivenTeeth / drivingTeeth;
  
  // If Ratio > 1, torque increases, speed decreases (Underdrive / Reduction)
  // If Ratio < 1, torque decreases, speed increases (Overdrive)
  const torqueMultiplier = overallRatio;
  const speedMultiplier = 1 / overallRatio;

  const chartData = [
    { name: "Torque Multiplier", value: Number(torqueMultiplier.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Speed Multiplier", value: Number(speedMultiplier.toFixed(2)), fill: "hsl(var(--muted-foreground))" }
  ];

  const schedule = [];
  for (let i = 0; i < parsedGears.length - 1; i++) {
    const r = parsedGears[i + 1] / parsedGears[i];
    schedule.push({
      step: `Gear ${i + 1} to Gear ${i + 2}`,
      driving: parsedGears[i],
      driven: parsedGears[i + 1],
      ratio: Number(r.toFixed(3)),
      type: r > 1 ? "Reduction (More Torque)" : r < 1 ? "Overdrive (More Speed)" : "Direct Drive 1:1"
    });
  }

  return {
    overallRatio: Number(overallRatio.toFixed(3)),
    torqueMultiplier: Number(torqueMultiplier.toFixed(2)),
    speedMultiplier: Number(speedMultiplier.toFixed(2)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = [
  { id: "1", teeth: "10" }, // Driving
  { id: "2", teeth: "30" }  // Driven
];

const CompactInput = ({ id, label, value, onChange, placeholder, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function GearRatioCalculator() {
  const [gears, setGears] = useState<Gear[]>(DEFAULTS);
  const [results, setResults] = useState<RatioResults>(calculateGearRatio(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGearChange = (id: string, val: string) => {
    const newGears = gears.map(g => g.id === id ? { ...g, teeth: val } : g);
    setGears(newGears);
    const r = calculateGearRatio(newGears);
    if (!r.isError) setResults(r);
  };

  const addGear = () => {
    const newGears = [...gears, { id: Math.random().toString(36).substr(2, 9), teeth: "20" }];
    setGears(newGears);
    const r = calculateGearRatio(newGears);
    if (!r.isError) setResults(r);
  };

  const removeGear = (id: string) => {
    if (gears.length <= 2) return;
    const newGears = gears.filter(g => g.id !== id);
    setGears(newGears);
    const r = calculateGearRatio(newGears);
    if (!r.isError) setResults(r);
  };

  const handleCalculate = () => {
    const r = calculateGearRatio(gears);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setGears(DEFAULTS);
    setResults(calculateGearRatio(DEFAULTS));
  };

  const faqs = [
    { question: "How do you calculate Gear Ratio?", answer: "The formula for a simple gear ratio is incredibly straightforward: divide the number of teeth on the Driven gear (the output) by the number of teeth on the Driving gear (the input). For example, if your engine is spinning a gear with 10 teeth, and that gear is turning a larger gear with 30 teeth, the ratio is 30 / 10 = 3.0:1." },
    { question: "What does a 3.0:1 Gear Ratio mean?", answer: "A 3.0:1 ratio means the driving gear must complete three full revolutions to make the driven gear complete one full revolution. Because the driven gear is spinning slower, it is generating mathematically more torque. This is called a gear reduction." },
    { question: "What is an Idler Gear?", answer: "If you place a third gear directly between the driving gear and the driven gear, it is called an idler gear. Its only purpose is to reverse the direction of rotation. Mathematically, an idler gear has zero effect on the overall gear ratio of the system. The overall ratio will still be determined solely by the first driving gear and the final driven gear." },
    { question: "What is Torque vs. Speed trade-off?", answer: "The fundamental law of mechanics states you cannot create energy out of nothing. Gears allow you to trade speed for torque, or torque for speed. If you use a large gear to drive a small gear (e.g., 0.5:1 ratio), the small gear will spin incredibly fast, but it will have very little torque (turning force). If you use a small gear to drive a large gear (e.g., 4.0:1), the large gear will spin slowly, but with massive, crushing torque." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Gear Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gear Ratio Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate the mechanical advantage and overall ratio of a simple gear train by counting the teeth.</p>

            <div className="flex flex-col gap-3">
              {gears.map((g, index) => (
                <div key={g.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <CompactInput 
                      id={`g-${g.id}`} 
                      label={index === 0 ? "Gear 1 (Driving / Input)" : index === gears.length - 1 ? `Gear ${index + 1} (Driven / Output)` : `Gear ${index + 1} (Idler)`} 
                      value={g.teeth} 
                      onChange={(v: string) => handleGearChange(g.id, v)} 
                      suffix="Teeth" 
                    />
                  </div>
                  {gears.length > 2 && index !== 0 && index !== gears.length - 1 && (
                    <button type="button" onClick={() => removeGear(g.id)} className="h-9 w-9 flex items-center justify-center rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={addGear} className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-md h-9 border border-dashed border-primary/50 transition-colors mt-2">
              <Plus className="h-4 w-4" /> Add Idler Gear
            </button>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            
            {gears.length > 2 && (
              <div className="text-xs text-muted-foreground text-center mt-2 bg-muted/30 p-3 rounded-md border border-border">
                Notice: In a simple gear train, idler gears change the direction of rotation, but they do <strong>not</strong> change the overall gear ratio.
              </div>
            )}
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Overall Gear Ratio</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-7xl font-black text-primary tracking-tighter">{results.overallRatio}</div>
                    <div className="text-3xl font-bold text-primary mb-1.5">: 1</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    The driving gear must turn <strong className="text-primary">{results.overallRatio}</strong> times to turn the final driven gear once.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Torque Multiplier</div>
                    <div className="text-2xl font-bold text-emerald-500">{results.torqueMultiplier}x</div>
                    <div className="text-xs text-muted-foreground">Output force</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Speed Multiplier</div>
                    <div className="text-2xl font-bold text-blue-500">{results.speedMultiplier}x</div>
                    <div className="text-xs text-muted-foreground">Rotational velocity</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">The Mechanical Trade-off</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} width={120} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value}x`, 'Multiplier']}
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3 text-center">Gears allow you to trade speed for torque, or torque for speed. You cannot increase both simultaneously.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Step-by-Step Analysis</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Mesh Step</th>
                          <th className="px-4 py-3 font-semibold text-center">Teeth (In → Out)</th>
                          <th className="px-4 py-3 font-semibold text-right">Step Ratio</th>
                          <th className="px-4 py-3 font-semibold text-right">Mechanical Effect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row, i) => (
                          <tr key={i} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{row.step}</td>
                            <td className="px-4 py-3 text-center text-muted-foreground">{row.driving} → {row.driven}</td>
                            <td className="px-4 py-3 text-right font-bold text-foreground">{row.ratio}:1</td>
                            <td className={`px-4 py-3 text-right font-medium ${row.ratio > 1 ? 'text-emerald-500' : row.ratio < 1 ? 'text-blue-500' : 'text-muted-foreground'}`}>{row.type}</td>
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
            <h2 className="text-2xl font-bold mb-3">The Magic of Gear Ratios</h2>
            <p>Gears are one of the most fundamental mechanical inventions in human history. They allow a small motor with very little twisting force (torque) to lift incredibly heavy objects. This mechanical advantage is achieved through a Gear Ratio. By connecting a small gear (the driving gear) to a large gear (the driven gear), you force the small gear to spin multiple times just to turn the large gear once. This concentrates the force, multiplying the torque output at the expense of rotational speed.</p>

            <h2 className="text-2xl font-bold mb-3">How to Calculate a Simple Gear Ratio</h2>
            <p>The math behind gear ratios requires no advanced engineering degrees. You simply count the teeth on each gear. The formula is: <strong>Driven Teeth ÷ Driving Teeth</strong>.</p>
            <ul>
              <li><strong>Example 1:</strong> A 10-tooth gear driving a 40-tooth gear. 40 / 10 = 4.0. The ratio is 4.0:1. The small gear must spin 4 times to turn the big gear once. You have quadrupled your torque, but quartered your speed.</li>
              <li><strong>Example 2:</strong> A 50-tooth gear driving a 25-tooth gear. 25 / 50 = 0.5. The ratio is 0.5:1. This is called an Overdrive. The small gear spins twice as fast as the big gear, doubling your speed but cutting your torque in half.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Law of Conservation of Energy</h2>
            <p>It is critical to understand that gears do not create horsepower. The Law of Conservation of Energy states that energy cannot be created or destroyed. If your electric motor outputs 10 horsepower, the gears will still only output 10 horsepower (minus a tiny amount of friction heat). Gears simply alter how that horsepower is delivered. You can configure the gears to deliver that 10 HP as a massive, slow-moving twisting force (torque), or as a weak, incredibly fast-spinning velocity (speed). You cannot increase both simultaneously.</p>

            <h2 className="text-2xl font-bold mb-3">What is an Idler Gear?</h2>
            <p>In a simple gear train with two gears, the driven gear always spins in the opposite direction of the driving gear. If you need the output shaft to spin in the exact same direction as the input shaft, you place a third gear in the middle. This is called an <strong>Idler Gear</strong>.</p>
            <p>A fascinating rule of physics is that an idler gear has zero effect on the final gear ratio. You could place a massive 100-tooth idler gear or a tiny 5-tooth idler gear between your 10-tooth driving gear and 30-tooth driven gear. In both scenarios, the final ratio remains exactly 3.0:1. The idler simply transfers the motion and reverses the direction.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gear-ratio-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
