"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Snowflake } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const SOLVENTS = [
  { id: "water", label: "Water (Kf = 1.86 °C·kg/mol)", kf: 1.86 },
  { id: "benzene", label: "Benzene (Kf = 5.12 °C·kg/mol)", kf: 5.12 },
  { id: "acetic", label: "Acetic acid (Kf = 3.90 °C·kg/mol)", kf: 3.9 },
  { id: "camphor", label: "Camphor (Kf = 37.7 °C·kg/mol)", kf: 37.7 },
  { id: "naphthalene", label: "Naphthalene (Kf = 6.94 °C·kg/mol)", kf: 6.94 },
  { id: "phenol", label: "Phenol (Kf = 7.27 °C·kg/mol)", kf: 7.27 },
  { id: "cyclohexane", label: "Cyclohexane (Kf = 20.2 °C·kg/mol)", kf: 20.2 },
] as const;

interface FreezeResult {
  kf: number;
  i: number;
  molality: number;
  deltaT: number;
  newPoint: number;
  solventFreeze: number;
}

// ΔTf = i · Kf · m
function calcFreeze(solvent: string, soluteGrams: number, molarMass: number, solventKg: number, i: number): FreezeResult {
  const solv = SOLVENTS.find((s) => s.id === solvent) ?? SOLVENTS[0];
  const molality = molarMass > 0 && solventKg > 0 ? soluteGrams / molarMass / solventKg : 0;
  const deltaT = i * solv.kf * molality;
  const solventFreeze = solvent === "water" ? 0 : solvent === "benzene" ? 5.5 : solvent === "acetic" ? 16.6 : solvent === "camphor" ? 179 : solvent === "naphthalene" ? 80.2 : solvent === "phenol" ? 40.9 : 6.6;
  const newPoint = solventFreeze - deltaT;
  return { kf: solv.kf, i, molality, deltaT, newPoint, solventFreeze };
}

const DEFAULTS = { solvent: "water", grams: "58.44", molar: "58.44", kg: "1", i: "2" };

const faqs = [
  { question: "What is freezing point depression?", answer: "Adding a solute lowers the temperature at which a solvent freezes. The effect is colligative: it depends only on the number of dissolved particles, not their identity. Salt melts ice because the brine formed freezes well below 0 °C." },
  { question: "What is the van't Hoff factor (i)?", answer: "It counts how many particles each solute formula unit produces. NaCl gives i = 2 (Na⁺ + Cl⁻), CaCl₂ gives i = 3, and a non-electrolyte like sugar gives i = 1. Real solutions fall slightly short due to ion pairing." },
  { question: "Why is molality used instead of molarity?", answer: "Molality (mol solute per kg solvent) is temperature-independent, while molarity changes volume with temperature. The colligative formulas are defined in molality for that reason." },
];

export default function FreezingPointDepressionCalculator() {
  const [solvent, setSolvent] = useState(DEFAULTS.solvent);
  const [grams, setGrams] = useState(DEFAULTS.grams);
  const [molar, setMolar] = useState(DEFAULTS.molar);
  const [kg, setKg] = useState(DEFAULTS.kg);
  const [i, setI] = useState(DEFAULTS.i);
  const [result, setResult] = useState<FreezeResult>(() => calcFreeze("water", 58.44, 58.44, 1, 2));

  const handleCalculate = () => {
    const g = parseFloat(grams);
    const m = parseFloat(molar);
    const k = parseFloat(kg);
    const v = parseFloat(i);
    if (isNaN(g) || isNaN(m) || isNaN(k) || isNaN(v) || m <= 0 || k <= 0) return;
    setResult(calcFreeze(solvent, g, m, k, v));
  };

  const reset = () => {
    setSolvent(DEFAULTS.solvent); setGrams(DEFAULTS.grams); setMolar(DEFAULTS.molar);
    setKg(DEFAULTS.kg); setI(DEFAULTS.i);
    setResult(calcFreeze("water", 58.44, 58.44, 1, 2));
  };

  const currentMolality = (parseFloat(grams) / (parseFloat(molar) || 1)) / (parseFloat(kg) || 1);
  const chartData = SOLVENTS.map((s) => ({ name: s.label.split(" (")[0], value: Number((result.i * s.kf * (isFinite(currentMolality) ? currentMolality : 0)).toFixed(3)) }));
  const breakdown = [
    { label: "Molality of Solution", value: `${result.molality.toFixed(3)} mol/kg`, highlight: false },
    { label: "Cryoscopic Constant (Kf)", value: `${result.kf.toFixed(2)} °C·kg/mol`, highlight: false },
    { label: "van't Hoff Factor (i)", value: `${result.i}`, highlight: false },
    { label: "Freezing Point Depression (ΔTf)", value: `−${result.deltaT.toFixed(3)} °C`, highlight: true },
    { label: `Pure Solvent Freezes At`, value: `${result.solventFreeze} °C`, highlight: false },
    { label: "New Freezing Point", value: `${result.newPoint.toFixed(3)} °C`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Freezing Point Depression Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Freezing Point Depression Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Snowflake className="w-4 h-4" /> ΔTf = i · Kf · m
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Solvent</label>
                <select value={solvent} onChange={(e) => setSolvent(e.target.value)} className="input-calc">
                  {SOLVENTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Solute Mass (g)</label>
                  <input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} className="input-calc" placeholder="58.44" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Molar Mass (g/mol)</label>
                  <input type="number" value={molar} onChange={(e) => setMolar(e.target.value)} className="input-calc" placeholder="58.44" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Solvent Mass (kg)</label>
                  <input type="number" value={kg} onChange={(e) => setKg(e.target.value)} className="input-calc" placeholder="1" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">van't Hoff Factor (i)</label>
                  <input type="number" value={i} onChange={(e) => setI(e.target.value)} className="input-calc" placeholder="2" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Snowflake className="w-4 h-4 text-primary" /> NEW FREEZING POINT
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.newPoint.toFixed(2)} °C</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                The solution freezes {result.deltaT.toFixed(2)} °C below the pure solvent's {result.solventFreeze} °C.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Depression Across Solvents</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => `${value} °C`} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3 italic">ΔTf = i · Kf · m for each solvent at the current molality.</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Moles of Solute", value: `${(parseFloat(grams) / (parseFloat(molar) || 1)).toFixed(4)} mol` },
                  { label: "Depression Per kg", value: `${(result.i * result.kf * (parseFloat(grams) / (parseFloat(molar) || 1))).toFixed(3)} °C` },
                  { label: "Common Use", value: "De-icing, antifreeze, cryoscopy" },
                  { label: "Rule of Thumb", value: "1 molal NaCl in water → −3.72 °C" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Freezing Point Depression Calculator</h2>
            <p>Freezing point depression is a colligative property: dissolving a solute lowers the freezing point of a solvent in proportion to the number of dissolved particles, regardless of what those particles are. The governing equation is ΔTf = i · Kf · m, where m is molality (moles of solute per kilogram of solvent), Kf is the solvent's cryoscopic constant, and i is the van't Hoff factor counting particles per formula unit.</p>
            <h3>Why it matters</h3>
            <p>It is why salt melts ice on roads (brine freezes near −6 °C), why antifreeze works in car radiators, and why chemists can determine molar masses by measuring the freezing point of a solution. Water's Kf of 1.86 °C·kg/mol means a 1 molal solution of any non-electrolyte freezes at −1.86 °C — and with a dissociating salt like NaCl (i = 2) the depression doubles.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freezing-point-depression-calculator" />
          <PopularCalculators exclude="/calculator/freezing-point-depression-calculator" />
        </div>
      </div>
    </>
  );
}
