"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Zap, Layers, Waves } from "lucide-react";
import { BarChart as RBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

/* ============================================================
   Dielectric Constant Calculator
   Derives relative permittivity from measured capacitance and
   geometry, or looks it up from a material library. Supports
   parallel-plate, coaxial and spherical geometries plus complex
   permittivity (loss tangent and Debye relaxation).
   ============================================================ */

/* Vacuum permittivity, F/m (CODATA) */
const EPSILON_0 = 8.8541878128e-12;

interface MaterialSpec {
  key: string;
  label: string;
  er: number;
  lossTangent: number;
  strengthKvMm: number;
  note: string;
}

const MATERIALS: MaterialSpec[] = [
  { key: "vacuum", label: "Vacuum", er: 1.0, lossTangent: 0, strengthKvMm: Infinity, note: "Reference value by definition" },
  { key: "air", label: "Air (dry, 1 atm)", er: 1.00059, lossTangent: 0, strengthKvMm: 3, note: "Effectively unity for most work" },
  { key: "ptfe", label: "PTFE (Teflon)", er: 2.1, lossTangent: 0.0002, strengthKvMm: 60, note: "Very low loss, RF substrate staple" },
  { key: "polyethylene", label: "Polyethylene", er: 2.25, lossTangent: 0.0003, strengthKvMm: 20, note: "Coax cable insulation" },
  { key: "polystyrene", label: "Polystyrene", er: 2.6, lossTangent: 0.0002, strengthKvMm: 20, note: "Stable precision capacitors" },
  { key: "nylon", label: "Nylon", er: 3.4, lossTangent: 0.02, strengthKvMm: 16, note: "Absorbs moisture, er drifts" },
  { key: "fr4", label: "FR-4 Epoxy Laminate", er: 4.4, lossTangent: 0.02, strengthKvMm: 20, note: "Standard PCB substrate" },
  { key: "glass", label: "Glass (borosilicate)", er: 4.6, lossTangent: 0.005, strengthKvMm: 14, note: "Varies widely by composition" },
  { key: "mica", label: "Mica", er: 5.4, lossTangent: 0.0002, strengthKvMm: 118, note: "Exceptional stability and strength" },
  { key: "rubber", label: "Neoprene Rubber", er: 6.7, lossTangent: 0.03, strengthKvMm: 12, note: "Flexible, lossy at RF" },
  { key: "alumina", label: "Alumina (96% Al2O3)", er: 9.8, lossTangent: 0.0001, strengthKvMm: 13.4, note: "Microwave ceramic substrate" },
  { key: "silicon", label: "Silicon", er: 11.7, lossTangent: 0.005, strengthKvMm: 30, note: "Semiconductor bulk permittivity" },
  { key: "glycerin", label: "Glycerin", er: 42.5, lossTangent: 0.5, strengthKvMm: 15, note: "Polar liquid, strong dispersion" },
  { key: "water", label: "Water (20 °C)", er: 80.1, lossTangent: 0.04, strengthKvMm: 65, note: "Highly polar, falls to 1.8 at optical frequencies" },
  { key: "batio3", label: "Barium Titanate", er: 1200, lossTangent: 0.01, strengthKvMm: 4, note: "Ferroelectric, strongly nonlinear" },
  { key: "custom", label: "Custom / Measured", er: 0, lossTangent: 0, strengthKvMm: 0, note: "Derived from your capacitance measurement" },
];

type Geometry = "parallel" | "coax" | "spherical";

type Mode = "fromCapacitance" | "fromMaterial";

interface DielectricInputs {
  mode: Mode;
  material: string;
  capacitancePf: string;
  areaCm2: string;
  separationMm: string;
  geometry: Geometry;
  innerRadiusMm: string;
  outerRadiusMm: string;
  lengthMm: string;
  lossTangent: string;
  voltageV: string;
  proMode: boolean;
  frequencyGhz: string;
  epsInfinity: string;
  relaxationPs: string;
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface DielectricResult {
  valid: boolean;
  error: string;
  epsilonR: number;
  epsilonAbs: number;
  capacitancePf: number;
  vacuumCapacitancePf: number;
  geometryFactor: number;
  susceptibility: number;
  lossTangent: number;
  epsImag: number;
  energyDensity: number;
  fieldKvMm: number;
  breakdownMarginPct: number;
  storedEnergyUj: number;
  refractiveIndex: number;
  /* Professional — Debye */
  debyeReal: number;
  debyeImag: number;
  debyeTanD: number;
  rows: BreakdownRow[];
  chartData: { name: string; er: number; fill: string }[];
  materialNote: string;
}

const DEFAULTS: DielectricInputs = {
  mode: "fromCapacitance",
  material: "fr4",
  capacitancePf: "390",
  areaCm2: "100",
  separationMm: "1",
  geometry: "parallel",
  innerRadiusMm: "0.5",
  outerRadiusMm: "1.75",
  lengthMm: "1000",
  lossTangent: "0.02",
  voltageV: "50",
  proMode: false,
  frequencyGhz: "2.4",
  epsInfinity: "3.0",
  relaxationPs: "8.3",
};

/* Geometric capacitance factor G such that C = eps0 * er * G  (G in metres) */
const geometryFactor = (inputs: DielectricInputs): { g: number; error: string } => {
  if (inputs.geometry === "parallel") {
    const areaM2 = (parseFloat(inputs.areaCm2) || 0) * 1e-4;
    const dM = (parseFloat(inputs.separationMm) || 0) * 1e-3;
    if (areaM2 <= 0 || dM <= 0) return { g: 0, error: "Plate area and separation must both be greater than zero." };
    return { g: areaM2 / dM, error: "" };
  }
  if (inputs.geometry === "coax") {
    const a = (parseFloat(inputs.innerRadiusMm) || 0) * 1e-3;
    const b = (parseFloat(inputs.outerRadiusMm) || 0) * 1e-3;
    const L = (parseFloat(inputs.lengthMm) || 0) * 1e-3;
    if (a <= 0 || b <= a) return { g: 0, error: "Outer radius must be larger than the inner radius." };
    if (L <= 0) return { g: 0, error: "Cable length must be greater than zero." };
    return { g: (2 * Math.PI * L) / Math.log(b / a), error: "" };
  }
  const a = (parseFloat(inputs.innerRadiusMm) || 0) * 1e-3;
  const b = (parseFloat(inputs.outerRadiusMm) || 0) * 1e-3;
  if (a <= 0 || b <= a) return { g: 0, error: "Outer radius must be larger than the inner radius." };
  return { g: (4 * Math.PI * a * b) / (b - a), error: "" };
};

const calculateDielectric = (inputs: DielectricInputs): DielectricResult => {
  const spec = MATERIALS.find((m) => m.key === inputs.material) ?? MATERIALS[0];

  const empty: DielectricResult = {
    valid: false,
    error: "",
    epsilonR: 0,
    epsilonAbs: 0,
    capacitancePf: 0,
    vacuumCapacitancePf: 0,
    geometryFactor: 0,
    susceptibility: 0,
    lossTangent: 0,
    epsImag: 0,
    energyDensity: 0,
    fieldKvMm: 0,
    breakdownMarginPct: 0,
    storedEnergyUj: 0,
    refractiveIndex: 0,
    debyeReal: 0,
    debyeImag: 0,
    debyeTanD: 0,
    rows: [],
    chartData: [],
    materialNote: spec.note,
  };

  const { g, error } = geometryFactor(inputs);
  if (error) return { ...empty, error };

  /* Vacuum capacitance of the same geometry */
  const c0F = EPSILON_0 * g;

  let epsilonR: number;
  let capacitanceF: number;

  if (inputs.mode === "fromCapacitance") {
    capacitanceF = (parseFloat(inputs.capacitancePf) || 0) * 1e-12;
    if (capacitanceF <= 0) return { ...empty, error: "Measured capacitance must be greater than zero." };
    epsilonR = capacitanceF / c0F;
  } else {
    epsilonR = inputs.material === "custom" ? 1 : spec.er;
    capacitanceF = c0F * epsilonR;
  }

  if (!isFinite(epsilonR) || epsilonR <= 0) {
    return { ...empty, error: "The inputs produced a non-physical permittivity. Check the geometry values." };
  }

  const epsilonAbs = epsilonR * EPSILON_0;
  const susceptibility = epsilonR - 1;
  const tanD = Math.max(0, parseFloat(inputs.lossTangent) || 0);
  const epsImag = epsilonR * tanD;
  const refractiveIndex = Math.sqrt(epsilonR);

  /* Field strength and energy at the applied voltage */
  const voltage = Math.max(0, parseFloat(inputs.voltageV) || 0);
  const dM = (parseFloat(inputs.separationMm) || 0) * 1e-3;
  const fieldVm = inputs.geometry === "parallel" && dM > 0 ? voltage / dM : 0;
  const fieldKvMm = fieldVm / 1e6;
  const energyDensity = 0.5 * epsilonAbs * fieldVm * fieldVm;
  const storedEnergyUj = 0.5 * capacitanceF * voltage * voltage * 1e6;
  const strength = inputs.material === "custom" ? 0 : spec.strengthKvMm;
  const breakdownMarginPct = strength > 0 && isFinite(strength) && fieldKvMm > 0 ? (1 - fieldKvMm / strength) * 100 : 100;

  /* Professional — single-pole Debye relaxation */
  const epsInf = Math.max(1, parseFloat(inputs.epsInfinity) || 1);
  const tau = Math.max(0, parseFloat(inputs.relaxationPs) || 0) * 1e-12;
  const omega = 2 * Math.PI * (Math.max(0, parseFloat(inputs.frequencyGhz) || 0) * 1e9);
  const wt = omega * tau;
  const denom = 1 + wt * wt;
  const debyeReal = epsInf + (epsilonR - epsInf) / denom;
  const debyeImag = ((epsilonR - epsInf) * wt) / denom;
  const debyeTanD = debyeReal > 0 ? debyeImag / debyeReal : 0;

  const sci = (n: number, d = 3) => {
    if (n === 0) return "0";
    if (Math.abs(n) < 0.001 || Math.abs(n) >= 1e6) return n.toExponential(d);
    return n.toLocaleString("en-US", { maximumFractionDigits: d });
  };

  const rows: BreakdownRow[] = [
    { label: "Geometry", value: inputs.geometry === "parallel" ? "Parallel plate" : inputs.geometry === "coax" ? "Coaxial" : "Spherical" },
    { label: "Geometric factor G", value: `${sci(g, 4)} m` },
    { label: "Vacuum capacitance C₀", value: `${sci(c0F * 1e12, 3)} pF` },
    { label: "Measured capacitance C", value: `${sci(capacitanceF * 1e12, 3)} pF` },
    { label: "Absolute permittivity ε", value: `${epsilonAbs.toExponential(3)} F/m` },
    { label: "Electric susceptibility χₑ", value: sci(susceptibility, 3) },
    { label: "Loss tangent tan δ", value: sci(tanD, 4) },
    { label: "Imaginary permittivity ε″", value: sci(epsImag, 4) },
    { label: "Refractive index √εr", value: sci(refractiveIndex, 3) },
    { label: "Field strength E", value: `${sci(fieldKvMm, 3)} kV/mm` },
    { label: "Stored energy", value: `${sci(storedEnergyUj, 3)} µJ` },
    { label: "Relative permittivity εr", value: sci(epsilonR, 3), highlight: true },
  ];

  const comparators = ["air", "ptfe", "fr4", "alumina", "water"];
  const chartData = [
    { name: "Result", er: epsilonR, fill: "hsl(217 91% 60%)" },
    ...comparators.map((k) => {
      const m = MATERIALS.find((x) => x.key === k);
      return { name: m ? m.label.split(" ")[0] : k, er: m ? m.er : 0, fill: "hsl(215 16% 65%)" };
    }),
  ];

  return {
    valid: true,
    error: "",
    epsilonR,
    epsilonAbs,
    capacitancePf: capacitanceF * 1e12,
    vacuumCapacitancePf: c0F * 1e12,
    geometryFactor: g,
    susceptibility,
    lossTangent: tanD,
    epsImag,
    energyDensity,
    fieldKvMm,
    breakdownMarginPct,
    storedEnergyUj,
    refractiveIndex,
    debyeReal,
    debyeImag,
    debyeTanD,
    rows,
    chartData,
    materialNote: spec.note,
  };
};

const num = (n: number, d = 3) => {
  if (!isFinite(n)) return "—";
  if (n !== 0 && (Math.abs(n) < 0.001 || Math.abs(n) >= 1e6)) return n.toExponential(d);
  return n.toLocaleString("en-US", { maximumFractionDigits: d });
};

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "What is the dielectric constant?",
    answer:
      "The dielectric constant, more properly called relative permittivity and written εr, measures how much a material reduces the electric field inside it compared with a vacuum. It is the ratio of the capacitance of a capacitor filled with the material to the capacitance of the identical geometry in vacuum. Vacuum is exactly 1 by definition, air is 1.00059, PTFE is about 2.1, FR-4 board is around 4.4 and water at room temperature is roughly 80.",
  },
  {
    question: "How do I measure the dielectric constant of a material?",
    answer:
      "Build a capacitor of known geometry, measure its capacitance with the material in place, and divide by the capacitance you would get in vacuum. For a parallel-plate arrangement the vacuum value is ε₀ times area divided by separation, so εr equals C times separation divided by ε₀ times area. That is exactly what this calculator does. Accuracy depends far more on measuring the plate separation precisely than on the capacitance reading, since separation enters directly and any air gap between plate and sample skews the result low.",
  },
  {
    question: "Why does the dielectric constant change with frequency?",
    answer:
      "Permittivity comes from several polarization mechanisms that respond at different speeds. Dipole orientation is the slowest and stops contributing above its relaxation frequency; ionic polarization drops out in the infrared; only electronic polarization survives at optical frequencies. Water illustrates this dramatically: εr is about 80 at low frequency but falls to roughly 1.8 at optical frequencies, which is the square of its refractive index of 1.33. Professional Mode models this with a single-pole Debye relaxation.",
  },
  {
    question: "What is the loss tangent and why does it matter?",
    answer:
      "The loss tangent, tan δ, is the ratio of the imaginary part of permittivity to the real part, and it quantifies how much energy the dielectric converts to heat rather than storing. Low-loss materials such as PTFE and alumina sit near 0.0002 and are chosen for microwave circuits. FR-4 at about 0.02 is fine at a few hundred megahertz but becomes wasteful in the gigahertz range, which is why high-speed boards migrate to Rogers laminates. Loss rises with both frequency and temperature.",
  },
  {
    question: "Does a higher dielectric constant always mean a better capacitor?",
    answer:
      "No. High-permittivity ceramics such as barium titanate pack enormous capacitance into a small volume, but they are ferroelectric: their permittivity varies strongly with applied voltage, temperature and age. A Class II ceramic capacitor can lose more than half its rated capacitance at its rated DC voltage. Where stability matters — timing, filters, precision analog — low-εr materials such as polystyrene, mica or C0G ceramic are preferred despite needing more volume.",
  },
  {
    question: "What is dielectric strength and how is it different from the dielectric constant?",
    answer:
      "They are unrelated properties that are easy to confuse. The dielectric constant describes how much charge the material lets you store; dielectric strength, quoted in kilovolts per millimetre, describes the field at which it breaks down and conducts. Mica has a modest εr of 5.4 but an exceptional strength near 118 kV/mm. Barium titanate has an εr over a thousand yet fails at only about 4 kV/mm. This calculator reports your working field alongside the material limit so you can see the safety margin.",
  },
  {
    question: "Can I use this for coaxial cable or spherical geometry?",
    answer:
      "Yes. Advanced Options switch the geometry between parallel plate, coaxial and spherical, each with its own capacitance formula. Coaxial capacitance depends on the natural logarithm of the outer-to-inner radius ratio times the cable length, which is why cable capacitance is quoted per metre. Spherical capacitance depends on the product of the radii divided by their difference. In every case the calculator divides the measured capacitance by the vacuum capacitance of that same geometry.",
  },
  {
    question: "Why is my measured value higher than the published one?",
    answer:
      "Three causes dominate. Moisture absorption is the most common — nylon, paper and many epoxies take up water, whose εr near 80 pulls the composite value up sharply. Second, fringing fields at the plate edges add capacitance that the ideal formula does not account for, which inflates the apparent εr for small plates or large separations; keep the plate dimension at least ten times the gap. Third, published figures are quoted at a specific frequency and temperature, so a low-frequency bridge measurement on a polar material will legitimately read higher than a microwave figure.",
  },
];

