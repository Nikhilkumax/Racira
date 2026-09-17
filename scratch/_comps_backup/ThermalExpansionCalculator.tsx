"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const MATERIALS: Record<string, { label: string; alpha: number }> = {
  steel: { label: "Steel", alpha: 12e-6 },
  aluminum: { label: "Aluminum", alpha: 23e-6 },
  copper: { label: "Copper", alpha: 16.5e-6 },
  brass: { label: "Brass", alpha: 19e-6 },
  concrete: { label: "Concrete", alpha: 12e-6 },
  glass: { label: "Glass", alpha: 9e-6 },
};

interface ExpansionResult {
  deltaL: number;
  finalLength: number;
  strain: number;
  chartData: { name: string; expansion: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcExpansion(length: number, alpha: number, t1: number, t2: number, material: string): ExpansionResult {
  const deltaT = t2 - t1;
  const deltaL = alpha * length * deltaT;
  const finalLength = length + deltaL;
  const strain = deltaL / length;

  const chartData = Object.entries(MATERIALS).map(([key, m], i) => ({
    name: m.label,
    expansion: m.alpha * length * deltaT,
    fill: key === material ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Material", value: MATERIALS[material]?.label ?? material },
    { label: "Coefficient (α)", value: `${alpha.toExponential(2)} /°C` },
    { label: "Initial Length (L₀)", value: `${length.toFixed(2)} m` },
    { label: "Initial Temp", value: `${t1.toFixed(1)} °C` },
    { label: "Final Temp", value: `${t2.toFixed(1)} °C` },
    { label: "Temperature Change (ΔT)", value: `${deltaT.toFixed(1)} °C` },
    { label: "Expansion (ΔL = α·L₀·ΔT)", value: `${deltaL.toFixed(3)} m (${(deltaL * 1000).toFixed(2)} mm)` },
    { label: "Final Length", value: `${finalLength.toFixed(4)} m` },
  ];

  const summaryStats = [
    { label: "Expansion (ΔL)", value: `${(deltaL * 1000).toFixed(2)} mm` },
    { label: "Final Length", value: `${finalLength.toFixed(4)} m` },
    { label: "Strain (ΔL/L)", value: `${strain.toExponential(3)}` },
    { label: "α Coefficient", value: `${alpha.toExponential(2)} /°C` },
    { label: "Formula", value: "ΔL = α·L₀·ΔT" },
    { label: "Note", value: "Valid below the material's melting point" },
  ];

  return { deltaL, finalLength, strain, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function ThermalExpansionCalculator() {
  const [material, setMaterial] = useState("steel");
  const [length, setLength] = useState("10");
  const [t1, setT1] = useState("20");
  const [t2, setT2] = useState("100");
  const [result, setResult] = useState<ExpansionResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () => {
    const alpha = MATERIALS[material]?.alpha ?? 12e-6;
    setResult(calcExpansion(parse(length, 10, 0.001), alpha, parse(t1, 20), parse(t2, 100), material));
  };
  const reset = () => {
    setMaterial("steel");
    setLength("10");
    setT1("20");
    setT2("100");
    setResult(calcExpansion(10, 12e-6, 20, 100, "steel"));
  };
  useEffect(() => {
    setResult(calcExpansion(10, 12e-6, 20, 100, "steel"));
  }, []);

  const faqs = [
    { question: "What is thermal expansion?", answer: "Most materials expand when heated: their atoms vibrate more and take up more room. Linear expansion follows ΔL = α·L₀·ΔT, where α is the material's expansion coefficient in per-degree units." },
    { question: "Why do bridges have expansion joints?", answer: "A 100 m steel bridge girder expands about 96 mm when heated from 20 °C to 100 °C. Without expansion joints, that growth would buckle the structure or crush its supports — the gaps you hear 'thunk' over in summer." },
    { question: "What are typical α values?", answer: "Steel and concrete ≈ 12×10⁻⁶ /°C, copper 16.5, brass 19, aluminum 23, glass 9. Higher α means more expansion per degree — which is why aluminum windows need larger clearance gaps than steel ones." },
    { question: "What about area and volume expansion?", answer: "For isotropic materials, area expands with 2α and volume with 3α. A hole in a plate grows along with the plate — an expansion of 2α per degree — which is why heated parts get easier to remove, not stuck." },
    { question: "Where does this matter in engineering?", answer: "Railway rails (pre-stressed for summer heat), thermostats (bimetallic strips), clocks (temperature-compensated pendulums), and every precision instrument. The calculator's strain output also feeds structural stress calculations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Thermal Expansion Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Thermal Expansion Calculator</h1>

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
                <label className="text-sm font-medium mb-1 block">Initial Length (m)</label>
                <div className={inp}><input type="number" value={length} onChange={(e) => setLength(e.target.value)} className={ci} min={0.001} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Expansion (ΔL)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{(result.deltaL * 1000).toFixed(2)} <span className="text-2xl text-muted-foreground">mm</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.finalLength.toFixed(4)} m final length · strain {result.strain.toExponential(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["ΔL", `${(result.deltaL * 1000).toFixed(2)} mm`], ["Final Length", `${result.finalLength.toFixed(3)} m`], ["Strain", result.strain.toExponential(2)]].map(([l, v], i) => (
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
                  <h3 className="text-base font-bold mb-4">Expansion by Material</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v * 1000).toFixed(0)} mm`} />
                      <Tooltip formatter={(v: number) => [(v * 1000).toFixed(2) + " mm", "Expansion"]} />
                      <Bar dataKey="expansion" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Aluminum expands nearly twice as much as steel for the same temperature change.</p>
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
            <h2 className="text-2xl font-bold mb-3">Thermal Expansion, Explained</h2>
            <p>Heat makes atoms vibrate more energetically, pushing them farther apart on average. The result is that nearly every solid grows with temperature, following <strong>ΔL = α·L₀·ΔT</strong>. The coefficient α encodes how strongly a material resists — or embraces — this growth.</p>
            <h2 className="text-2xl font-bold mb-3">Why Engineers Respect ΔL</h2>
            <p>Over a 30 °C daily swing, a 200 m steel bridge moves about 72 mm — hence expansion joints. Railway tracks, pipelines, and skyscraper facades are all designed around predicted expansion, and bimetallic strips exploit mismatched α values to turn temperature into mechanical motion in thermostats.</p>
            <h2 className="text-2xl font-bold mb-3">Expansion Is Everywhere</h2>
            <p>Your car's engine block and pistons are machined with clearances that only vanish at operating temperature; power lines sag more in summer; concrete roads crack in controlled patterns precisely because free expansion is prevented. Understanding ΔL is understanding why every material system needs breathing room.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/thermal-expansion-calculator" />
          <PopularCalculators exclude="/calculator/thermal-expansion-calculator" />
        </div>
      </div>
    </>
  );
}
