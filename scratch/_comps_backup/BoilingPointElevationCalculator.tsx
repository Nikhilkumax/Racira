"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BoilingResult {
  elevation: number;
  newBoilingPoint: number;
  molality: number;
  ebullioscopicConstant: number;
  vanTHoff: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const SOLVENTS: Record<string, { bp: number; kb: number; label: string }> = {
  water: { bp: 100, kb: 0.512, label: "Water" },
  ethanol: { bp: 78.37, kb: 1.22, label: "Ethanol" },
  benzene: { bp: 80.1, kb: 2.53, label: "Benzene" },
  chloroform: { bp: 61.2, kb: 3.63, label: "Chloroform" },
  carbonTetrachloride: { bp: 76.8, kb: 5.03, label: "Carbon Tetrachloride" },
};

function calcBoiling(solvent: string, soluteMoles: number, solventKg: number, vanTHoff: number): BoilingResult {
  const s = SOLVENTS[solvent] || SOLVENTS.water;
  const molality = solventKg > 0 ? soluteMoles / solventKg : 0;
  const i = Math.max(1, vanTHoff);
  const elevation = i * s.kb * molality;
  const newBoilingPoint = s.bp + elevation;

  return {
    elevation,
    newBoilingPoint,
    molality,
    ebullioscopicConstant: s.kb,
    vanTHoff: i,
    chartData: [
      { name: "Pure Solvent", value: +s.bp.toFixed(2) },
      { name: "Solution", value: +newBoilingPoint.toFixed(2) },
    ],
    breakdown: [
      { label: "Solvent", value: s.label },
      { label: "Solvent Boiling Point", value: `${s.bp} °C` },
      { label: "Ebullioscopic Constant (Kb)", value: `${s.kb} °C·kg/mol` },
      { label: "Solute Amount", value: `${soluteMoles} mol` },
      { label: "Solvent Mass", value: `${solventKg} kg` },
      { label: "Molality (m)", value: `${molality.toFixed(3)} mol/kg` },
      { label: "van't Hoff Factor (i)", value: `${i}` },
      { label: "Boiling Point Elevation (ΔTb)", value: `${elevation.toFixed(3)} °C` },
      { label: "New Boiling Point", value: `${newBoilingPoint.toFixed(2)} °C` },
    ],
    summaryStats: [
      { label: "ΔTb", value: `${elevation.toFixed(3)} °C` },
      { label: "New Boiling Point", value: `${newBoilingPoint.toFixed(2)} °C` },
      { label: "Molality", value: `${molality.toFixed(3)} mol/kg` },
      { label: "Kb (Solvent)", value: `${s.kb} °C·kg/mol` },
      { label: "van't Hoff (i)", value: `${i}` },
      { label: "Temperature Rise", value: `${((elevation / s.bp) * 100).toFixed(2)}%` },
    ],
  };
}

const DEFAULTS = { solvent: "water", moles: "0.5", kg: "1", i: "1" };

export default function BoilingPointElevationCalculator() {
  const [solvent, setSolvent] = useState(DEFAULTS.solvent);
  const [moles, setMoles] = useState(DEFAULTS.moles);
  const [kg, setKg] = useState(DEFAULTS.kg);
  const [i, setI] = useState(DEFAULTS.i);
  const [result, setResult] = useState<BoilingResult>(() => calcBoiling("water", 0.5, 1, 1));

  const calculate = () => setResult(calcBoiling(solvent, parseFloat(moles) || 0, parseFloat(kg) || 0, parseFloat(i) || 1));
  const reset = () => { setSolvent(DEFAULTS.solvent); setMoles(DEFAULTS.moles); setKg(DEFAULTS.kg); setI(DEFAULTS.i); setResult(calcBoiling("water", 0.5, 1, 1)); };
  useEffect(() => { setResult(calcBoiling("water", 0.5, 1, 1)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is boiling point elevation?", answer: "Adding a non-volatile solute to a solvent raises its boiling point. The change is a colligative property: it depends on the number of solute particles, not their identity. This is why salt water boils above 100 °C." },
    { question: "What is the formula?", answer: "ΔTb = i × Kb × m, where i is the van't Hoff factor (number of particles per dissolved formula unit), Kb is the solvent's ebullioscopic constant, and m is the molality (moles of solute per kg of solvent)." },
    { question: "What is the van't Hoff factor?", answer: "It is the number of particles a solute splits into when it dissolves. Sugar (nonelectrolyte) has i = 1; NaCl gives i = 2 (Na⁺ and Cl⁻); CaCl₂ gives i = 3." },
    { question: "What is molality?", answer: "Molality is moles of solute divided by kilograms of solvent. Unlike molarity, it does not change with temperature because it is based on solvent mass rather than solution volume." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Boiling Point Elevation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Boiling Point Elevation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Solvent</label>
              <select value={solvent} onChange={e => setSolvent(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                {Object.entries(SOLVENTS).map(([key, s]) => <option key={key} value={key}>{s.label} (BP {s.bp}°C, Kb {s.kb})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Solute Amount</label>
                <div className={inp}><input type="number" value={moles} onChange={e => setMoles(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">mol</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Solvent Mass</label>
                <div className={inp}><input type="number" value={kg} onChange={e => setKg(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">van't Hoff Factor (i)</label>
              <div className={inp}><input type="number" value={i} onChange={e => setI(e.target.value)} className={ci} min={1} step={0.1} /></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Boiling Point Elevation (ΔTb)</div>
              <div className="text-4xl font-extrabold text-primary">{result.elevation.toFixed(3)} °C</div>
              <div className="text-sm text-muted-foreground mt-1">Solution boils at {result.newBoilingPoint.toFixed(2)} °C (solvent: {result.breakdown[0].value})</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["New Boiling Point", `${result.newBoilingPoint.toFixed(2)} °C`], ["Molality", `${result.molality.toFixed(3)} m`], ["van't Hoff i", `${result.vanTHoff}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Colligative Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Boiling Point Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}°C`} />
                  <Tooltip formatter={(v: number) => [`${v} °C`, "Boiling Point"]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={70} />
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
            <h2 className="text-2xl font-bold mb-3">What Is Boiling Point Elevation?</h2>
            <p>A <strong>boiling point elevation calculator</strong> uses the colligative property that governs how solutes raise the boiling temperature of a solvent. When a non-volatile solute dissolves, it lowers the solvent's vapor pressure, so a higher temperature is required for the solution's vapor pressure to reach atmospheric pressure and boil.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>ΔTb = i × Kb × m. The elevation equals the van't Hoff factor multiplied by the solvent's ebullioscopic constant (Kb) and the molality of the solution. Because it is a colligative property, the effect depends only on particle count — 0.5 mol of any non-electrolyte in 1 kg of water raises the boiling point by the same amount.</p>
            <h2 className="text-2xl font-bold mb-3">Common Solvent Constants</h2>
            <p>Water has Kb = 0.512 °C·kg/mol and boils at 100 °C; ethanol Kb = 1.22; benzene Kb = 2.53; chloroform Kb = 3.63; carbon tetrachloride Kb = 5.03. The calculator includes these values so you only need to enter solute amount, solvent mass, and the van't Hoff factor.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/boiling-point-elevation-calculator" />
          <PopularCalculators exclude="/calculator/boiling-point-elevation-calculator" />
        </div>
      </div>
    </>
  );
}