export default function DielectricConstantCalculator() {
  const [inputs, setInputs] = useState<DielectricInputs>(DEFAULTS);
  const [result, setResult] = useState<DielectricResult>(calculateDielectric(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateDielectric(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof DielectricInputs>(key: K, val: DielectricInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculateDielectric(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateDielectric(DEFAULTS));
    setShowAdvanced(false);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Dielectric Constant Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dielectric Constant Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ───────── INPUT PANEL ───────── */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label className={lbl} htmlFor="dc-mode">Calculation Mode</label>
              <select
                id="dc-mode"
                value={inputs.mode}
                onChange={(e) => set("mode", e.target.value as Mode)}
                className={inp}
              >
                <option value="fromCapacitance">Derive εr from measured capacitance</option>
                <option value="fromMaterial">Predict capacitance from a known material</option>
              </select>
            </div>

            {inputs.mode === "fromCapacitance" ? (
              <div>
                <label className={lbl} htmlFor="dc-cap">Measured Capacitance (pF)</label>
                <input
                  id="dc-cap"
                  type="number"
                  min="0"
                  step="any"
                  value={inputs.capacitancePf}
                  onChange={(e) => set("capacitancePf", e.target.value)}
                  className={inp}
                />
              </div>
            ) : (
              <div>
                <label className={lbl} htmlFor="dc-material">Dielectric Material</label>
                <select
                  id="dc-material"
                  value={inputs.material}
                  onChange={(e) => {
                    const m = MATERIALS.find((x) => x.key === e.target.value);
                    setInputs((prev) => ({
                      ...prev,
                      material: e.target.value,
                      lossTangent: m && m.key !== "custom" ? String(m.lossTangent) : prev.lossTangent,
                    }));
                  }}
                  className={inp}
                >
                  {MATERIALS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}{m.key === "custom" ? "" : ` — εr ${m.er}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={lbl} htmlFor="dc-area">Plate Area (cm²)</label>
              <input
                id="dc-area"
                type="number"
                min="0"
                step="any"
                value={inputs.areaCm2}
                onChange={(e) => set("areaCm2", e.target.value)}
                className={inp}
                disabled={inputs.geometry !== "parallel"}
              />
            </div>

            <div>
              <label className={lbl} htmlFor="dc-sep">Plate Separation (mm)</label>
              <input
                id="dc-sep"
                type="number"
                min="0"
                step="any"
                value={inputs.separationMm}
                onChange={(e) => set("separationMm", e.target.value)}
                className={inp}
                disabled={inputs.geometry !== "parallel"}
              />
            </div>

            {/* ── TIER 2A: ADVANCED OPTIONS ── */}
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="flex items-center justify-between w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-1"
            >
              <span>Advanced Options</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className={groupLabel}>
                    <Layers className="h-3.5 w-3.5" /> Capacitor Geometry
                  </div>
                  <label className={lbl} htmlFor="dc-geom">Geometry</label>
                  <select
                    id="dc-geom"
                    value={inputs.geometry}
                    onChange={(e) => set("geometry", e.target.value as Geometry)}
                    className={inp}
                  >
                    <option value="parallel">Parallel plate</option>
                    <option value="coax">Coaxial cable</option>
                    <option value="spherical">Concentric spheres</option>
                  </select>
                </div>

                {inputs.geometry !== "parallel" && (
                  <>
                    <div>
                      <label className={lbl} htmlFor="dc-ri">Inner Radius (mm)</label>
                      <input
                        id="dc-ri"
                        type="number"
                        min="0"
                        step="any"
                        value={inputs.innerRadiusMm}
                        onChange={(e) => set("innerRadiusMm", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="dc-ro">Outer Radius (mm)</label>
                      <input
                        id="dc-ro"
                        type="number"
                        min="0"
                        step="any"
                        value={inputs.outerRadiusMm}
                        onChange={(e) => set("outerRadiusMm", e.target.value)}
                        className={inp}
                      />
                    </div>
                    {inputs.geometry === "coax" && (
                      <div>
                        <label className={lbl} htmlFor="dc-len">Cable Length (mm)</label>
                        <input
                          id="dc-len"
                          type="number"
                          min="0"
                          step="any"
                          value={inputs.lengthMm}
                          onChange={(e) => set("lengthMm", e.target.value)}
                          className={inp}
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <div className={groupLabel}>
                    <Zap className="h-3.5 w-3.5" /> Electrical Conditions
                  </div>
                  <label className={lbl} htmlFor="dc-tand">Loss Tangent (tan δ)</label>
                  <input
                    id="dc-tand"
                    type="number"
                    min="0"
                    step="any"
                    value={inputs.lossTangent}
                    onChange={(e) => set("lossTangent", e.target.value)}
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl} htmlFor="dc-volt">Applied Voltage (V)</label>
                  <input
                    id="dc-volt"
                    type="number"
                    min="0"
                    step="any"
                    value={inputs.voltageV}
                    onChange={(e) => set("voltageV", e.target.value)}
                    className={inp}
                  />
                </div>

                <div>
                  <div className={groupLabel}>
                    <Waves className="h-3.5 w-3.5" /> Professional Mode
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Frequency dispersion (Debye model)
                  </label>
                </div>

                {inputs.proMode && (
                  <>
                    <div>
                      <label className={lbl} htmlFor="dc-freq">Frequency (GHz)</label>
                      <input
                        id="dc-freq"
                        type="number"
                        min="0"
                        step="any"
                        value={inputs.frequencyGhz}
                        onChange={(e) => set("frequencyGhz", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="dc-einf">High-Frequency Limit ε∞</label>
                      <input
                        id="dc-einf"
                        type="number"
                        min="1"
                        step="any"
                        value={inputs.epsInfinity}
                        onChange={(e) => set("epsInfinity", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="dc-tau">Relaxation Time τ (ps)</label>
                      <input
                        id="dc-tau"
                        type="number"
                        min="0"
                        step="any"
                        value={inputs.relaxationPs}
                        onChange={(e) => set("relaxationPs", e.target.value)}
                        className={inp}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-colors active:scale-[0.99]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 shrink-0 grid place-items-center rounded-md border border-input bg-background hover:bg-secondary/40 text-muted-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ───────── RESULTS PANEL ───────── */}
          <div className="flex flex-col gap-4">
            {!result.valid ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                <div className="text-base font-medium text-foreground">
                  {result.error || "Check the geometry and capacitance values."}
                </div>
              </div>
            ) : (
              <>
                {/* 1 — PRIMARY CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Relative Permittivity (εr)
                  </div>
                  <div className="text-4xl font-bold text-primary tracking-tight mb-2">{num(result.epsilonR, 3)}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Absolute permittivity{" "}
                    <span className="font-bold text-foreground">{result.epsilonAbs.toExponential(3)} F/m</span> —{" "}
                    {num(result.epsilonR, 2)}× the capacitance of the same geometry in vacuum
                  </div>
                </div>

                {/* 2 — 3-STAT BAR */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Capacitance</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-500">{num(result.capacitancePf, 2)} pF</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Loss ε″</div>
                    <div className="text-base font-bold text-orange-600 dark:text-orange-500">{num(result.epsImag, 4)}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Breakdown Margin</div>
                    <div
                      className={`text-base font-bold ${
                        result.breakdownMarginPct > 50
                          ? "text-emerald-600 dark:text-emerald-500"
                          : result.breakdownMarginPct > 0
                          ? "text-orange-600 dark:text-orange-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {num(result.breakdownMarginPct, 1)}%
                    </div>
                  </div>
                </div>

                {/* 3 — BREAKDOWN TABLE */}
                <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/40 border-b border-border">
                        <tr>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3">Quantity</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.rows.slice(0, -1).map((row, i) => (
                          <tr key={i} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                            <td className="text-base py-2.5 px-3">{row.label}</td>
                            <td className="text-base py-2.5 px-3 text-right font-mono">{row.value}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border font-bold bg-secondary/20">
                          <td className="text-base py-2.5 px-3">{result.rows[result.rows.length - 1].label}</td>
                          <td className="text-base py-2.5 px-3 text-right font-mono text-primary">
                            {result.rows[result.rows.length - 1].value}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4 — CHART */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <div className="text-sm font-bold text-foreground mb-1">Permittivity Against Common Dielectrics</div>
                  <div className="text-xs text-muted-foreground mb-3">Logarithmic scale — values span three orders of magnitude</div>
                  {mounted ? (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RBar data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis
                            scale="log"
                            domain={[0.5, "auto"]}
                            allowDataOverflow
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <RTooltip
                            formatter={(v: number | string) => [num(Number(v), 3), "εr"]}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          <Bar dataKey="er" name="Relative permittivity" radius={[4, 4, 0, 0]}>
                            {result.chartData.map((d, i) => (
                              <Cell key={i} fill={d.fill} />
                            ))}
                          </Bar>
                        </RBar>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(217 91% 60%)" }} />
                      Your result
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(215 16% 65%)" }} />
                      Reference materials
                    </span>
                  </div>
                </div>

                {/* TIER 2B — PROFESSIONAL MODE RESULTS */}
                {inputs.proMode && (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <div className={groupLabel}>
                      <Waves className="h-3.5 w-3.5" /> Debye Dispersion at {inputs.frequencyGhz} GHz
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">ε′ (real)</div>
                        <div className="text-lg font-bold text-foreground">{num(result.debyeReal, 3)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">ε″ (loss)</div>
                        <div className="text-lg font-bold text-foreground">{num(result.debyeImag, 4)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">tan δ at frequency</div>
                        <div className="text-lg font-bold text-foreground">{num(result.debyeTanD, 4)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Energy density</div>
                        <div className="text-lg font-bold text-foreground">{num(result.energyDensity, 3)} J/m³</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Single-pole Debye relaxation: ε(ω) = ε∞ + (εr − ε∞) / (1 + jωτ). The static value falls toward ε∞
                      as the driving frequency outruns dipole reorientation.
                    </div>
                  </div>
                )}

                {/* 5 — SUMMARY STATISTICS (mirrors the breakdown table) */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className={groupLabel}>
                    <Zap className="h-3.5 w-3.5" /> Summary Statistics
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {result.rows.map((row, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={row.highlight ? "font-bold text-foreground" : "text-muted-foreground"}>
                          {row.label}
                        </span>
                        <span className={`font-mono ${row.highlight ? "font-bold text-primary" : "text-foreground"}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">{result.materialNote}.</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ───────── SEO ───────── */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Relative Permittivity Really Describes</h2>
            <p>
              Place an insulating material between two charged plates and something measurable happens: the voltage
              across the plates drops even though the charge has not changed. The material has polarized. Its
              molecules either contain permanent dipoles that rotate to oppose the applied field, or they develop
              induced dipoles as their electron clouds shift. Either way the internal field partially cancels the
              external one, and the same charge now sits at a lower potential — which is another way of saying the
              capacitance has gone up.
            </p>
            <p>
              Relative permittivity is simply the factor by which it went up. It is defined as the capacitance with
              the material present divided by the capacitance of the identical geometry in vacuum, which makes it
              dimensionless and always at least 1. Multiplying by the vacuum permittivity ε₀ of 8.854 × 10⁻¹² farads
              per metre gives the absolute permittivity of the material. This calculator works in both directions:
              give it a measured capacitance and it returns εr, or pick a material and it predicts the capacitance
              your geometry will produce.
            </p>

            <h2 className="text-2xl font-bold mb-3">Geometry, Fringing, and Measurement Accuracy</h2>
            <p>
              The parallel-plate formula assumes a uniform field confined between the plates, which is never exactly
              true. Field lines bulge outward at the edges, adding capacitance the formula does not predict and
              inflating the apparent permittivity. The error stays negligible when the plate dimension is at least
              ten times the separation, so wide plates and thin samples are the reliable configuration. Guard rings
              are the laboratory solution, intercepting the fringing field so the measured electrode sees only the
              uniform region.
            </p>
            <p>
              Separation is the dominant source of uncertainty because it appears directly in the result. A one
              percent error in gap measurement is a one percent error in εr, and any trapped air film between
              electrode and sample behaves as a low-permittivity layer in series, dragging the result downward.
              Coaxial geometry avoids the fringing problem entirely, which is why cable manufacturers quote
              capacitance per metre with confidence; its capacitance depends on the logarithm of the radius ratio,
              so modest dimensional errors matter far less than in the plate case.
            </p>

            <h2 className="text-2xl font-bold mb-3">Frequency Dependence and Dielectric Loss</h2>
            <p>
              Permittivity is not a single number but a spectrum. Each polarization mechanism has a characteristic
              response time, and once the field alternates faster than the mechanism can follow, that contribution
              disappears. Dipolar orientation in liquids relaxes in the microwave region, ionic displacement in the
              infrared, and only electronic polarization persists into the visible. Water is the textbook case:
              about 80 at kilohertz, falling through the microwave band, and down to roughly 1.8 at optical
              frequencies, which is precisely the square of its refractive index.
            </p>
            <p>
              Wherever the real part drops, the imaginary part peaks. That imaginary component, ε″, is energy
              absorbed as heat rather than stored, and its ratio to the real part is the loss tangent. Microwave
              ovens exploit exactly this, driving water near its relaxation frequency so the dipoles lag the field
              and dissipate power. Circuit designers avoid it: an FR-4 board with tan δ near 0.02 is acceptable at
              a few hundred megahertz but wasteful at 10 GHz, where low-loss laminates or PTFE composites become
              necessary. Professional Mode applies a single-pole Debye model so you can see the real and imaginary
              parts at any frequency you specify.
            </p>

            <h2 className="text-2xl font-bold mb-3">Choosing a Dielectric in Practice</h2>
            <p>
              Selecting an insulator is a balance between capacitance density, stability, loss and breakdown
              strength, and no material wins on all four. Barium titanate offers permittivity above a thousand,
              enabling remarkably compact capacitors, but it is ferroelectric: its value swings with temperature,
              drifts with age, and collapses under DC bias, with some Class II parts losing over half their rated
              capacitance at rated voltage. Polystyrene and mica sit near 2.6 and 5.4 but hold their value across
              temperature and voltage, which is why they persist in filters and timing circuits.
            </p>
            <p>
              Breakdown strength is a separate axis entirely, and a high dielectric constant offers no protection
              against it. Mica tolerates roughly 118 kV/mm while barium titanate fails near 4 kV/mm despite its far
              higher permittivity. This calculator reports the working field alongside the material limit so the
              safety margin is explicit. Add environmental factors — nylon and paper absorb moisture whose εr near
              80 shifts the composite value substantially — and it becomes clear why measuring your actual stack-up
              beats trusting a handbook figure.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/dielectric-constant-calculator" />
          <PopularCalculators exclude="/calculator/dielectric-constant-calculator" />
        </div>
      </div>
    </>
  );
}
