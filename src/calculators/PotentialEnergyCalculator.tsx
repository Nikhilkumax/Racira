"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const sci = (n: number) => n < 0.01 || n > 99999 ? n.toExponential(3) : fmt(n);

const PotentialEnergyCalculator = () => {
  const DEFAULTS = { mass: "10", height: "5", gravity: "9.81" };
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [gravity, setGravity] = useState(DEFAULTS.gravity);
  const [result, setResult] = useState<any>(null);

  const calculate = (m = mass, h = height, g = gravity) => {
    const M = parseFloat(m) || 0;
    const H = parseFloat(h) || 0;
    const G = parseFloat(g) || 0;
    if (M <= 0 || G <= 0) return;
    const pe = M * G * H;
    const peKJ = pe / 1000;
    const peKcal = pe / 4184;
    const peKWh = pe / 3600000;
    const impactV = H > 0 ? Math.sqrt(2 * G * H) : 0;
    const heights = [1, 2, 5, 10, 20, 50];
    const chartData = heights.map((ht) => ({ height: `${ht}m`, PE: parseFloat((M * G * ht).toFixed(1)) }));
    setResult({ M, H, G, pe, peKJ, peKcal, peKWh, impactV, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setMass(DEFAULTS.mass); setHeight(DEFAULTS.height); setGravity(DEFAULTS.gravity); calculate(DEFAULTS.mass, DEFAULTS.height, DEFAULTS.gravity); };

  const faqs = [
    { question: "What is gravitational potential energy?", answer: "Gravitational potential energy (PE) is the energy an object possesses due to its position above a reference point in a gravitational field. PE = mgh, where m is mass (kg), g is gravitational acceleration (9.81 m/s² on Earth), and h is height (meters). It represents the work the gravitational force would do if the object fell to the reference level." },
    { question: "What is the potential energy formula?", answer: "PE = m × g × h. Mass in kilograms, gravitational acceleration in m/s² (9.81 on Earth's surface), height in meters. Result is in joules (J). For a 10 kg object at 5 meters: PE = 10 × 9.81 × 5 = 490.5 J." },
    { question: "What units is potential energy measured in?", answer: "The SI unit is the joule (J) = kg⋅m²/s². Other common conversions: 1 kJ = 1,000 J. 1 kcal = 4,184 J. 1 kWh = 3,600,000 J. 1 foot-pound = 1.356 J. 1 BTU = 1,055 J." },
    { question: "Does potential energy depend on the path taken?", answer: "No — gravitational potential energy depends only on the initial and final heights, not the path. This is because gravity is a conservative force. Whether an object is lifted straight up, along a ramp, or via a spiral staircase, the PE change depends only on the vertical height difference." },
    { question: "What happens to potential energy when an object falls?", answer: "As an object falls, PE converts to kinetic energy (KE). At the instant before impact, all PE has converted to KE: ½mv² = mgh, so impact velocity v = √(2gh). This is the conservation of energy principle — total mechanical energy remains constant (ignoring air resistance)." },
    { question: "How does gravity vary on different planets?", answer: "Gravitational acceleration varies: Moon 1.62 m/s², Mars 3.71 m/s², Jupiter 24.79 m/s², Earth 9.81 m/s². This calculator allows you to change g for planetary PE calculations. On the Moon, a 10 kg object at 5 m has PE = 81 J vs 490.5 J on Earth." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Physics", href: "/calculator#physics" }, { label: "Potential Energy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Potential Energy Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Mass</label>
              <div className="relative">
                <input type="number" value={mass} onChange={(e) => setMass(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="0" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Height</label>
              <div className="relative">
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Gravitational Acceleration</label>
              <div className="relative">
                <input type="number" value={gravity} onChange={(e) => setGravity(e.target.value)} className="h-10 w-full px-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="9.81" step="0.01" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s²</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Gravitational Potential Energy</div>
                <div className="text-4xl font-bold text-primary">{sci(result.pe)} <span className="text-xl">J</span></div>
                <div className="text-sm text-muted-foreground mt-1">PE = {fmt(result.M)} kg × {fmt(result.G)} m/s² × {fmt(result.H)} m</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Mass (m)", value: `${fmt(result.M)} kg` },
                    { label: "Height (h)", value: `${fmt(result.H)} m` },
                    { label: "Gravity (g)", value: `${fmt(result.G)} m/s²` },
                    { label: "Potential Energy", value: `${sci(result.pe)} J` },
                    { label: "In Kilojoules", value: `${sci(result.peKJ)} kJ` },
                    { label: "In Kilocalories", value: `${sci(result.peKcal)} kcal` },
                    { label: "In kWh", value: `${sci(result.peKWh)} kWh` },
                    ...(result.H > 0 ? [{ label: "Impact Velocity (if dropped)", value: `${fmt(result.impactV)} m/s (${fmt(result.impactV * 3.6)} km/h)` }] : []),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">PE vs Height (at {fmt(result.M)} kg)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="height" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v}J`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)} J`} />
                    <Bar dataKey="PE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Quick Reference</h3>
                <div className="space-y-3">
                  {[
                    { label: "Potential Energy", value: `${sci(result.pe)} J` },
                    { label: "Energy in kJ", value: `${sci(result.peKJ)} kJ` },
                    ...(result.H > 0 ? [{ label: "Free-fall Impact Speed", value: `${fmt(result.impactV)} m/s`, border: true, bold: true }] : []),
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Potential Energy Calculator?</h2>
            <p>A potential energy calculator computes the gravitational potential energy stored in an object due to its position above a reference point in a gravitational field. PE = mgh, where m is mass, g is gravitational acceleration, and h is height. Pre-filled with 10 kg at 5 meters on Earth (g = 9.81 m/s²), the potential energy is 490.5 joules — the energy that would be released as kinetic energy if the object were dropped.</p>
            <h2>The Potential Energy Formula</h2>
            <p><strong>PE = m × g × h</strong></p>
            <p>Where: m = mass in kilograms, g = gravitational acceleration (9.81 m/s² on Earth), h = height above reference point in meters. Result is in joules (J). The formula assumes a uniform gravitational field — valid for heights much less than Earth's radius (6,371 km). For astronomical distances, use PE = −GMm/r.</p>
            <h2>Conservation of Energy</h2>
            <p>When an object falls, potential energy converts to kinetic energy: PE → KE. At any point during the fall, Total Energy = PE + KE = constant (ignoring air resistance). At the top: all PE, zero KE. At the bottom: zero PE, maximum KE. Impact velocity: v = √(2gh). For 5 meters: v = √(2 × 9.81 × 5) = 9.90 m/s (35.6 km/h).</p>
            <h2>Applications of Potential Energy</h2>
            <p>Hydroelectric power: Water stored behind a dam has enormous PE that converts to electrical energy as it flows through turbines. Roller coasters: PE at the top converts to KE on descents. Pendulums: Continuous PE ↔ KE oscillation. Pumped-storage energy: Excess electricity pumps water uphill (storing PE), then releases it during demand. Space launches: Rockets must overcome Earth's gravitational PE (approximately 63 MJ/kg to reach orbit).</p>
            <h2>Planetary Gravity Comparison</h2>
            <p>Gravitational acceleration varies by celestial body: Moon (1.62 m/s²), Mars (3.71 m/s²), Venus (8.87 m/s²), Earth (9.81 m/s²), Jupiter (24.79 m/s²), Sun (274 m/s²). A 10 kg object at 5 m on Jupiter has PE = 1,239.5 J vs 490.5 J on Earth — 2.5× more. Adjust the gravity field in this calculator to explore interplanetary PE scenarios.</p>
            <h2>Energy Unit Conversions</h2>
            <p>1 joule = 1 kg⋅m²/s². 1 kJ = 1,000 J. 1 kcal (food calorie) = 4,184 J. 1 kWh = 3,600,000 J. 1 BTU = 1,055 J. 1 eV = 1.602 × 10⁻¹⁹ J. Context: a 70 kg person climbing 10 meters expends about 6,867 J (1.6 kcal) of gravitational PE — a negligible fraction of daily caloric expenditure, which is why stair-climbing alone is not an efficient weight-loss strategy.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/potential-energy-calculator" />
          <PopularCalculators exclude="/calculator/potential-energy-calculator" />
        </div>
      </div>
    </>
  );
};

export default PotentialEnergyCalculator;
