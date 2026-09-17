"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Magnet, Atom, Zap, Printer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ChargeUnit = "coulomb" | "elementary" | "microcoulomb";
type LengthUnit = "metre" | "picometre" | "angstrom" | "nanometre";

interface MoleculePreset {
  key: string;
  label: string;
  bondLengthPm: number;
  observedDebye: number;
}

interface DipoleInputs {
  charge: number;
  chargeUnit: ChargeUnit;
  separation: number;
  lengthUnit: LengthUnit;
  fieldStrength: number;
  angleDegrees: number;
  proMode: boolean;
  observedDebye: number;
  preset: string;
}

interface ChartPoint {
  name: string;
  debye: number;
  isSubject: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface DipoleResult {
  chargeCoulombs: number;
  separationMetres: number;
  momentCm: number;
  momentDebye: number;
  torque: number;
  potentialEnergy: number;
  maxTorque: number;
  alignmentEnergyRange: number;
  ionicCharacterPercent: number;
  bondCharacter: string;
  bondCharacterColor: string;
  effectiveCharge: number;
  chartData: ChartPoint[];
  rows: TableRow[];
}

const ELEMENTARY_CHARGE = 1.602176634e-19;
// 1 debye = 1e-18 statcoulomb-centimetre = 3.33564e-30 C·m
const DEBYE_IN_CM = 3.33564e-30;

const CHARGE_FACTORS: Record<ChargeUnit, number> = {
  coulomb: 1,
  elementary: ELEMENTARY_CHARGE,
  microcoulomb: 1e-6,
};

const LENGTH_FACTORS: Record<LengthUnit, number> = {
  metre: 1,
  picometre: 1e-12,
  angstrom: 1e-10,
  nanometre: 1e-9,
};

const PRESETS: MoleculePreset[] = [
  { key: "custom", label: "Custom (use inputs)", bondLengthPm: 0, observedDebye: 0 },
  { key: "hf", label: "HF — Hydrogen Fluoride", bondLengthPm: 91.7, observedDebye: 1.826 },
  { key: "hcl", label: "HCl — Hydrogen Chloride", bondLengthPm: 127.5, observedDebye: 1.109 },
  { key: "hbr", label: "HBr — Hydrogen Bromide", bondLengthPm: 141.4, observedDebye: 0.827 },
  { key: "hi", label: "HI — Hydrogen Iodide", bondLengthPm: 160.9, observedDebye: 0.448 },
  { key: "co", label: "CO — Carbon Monoxide", bondLengthPm: 112.8, observedDebye: 0.112 },
  { key: "h2o", label: "H₂O — Water (net)", bondLengthPm: 95.8, observedDebye: 1.85 },
  { key: "nh3", label: "NH₃ — Ammonia (net)", bondLengthPm: 101.2, observedDebye: 1.47 },
];

const DEFAULTS: DipoleInputs = {
  charge: 1,
  chargeUnit: "elementary",
  separation: 91.7,
  lengthUnit: "picometre",
  fieldStrength: 1e5,
  angleDegrees: 30,
  proMode: false,
  observedDebye: 1.826,
  preset: "hf",
};

export function calculateDipole(i: DipoleInputs): DipoleResult {
  const chargeCoulombs = Math.max(0, i.charge) * CHARGE_FACTORS[i.chargeUnit];
  const separationMetres = Math.max(0, i.separation) * LENGTH_FACTORS[i.lengthUnit];

  // p = q · d
  const momentCm = chargeCoulombs * separationMetres;
  const momentDebye = momentCm / DEBYE_IN_CM;

  const field = Math.max(0, i.fieldStrength);
  const radians = (i.angleDegrees * Math.PI) / 180;

  // τ = pE sin θ, U = −pE cos θ
  const torque = momentCm * field * Math.sin(radians);
  const potentialEnergy = -momentCm * field * Math.cos(radians);
  const maxTorque = momentCm * field;
  const alignmentEnergyRange = 2 * momentCm * field;

  // Percent ionic character compares the observed moment against the moment a
  // fully ionic bond of the same length would produce.
  const fullyIonicDebye =
    separationMetres > 0 ? (ELEMENTARY_CHARGE * separationMetres) / DEBYE_IN_CM : 0;
  const observed = Math.max(0, i.observedDebye);
  const ionicCharacterPercent = fullyIonicDebye > 0 ? (observed / fullyIonicDebye) * 100 : 0;

  let bondCharacter: string;
  let bondCharacterColor: string;
  if (ionicCharacterPercent >= 50) {
    bondCharacter = "Predominantly ionic";
    bondCharacterColor = "text-red-600";
  } else if (ionicCharacterPercent >= 20) {
    bondCharacter = "Strongly polar covalent";
    bondCharacterColor = "text-amber-600";
  } else if (ionicCharacterPercent >= 5) {
    bondCharacter = "Polar covalent";
    bondCharacterColor = "text-amber-600";
  } else {
    bondCharacter = "Nearly nonpolar covalent";
    bondCharacterColor = "text-emerald-600";
  }

  // Effective partial charge implied by the observed moment, in units of e.
  const effectiveCharge =
    separationMetres > 0 ? (observed * DEBYE_IN_CM) / separationMetres / ELEMENTARY_CHARGE : 0;

  const chartData: ChartPoint[] = [
    { name: "This dipole", debye: momentDebye, isSubject: true },
    ...PRESETS.filter((p) => p.key !== "custom")
      .slice(0, 5)
      .map((p) => ({ name: p.label.split(" —")[0], debye: p.observedDebye, isSubject: false })),
  ];

  const sci = (v: number, digits = 4): string => {
    if (v === 0) return "0";
    const abs = Math.abs(v);
    if (abs >= 1e-3 && abs < 1e6) return v.toPrecision(digits);
    const exponent = Math.floor(Math.log10(abs));
    const mantissa = v / Math.pow(10, exponent);
    return `${mantissa.toFixed(3)} × 10^${exponent}`;
  };

  const rows: TableRow[] = [
    { label: "Charge Magnitude", value: `${sci(chargeCoulombs)} C` },
    { label: "Charge in Elementary Units", value: `${(chargeCoulombs / ELEMENTARY_CHARGE).toPrecision(4)} e` },
    { label: "Separation Distance", value: `${sci(separationMetres)} m (${(separationMetres * 1e12).toPrecision(4)} pm)` },
    { label: "Dipole Moment (SI)", value: `${sci(momentCm)} C·m`, key: true },
    { label: "Dipole Moment (debye)", value: `${momentDebye.toPrecision(5)} D` },
    { label: "Applied Field Strength", value: `${sci(field)} V/m` },
    { label: "Angle to Field", value: `${i.angleDegrees.toFixed(1)}°` },
    { label: "Torque in Field", value: `${sci(torque)} N·m` },
    { label: "Potential Energy", value: `${sci(potentialEnergy)} J` },
    { label: "Maximum Torque (θ = 90°)", value: `${sci(maxTorque)} N·m` },
    { label: "Percent Ionic Character", value: `${ionicCharacterPercent.toFixed(1)}%` },
    { label: "Bond Character", value: bondCharacter },
  ];

  return {
    chargeCoulombs,
    separationMetres,
    momentCm,
    momentDebye,
    torque,
    potentialEnergy,
    maxTorque,
    alignmentEnergyRange,
    ionicCharacterPercent,
    bondCharacter,
    bondCharacterColor,
    effectiveCharge,
    chartData,
    rows,
  };
}
const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

function sciDisplay(v: number, digits = 4): string {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e-3 && abs < 1e6) return v.toPrecision(digits);
  const exponent = Math.floor(Math.log10(abs));
  const mantissa = v / Math.pow(10, exponent);
  return `${mantissa.toFixed(3)} × 10^${exponent}`;
}

