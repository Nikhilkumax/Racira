"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const MATERIALS: Record<string, { label: string; c: number }> = {
  water: { label: "Water", c: 4186 },
  ice: { label: "Ice (−10 °C)", c: 2090 },
  steam: { label: "Steam (100 °C)", c: 2010 },
  aluminum: { label: "Aluminum", c: 900 },
  iron: { label: "Iron / Steel", c: 450 },
  copper: { label: "Copper", c: 385 },
  silver: { label: "Silver", c: 235 },
  air: { label: "Air", c: 1005 },
};

interface HeatResult {
  q: number;
  deltaT: number;
  material: string;
  chartData: { name: string; heat: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHeat(mass: number, c: number, t1: number, t2: number, material: string): HeatResult {
  const deltaT = t2 - t1;
  const q = mass * c * deltaT;

  // Heat needed for the same mass/ΔT across materials
  const chartData = Object.entries(MATERIALS).map(([key, m], i) => ({
    name: m.label.split(" ")[0],
    heat: mass * m.c * deltaT,
    fill: key === material ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Mass", value: `${mass.toFixed(3)} kg` },
    { label: "Material", value: MATERIALS[material]?.label ?? material },
    { label: "Specific Heat Capacity (c)", value: `${c.toLocaleString()} J/(kg·K)` },
    { label: "Initial Temperature", value: `${t1.toFixed(1)} °C` },
    { label: "Final Temperature", value: `${t2.toFixed(1)} °C` },
    { label: "Temperature Change (ΔT)", value: `${deltaT.toFixed(1)} °C = ${deltaT.toFixed(1)} K` },
    { label: "Heat Transferred (Q = mcΔT)", value: `${q.toLocaleString(undefined, { maximumFractionDigits: 0 })} J` },
    { label: "In Kilojoules", value: `${(q / 1000).toFixed(3)} kJ` },
  ];

  const summaryStats = [
    { label: "Heat (Q)", value: `${q.toLocaleString(undefined, { maximumFractionDigits: 0 })} J` },
    { label: "ΔT", value: `${deltaT.toFixed(1)} K` },
    { label: "Mass", value: `${mass.toFixed(3)} kg` },
    { label: "Specific Heat", value: `${c.toLocaleString()} J/(kg·K)` },
    { label: "Material", value: MATERIALS[material]?.label ?? material },
    { label: "Formula", value: "Q = m·c·ΔT" },
  ];

  return { q, deltaT, material, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SpecificHeatCalculator() {
  const [material, setMaterial] = useState("water");
  const [mass, setMass] = useState("1");
  const [t1, setT1] = useState("20");
  const [t2, setT2] = useState("80");
  const [result, setResult] = useState<HeatResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () => {
    const c = MATERIALS[material]?.c ?? 4186;
    setResult(calcHeat(Math.max(0, parse(mass, 1)), c, parse(t1, 20), parse(t2, 80), material));
  };
  const reset = () => {
    setMaterial("water");
    setMass("1");
    setT1("20");
    setT2("80");
    setResult(calcHeat(1, 4186, 20, 80, "water"));
  };
  useEffect(() => {
    setResult(calcHeat(1, 4186, 20, 80, "water"));
  }, []);

  const faqs = [
    { question: "What is specific heat capacity?", answer: "Specific heat capacity (c) is the energy needed to raise the temperature of 1 kg of a substance by 1 kelvin, in J/(kg·K). Water's 4,186 J/(kg·K) is famously high — nearly five times aluminum's — which is why oceans moderate coastal climates." },
    { question: "How do I calculate the heat required?", answer: "Use Q = m·c·ΔT: multiply the mass by the specific heat capacity and the temperature change. For 1 kg of water heated from 20 °C to 80 °C: Q = 1 × 4186 × 60 = 251,160 J — about the energy a 60 W bulb uses in 70 minutes." },
    { question: "Why is water's specific heat so high?", answer: "Water molecules store energy in hydrogen bonds and molecular vibrations, absorbing a lot of heat with little temperature rise. This makes water an excellent coolant (car radiators, nuclear reactors) and a natural climate stabilizer." },
    { question: "What is the difference between °C and K for ΔT?", answer: "None for temperature differences — a change of 1 °C equals a change of 1 K. Only absolute values differ (0 °C = 273.15 K). So ΔT can be computed directly in °C and used as kelvins." },
    { question: "What about phase changes?", answer: "During melting or boiling, temperature stays constant while latent heat is absorbed — Q = m·L, not m·c·ΔT. This calculator covers the single-phase region only; add latent heat separately for ice-to-water or water-to-steam transitions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Specific Heat Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Specific Heat Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Material</label>
                <div className={inp}>
                  <select value={material} onChange={(e) => setMaterial(e.target.value)} className={ci}>
                    {Object.entries(MATERIALS).map(([k, m]) => (
                      <option key={k} value={k}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mass (kg)</label>
                <div className={inp}><input type="number" value={mass} onChange={(e) => setMass(e.target.value)} className={ci} min={0} step={0.1} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Temp (°C)</label>
                <div className={inp}><input type="number" value={t1} onChange={(e) => setT1(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Final Temp (°C)</label>
                <div className={inp}><input type="number" value={t2} onChange={(e) => setT2(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Water: 4,186 · Ice: 2,090 · Aluminum: 900 · Iron: 450 · Copper: 385 J/(kg·K)</p>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Heat Transferred (Q)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.q.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-2xl text-muted-foreground">J</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.material} · ΔT = {result.deltaT.toFixed(1)} K · {(result.q / 1000).toFixed(3)} kJ</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Heat (Q)", `${result.q.toLocaleString(undefined, { maximumFractionDigits: 0 })} J`], ["ΔT", `${result.deltaT.toFixed(1)} K`], ["Specific Heat", `${(result.q / (Math.max(0.001, parseFloat(mass) || 1) * result.deltaT)).toLocaleString(undefined, { maximumFractionDigits: 0 })} J/(kg·K)`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Heat Needed for the Same Mass & ΔT</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " J", "Heat"]} />
                      <Bar dataKey="heat" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">The highlighted material shows how its capacity compares — water needs roughly 11× the energy of copper for the same temperature rise.</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Specific Heat and Calorimetry</h2>
            <p>Every substance stores heat differently. Specific heat capacity (c) is the energy required to raise 1 kg of a material by 1 kelvin, and the heat needed for a given temperature change is <strong>Q = m·c·ΔT</strong>. This single equation powers cooking, engine cooling, HVAC design, and climate science.</p>
            <h2 className="text-2xl font-bold mb-3">Why Water Is Special</h2>
            <p>Water's capacity of 4,186 J/(kg·K) is the highest of common substances. It takes 4.6 times more energy to heat water than the same mass of iron. This is why water is the default coolant everywhere from car engines to nuclear plants, and why large bodies of water smooth out seasonal temperature swings.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring Heat in Practice</h2>
            <p>Engineers measure heating in kilojoules or kilowatt-hours (1 kWh = 3.6 MJ). Heating 200 L of water from 15 °C to 60 °C needs 200 × 4186 × 45 = 37.7 MJ ≈ 10.5 kWh — the dominant energy cost of an electric water heater, and the reason tank insulation pays for itself.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/specific-heat-calculator" />
          <PopularCalculators exclude="/calculator/specific-heat-calculator" />
        </div>
      </div>
    </>
  );
}
