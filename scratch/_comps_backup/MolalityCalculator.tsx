"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MolResult {
  molality: number;
  soluteMoles: number;
  kgSolvent: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMol(mode: string, moles: number, grams: number, molarMass: number, kgSolvent: number): MolResult {
  const soluteMoles = mode === "moles" ? moles : grams / molarMass;
  const molality = kgSolvent > 0 ? soluteMoles / kgSolvent : 0;
  const breakdown = [
    { label: "Solute", value: mode === "moles" ? `${fmt(moles)} mol` : `${fmt(grams)} g` },
    ...(mode === "grams" ? [{ label: "Molar Mass of Solute", value: `${fmt(molarMass)} g/mol` }] : []),
    { label: "Solvent Mass", value: `${fmt(kgSolvent)} kg` },
    { label: "Moles of Solute", value: `${fmt(soluteMoles)} mol` },
    { label: "Molality (m)", value: `${fmt(molality)} mol/kg` },
  ];
  const summaryStats = [
    { label: "Molality", value: `${fmt(molality)} m` },
    { label: "Moles of Solute", value: `${fmt(soluteMoles)} mol` },
    { label: "Solvent", value: `${fmt(kgSolvent)} kg` },
    { label: "Definition", value: "moles solute / kg solvent" },
  ];
  const chartData = [
    { name: "Solute (mol)", value: Number(soluteMoles.toFixed(3)), fill: "hsl(var(--primary))" },
    { name: "Solvent (kg)", value: Number(kgSolvent.toFixed(3)), fill: "#f59e0b" },
    { name: "Molality", value: Number(molality.toFixed(3)), fill: "#10b981" },
  ];
  return { molality, soluteMoles, kgSolvent, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mode: "moles", moles: "0.5", grams: "58.44", molarMass: "58.44", kg: "1" };

export default function MolalityCalculator() {
  const [mode, setMode] = useState<string>(DEFAULTS.mode);
  const [moles, setMoles] = useState(DEFAULTS.moles);
  const [grams, setGrams] = useState(DEFAULTS.grams);
  const [molarMass, setMolarMass] = useState(DEFAULTS.molarMass);
  const [kg, setKg] = useState(DEFAULTS.kg);
  const [result, setResult] = useState<MolResult | null>(null);

  const m = parseFloat(moles);
  const g = parseFloat(grams);
  const mm = parseFloat(molarMass);
  const k = parseFloat(kg);
  const errs: string[] = [];
  if (mode === "moles" && (isNaN(m) || m < 0)) errs.push("Moles of solute must be 0 or greater.");
  if (mode === "grams" && (!g || g <= 0)) errs.push("Grams of solute must be greater than 0.");
  if (mode === "grams" && (!mm || mm <= 0)) errs.push("Molar mass must be greater than 0.");
  if (!k || k <= 0) errs.push("Solvent mass must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMol(mode, m, g, mm, k)); };
  const reset = () => {
    setMode(DEFAULTS.mode); setMoles(DEFAULTS.moles); setGrams(DEFAULTS.grams); setMolarMass(DEFAULTS.molarMass); setKg(DEFAULTS.kg);
    setResult(calcMol("moles", 0.5, 58.44, 58.44, 1));
  };
  useEffect(() => { setResult(calcMol("moles", 0.5, 58.44, 58.44, 1)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is molality?", answer: "Molality (m) is the number of moles of solute per kilogram of solvent: m = moles solute ÷ kg solvent. Unlike molarity, it does not change with temperature because it depends on mass, not volume." },
    { question: "How is molality different from molarity?", answer: "Molarity is moles per liter of solution and changes with temperature as the solution expands or contracts. Molality is moles per kilogram of solvent and is temperature-independent — which is why colligative properties like boiling-point elevation use molality." },
    { question: "When is molality preferred?", answer: "In any experiment where temperature varies — freezing-point depression, boiling-point elevation, osmotic pressure — and whenever you weigh rather than pipette, since mass is directly measurable." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Molality Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Molality Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Solute Input</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className={inp}>
                <option value="moles">Enter moles of solute</option>
                <option value="grams">Enter grams + molar mass</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {mode === "moles" ? (
                <div>
                  <label className={lbl}>Moles of Solute</label>
                  <input type="number" value={moles} onChange={e => setMoles(e.target.value)} className={inp} placeholder="0.5" />
                </div>
              ) : (
                <>
                  <div>
                    <label className={lbl}>Solute Mass (g)</label>
                    <input type="number" value={grams} onChange={e => setGrams(e.target.value)} className={inp} placeholder="58.44" />
                  </div>
                  <div>
                    <label className={lbl}>Molar Mass (g/mol)</label>
                    <input type="number" value={molarMass} onChange={e => setMolarMass(e.target.value)} className={inp} placeholder="58.44" />
                  </div>
                </>
              )}
              <div>
                <label className={lbl}>Solvent Mass (kg)</label>
                <input type="number" value={kg} onChange={e => setKg(e.target.value)} className={inp} placeholder="1" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Molality</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.molality)} m</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.soluteMoles)} mol solute per {fmt(result.kgSolvent)} kg solvent</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Molality", `${fmt(result.molality)} m`], ["Solute", `${fmt(result.soluteMoles)} mol`], ["Solvent", `${fmt(result.kgSolvent)} kg`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.breakdown.length - 1 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === result.breakdown.length - 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === result.breakdown.length - 1 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Solute, Solvent, and Concentration</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Molality = moles solute ÷ kg solvent</p>
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
            <h2 className="text-2xl font-bold mb-3">Concentration That Ignores Temperature</h2>
            <p><strong>Molality</strong> measures how concentrated a solution is: moles of solute per kilogram of solvent. Because it is built on mass rather than volume, it stays fixed as the solution warms or cools — the property chemists reach for when temperature matters.</p>
            <h2 className="text-2xl font-bold mb-3">Molality vs Molarity</h2>
            <p>Molarity divides by liters of solution, which expands with heat — so molarity drifts while molality holds steady. Give the calculator moles directly, or grams plus molar mass, and it converts for you. Either path lands on m = moles ÷ kg.</p>
            <h2 className="text-2xl font-bold mb-3">Where Molality Earns Its Keep</h2>
            <p>Colligative properties — freezing-point depression, boiling-point elevation, vapor-pressure lowering — all depend on solute particles per unit mass of solvent, not volume. When you weigh out a solution for such an experiment, molality is the natural unit.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/molality-calculator" />
          <PopularCalculators exclude="/calculator/molality-calculator" />
        </div>
      </div>
    </>
  );
}
