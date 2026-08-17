"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, FlaskConical } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
interface ConcentrationInputs {
  mass: string;
  molarMass: string;
  volume: string;
}

interface ConcentrationResult {
  mass: number;
  molarMass: number;
  volume: number;
  moles: number;
  molarity: number;
  gramsPerLiter: number;
  milliMolar: number;
  chartData: { volume: number; concentration: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation: M = (mass / molar mass) / volume ─────────────────
function calculateConcentration(inputs: ConcentrationInputs): ConcentrationResult {
  const empty: ConcentrationResult = {
    mass: 0, molarMass: 0, volume: 0, moles: 0, molarity: 0,
    gramsPerLiter: 0, milliMolar: 0, chartData: [], isError: true,
  };
  const mass = parseFloat(inputs.mass);
  const mm = parseFloat(inputs.molarMass);
  const vol = parseFloat(inputs.volume);
  if (isNaN(mass) || isNaN(mm) || isNaN(vol)) {
    return { ...empty, errorMsg: "Please enter valid numbers for mass, molar mass, and volume." };
  }
  if (mass <= 0 || mm <= 0 || vol <= 0) {
    return { ...empty, errorMsg: "Mass, molar mass, and volume must all be greater than zero." };
  }

  const moles = mass / mm;
  const molarity = moles / vol;
  const gramsPerLiter = mass / vol;

  // Concentration vs volume curve for the fixed amount of solute
  const chartData: { volume: number; concentration: number }[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const v = (vol * (0.25 + (3 - 0.25) * (i / steps)));
    chartData.push({ volume: +v.toFixed(3), concentration: +(moles / v).toFixed(3) });
  }

  return {
    mass, molarMass, volume: vol, moles, molarity, gramsPerLiter,
    milliMolar: molarity * 1000,
    chartData, isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: ConcentrationInputs = { mass: "58.44", molarMass: "58.44", volume: "1.0" };

const fmt = (n: number, d = 3) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const CompactInput = ({
  id, label, value, onChange, suffix,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
      />
      <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const ConcentrationCalculator = () => {
  const [inputs, setInputs] = useState<ConcentrationInputs>(DEFAULTS);
  const [result, setResult] = useState<ConcentrationResult>(() => calculateConcentration(DEFAULTS));

  useEffect(() => {
    setResult(calculateConcentration(DEFAULTS));
  }, []);

  const handleChange = (key: keyof ConcentrationInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));
  const handleCalculate = () => setResult(calculateConcentration(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateConcentration(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "What is molar concentration?", answer: "Molar concentration (molarity, M) is the amount of solute in moles divided by the volume of solution in liters: M = mol/L. A 1 M solution contains one mole of solute per liter. It is the standard way chemists describe how concentrated a solution is." },
    { question: "How do I find moles from mass?", answer: "Divide the mass of the solute by its molar mass: moles = mass (g) ÷ molar mass (g/mol). Molar mass is the mass of one mole of a substance, found by summing the atomic masses of its elements — 58.44 g/mol for NaCl, 18.02 g/mol for water, 98.08 g/mol for sulfuric acid." },
    { question: "What is the default example?", answer: "Dissolving 58.44 g of sodium chloride (molar mass 58.44 g/mol) in 1.0 L of water gives exactly 1.000 mol of NaCl and a 1.000 M solution — a convenient reference point. You can swap in any solute by entering its mass and molar mass." },
    { question: "How does dilution change concentration?", answer: "Dilution adds solvent without changing the amount of solute, so C₁V₁ = C₂V₂ applies: the new concentration equals the old concentration times the old volume divided by the new volume. Doubling the volume halves the molarity." },
    { question: "What units can I use?", answer: "Mass in grams, molar mass in g/mol, and volume in liters. The calculator reports moles, molarity in mol/L, concentration in g/L, and millimolar (mM = M × 1000). Convert volume to liters first if you measured in mL." },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Concentration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Concentration Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="solute-mass" label="Solute Mass" value={inputs.mass} onChange={(v) => handleChange("mass", v)} suffix="g" />
              <CompactInput id="molar-mass" label="Molar Mass" value={inputs.molarMass} onChange={(v) => handleChange("molarMass", v)} suffix="g/mol" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="volume" label="Solution Volume" value={inputs.volume} onChange={(v) => handleChange("volume", v)} suffix="L" />
              <div className="flex flex-col justify-end">
                <div className="h-10 flex items-center rounded-md border border-border bg-secondary/20 px-3 text-sm text-muted-foreground">
                  <FlaskConical className="h-4 w-4 mr-2 text-primary" /> M = mol / L
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-1">Common molar masses: NaCl 58.44 · NaOH 40.00 · HCl 36.46 · H₂SO₄ 98.08</p>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 print-section">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Molar Concentration</div>
                  <div className="text-4xl font-bold text-primary">
                    {fmt(result.molarity)} <span className="text-xl">mol/L (M)</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {fmt(result.moles)} mol of solute in {fmt(result.volume)} L · {fmt(result.gramsPerLiter)} g/L
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Moles of Solute", value: `${fmt(result.moles)} mol`, color: "text-primary" },
                    { label: "Mass / Volume", value: `${fmt(result.gramsPerLiter)} g/L`, color: "text-foreground" },
                    { label: "Millimolar", value: `${fmt(result.milliMolar, 1)} mM`, color: "text-emerald-600" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Solution Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Solute Mass", value: `${fmt(result.mass)} g` },
                        { label: "Molar Mass", value: `${fmt(result.molarMass)} g/mol` },
                        { label: "Solution Volume", value: `${fmt(result.volume)} L` },
                        { label: "Moles of Solute", value: `${fmt(result.moles)} mol` },
                        { label: "Molar Concentration", value: `${fmt(result.molarity)} M`, highlight: true },
                        { label: "Concentration (g/L)", value: `${fmt(result.gramsPerLiter)} g/L` },
                        { label: "Millimolar (mM)", value: `${fmt(result.milliMolar, 1)} mM` },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b last:border-0 ${r.highlight ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 text-right font-semibold">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Concentration vs Volume (Fixed Solute)</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="volume" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Volume (L)", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number, name: string) => [name === "concentration" ? `${fmt(value as number)} M` : String(value), name === "concentration" ? "Concentration" : ""]}
                          labelFormatter={(l) => `Volume: ${l} L`}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <ReferenceDot x={result.volume} y={result.molarity} r={5} fill="hsl(var(--primary))" stroke="#fff" />
                        <Area type="monotone" dataKey="concentration" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">Diluting the same solute lowers concentration along this curve; the dot marks your solution.</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Solute Mass", value: `${fmt(result.mass)} g` },
                      { label: "Molar Mass", value: `${fmt(result.molarMass)} g/mol` },
                      { label: "Volume", value: `${fmt(result.volume)} L` },
                      { label: "Moles", value: `${fmt(result.moles)} mol` },
                      { label: "Molarity", value: `${fmt(result.molarity)} M` },
                      { label: "g/L", value: `${fmt(result.gramsPerLiter)} g/L` },
                      { label: "mM", value: `${fmt(result.milliMolar, 1)} mM` },
                      { label: "Formula", value: "M = (m / MM) / V" },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Molar Concentration?</h2>
            <p>Molar concentration — or molarity (M) — expresses how much solute is dissolved in a given volume of solution: <strong>M = moles of solute ÷ liters of solution</strong>. It is the chemist's standard measure of concentration because moles, unlike mass, relate directly to the number of particles participating in a reaction. A 1 M solution contains one mole of solute per liter.</p>

            <h2 className="text-2xl font-bold mb-3">How This Calculator Works</h2>
            <p>Enter the mass of your solute, its molar mass, and the final volume of the solution. The calculator first converts mass to moles — <strong>moles = mass ÷ molar mass</strong> — then divides by volume to get molarity. It also reports grams per liter and millimolar for convenience, and plots how concentration falls as the solution is diluted.</p>
            <p>The default example dissolves 58.44 g of NaCl (molar mass 58.44 g/mol) in 1.0 L of water. That is exactly one mole of salt, so the result is precisely 1.000 M — a clean anchor for understanding the units before you enter your own values.</p>

            <h2 className="text-2xl font-bold mb-3">Using Molarity in the Lab</h2>
            <p>To prepare a solution of a target molarity, weigh out the mass = M × molar mass × volume, dissolve it in less solvent than the final volume, and then top up to the mark. Remember that volume is the total solution volume, not the solvent added. For dilutions, the amount of solute is conserved, so C₁V₁ = C₂V₂ holds exactly.</p>

            <h2 className="text-2xl font-bold mb-3">Common Applications</h2>
            <p>Molarity drives stoichiometry — reaction quantities are measured in moles, and molarity converts volume to moles. Biologists prepare buffers and media at specific millimolar concentrations, pharmacists formulate doses, and environmental labs report pollutant levels in molar terms. Getting the concentration right is the difference between a working reaction and a wasted batch.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/concentration-calculator" />
          <PopularCalculators exclude="/calculator/concentration-calculator" />
        </div>
      </div>
    </>
  );
};

export default ConcentrationCalculator;
