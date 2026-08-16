"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CapResult {
  capacitance: number;
  areaM2: number;
  distanceM: number;
  permittivity: number;
  charge: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const MATERIALS: Record<string, { label: string; k: number }> = {
  vacuum: { label: "Vacuum (ε₀)", k: 1 },
  air: { label: "Air", k: 1.0006 },
  paper: { label: "Paper", k: 3.5 },
  glass: { label: "Glass", k: 5.0 },
  ceramic: { label: "Ceramic", k: 10.0 },
  teflon: { label: "Teflon", k: 2.1 },
  polyester: { label: "Polyester", k: 3.3 },
};

function fmtCap(f: number): string {
  if (f >= 1) return `${f.toFixed(3)} F`;
  if (f >= 1e-3) return `${(f * 1e3).toFixed(2)} mF`;
  if (f >= 1e-6) return `${(f * 1e6).toFixed(2)} µF`;
  if (f >= 1e-9) return `${(f * 1e9).toFixed(2)} nF`;
  return `${(f * 1e12).toFixed(2)} pF`;
}

function calcCapacitance(areaCm2: number, distanceMm: number, materialKey: string, voltage: number): CapResult {
  const mat = MATERIALS[materialKey] || MATERIALS.air;
  const A = Math.max(0, areaCm2) / 10000; // cm² to m²
  const d = Math.max(0.000001, distanceMm) / 1000; // mm to m
  const eps0 = 8.854e-12;
  const permittivity = mat.k * eps0;
  const capacitance = permittivity * A / d;
  const charge = capacitance * Math.max(0, voltage);

  return {
    capacitance,
    areaM2: A,
    distanceM: d,
    permittivity,
    charge,
    chartData: [
      { name: "Area (cm²)", value: +areaCm2.toFixed(1) },
      { name: "Distance (mm)", value: +distanceMm.toFixed(2) },
      { name: "Capacitance (pF)", value: +(capacitance * 1e12).toFixed(1) },
    ],
    breakdown: [
      { label: "Plate Area", value: `${areaCm2} cm² (${A.toFixed(5)} m²)` },
      { label: "Plate Separation", value: `${distanceMm} mm (${(d * 1000).toFixed(3)} m)` },
      { label: "Dielectric", value: mat.label },
      { label: "Relative Permittivity (k)", value: `${mat.k}` },
      { label: "Permittivity (kε₀)", value: `${permittivity.toExponential(3)} F/m` },
      { label: "Capacitance", value: fmtCap(capacitance) },
      { label: "Applied Voltage", value: `${voltage} V` },
      { label: "Stored Charge (Q=CV)", value: `${charge.toExponential(3)} C` },
    ],
    summaryStats: [
      { label: "Capacitance", value: fmtCap(capacitance) },
      { label: "Stored Charge", value: `${charge.toExponential(2)} C` },
      { label: "Dielectric k", value: `${mat.k}` },
      { label: "Area", value: `${areaCm2} cm²` },
      { label: "Separation", value: `${distanceMm} mm` },
      { label: "Energy (½CV²)", value: `${(0.5 * capacitance * voltage * voltage).toExponential(2)} J` },
    ],
  };
}

const DEFAULTS = { area: "100", distance: "1", material: "air", voltage: "12" };

export default function CapacitanceCalculator() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  const [result, setResult] = useState<CapResult>(() => calcCapacitance(100, 1, "air", 12));

  const calculate = () => setResult(calcCapacitance(parseFloat(area) || 0, parseFloat(distance) || 0, material, parseFloat(voltage) || 0));
  const reset = () => { setArea(DEFAULTS.area); setDistance(DEFAULTS.distance); setMaterial(DEFAULTS.material); setVoltage(DEFAULTS.voltage); setResult(calcCapacitance(100, 1, "air", 12)); };
  useEffect(() => { setResult(calcCapacitance(100, 1, "air", 12)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is capacitance?", answer: "Capacitance measures how much electric charge a component can store per unit of voltage: C = Q/V, measured in farads. A parallel-plate capacitor's capacitance depends on plate area, separation, and the dielectric material between the plates." },
    { question: "What is the parallel-plate formula?", answer: "C = kε₀A/d, where k is the dielectric's relative permittivity, ε₀ = 8.854 × 10⁻¹² F/m is the vacuum permittivity, A is the plate area, and d is the separation. Larger plates and closer spacing both increase capacitance." },
    { question: "What does a dielectric do?", answer: "A dielectric is the insulating material between the plates. Its relative permittivity k multiplies the capacitance — air is ~1, paper 3.5, glass 5, and ceramics up to 10 — while also allowing the capacitor to withstand higher voltages." },
    { question: "How do capacitors store energy?", answer: "Energy = ½CV². The charge stored is Q = CV. Capacitors release this energy quickly, which is why they smooth power supplies, power camera flashes, and filter signals in every electronic device." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Capacitance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Capacitance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plate Area</label>
                <div className={inp}><input type="number" value={area} onChange={e => setArea(e.target.value)} className={ci} min={0} step={10} /><span className="pr-3 text-muted-foreground text-sm">cm²</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plate Separation</label>
                <div className={inp}><input type="number" value={distance} onChange={e => setDistance(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">mm</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Dielectric Material</label>
              <select value={material} onChange={e => setMaterial(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                {Object.entries(MATERIALS).map(([key, m]) => <option key={key} value={key}>{m.label} (k = {m.k})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Applied Voltage</label>
              <div className={inp}><input type="number" value={voltage} onChange={e => setVoltage(e.target.value)} className={ci} min={0} step={1} /><span className="pr-3 text-muted-foreground text-sm">V</span></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Capacitance</div>
              <div className="text-4xl font-extrabold text-primary">{fmtCap(result.capacitance)}</div>
              <div className="text-sm text-muted-foreground mt-1">{MATERIALS[material].label} · stores {result.charge.toExponential(2)} C at {voltage} V</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Stored Charge", `${result.charge.toExponential(2)} C`], ["Dielectric k", `${MATERIALS[material].k}`], ["Energy", `${(0.5 * result.capacitance * Math.pow(parseFloat(voltage) || 0, 2)).toExponential(2)} J`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Capacitor Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Capacitance Drivers</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v, "Value"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={55}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 2 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
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
            <h2 className="text-2xl font-bold mb-3">What Is Capacitance?</h2>
            <p>A <strong>capacitance calculator</strong> computes how much charge a capacitor stores using the parallel-plate formula C = kε₀A/d. Capacitance rises with larger plate area and falls with wider plate separation; the dielectric material multiplies the result by its relative permittivity k.</p>
            <h2 className="text-2xl font-bold mb-3">The Parallel-Plate Formula</h2>
            <p>C = kε₀A/d. The vacuum permittivity ε₀ is 8.854 × 10⁻¹² F/m. With A in square meters and d in meters, the result is in farads. In practice capacitances are tiny — this calculator displays picofarads, nanofarads, and microfarads as appropriate.</p>
            <h2 className="text-2xl font-bold mb-3">Where Capacitors Are Used</h2>
            <p>Capacitors smooth voltage ripple in power supplies, store flash energy in cameras, couple and filter audio signals, and tune radio circuits. The stored charge Q = CV and energy ½CV² let engineers size components for the exact requirements of a circuit.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/capacitance-calculator" />
          <PopularCalculators exclude="/calculator/capacitance-calculator" />
        </div>
      </div>
    </>
  );
}
