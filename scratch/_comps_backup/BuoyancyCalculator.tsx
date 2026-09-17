"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BuoyResult {
  buoyantForce: number;
  weight: number;
  netForce: number;
  submergedPct: number;
  objectDensity: number;
  fluidDensity: number;
  willFloat: boolean;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const FLUIDS: Record<string, { density: number; label: string }> = {
  water: { density: 1000, label: "Fresh Water" },
  seawater: { density: 1025, label: "Sea Water" },
  oil: { density: 900, label: "Vegetable Oil" },
  gasoline: { density: 750, label: "Gasoline" },
  mercury: { density: 13600, label: "Mercury" },
  air: { density: 1.225, label: "Air" },
};

function calcBuoyancy(volumeL: number, objectDensity: number, fluidKey: string): BuoyResult {
  const fluid = FLUIDS[fluidKey] || FLUIDS.water;
  const v = Math.max(0, volumeL) / 1000; // L to m³
  const rhoObj = Math.max(0, objectDensity);
  const rhoFluid = fluid.density;

  const weight = rhoObj * v * 9.81;
  const buoyantForce = rhoFluid * v * 9.81;
  const netForce = buoyantForce - weight;
  const willFloat = rhoObj <= rhoFluid;
  const submergedPct = rhoObj > 0 ? Math.min(100, (rhoObj / rhoFluid) * 100) : 0;

  return {
    buoyantForce,
    weight,
    netForce,
    submergedPct,
    objectDensity: rhoObj,
    fluidDensity: rhoFluid,
    willFloat,
    chartData: [
      { name: "Buoyant Force", value: +buoyantForce.toFixed(2) },
      { name: "Object Weight", value: +weight.toFixed(2) },
    ],
    breakdown: [
      { label: "Object Volume", value: `${volumeL} L (${(v).toFixed(4)} m³)` },
      { label: "Object Density", value: `${rhoObj} kg/m³` },
      { label: "Fluid", value: fluid.label },
      { label: "Fluid Density", value: `${rhoFluid} kg/m³` },
      { label: "Weight (mg)", value: `${weight.toFixed(2)} N` },
      { label: "Buoyant Force (ρVg)", value: `${buoyantForce.toFixed(2)} N` },
      { label: "Net Force", value: `${netForce.toFixed(2)} N ${netForce >= 0 ? "upward" : "downward"}` },
      { label: "Submerged Fraction", value: `${submergedPct.toFixed(1)}%` },
    ],
    summaryStats: [
      { label: "Buoyant Force", value: `${buoyantForce.toFixed(2)} N` },
      { label: "Weight", value: `${weight.toFixed(2)} N` },
      { label: "Net Force", value: `${netForce.toFixed(2)} N` },
      { label: "Will Float", value: willFloat ? "Yes" : "No (sinks)" },
      { label: "Submerged", value: `${submergedPct.toFixed(1)}%` },
      { label: "Density Ratio", value: `${(rhoObj / rhoFluid).toFixed(3)}` },
    ],
  };
}

const DEFAULTS = { volume: "5", density: "600", fluid: "water" };

export default function BuoyancyCalculator() {
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [density, setDensity] = useState(DEFAULTS.density);
  const [fluid, setFluid] = useState(DEFAULTS.fluid);
  const [result, setResult] = useState<BuoyResult>(() => calcBuoyancy(5, 600, "water"));

  const calculate = () => setResult(calcBuoyancy(parseFloat(volume) || 0, parseFloat(density) || 0, fluid));
  const reset = () => { setVolume(DEFAULTS.volume); setDensity(DEFAULTS.density); setFluid(DEFAULTS.fluid); setResult(calcBuoyancy(5, 600, "water")); };
  useEffect(() => { setResult(calcBuoyancy(5, 600, "water")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is buoyancy?", answer: "Buoyancy is the upward force a fluid exerts on an object placed in it. Archimedes' principle states that the buoyant force equals the weight of the fluid displaced by the object." },
    { question: "What is the formula?", answer: "Buoyant force Fb = ρ_fluid × V_displaced × g, where ρ is fluid density, V is the displaced volume, and g is gravity (9.81 m/s²). An object floats when its density is less than the fluid's density." },
    { question: "Why do ships float if they're made of steel?", answer: "Steel is denser than water, but a ship's hull encloses a large air-filled volume. The ship's average density (total mass ÷ total volume including air) is less than water's, so it displaces enough water to float." },
    { question: "How does this relate to submarines?", answer: "Submarines adjust their average density by taking in or expelling ballast water. Flooding tanks increases density and the sub sinks; blowing tanks with compressed air decreases density and it rises." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Buoyancy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Buoyancy Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Object Volume</label>
                <div className={inp}><input type="number" value={volume} onChange={e => setVolume(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">L</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Object Density</label>
                <div className={inp}><input type="number" value={density} onChange={e => setDensity(e.target.value)} className={ci} min={0} step={10} /><span className="pr-3 text-muted-foreground text-sm">kg/m³</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Fluid</label>
              <select value={fluid} onChange={e => setFluid(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                {Object.entries(FLUIDS).map(([key, f]) => <option key={key} value={key}>{f.label} ({f.density} kg/m³)</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Buoyant Force</div>
              <div className="text-4xl font-extrabold text-primary">{result.buoyantForce.toFixed(2)} <span className="text-2xl">N</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.willFloat ? "Floats — object density below fluid density" : "Sinks — object density above fluid density"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Object Weight", `${result.weight.toFixed(1)} N`], ["Net Force", `${result.netForce.toFixed(1)} N`], ["Submerged", `${result.submergedPct.toFixed(1)}%`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Force Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Buoyant Force vs Weight</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v} N`} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} N`, "Force"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={70}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Archimedes' Principle</h2>
            <p>A <strong>buoyancy calculator</strong> applies Archimedes' principle: the upward buoyant force on a submerged object equals the weight of the fluid it displaces. The formula is Fb = ρ × V × g, where ρ is fluid density, V is displaced volume, and g is gravitational acceleration (9.81 m/s²).</p>
            <h2 className="text-2xl font-bold mb-3">Floating vs Sinking</h2>
            <p>Whether an object floats depends on density, not size. If the object's density is below the fluid's density, the buoyant force at full submersion exceeds the object's weight, so it rises until only part of it is submerged — the fraction submerged equals the density ratio. If the object is denser than the fluid, it sinks.</p>
            <h2 className="text-2xl font-bold mb-3">Everyday Buoyancy</h2>
            <p>Ice floats because its density (917 kg/m³) is below water's. Ships float by displacing enough water to match their total weight. Hot air balloons use the same principle in air, and submarines control their average density with ballast tanks. The net force this calculator reports tells you whether an object will rise, sink, or hover.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/buoyancy-calculator" />
          <PopularCalculators exclude="/calculator/buoyancy-calculator" />
        </div>
      </div>
    </>
  );
}
