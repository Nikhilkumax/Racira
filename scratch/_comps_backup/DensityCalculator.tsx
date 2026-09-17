"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type DensityMode = "density" | "mass" | "volume";

interface DensityResult {
  mode: DensityMode;
  densityGcm3: number;
  massKg: number;
  volumeL: number;
  specificGravity: number;
  densities: { unit: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function calcDensity(mode: DensityMode, a: number, b: number): DensityResult | null {
  let massKg: number, volumeL: number, densityGcm3: number;
  if (mode === "density") {
    massKg = a; volumeL = b;
    if (volumeL <= 0) return null;
    densityGcm3 = massKg / volumeL; // kg/L == g/cm³
  } else if (mode === "mass") {
    densityGcm3 = a; volumeL = b;
    if (densityGcm3 <= 0 || volumeL <= 0) return null;
    massKg = densityGcm3 * volumeL;
  } else {
    densityGcm3 = a; massKg = b;
    if (densityGcm3 <= 0) return null;
    volumeL = massKg / densityGcm3;
  }
  const specificGravity = densityGcm3 / 1.0;
  const densities = [
    { unit: "g/cm³", value: densityGcm3 },
    { unit: "kg/m³", value: densityGcm3 * 1000 },
    { unit: "g/mL", value: densityGcm3 },
    { unit: "lb/ft³", value: densityGcm3 * 62.42796 },
  ];

  const modeLabel = { density: "Density", mass: "Mass", volume: "Volume" }[mode];
  const breakdown = [
    { label: "Mass", value: `${massKg.toFixed(3)} kg (${(massKg * 2.20462).toFixed(2)} lb)` },
    { label: "Volume", value: `${volumeL.toFixed(3)} L (${(volumeL * 1000).toFixed(1)} ml)` },
    { label: "Density", value: `${densityGcm3.toFixed(3)} g/cm³` },
    { label: "Specific Gravity", value: `${specificGravity.toFixed(3)} (vs water at 4 °C)` },
    { label: "kg/m³", value: `${(densityGcm3 * 1000).toFixed(1)}` },
    { label: "lb/ft³", value: `${(densityGcm3 * 62.42796).toFixed(1)}` },
    { label: "Mode", value: modeLabel },
    { label: "Formula", value: "ρ = m / V" },
  ];
  const summaryStats = [
    { label: "Density", value: `${densityGcm3.toFixed(3)} g/cm³` },
    { label: "Mass", value: `${massKg.toFixed(3)} kg` },
    { label: "Volume", value: `${volumeL.toFixed(3)} L` },
    { label: "Specific Gravity", value: `${specificGravity.toFixed(3)}` },
    { label: "kg/m³", value: `${(densityGcm3 * 1000).toFixed(1)}` },
    { label: "lb/ft³", value: `${(densityGcm3 * 62.42796).toFixed(1)}` },
    { label: "Mode", value: modeLabel },
    { label: "Formula", value: "ρ = m / V" },
  ];
  const chartData = densities.map((d, i) => ({ name: d.unit, value: Math.round(d.value), fill: i === 0 ? "hsl(var(--primary))" : i === 1 ? "#8b5cf6" : i === 2 ? "#10b981" : "#f59e0b" }));
  return { mode, densityGcm3, massKg, volumeL, specificGravity, densities, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mode: "density" as DensityMode, a: "2", b: "0.5" };

export default function DensityCalculator() {
  const [mode, setMode] = useState<DensityMode>("density");
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [result, setResult] = useState<DensityResult | null>(null);

  const av = parseFloat(a) || 0;
  const bv = parseFloat(b) || 0;
  const errs: string[] = [];
  if (av <= 0) errs.push("First value must be greater than 0.");
  if (bv <= 0) errs.push("Second value must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDensity(mode, av, bv)); };
  const reset = () => {
    setMode("density"); setA(DEFAULTS.a); setB(DEFAULTS.b);
    setResult(calcDensity("density", 2, 0.5));
  };
  useEffect(() => { setResult(calcDensity("density", 2, 0.5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const labelA = { density: "Mass", mass: "Density", volume: "Density" }[mode];
  const labelB = { density: "Volume", mass: "Volume", volume: "Mass" }[mode];
  const unitA = mode === "density" ? "kg" : "g/cm³";
  const unitB = mode === "volume" ? "kg" : "L";

  const faqs = [
    { question: "What is density?", answer: "Density is mass per unit volume: ρ = m/V. Water at 4 °C has a density of exactly 1 g/cm³, which is why specific gravity — density relative to water — is numerically identical to density in g/cm³. The standard SI unit is kg/m³ (1 g/cm³ = 1,000 kg/m³)." },
    { question: "How do I convert between density units?", answer: "1 g/cm³ = 1,000 kg/m³ = 1 g/mL = 62.43 lb/ft³. Because 1 mL = 1 cm³, g/mL and g/cm³ are identical. To convert to lb/ft³, multiply g/cm³ by 62.428." },
    { question: "What is specific gravity?", answer: "Specific gravity is the ratio of a substance's density to water's density (1 g/cm³). It has no units. If a liquid has specific gravity 0.8, it is 80% as dense as water and will float on it — this is how hydrometers measure things like battery acid or beer gravity." },
    { question: "Why does ice float if it is solid?", answer: "Ice has a density of about 0.917 g/cm³ — lower than liquid water at 1.0 g/cm³ — because the crystal lattice spreads molecules farther apart. Most solids are denser than their liquid form; water's anomaly is why lakes freeze from the top." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Density Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Density Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Calculate What?</label>
              <select value={mode} onChange={e => setMode(e.target.value as DensityMode)} className={sel}>
                <option value="density">Density (from mass &amp; volume)</option>
                <option value="mass">Mass (from density &amp; volume)</option>
                <option value="volume">Volume (from mass &amp; density)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{labelA}</label>
                <div className={inp}><input type="number" value={a} onChange={e => setA(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">{unitA}</span></div>
              </div>
              <div>
                <label className={lbl}>{labelB}</label>
                <div className={inp}><input type="number" value={b} onChange={e => setB(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">{unitB}</span></div>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Density</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.densityGcm3.toFixed(3)} <span className="text-2xl text-muted-foreground">g/cm³</span></div>
                <div className="text-sm text-muted-foreground mt-1">Specific gravity {result.specificGravity.toFixed(3)} · {(result.densityGcm3 * 1000).toFixed(0)} kg/m³</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Mass", `${result.massKg.toFixed(2)} kg`], ["Volume", `${result.volumeL.toFixed(2)} L`], ["Specific Gravity", `${result.specificGravity.toFixed(2)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Density Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Density in Different Units</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Density Formula</h2>
            <p>Density ρ = mass m ÷ volume V. This <strong>density calculator</strong> solves for any of the three variables — given mass and volume it finds density; given density and volume it finds mass; given mass and density it finds volume. All conversions use exact factors: 1 g/cm³ = 1,000 kg/m³ = 62.428 lb/ft³.</p>
            <h2 className="text-2xl font-bold mb-3">Common Densities</h2>
            <p>Water 1.0 · aluminum 2.7 · iron 7.87 · lead 11.34 · gold 19.3 (all g/cm³). Air at sea level is about 0.001225 g/cm³ — 816× less dense than water. Density explains buoyancy, metal identification, and why helium balloons rise.</p>
            <h2 className="text-2xl font-bold mb-3">Applications</h2>
            <p>Density is used in quality control (detecting diluted fuel or milk), hydrometer design (battery charge, beer gravity), materials selection (lightweight aircraft alloys), and earth science (rock and soil classification). Specific gravity simplifies comparisons since it removes unit conversions entirely.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/density-calculator" />
          <PopularCalculators exclude="/calculator/density-calculator" />
        </div>
      </div>
    </>
  );
}
