"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Food Miles = distance food travels from origin to consumer
// Carbon emissions from transport = distance × weight × emission factor (kg CO2e per tonne-km)
// Emission factors: air 1.013, truck 0.062, ship 0.008, rail 0.022 kg CO2e/tonne-km (DEFRA 2023)
const TRANSPORT_MODES = [
  { id: "truck", label: "Truck (road)", factor: 0.062, emoji: "🚛" },
  { id: "ship", label: "Cargo Ship", factor: 0.008, emoji: "🚢" },
  { id: "rail", label: "Rail (freight)", factor: 0.022, emoji: "🚂" },
  { id: "air", label: "Air freight", factor: 1.013, emoji: "✈️" },
];

interface Leg { id: number; distance: string; distUnit: string; weight: string; weightUnit: string; mode: string; }

interface FoodMilesResult {
  totalKm: number;
  totalEmissions: number;
  emissionsPerKg: number;
  legs: { label: string; km: number; emissions: number; mode: string }[];
  chartData: { name: string; emissions: number; km: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function convertToKm(dist: number, unit: string): number {
  if (unit === "mi") return dist * 1.60934;
  if (unit === "nm") return dist * 1.852;
  return dist;
}
function convertToTonnes(weight: number, unit: string): number {
  if (unit === "kg") return weight / 1000;
  if (unit === "lb") return weight / 2204.62;
  if (unit === "t") return weight;
  return weight / 1000; // default kg
}

function calculate(legs: Leg[]): FoodMilesResult | null {
  if (!legs.length) return null;
  const processed = legs.map((l, i) => {
    const km = convertToKm(parseFloat(l.distance) || 0, l.distUnit);
    const tonnes = convertToTonnes(parseFloat(l.weight) || 1, l.weightUnit);
    const mode = TRANSPORT_MODES.find(m => m.id === l.mode)!;
    const emissions = km * tonnes * mode.factor;
    return { label: `Leg ${i + 1} (${mode.emoji} ${mode.label})`, km, emissions, mode: mode.label };
  });

  const totalKm = processed.reduce((s, l) => s + l.km, 0);
  const totalEmissions = processed.reduce((s, l) => s + l.emissions, 0);
  const totalWeightTonnes = legs.reduce((s, l) => s + convertToTonnes(parseFloat(l.weight) || 1, l.weightUnit), 0);
  const emissionsPerKg = totalWeightTonnes > 0 ? (totalEmissions / totalWeightTonnes) / 1000 : 0; // kg CO2e per kg food

  const chartData = processed.map((l, i) => ({ name: `Leg ${i + 1}`, emissions: parseFloat(l.emissions.toFixed(4)), km: parseFloat(l.km.toFixed(1)) }));

  const breakdown = [
    ...processed.map((l, i) => ({ label: l.label, value: `${l.km.toFixed(0)} km → ${l.emissions.toFixed(4)} kg CO₂e` })),
    { label: "Total Distance", value: `${totalKm.toFixed(0)} km (${(totalKm / 1.60934).toFixed(0)} mi)` },
    { label: "Total Emissions", value: `${totalEmissions.toFixed(4)} kg CO₂e` },
    { label: "Emissions per kg Food", value: `${emissionsPerKg.toFixed(4)} kg CO₂e/kg` },
  ];

  const summaryStats = [
    { label: "Total Distance", value: `${totalKm.toFixed(0)} km` },
    { label: "Total CO₂e", value: `${totalEmissions.toFixed(3)} kg` },
    { label: "CO₂e / kg food", value: `${emissionsPerKg.toFixed(4)} kg` },
    { label: "Legs", value: `${legs.length}` },
    { label: "Equiv. Car km", value: `${(totalEmissions / 0.21).toFixed(1)} km` },
    { label: "Transport Mix", value: [...new Set(legs.map(l => TRANSPORT_MODES.find(m => m.id === l.mode)!.emoji))].join(" ") },
  ];

  return { totalKm, totalEmissions, emissionsPerKg, legs: processed, chartData, breakdown, summaryStats };
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
let nextId = 1;

export default function FoodMilesCalculator() {
  const [legs, setLegs] = useState<Leg[]>([
    { id: nextId++, distance: "8000", distUnit: "km", weight: "500", weightUnit: "kg", mode: "ship" },
    { id: nextId++, distance: "200", distUnit: "km", weight: "500", weightUnit: "kg", mode: "truck" },
  ]);
  const [result, setResult] = useState<FoodMilesResult | null>(null);

  const run = (l = legs) => setResult(calculate(l));
  useEffect(() => { run(); }, []);

  const addLeg = () => {
    const newLegs = [...legs, { id: nextId++, distance: "100", distUnit: "km", weight: "100", weightUnit: "kg", mode: "truck" }];
    setLegs(newLegs); run(newLegs);
  };
  const removeLeg = (id: number) => { const nl = legs.filter(l => l.id !== id); setLegs(nl); run(nl); };
  const updateLeg = (id: number, field: keyof Leg, value: string) => {
    const nl = legs.map(l => l.id === id ? { ...l, [field]: value } : l);
    setLegs(nl); run(nl);
  };

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Everyday Life",href:"/calculator/everyday-life"},{label:"Food Miles Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Food Miles Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Supply Chain Legs</div>
            {legs.map((leg, idx) => (
              <div key={leg.id} className="border border-border rounded-lg p-3 bg-secondary/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Leg {idx + 1}</span>
                  {legs.length > 1 && (
                    <button type="button" onClick={() => removeLeg(leg.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="text-xs font-medium mb-1 text-muted-foreground">Distance</label>
                    <div className="flex gap-1">
                      <input type="number" value={leg.distance} min={0} step="any"
                        onChange={e => updateLeg(leg.id, "distance", e.target.value)}
                        className="h-9 flex-1 min-w-0 px-2 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" />
                      <select value={leg.distUnit} onChange={e => updateLeg(leg.id, "distUnit", e.target.value)}
                        className="h-9 px-1.5 text-xs rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground">
                        {[{ v: "km", l: "km" }, { v: "mi", l: "mi" }, { v: "nm", l: "nm" }].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-medium mb-1 text-muted-foreground">Cargo Weight</label>
                    <div className="flex gap-1">
                      <input type="number" value={leg.weight} min={0} step="any"
                        onChange={e => updateLeg(leg.id, "weight", e.target.value)}
                        className="h-9 flex-1 min-w-0 px-2 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" />
                      <select value={leg.weightUnit} onChange={e => updateLeg(leg.id, "weightUnit", e.target.value)}
                        className="h-9 px-1.5 text-xs rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground">
                        {[{ v: "kg", l: "kg" }, { v: "lb", l: "lb" }, { v: "t", l: "t" }].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1 text-muted-foreground">Transport Mode</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {TRANSPORT_MODES.map(m => (
                      <button key={m.id} type="button"
                        onClick={() => updateLeg(leg.id, "mode", m.id)}
                        className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors ${leg.mode === m.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                        {m.emoji} {m.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {legs.length < 5 && (
              <button type="button" onClick={addLeg}
                className="h-8 w-full border border-dashed border-border rounded-md flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Leg
              </button>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => run()}
                className="h-10 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-colors">Calculate</button>
              <button type="button" onClick={() => {
                const def: Leg[] = [
                  { id: nextId++, distance: "8000", distUnit: "km", weight: "500", weightUnit: "kg", mode: "ship" },
                  { id: nextId++, distance: "200", distUnit: "km", weight: "500", weightUnit: "kg", mode: "truck" },
                ];
                setLegs(def); run(def);
              }} aria-label="Reset" className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Food Miles</div>
                <div className="text-4xl font-bold text-primary">{result.totalKm.toFixed(0)} km</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total CO₂e: <span className="font-semibold text-foreground">{result.totalEmissions.toFixed(3)} kg</span> — {result.emissionsPerKg.toFixed(4)} kg CO₂e per kg food
                </div>
              </div>
              <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  { label: "Distance", value: `${result.totalKm.toFixed(0)} km`, color: "text-primary" },
                  { label: "Total CO₂e", value: `${result.totalEmissions.toFixed(3)} kg`, color: "text-amber-500" },
                  { label: "CO₂e / kg food", value: `${result.emissionsPerKg.toFixed(4)} kg`, color: "" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Segment</th>
                      <th className="text-right text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label.includes("Total") ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="text-sm py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="text-sm py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">CO₂e Emissions by Leg (kg)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any, n: string) => [`${v} ${n === "emissions" ? "kg CO₂e" : "km"}`, n]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: 12 }} />
                    <Bar dataKey="emissions" name="CO₂e" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Are Food Miles?</h2>
            <p className="text-muted-foreground leading-relaxed">Food miles measure the distance food travels from its point of production to the consumer. First popularized by Tim Lang in 1992, food miles have become a key metric in sustainable food systems analysis. This calculator goes beyond simple distance to calculate the carbon footprint of each transport leg using DEFRA 2023 emission factors, covering all four major freight modes: cargo ship (0.008 kg CO₂e/tonne-km), rail (0.022), truck (0.062), and air freight (1.013). Defaults model a typical imported product: 8,000 km by sea (e.g., from South America) and 200 km by truck to the final retailer.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How Food Mile Emissions Are Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">CO₂e Emissions per Leg = Distance (km) × Weight (tonnes) × Emission Factor (kg CO₂e/tonne-km). Total emissions are the sum across all legs. Emissions per kg food = Total CO₂e ÷ Total cargo weight (kg). Air freight has an emission factor 130× higher than sea freight — a single air-freighted strawberry has a carbon footprint many times larger than the same fruit shipped by sea, which is why airfreighting fresh produce is considered one of the most carbon-intensive food choices. The equivalent car kilometres metric converts total emissions to a relatable measure (assumes 0.21 kg CO₂e/km for an average petrol car).</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">You can model up to 5 supply chain legs with different transport modes, distances, and cargo weights per leg. The primary result shows total distance in km. The 3-stat bar shows distance, total CO₂e, and CO₂e per kilogram of food. The breakdown table shows each leg's contribution. The bar chart compares emissions by leg — typically revealing that even a small air freight leg dominates the total carbon footprint. Note that food miles alone don't determine environmental impact: locally grown food using energy-intensive greenhouses can have a higher carbon footprint than distant field-grown food shipped by sea.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/food-miles-calculator" />
      </div>
    </>
  );
}
