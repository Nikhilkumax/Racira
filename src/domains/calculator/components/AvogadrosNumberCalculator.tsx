"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AVOGADRO = 6.02214076e23; // mol⁻¹ — exact by SI definition since 2019
const R_GAS = 0.082057; // L·atm/(mol·K)
const STP_T = 273.15; // K (0 °C)
const STP_P = 1; // atm
const SATP_T = 298.15; // K (25 °C)
const SATP_P = 1; // bar
const MOLAR_VOLUME_STP = 22.414; // L/mol
const MOLAR_VOLUME_SATP = 24.465; // L/mol (25°C, 1 bar)

type UnitMode = "molesToParticles" | "massToMoles" | "molesToVolume";

type Inputs = {
  moles: string;
  unit: UnitMode;
  molarMass: string;
  temperature: string;
  pressure: string;
};

type Result = {
  particles: number;
  moles: number;
  mass: number;
  molarVolume: number;
  gasVolume: number;
  avogadro: number;
  unit: UnitMode;
  conditionsLabel: string;
  barData: { name: string; value: number; display: string; color: string }[];
  summary: { label: string; value: string }[];
};

const DEFAULTS: Inputs = {
  moles: "2",
  unit: "molesToParticles",
  molarMass: "18.015",
  temperature: "0",
  pressure: "1",
};

const UNITS: { v: UnitMode; l: string }[] = [
  { v: "molesToParticles", l: "Moles → Particles" },
  { v: "massToMoles", l: "Mass → Moles" },
  { v: "molesToVolume", l: "Moles → Gas Volume" },
];

const fmt = (n: number, d = 4) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const fmtSci = (n: number, d = 4) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d, notation: "scientific" });

const safeNum = (s: string): number => {
  if (s === "" || s === null || s === undefined) return NaN;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};

function calculate(i: Inputs): Result {
  const moles = safeNum(i.moles);
  const molarMass = safeNum(i.molarMass);
  const temperature = safeNum(i.temperature);
  const pressure = safeNum(i.pressure);

  // Defensive: never crash, never NaN in outputs.
  const safeMoles = Number.isNaN(moles) || moles < 0 ? 0 : moles;
  const safeMM = Number.isNaN(molarMass) || molarMass <= 0 ? NaN : molarMass;
  const Tc = Number.isNaN(temperature) ? STP_T : temperature;
  const P = Number.isNaN(pressure) || pressure <= 0 ? STP_P : pressure;

  const T_K = Tc + 273.15;
  const particles = safeMoles * AVOGADRO;
  const mass = Number.isNaN(safeMM) ? NaN : safeMoles * safeMM;

  // Ideal gas molar volume under the user's stated conditions (P in atm).
  const Vm = (R_GAS * T_K) / P;
  const gasVolume = safeMoles * Vm;

  const conditionsLabel = `${fmt(Tc, 1)} °C, ${fmt(P, 2)} atm`;

  const barData = [
    {
      name: "1 mol",
      value: AVOGADRO,
      display: fmtSci(AVOGADRO),
      color: "hsl(var(--primary))",
    },
    {
      name: "Your moles",
      value: particles,
      display: fmtSci(particles),
      color: "#10b981",
    },
  ];

  const summary: { label: string; value: string }[] = [
    { label: "Avogadro's Number", value: `${fmtSci(AVOGADRO)} /mol` },
    { label: "Moles entered", value: fmt(safeMoles, 4) },
    { label: "Particles", value: fmtSci(particles) },
  ];
  if (!Number.isNaN(mass)) summary.push({ label: "Mass", value: `${fmt(mass, 4)} g` });
  summary.push({ label: "Molar Volume", value: `${fmt(Vm, 3)} L/mol` });
  summary.push({ label: "Gas Volume", value: `${fmt(gasVolume, 4)} L` });

  return {
    particles,
    moles: safeMoles,
    mass,
    molarVolume: Vm,
    gasVolume,
    avogadro: AVOGADRO,
    unit: i.unit,
    conditionsLabel,
    barData,
    summary,
  };
}

const AvogadrosNumberCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const handleCalculate = () => setResult(calculate(inputs));

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const setField = <K extends keyof Inputs>(k: K, v: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [k]: v }));

  const unitLabel =
    result.unit === "massToMoles"
      ? "Mass = Moles × Molar Mass"
      : result.unit === "molesToVolume"
      ? "Volume = Moles × Molar Volume"
      : "Particles = Moles × 6.022 × 10²³";

  const faqs = [
    {
      question: "What is Avogadro's Number?",
      answer:
        "Avogadro's number is exactly 6.02214076 × 10²³ particles per mole, a fixed constant by SI definition since 2019. It links the countable macroscopic unit of the mole to the uncountable microscopic world of atoms and molecules.",
    },
    {
      question: "How do I convert moles to particles?",
      answer:
        "Multiply the number of moles by Avogadro's number. 2 moles × 6.022×10²³ = 1.2044×10²⁴ particles. This is the core conversion in chemistry, stoichiometry, and molecular counting.",
    },
    {
      question: "What is molar volume at STP and SATP?",
      answer:
        "At STP (0 °C, 1 atm) one mole of ideal gas occupies 22.414 L. At SATP (25 °C, 1 bar) it occupies 24.465 L. These values follow from the ideal gas law Vm = RT/P.",
    },
    {
      question: "How does temperature and pressure affect gas volume?",
      answer:
        "Molar volume scales directly with absolute temperature and inversely with pressure (Vm = RT/P). Raising the temperature expands the gas; raising the pressure compresses it. This calculator applies your entered conditions automatically.",
    },
    {
      question: "Where is Avogadro's number used?",
      answer:
        "It underpins molar mass, stoichiometry, solution concentration, and gas laws. Any time you relate grams on a balance to the number of atoms reacting, Avogadro's number is the bridge.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Avogadros Number Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Avogadros Number Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          {/* LEFT — inputs */}
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              Core relation:{" "}
              <code className="font-mono font-semibold">
                Particles = Moles × 6.022 × 10²³
              </code>
            </div>

            {/* Row 1: Moles | Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-base font-medium block mb-1.5">Moles</label>
                 <input
                  type="number"
                  value={inputs.moles}
                  onChange={(e) => setField("moles", e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. 2"
                  step="any"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Unit</label>
                <select
                  value={inputs.unit}
                  onChange={(e) => setField("unit", e.target.value as UnitMode)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                  className="h-10 w-full px-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u.v} value={u.v}>
                      {u.l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Options */}
            <details className="group rounded-lg border border-border bg-muted/20">
              <summary className="cursor-pointer select-none px-4 py-3 text-base font-semibold flex items-center justify-between">
                <span>Advanced Options</span>
                <span className="text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-4 pb-4 flex flex-col gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Substance Properties</div>
                  <label className="text-sm text-muted-foreground block mb-1">
                    Molar Mass (for mass conversions)
                  </label>
                  <div className="flex gap-2">
                     <input
                      type="number"
                      value={inputs.molarMass}
                      onChange={(e) => setField("molarMass", e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                      className="h-10 flex-1 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                      placeholder="e.g. 18.015"
                      step="any"
                    />
                    <span className="h-10 flex items-center px-2 rounded-md border border-input bg-background text-sm text-muted-foreground">
                      g/mol
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Gas Conditions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">
                        Temperature (STP = 0 °C)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={inputs.temperature}
                          onChange={(e) => setField("temperature", e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                          className="h-10 flex-1 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                          placeholder="0"
                          step="any"
                        />
                        <span className="h-10 flex items-center px-2 rounded-md border border-input bg-background text-sm text-muted-foreground">
                          °C
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">
                        Pressure (affects molar volume)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={inputs.pressure}
                          onChange={(e) => setField("pressure", e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                          className="h-10 flex-1 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                          placeholder="1"
                          step="any"
                        />
                        <span className="h-10 flex items-center px-2 rounded-md border border-input bg-background text-sm text-muted-foreground">
                          atm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={reset}
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — results */}
          <div className="space-y-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Number of Particles
              </div>
              <div className="text-4xl font-bold text-primary break-words">
                {fmtSci(result.particles)} particles
              </div>
              <div className="text-sm text-muted-foreground mt-1">{result.moles} mol × 6.022×10²³</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-calculator !p-4 border border-border bg-card text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Moles</div>
                <div className="text-xl font-bold text-foreground">{fmt(result.moles, 4)}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avogadro</div>
                <div className="text-xl font-bold text-foreground">{fmtSci(result.avogadro)}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mass</div>
                <div className="text-xl font-bold text-foreground">
                  {Number.isNaN(result.mass) ? "—" : `${fmt(result.mass, 4)} g`}
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-semibold mb-3">Breakdown</h3>
              <table className="w-full text-base">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 text-muted-foreground">Mode</td>
                    <td className="text-right font-medium">{unitLabel}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-muted-foreground">Moles</td>
                    <td className="text-right font-medium">{fmt(result.moles, 4)} mol</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-muted-foreground">Particles</td>
                    <td className="text-right font-medium font-mono">{fmtSci(result.particles)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-muted-foreground">Mass (Moles × Molar Mass)</td>
                    <td className="text-right font-medium">
                      {Number.isNaN(result.mass) ? "—" : `${fmt(result.mass, 4)} g`}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-muted-foreground">Molar Volume (RT/P)</td>
                    <td className="text-right font-medium">{fmt(result.molarVolume, 3)} L/mol</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Gas Volume</td>
                    <td className="text-right font-bold">
                      {fmt(result.gasVolume, 4)} L ({result.conditionsLabel})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recharts BarChart */}
            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-semibold mb-3">Scale of Particles</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.barData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => fmtSci(v, 1)} />
                  <Tooltip formatter={(v: any, n: any) => [result.barData.find((d) => d.name === n)?.display, "Particles"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.barData.map((d, idx) => (
                      <Cell key={idx} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="text-base font-semibold mb-4">Summary Statistics</h3>
              <div className="space-y-3">
                {result.summary.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-base">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Avogadro's Number and the Mole</h2>
            <p>Avogadro's number is exactly 6.02214076 × 10²³ particles per mole, a fixed SI constant since 2019 that bridges the countable macroscopic mole to the uncountable microscopic world of atoms and molecules. Multiplying any amount of substance in moles by this constant yields the exact number of elementary entities—atoms, molecules, ions, or electrons—present. For example, two moles of water contain 1.2044 × 10²⁴ molecules, while one mole of carbon atoms contains exactly 6.022 × 10²³ atoms. Because the constant is defined, not measured, every conversion is exact, making the mole the universal counting unit for chemistry. This calculator performs the conversion instantly, eliminating the manual multiplication of awkward scientific-notation values and removing the risk of exponent errors that plague hand calculation.</p>

            <p>Knowing the particle count matters far beyond a single arithmetic step. In stoichiometry, balanced chemical equations count in moles, so translating to particle counts reveals how many actual collisions occur during a reaction. In molecular weight work, the mole connects a substance's molar mass on the periodic table to the number of molecules in a weighed sample. Molar volume then extends the idea to gases: at standard temperature and pressure (0 °C, 1 atm) one mole occupies 22.414 L, while at SATP (25 °C, 1 bar) it occupies 24.465 L. Our tool folds all of these relationships—moles to particles, mass to moles via molar mass, and moles to gas volume via the ideal gas law—into a single interface, so you can move between counting, weighing, and measuring volume without switching calculators.</p>

            <h2 className="text-2xl font-bold mb-3">How to Use the Avogadros Number Calculator</h2>
            <p>Enter the number of moles in the Moles field and pick a Unit mode: Moles to Particles for the core conversion, Mass to Moles to see how many grams your sample weighs using the molar mass, or Moles to Gas Volume to compute the volume the gas occupies. Open Advanced Options to set the molar mass for mass conversions (water defaults to 18.015 g/mol) and to override the gas conditions—temperature in °C and pressure in atm—which adjust the molar volume through Vm = RT/P. Defaults are staged at exactly STP so the result matches textbook reference values. Click Calculate to refresh the result, or Reset to restore the STP defaults. All outputs update instantly on page load, and the result panel shows the primary particle count, a three-stat bar for moles, Avogadro's constant, and mass, a full breakdown table, a bar chart contrasting one mole against your sample, and a summary of every derived quantity including gas volume under your stated conditions.</p>

            <p>The advanced temperature and pressure inputs feed directly into the ideal gas law, so changing conditions recomputes molar volume and gas volume without approximation beyond the ideal-gas assumption. Raising the temperature expands the gas, while raising the pressure compresses it, exactly as Vm = RT/P predicts. This makes the calculator useful for comparing STP and SATP predictions, checking lab gas-collection volumes, or sanity-checking stoichiometric yields before a synthesis. Whether you are a student verifying homework, a technician preparing a gas mixture, or a researcher converting between count, mass, and volume, the Avogadros Number Calculator delivers exact, instant, and clearly explained results.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/avogadros-number-calculator" />
          <PopularCalculators exclude="/calculator/avogadros-number-calculator" />
        </div>
      </div>
    </>
  );
};

export default AvogadrosNumberCalculator;