export default function ElectricDipoleMomentCalculator() {
  const [inputs, setInputs] = useState<DipoleInputs>(DEFAULTS);
  const [result, setResult] = useState<DipoleResult>(calculateDipole(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateDipole(inputs));
  }, []);

  const calculate = () => setResult(calculateDipole(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateDipole(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof DipoleInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset || preset.key === "custom") {
      setInputs((prev) => ({ ...prev, preset: key }));
      return;
    }
    setInputs((prev) => ({
      ...prev,
      preset: key,
      charge: 1,
      chargeUnit: "elementary",
      separation: preset.bondLengthPm,
      lengthUnit: "picometre",
      observedDebye: preset.observedDebye,
    }));
  };

  const faqs = [
    {
      question: "What is the formula for electric dipole moment?",
      answer:
        "For two equal and opposite point charges, p = q × d, where q is the magnitude of either charge and d is the separation between them. The result is in coulomb-metres. The moment is a vector pointing from the negative charge toward the positive charge in the physics convention, though chemistry textbooks often draw the arrow the opposite way — from positive toward negative — so check which convention a source uses before comparing directions.",
    },
    {
      question: "What is a debye and why do chemists use it?",
      answer:
        "One debye equals 3.33564 × 10⁻³⁰ coulomb-metres. The unit exists because molecular dipole moments in SI units are inconveniently tiny numbers. A full elementary charge separated by one ångström gives about 4.8 debye, which sets a natural scale: most polar molecules fall between 0 and 5 debye, so the unit puts real chemistry in the range of single digits rather than exponents of minus thirty.",
    },
    {
      question: "How do I calculate percent ionic character?",
      answer:
        "Divide the experimentally observed dipole moment by the moment a completely ionic bond of the same length would produce, then multiply by 100. The fully ionic reference is one whole elementary charge separated by the actual bond length. HCl has an observed moment of 1.109 D against a fully ionic value of about 6.12 D at its 127.5 pm bond length, giving roughly 18% ionic character — a polar covalent bond, not an ionic one.",
    },
    {
      question: "What torque does a dipole feel in an electric field?",
      answer:
        "τ = pE sin θ, where θ is the angle between the dipole moment and the field direction. Torque is zero when the dipole is aligned with or against the field and maximum at 90°. The associated potential energy is U = −pE cos θ, minimised at alignment and maximised when antiparallel. The full energy span between those two orientations is 2pE, which is the work required to flip a dipole end over end.",
    },
    {
      question: "Why does water have a dipole moment but carbon dioxide does not?",
      answer:
        "Because dipole moments are vectors and geometry decides whether they cancel. Water is bent at about 104.5°, so the two O-H bond moments add to a net 1.85 D pointing through the oxygen. Carbon dioxide is linear, so its two C=O bond moments are equal, opposite, and exactly cancel, leaving zero net moment despite each individual bond being strongly polar. This is why molecular shape matters as much as bond polarity.",
    },
    {
      question: "Why is carbon monoxide's dipole moment so small?",
      answer:
        "CO is one of the most instructive anomalies in the subject. Oxygen is considerably more electronegative than carbon, so a naive prediction gives a substantial moment with oxygen negative. The observed value is only 0.112 D, and the polarity is reversed — carbon carries the slight negative end. The reason is that the lone pair contribution on carbon opposes and nearly cancels the electronegativity-driven charge shift, which simple electronegativity arguments cannot capture.",
    },
    {
      question: "Can a dipole moment exceed the fully ionic value?",
      answer:
        "Not for a simple two-centre bond, which is why percent ionic character above 100% signals an error in the inputs, usually a mismatched bond length. Values can legitimately approach 100% in strongly ionic gas-phase diatomics such as the alkali halides — CsF sits above 80%. Polyatomic molecules are a different matter, since their net moment sums several bond moments plus lone-pair contributions and is not bounded by any single bond's ionic limit.",
    },
    {
      question: "How does dipole moment relate to boiling point and solubility?",
      answer:
        "Larger moments mean stronger dipole-dipole attractions, which raise boiling points and favour solubility in polar solvents — the practical content of 'like dissolves like'. The relationship is not strictly linear, though, because hydrogen bonding, molecular size, and London dispersion forces all contribute. Water's high boiling point owes more to hydrogen bonding than to its 1.85 D moment alone, and large nonpolar molecules can boil higher than small polar ones purely on dispersion.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator/science" },
          { label: "Electric Dipole Moment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Electric Dipole Moment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="charge" className={lbl}>Charge Magnitude</label>
                <input id="charge" type="number" min="0" step="0.1" className={inp} value={inputs.charge}
                  onChange={(e) => setNum("charge", e.target.value)} />
              </div>
              <div>
                <label htmlFor="chargeUnit" className={lbl}>Charge Unit</label>
                <select id="chargeUnit" className={inp} value={inputs.chargeUnit}
                  onChange={(e) => setInputs((p) => ({ ...p, chargeUnit: e.target.value as ChargeUnit }))}>
                  <option value="elementary">e (elementary)</option>
                  <option value="coulomb">C (coulomb)</option>
                  <option value="microcoulomb">µC</option>
                </select>
              </div>
              <div>
                <label htmlFor="separation" className={lbl}>Separation</label>
                <input id="separation" type="number" min="0" step="0.1" className={inp} value={inputs.separation}
                  onChange={(e) => setNum("separation", e.target.value)} />
              </div>
              <div>
                <label htmlFor="lengthUnit" className={lbl}>Length Unit</label>
                <select id="lengthUnit" className={inp} value={inputs.lengthUnit}
                  onChange={(e) => setInputs((p) => ({ ...p, lengthUnit: e.target.value as LengthUnit }))}>
                  <option value="picometre">pm</option>
                  <option value="angstrom">Å</option>
                  <option value="nanometre">nm</option>
                  <option value="metre">m</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Atom className="h-3.5 w-3.5" /> Molecular Preset
                    </div>
                    <div>
                      <label htmlFor="preset" className={lbl}>Load Known Molecule</label>
                      <select id="preset" className={inp} value={inputs.preset}
                        onChange={(e) => applyPreset(e.target.value)}>
                        {PRESETS.map((p) => (
                          <option key={p.key} value={p.key}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Zap className="h-3.5 w-3.5" /> Applied Electric Field
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="fieldStrength" className={lbl}>Field (V/m)</label>
                        <input id="fieldStrength" type="number" min="0" step="1000" className={inp}
                          value={inputs.fieldStrength} onChange={(e) => setNum("fieldStrength", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="angleDegrees" className={lbl}>Angle to Field (°)</label>
                        <input id="angleDegrees" type="number" min="0" max="180" step="1" className={inp}
                          value={inputs.angleDegrees} onChange={(e) => setNum("angleDegrees", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Magnet className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock bond character and field energetics
                    </label>
                    {inputs.proMode ? (
                      <div>
                        <label htmlFor="observedDebye" className={lbl}>Observed Moment (D)</label>
                        <input id="observedDebye" type="number" min="0" step="0.001" className={inp}
                          value={inputs.observedDebye} onChange={(e) => setNum("observedDebye", e.target.value)} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Dipole Moment</div>
              <div className="text-4xl font-bold text-primary my-1">{result.momentDebye.toPrecision(4)} D</div>
              <div className="text-sm text-muted-foreground">
                {sciDisplay(result.momentCm)} C·m from {(result.chargeCoulombs / ELEMENTARY_CHARGE).toPrecision(3)} e separated by {(result.separationMetres * 1e12).toPrecision(3)} pm
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Debye</div>
                <div className="text-lg font-bold text-emerald-600">{result.momentDebye.toPrecision(4)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Torque</div>
                <div className="text-lg font-bold text-amber-600">{sciDisplay(result.torque, 3)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Ionic Character</div>
                <div className={`text-lg font-bold ${result.bondCharacterColor}`}>{result.ionicCharacterPercent.toFixed(1)}%</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Dipole Moment</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.momentDebye.toPrecision(5)} D</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Comparison With Known Molecules (debye)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RTooltip formatter={(value: number) => `${value.toPrecision(4)} D`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="debye" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isSubject ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Your dipole
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Reference molecule
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Bond Character &amp; Field Energetics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Percent Ionic Character</div>
                    <div className={`text-base font-bold ${result.bondCharacterColor}`}>{result.ionicCharacterPercent.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bond Classification</div>
                    <div className={`text-base font-bold ${result.bondCharacterColor}`}>{result.bondCharacter}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Partial Charge</div>
                    <div className="text-base font-bold text-foreground">{result.effectiveCharge.toPrecision(3)} e</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Potential Energy</div>
                    <div className="text-base font-bold text-foreground">{sciDisplay(result.potentialEnergy, 3)} J</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Maximum Torque (θ = 90°)</div>
                    <div className="text-base font-bold text-foreground">{sciDisplay(result.maxTorque, 3)} N·m</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Energy to Flip (2pE)</div>
                    <div className="text-base font-bold text-amber-600">{sciDisplay(result.alignmentEnergyRange, 3)} J</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Charge Times Distance, and Why the Unit Matters</h2>
            <p className="mb-4">
              The electric dipole moment of a pair of equal and opposite charges is simply p = q × d. The arithmetic is
              trivial; the interpretation is where the substance lies. In SI units the answer for a real molecular bond
              lands around 10⁻³⁰ coulomb-metres, which is why chemistry adopted the debye — 3.33564 × 10⁻³⁰ C·m — so that
              ordinary polar molecules occupy the range of single digits. A full elementary charge separated by one
              ångström works out to roughly 4.8 D, and that figure is the mental yardstick worth memorising, because it
              turns percent ionic character into a quick division.
            </p>

            <h2 className="text-2xl font-bold mb-3">Percent Ionic Character Without Electronegativity Tables</h2>
            <p className="mb-4">
              Comparing an observed dipole moment against the moment a fully ionic bond of the same length would produce
              gives a direct, experimentally grounded measure of bond polarity. HCl illustrates it well: an observed 1.109 D
              against a fully ionic 6.12 D at its 127.5 pm bond length yields about 18% ionic character. That number
              settles the question of whether HCl is an ionic compound more convincingly than any electronegativity
              difference argument, because it comes from a measurement rather than a tabulated scale. Values above 100%
              are impossible for a two-centre bond and signal a mismatched bond length in the inputs.
            </p>

            <h2 className="text-2xl font-bold mb-3">Where Simple Predictions Break Down</h2>
            <p className="mb-4">
              Two classic cases are worth knowing. Carbon dioxide has strongly polar C=O bonds and zero net moment,
              because the molecule is linear and the two bond vectors cancel exactly — geometry overrides bond polarity.
              Carbon monoxide is stranger still: electronegativity predicts a substantial moment with oxygen negative, but
              the observed value is a mere 0.112 D with the polarity reversed, carbon carrying the slightly negative end.
              The lone pair contribution on carbon opposes the electronegativity-driven charge shift and nearly cancels it,
              which no simple electronegativity argument can reproduce.
            </p>

            <h2 className="text-2xl font-bold mb-3">Dipoles in an Applied Field</h2>
            <p>
              Place a dipole in a uniform electric field and it experiences a torque τ = pE sin θ that rotates it toward
              alignment, with associated potential energy U = −pE cos θ. Torque vanishes at 0° and 180° and peaks at 90°;
              energy is minimised at alignment and maximised antiparallel, so the work to flip a dipole end over end is
              2pE. This is the mechanism behind dielectric polarisation, the response of polar liquids to applied fields,
              and the orientational contribution to permittivity. Professional Mode reports torque, potential energy,
              maximum torque, and the full flip energy for whatever field strength and orientation you enter.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/electric-dipole-moment-calculator" />
          <PopularCalculators exclude="/calculator/electric-dipole-moment-calculator" />
        </div>
      </div>
    </>
  );
}
